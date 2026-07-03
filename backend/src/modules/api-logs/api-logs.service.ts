import { maskSensitiveData } from '../../shared/security/mask-sensitive-data.js';
import { toInputJson } from '../../shared/utils/json.js';
import { ApiLogsRepository } from './api-logs.repository.js';
import type { ApiLogFilters, RecordApiLogInput } from './api-logs.types.js';

export class ApiLogsService {
  constructor(private readonly apiLogsRepository = new ApiLogsRepository()) {}

  async list(filters: ApiLogFilters) {
    return this.apiLogsRepository.list(filters);
  }

  async record(input: RecordApiLogInput) {
    return this.apiLogsRepository.create({
      provider: input.provider,
      integrationId: input.integrationId,
      direction: input.direction,
      endpoint: input.endpoint,
      httpMethod: input.httpMethod.toUpperCase(),
      requestHeaders: input.requestHeaders === undefined ? undefined : toInputJson(maskSensitiveData(input.requestHeaders)),
      requestPayload: input.requestPayload === undefined ? undefined : toInputJson(maskSensitiveData(input.requestPayload)),
      responseStatus: input.responseStatus,
      responsePayload: input.responsePayload === undefined ? undefined : toInputJson(maskSensitiveData(input.responsePayload)),
      durationMs: input.durationMs,
      errorMessage: input.errorMessage,
      metadata: toInputJson(maskSensitiveData(input.metadata ?? {}))
    });
  }
}

export const apiLogsService = new ApiLogsService();
