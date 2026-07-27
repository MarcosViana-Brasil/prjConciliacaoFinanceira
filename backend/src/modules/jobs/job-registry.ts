import { cleanupOldLogsJob } from './handlers/cleanup-old-logs.job.js';
import { enrichItauBoletoJob } from './handlers/enrich-itau-boleto.job.js';
import { importItauBoletoMovementsJob } from './handlers/import-itau-boleto-movements.job.js';
import { importItauBoletosJob } from './handlers/import-itau-boletos.job.js';
import { importRedeReceivablesJob } from './handlers/import-rede-receivables.job.js';
import { importRedeTransactionsJob } from './handlers/import-rede-transactions.job.js';
import { reconcileItauBoletoMovementsJob } from './handlers/reconcile-itau-boleto-movements.job.js';
import { reprocessPayloadJob } from './handlers/reprocess-payload.job.js';
import { runReconciliationJob } from './handlers/run-reconciliation.job.js';
import { JOB_NAMES } from './jobs.types.js';

export const jobRegistry = {
  [JOB_NAMES.importRedeTransactions]: importRedeTransactionsJob,
  [JOB_NAMES.importRedeReceivables]: importRedeReceivablesJob,
  [JOB_NAMES.importItauBoletos]: importItauBoletosJob,
  [JOB_NAMES.importItauBoletoMovements]: importItauBoletoMovementsJob,
  [JOB_NAMES.enrichItauBoleto]: enrichItauBoletoJob,
  [JOB_NAMES.reconcileItauBoletoMovements]: reconcileItauBoletoMovementsJob,
  [JOB_NAMES.runReconciliation]: runReconciliationJob,
  [JOB_NAMES.reprocessPayload]: reprocessPayloadJob,
  [JOB_NAMES.cleanupOldLogs]: cleanupOldLogsJob
};
