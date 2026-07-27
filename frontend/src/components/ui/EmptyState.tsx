export function EmptyState({ title = 'Nenhum registro encontrado', description }: { title?: string; description?: string }) {
  return (
    <div className="rounded-md border border-dashed border-[var(--app-border-strong)] bg-[var(--app-panel-soft)] p-6">
      <p className="text-sm font-medium text-[var(--app-text)]">{title}</p>
      {description ? <p className="mt-1 text-sm text-[var(--app-muted)]">{description}</p> : null}
    </div>
  );
}
