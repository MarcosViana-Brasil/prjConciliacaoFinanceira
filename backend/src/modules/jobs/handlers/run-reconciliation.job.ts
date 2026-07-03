import { reconciliationService } from '../../conciliacao/reconciliation.service.js';
import type { RequestContext } from '../../../shared/http/request-context.js';
import type { JobHandlerResult, RunReconciliationJobParams } from '../jobs.types.js';

export async function runReconciliationJob(payload?: RunReconciliationJobParams): Promise<JobHandlerResult> {
  if (!payload?.startDate || !payload.endDate || !payload.gatewayProvider) {
    throw new Error('Periodo e provider sao obrigatorios para conciliacao');
  }

  const summary = await reconciliationService.runWithoutJob(
    {
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
      gatewayProvider: payload.gatewayProvider
    },
    jobContext()
  );

  return {
    processedCount: summary.processed,
    successCount: summary.matchedAutomatically,
    errorCount: summary.errors.length,
    errors: summary.errors.map((error) => ({
      item: error.financialTitleId,
      message: error.message,
      code: 'RECONCILIATION_ERROR'
    })),
    metadata: {
      params: payload,
      matchedAutomatically: summary.matchedAutomatically,
      divergent: summary.divergent,
      notFound: summary.notFound
    }
  };
}

function jobContext(): RequestContext {
  return { origin: 'RUN_RECONCILIATION', userName: 'job-runner' };
}
