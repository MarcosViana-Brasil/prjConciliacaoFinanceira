import type { FastifyInstance } from 'fastify';
import { JobsController } from './jobs.controller.js';

export async function jobsRoutes(app: FastifyInstance) {
  const controller = new JobsController();

  app.get('/jobs', controller.list.bind(controller));
  app.get('/jobs/:id', controller.getById.bind(controller));
  app.post('/jobs/import-rede-transactions/run', controller.runImportRedeTransactions.bind(controller));
  app.post('/jobs/import-rede-receivables/run', controller.runImportRedeReceivables.bind(controller));
  app.post('/jobs/reconciliation/run', controller.runReconciliation.bind(controller));
  app.post('/jobs/reprocess-payload/:rawPayloadId', controller.reprocessPayload.bind(controller));
}
