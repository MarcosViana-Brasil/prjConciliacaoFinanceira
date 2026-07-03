import { getArrayPayload, mapRedeReceivableStatus, mapRedeTransactionStatus, readDate, readMoney, readNumber, readString } from './rede.utils.js';
import type { NormalizedRedeReceivable, NormalizedRedeTransaction } from './rede.types.js';

export function normalizeRedeTransactions(payload: unknown): NormalizedRedeTransaction[] {
  const items = getArrayPayload(payload, ['transactions', 'items', 'data', 'results']);
  const normalized: NormalizedRedeTransaction[] = [];

  for (const item of items) {
    if (!item || typeof item !== 'object') continue;

    const record = item as Record<string, unknown>;
    const transactionId = readString(record, 'transactionId') ?? readString(record, 'id');
    const grossAmount = readMoney(record, 'grossAmount') ?? readMoney(record, 'amount');

    if (!transactionId || !grossAmount) continue;

    normalized.push({
      transactionId,
      tid: readString(record, 'tid'),
      nsu: readString(record, 'nsu'),
      authorizationCode: readString(record, 'authorizationCode'),
      orderNumber: readString(record, 'orderNumber'),
      saleDate: readDate(record, 'saleDate'),
      captureDate: readDate(record, 'captureDate'),
      grossAmount,
      netAmount: readMoney(record, 'netAmount'),
      feeAmount: readMoney(record, 'feeAmount'),
      installmentNumber: readNumber(record, 'installmentNumber'),
      totalInstallments: readNumber(record, 'totalInstallments'),
      brand: readString(record, 'brand'),
      paymentMethod: normalizePaymentMethod(readString(record, 'paymentMethod')),
      status: mapRedeTransactionStatus(readString(record, 'status') ?? ''),
      establishmentCode: readString(record, 'establishmentCode'),
      metadata: { raw: record }
    });
  }

  return normalized;
}

export function normalizeRedeReceivables(payload: unknown): NormalizedRedeReceivable[] {
  const items = getArrayPayload(payload, ['receivables', 'items', 'data', 'results']);
  const normalized: NormalizedRedeReceivable[] = [];

  for (const item of items) {
    if (!item || typeof item !== 'object') continue;

    const record = item as Record<string, unknown>;
    const transactionId = readString(record, 'transactionId') ?? readString(record, 'id');
    const grossAmount = readMoney(record, 'grossAmount') ?? readMoney(record, 'amount');

    if (!transactionId || !grossAmount) continue;

    normalized.push({
      transactionId,
      nsu: readString(record, 'nsu'),
      authorizationCode: readString(record, 'authorizationCode'),
      expectedPaymentDate: readDate(record, 'expectedPaymentDate'),
      actualPaymentDate: readDate(record, 'actualPaymentDate'),
      grossAmount,
      netAmount: readMoney(record, 'netAmount'),
      feeAmount: readMoney(record, 'feeAmount'),
      adjustmentAmount: readMoney(record, 'adjustmentAmount'),
      installmentNumber: readNumber(record, 'installmentNumber'),
      totalInstallments: readNumber(record, 'totalInstallments'),
      status: mapRedeReceivableStatus(readString(record, 'status') ?? ''),
      bankCode: readString(record, 'bankCode'),
      agency: readString(record, 'agency'),
      account: readString(record, 'account'),
      metadata: { raw: record }
    });
  }

  return normalized;
}

function normalizePaymentMethod(value?: string) {
  return value?.trim().toUpperCase();
}
