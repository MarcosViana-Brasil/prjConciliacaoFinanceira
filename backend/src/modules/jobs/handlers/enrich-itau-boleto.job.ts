import { itauBoletoService } from '../../gateways/itau/itau-boleto.service.js';
import type { RequestContext } from '../../../shared/http/request-context.js';
import type { JobHandlerResult, RunEnrichItauBoletoJobParams } from '../jobs.types.js';

export async function enrichItauBoletoJob(payload?: RunEnrichItauBoletoJobParams): Promise<JobHandlerResult> {
  if (!payload?.idBeneficiario || !payload.codigoCarteira || !payload.nossoNumero) {
    throw new Error('idBeneficiario, codigoCarteira e nossoNumero sao obrigatorios para detalhe de boleto Itau');
  }

  const result = await itauBoletoService.enrichBoleto(payload, jobContext('ENRICH_ITAU_BOLETO'));

  return {
    processedCount: result.total,
    successCount: result.created + result.updated,
    errorCount: result.errors.length,
    skippedCount: result.skipped,
    errors: result.errors.map((error) => ({
      item: error.identifier ?? error.index,
      message: error.message,
      code: 'ITAU_BOLETO_DETAIL_NORMALIZATION_ERROR'
    })),
    metadata: { params: payload, created: result.created, updated: result.updated }
  };
}

function jobContext(origin: string): RequestContext {
  return { origin, userName: 'job-runner' };
}
