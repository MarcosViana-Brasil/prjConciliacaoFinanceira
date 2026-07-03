'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { ResourcePage } from '@/components/ui/ResourcePage';
import { FinancialTitleFilters } from '@/components/financeiro/FinancialTitleFilters';
import { FinancialTitleTable } from '@/components/financeiro/FinancialTitleTable';
import type { FinancialTitle } from '@/types/financeiro';

export default function TitulosPage() {
  return (
    <PageContainer>
      <ResourcePage<FinancialTitle>
        title="Títulos financeiros"
        endpoint="/financial-titles"
        filters={(query, setQuery) => <FinancialTitleFilters filters={query} onChange={setQuery} />}
        action={
          <Link href="/titulos/novo">
            <Button>
              <Plus size={16} />
              Novo título
            </Button>
          </Link>
        }
        render={(items) => <FinancialTitleTable data={items} />}
      />
    </PageContainer>
  );
}
