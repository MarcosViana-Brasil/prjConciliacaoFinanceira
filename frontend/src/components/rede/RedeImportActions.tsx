'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';

export function RedeImportActions({ type, onDone }: { type: 'transactions' | 'receivables'; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-07-03');
  const endpoint = type === 'transactions' ? '/gateways/rede/import-transactions' : '/gateways/rede/import-receivables';

  async function submit() {
    await api.post(endpoint, { startDate, endDate });
    setOpen(false);
    onDone();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Download size={16} />
        Importar
      </Button>
      <Modal open={open} title="Importar dados Rede" onClose={() => setOpen(false)}>
        <div className="grid gap-3">
          <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          <Button onClick={submit}>Executar importação</Button>
        </div>
      </Modal>
    </>
  );
}
