import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-md border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>;
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      {action}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
