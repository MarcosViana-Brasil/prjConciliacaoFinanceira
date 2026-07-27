export function ReconciliationScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'status-success' : score >= 70 ? 'status-warning' : 'status-danger';
  return <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${color}`}>{score}</span>;
}
