import { formatStatusLabel } from '@/lib/formatters';

function colorFor(value: string) {
  if (['RECONCILED', 'MATCHED_AUTOMATICALLY', 'MATCHED_MANUALLY', 'PAID', 'SUCCESS', 'PROCESSED'].includes(value)) {
    return 'status-success';
  }
  if (['DIVERGENT', 'ERROR', 'FAILED', 'CANCELED', 'REVERSED', 'HIGH', 'CRITICAL'].includes(value)) {
    return 'status-danger';
  }
  if (['PARTIAL_SUCCESS', 'PARTIALLY_PAID', 'MEDIUM', 'PENDING', 'RUNNING'].includes(value)) {
    return 'status-warning';
  }
  return 'status-neutral';
}

export function Badge({ value }: { value?: string | null }) {
  const normalized = value ?? 'NONE';
  return <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${colorFor(normalized)}`}>{formatStatusLabel(normalized)}</span>;
}
