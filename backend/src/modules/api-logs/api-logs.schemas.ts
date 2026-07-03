import { ApiLogDirection, GatewayProvider } from '@prisma/client';
import { z } from 'zod';

export const apiLogsListQuerySchema = z.object({
  provider: z.nativeEnum(GatewayProvider).optional(),
  direction: z.nativeEnum(ApiLogDirection).optional(),
  endpoint: z.string().trim().min(1).optional(),
  responseStatus: z.coerce.number().int().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

export type ApiLogsListQuery = z.infer<typeof apiLogsListQuerySchema>;
