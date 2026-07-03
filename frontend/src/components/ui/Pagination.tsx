'use client';

import type { Pagination as PaginationType } from '@/types/api';
import { Button } from './Button';

export function Pagination({ pagination, onPageChange }: { pagination?: PaginationType; onPageChange: (page: number) => void }) {
  if (!pagination) return null;

  return (
    <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Página {pagination.page} de {pagination.totalPages || 1} · {pagination.total} registros
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}>
          Anterior
        </Button>
        <Button
          variant="secondary"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
