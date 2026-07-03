import { FinancialTitleStatus, Prisma } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError.js';

export type FinancialStatusInput = {
  grossAmount: Prisma.Decimal;
  paidAmount?: Prisma.Decimal | null;
  currentStatus?: FinancialTitleStatus;
};

export function normalizeDocument(document?: string | null) {
  return document ? document.replace(/\D/g, '') : document;
}

export function normalizeMoney(value: string | number | Prisma.Decimal | null | undefined, fieldName: string) {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const normalized = value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);

  if (!normalized.isFinite()) {
    throw new AppError(`Valor monetario invalido para ${fieldName}`, 400, 'INVALID_MONEY_VALUE', { field: fieldName });
  }

  return normalized.toDecimalPlaces(2);
}

export function requireMoney(value: string | number | Prisma.Decimal | null | undefined, fieldName: string) {
  const decimal = normalizeMoney(value, fieldName);

  if (!decimal) {
    throw new AppError(`Valor monetario obrigatorio para ${fieldName}`, 400, 'REQUIRED_MONEY_VALUE', { field: fieldName });
  }

  return decimal;
}

export function ensureNonNegative(value: Prisma.Decimal | undefined, fieldName: string) {
  if (value && value.isNegative()) {
    throw new AppError(`${fieldName} nao pode ser negativo`, 400, 'NEGATIVE_MONEY_VALUE', { field: fieldName });
  }
}

export function ensurePositive(value: Prisma.Decimal, fieldName: string) {
  if (value.lessThanOrEqualTo(0)) {
    throw new AppError(`${fieldName} deve ser maior que zero`, 400, 'INVALID_POSITIVE_MONEY_VALUE', { field: fieldName });
  }
}

export function validateInstallments(installmentNumber?: number | null, totalInstallments?: number | null) {
  if (installmentNumber !== undefined && installmentNumber !== null && installmentNumber < 1) {
    throw new AppError('installmentNumber deve ser maior ou igual a 1', 400, 'INVALID_INSTALLMENT_NUMBER');
  }

  if (
    installmentNumber !== undefined &&
    installmentNumber !== null &&
    totalInstallments !== undefined &&
    totalInstallments !== null &&
    totalInstallments < installmentNumber
  ) {
    throw new AppError('totalInstallments deve ser maior ou igual a installmentNumber', 400, 'INVALID_TOTAL_INSTALLMENTS');
  }
}

export function calculateFinancialTitleStatus(input: FinancialStatusInput) {
  if (input.currentStatus === FinancialTitleStatus.CANCELED) {
    return FinancialTitleStatus.CANCELED;
  }

  const paidAmount = input.paidAmount ?? new Prisma.Decimal(0);

  if (paidAmount.greaterThanOrEqualTo(input.grossAmount)) {
    return FinancialTitleStatus.PAID;
  }

  if (paidAmount.greaterThan(0) && paidAmount.lessThan(input.grossAmount)) {
    return FinancialTitleStatus.PARTIALLY_PAID;
  }

  return FinancialTitleStatus.OPEN;
}
