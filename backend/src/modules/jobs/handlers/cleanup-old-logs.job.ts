import type { JobHandlerResult } from '../jobs.types.js';
import { jobsConfig } from '../jobs.config.js';

export async function cleanupOldLogsJob(): Promise<JobHandlerResult> {
  return {
    processedCount: 0,
    successCount: 0,
    errorCount: 0,
    skippedCount: 1,
    metadata: {
      retentionDays: jobsConfig.cleanupOldLogs.retentionDays,
      mode: 'placeholder_safe_no_delete',
      message: 'MVP nao apaga logs financeiros nem tecnicos automaticamente.'
    }
  };
}
