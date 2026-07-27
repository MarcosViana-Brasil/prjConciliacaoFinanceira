import { itauBoletoService } from '../../gateways/itau/itau-boleto.service.js';
import type { RequestContext } from '../../../shared/http/request-context.js';
import type { JobHandlerResult, RunImportItauBoletosJobParams } from '../jobs.types.js';

export async function importItauBoletosJob(payload?: RunImportItauBoletosJobParams): Promise<JobHandlerResult> {
  if (!payload?.idBeneficiario) {
    throw new Error('idBeneficiario obrigatorio para importacao de boletos Itau');
  }

  const result = await itauBoletoService.importBoletos(payload, jobContext('IMPORT_ITAU_BOLETOS'));

  return {
    processedCount: result.total,
    successCount: result.created + result.updated,
    errorCount: result.errors.length,
    skippedCount: result.skipped,
    errors: result.errors.map((error) => ({
      item: error.identifier ?? error.index,
      message: error.message,
      code: 'ITAU_BOLETO_NORMALIZATION_ERROR'
    })),
    metadata: { params: payload, created: result.created, updated: result.updated }
  };
}

function jobContext(origin: string): RequestContext {
  return { origin, userName: 'job-runner' };
}
