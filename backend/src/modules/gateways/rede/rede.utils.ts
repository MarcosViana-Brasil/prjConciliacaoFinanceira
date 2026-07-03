import { ReceivableStatus, RedeTransactionStatus } from '@prisma/client';

export function mapRedeTransactionStatus(status: string): RedeTransactionStatus {
  const normalized = status.trim().toUpperCase();

  if (['AUTHORIZED', 'AUTORIZADA'].includes(normalized)) return RedeTransactionStatus.AUTHORIZED;
  if (['CAPTURED', 'CAPTURADA', 'APPROVED', 'APROVADA'].includes(normalized)) return RedeTransactionStatus.CAPTURED;
  if (['CANCELED', 'CANCELLED', 'CANCELADA'].includes(normalized)) return RedeTransactionStatus.CANCELED;
  if (['REFUNDED', 'ESTORNADA', 'ESTORNO'].includes(normalized)) return RedeTransactionStatus.REFUNDED;
  if (['CHARGEBACK'].includes(normalized)) return RedeTransactionStatus.CHARGEBACK;

  return RedeTransactionStatus.UNKNOWN;
}

export function mapRedeReceivableStatus(status: string): ReceivableStatus {
  const normalized = status.trim().toUpperCase();

  if (['PENDING', 'PENDENTE'].includes(normalized)) return ReceivableStatus.PENDING;
  if (['PAID', 'PAGO', 'LIQUIDADO'].includes(normalized)) return ReceivableStatus.PAID;
  if (['CANCELED', 'CANCELLED', 'CANCELADO'].includes(normalized)) return ReceivableStatus.CANCELED;
  if (['ANTICIPATED', 'ANTECIPADO'].includes(normalized)) return ReceivableStatus.ANTICIPATED;
  if (['ADJUSTED', 'AJUSTADO'].includes(normalized)) return ReceivableStatus.ADJUSTED;

  return ReceivableStatus.UNKNOWN;
}

export function toIsoDateParam(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

export function getArrayPayload(payload: unknown, keys: string[]) {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === 'object') {
    for (const key of keys) {
      const value = (payload as Record<string, unknown>)[key];

      if (Array.isArray(value)) return value;
    }
  }

  return [];
}

export function readString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function readNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function readDate(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value !== 'string' || !value.trim()) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function readMoney(record: Record<string, unknown>, key: string) {
  const value = record[key];

  if (typeof value === 'number' && Number.isFinite(value)) return value.toFixed(2);
  if (typeof value === 'string' && value.trim()) return value.trim();

  return undefined;
}
