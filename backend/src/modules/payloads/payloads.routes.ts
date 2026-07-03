import type { FastifyInstance } from 'fastify';
import { PayloadsController } from './payloads.controller.js';

export async function payloadsRoutes(app: FastifyInstance) {
  const controller = new PayloadsController();

  app.get('/payloads', controller.list.bind(controller));
  app.get('/payloads/:id', controller.getById.bind(controller));
  app.post('/payloads', controller.create.bind(controller));
  app.patch('/payloads/:id/status', controller.updateStatus.bind(controller));
}
