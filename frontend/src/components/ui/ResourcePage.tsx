'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Pagination } from '@/components/ui/Pagination';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import type { Pagination as PaginationType, QueryParams } from '@/types/api';

export function ResourcePage<T>({
  title,
  endpoint,
  filters,
  action,
  render
}: {
  title: string;
  endpoint: string;
  filters?: (query: QueryParams, setQuery: (query: QueryParams) => void) => ReactNode;
  action?: ReactNode;
  render: (items: T[], reload: () => void) => ReactNode;
}) {
  const [items, setItems] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationType>();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState<QueryParams>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const updateQuery = useCallback((nextQuery: QueryParams) => {
    setQuery(nextQuery);
    setPage(1);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await api.list<T>(endpoint, { ...query, page });
      setItems(result.data);
      setPagination(result.pagination);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, query]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <Card>
      <CardHeader title={title} action={action} />
      <CardBody>
        {filters ? <div className="mb-4">{filters(query, updateQuery)}</div> : null}
        {error ? <div className="mb-4 rounded-md border border-[var(--app-danger-border)] bg-[var(--app-danger-bg)] p-3 text-sm text-[var(--app-danger-text)]">{error}</div> : null}
        {loading ? <LoadingState /> : items.length ? render(items, reload) : <EmptyState />}
      </CardBody>
      <Pagination pagination={pagination} onPageChange={setPage} />
    </Card>
  );
}

export function useResourceFilters() {
  return useState<QueryParams>({});
}
