import {
  DivergenceSeverity,
  FinancialTitleStatus,
  ItauBoletoMovementType,
  Prisma,
  ReconciliationDivergenceType,
  ReconciliationMatchLevel,
  ReconciliationStatus
} from '@prisma/client';
import { prisma } from '../../../shared/database/prisma.js';
import { toInputJson } from '../../../shared/utils/json.js';
import type { NormalizedItauBoleto, NormalizedItauBoletoMovement } from './itau-boleto.types.js';

export class ItauBoletoRepository {
  async upsertBoleto(data: NormalizedItauBoleto & { rawPayloadId?: string }) {
    const existing = await prisma.itauBoleto.findFirst({
      where: {
        beneficiaryId: data.beneficiaryId,
        walletCode: data.walletCode ?? null,
        ourNumber: data.ourNumber
      }
    });
    const payload = this.boletoPayload(data);

    if (existing) {
      const updated = await prisma.itauBoleto.update({ where: { id: existing.id }, data: payload });
      return { record: updated, created: false };
    }

    const created = await prisma.itauBoleto.create({ data: payload });
    return { record: created, created: true };
  }

  async upsertMovement(data: NormalizedItauBoletoMovement & { rawPayloadId?: string }) {
    const existing = await prisma.itauBoletoMovement.findFirst({
      where: {
        movementDate: data.movementDate,
        walletCode: data.walletCode ?? null,
        ourNumber: data.ourNumber,
        yourNumber: data.yourNumber ?? null,
        movementType: data.movementType,
        titleSequence: data.titleSequence ?? null
      }
    });
    const payload = this.movementPayload(data);

    if (existing) {
      const updated = await prisma.itauBoletoMovement.update({ where: { id: existing.id }, data: payload });
      return { record: updated, created: false };
    }

    const created = await prisma.itauBoletoMovement.create({ data: payload });
    return { record: created, created: true };
  }

  async findMovementsForReconciliation(input: { startDate: Date; endDate: Date; movementType?: ItauBoletoMovementType }) {
    return prisma.itauBoletoMovement.findMany({
      where: {
        movementDate: { gte: input.startDate, lte: input.endDate },
        movementType: input.movementType ?? ItauBoletoMovementType.LIQUIDATION
      },
      orderBy: { movementDate: 'asc' }
    });
  }

  async findFinancialTitleForMovement(input: { ourNumber: string; yourNumber?: string | null }) {
    const identifiers = [input.yourNumber, input.ourNumber].filter((value): value is string => Boolean(value?.trim()));

    if (!identifiers.length) return null;

    return prisma.financialTitle.findFirst({
      where: {
        deletedAt: null,
        OR: identifiers.flatMap((identifier) => [
          { titleNumber: identifier },
          { externalId: identifier },
          { orderNumber: identifier },
          { gatewayReference: identifier },
          { transactionId: identifier }
        ])
      },
      orderBy: [{ gatewayProvider: 'asc' }, { dueDate: 'asc' }]
    });
  }

  async findActiveReconciliationForMovement(movementId: string) {
    return prisma.reconciliation.findFirst({
      where: {
        provider: 'ITAU',
        deletedAt: null,
        status: { notIn: [ReconciliationStatus.REVERSED, ReconciliationStatus.CANCELED] },
        metadata: { path: ['itauBoletoMovementId'], equals: movementId }
      }
    });
  }

