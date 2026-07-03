import type { JobStatus } from '@prisma/client';

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
