import type { Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/prisma.js';
import { buildPagination, normalizePagination } from '../../shared/utils/pagination.js';
import type { PayloadFilters, UpdatePayloadStatusInput } from './payloads.types.js';

export class PayloadsRepository {
  async list(filters: PayloadFilters) {
    const { page, limit, skip, take } = normalizePagination(filters);
    const where: Prisma.RawPayloadWhereInput = {
      provider: filters.provider,
      status: filters.status,
      endpoint: filters.endpoint ? { contains: filters.endpoint, mode: 'insensitive' } : undefined,
      receivedAt:
        filters.startDate || filters.endDate
          ? {
              gte: filters.startDate,
              lte: filters.endDate
            }
          : undefined
    };

    const [data, total] = await prisma.$transaction([
      prisma.rawPayload.findMany({
        where,
        orderBy: { receivedAt: 'desc' },
        skip,
        take
      }),
      prisma.rawPayload.count({ where })
    ]);

    return { data, pagination: buildPagination(page, limit, total) };
  }

  async findById(id: string) {
    return prisma.rawPayload.findUnique({ where: { id } });
  }

  async findByHash(payloadHash: string) {
    return prisma.rawPayload.findUnique({ where: { payloadHash } });
  }

  async create(data: Prisma.RawPayloadUncheckedCreateInput) {
    return prisma.rawPayload.create({ data });
  }

  async updateStatus(id: string, data: UpdatePayloadStatusInput) {
    return prisma.rawPayload.update({
      where: { id },
      data
    });
  }
}
