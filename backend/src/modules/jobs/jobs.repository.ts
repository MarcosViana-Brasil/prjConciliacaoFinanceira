import type { Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/prisma.js';
import { buildPagination, normalizePagination } from '../../shared/utils/pagination.js';
import type { FinishJobInput, JobFilters } from './jobs.types.js';

export class JobsRepository {
  async list(filters: JobFilters) {
    const { page, limit, skip, take } = normalizePagination(filters);
    const where: Prisma.JobExecutionWhereInput = {
      jobName: filters.jobName ? { contains: filters.jobName, mode: 'insensitive' } : undefined,
      status: filters.status,
      startedAt:
        filters.startDate || filters.endDate
          ? {
              gte: filters.startDate,
              lte: filters.endDate
            }
          : undefined
    };

    const [data, total] = await prisma.$transaction([
      prisma.jobExecution.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.jobExecution.count({ where })
    ]);

    return { data, pagination: buildPagination(page, limit, total) };
  }

  async create(data: Prisma.JobExecutionCreateInput) {
    return prisma.jobExecution.create({ data });
  }

  async findById(id: string) {
    return prisma.jobExecution.findUnique({ where: { id } });
  }

  async finish(id: string, input: Omit<FinishJobInput, 'metadata'> & { finishedAt: Date; durationMs?: number; metadata?: Prisma.InputJsonValue }) {
    return prisma.jobExecution.update({
      where: { id },
      data: {
        status: input.status,
        finishedAt: input.finishedAt,
        durationMs: input.durationMs,
        processedCount: input.processedCount,
        successCount: input.successCount,
        errorCount: input.errorCount,
        errorMessage: input.errorMessage,
        metadata: input.metadata
      }
    });
  }

}
