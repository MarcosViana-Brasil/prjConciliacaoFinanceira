import {
  ApiLogDirection,
  AuditAction,
  GatewayProvider,
  ItauBoletoMovementType,
  Prisma,
  RawPayloadStatus,
  ReconciliationMatchLevel,
  ReconciliationStatus
} from '@prisma/client';
import { apiLogsService } from '../../api-logs/api-logs.service.js';
import { auditService } from '../../auditoria/audit.service.js';
import { payloadsService } from '../../payloads/payloads.service.js';
import type { RequestContext } from '../../../shared/http/request-context.js';
import { maskSensitiveData } from '../../../shared/security/mask-sensitive-data.js';
import { toInputJson } from '../../../shared/utils/json.js';
import { itauBoletoClient, type ItauBoletoClient } from './itau-boleto.client.js';
import { normalizeItauBoletoMovements, normalizeItauBoletos } from './itau-boleto.normalizer.js';
import { ItauBoletoRepository } from './itau-boleto.repository.js';
import type {
  ItauBoletoDetailParams,
  ItauBoletoListParams,
  ItauBoletoMovementParams,
  ItauFrancesaListParams,
  ItauImportResult,
  ItauReconciliationResult
} from './itau-boleto.types.js';

export class ItauBoletoService {
  constructor(
    private readonly client: ItauBoletoClient = itauBoletoClient,
    private readonly repository = new ItauBoletoRepository()
  ) {}

  async importBoletos(params: ItauBoletoListParams, context: RequestContext) {
    const fetchResult = await this.client.fetchBoletos(params);
    await this.recordOutboundLog('GET', fetchResult.endpoint, fetchResult.requestParams, fetchResult.responsePayload, fetchResult.statusCode, fetchResult.durationMs);

    const rawPayload = await this.createRawPayload(fetchResult, 'itau_import_boletos', context);
    const normalized = normalizeItauBoletos(fetchResult.responsePayload);
    const result = await this.persistBoletos(normalized, rawPayload.id, context);

    await this.finishRawPayload(rawPayload.id, result, context, 'Falhas ao normalizar boletos Itau');
    await this.recordAudit('ItauBoleto', `import:${rawPayload.id}`, AuditAction.IMPORT, result, context, { operation: 'itau_import_boletos' });

    return result;
  }

  async enrichBoleto(params: ItauBoletoDetailParams, context: RequestContext) {
    const fetchResult = await this.client.fetchBoletoDetail(params);
    await this.recordOutboundLog('GET', fetchResult.endpoint, fetchResult.requestParams, fetchResult.responsePayload, fetchResult.statusCode, fetchResult.durationMs);

    const rawPayload = await this.createRawPayload(fetchResult, 'itau_enrich_boleto', context);
    const normalized = normalizeItauBoletos(fetchResult.responsePayload);
    const result = await this.persistBoletos(normalized, rawPayload.id, context);

    await this.finishRawPayload(rawPayload.id, result, context, 'Falhas ao enriquecer boleto Itau');
    await this.recordAudit('ItauBoleto', `detail:${rawPayload.id}`, AuditAction.IMPORT, result, context, { operation: 'itau_enrich_boleto' });

    return result;
  }

  async listFrancesas(params: ItauFrancesaListParams, context: RequestContext) {
    const fetchResult = await this.client.fetchFrancesas(params);
    await this.recordOutboundLog('GET', fetchResult.endpoint, fetchResult.requestParams, fetchResult.responsePayload, fetchResult.statusCode, fetchResult.durationMs);
    return fetchResult.responsePayload;
  }

  async importMovements(params: ItauBoletoMovementParams, context: RequestContext) {
    const fetchResult = await this.client.fetchMovements(params);
    await this.recordOutboundLog('GET', fetchResult.endpoint, fetchResult.requestParams, fetchResult.responsePayload, fetchResult.statusCode, fetchResult.durationMs);

    const rawPayload = await this.createRawPayload(fetchResult, 'itau_import_boleto_movements', context);
    const normalized = normalizeItauBoletoMovements(fetchResult.responsePayload);
    const result: ItauImportResult = { total: normalized.length, created: 0, updated: 0, skipped: 0, errors: [] };

    for (const [index, item] of normalized.entries()) {
      try {
        const upsert = await this.repository.upsertMovement({ ...item, rawPayloadId: rawPayload.id });
        if (upsert.created) result.created += 1;
        else result.updated += 1;
        await this.recordAudit('ItauBoletoMovement', upsert.record.id, AuditAction.NORMALIZE, upsert.record, context, { rawPayloadId: rawPayload.id });
      } catch (error) {
        result.errors.push({
          index,
          identifier: item.yourNumber ?? item.ourNumber,
          message: error instanceof Error ? error.message : 'Erro inesperado ao persistir movimento de boleto Itau'
        });
      }
    }

    await this.finishRawPayload(rawPayload.id, result, context, 'Falhas ao normalizar movimentos de boleto Itau');
    await this.recordAudit('ItauBoletoMovement', `import:${rawPayload.id}`, AuditAction.IMPORT, result, context, { operation: 'itau_import_boleto_movements' });

    return result;
  }

