'use client';

import { AuditEventTable } from '@/components/auditoria/AuditEventTable';
import { PageContainer } from '@/components/layout/PageContainer';
import { ResourcePage } from '@/components/ui/ResourcePage';
import type { AuditEvent } from '@/types/auditoria';

export default function AuditoriaPage() {
  return (
    <PageContainer>
      <ResourcePage<AuditEvent> title="Auditoria" endpoint="/audit-events" render={(items) => <AuditEventTable data={items} />} />
    </PageContainer>
  );
}
