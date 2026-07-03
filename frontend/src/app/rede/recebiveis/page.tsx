'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { RedeImportActions } from '@/components/rede/RedeImportActions';
import { RedeReceivablesTable } from '@/components/rede/RedeReceivablesTable';
import { ResourcePage } from '@/components/ui/ResourcePage';
import type { RedeReceivable } from '@/types/rede';

export default function RedeRecebiveisPage() {
  return (
    <PageContainer>
      <ResourcePage<RedeReceivable>
        title="Recebíveis Rede"
        endpoint="/gateways/rede/receivables"
        action={<RedeImportActions type="receivables" onDone={() => window.location.reload()} />}
        render={(items) => <RedeReceivablesTable data={items} />}
      />
    </PageContainer>
  );
}
