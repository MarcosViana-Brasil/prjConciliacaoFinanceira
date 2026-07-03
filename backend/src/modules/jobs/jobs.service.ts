import { AuditAction, JobStatus } from '@prisma/client';
import { auditService } from '../auditoria/audit.service.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { RequestContext } from '../../shared/http/request-context.js';
import { toInputJson } from '../../shared/utils/json.js';
import { JobsRepository } from './jobs.repository.js';
import type { FinishJobInput, JobFilters, StartJobInput } from './jobs.types.js';

export class JobsService {
  constructor(private readonly jobsRepository = new JobsRepository()) {}

  async list(filters: JobFilters) {
    return this.jobsRepository.list(filters);
  }

  async startJob(input: StartJobInput, context?: RequestContext) {
    const job = await this.jobsRepository.create({
      jobName: input.jobName,
      status: JobStatus.RUNNING,
      startedAt: new Date(),
      metadata: toInputJson(input.metadata ?? {})
    });

    await auditService.recordEvent({
      entity: 'job_executions',
      entityId: job.id,
      action: AuditAction.PROCESS,
      userId: context?.userId,
      origin: context?.origin ?? 'system',
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      after: job,
      metadata: { operation: 'start_job', jobName: input.jobName }
    });

    return job;
  }

  async finishJob(id: string, input: FinishJobInput, context?: RequestContext) {
    const before = await this.jobsRepository.findById(id);

    if (!before) {
      throw new AppError('Execucao de job nao encontrada', 404, 'JOB_NOT_FOUND');
    }

    const finishedAt = new Date();
    const durationMs = before.startedAt ? finishedAt.getTime() - before.startedAt.getTime() : undefined;
    const after = await this.jobsRepository.finish(id, {
      ...input,
      finishedAt,
      durationMs,
      metadata: toInputJson(input.metadata ?? before.metadata)
    });

    await auditService.recordEvent({
      entity: 'job_executions',
      entityId: id,
      action: input.status === JobStatus.FAILED ? AuditAction.ERROR : AuditAction.PROCESS,
      userId: context?.userId,
      origin: context?.origin ?? 'system',
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      before,
      after,
      metadata: { operation: 'finish_job', jobName: before.jobName }
    });

    return after;
  }
}

export const jobsService = new JobsService();
