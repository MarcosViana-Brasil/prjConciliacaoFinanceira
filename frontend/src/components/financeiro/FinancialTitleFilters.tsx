'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { statusOptions } from '@/lib/constants';
import type { QueryParams } from '@/types/api';

export function FinancialTitleFilters({ filters, onChange }: { filters: QueryParams; onChange: (filters: QueryParams) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <Input placeholder="Busca" value={String(filters.search ?? '')} onChange={(event) => onChange({ ...filters, search: event.target.value })} />
      <Select options={statusOptions} value={String(filters.status ?? '')} onChange={(event) => onChange({ ...filters, status: event.target.value })} />
      <Input
        placeholder="Cliente"
        value={String(filters.customerName ?? '')}
        onChange={(event) => onChange({ ...filters, customerName: event.target.value })}
      />
      <Button variant="secondary" onClick={() => onChange({})}>
        Limpar
      </Button>
    </div>
  );
}
