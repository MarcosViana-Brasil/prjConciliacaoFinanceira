import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../shared/http/api-response.js';
import { getRequestContext } from '../../shared/http/request-context.js';
import { validateRequest } from '../../shared/validation/validate-request.js';
import {
  approveManualReconciliationSchema,
  listDivergencesQuerySchema,
  listReconciliationsQuerySchema,
  reconciliationIdParamsSchema,
  rejectReconciliationSchema,
  reverseReconciliationSchema,
  runReconciliationSchema,
  type ApproveManualReconciliationBody,
  type ListDivergencesQuery,
  type ListReconciliationsQuery,
  type ReconciliationIdParams,
  type RejectReconciliationBody,
  type ReverseReconciliationBody,
  type RunReconciliationBody
} from './reconciliation.schemas.js';
import { reconciliationService } from './reconciliation.service.js';

export class ReconciliationController {
  async run(request: FastifyRequest, reply: FastifyReply) {
    const { body } = validateRequest<unknown, unknown, RunReconciliationBody>(request, { body: runReconciliationSchema });
    const result = await reconciliationService.run(body, getRequestContext(request));

    return reply.status(201).send(success(result, 'Conciliacao executada com sucesso'));
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const { query } = validateRequest<unknown, ListReconciliationsQuery>(request, { query: listReconciliationsQuerySchema });
    const result = await reconciliationService.list(query);

    return reply.send(success(result.data, 'Conciliacoes listadas com sucesso', result.pagination));
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { params } = validateRequest<ReconciliationIdParams>(request, { params: reconciliationIdParamsSchema });
    const data = await reconciliationService.getById(params.id);

    return reply.send(success(data, 'Conciliacao encontrada com sucesso'));
  }

  async listDivergences(request: FastifyRequest, reply: FastifyReply) {
    const { query } = validateRequest<unknown, ListDivergencesQuery>(request, { query: listDivergencesQuerySchema });
    const result = await reconciliationService.listDivergences(query);

    return reply.send(success(result.data, 'Divergencias listadas com sucesso', result.pagination));
  }

  async approveManual(request: FastifyRequest, reply: FastifyReply) {
    const { params, body } = validateRequest<ReconciliationIdParams, unknown, ApproveManualReconciliationBody>(request, {
      params: reconciliationIdParamsSchema,
      body: approveManualReconciliationSchema
    });
    const result = await reconciliationService.approveManual(params.id, body.justification, getRequestContext(request));

    return reply.send(success(result, 'Conciliacao aprovada manualmente com sucesso'));
  }

  async reject(request: FastifyRequest, reply: FastifyReply) {
    const { params, body } = validateRequest<ReconciliationIdParams, unknown, RejectReconciliationBody>(request, {
      params: reconciliationIdParamsSchema,
      body: rejectReconciliationSchema
    });
    const result = await reconciliationService.reject(params.id, body.justification, getRequestContext(request));

    return reply.send(success(result, 'Sugestao de conciliacao rejeitada com sucesso'));
  }

  async reverse(request: FastifyRequest, reply: FastifyReply) {
    const { params, body } = validateRequest<ReconciliationIdParams, unknown, ReverseReconciliationBody>(request, {
      params: reconciliationIdParamsSchema,
      body: reverseReconciliationSchema
    });
    const result = await reconciliationService.reverse(params.id, body.reversalReason, getRequestContext(request));

    return reply.send(success(result, 'Conciliacao revertida com sucesso'));
  }
}
