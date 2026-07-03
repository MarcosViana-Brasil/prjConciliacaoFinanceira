import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../shared/http/api-response.js';
import { validateRequest } from '../../shared/validation/validate-request.js';
import { auditEntityParamsSchema, auditListQuerySchema, type AuditEntityParams, type AuditListQuery } from './audit.schemas.js';
import { auditService } from './audit.service.js';

export class AuditController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const { query } = validateRequest<unknown, AuditListQuery>(request, { query: auditListQuerySchema });
    const result = await auditService.listEvents(query);

    return reply.send(success(result.data, 'Eventos de auditoria listados com sucesso', result.pagination));
  }

  async listByEntity(request: FastifyRequest, reply: FastifyReply) {
    const { params } = validateRequest<AuditEntityParams>(request, { params: auditEntityParamsSchema });
    const data = await auditService.listByEntity(params.entity, params.entityId);

    return reply.send(success(data, 'Auditoria da entidade listada com sucesso'));
  }
}
