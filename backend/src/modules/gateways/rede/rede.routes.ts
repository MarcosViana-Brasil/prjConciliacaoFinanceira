import type { FastifyInstance } from 'fastify';
import { RedeController } from './rede.controller.js';

export async function redeRoutes(app: FastifyInstance) {
  const controller = new RedeController();

  app.post('/gateways/rede/import-transactions', controller.importTransactions.bind(controller));
  app.post('/gateways/rede/import-receivables', controller.importReceivables.bind(controller));
  app.get('/gateways/rede/transactions', controller.listTransactions.bind(controller));
  app.get('/gateways/rede/transactions/:id', controller.getTransactionById.bind(controller));
  app.get('/gateways/rede/receivables', controller.listReceivables.bind(controller));
  app.get('/gateways/rede/receivables/:id', controller.getReceivableById.bind(controller));
}
