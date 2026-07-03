'use client';

import { Badge } from '@/components/ui/Badge';
import { ResourcePage } from '@/components/ui/ResourcePage';
import { Table, type Column } from '@/components/ui/Table';
import { PageContainer } from '@/components/layout/PageContainer';
import { formatDateTimeBR } from '@/lib/formatters';
import type { JobExecution } from '@/types/auditoria';

const columns: Column<JobExecution>[] = [
  { key: 'jobName', header: 'Job', render: (item) => item.jobName },
  { key: 'status', header: 'Status', render: (item) => <Badge value={item.status} /> },
  { key: 'startedAt', header: 'Início', render: (item) => formatDateTimeBR(item.startedAt) },
  { key: 'finishedAt', header: 'Fim', render: (item) => formatDateTimeBR(item.finishedAt) },
  { key: 'durationMs', header: 'Duração', render: (item) => `${item.durationMs ?? 0} ms` },
  { key: 'processed', header: 'Processados', render: (item) => item.processedCount },
  { key: 'success', header: 'Sucesso', render: (item) => item.successCount },
  { key: 'errors', header: 'Erros', render: (item) => item.errorCount },
  { key: 'message', header: 'Mensagem', render: (item) => item.errorMessage ?? '-' }
];

export default function JobsPage() {
  return (
    <PageContainer>
      <ResourcePage<JobExecution> title="Execuções de jobs" endpoint="/jobs" render={(items) => <Table data={items} columns={columns} />} />
    </PageContainer>
  );
}
