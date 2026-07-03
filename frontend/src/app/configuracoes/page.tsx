'use client';

import { ResourcePage } from '@/components/ui/ResourcePage';
import { Table, type Column } from '@/components/ui/Table';
import { PageContainer } from '@/components/layout/PageContainer';

type Setting = {
  id: string;
  key: string;
  value: unknown;
  description?: string | null;
  isEncrypted: boolean;
  updatedAt: string;
};

const columns: Column<Setting>[] = [
  { key: 'key', header: 'Chave', render: (item) => item.key },
  { key: 'value', header: 'Valor', render: (item) => JSON.stringify(item.value) },
  { key: 'description', header: 'Descrição', render: (item) => item.description ?? '-' },
  { key: 'isEncrypted', header: 'Sensível', render: (item) => item.isEncrypted ? 'Sim' : 'Não' }
];

export default function ConfiguracoesPage() {
  return (
    <PageContainer>
      <ResourcePage<Setting> title="Configurações" endpoint="/settings" render={(items) => <Table data={items} columns={columns} />} />
    </PageContainer>
  );
}
