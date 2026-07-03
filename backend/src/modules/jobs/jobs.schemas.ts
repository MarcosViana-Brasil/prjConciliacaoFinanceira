import { GatewayProvider, JobStatus } from '@prisma/client';
import { z } from 'zod';

export const jobsListQuerySchema = z.object({
  jobName: z.string().trim().min(1).optional(),
  status: z.nativeEnum(JobStatus).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

export const jobIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const runImportRedeTransactionsJobSchema = z.object({
  startDate: z.string().trim().min(1),
  endDate: z.string().trim().min(1)
});

export const runImportRedeReceivablesJobSchema = runImportRedeTransactionsJobSchema;

export const runReconciliationJobSchema = runImportRedeTransactionsJobSchema.extend({
  gatewayProvider: z.nativeEnum(GatewayProvider).default(GatewayProvider.REDE)
});

export const reprocessPayloadParamsSchema = z.object({
  rawPayloadId: z.string().uuid()
});

export const reprocessPayloadBodySchema = z.object({
  justification: z.string().trim().min(1)
});

export type JobsListQuery = z.infer<typeof jobsListQuerySchema>;
export type JobIdParams = z.infer<typeof jobIdParamsSchema>;
export type RunImportRedeTransactionsJobBody = z.infer<typeof runImportRedeTransactionsJobSchema>;
export type RunImportRedeReceivablesJobBody = z.infer<typeof runImportRedeReceivablesJobSchema>;
export type RunReconciliationJobBody = z.infer<typeof runReconciliationJobSchema>;
export type ReprocessPayloadParams = z.infer<typeof reprocessPayloadParamsSchema>;
export type ReprocessPayloadBody = z.infer<typeof reprocessPayloadBodySchema>;
