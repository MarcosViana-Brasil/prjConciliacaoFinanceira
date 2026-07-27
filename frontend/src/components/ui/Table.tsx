import type { ReactNode } from 'react';

export type Column<T> = {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
};

export function Table<T>({ data, columns }: { data: T[]; columns: Column<T>[] }) {
  return (
    <div
      className="max-h-[24.5rem] overflow-auto"
      role="region"
      aria-label="Tabela de dados"
      tabIndex={0}
    >
      <table className="min-w-full border-separate border-spacing-0 text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="bg-[var(--app-panel-soft)] text-left text-xs uppercase text-[var(--app-muted)]">
            {columns.map((column) => (
              <th key={column.key} className="h-10 border-b border-[var(--app-border)] px-3 py-0 font-semibold">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-b border-[var(--app-border)]">
              {columns.map((column) => (
                <td key={column.key} className="h-11 border-b border-[var(--app-border)] px-3 py-0 align-middle text-[var(--app-subtle)]">
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
