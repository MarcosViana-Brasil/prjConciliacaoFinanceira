'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { ManualApprovalModal } from '@/components/conciliacao/ManualApprovalModal';
import { ReconciliationFilters } from '@/components/conciliacao/ReconciliationFilters';
import { ReconciliationTable } from '@/components/conciliacao/ReconciliationTable';
import { RejectReconciliationModal } from '@/components/conciliacao/RejectReconciliationModal';
import { ReverseReconciliationModal } from '@/components/conciliacao/ReverseReconciliationModal';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ResourcePage } from '@/components/ui/ResourcePage';
import { api } from '@/lib/api';
import type { Reconciliation } from '@/types/conciliacao';

export default function ConciliacaoPage() {
  const [runOpen, setRunOpen] = useState(false);
  const [selected, setSelected] = useState<Reconciliation>();
  const [action, setAction] = useState<'approve' | 'reject' | 'reverse'>();

  return (
    <PageContainer>
      <ResourcePage<Reconciliation>
        title="Conciliações"
        endpoint="/reconciliation"
        filters={(query, setQuery) => <ReconciliationFilters filters={query} onChange={setQuery} />}
        action={
          <Button onClick={() => setRunOpen(true)}>
            <Play size={16} />
            Executar conciliação
          </Button>
        }
        render={(items, reload) => (
          <>
            <ReconciliationTable
              data={items}
              actions={(item) => (
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => { setSelected(item); setAction('approve'); }}>Aprovar</Button>
                  <Button variant="secondary" onClick={() => { setSelected(item); setAction('reject'); }}>Rejeitar</Button>
                  <Button variant="danger" onClick={() => { setSelected(item); setAction('reverse'); }}>Reverter</Button>
                </div>
              )}
            />
            {selected ? (
              <>
                <ManualApprovalModal id={selected.id} open={action === 'approve'} onClose={() => setAction(undefined)} onDone={reload} />
                <RejectReconciliationModal id={selected.id} open={action === 'reject'} onClose={() => setAction(undefined)} onDone={reload} />
                <ReverseReconciliationModal id={selected.id} open={action === 'reverse'} onClose={() => setAction(undefined)} onDone={reload} />
              </>
            ) : null}
          </>
        )}
      />
      <RunModal open={runOpen} onClose={() => setRunOpen(false)} />
    </PageContainer>
  );
}

function RunModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-07-03');
  async function submit() {
    await api.post('/reconciliation/run', { startDate, endDate, gatewayProvider: 'REDE' });
    onClose();
    window.location.reload();
  }
  return (
    <Modal open={open} title="Executar conciliação" onClose={onClose}>
      <div className="grid gap-3">
        <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        <Button onClick={submit}>Executar</Button>
      </div>
    </Modal>
  );
}
