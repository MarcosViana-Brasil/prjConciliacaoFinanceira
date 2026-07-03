import { ApiLogDirection, AuditAction, GatewayProvider, RawPayloadStatus } from '@prisma/client';
import { apiLogsService } from '../../api-logs/api-logs.service.js';
import { auditService } from '../../auditoria/audit.service.js';
import { jobsService } from '../../jobs/jobs.service.js';
import { payloadsService } from '../../payloads/payloads.service.js';
import { AppError } from '../../../shared/errors/AppError.js';
import type { RequestContext } from '../../../shared/http/request-context.js';
import { maskSensitiveData } from '../../../shared/security/mask-sensitive-data.js';
import { toInputJson } from '../../../shared/utils/json.js';
import { redeClient, type RedeClient } from './rede.client.js';
import { normalizeRedeReceivables, normalizeRedeTransactions } from './rede.normalizer.js';
import { RedeRepository } from './rede.repository.js';
import type { RedeImportParams, RedeImportResult, RedeReceivableFilters, RedeTransactionFilters } from './rede.types.js';

export class RedeService {
  constructor(
    private readonly client: RedeClient = redeClient,
    private readonly redeRepository = new RedeRepository()
  ) {}

  async importTransactions(params: RedeImportParams, context: RequestContext) {
    const fetchResult = await this.fetchTransactionsWithErrorLog(params, context);

    await this.recordOutboundLog('GET', fetchResult.endpoint, fetchResult.requestParams, fetchResult.responsePayload, fetchResult.statusCode, fetchResult.durationMs);

    const rawPayload = await payloadsService.create(
      {
        provider: GatewayProvider.REDE,
        endpoint: fetchResult.endpoint,
        httpMethod: 'GET',
        requestParams: fetchResult.requestParams,
        responsePayload: fetchResult.responsePayload,
        responseStatus: fetchResult.statusCode,
        rawPayload: fetchResult.responsePayload,
        metadata: { operation: 'rede_import_transactions' }
      },
      context
    );

    const normalized = normalizeRedeTransactions(fetchResult.responsePayload);
    const result: RedeImportResult = { total: normalized.length, created: 0, updated: 0, skipped: 0, errors: [] };

    for (const [index, item] of normalized.entries()) {
      try {
        const upsert = await this.redeRepository.upsertTransaction({ ...item, rawPayloadId: rawPayload.id });

        if (upsert.created) result.created += 1;
        else result.updated += 1;

        await auditService.recordEvent({
          entity: 'RedeTransaction',
          entityId: upsert.record.id,
          action: AuditAction.NORMALIZE,
          userId: context.userId,
          origin: context.origin,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          after: upsert.record,
          metadata: { rawPayloadId: rawPayload.id, transactionId: item.transactionId }
        });
      } catch (error) {
        result.errors.push({
          index,
          identifier: item.transactionId,
          message: error instanceof Error ? error.message : 'Erro inesperado ao persistir transacao Rede'
        });
      }
    }

    await payloadsService.updateStatus(
      rawPayload.id,
      {
        status: result.errors.length ? RawPayloadStatus.ERROR : RawPayloadStatus.PROCESSED,
        errorMessage: result.errors.length ? 'Falhas ao normalizar algumas transacoes Rede' : undefined
      },
      context
    );

    await auditService.recordEvent({
      entity: 'RawPayload',
      entityId: rawPayload.id,
      action: AuditAction.IMPORT,
      userId: context.userId,
      origin: context.origin,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      after: result,
      metadata: { operation: 'rede_import_transactions' }
    });

    return result;
  }

  async importReceivables(params: RedeImportParams, context: RequestContext) {
    const fetchResult = await this.fetchReceivablesWithErrorLog(params, context);

    await this.recordOutboundLog('GET', fetchResult.endpoint, fetchResult.requestParams, fetchResult.responsePayload, fetchResult.statusCode, fetchResult.durationMs);

    const rawPayload = await payloadsService.create(
      {
        provider: GatewayProvider.REDE,
        endpoint: fetchResult.endpoint,
        httpMethod: 'GET',
        requestParams: fetchResult.requestParams,
        responsePayload: fetchResult.responsePayload,
        responseStatus: fetchResult.statusCode,
        rawPayload: fetchResult.responsePayload,
        metadata: { operation: 'rede_import_receivables' }
      },
      context
    );

    const normalized = normalizeRedeReceivables(fetchResult.responsePayload);
    const result: RedeImportResult = { total: normalized.length, created: 0, updated: 0, skipped: 0, errors: [] };

    for (const [index, item] of normalized.entries()) {
      try {
        const upsert = await this.redeRepository.upsertReceivable({ ...item, rawPayloadId: rawPayload.id });

        if (upsert.created) result.created += 1;
        else result.updated += 1;

        await auditService.recordEvent({
          entity: 'RedeReceivable',
          entityId: upsert.record.id,
          action: AuditAction.NORMALIZE,
          userId: context.userId,
          origin: context.origin,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          after: upsert.record,
          metadata: { rawPayloadId: rawPayload.id, transactionId: item.transactionId }
        });
      } catch (error) {
        result.errors.push({
          index,
          identifier: item.transactionId,
          message: error instanceof Error ? error.message : 'Erro inesperado ao persistir recebivel Rede'
        });
      }
    }

    await payloadsService.updateStatus(
      rawPayload.id,
      {
        status: result.errors.length ? RawPayloadStatus.ERROR : RawPayloadStatus.PROCESSED,
        errorMessage: result.errors.length ? 'Falhas ao normalizar alguns recebiveis Rede' : undefined
      },
      context
    );

    await auditService.recordEvent({
      entity: 'RawPayload',
      entityId: rawPayload.id,
      action: AuditAction.IMPORT,
      userId: context.userId,
      origin: context.origin,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      after: result,
      metadata: { operation: 'rede_import_receivables' }
    });

    return result;
  }

