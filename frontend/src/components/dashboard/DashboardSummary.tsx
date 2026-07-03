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

  useEffect(() => {
    void Promise.all([
      api.list<FinancialTitle>('/financial-titles', { limit: 100 }),
      api.list<RedeReceivable>('/gateways/rede/receivables', { limit: 100 })
    ]).then(([titleResult, receivableResult]) => {
      setTitles(titleResult.data);
      setReceivables(receivableResult.data);
    });
  }, []);

  const openTotal = titles.filter((item) => item.status === 'OPEN').reduce((sum, item) => sum + Number(item.grossAmount), 0);
  const receivedTotal = receivables.reduce((sum, item) => sum + Number(item.netAmount ?? item.grossAmount), 0);

  return (
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
  );
}
