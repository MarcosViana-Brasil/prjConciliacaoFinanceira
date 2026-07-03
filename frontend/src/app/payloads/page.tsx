'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ResourcePage } from '@/components/ui/ResourcePage';
import { Table, type Column } from '@/components/ui/Table';
import { PageContainer } from '@/components/layout/PageContainer';
import { formatDateTimeBR } from '@/lib/formatters';
import type { RawPayload } from '@/types/auditoria';

export default function PayloadsPage() {
  const [selected, setSelected] = useState<RawPayload>();
  const columns: Column<RawPayload>[] = [
    { key: 'provider', header: 'Provider', render: (item) => item.provider },
    { key: 'endpoint', header: 'Endpoint', render: (item) => item.endpoint ?? '-' },
    { key: 'status', header: 'Status', render: (item) => <Badge value={item.status} /> },
    { key: 'responseStatus', header: 'HTTP', render: (item) => item.responseStatus ?? '-' },
    { key: 'hash', header: 'Hash', render: (item) => item.payloadHash?.slice(0, 16) ?? '-' },
    { key: 'receivedAt', header: 'Recebido', render: (item) => formatDateTimeBR(item.receivedAt) },
    { key: 'action', header: 'JSON', render: (item) => <Button variant="secondary" onClick={() => setSelected(item)}>Ver</Button> }
  ];
  return (
    <PageContainer>
      <ResourcePage<RawPayload> title="Payloads brutos" endpoint="/payloads" render={(items) => <Table data={items} columns={columns} />} />
      <Modal open={Boolean(selected)} title="Payload bruto" onClose={() => setSelected(undefined)}>
        <pre className="max-h-[70vh] overflow-auto rounded-md bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify(selected?.rawPayload, null, 2)}</pre>
      </Modal>
    </PageContainer>
  );
}
