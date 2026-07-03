import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../shared/http/api-response.js';
import { validateRequest } from '../../shared/validation/validate-request.js';
import { apiLogsListQuerySchema, type ApiLogsListQuery } from './api-logs.schemas.js';
import { apiLogsService } from './api-logs.service.js';

export class ApiLogsController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const { query } = validateRequest<unknown, ApiLogsListQuery>(request, { query: apiLogsListQuerySchema });
    const result = await apiLogsService.list(query);

    return reply.send(success(result.data, 'Logs tecnicos listados com sucesso', result.pagination));
  }
}
