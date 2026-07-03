import { ApiLogDirection, AuditAction, RawPayloadStatus } from '@prisma/client';
import { auditService } from '../auditoria/audit.service.js';
import { apiLogsService } from '../api-logs/api-logs.service.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { RequestContext } from '../../shared/http/request-context.js';
import { maskSensitiveData } from '../../shared/security/mask-sensitive-data.js';
import { hashObject } from '../../shared/utils/hash.js';
import { toInputJson } from '../../shared/utils/json.js';
import { PayloadsRepository } from './payloads.repository.js';
import type { CreatePayloadInput, PayloadFilters, UpdatePayloadStatusInput } from './payloads.types.js';

export class PayloadsService {
  constructor(private readonly payloadsRepository = new PayloadsRepository()) {}

  async list(filters: PayloadFilters) {
    return this.payloadsRepository.list(filters);
  }

  async getById(id: string) {
    const payload = await this.payloadsRepository.findById(id);

    if (!payload) {
      throw new AppError('Payload nao encontrado', 404, 'PAYLOAD_NOT_FOUND');
    }

    return payload;
  }

  async create(input: CreatePayloadInput, context: RequestContext) {
    const payloadHash = hashObject({
      provider: input.provider,
      integrationId: input.integrationId,
      endpoint: input.endpoint,
      httpMethod: input.httpMethod?.toUpperCase(),
      rawPayload: input.rawPayload
    });
    const existing = await this.payloadsRepository.findByHash(payloadHash);

    if (existing) {
      return existing;
    }

    const payload = await this.payloadsRepository.create({
      provider: input.provider,
      integrationId: input.integrationId,
      endpoint: input.endpoint,
      httpMethod: input.httpMethod?.toUpperCase(),
      requestParams: input.requestParams === undefined ? undefined : toInputJson(maskSensitiveData(input.requestParams)),
      requestPayload: input.requestPayload === undefined ? undefined : toInputJson(maskSensitiveData(input.requestPayload)),
      responsePayload: input.responsePayload === undefined ? undefined : toInputJson(maskSensitiveData(input.responsePayload)),
      responseStatus: input.responseStatus,
      rawPayload: toInputJson(input.rawPayload),
      payloadHash,
      status: RawPayloadStatus.RECEIVED,
      receivedAt: input.receivedAt,
      metadata: toInputJson(maskSensitiveData(input.metadata ?? {}))
    });

    await auditService.recordEvent({
      entity: 'raw_payloads',
      entityId: payload.id,
      action: AuditAction.IMPORT,
      userId: context.userId,
      origin: context.origin,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      after: payload,
      metadata: { provider: input.provider, payloadHash }
    });

    await apiLogsService.record({
      provider: input.provider,
      integrationId: input.integrationId,
      direction: ApiLogDirection.INBOUND,
      endpoint: input.endpoint ?? 'raw_payload',
      httpMethod: input.httpMethod ?? 'POST',
      requestPayload: input.requestPayload,
      responseStatus: input.responseStatus,
      responsePayload: input.responsePayload,
      metadata: { source: 'payload_creation', payloadId: payload.id }
    });

    return payload;
  }

  async updateStatus(id: string, input: UpdatePayloadStatusInput, context: RequestContext) {
    const before = await this.getById(id);
    const after = await this.payloadsRepository.updateStatus(id, {
      ...input,
      processedAt: input.processedAt ?? (input.status === RawPayloadStatus.PROCESSED || input.status === RawPayloadStatus.ERROR ? new Date() : undefined)
    });

    await auditService.recordEvent({
      entity: 'raw_payloads',
      entityId: id,
      action: input.status === RawPayloadStatus.ERROR ? AuditAction.ERROR : AuditAction.PROCESS,
      userId: context.userId,
      origin: context.origin,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      before,
      after,
      metadata: { status: input.status }
    });

    return after;
  }
}

export const payloadsService = new PayloadsService();
