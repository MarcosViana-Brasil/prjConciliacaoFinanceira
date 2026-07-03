import type { FastifyInstance } from 'fastify';
import { ReconciliationController } from './reconciliation.controller.js';

export async function reconciliationRoutes(app: FastifyInstance) {
  const controller = new ReconciliationController();

  app.post('/reconciliation/run', controller.run.bind(controller));
  app.get('/reconciliation', controller.list.bind(controller));
  app.get('/reconciliation/divergences', controller.listDivergences.bind(controller));
  app.get('/reconciliation/:id', controller.getById.bind(controller));
  app.post('/reconciliation/:id/approve-manual', controller.approveManual.bind(controller));
  app.post('/reconciliation/:id/reject', controller.reject.bind(controller));
  app.post('/reconciliation/:id/reverse', controller.reverse.bind(controller));
}
