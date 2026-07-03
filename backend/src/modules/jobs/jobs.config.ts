import { subDays } from './jobs.date-utils.js';
import { env } from '../../shared/utils/env.js';
import type { RunRedeImportJobParams, RunReconciliationJobParams } from './jobs.types.js';

export const jobsConfig = {
  enabled: env.JOBS_ENABLED,
  defaultLookbackDays: env.JOB_DEFAULT_LOOKBACK_DAYS,
  importRedeTransactions: {
    enabled: env.JOB_IMPORT_REDE_TRANSACTIONS_ENABLED,
    cron: env.JOB_IMPORT_REDE_TRANSACTIONS_CRON
  },
  importRedeReceivables: {
    enabled: env.JOB_IMPORT_REDE_RECEIVABLES_ENABLED,
    cron: env.JOB_IMPORT_REDE_RECEIVABLES_CRON
  },
  runReconciliation: {
    enabled: env.JOB_RECONCILIATION_ENABLED,
    cron: env.JOB_RECONCILIATION_CRON
  },
  cleanupOldLogs: {
    enabled: env.JOB_CLEANUP_OLD_LOGS_ENABLED,
    cron: env.JOB_CLEANUP_OLD_LOGS_CRON,
    retentionDays: env.JOB_LOG_RETENTION_DAYS
  }
};

export function defaultPeriod(): RunRedeImportJobParams {
  const endDate = new Date();
  const startDate = subDays(endDate, jobsConfig.defaultLookbackDays);

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
}

export function defaultReconciliationPeriod(): RunReconciliationJobParams {
  return {
    ...defaultPeriod(),
    gatewayProvider: 'REDE'
  };
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
