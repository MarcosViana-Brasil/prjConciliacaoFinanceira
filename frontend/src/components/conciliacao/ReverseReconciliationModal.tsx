'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { api } from '@/lib/api';

export function ReverseReconciliationModal({ id, open, onClose, onDone }: { id: string; open: boolean; onClose: () => void; onDone: () => void }) {
  const [reversalReason, setReason] = useState('');
  async function submit() {
    if (!reversalReason.trim()) return;
    await api.post(`/reconciliation/${id}/reverse`, { reversalReason });
    onDone();
    onClose();
  }
  return (
    <Modal open={open} title="Reverter conciliação" onClose={onClose}>
      <Textarea value={reversalReason} onChange={(event) => setReason(event.target.value)} placeholder="Motivo obrigatório" />
      <div className="mt-3"><Button variant="danger" disabled={!reversalReason.trim()} onClick={submit}>Reverter</Button></div>
    </Modal>
  );
}
