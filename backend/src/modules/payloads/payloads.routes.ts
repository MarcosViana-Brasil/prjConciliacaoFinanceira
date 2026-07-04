import type { FastifyInstance } from 'fastify';
import { requireRoles } from '../auth/auth.middleware.js';
import { PayloadsController } from './payloads.controller.js';

export async function payloadsRoutes(app: FastifyInstance) {
  const controller = new PayloadsController();
  const canOperate = requireRoles(['FINANCEIRO']);

  app.get('/payloads', controller.list.bind(controller));
  app.get('/payloads/:id', controller.getById.bind(controller));
  app.post('/payloads', { preHandler: canOperate }, controller.create.bind(controller));
  app.patch('/payloads/:id/status', { preHandler: canOperate }, controller.updateStatus.bind(controller));
}
