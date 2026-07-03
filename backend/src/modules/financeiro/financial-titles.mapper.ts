import type { FinancialTitle, Prisma } from '@prisma/client';

type FinancialTitleWithRelations = FinancialTitle & {
  reconciliations?: Array<{
    id: string;
    status: string;
    matchLevel: string;
    score: number;
    matchedAt: Date | null;
    ruleApplied: string | null;
  }>;
};

export function mapFinancialTitle(title: FinancialTitleWithRelations) {
  return {
    ...title,
    grossAmount: decimalToString(title.grossAmount),
    netAmountExpected: decimalToNullableString(title.netAmountExpected),
    paidAmount: decimalToNullableString(title.paidAmount),
    reconciliations: title.reconciliations
  };
}

function decimalToString(value: Prisma.Decimal) {
  return value.toFixed(2);
}

function decimalToNullableString(value: Prisma.Decimal | null) {
  return value ? value.toFixed(2) : null;
}
