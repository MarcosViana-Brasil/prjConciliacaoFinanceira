import type { FastifyInstance } from 'fastify';
import { requireRoles } from '../auth/auth.middleware.js';
import { AuditController } from './audit.controller.js';

export async function auditRoutes(app: FastifyInstance) {
  const controller = new AuditController();

  app.get('/audit-events', { preHandler: requireRoles(['AUDITOR']) }, controller.list.bind(controller));
  app.get('/audit-events/:entity/:entityId', { preHandler: requireRoles(['AUDITOR']) }, controller.listByEntity.bind(controller));
}