  async reconcileMovements(params: { startDate: string; endDate: string }, context: RequestContext): Promise<ItauReconciliationResult> {
    const result: ItauReconciliationResult = { processed: 0, matched: 0, divergent: 0, notFound: 0, skipped: 0, errors: [] };
    const movements = await this.repository.findMovementsForReconciliation({
      startDate: new Date(params.startDate),
      endDate: new Date(params.endDate),
      movementType: ItauBoletoMovementType.LIQUIDATION
    });

    for (const movement of movements) {
      try {
        result.processed += 1;

        const existing = await this.repository.findActiveReconciliationForMovement(movement.id);
        if (existing) {
          result.skipped += 1;
          continue;
        }

        const title = await this.repository.findFinancialTitleForMovement({ ourNumber: movement.ourNumber, yourNumber: movement.yourNumber });
        if (!title) {
          result.notFound += 1;
          continue;
        }

        const paidAmount = movement.netAmount ?? movement.amount;
        const grossAmountDiff = decimalDiff(title.grossAmount, movement.amount);
        const netAmountDiff = decimalDiff(title.netAmountExpected ?? title.grossAmount, paidAmount);
        const amountMatches = Math.abs(Number(grossAmountDiff?.toString() ?? 0)) < 0.01;
        const status = amountMatches ? ReconciliationStatus.MATCHED_AUTOMATICALLY : ReconciliationStatus.DIVERGENT;

        await this.repository.reconcileMovement({
          movementId: movement.id,
          financialTitleId: title.id,
          grossAmountDiff,
          netAmountDiff,
          dateDiffDays: dateDiffDays(title.dueDate, movement.movementDate),
          status,
          matchLevel: amountMatches ? ReconciliationMatchLevel.STRONG : ReconciliationMatchLevel.MEDIUM,
          score: amountMatches ? 100 : 80,
          ruleApplied: amountMatches ? 'itau_boleto_identificador_valor' : 'itau_boleto_identificador_com_divergencia_valor',
          metadata: {
            ourNumber: movement.ourNumber,
            yourNumber: movement.yourNumber,
            walletCode: movement.walletCode,
            movementDate: movement.movementDate
          },
          divergence: amountMatches
            ? undefined
            : {
                description: 'Valor do titulo difere do valor liquidado no extrato Itau',
                expectedValue: title.grossAmount.toString(),
                actualValue: movement.amount?.toString()
              },
          paidAmount: paidAmount ? new Prisma.Decimal(paidAmount.toString()) : undefined,
          paidAt: movement.movementDate
        });

        if (amountMatches) result.matched += 1;
        else result.divergent += 1;
      } catch (error) {
        result.errors.push({
          movementId: movement.id,
          message: error instanceof Error ? error.message : 'Erro inesperado ao conciliar movimento Itau'
        });
      }
    }

    await this.recordAudit('Reconciliation', `itau-run:${Date.now()}`, result.matched ? AuditAction.RECONCILE_AUTO : AuditAction.PROCESS, result, context, {
      operation: 'itau_reconcile_boleto_movements',
      params
    });

    return result;
  }

  private async persistBoletos(items: ReturnType<typeof normalizeItauBoletos>, rawPayloadId: string, context: RequestContext) {
    const result: ItauImportResult = { total: items.length, created: 0, updated: 0, skipped: 0, errors: [] };

    for (const [index, item] of items.entries()) {
      try {
        const upsert = await this.repository.upsertBoleto({ ...item, rawPayloadId });
        if (upsert.created) result.created += 1;
        else result.updated += 1;
        await this.recordAudit('ItauBoleto', upsert.record.id, AuditAction.NORMALIZE, upsert.record, context, { rawPayloadId });
      } catch (error) {
        result.errors.push({
          index,
          identifier: item.yourNumber ?? item.ourNumber,
          message: error instanceof Error ? error.message : 'Erro inesperado ao persistir boleto Itau'
        });
      }
    }

    return result;
  }

  private async createRawPayload(fetchResult: { endpoint: string; requestParams: Record<string, unknown>; responsePayload: unknown; statusCode: number }, operation: string, context: RequestContext) {
    return payloadsService.create(
      {
        provider: GatewayProvider.ITAU,
        endpoint: fetchResult.endpoint,
        httpMethod: 'GET',
        requestParams: fetchResult.requestParams,
        responsePayload: fetchResult.responsePayload,
        responseStatus: fetchResult.statusCode,
        rawPayload: fetchResult.responsePayload,
        metadata: { operation }
      },
      context
    );
  }

  private async finishRawPayload(rawPayloadId: string, result: ItauImportResult, context: RequestContext, errorMessage: string) {
    await payloadsService.updateStatus(
      rawPayloadId,
      {
        status: result.errors.length ? RawPayloadStatus.ERROR : RawPayloadStatus.PROCESSED,
        errorMessage: result.errors.length ? errorMessage : undefined
      },
      context
    );
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
      provider: GatewayProvider.ITAU,
      direction: ApiLogDirection.OUTBOUND,
      endpoint,
      httpMethod,
      requestPayload: requestParams,
      responseStatus,
      responsePayload,
      durationMs,
      requestHeaders: toInputJson(maskSensitiveData({ Authorization: 'Bearer [configured]', 'x-itau-apikey': 'configured', 'X-Client-Id': 'configured' }))
    });
  }

  private async recordAudit(entity: string, entityId: string, action: AuditAction, after: unknown, context: RequestContext, metadata?: Record<string, unknown>) {
    await auditService.recordEvent({
      entity,
      entityId,
      action,
      userId: context.userId,
      origin: context.origin,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      after,
      metadata
    });
  }
}

function decimalDiff(left: Prisma.Decimal | string | number | null | undefined, right: Prisma.Decimal | string | number | null | undefined) {
  if (left === undefined || left === null || right === undefined || right === null) return undefined;
  return new Prisma.Decimal(left.toString()).minus(new Prisma.Decimal(right.toString()));
}

function dateDiffDays(left?: Date | null, right?: Date | null) {
  if (!left || !right) return undefined;
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.round((left.getTime() - right.getTime()) / dayMs);
}

export const itauBoletoService = new ItauBoletoService();
