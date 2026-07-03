import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError.js';
import { hashObject } from '../../shared/utils/hash.js';
import { toInputJson } from '../../shared/utils/json.js';
import { AuditRepository } from './audit.repository.js';
import type { AuditEventFilters, AuditEventRecordInput } from './audit.types.js';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class AuditService {
  constructor(private readonly auditRepository = new AuditRepository()) {}

  async listEvents(filters: AuditEventFilters) {
    return this.auditRepository.list(filters);
  }

  async listByEntity(entity: string, entityId: string) {
    return this.auditRepository.listByEntity(entity, entityId);
  }

  async recordEvent(input: AuditEventRecordInput) {
    if (!input.entity || !input.entityId) {
      throw new AppError('Auditoria exige entidade e identificador', 400, 'AUDIT_INVALID_ENTITY');
    }

    const normalizedUserId = input.userId && uuidRegex.test(input.userId) ? input.userId : undefined;
    const metadata = {
      actor: normalizedUserId ? 'user' : 'system',
      ...(isPlainObject(input.metadata) ? input.metadata : {})
    } satisfies Prisma.InputJsonObject;
    const createdAt = new Date().toISOString();
    const eventHash = hashObject({ ...input, userId: normalizedUserId, metadata, createdAt, nonce: randomUUID() });

    return this.auditRepository.create({
      entity: input.entity,
      entityId: input.entityId,
      action: input.action,
      origin: input.origin,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      before: input.before === undefined ? undefined : toInputJson(input.before),
      after: input.after === undefined ? undefined : toInputJson(input.after),
      justification: input.justification,
      metadata,
      eventHash,
      user: normalizedUserId ? { connect: { id: normalizedUserId } } : undefined
    });
  }
}

function isPlainObject(value: unknown): value is Record<string, Prisma.InputJsonValue> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
}

export const auditService = new AuditService();
