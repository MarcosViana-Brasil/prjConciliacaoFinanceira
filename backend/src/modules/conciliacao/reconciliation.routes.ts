import type { FastifyInstance } from 'fastify';
import { requireRoles } from '../auth/auth.middleware.js';
import { ReconciliationController } from './reconciliation.controller.js';

export async function reconciliationRoutes(app: FastifyInstance) {
  const controller = new ReconciliationController();
  const canOperate = requireRoles(['FINANCEIRO']);

  app.post('/reconciliation/run', { preHandler: canOperate }, controller.run.bind(controller));
  app.get('/reconciliation', controller.list.bind(controller));
  app.get('/reconciliation/divergences', controller.listDivergences.bind(controller));
  app.get('/reconciliation/:id', controller.getById.bind(controller));
  app.post('/reconciliation/:id/approve-manual', { preHandler: canOperate }, controller.approveManual.bind(controller));
  app.post('/reconciliation/:id/reject', { preHandler: canOperate }, controller.reject.bind(controller));
  app.post('/reconciliation/:id/reverse', { preHandler: canOperate }, controller.reverse.bind(controller));
}
