'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { api } from '@/lib/api';
import { formatCurrencyBRL, formatDateTimeBR } from '@/lib/formatters';
import type { Reconciliation } from '@/types/conciliacao';

export default function ConciliacaoDetalhePage() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<Reconciliation>();

  useEffect(() => {
    void api.get<Reconciliation>(`/reconciliation/${params.id}`).then(setItem);
  }, [params.id]);

  if (!item) return <PageContainer><LoadingState /></PageContainer>;

  return (
    <PageContainer>
      <Card>
        <CardHeader title={`Conciliação ${item.id.slice(0, 8)}`} action={<Badge value={item.status} />} />
        <CardBody>
          <div className="grid gap-4 text-sm md:grid-cols-4">
            <Info label="Score" value={String(item.score)} />
            <Info label="Nível" value={item.matchLevel} />
            <Info label="Regra" value={item.ruleApplied ?? '-'} />
            <Info label="Criada em" value={formatDateTimeBR(item.createdAt)} />
            <Info label="Diferença bruto" value={formatCurrencyBRL(item.grossAmountDiff)} />
            <Info label="Diferença líquido" value={formatCurrencyBRL(item.netAmountDiff)} />
          </div>
          <pre className="mt-6 overflow-auto rounded-md bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify(item, null, 2)}</pre>
        </CardBody>
      </Card>
    </PageContainer>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium text-slate-900">{value}</dd>
    </div>
  );
}
