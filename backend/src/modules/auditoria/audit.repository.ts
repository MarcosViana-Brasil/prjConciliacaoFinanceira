import type { Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/prisma.js';
import { buildPagination, normalizePagination } from '../../shared/utils/pagination.js';
import type { AuditEventFilters, AuditEventRecordInput } from './audit.types.js';

export class AuditRepository {
  async create(data: Prisma.AuditEventCreateInput) {
    return prisma.auditEvent.create({ data });
  }

  async list(filters: AuditEventFilters) {
    const { page, limit, skip, take } = normalizePagination(filters);
    const where: Prisma.AuditEventWhereInput = {
      entity: filters.entity,
      entityId: filters.entityId,
      action: filters.action,
      userId: filters.userId,
      createdAt:
        filters.startDate || filters.endDate
          ? {
              gte: filters.startDate,
              lte: filters.endDate
            }
          : undefined
    };

    const [data, total] = await prisma.$transaction([
      prisma.auditEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.auditEvent.count({ where })
    ]);

    return { data, pagination: buildPagination(page, limit, total) };
  }

  async listByEntity(entity: string, entityId: string) {
    return prisma.auditEvent.findMany({
      where: { entity, entityId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
