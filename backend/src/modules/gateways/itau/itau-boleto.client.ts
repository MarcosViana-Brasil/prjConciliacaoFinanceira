import { env } from '../../../shared/utils/env.js';
import type { GatewayFetchResult } from '../gateway-provider.types.js';
import { getMockBoletoDetail, getMockBoletos, getMockFrancesas, getMockMovements } from './itau-boleto.mocks.js';
import type { ItauBoletoDetailParams, ItauBoletoListParams, ItauBoletoMovementParams, ItauFrancesaListParams } from './itau-boleto.types.js';

export class ItauBoletoClient {
  async fetchBoletos(params: ItauBoletoListParams): Promise<GatewayFetchResult> {
    if (env.ITAU_USE_MOCKS) return getMockBoletos(params);
    return this.request(env.ITAU_BOLETO_V1_BASE_URL, '/boletos', params);
  }

  async fetchBoletoDetail(params: ItauBoletoDetailParams): Promise<GatewayFetchResult> {
    if (env.ITAU_USE_MOCKS) return getMockBoletoDetail(params);
    return this.request(env.ITAU_BOLETOSCASH_V2_BASE_URL, '/boletos', {
      id_beneficiario: params.idBeneficiario,
      codigo_carteira: params.codigoCarteira,
      nosso_numero: params.nossoNumero,
      view: params.view
    });
  }

  async fetchFrancesas(params: ItauFrancesaListParams): Promise<GatewayFetchResult> {
    if (env.ITAU_USE_MOCKS) return getMockFrancesas(params);
    return this.request(env.ITAU_EXTRATO_V1_BASE_URL, '/francesas', params);
  }

  async fetchMovements(params: ItauBoletoMovementParams): Promise<GatewayFetchResult> {
    if (env.ITAU_USE_MOCKS) return getMockMovements(params);
    const { francesaId, ...query } = params;
    return this.request(env.ITAU_EXTRATO_V1_BASE_URL, `/francesas/${francesaId}/movimentacoes`, query);
  }

  private async request(baseUrl: string, endpoint: string, params: Record<string, unknown>): Promise<GatewayFetchResult> {
    const startedAt = Date.now();
    const url = new URL(endpoint, baseUrl);

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.ITAU_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: this.buildHeaders()
      });
      const responsePayload = await parseResponse(response);

      return {
        endpoint,
        statusCode: response.status,
        requestParams: params,
        responsePayload,
        durationMs: Date.now() - startedAt
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildHeaders() {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-itau-apikey': env.ITAU_API_KEY ?? '',
      'X-Client-Id': env.ITAU_CLIENT_ID ?? '',
      Authorization: env.ITAU_ACCESS_TOKEN ? `Bearer ${env.ITAU_ACCESS_TOKEN}` : ''
    };
  }
}

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { raw: text };
  }
}

export const itauBoletoClient = new ItauBoletoClient();
