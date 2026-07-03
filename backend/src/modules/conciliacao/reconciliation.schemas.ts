import {
  DivergenceSeverity,
  GatewayProvider,
  ReconciliationDivergenceType,
  ReconciliationMatchLevel,
  ReconciliationStatus
} from '@prisma/client';
import { z } from 'zod';

export const runReconciliationSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  gatewayProvider: z.nativeEnum(GatewayProvider).default(GatewayProvider.REDE)
});

export const listReconciliationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.nativeEnum(ReconciliationStatus).optional(),
  matchLevel: z.nativeEnum(ReconciliationMatchLevel).optional(),
  gatewayProvider: z.nativeEnum(GatewayProvider).optional(),
  minScore: z.coerce.number().int().min(0).max(100).optional(),
  maxScore: z.coerce.number().int().min(0).max(100).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  financialTitleId: z.string().uuid().optional(),
  redeTransactionId: z.string().uuid().optional(),
  redeReceivableId: z.string().uuid().optional()
});

export const reconciliationIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const approveManualReconciliationSchema = z.object({
  justification: z.string().trim().min(1)
});

export const rejectReconciliationSchema = approveManualReconciliationSchema;

export const reverseReconciliationSchema = z.object({
  reversalReason: z.string().trim().min(1)
});

export const listDivergencesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  divergenceType: z.nativeEnum(ReconciliationDivergenceType).optional(),
  severity: z.nativeEnum(DivergenceSeverity).optional(),
  resolved: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((value) => (typeof value === 'boolean' ? value : value === 'true'))
    .optional(),
  financialTitleId: z.string().uuid().optional(),
  redeReceivableId: z.string().uuid().optional()
});

export type RunReconciliationBody = z.infer<typeof runReconciliationSchema>;
export type ListReconciliationsQuery = z.infer<typeof listReconciliationsQuerySchema>;
export type ReconciliationIdParams = z.infer<typeof reconciliationIdParamsSchema>;
export type ApproveManualReconciliationBody = z.infer<typeof approveManualReconciliationSchema>;
export type RejectReconciliationBody = z.infer<typeof rejectReconciliationSchema>;
export type ReverseReconciliationBody = z.infer<typeof reverseReconciliationSchema>;
export type ListDivergencesQuery = z.infer<typeof listDivergencesQuerySchema>;
