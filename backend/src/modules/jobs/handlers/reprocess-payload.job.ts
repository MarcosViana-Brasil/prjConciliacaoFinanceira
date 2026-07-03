import { AuditAction, GatewayProvider, RawPayloadStatus } from '@prisma/client';
import { auditService } from '../../auditoria/audit.service.js';
import { normalizeRedeReceivables, normalizeRedeTransactions } from '../../gateways/rede/rede.normalizer.js';
import { RedeRepository } from '../../gateways/rede/rede.repository.js';
import { payloadsService } from '../../payloads/payloads.service.js';
import { AppError } from '../../../shared/errors/AppError.js';
import type { RequestContext } from '../../../shared/http/request-context.js';
import type { JobHandlerResult, ReprocessPayloadJobParams } from '../jobs.types.js';

const redeRepository = new RedeRepository();

export async function reprocessPayloadJob(payload?: ReprocessPayloadJobParams): Promise<JobHandlerResult> {
  if (!payload?.rawPayloadId) {
    throw new AppError('Payload bruto obrigatorio para reprocessamento', 400, 'RAW_PAYLOAD_REQUIRED');
  }

  if (!payload.justification?.trim()) {
    throw new AppError('Justificativa obrigatoria para reprocessamento', 400, 'JUSTIFICATION_REQUIRED');
  }

  const context = jobContext();
  const rawPayload = await payloadsService.getById(payload.rawPayloadId);

  if (rawPayload.provider !== GatewayProvider.REDE) {
    throw new AppError('Provider ainda nao suportado para reprocessamento', 400, 'UNSUPPORTED_PAYLOAD_PROVIDER');
  }

  const kind = detectRedePayloadKind(rawPayload.endpoint, rawPayload.rawPayload);

  if (!kind) {
    throw new AppError('Nao foi possivel identificar se o payload Rede e de transacoes ou recebiveis', 400, 'UNKNOWN_REDE_PAYLOAD_KIND');
  }

  const result = kind === 'transactions' ? await reprocessTransactions(rawPayload.id, rawPayload.rawPayload) : await reprocessReceivables(rawPayload.id, rawPayload.rawPayload);
  const updatedPayload = await payloadsService.updateStatus(
    rawPayload.id,
    {
      status: RawPayloadStatus.REPROCESSED,
      processedAt: new Date(),
      errorMessage: result.errorCount ? 'Payload reprocessado com erros parciais' : undefined
    },
    context
  );

  await auditService.recordEvent({
    entity: 'raw_payloads',
    entityId: rawPayload.id,
    action: AuditAction.UPDATE,
    origin: context.origin,
    before: rawPayload,
    after: updatedPayload,
    justification: payload.justification,
    metadata: {
      operation: 'reprocess_payload',
      kind,
      result
    }
  });

  return {
    ...result,
    metadata: {
      ...result.metadata,
      rawPayloadId: rawPayload.id,
      provider: rawPayload.provider,
      kind,
      justification: payload.justification
    }
  };
}

async function reprocessTransactions(rawPayloadId: string, rawPayload: unknown): Promise<JobHandlerResult> {
  const items = normalizeRedeTransactions(rawPayload);
  let created = 0;
  let updated = 0;
  const errors: NonNullable<JobHandlerResult['errors']> = [];

  for (const [index, item] of items.entries()) {
    try {
      const upsert = await redeRepository.upsertTransaction({ ...item, rawPayloadId });
      if (upsert.created) created += 1;
      else updated += 1;
    } catch (error) {
      errors.push({
        item: item.transactionId ?? index,
        message: error instanceof Error ? error.message : 'Erro inesperado ao reprocessar transacao',
        code: 'REPROCESS_TRANSACTION_ERROR'
      });
    }
  }

  return {
    processedCount: items.length,
    successCount: created + updated,
    errorCount: errors.length,
    errors,
    metadata: { created, updated }
  };
}

async function reprocessReceivables(rawPayloadId: string, rawPayload: unknown): Promise<JobHandlerResult> {
  const items = normalizeRedeReceivables(rawPayload);
  let created = 0;
  let updated = 0;
  const errors: NonNullable<JobHandlerResult['errors']> = [];

  for (const [index, item] of items.entries()) {
    try {
      const upsert = await redeRepository.upsertReceivable({ ...item, rawPayloadId });
      if (upsert.created) created += 1;
      else updated += 1;
    } catch (error) {
      errors.push({
        item: item.transactionId ?? index,
        message: error instanceof Error ? error.message : 'Erro inesperado ao reprocessar recebivel',
        code: 'REPROCESS_RECEIVABLE_ERROR'
      });
    }
  }

  return {
    processedCount: items.length,
    successCount: created + updated,
    errorCount: errors.length,
    errors,
    metadata: { created, updated }
  };
}

function detectRedePayloadKind(endpoint: string | null, rawPayload: unknown) {
  const endpointValue = endpoint?.toLowerCase() ?? '';
  if (endpointValue.includes('transaction')) return 'transactions';
  if (endpointValue.includes('receivable')) return 'receivables';

  if (rawPayload && typeof rawPayload === 'object' && !Array.isArray(rawPayload)) {
    const record = rawPayload as Record<string, unknown>;
    if (Array.isArray(record.transactions)) return 'transactions';
    if (Array.isArray(record.receivables)) return 'receivables';
  }

  return undefined;
}

function jobContext(): RequestContext {
  return { origin: 'REPROCESS_PAYLOAD', userName: 'job-runner' };
}
