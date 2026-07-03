import {
  FinancialTitleStatus,
  Prisma,
  ReconciliationStatus,
  type GatewayProvider,
  type ReconciliationDivergence
} from '@prisma/client';
import { prisma } from '../../shared/database/prisma.js';
import { toInputJson } from '../../shared/utils/json.js';
import { buildPagination, normalizePagination } from '../../shared/utils/pagination.js';
import type {
  DivergenceFilters,
  ReconciliationDifference,
  ReconciliationFilters,
  RunReconciliationInput
} from './reconciliation.types.js';

export class ReconciliationRepository {
  async findTitlesForRun(input: RunReconciliationInput) {
    return prisma.financialTitle.findMany({
      where: {
        deletedAt: null,
        gatewayProvider: input.gatewayProvider,
        status: {
          in: [FinancialTitleStatus.OPEN, FinancialTitleStatus.PARTIALLY_PAID, FinancialTitleStatus.PAID]
        },
        OR: [
          { dueDate: { gte: input.startDate, lte: input.endDate } },
          { issueDate: { gte: input.startDate, lte: input.endDate } }
        ]
      },
      orderBy: { dueDate: 'asc' }
    });
  }

  async findCandidates(input: RunReconciliationInput) {
    const [transactions, receivables] = await prisma.$transaction([
      prisma.redeTransaction.findMany({
        where: {
          saleDate: { gte: input.startDate, lte: input.endDate }
        }
      }),
      prisma.redeReceivable.findMany({
        where: {
          expectedPaymentDate: { gte: input.startDate, lte: input.endDate }
        }
      })
    ]);

    return { transactions, receivables };
  }

  async findActiveForPair(input: { financialTitleId?: string; redeTransactionId?: string; redeReceivableId?: string }) {
    return prisma.reconciliation.findFirst({
      where: {
        financialTitleId: input.financialTitleId,
        redeTransactionId: input.redeTransactionId,
        redeReceivableId: input.redeReceivableId,
        status: { notIn: [ReconciliationStatus.REVERSED, ReconciliationStatus.CANCELED] },
        deletedAt: null
      }
    });
  }

  async hasActiveReceivableReconciliation(redeReceivableId: string) {
    const count = await prisma.reconciliation.count({
      where: {
        redeReceivableId,
        status: { in: [ReconciliationStatus.MATCHED_AUTOMATICALLY, ReconciliationStatus.MATCHED_MANUALLY] },
        deletedAt: null
      }
    });

    return count > 0;
  }

  async createReconciliation(data: Prisma.ReconciliationUncheckedCreateInput, differences: ReconciliationDifference[]) {
    return prisma.$transaction(async (tx) => {
      const reconciliation = await tx.reconciliation.create({ data });

      if (differences.length) {
        await tx.reconciliationDivergence.createMany({
          data: differences.map((difference) => ({
            reconciliationId: reconciliation.id,
            financialTitleId: data.financialTitleId,
            redeReceivableId: data.redeReceivableId,
            divergenceType: difference.type,
            description: difference.description,
            expectedValue: difference.expectedValue === undefined ? undefined : toInputJson(difference.expectedValue),
            actualValue: difference.actualValue === undefined ? undefined : toInputJson(difference.actualValue),
            severity: difference.severity,
            metadata: {}
          }))
        });
      }

      return reconciliation;
    });
  }

  async updateReconciliation(id: string, data: Prisma.ReconciliationUncheckedUpdateInput) {
    return prisma.reconciliation.update({
      where: { id },
      data
    });
  }

  async updateFinancialTitle(id: string, data: Prisma.FinancialTitleUncheckedUpdateInput) {
    return prisma.financialTitle.update({
      where: { id },
      data
    });
  }

  async resolveDivergences(reconciliationId: string, resolvedBy?: string, resolutionNote?: string) {
    return prisma.reconciliationDivergence.updateMany({
      where: { reconciliationId, resolved: false },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy,
        resolutionNote
      }
    });
  }

  async findById(id: string) {
    return prisma.reconciliation.findUnique({
      where: { id },
      include: {
        financialTitle: true,
        redeTransaction: true,
        redeReceivable: true,
        divergences: { orderBy: { createdAt: 'desc' } }
      }
    });
  }

  async list(filters: ReconciliationFilters) {
    const { page, limit, skip, take } = normalizePagination(filters);
    const where: Prisma.ReconciliationWhereInput = {
      status: filters.status,
      matchLevel: filters.matchLevel,
      provider: filters.gatewayProvider,
      financialTitleId: filters.financialTitleId,
      redeTransactionId: filters.redeTransactionId,
      redeReceivableId: filters.redeReceivableId,
      score:
        filters.minScore !== undefined || filters.maxScore !== undefined
          ? {
              gte: filters.minScore,
              lte: filters.maxScore
            }
          : undefined,
      createdAt:
        filters.startDate || filters.endDate
          ? {
              gte: filters.startDate,
              lte: filters.endDate
            }
          : undefined
    };
    const [data, total] = await prisma.$transaction([
      prisma.reconciliation.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.reconciliation.count({ where })
    ]);

    return { data, pagination: buildPagination(page, limit, total) };
  }

  async listDivergences(filters: DivergenceFilters) {
    const { page, limit, skip, take } = normalizePagination(filters);
    const where: Prisma.ReconciliationDivergenceWhereInput = {
      divergenceType: filters.divergenceType,
      severity: filters.severity,
      resolved: filters.resolved,
      financialTitleId: filters.financialTitleId,
      redeReceivableId: filters.redeReceivableId
    };
    const [data, total] = await prisma.$transaction([
      prisma.reconciliationDivergence.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.reconciliationDivergence.count({ where })
    ]);

    return { data, pagination: buildPagination(page, limit, total) };
  }
}

export type ReconciliationWithDetails = NonNullable<Awaited<ReturnType<ReconciliationRepository['findById']>>>;
export type PersistedDivergence = ReconciliationDivergence;
