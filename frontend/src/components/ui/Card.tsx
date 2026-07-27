import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-md border border-[var(--app-border)] bg-[var(--app-panel)] shadow-xl shadow-black/10 ${className}`}>{children}</section>;
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--app-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-base font-semibold text-[var(--app-text)]">{title}</h2>
      {action}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
