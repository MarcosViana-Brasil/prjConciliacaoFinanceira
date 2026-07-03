import type { GatewayProvider, RawPayloadStatus } from '@prisma/client';

export type PayloadFilters = {
  provider?: GatewayProvider;
  status?: RawPayloadStatus;
  endpoint?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
};

export type CreatePayloadInput = {
  provider: GatewayProvider;
  integrationId?: string;
  endpoint?: string;
  httpMethod?: string;
  requestParams?: unknown;
  requestPayload?: unknown;
  responsePayload?: unknown;
  responseStatus?: number;
  rawPayload: unknown;
  receivedAt?: Date;
  metadata?: unknown;
};

export type UpdatePayloadStatusInput = {
  status: RawPayloadStatus;
  errorMessage?: string;
  processedAt?: Date;
};
