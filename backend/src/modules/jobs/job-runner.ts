import { AuditAction, JobStatus } from '@prisma/client';
import { auditService } from '../auditoria/audit.service.js';
import { AppError } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/logger/logger.js';
import { jobsService } from './jobs.service.js';
import type { JobExecutionResult, JobHandlerResult, RunJobParams } from './jobs.types.js';

export async function runJob<TParams>({
  jobName,
  payload,
  handler,
  triggeredBy,
  origin = 'system'
}: RunJobParams<TParams>): Promise<JobExecutionResult> {
  const hasRunningJob = await jobsService.hasRunningJob(jobName);

  if (hasRunningJob) {
    throw new AppError('Ja existe uma execucao em andamento para este job.', 409, 'JOB_ALREADY_RUNNING');
  }

  const context = { userName: triggeredBy, origin };
  const job = await jobsService.startJob({ jobName, metadata: { payload, triggeredBy, origin } }, context);
  const startTime = Date.now();

  logger.info({ jobName, jobId: job.id, triggeredBy, origin, payload }, 'Starting job');

  try {
    const result = await handler(payload);
    const status = resolveStatus(result);
    const finished = await jobsService.finishJob(
      job.id,
      {
        status,
        processedCount: result.processedCount,
        successCount: result.successCount,
        errorCount: result.errorCount,
        errorMessage: result.errors?.map((error) => error.message).join('; '),
        metadata: {
          ...result.metadata,
          skippedCount: result.skippedCount,
          errors: result.errors,
          payload,
          triggeredBy,
          origin
        }
      },
      context
    );

    await auditService.recordEvent({
      entity: 'job_executions',
      entityId: job.id,
      action: auditActionForJob(jobName, status),
      origin,
      after: result,
      metadata: { jobName, status, triggeredBy }
    });

    logger.info(
      {
        jobName,
        jobId: job.id,
        status,
        durationMs: Date.now() - startTime,
        processedCount: result.processedCount,
        successCount: result.successCount,
        errorCount: result.errorCount
      },
      'Finished job'
    );

    return { job: finished, result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao executar job';
    const failed = await jobsService.finishJob(
      job.id,
      {
        status: JobStatus.FAILED,
        errorMessage,
        errorCount: 1,
        metadata: { payload, triggeredBy, origin }
      },
      context
    );

    await auditService.recordEvent({
      entity: 'job_executions',
      entityId: job.id,
      action: AuditAction.ERROR,
      origin,
      metadata: { jobName, triggeredBy, errorMessage }
    });

    logger.error({ jobName, jobId: job.id, durationMs: Date.now() - startTime, errorMessage }, 'Job failed');
    return { job: failed };
  }
}

function resolveStatus(result: JobHandlerResult) {
  if (result.errorCount > 0 && result.successCount > 0) return JobStatus.PARTIAL_SUCCESS;
  if (result.errorCount > 0) return JobStatus.FAILED;
  return JobStatus.SUCCESS;
}

function auditActionForJob(jobName: string, status: JobStatus) {
  if (status === JobStatus.FAILED) return AuditAction.ERROR;
  if (jobName.includes('IMPORT')) return AuditAction.IMPORT;
  if (jobName.includes('RECONCILIATION')) return AuditAction.RECONCILE_AUTO;
  return AuditAction.PROCESS;
}
