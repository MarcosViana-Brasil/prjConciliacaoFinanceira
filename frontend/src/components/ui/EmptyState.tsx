export function EmptyState({ title = 'Nenhum registro encontrado', description }: { title?: string; description?: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-white p-6">
      <p className="text-sm font-medium text-slate-900">{title}</p>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    </div>
  );
}
