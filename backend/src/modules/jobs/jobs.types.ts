import type { GatewayProvider, JobExecution, JobStatus } from '@prisma/client';

export const JOB_NAMES = {
  importRedeTransactions: 'IMPORT_REDE_TRANSACTIONS',
  importRedeReceivables: 'IMPORT_REDE_RECEIVABLES',
  importItauBoletos: 'IMPORT_ITAU_BOLETOS',
  importItauBoletoMovements: 'IMPORT_ITAU_BOLETO_MOVEMENTS',
  enrichItauBoleto: 'ENRICH_ITAU_BOLETO',
  reconcileItauBoletoMovements: 'RECONCILE_ITAU_BOLETO_MOVEMENTS',
  runReconciliation: 'RUN_RECONCILIATION',
  reprocessPayload: 'REPROCESS_PAYLOAD',
  cleanupOldLogs: 'CLEANUP_OLD_LOGS'
} as const;

export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES];

export type JobFilters = {
  jobName?: string;
  status?: JobStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
};

export type StartJobInput = {
  jobName: string;
  metadata?: unknown;
};

export type FinishJobInput = {
  status: JobStatus;
  processedCount?: number;
  successCount?: number;
  errorCount?: number;
  errorMessage?: string;
  metadata?: unknown;
};

export type JobHandlerError = {
  item?: unknown;
  message: string;
  code?: string;
};

export type JobHandlerResult = {
  processedCount: number;
  successCount: number;
  errorCount: number;
  skippedCount?: number;
  metadata?: Record<string, unknown>;
  errors?: JobHandlerError[];
};

export type JobExecutionResult = {
  job: JobExecution;
  result?: JobHandlerResult;
};

export type RunJobParams<TParams> = {
  jobName: JobName | string;
  payload?: TParams;
  handler: (payload?: TParams) => Promise<JobHandlerResult>;
  triggeredBy?: string;
  origin?: string;
};

export type RunRedeImportJobParams = {
  startDate: string;
  endDate: string;
};

export type RunReconciliationJobParams = RunRedeImportJobParams & {
  gatewayProvider: GatewayProvider;
};

export type RunImportItauBoletosJobParams = {
  idBeneficiario: string;
  seuNumero?: string;
  nossoNumero?: string;
  codigoCarteira?: string;
  codigoBarra?: string;
  situacao?: string;
  instrumentoCobranca?: string;
  dataEntrada?: string;
  dataEmissao?: string;
  dataCancelamento?: string;
  dataVencimento?: string;
  dataPagamento?: string;
  view?: string;
  page?: number;
  pageSize?: number;
};

export type RunImportItauBoletoMovementsJobParams = {
  francesaId: string;
  data: string;
  tipoCobranca?: string;
  tipoMovimentacao?: string;
  nossoNumero?: string;
  seuNumero?: string;
  numeroCarteira?: string;
  nomePagador?: string;
};

export type RunEnrichItauBoletoJobParams = {
  idBeneficiario: string;
  codigoCarteira: string;
  nossoNumero: string;
  view?: string;
};

export type RunReconcileItauBoletoMovementsJobParams = {
  startDate: string;
  endDate: string;
};

export type ReprocessPayloadJobParams = {
  rawPayloadId: string;
  justification: string;
};
