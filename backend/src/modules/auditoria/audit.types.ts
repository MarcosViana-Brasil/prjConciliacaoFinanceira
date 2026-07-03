import type { AuditAction } from '@prisma/client';

export type AuditEventRecordInput = {
  entity: string;
  entityId: string;
  action: AuditAction;
  userId?: string;
  origin?: string;
  ipAddress?: string;
  userAgent?: string;
  before?: unknown;
  after?: unknown;
  justification?: string;
  metadata?: unknown;
};

export type AuditEventFilters = {
  entity?: string;
  entityId?: string;
  action?: AuditAction;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
};
