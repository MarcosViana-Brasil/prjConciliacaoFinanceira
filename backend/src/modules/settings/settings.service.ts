import { AuditAction } from '@prisma/client';
import { auditService } from '../auditoria/audit.service.js';
import type { RequestContext } from '../../shared/http/request-context.js';
import { maskSensitiveData } from '../../shared/security/mask-sensitive-data.js';
import { toInputJson } from '../../shared/utils/json.js';
import { SettingsRepository } from './settings.repository.js';
import type { UpsertSettingInput } from './settings.types.js';

type SettingRecord = Awaited<ReturnType<SettingsRepository['findByKey']>>;

export class SettingsService {
  constructor(private readonly settingsRepository = new SettingsRepository()) {}

  async list() {
    const settings = await this.settingsRepository.list();

    return settings.map((setting) => this.hideSensitiveValue(setting));
  }

  async upsert(key: string, input: UpsertSettingInput, context: RequestContext) {
    const before = await this.settingsRepository.findByKey(key);
    const value = input.isEncrypted ? toInputJson(maskSensitiveData(input.value)) : toInputJson(input.value);
    const after = await this.settingsRepository.upsert(key, {
      key,
      value,
      description: input.description,
      isEncrypted: input.isEncrypted ?? false,
      metadata: toInputJson(input.metadata ?? {})
    });

    await auditService.recordEvent({
      entity: 'system_settings',
      entityId: after.id,
      action: before ? AuditAction.UPDATE : AuditAction.CREATE,
      userId: context.userId,
      origin: context.origin,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      before: before ? this.hideSensitiveValue(before) : undefined,
      after: this.hideSensitiveValue(after),
      metadata: { key }
    });

    return this.hideSensitiveValue(after);
  }

  private hideSensitiveValue(setting: NonNullable<SettingRecord>) {
    return {
      ...setting,
      value: setting.isEncrypted ? '[SENSITIVE]' : setting.value
    };
  }
}

export const settingsService = new SettingsService();
