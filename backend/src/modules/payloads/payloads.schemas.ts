import { GatewayProvider, RawPayloadStatus } from '@prisma/client';
import { z } from 'zod';

export const payloadIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const payloadsListQuerySchema = z.object({
  provider: z.nativeEnum(GatewayProvider).optional(),
  status: z.nativeEnum(RawPayloadStatus).optional(),
  endpoint: z.string().trim().min(1).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

export const createPayloadBodySchema = z.object({
  provider: z.nativeEnum(GatewayProvider),
  integrationId: z.string().uuid().optional(),
  endpoint: z.string().trim().min(1).optional(),
  httpMethod: z.string().trim().min(1).optional(),
  requestParams: z.unknown().optional(),
  requestPayload: z.unknown().optional(),
  responsePayload: z.unknown().optional(),
  responseStatus: z.number().int().optional(),
  rawPayload: z.unknown().refine((value) => value !== undefined, 'rawPayload e obrigatorio'),
  receivedAt: z.coerce.date().optional(),
  metadata: z.unknown().optional()
});

export const updatePayloadStatusBodySchema = z.object({
  status: z.nativeEnum(RawPayloadStatus),
  errorMessage: z.string().trim().min(1).optional(),
  processedAt: z.coerce.date().optional()
});

export type PayloadIdParams = z.infer<typeof payloadIdParamsSchema>;
export type PayloadsListQuery = z.infer<typeof payloadsListQuerySchema>;
export type CreatePayloadBody = z.infer<typeof createPayloadBodySchema>;
export type UpdatePayloadStatusBody = z.infer<typeof updatePayloadStatusBodySchema>;
