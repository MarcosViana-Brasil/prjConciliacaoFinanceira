'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { RedeImportActions } from '@/components/rede/RedeImportActions';
import { RedeTransactionsTable } from '@/components/rede/RedeTransactionsTable';
import { ResourcePage } from '@/components/ui/ResourcePage';
import type { RedeTransaction } from '@/types/rede';

export default function RedeTransacoesPage() {
  return (
    <PageContainer>
      <ResourcePage<RedeTransaction>
        title="Transações Rede"
        endpoint="/gateways/rede/transactions"
        action={<RedeImportActions type="transactions" onDone={() => window.location.reload()} />}
        render={(items) => <RedeTransactionsTable data={items} />}
      />
    </PageContainer>
  );
}
