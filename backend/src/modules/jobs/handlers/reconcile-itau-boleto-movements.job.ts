import { itauBoletoService } from '../../gateways/itau/itau-boleto.service.js';
import type { RequestContext } from '../../../shared/http/request-context.js';
import type { JobHandlerResult, RunReconcileItauBoletoMovementsJobParams } from '../jobs.types.js';

export async function reconcileItauBoletoMovementsJob(payload?: RunReconcileItauBoletoMovementsJobParams): Promise<JobHandlerResult> {
  if (!payload?.startDate || !payload.endDate) {
    throw new Error('Periodo obrigatorio para conciliacao de movimentos Itau');
  }

  const result = await itauBoletoService.reconcileMovements(payload, jobContext('RECONCILE_ITAU_BOLETO_MOVEMENTS'));

  return {
    processedCount: result.processed,
    successCount: result.matched,
    errorCount: result.errors.length,
    skippedCount: result.skipped,
    errors: result.errors.map((error) => ({
      item: error.movementId,
      message: error.message,
      code: 'ITAU_BOLETO_RECONCILIATION_ERROR'
    })),
    metadata: {
      params: payload,
      matched: result.matched,
      divergent: result.divergent,
      notFound: result.notFound
    }
  };
}

function jobContext(origin: string): RequestContext {
  return { origin, userName: 'job-runner' };
}
