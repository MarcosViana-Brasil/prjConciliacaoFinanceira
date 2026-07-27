'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ResourcePage } from '@/components/ui/ResourcePage';
import { Table, type Column } from '@/components/ui/Table';
import { PageContainer } from '@/components/layout/PageContainer';
import { formatDateTimeBR } from '@/lib/formatters';
import { api } from '@/lib/api';
import type { RawPayload } from '@/types/auditoria';

export default function PayloadsPage() {
  const [selected, setSelected] = useState<RawPayload>();
  const [reprocess, setReprocess] = useState<RawPayload>();
  const columns: Column<RawPayload>[] = [
    { key: 'provider', header: 'Provider', render: (item) => item.provider },
    { key: 'endpoint', header: 'Endpoint', render: (item) => item.endpoint ?? '-' },
    { key: 'status', header: 'Status', render: (item) => <Badge value={item.status} /> },
    { key: 'responseStatus', header: 'HTTP', render: (item) => item.responseStatus ?? '-' },
    { key: 'hash', header: 'Hash', render: (item) => item.payloadHash?.slice(0, 16) ?? '-' },
    { key: 'receivedAt', header: 'Recebido', render: (item) => formatDateTimeBR(item.receivedAt) },
    {
      key: 'action',
      header: 'Ações',
      render: (item) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setSelected(item)}>Ver</Button>
          <Button variant="secondary" onClick={() => setReprocess(item)}>Reprocessar</Button>
        </div>
      )
    }
  ];
  return (
    <PageContainer>
      <ResourcePage<RawPayload> title="Payloads brutos" endpoint="/payloads" render={(items) => <Table data={items} columns={columns} />} />
      <Modal open={Boolean(selected)} title="Payload bruto" onClose={() => setSelected(undefined)}>
        <pre className="max-h-[70vh] overflow-auto rounded-md bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify(selected?.rawPayload, null, 2)}</pre>
      </Modal>
      <ReprocessModal payload={reprocess} onClose={() => setReprocess(undefined)} />
    </PageContainer>
  );
}

function ReprocessModal({ payload, onClose }: { payload?: RawPayload; onClose: () => void }) {
  const [justification, setJustification] = useState('Reprocessamento solicitado pelo painel.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function submit() {
    if (!payload) return;
    setLoading(true);
    setError(undefined);
    try {
      await api.post(`/jobs/reprocess-payload/${payload.id}`, { justification });
      onClose();
      window.location.reload();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Falha ao reprocessar payload');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={Boolean(payload)} title="Reprocessar payload" onClose={onClose}>
      <div className="grid gap-3">
        {error ? <div className="rounded-md border border-[var(--app-danger-border)] bg-[var(--app-danger-bg)] p-3 text-sm text-[var(--app-danger-text)]">{error}</div> : null}
        <textarea
          className="min-h-24 rounded-md border border-[var(--app-border-strong)] bg-[var(--app-input)] px-3 py-2 text-sm text-[var(--app-text)] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
          value={justification}
          onChange={(event) => setJustification(event.target.value)}
        />
        <Button disabled={loading || !justification.trim()} onClick={submit}>
          Reprocessar
        </Button>
      </div>
    </Modal>
  );
}
