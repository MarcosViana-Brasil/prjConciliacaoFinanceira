import { Badge } from '@/components/ui/Badge';
import { Table, type Column } from '@/components/ui/Table';
import { formatCurrencyBRL, formatDateBR } from '@/lib/formatters';
import type { RedeReceivable } from '@/types/rede';

const columns: Column<RedeReceivable>[] = [
  { key: 'transactionId', header: 'Transaction ID', render: (item) => item.transactionId },
  { key: 'nsu', header: 'NSU', render: (item) => item.nsu ?? '-' },
  { key: 'auth', header: 'Autorização', render: (item) => item.authorizationCode ?? '-' },
  { key: 'expected', header: 'Previsto', render: (item) => formatDateBR(item.expectedPaymentDate) },
  { key: 'actual', header: 'Pago em', render: (item) => formatDateBR(item.actualPaymentDate) },
  { key: 'gross', header: 'Bruto', render: (item) => formatCurrencyBRL(item.grossAmount) },
  { key: 'net', header: 'Líquido', render: (item) => formatCurrencyBRL(item.netAmount) },
  { key: 'fee', header: 'Taxa', render: (item) => formatCurrencyBRL(item.feeAmount) },
  { key: 'installment', header: 'Parcela', render: (item) => `${item.installmentNumber ?? '-'} / ${item.totalInstallments ?? '-'}` },
  { key: 'status', header: 'Status', render: (item) => <Badge value={item.status} /> }
];

export function RedeReceivablesTable({ data }: { data: RedeReceivable[] }) {
  return <Table data={data} columns={columns} />;
}
