'use client';

import { Badge } from '@/components/ui/Badge';
import { ResourcePage } from '@/components/ui/ResourcePage';
import { Table, type Column } from '@/components/ui/Table';
import { PageContainer } from '@/components/layout/PageContainer';
import { formatDateTimeBR } from '@/lib/formatters';
import type { ReconciliationDivergence } from '@/types/conciliacao';

const columns: Column<ReconciliationDivergence>[] = [
  { key: 'type', header: 'Tipo', render: (item) => <Badge value={item.divergenceType} /> },
  { key: 'severity', header: 'Severidade', render: (item) => <Badge value={item.severity} /> },
  { key: 'description', header: 'Descrição', render: (item) => item.description },
  { key: 'expected', header: 'Esperado', render: (item) => JSON.stringify(item.expectedValue ?? '-') },
  { key: 'actual', header: 'Real', render: (item) => JSON.stringify(item.actualValue ?? '-') },
  { key: 'resolved', header: 'Resolvido', render: (item) => item.resolved ? 'Sim' : 'Não' },
  { key: 'createdAt', header: 'Data', render: (item) => formatDateTimeBR(item.createdAt) }
];

export default function DivergenciasPage() {
  return (
    <PageContainer>
      <ResourcePage<ReconciliationDivergence>
        title="Divergências"
        endpoint="/reconciliation/divergences"
        render={(items) => <Table data={items} columns={columns} />}
      />
    </PageContainer>
  );
}
