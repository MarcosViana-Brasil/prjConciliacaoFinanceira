import { Prisma, type RedeReceivable, type RedeTransaction } from '@prisma/client';
import { prisma } from '../../../shared/database/prisma.js';
import { toInputJson } from '../../../shared/utils/json.js';
import { buildPagination, normalizePagination } from '../../../shared/utils/pagination.js';
import type { NormalizedRedeReceivable, NormalizedRedeTransaction, RedeReceivableFilters, RedeTransactionFilters } from './rede.types.js';

export class RedeRepository {
  async upsertTransaction(data: NormalizedRedeTransaction & { rawPayloadId?: string }) {
    const existing = await this.findExistingTransaction(data);
    const payload = this.transactionPayload(data);

    if (existing) {
      const updated = await prisma.redeTransaction.update({
        where: { id: existing.id },
        data: payload
      });
      return { record: updated, created: false };
    }

    const created = await prisma.redeTransaction.create({ data: payload });
    return { record: created, created: true };
  }

  async upsertReceivable(data: NormalizedRedeReceivable & { rawPayloadId?: string }) {
    const existing = await this.findExistingReceivable(data);
    const payload = this.receivablePayload(data);

    if (existing) {
      const updated = await prisma.redeReceivable.update({
        where: { id: existing.id },
        data: payload
      });
      return { record: updated, created: false };
    }

    const created = await prisma.redeReceivable.create({ data: payload });
    return { record: created, created: true };
  }

  async listTransactions(filters: RedeTransactionFilters) {
    const { page, limit, skip, take } = normalizePagination(filters);
    const where: Prisma.RedeTransactionWhereInput = {
      nsu: filters.nsu ? { contains: filters.nsu, mode: 'insensitive' } : undefined,
      authorizationCode: filters.authorizationCode ? { contains: filters.authorizationCode, mode: 'insensitive' } : undefined,
      transactionId: filters.transactionId ? { contains: filters.transactionId, mode: 'insensitive' } : undefined,
      tid: filters.tid ? { contains: filters.tid, mode: 'insensitive' } : undefined,
      orderNumber: filters.orderNumber ? { contains: filters.orderNumber, mode: 'insensitive' } : undefined,
      status: filters.status,
      saleDate:
        filters.saleDateStart || filters.saleDateEnd
          ? {
              gte: filters.saleDateStart,
              lte: filters.saleDateEnd
            }
          : undefined,
      grossAmount: this.amountWhere(filters.minAmount, filters.maxAmount)
    };
    const [data, total] = await prisma.$transaction([
      prisma.redeTransaction.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.redeTransaction.count({ where })
    ]);

    return { data, pagination: buildPagination(page, limit, total) };
  }

  async listReceivables(filters: RedeReceivableFilters) {
    const { page, limit, skip, take } = normalizePagination(filters);
    const where: Prisma.RedeReceivableWhereInput = {
      nsu: filters.nsu ? { contains: filters.nsu, mode: 'insensitive' } : undefined,
      authorizationCode: filters.authorizationCode ? { contains: filters.authorizationCode, mode: 'insensitive' } : undefined,
      transactionId: filters.transactionId ? { contains: filters.transactionId, mode: 'insensitive' } : undefined,
      status: filters.status,
      expectedPaymentDate:
        filters.expectedPaymentDateStart || filters.expectedPaymentDateEnd
          ? {
              gte: filters.expectedPaymentDateStart,
              lte: filters.expectedPaymentDateEnd
            }
          : undefined,
      actualPaymentDate:
        filters.actualPaymentDateStart || filters.actualPaymentDateEnd
          ? {
              gte: filters.actualPaymentDateStart,
              lte: filters.actualPaymentDateEnd
            }
          : undefined,
      grossAmount: this.amountWhere(filters.minAmount, filters.maxAmount)
    };
    const [data, total] = await prisma.$transaction([
      prisma.redeReceivable.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.redeReceivable.count({ where })
    ]);

    return { data, pagination: buildPagination(page, limit, total) };
  }

