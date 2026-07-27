import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Table, type Column } from '@/components/ui/Table';
import { formatCurrencyBRL, formatDateBR, formatDocument } from '@/lib/formatters';
import type { FinancialTitle } from '@/types/financeiro';

const columns: Column<FinancialTitle>[] = [
  { key: 'titleNumber', header: 'Título', render: (item) => <Link className="font-medium text-[var(--app-accent-strong)] hover:underline" href={`/titulos/${item.id}`}>{item.titleNumber}</Link> },
  { key: 'customerName', header: 'Cliente', render: (item) => item.customerName ?? '-' },
  { key: 'document', header: 'Documento', render: (item) => formatDocument(item.customerDocument) },
  { key: 'amount', header: 'Valor', render: (item) => formatCurrencyBRL(item.grossAmount) },
  { key: 'dueDate', header: 'Vencimento', render: (item) => formatDateBR(item.dueDate) },
  { key: 'gateway', header: 'Gateway', render: (item) => item.gatewayProvider ?? '-' },
  { key: 'status', header: 'Status', render: (item) => <Badge value={item.status} /> }
];

export function FinancialTitleTable({ data }: { data: FinancialTitle[] }) {
  return <Table data={data} columns={columns} />;
}
