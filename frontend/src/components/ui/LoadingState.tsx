export function LoadingState({ label = 'Carregando dados...' }: { label?: string }) {
  return <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">{label}</div>;
}
