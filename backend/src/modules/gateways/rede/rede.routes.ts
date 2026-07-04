import type { FastifyInstance } from 'fastify';
import { requireRoles } from '../../auth/auth.middleware.js';
import { RedeController } from './rede.controller.js';

export async function redeRoutes(app: FastifyInstance) {
  const controller = new RedeController();
  const canOperate = requireRoles(['FINANCEIRO']);

  app.post('/gateways/rede/import-transactions', { preHandler: canOperate }, controller.importTransactions.bind(controller));
  app.post('/gateways/rede/import-receivables', { preHandler: canOperate }, controller.importReceivables.bind(controller));
  app.get('/gateways/rede/transactions', controller.listTransactions.bind(controller));
  app.get('/gateways/rede/transactions/:id', controller.getTransactionById.bind(controller));
  app.get('/gateways/rede/receivables', controller.listReceivables.bind(controller));
  app.get('/gateways/rede/receivables/:id', controller.getReceivableById.bind(controller));
}
