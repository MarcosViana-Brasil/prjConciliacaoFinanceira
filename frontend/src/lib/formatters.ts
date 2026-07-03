const statusLabels: Record<string, string> = {
  OPEN: 'Aberto',
  PAID: 'Pago',
  PARTIALLY_PAID: 'Pago parcialmente',
  CANCELED: 'Cancelado',
  RECONCILED: 'Conciliado',
  DIVERGENT: 'Divergente',
  MATCHED_AUTOMATICALLY: 'Conciliado automaticamente',
  MATCHED_MANUALLY: 'Conciliado manualmente',
  NOT_FOUND: 'Nao encontrado',
  REVERSED: 'Revertido',
  RUNNING: 'Em execucao',
  SUCCESS: 'Sucesso',
  FAILED: 'Falhou',
  PARTIAL_SUCCESS: 'Sucesso parcial',
  PENDING: 'Pendente',
  CAPTURED: 'Capturada',
  AUTHORIZED: 'Autorizada',
  RECEIVED: 'Recebido',
  PROCESSED: 'Processado',
  ERROR: 'Erro',
  STRONG: 'Forte',
  MEDIUM: 'Medio',
  WEAK: 'Fraco',
  NONE: 'Nenhum'
};

export function formatCurrencyBRL(value?: string | number | null) {
  const amount = value === undefined || value === null ? 0 : Number(value);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatDateBR(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value));
}

export function formatDateTimeBR(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export function formatDocument(value?: string | null) {
  if (!value) return '-';
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11) return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (digits.length === 14) return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return value;
}

export function formatPercentage(value?: number | null) {
  return `${value ?? 0}%`;
}

export function formatStatusLabel(value?: string | null) {
  if (!value) return '-';
  return statusLabels[value] ?? value.replace(/_/g, ' ');
}
