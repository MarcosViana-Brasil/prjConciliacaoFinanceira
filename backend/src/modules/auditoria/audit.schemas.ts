import { AuditAction } from '@prisma/client';
import { z } from 'zod';

export const auditListQuerySchema = z.object({
  entity: z.string().trim().min(1).optional(),
  entityId: z.string().trim().min(1).optional(),
  action: z.nativeEnum(AuditAction).optional(),
  userId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

export const auditEntityParamsSchema = z.object({
  entity: z.string().trim().min(1),
  entityId: z.string().trim().min(1)
});

export type AuditListQuery = z.infer<typeof auditListQuerySchema>;
export type AuditEntityParams = z.infer<typeof auditEntityParamsSchema>;
