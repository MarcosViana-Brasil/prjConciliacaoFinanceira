import type { ApiLogDirection, GatewayProvider } from '@prisma/client';

export type ApiLogFilters = {
  provider?: GatewayProvider;
  direction?: ApiLogDirection;
  endpoint?: string;
  responseStatus?: number;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
};

export type RecordApiLogInput = {
  provider?: GatewayProvider;
  integrationId?: string;
  direction: ApiLogDirection;
  endpoint: string;
  httpMethod: string;
  requestHeaders?: unknown;
  requestPayload?: unknown;
  responseStatus?: number;
  responsePayload?: unknown;
  durationMs?: number;
  errorMessage?: string;
  metadata?: unknown;
};
