import type { Prisma, Reconciliation } from '@prisma/client';

export function mapReconciliation(reconciliation: Reconciliation) {
  return {
    ...reconciliation,
    grossAmountDiff: decimalToNullableString(reconciliation.grossAmountDiff),
    netAmountDiff: decimalToNullableString(reconciliation.netAmountDiff)
  };
}

function decimalToNullableString(value: Prisma.Decimal | null) {
  return value ? value.toFixed(2) : null;
}
