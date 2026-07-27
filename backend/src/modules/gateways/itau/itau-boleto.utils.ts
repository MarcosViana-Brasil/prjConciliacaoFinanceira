import { ItauBoletoChargeType, ItauBoletoMovementType, ItauBoletoStatus } from '@prisma/client';

export function getArrayPayload(payload: unknown, keys: string[]) {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];

  for (const key of keys) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
  }

  return [];
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function readNestedString(record: Record<string, unknown>, path: string[]) {
  const value = readNested(record, path);
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
}

export function readNestedNumber(record: Record<string, unknown>, path: string[]) {
  const value = readNested(record, path);
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value.replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function readNestedMoney(record: Record<string, unknown>, path: string[]) {
  const value = readNested(record, path);

  if (typeof value === 'number' && Number.isFinite(value)) return value.toFixed(2);
  if (typeof value !== 'string' || !value.trim()) return undefined;

  const normalized = value.trim().replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : value.trim();
}

export function readNestedDate(record: Record<string, unknown>, path: string[]) {
  const value = readNested(record, path);
  if (typeof value !== 'string' || !value.trim()) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function readNestedBoolean(record: Record<string, unknown>, path: string[]) {
  const value = readNested(record, path);
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['true', 'sim', 's', '1'].includes(value.trim().toLowerCase());
  return false;
}

export function mapBoletoStatus(value?: string): ItauBoletoStatus {
  const normalized = normalize(value);
  if (['ABERTO', 'OPEN'].includes(normalized)) return ItauBoletoStatus.OPEN;
  if (['EMPAGAMENTO', 'EM_PAGAMENTO', 'IN_PAYMENT'].includes(normalized)) return ItauBoletoStatus.IN_PAYMENT;
  if (['PAGO', 'PAGA', 'LIQUIDADO', 'LIQUIDADA', 'PAID'].includes(normalized)) return ItauBoletoStatus.PAID;
  if (['CANCELADO', 'CANCELADA', 'BAIXADO', 'BAIXADA', 'CANCELED', 'CANCELLED'].includes(normalized)) return ItauBoletoStatus.CANCELED;
  if (['VENCIDO', 'VENCIDA', 'OVERDUE'].includes(normalized)) return ItauBoletoStatus.OVERDUE;
  return ItauBoletoStatus.UNKNOWN;
}

export function mapMovementType(value?: string): ItauBoletoMovementType {
  const normalized = normalize(value);
  if (['ENTRADA', 'ENTRADAS', 'ENTRY'].includes(normalized)) return ItauBoletoMovementType.ENTRY;
  if (['LIQUIDACAO', 'LIQUIDACOES', 'LIQUIDAÇÃO', 'LIQUIDAÇÕES', 'LIQUIDATION'].includes(normalized)) return ItauBoletoMovementType.LIQUIDATION;
  if (['BAIXA', 'BAIXAS', 'CANCELAMENTO', 'CANCELATION', 'CANCELLATION'].includes(normalized)) return ItauBoletoMovementType.CANCELATION;
  return ItauBoletoMovementType.UNKNOWN;
}

export function mapChargeType(value?: string): ItauBoletoChargeType {
  const normalized = normalize(value);
  if (['BOLETO'].includes(normalized)) return ItauBoletoChargeType.BOLETO;
  if (['BOLECODE'].includes(normalized)) return ItauBoletoChargeType.BOLECODE;
  if (['BOLETO_DESCONTADO', 'BOLETODESCONTADO', 'DISCOUNTED_BOLETO'].includes(normalized)) return ItauBoletoChargeType.DISCOUNTED_BOLETO;
  return ItauBoletoChargeType.UNKNOWN;
}

function readNested(record: Record<string, unknown>, path: string[]) {
  let current: unknown = record;

  for (const key of path) {
    if (!isRecord(current)) return undefined;
    current = current[key];
  }

  return current;
}

function normalize(value?: string) {
  return value?.trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_') ?? '';
}
