import type { GatewayProviderClient } from '../gateway-provider.interface.js';
import type { FetchReceivablesParams, FetchTransactionsParams, GatewayFetchResult } from '../gateway-provider.types.js';
import { env } from '../../../shared/utils/env.js';
import { getMockReceivables, getMockTransactions } from './rede.mocks.js';

const REDE_ENDPOINTS = {
  transactions: env.REDE_TRANSACTIONS_ENDPOINT,
  receivables: env.REDE_RECEIVABLES_ENDPOINT
};

export class RedeClient implements GatewayProviderClient {
  provider = 'REDE';

  async fetchTransactions(params: FetchTransactionsParams): Promise<GatewayFetchResult> {
    if (env.REDE_USE_MOCKS) {
      return getMockTransactions(params);
    }

    return this.request(REDE_ENDPOINTS.transactions, params);
  }

  async fetchReceivables(params: FetchReceivablesParams): Promise<GatewayFetchResult> {
    if (env.REDE_USE_MOCKS) {
      return getMockReceivables(params);
    }

    return this.request(REDE_ENDPOINTS.receivables, params);
  }

  private async request(endpoint: string, params: Record<string, unknown>): Promise<GatewayFetchResult> {
    const startedAt = Date.now();
    const url = new URL(endpoint, env.REDE_BASE_URL);

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.REDE_TIMEOUT_MS);

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
      'X-Client-Id': env.REDE_CLIENT_ID ?? '',
      'X-Merchant-Id': env.REDE_MERCHANT_ID ?? '',
      'X-PV': env.REDE_PV ?? '',
      Authorization: env.REDE_CLIENT_SECRET ? `Bearer ${env.REDE_CLIENT_SECRET}` : ''
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

export const redeClient = new RedeClient();
