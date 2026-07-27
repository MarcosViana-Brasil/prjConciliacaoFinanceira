export function LoadingState({ label = 'Carregando dados...' }: { label?: string }) {
  return <div className="rounded-md border border-dashed border-[var(--app-border-strong)] bg-[var(--app-panel-soft)] p-6 text-sm text-[var(--app-muted)]">{label}</div>;
}