  async listTransactions(filters: RedeTransactionFilters) {
    return this.redeRepository.listTransactions(filters);
  }

  async listReceivables(filters: RedeReceivableFilters) {
    return this.redeRepository.listReceivables(filters);
  }

  async findTransactionById(id: string) {
    const transaction = await this.redeRepository.findTransactionById(id);

    if (!transaction) {
      throw new AppError('Transacao Rede nao encontrada', 404, 'REDE_TRANSACTION_NOT_FOUND');
    }

    return transaction;
  }

  async findReceivableById(id: string) {
    const receivable = await this.redeRepository.findReceivableById(id);

    if (!receivable) {
      throw new AppError('Recebivel Rede nao encontrado', 404, 'REDE_RECEIVABLE_NOT_FOUND');
    }

    return receivable;
  }

  async runRedeTransactionsImportJob(params: RedeImportParams, context: RequestContext) {
    const job = await jobsService.startJob({ jobName: 'rede_transactions_import', metadata: params }, context);

    try {
      const result = await this.importTransactions(params, context);
      await jobsService.finishJob(
        job.id,
        {
          status: result.errors.length ? 'PARTIAL_SUCCESS' : 'SUCCESS',
          processedCount: result.total,
          successCount: result.created + result.updated,
          errorCount: result.errors.length,
          metadata: result
        },
        context
      );
      return result;
    } catch (error) {
      await jobsService.finishJob(
        job.id,
        {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Erro inesperado no job de transacoes Rede'
        },
        context
      );
      throw error;
    }
  }

  async runRedeReceivablesImportJob(params: RedeImportParams, context: RequestContext) {
    const job = await jobsService.startJob({ jobName: 'rede_receivables_import', metadata: params }, context);

    try {
      const result = await this.importReceivables(params, context);
      await jobsService.finishJob(
        job.id,
        {
          status: result.errors.length ? 'PARTIAL_SUCCESS' : 'SUCCESS',
          processedCount: result.total,
          successCount: result.created + result.updated,
          errorCount: result.errors.length,
          metadata: result
        },
        context
      );
      return result;
    } catch (error) {
      await jobsService.finishJob(
        job.id,
        {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Erro inesperado no job de recebiveis Rede'
        },
        context
      );
      throw error;
    }
  }

  private async recordOutboundLog(
    httpMethod: string,
    endpoint: string,
    requestParams: Record<string, unknown>,
    responsePayload: unknown,
    responseStatus: number,
    durationMs: number
  ) {
    await apiLogsService.record({
      provider: GatewayProvider.REDE,
      direction: ApiLogDirection.OUTBOUND,
      endpoint,
      httpMethod,
      requestPayload: requestParams,
      responseStatus,
      responsePayload,
      durationMs,
      requestHeaders: toInputJson(
        maskSensitiveData({
          Authorization: 'Bearer [configured]',
          'X-Client-Id': 'configured',
          'X-Merchant-Id': 'configured'
        })
      )
    });
  }

  private async fetchTransactionsWithErrorLog(params: RedeImportParams, context: RequestContext) {
    try {
      return await this.client.fetchTransactions(params);
    } catch (error) {
      await this.recordOutboundErrorLog('rede_transactions', params, error);
      await this.recordErrorAudit('RedeTransaction', 'fetch-transactions', context, error, { operation: 'rede_fetch_transactions' });
      throw error;
    }
  }

  private async fetchReceivablesWithErrorLog(params: RedeImportParams, context: RequestContext) {
    try {
      return await this.client.fetchReceivables(params);
    } catch (error) {
      await this.recordOutboundErrorLog('rede_receivables', params, error);
      await this.recordErrorAudit('RedeReceivable', 'fetch-receivables', context, error, { operation: 'rede_fetch_receivables' });
      throw error;
    }
  }

  private async recordOutboundErrorLog(endpoint: string, requestParams: Record<string, unknown>, error: unknown) {
    await apiLogsService.record({
      provider: GatewayProvider.REDE,
      direction: ApiLogDirection.OUTBOUND,
      endpoint,
      httpMethod: 'GET',
      requestPayload: requestParams,
      errorMessage: error instanceof Error ? error.message : 'Erro inesperado na chamada Rede'
    });
  }

  private async recordErrorAudit(entity: string, entityId: string, context: RequestContext, error: unknown, metadata: Record<string, unknown>) {
    await auditService.recordEvent({
      entity,
      entityId,
      action: AuditAction.ERROR,
      userId: context.userId,
      origin: context.origin,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata: {
        ...metadata,
        errorMessage: error instanceof Error ? error.message : 'Erro inesperado'
      }
    });
  }
}

export const redeService = new RedeService();
