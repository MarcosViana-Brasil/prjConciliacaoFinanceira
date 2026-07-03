import { cleanupOldLogsJob } from './handlers/cleanup-old-logs.job.js';
import { importRedeReceivablesJob } from './handlers/import-rede-receivables.job.js';
import { importRedeTransactionsJob } from './handlers/import-rede-transactions.job.js';
import { reprocessPayloadJob } from './handlers/reprocess-payload.job.js';
import { runReconciliationJob } from './handlers/run-reconciliation.job.js';
import { JOB_NAMES } from './jobs.types.js';

export const jobRegistry = {
  [JOB_NAMES.importRedeTransactions]: importRedeTransactionsJob,
  [JOB_NAMES.importRedeReceivables]: importRedeReceivablesJob,
  [JOB_NAMES.runReconciliation]: runReconciliationJob,
  [JOB_NAMES.reprocessPayload]: reprocessPayloadJob,
  [JOB_NAMES.cleanupOldLogs]: cleanupOldLogsJob
};
