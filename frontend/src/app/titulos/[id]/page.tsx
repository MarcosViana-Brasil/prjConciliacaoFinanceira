'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { api } from '@/lib/api';
import { formatCurrencyBRL, formatDateBR, formatDocument } from '@/lib/formatters';
import type { FinancialTitle } from '@/types/financeiro';

export default function TituloDetalhePage() {
  const params = useParams<{ id: string }>();
  const [title, setTitle] = useState<FinancialTitle>();

  useEffect(() => {
    void api.get<FinancialTitle>(`/financial-titles/${params.id}`).then(setTitle);
  }, [params.id]);

  if (!title) return <PageContainer><LoadingState /></PageContainer>;

  return (
    <PageContainer>
      <Card>
        <CardHeader title={`Título ${title.titleNumber}`} action={<Badge value={title.status} />} />
        <CardBody>
          <dl className="grid gap-4 text-sm md:grid-cols-3">
            <Info label="Cliente" value={title.customerName ?? '-'} />
            <Info label="Documento" value={formatDocument(title.customerDocument)} />
            <Info label="Valor bruto" value={formatCurrencyBRL(title.grossAmount)} />
            <Info label="Valor líquido esperado" value={formatCurrencyBRL(title.netAmountExpected)} />
            <Info label="Vencimento" value={formatDateBR(title.dueDate)} />
            <Info label="Pedido" value={title.orderNumber ?? '-'} />
            <Info label="Gateway" value={title.gatewayProvider ?? '-'} />
            <Info label="NSU" value={title.nsu ?? '-'} />
            <Info label="Autorização" value={title.authorizationCode ?? '-'} />
          </dl>
          <pre className="mt-6 overflow-auto rounded-md bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify(title.metadata ?? {}, null, 2)}</pre>
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
