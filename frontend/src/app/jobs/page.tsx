'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ResourcePage } from '@/components/ui/ResourcePage';
import { Table, type Column } from '@/components/ui/Table';
import { PageContainer } from '@/components/layout/PageContainer';
import { formatDateTimeBR } from '@/lib/formatters';
import { api } from '@/lib/api';
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
      <ResourcePage<JobExecution>
        title="Execuções de jobs"
        endpoint="/jobs"
        action={<JobActions />}
        render={(items) => <Table data={items} columns={columns} />}
      />
    </PageContainer>
  );
}

function JobActions() {
  const [job, setJob] = useState<'transactions' | 'receivables' | 'reconciliation'>();
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-07-03');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function submit() {
    if (!job) return;
    setLoading(true);
    setError(undefined);
    try {
      const endpointByJob = {
        transactions: '/jobs/import-rede-transactions/run',
        receivables: '/jobs/import-rede-receivables/run',
        reconciliation: '/jobs/reconciliation/run'
      };
      const body = job === 'reconciliation' ? { startDate, endDate, gatewayProvider: 'REDE' } : { startDate, endDate };
      await api.post(endpointByJob[job], body);
      setJob(undefined);
      window.location.reload();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Falha ao executar job');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setJob('transactions')}>
          <Play size={16} />
          Transações
        </Button>
        <Button variant="secondary" onClick={() => setJob('receivables')}>
          <Play size={16} />
          Recebíveis
        </Button>
        <Button onClick={() => setJob('reconciliation')}>
          <Play size={16} />
          Conciliar
        </Button>
      </div>
      <Modal open={Boolean(job)} title="Executar job" onClose={() => setJob(undefined)}>
        <div className="grid gap-3">
          {error ? <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div> : null}
          <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          <Button disabled={loading} onClick={submit}>
            Executar
          </Button>
        </div>
      </Modal>
    </>
  );
}
