import { Badge } from '@/components/ui/Badge';
import { Table, type Column } from '@/components/ui/Table';
import { formatDateTimeBR } from '@/lib/formatters';
import type { AuditEvent } from '@/types/auditoria';

const columns: Column<AuditEvent>[] = [
  { key: 'entity', header: 'Entidade', render: (item) => item.entity },
  { key: 'entityId', header: 'ID', render: (item) => item.entityId.slice(0, 12) },
  { key: 'action', header: 'Ação', render: (item) => <Badge value={item.action} /> },
  { key: 'user', header: 'Usuário', render: (item) => item.userId ?? 'system' },
  { key: 'origin', header: 'Origem', render: (item) => item.origin ?? '-' },
  { key: 'justification', header: 'Justificativa', render: (item) => item.justification ?? '-' },
  { key: 'createdAt', header: 'Data', render: (item) => formatDateTimeBR(item.createdAt) }
];

export function AuditEventTable({ data }: { data: AuditEvent[] }) {
  return <Table data={data} columns={columns} />;
}
