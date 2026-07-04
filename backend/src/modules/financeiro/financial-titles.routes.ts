import type { FastifyInstance } from 'fastify';
import { requireRoles } from '../auth/auth.middleware.js';
import { FinancialTitlesController } from './financial-titles.controller.js';

export async function financialTitlesRoutes(app: FastifyInstance) {
  const controller = new FinancialTitlesController();
  const canOperate = requireRoles(['FINANCEIRO']);

  app.get('/financial-titles', controller.list.bind(controller));
  app.get('/financial-titles/:id', controller.getById.bind(controller));
  app.post('/financial-titles', { preHandler: canOperate }, controller.create.bind(controller));
  app.post('/financial-titles/import', { preHandler: canOperate }, controller.importBatch.bind(controller));
  app.put('/financial-titles/:id', { preHandler: canOperate }, controller.update.bind(controller));
  app.patch('/financial-titles/:id/cancel', { preHandler: canOperate }, controller.cancel.bind(controller));
  app.patch('/financial-titles/:id/mark-paid', { preHandler: canOperate }, controller.markPaid.bind(controller));
  app.patch('/financial-titles/:id/restore', { preHandler: canOperate }, controller.restore.bind(controller));
  app.delete('/financial-titles/:id', { preHandler: canOperate }, controller.softDelete.bind(controller));
}
