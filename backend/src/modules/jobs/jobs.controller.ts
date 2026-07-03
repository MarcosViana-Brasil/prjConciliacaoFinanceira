import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../shared/http/api-response.js';
import { validateRequest } from '../../shared/validation/validate-request.js';
import { jobsListQuerySchema, type JobsListQuery } from './jobs.schemas.js';
import { jobsService } from './jobs.service.js';

export class JobsController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const { query } = validateRequest<unknown, JobsListQuery>(request, { query: jobsListQuerySchema });
    const result = await jobsService.list(query);

    return reply.send(success(result.data, 'Execucoes de jobs listadas com sucesso', result.pagination));
  }
}
