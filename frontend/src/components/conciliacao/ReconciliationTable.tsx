import Link from 'next/link';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Table, type Column } from '@/components/ui/Table';
import { formatCurrencyBRL, formatDateTimeBR } from '@/lib/formatters';
import type { Reconciliation } from '@/types/conciliacao';
import { ReconciliationScoreBadge } from './ReconciliationScoreBadge';

export function ReconciliationTable({ data, actions }: { data: Reconciliation[]; actions?: (item: Reconciliation) => ReactNode }) {
  const columns: Column<Reconciliation>[] = [
    { key: 'id', header: 'Conciliação', render: (item) => <Link className="font-medium text-[var(--app-accent-strong)] hover:underline" href={`/conciliacao/${item.id}`}>{item.id.slice(0, 8)}</Link> },
    { key: 'title', header: 'Título', render: (item) => item.financialTitleId?.slice(0, 8) ?? '-' },
    { key: 'amount', header: 'Dif. bruto', render: (item) => formatCurrencyBRL(item.grossAmountDiff) },
    { key: 'score', header: 'Score', render: (item) => <ReconciliationScoreBadge score={item.score} /> },
    { key: 'level', header: 'Nível', render: (item) => <Badge value={item.matchLevel} /> },
    { key: 'status', header: 'Status', render: (item) => <Badge value={item.status} /> },
    { key: 'rule', header: 'Regra', render: (item) => item.ruleApplied ?? '-' },
    { key: 'createdAt', header: 'Data', render: (item) => formatDateTimeBR(item.createdAt) },
    { key: 'actions', header: 'Ações', render: (item) => actions?.(item) ?? '-' }
  ];

  return <Table data={data} columns={columns} />;
}
