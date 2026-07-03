import type { FastifyInstance } from 'fastify';
import { FinancialTitlesController } from './financial-titles.controller.js';

export async function financialTitlesRoutes(app: FastifyInstance) {
  const controller = new FinancialTitlesController();

  app.get('/financial-titles', controller.list.bind(controller));
  app.get('/financial-titles/:id', controller.getById.bind(controller));
  app.post('/financial-titles', controller.create.bind(controller));
  app.post('/financial-titles/import', controller.importBatch.bind(controller));
  app.put('/financial-titles/:id', controller.update.bind(controller));
  app.patch('/financial-titles/:id/cancel', controller.cancel.bind(controller));
  app.patch('/financial-titles/:id/mark-paid', controller.markPaid.bind(controller));
  app.patch('/financial-titles/:id/restore', controller.restore.bind(controller));
  app.delete('/financial-titles/:id', controller.softDelete.bind(controller));
}
