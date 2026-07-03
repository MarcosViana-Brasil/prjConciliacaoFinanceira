import type { GatewayProvider, JobExecution, JobStatus } from '@prisma/client';

export const JOB_NAMES = {
  importRedeTransactions: 'IMPORT_REDE_TRANSACTIONS',
  importRedeReceivables: 'IMPORT_REDE_RECEIVABLES',
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

export type ReprocessPayloadJobParams = {
  rawPayloadId: string;
  justification: string;
};
