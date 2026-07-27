'use client';

import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export function Modal({
  open,
  title,
  children,
  onClose
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <section className="w-full max-w-xl rounded-md border border-[var(--app-border)] bg-[var(--app-panel)] shadow-xl shadow-black/30">
        <div className="flex items-center justify-between border-b border-[var(--app-border)] px-4 py-3">
          <h2 className="text-base font-semibold text-[var(--app-text)]">{title}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </section>
    </div>
  );
}
