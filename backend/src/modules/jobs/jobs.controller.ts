import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../shared/http/api-response.js';
import { getRequestContext } from '../../shared/http/request-context.js';
import { validateRequest } from '../../shared/validation/validate-request.js';
import { runJob } from './job-runner.js';
import { jobRegistry } from './job-registry.js';
import {
  jobIdParamsSchema,
  jobsListQuerySchema,
  reprocessPayloadBodySchema,
  reprocessPayloadParamsSchema,
  runImportRedeReceivablesJobSchema,
  runImportRedeTransactionsJobSchema,
  runReconciliationJobSchema,
  type JobIdParams,
  type JobsListQuery,
  type ReprocessPayloadBody,
  type ReprocessPayloadParams,
  type RunImportRedeReceivablesJobBody,
  type RunImportRedeTransactionsJobBody,
  type RunReconciliationJobBody
} from './jobs.schemas.js';
import { jobsService } from './jobs.service.js';
import { JOB_NAMES } from './jobs.types.js';

export class JobsController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const { query } = validateRequest<unknown, JobsListQuery>(request, { query: jobsListQuerySchema });
    const result = await jobsService.list(query);

    return reply.send(success(result.data, 'Execucoes de jobs listadas com sucesso', result.pagination));
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { params } = validateRequest<JobIdParams>(request, { params: jobIdParamsSchema });
    const result = await jobsService.getById(params.id);

    return reply.send(success(result, 'Execucao de job encontrada com sucesso'));
  }

  async runImportRedeTransactions(request: FastifyRequest, reply: FastifyReply) {
    const { body } = validateRequest<unknown, unknown, RunImportRedeTransactionsJobBody>(request, { body: runImportRedeTransactionsJobSchema });
    const result = await runJob({
      jobName: JOB_NAMES.importRedeTransactions,
      payload: body,
      handler: jobRegistry[JOB_NAMES.importRedeTransactions],
      triggeredBy: getRequestContext(request).userName,
      origin: 'api'
    });

    return reply.status(202).send(success(result, 'Job de importacao de transacoes Rede executado'));
  }

  async runImportRedeReceivables(request: FastifyRequest, reply: FastifyReply) {
    const { body } = validateRequest<unknown, unknown, RunImportRedeReceivablesJobBody>(request, { body: runImportRedeReceivablesJobSchema });
    const result = await runJob({
      jobName: JOB_NAMES.importRedeReceivables,
      payload: body,
      handler: jobRegistry[JOB_NAMES.importRedeReceivables],
      triggeredBy: getRequestContext(request).userName,
      origin: 'api'
    });

    return reply.status(202).send(success(result, 'Job de importacao de recebiveis Rede executado'));
  }

  async runReconciliation(request: FastifyRequest, reply: FastifyReply) {
    const { body } = validateRequest<unknown, unknown, RunReconciliationJobBody>(request, { body: runReconciliationJobSchema });
    const result = await runJob({
      jobName: JOB_NAMES.runReconciliation,
      payload: body,
      handler: jobRegistry[JOB_NAMES.runReconciliation],
      triggeredBy: getRequestContext(request).userName,
      origin: 'api'
    });

    return reply.status(202).send(success(result, 'Job de conciliacao executado'));
  }

  async reprocessPayload(request: FastifyRequest, reply: FastifyReply) {
    const { params, body } = validateRequest<ReprocessPayloadParams, unknown, ReprocessPayloadBody>(request, {
      params: reprocessPayloadParamsSchema,
      body: reprocessPayloadBodySchema
    });
    const result = await runJob({
      jobName: JOB_NAMES.reprocessPayload,
      payload: { rawPayloadId: params.rawPayloadId, justification: body.justification },
      handler: jobRegistry[JOB_NAMES.reprocessPayload],
      triggeredBy: getRequestContext(request).userName,
      origin: 'api'
    });

    return reply.status(202).send(success(result, 'Payload enviado para reprocessamento'));
  }
}
