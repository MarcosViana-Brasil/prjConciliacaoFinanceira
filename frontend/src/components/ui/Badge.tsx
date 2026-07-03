import { formatStatusLabel } from '@/lib/formatters';

function colorFor(value: string) {
  if (['RECONCILED', 'MATCHED_AUTOMATICALLY', 'MATCHED_MANUALLY', 'PAID', 'SUCCESS', 'PROCESSED'].includes(value)) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  }
  if (['DIVERGENT', 'ERROR', 'FAILED', 'CANCELED', 'REVERSED', 'HIGH', 'CRITICAL'].includes(value)) {
    return 'border-rose-200 bg-rose-50 text-rose-800';
  }
  if (['PARTIAL_SUCCESS', 'PARTIALLY_PAID', 'MEDIUM', 'PENDING', 'RUNNING'].includes(value)) {
    return 'border-amber-200 bg-amber-50 text-amber-800';
  }
  return 'border-slate-200 bg-slate-50 text-slate-700';
}

export function Badge({ value }: { value?: string | null }) {
  const normalized = value ?? 'NONE';
  return <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${colorFor(normalized)}`}>{formatStatusLabel(normalized)}</span>;
}
