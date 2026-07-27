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

export const runImportItauBoletosJobSchema = z.object({
  idBeneficiario: z.string().trim().min(1),
  seuNumero: z.string().trim().min(1).optional(),
  nossoNumero: z.string().trim().min(1).optional(),
  codigoCarteira: z.string().trim().min(1).optional(),
  codigoBarra: z.string().trim().min(1).optional(),
  situacao: z.enum(['aberto', 'emPagamento', 'pago', 'cancelado']).optional(),
  instrumentoCobranca: z.enum(['boleto', 'bolecode']).optional(),
  dataEntrada: z.string().trim().min(1).optional(),
  dataEmissao: z.string().trim().min(1).optional(),
  dataCancelamento: z.string().trim().min(1).optional(),
  dataVencimento: z.string().trim().min(1).optional(),
  dataPagamento: z.string().trim().min(1).optional(),
  view: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(1000).optional()
});

export const runImportItauBoletoMovementsJobSchema = z.object({
  francesaId: z.string().trim().min(1),
  data: z.string().trim().min(1),
  tipoCobranca: z.enum(['boleto', 'bolecode', 'boleto_descontado']).optional(),
  tipoMovimentacao: z.enum(['entradas', 'liquidacoes', 'baixas']).optional(),
  nossoNumero: z.string().trim().min(1).optional(),
  seuNumero: z.string().trim().min(1).optional(),
  numeroCarteira: z.string().trim().min(1).optional(),
  nomePagador: z.string().trim().min(1).optional()
});

export const runEnrichItauBoletoJobSchema = z.object({
  idBeneficiario: z.string().trim().min(1),
  codigoCarteira: z.string().trim().min(1),
  nossoNumero: z.string().trim().min(1),
  view: z.string().trim().min(1).optional()
});

export const runReconcileItauBoletoMovementsJobSchema = runImportRedeTransactionsJobSchema;

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
export type RunImportItauBoletosJobBody = z.infer<typeof runImportItauBoletosJobSchema>;
export type RunImportItauBoletoMovementsJobBody = z.infer<typeof runImportItauBoletoMovementsJobSchema>;
export type RunEnrichItauBoletoJobBody = z.infer<typeof runEnrichItauBoletoJobSchema>;
export type RunReconcileItauBoletoMovementsJobBody = z.infer<typeof runReconcileItauBoletoMovementsJobSchema>;
export type RunReconciliationJobBody = z.infer<typeof runReconciliationJobSchema>;
export type ReprocessPayloadParams = z.infer<typeof reprocessPayloadParamsSchema>;
export type ReprocessPayloadBody = z.infer<typeof reprocessPayloadBodySchema>;
