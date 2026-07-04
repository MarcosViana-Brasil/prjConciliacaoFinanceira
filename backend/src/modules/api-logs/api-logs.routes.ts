import type { FastifyInstance } from 'fastify';
import { requireRoles } from '../auth/auth.middleware.js';
import { ApiLogsController } from './api-logs.controller.js';

export async function apiLogsRoutes(app: FastifyInstance) {
  const controller = new ApiLogsController();

  app.get('/api-logs', { preHandler: requireRoles(['AUDITOR']) }, controller.list.bind(controller));
}
