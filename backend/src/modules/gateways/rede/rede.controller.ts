import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../../shared/http/api-response.js';
import { getRequestContext } from '../../../shared/http/request-context.js';
import { validateRequest } from '../../../shared/validation/validate-request.js';
import {
  importRedeReceivablesSchema,
  importRedeTransactionsSchema,
  listRedeReceivablesQuerySchema,
  listRedeTransactionsQuerySchema,
  redeIdParamsSchema,
  type ImportRedeReceivablesBody,
  type ImportRedeTransactionsBody,
  type ListRedeReceivablesQuery,
  type ListRedeTransactionsQuery,
  type RedeIdParams
} from './rede.schemas.js';
import { redeService } from './rede.service.js';

export class RedeController {
  async importTransactions(request: FastifyRequest, reply: FastifyReply) {
    const { body } = validateRequest<unknown, unknown, ImportRedeTransactionsBody>(request, { body: importRedeTransactionsSchema });
    const result = await redeService.importTransactions(body, getRequestContext(request));

    return reply.status(201).send(success(result, 'Importacao de transacoes Rede concluida com sucesso'));
  }

  async importReceivables(request: FastifyRequest, reply: FastifyReply) {
    const { body } = validateRequest<unknown, unknown, ImportRedeReceivablesBody>(request, { body: importRedeReceivablesSchema });
    const result = await redeService.importReceivables(body, getRequestContext(request));

    return reply.status(201).send(success(result, 'Importacao de recebiveis Rede concluida com sucesso'));
  }

  async listTransactions(request: FastifyRequest, reply: FastifyReply) {
    const { query } = validateRequest<unknown, ListRedeTransactionsQuery>(request, { query: listRedeTransactionsQuerySchema });
    const result = await redeService.listTransactions(query);

    return reply.send(success(result.data, 'Transacoes Rede listadas com sucesso', result.pagination));
  }

  async getTransactionById(request: FastifyRequest, reply: FastifyReply) {
    const { params } = validateRequest<RedeIdParams>(request, { params: redeIdParamsSchema });
    const transaction = await redeService.findTransactionById(params.id);

    return reply.send(success(transaction, 'Transacao Rede encontrada com sucesso'));
  }

  async listReceivables(request: FastifyRequest, reply: FastifyReply) {
    const { query } = validateRequest<unknown, ListRedeReceivablesQuery>(request, { query: listRedeReceivablesQuerySchema });
    const result = await redeService.listReceivables(query);

    return reply.send(success(result.data, 'Recebiveis Rede listados com sucesso', result.pagination));
  }

  async getReceivableById(request: FastifyRequest, reply: FastifyReply) {
    const { params } = validateRequest<RedeIdParams>(request, { params: redeIdParamsSchema });
    const receivable = await redeService.findReceivableById(params.id);

    return reply.send(success(receivable, 'Recebivel Rede encontrado com sucesso'));
  }
}
