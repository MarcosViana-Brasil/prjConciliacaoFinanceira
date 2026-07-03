'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { api } from '@/lib/api';

export function ManualApprovalModal({ id, open, onClose, onDone }: { id: string; open: boolean; onClose: () => void; onDone: () => void }) {
  const [justification, setJustification] = useState('');
  async function submit() {
    if (!justification.trim()) return;
    await api.post(`/reconciliation/${id}/approve-manual`, { justification });
    onDone();
    onClose();
  }
  return (
    <Modal open={open} title="Aprovar manualmente" onClose={onClose}>
      <Textarea value={justification} onChange={(event) => setJustification(event.target.value)} placeholder="Justificativa obrigatória" />
      <div className="mt-3"><Button disabled={!justification.trim()} onClick={submit}>Aprovar</Button></div>
    </Modal>
  );
}
