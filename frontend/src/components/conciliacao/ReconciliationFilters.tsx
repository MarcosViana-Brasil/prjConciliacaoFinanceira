'use client';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { QueryParams } from '@/types/api';

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'MATCHED_AUTOMATICALLY', label: 'Automática' },
  { value: 'MATCHED_MANUALLY', label: 'Manual' },
  { value: 'DIVERGENT', label: 'Divergente' },
  { value: 'NOT_FOUND', label: 'Não encontrado' },
  { value: 'REVERSED', label: 'Revertido' }
];

export function ReconciliationFilters({ filters, onChange }: { filters: QueryParams; onChange: (filters: QueryParams) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <Select options={statusOptions} value={String(filters.status ?? '')} onChange={(event) => onChange({ ...filters, status: event.target.value })} />
      <Input placeholder="Score mínimo" value={String(filters.minScore ?? '')} onChange={(event) => onChange({ ...filters, minScore: event.target.value })} />
      <Input placeholder="Score máximo" value={String(filters.maxScore ?? '')} onChange={(event) => onChange({ ...filters, maxScore: event.target.value })} />
    </div>
  );
}
