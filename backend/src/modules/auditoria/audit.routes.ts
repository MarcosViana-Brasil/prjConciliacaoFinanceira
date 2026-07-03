import type { FastifyInstance } from 'fastify';
import { AuditController } from './audit.controller.js';

export async function auditRoutes(app: FastifyInstance) {
  const controller = new AuditController();

  app.get('/audit-events', controller.list.bind(controller));
  app.get('/audit-events/:entity/:entityId', controller.listByEntity.bind(controller));
}
