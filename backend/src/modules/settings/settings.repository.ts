import type { Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/prisma.js';

export class SettingsRepository {
  async list() {
    return prisma.systemSetting.findMany({ orderBy: { key: 'asc' } });
  }

  async findByKey(key: string) {
    return prisma.systemSetting.findUnique({ where: { key } });
  }

  async upsert(key: string, data: Prisma.SystemSettingUncheckedCreateInput) {
    return prisma.systemSetting.upsert({
      where: { key },
      update: {
        value: data.value,
        description: data.description,
        isEncrypted: data.isEncrypted,
        metadata: data.metadata
      },
      create: data
    });
  }
}
