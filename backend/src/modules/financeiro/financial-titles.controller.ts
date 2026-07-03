import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../shared/http/api-response.js';
import { getRequestContext } from '../../shared/http/request-context.js';
import { validateRequest } from '../../shared/validation/validate-request.js';
import {
  cancelFinancialTitleSchema,
  createFinancialTitleSchema,
  financialTitleParamsSchema,
  importFinancialTitlesSchema,
  listFinancialTitlesQuerySchema,
  markFinancialTitlePaidSchema,
  restoreFinancialTitleSchema,
  softDeleteFinancialTitleSchema,
  updateFinancialTitleSchema,
  type CancelFinancialTitleBody,
  type CreateFinancialTitleBody,
  type FinancialTitleParams,
  type ImportFinancialTitlesBody,
  type ListFinancialTitlesQuery,
  type MarkFinancialTitlePaidBody,
  type RestoreFinancialTitleBody,
  type SoftDeleteFinancialTitleBody,
  type UpdateFinancialTitleBody
} from './financial-titles.schemas.js';
import { financialTitlesService } from './financial-titles.service.js';

export class FinancialTitlesController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const { query } = validateRequest<unknown, ListFinancialTitlesQuery>(request, { query: listFinancialTitlesQuerySchema });
    const result = await financialTitlesService.list(query);

    return reply.send(success(result.data, 'Titulos financeiros listados com sucesso', result.pagination));
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { params } = validateRequest<FinancialTitleParams>(request, { params: financialTitleParamsSchema });
    const title = await financialTitlesService.getById(params.id);

    return reply.send(success(title, 'Titulo financeiro encontrado com sucesso'));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const { body } = validateRequest<unknown, unknown, CreateFinancialTitleBody>(request, { body: createFinancialTitleSchema });
    const title = await financialTitlesService.create(body, getRequestContext(request));

    return reply.status(201).send(success(title, 'Titulo financeiro criado com sucesso'));
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { params, body } = validateRequest<FinancialTitleParams, unknown, UpdateFinancialTitleBody>(request, {
      params: financialTitleParamsSchema,
      body: updateFinancialTitleSchema
    });
    const title = await financialTitlesService.update(params.id, body, getRequestContext(request));

    return reply.send(success(title, 'Titulo financeiro atualizado com sucesso'));
  }

  async cancel(request: FastifyRequest, reply: FastifyReply) {
    const { params, body } = validateRequest<FinancialTitleParams, unknown, CancelFinancialTitleBody>(request, {
      params: financialTitleParamsSchema,
      body: cancelFinancialTitleSchema
    });
    const title = await financialTitlesService.cancel(params.id, body, getRequestContext(request));

    return reply.send(success(title, 'Titulo financeiro cancelado com sucesso'));
  }

  async markPaid(request: FastifyRequest, reply: FastifyReply) {
    const { params, body } = validateRequest<FinancialTitleParams, unknown, MarkFinancialTitlePaidBody>(request, {
      params: financialTitleParamsSchema,
      body: markFinancialTitlePaidSchema
    });
    const title = await financialTitlesService.markPaid(params.id, body, getRequestContext(request));

    return reply.send(success(title, 'Titulo financeiro baixado manualmente com sucesso'));
  }

  async softDelete(request: FastifyRequest, reply: FastifyReply) {
    const { params, body } = validateRequest<FinancialTitleParams, unknown, SoftDeleteFinancialTitleBody>(request, {
      params: financialTitleParamsSchema,
      body: softDeleteFinancialTitleSchema
    });
    const title = await financialTitlesService.softDelete(params.id, body, getRequestContext(request));

    return reply.send(success(title, 'Titulo financeiro excluido logicamente com sucesso'));
  }

  async restore(request: FastifyRequest, reply: FastifyReply) {
    const { params, body } = validateRequest<FinancialTitleParams, unknown, RestoreFinancialTitleBody>(request, {
      params: financialTitleParamsSchema,
      body: restoreFinancialTitleSchema
    });
    const title = await financialTitlesService.restore(params.id, body, getRequestContext(request));

    return reply.send(success(title, 'Titulo financeiro restaurado com sucesso'));
  }

  async importBatch(request: FastifyRequest, reply: FastifyReply) {
    const { body } = validateRequest<unknown, unknown, ImportFinancialTitlesBody>(request, { body: importFinancialTitlesSchema });
    const result = await financialTitlesService.importBatch(body, getRequestContext(request));

    return reply.status(201).send(success(result, 'Importacao de titulos financeiros concluida com sucesso'));
  }
}