  async findTransactionById(id: string) {
    return prisma.redeTransaction.findUnique({ where: { id } });
  }

  async findReceivableById(id: string) {
    return prisma.redeReceivable.findUnique({ where: { id } });
  }

  private async findExistingTransaction(data: NormalizedRedeTransaction) {
    if (data.transactionId) {
      const found = await prisma.redeTransaction.findFirst({
        where: { transactionId: data.transactionId, installmentNumber: data.installmentNumber }
      });
      if (found) return found;
    }

    if (data.tid) {
      const found = await prisma.redeTransaction.findFirst({ where: { tid: data.tid } });
      if (found) return found;
    }

    return prisma.redeTransaction.findFirst({
      where: {
        nsu: data.nsu,
        authorizationCode: data.authorizationCode,
        grossAmount: new Prisma.Decimal(data.grossAmount),
        saleDate: data.saleDate
      }
    });
  }

  private async findExistingReceivable(data: NormalizedRedeReceivable) {
    const expectedPaymentDate = data.expectedPaymentDate ?? null;
    const byTransaction = await prisma.redeReceivable.findFirst({
      where: {
        transactionId: data.transactionId,
        installmentNumber: data.installmentNumber,
        expectedPaymentDate
      }
    });

    if (byTransaction) return byTransaction;

    return prisma.redeReceivable.findFirst({
      where: {
        nsu: data.nsu,
        authorizationCode: data.authorizationCode,
        installmentNumber: data.installmentNumber,
        expectedPaymentDate
      }
    });
  }

  private transactionPayload(data: NormalizedRedeTransaction & { rawPayloadId?: string }): Prisma.RedeTransactionUncheckedCreateInput {
    return {
      rawPayloadId: data.rawPayloadId,
      transactionId: data.transactionId,
      tid: data.tid,
      nsu: data.nsu,
      authorizationCode: data.authorizationCode,
      orderNumber: data.orderNumber,
      saleDate: data.saleDate,
      captureDate: data.captureDate,
      grossAmount: new Prisma.Decimal(data.grossAmount),
      netAmount: data.netAmount ? new Prisma.Decimal(data.netAmount) : undefined,
      feeAmount: data.feeAmount ? new Prisma.Decimal(data.feeAmount) : undefined,
      installmentNumber: data.installmentNumber,
      totalInstallments: data.totalInstallments,
      brand: data.brand,
      paymentMethod: data.paymentMethod,
      status: data.status,
      establishmentCode: data.establishmentCode,
      metadata: toInputJson(data.metadata)
    };
  }

  private receivablePayload(data: NormalizedRedeReceivable & { rawPayloadId?: string }): Prisma.RedeReceivableUncheckedCreateInput {
    return {
      rawPayloadId: data.rawPayloadId,
      transactionId: data.transactionId,
      nsu: data.nsu,
      authorizationCode: data.authorizationCode,
      expectedPaymentDate: data.expectedPaymentDate,
      actualPaymentDate: data.actualPaymentDate,
      grossAmount: new Prisma.Decimal(data.grossAmount),
      netAmount: data.netAmount ? new Prisma.Decimal(data.netAmount) : undefined,
      feeAmount: data.feeAmount ? new Prisma.Decimal(data.feeAmount) : undefined,
      adjustmentAmount: data.adjustmentAmount ? new Prisma.Decimal(data.adjustmentAmount) : undefined,
      installmentNumber: data.installmentNumber,
      totalInstallments: data.totalInstallments,
      status: data.status,
      bankCode: data.bankCode,
      agency: data.agency,
      account: data.account,
      metadata: toInputJson(data.metadata)
    };
  }

  private amountWhere(minAmount?: string | number, maxAmount?: string | number) {
    if (minAmount === undefined && maxAmount === undefined) return undefined;

    return {
      gte: minAmount === undefined ? undefined : new Prisma.Decimal(minAmount),
      lte: maxAmount === undefined ? undefined : new Prisma.Decimal(maxAmount)
    };
  }
}
