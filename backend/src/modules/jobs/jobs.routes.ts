import type { FastifyInstance } from 'fastify';
import { requireRoles } from '../auth/auth.middleware.js';
import { JobsController } from './jobs.controller.js';

export async function jobsRoutes(app: FastifyInstance) {
  const controller = new JobsController();
  const canOperate = requireRoles(['FINANCEIRO']);

  app.get('/jobs', controller.list.bind(controller));
  app.get('/jobs/:id', controller.getById.bind(controller));
  app.post('/jobs/import-rede-transactions/run', { preHandler: canOperate }, controller.runImportRedeTransactions.bind(controller));
  app.post('/jobs/import-rede-receivables/run', { preHandler: canOperate }, controller.runImportRedeReceivables.bind(controller));
  app.post('/jobs/reconciliation/run', { preHandler: canOperate }, controller.runReconciliation.bind(controller));
  app.post('/jobs/reprocess-payload/:rawPayloadId', { preHandler: canOperate }, controller.reprocessPayload.bind(controller));
}
