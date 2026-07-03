import type { Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/prisma.js';
import { buildPagination, normalizePagination } from '../../shared/utils/pagination.js';
import type { ApiLogFilters } from './api-logs.types.js';

export class ApiLogsRepository {
  async list(filters: ApiLogFilters) {
    const { page, limit, skip, take } = normalizePagination(filters);
    const where: Prisma.ApiLogWhereInput = {
      provider: filters.provider,
      direction: filters.direction,
      endpoint: filters.endpoint ? { contains: filters.endpoint, mode: 'insensitive' } : undefined,
      responseStatus: filters.responseStatus,
      createdAt:
        filters.startDate || filters.endDate
          ? {
              gte: filters.startDate,
              lte: filters.endDate
            }
          : undefined
    };

    const [data, total] = await prisma.$transaction([
      prisma.apiLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.apiLog.count({ where })
    ]);

    return { data, pagination: buildPagination(page, limit, total) };
  }

  async create(data: Prisma.ApiLogUncheckedCreateInput) {
    return prisma.apiLog.create({ data });
  }
}
