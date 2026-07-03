export type FetchTransactionsParams = {
  startDate: string;
  endDate: string;
  page?: number;
  limit?: number;
};

export type FetchReceivablesParams = {
  startDate: string;
  endDate: string;
  page?: number;
  limit?: number;
};

export type GatewayFetchResult = {
  endpoint: string;
  statusCode: number;
  requestParams: Record<string, unknown>;
  responsePayload: unknown;
  durationMs: number;
};
