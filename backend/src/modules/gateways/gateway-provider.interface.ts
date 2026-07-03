import type { FetchReceivablesParams, FetchTransactionsParams, GatewayFetchResult } from './gateway-provider.types.js';

export interface GatewayProviderClient {
  provider: string;

  fetchTransactions(params: FetchTransactionsParams): Promise<GatewayFetchResult>;

  fetchReceivables(params: FetchReceivablesParams): Promise<GatewayFetchResult>;
}
