'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileText, Landmark } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrencyBRL } from '@/lib/formatters';
import type { FinancialTitle } from '@/types/financeiro';
import type { RedeReceivable } from '@/types/rede';
import { DashboardMetricCard } from './DashboardMetricCard';

export function DashboardSummary() {
  const [titles, setTitles] = useState<FinancialTitle[]>([]);
  const [receivables, setReceivables] = useState<RedeReceivable[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    void Promise.all([
      api.list<FinancialTitle>('/financial-titles', { limit: 100 }),
      api.list<RedeReceivable>('/gateways/rede/receivables', { limit: 100 })
    ]).then(([titleResult, receivableResult]) => {
      setTitles(titleResult.data);
      setReceivables(receivableResult.data);
    }).catch((requestError) => {
      setError(requestError instanceof Error ? requestError.message : 'Falha ao carregar dashboard');
    });
  }, []);

  const openTotal = titles.filter((item) => item.status === 'OPEN').reduce((sum, item) => sum + Number(item.grossAmount), 0);
  const receivedTotal = receivables.reduce((sum, item) => sum + Number(item.netAmount ?? item.grossAmount), 0);

  return (
    <>
      {error ? <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardMetricCard label="Total de títulos" value={String(titles.length)} icon={<FileText size={24} />} />
        <DashboardMetricCard label="Total em aberto" value={formatCurrencyBRL(openTotal)} icon={<AlertTriangle size={24} />} />
        <DashboardMetricCard
          label="Total conciliado"
          value={String(titles.filter((item) => item.status === 'RECONCILED').length)}
          icon={<CheckCircle2 size={24} />}
        />
        <DashboardMetricCard label="Recebido Rede" value={formatCurrencyBRL(receivedTotal)} icon={<Landmark size={24} />} />
      </div>
    </>
  );
}
