export type AuditEvent = {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  userId?: string | null;
  origin?: string | null;
  before?: unknown;
  after?: unknown;
  justification?: string | null;
  metadata?: unknown;
  createdAt: string;
};

export type RawPayload = {
  id: string;
  provider: string;
  endpoint?: string | null;
  httpMethod?: string | null;
  responseStatus?: number | null;
  status: string;
  rawPayload: unknown;
  payloadHash?: string | null;
  receivedAt: string;
};

export type JobExecution = {
  id: string;
  jobName: string;
  status: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  durationMs?: number | null;
  processedCount: number;
  successCount: number;
  errorCount: number;
  errorMessage?: string | null;
  createdAt: string;
};
