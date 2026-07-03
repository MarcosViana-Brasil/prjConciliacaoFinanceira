import { Badge } from '@/components/ui/Badge';
import { Table, type Column } from '@/components/ui/Table';
import { formatCurrencyBRL, formatDateTimeBR } from '@/lib/formatters';
import type { RedeTransaction } from '@/types/rede';

const columns: Column<RedeTransaction>[] = [
  { key: 'transactionId', header: 'Transaction ID', render: (item) => item.transactionId },
  { key: 'tid', header: 'TID', render: (item) => item.tid ?? '-' },
  { key: 'nsu', header: 'NSU', render: (item) => item.nsu ?? '-' },
  { key: 'auth', header: 'Autorização', render: (item) => item.authorizationCode ?? '-' },
  { key: 'order', header: 'Pedido', render: (item) => item.orderNumber ?? '-' },
  { key: 'saleDate', header: 'Venda', render: (item) => formatDateTimeBR(item.saleDate) },
  { key: 'gross', header: 'Bruto', render: (item) => formatCurrencyBRL(item.grossAmount) },
  { key: 'net', header: 'Líquido', render: (item) => formatCurrencyBRL(item.netAmount) },
  { key: 'fee', header: 'Taxa', render: (item) => formatCurrencyBRL(item.feeAmount) },
  { key: 'status', header: 'Status', render: (item) => <Badge value={item.status} /> }
];

export function RedeTransactionsTable({ data }: { data: RedeTransaction[] }) {
  return <Table data={data} columns={columns} />;
}
