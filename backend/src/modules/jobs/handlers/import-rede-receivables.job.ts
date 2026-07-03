import { redeService } from '../../gateways/rede/rede.service.js';
import type { RequestContext } from '../../../shared/http/request-context.js';
import type { JobHandlerResult, RunRedeImportJobParams } from '../jobs.types.js';

export async function importRedeReceivablesJob(payload?: RunRedeImportJobParams): Promise<JobHandlerResult> {
  const params = requirePeriod(payload);
  const result = await redeService.importReceivables(params, jobContext('IMPORT_REDE_RECEIVABLES'));

  return {
    processedCount: result.total,
    successCount: result.created + result.updated,
    errorCount: result.errors.length,
    skippedCount: result.skipped,
    errors: result.errors.map((error) => ({
      item: error.identifier ?? error.index,
      message: error.message,
      code: 'REDE_RECEIVABLE_NORMALIZATION_ERROR'
    })),
    metadata: {
      params,
      created: result.created,
      updated: result.updated
    }
  };
}

function requirePeriod(payload?: RunRedeImportJobParams) {
  if (!payload?.startDate || !payload.endDate) {
    throw new Error('Periodo obrigatorio para importacao Rede');
  }

  return payload;
}

function jobContext(origin: string): RequestContext {
  return { origin, userName: 'job-runner' };
}