  async reconcileMovement(input: {
    movementId: string;
    financialTitleId: string;
    grossAmountDiff?: Prisma.Decimal;
    netAmountDiff?: Prisma.Decimal;
    dateDiffDays?: number;
    status: ReconciliationStatus;
    matchLevel: ReconciliationMatchLevel;
    score: number;
    ruleApplied: string;
    metadata: Record<string, unknown>;
    divergence?: {
      description: string;
      expectedValue?: unknown;
      actualValue?: unknown;
    };
    paidAmount?: Prisma.Decimal;
    paidAt?: Date | null;
  }) {
    return prisma.$transaction(async (tx) => {
      const reconciliation = await tx.reconciliation.create({
        data: {
          financialTitleId: input.financialTitleId,
          provider: 'ITAU',
          status: input.status,
          matchLevel: input.matchLevel,
          score: input.score,
          matchedBy: input.status === ReconciliationStatus.MATCHED_AUTOMATICALLY ? 'system' : undefined,
          matchedAt: input.status === ReconciliationStatus.MATCHED_AUTOMATICALLY ? new Date() : undefined,
          grossAmountDiff: input.grossAmountDiff,
          netAmountDiff: input.netAmountDiff,
          dateDiffDays: input.dateDiffDays,
          ruleApplied: input.ruleApplied,
          metadata: toInputJson({ ...input.metadata, itauBoletoMovementId: input.movementId })
        }
      });

      if (input.divergence) {
        await tx.reconciliationDivergence.create({
          data: {
            reconciliationId: reconciliation.id,
            financialTitleId: input.financialTitleId,
            divergenceType: ReconciliationDivergenceType.VALUE_DIFFERENCE,
            description: input.divergence.description,
            expectedValue: input.divergence.expectedValue === undefined ? undefined : toInputJson(input.divergence.expectedValue),
            actualValue: input.divergence.actualValue === undefined ? undefined : toInputJson(input.divergence.actualValue),
            severity: DivergenceSeverity.HIGH,
            metadata: toInputJson({ itauBoletoMovementId: input.movementId })
          }
        });
      }

      if (input.status === ReconciliationStatus.MATCHED_AUTOMATICALLY) {
        await tx.financialTitle.update({
          where: { id: input.financialTitleId },
          data: {
            status: FinancialTitleStatus.RECONCILED,
            paidAmount: input.paidAmount,
            paidAt: input.paidAt ?? new Date()
          }
        });
      }

      return reconciliation;
    });
  }

  private boletoPayload(data: NormalizedItauBoleto & { rawPayloadId?: string }): Prisma.ItauBoletoUncheckedCreateInput {
    return {
      rawPayloadId: data.rawPayloadId,
      boletoId: data.boletoId,
      beneficiaryId: data.beneficiaryId,
      walletCode: data.walletCode,
      ourNumber: data.ourNumber,
      ourNumberDigit: data.ourNumberDigit,
      yourNumber: data.yourNumber,
      marketIdentifier: data.marketIdentifier,
      barcode: data.barcode,
      digitableLine: data.digitableLine,
      payerName: data.payerName,
      payerDocument: data.payerDocument,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      paymentLimitDate: data.paymentLimitDate,
      amount: data.amount ? new Prisma.Decimal(data.amount) : undefined,
      paidAmount: data.paidAmount ? new Prisma.Decimal(data.paidAmount) : undefined,
      paymentDate: data.paymentDate,
      status: data.status,
      chargeType: data.chargeType,
      hasPixQrCode: data.hasPixQrCode,
      txid: data.txid,
      pixEmv: data.pixEmv,
      metadata: toInputJson(data.metadata)
    };
  }

  private movementPayload(data: NormalizedItauBoletoMovement & { rawPayloadId?: string }): Prisma.ItauBoletoMovementUncheckedCreateInput {
    return {
      rawPayloadId: data.rawPayloadId,
      movementDate: data.movementDate,
      titleWalletMovementDate: data.titleWalletMovementDate,
      inclusionDate: data.inclusionDate,
      dueDate: data.dueDate,
      agency: data.agency,
      account: data.account,
      beneficiaryAccountDigit: data.beneficiaryAccountDigit,
      beneficiaryId: data.beneficiaryId,
      walletCode: data.walletCode,
      ourNumber: data.ourNumber,
      ourNumberDigit: data.ourNumberDigit,
      yourNumber: data.yourNumber,
      titleSequence: data.titleSequence,
      payerName: data.payerName,
      receiverAgency: data.receiverAgency,
      statusCode: data.statusCode,
      movementType: data.movementType,
      chargeType: data.chargeType,
      amount: data.amount ? new Prisma.Decimal(data.amount) : undefined,
      netAmount: data.netAmount ? new Prisma.Decimal(data.netAmount) : undefined,
      increaseAmount: data.increaseAmount ? new Prisma.Decimal(data.increaseAmount) : undefined,
      decreaseAmount: data.decreaseAmount ? new Prisma.Decimal(data.decreaseAmount) : undefined,
      hasCreditSplit: data.hasCreditSplit,
      metadata: toInputJson(data.metadata)
    };
  }
}
