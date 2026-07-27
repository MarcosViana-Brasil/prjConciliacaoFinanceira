import { itauBoletoService } from '../../gateways/itau/itau-boleto.service.js';
import type { RequestContext } from '../../../shared/http/request-context.js';
import type { JobHandlerResult, RunImportItauBoletoMovementsJobParams } from '../jobs.types.js';

export async function importItauBoletoMovementsJob(payload?: RunImportItauBoletoMovementsJobParams): Promise<JobHandlerResult> {
  if (!payload?.francesaId || !payload.data) {
    throw new Error('francesaId e data sao obrigatorios para importacao do extrato Itau');
  }

  const result = await itauBoletoService.importMovements(payload, jobContext('IMPORT_ITAU_BOLETO_MOVEMENTS'));

  return {
    processedCount: result.total,
    successCount: result.created + result.updated,
    errorCount: result.errors.length,
    skippedCount: result.skipped,
    errors: result.errors.map((error) => ({
      item: error.identifier ?? error.index,
      message: error.message,
      code: 'ITAU_BOLETO_MOVEMENT_NORMALIZATION_ERROR'
    })),
    metadata: { params: payload, created: result.created, updated: result.updated }
  };
}

function jobContext(origin: string): RequestContext {
  return { origin, userName: 'job-runner' };
}
