import { type Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/prisma.js';
import { buildPagination, normalizePagination } from '../../shared/utils/pagination.js';
import { normalizeDocument, normalizeMoney } from './financial-titles.utils.js';
import type { FinancialTitleFilters } from './financial-titles.types.js';

const reconciliationSelect = {
  id: true,
  status: true,
  matchLevel: true,
  score: true,
  matchedAt: true,
  ruleApplied: true
} satisfies Prisma.ReconciliationSelect;

export class FinancialTitlesRepository {
  async list(filters: FinancialTitleFilters) {
    const { page, limit, skip, take } = normalizePagination(filters);
    const where = this.buildWhere(filters);

    const [data, total] = await prisma.$transaction([
      prisma.financialTitle.findMany({
        where,
        orderBy: [{ dueDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take
      }),
      prisma.financialTitle.count({ where })
    ]);

    return { data, pagination: buildPagination(page, limit, total) };
  }

  async findById(id: string) {
    return prisma.financialTitle.findUnique({
      where: { id },
      include: {
        reconciliations: {
          select: reconciliationSelect,
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
  }

  async findActiveById(id: string) {
    return prisma.financialTitle.findFirst({
      where: { id, deletedAt: null }
    });
  }

  async findDuplicate(input: { externalId?: string | null; titleNumber: string }) {
    return prisma.financialTitle.findFirst({
      where: input.externalId
        ? {
            OR: [{ externalId: input.externalId }, { titleNumber: input.titleNumber }]
          }
        : { titleNumber: input.titleNumber }
    });
  }

  async create(data: Prisma.FinancialTitleUncheckedCreateInput) {
    return prisma.financialTitle.create({ data });
  }

  async update(id: string, data: Prisma.FinancialTitleUncheckedUpdateInput) {
    return prisma.financialTitle.update({
      where: { id },
      data
    });
  }

  async softDelete(id: string) {
    return prisma.financialTitle.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async restore(id: string) {
    return prisma.financialTitle.update({
      where: { id },
      data: { deletedAt: null }
    });
  }

  private buildWhere(filters: FinancialTitleFilters): Prisma.FinancialTitleWhereInput {
    const minAmount = normalizeMoney(filters.minAmount, 'minAmount');
    const maxAmount = normalizeMoney(filters.maxAmount, 'maxAmount');
    const normalizedDocument = normalizeDocument(filters.customerDocument);

    return {
      deletedAt: filters.onlyDeleted ? { not: null } : null,
      status: filters.status,
      customerDocument: normalizedDocument ? { contains: normalizedDocument } : undefined,
      customerName: filters.customerName ? { contains: filters.customerName, mode: 'insensitive' } : undefined,
      titleNumber: filters.titleNumber ? { contains: filters.titleNumber, mode: 'insensitive' } : undefined,
      orderNumber: filters.orderNumber ? { contains: filters.orderNumber, mode: 'insensitive' } : undefined,
      nsu: filters.nsu ? { contains: filters.nsu, mode: 'insensitive' } : undefined,
      authorizationCode: filters.authorizationCode ? { contains: filters.authorizationCode, mode: 'insensitive' } : undefined,
      tid: filters.tid ? { contains: filters.tid, mode: 'insensitive' } : undefined,
      transactionId: filters.transactionId ? { contains: filters.transactionId, mode: 'insensitive' } : undefined,
      gatewayProvider: filters.gatewayProvider,
      dueDate:
        filters.dueDateStart || filters.dueDateEnd
          ? {
              gte: filters.dueDateStart,
              lte: filters.dueDateEnd
            }
          : undefined,
      issueDate:
        filters.issueDateStart || filters.issueDateEnd
          ? {
              gte: filters.issueDateStart,
              lte: filters.issueDateEnd
            }
          : undefined,
      grossAmount:
        minAmount || maxAmount
          ? {
              gte: minAmount,
              lte: maxAmount
            }
          : undefined,
      OR: filters.search
        ? [
            { titleNumber: { contains: filters.search, mode: 'insensitive' } },
            { customerName: { contains: filters.search, mode: 'insensitive' } },
            { customerDocument: { contains: normalizeDocument(filters.search) ?? filters.search } },
            { orderNumber: { contains: filters.search, mode: 'insensitive' } },
            { nsu: { contains: filters.search, mode: 'insensitive' } },
            { authorizationCode: { contains: filters.search, mode: 'insensitive' } },
            { tid: { contains: filters.search, mode: 'insensitive' } },
            { transactionId: { contains: filters.search, mode: 'insensitive' } }
          ]
        : undefined
    };
  }
}
