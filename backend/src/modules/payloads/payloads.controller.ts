import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../shared/http/api-response.js';
import { getRequestContext } from '../../shared/http/request-context.js';
import { validateRequest } from '../../shared/validation/validate-request.js';
import {
  createPayloadBodySchema,
  payloadIdParamsSchema,
  payloadsListQuerySchema,
  updatePayloadStatusBodySchema,
  type CreatePayloadBody,
  type PayloadIdParams,
  type PayloadsListQuery,
  type UpdatePayloadStatusBody
} from './payloads.schemas.js';
import { payloadsService } from './payloads.service.js';

export class PayloadsController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const { query } = validateRequest<unknown, PayloadsListQuery>(request, { query: payloadsListQuerySchema });
    const result = await payloadsService.list(query);

    return reply.send(success(result.data, 'Payloads listados com sucesso', result.pagination));
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { params } = validateRequest<PayloadIdParams>(request, { params: payloadIdParamsSchema });
    const payload = await payloadsService.getById(params.id);

    return reply.send(success(payload, 'Payload encontrado com sucesso'));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const { body } = validateRequest<unknown, unknown, CreatePayloadBody>(request, { body: createPayloadBodySchema });
    const payload = await payloadsService.create(body, getRequestContext(request));

    return reply.status(201).send(success(payload, 'Payload registrado com sucesso'));
  }

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    const { params, body } = validateRequest<PayloadIdParams, unknown, UpdatePayloadStatusBody>(request, {
      params: payloadIdParamsSchema,
      body: updatePayloadStatusBodySchema
    });
    const payload = await payloadsService.updateStatus(params.id, body, getRequestContext(request));

    return reply.send(success(payload, 'Status do payload atualizado com sucesso'));
  }
}
