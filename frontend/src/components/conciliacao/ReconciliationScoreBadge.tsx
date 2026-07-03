export function ReconciliationScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-emerald-100 text-emerald-800' : score >= 70 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800';
  return <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${color}`}>{score}</span>;
}
