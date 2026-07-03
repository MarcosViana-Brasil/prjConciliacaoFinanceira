import type { ReactNode } from 'react';

export type Column<T> = {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
};

export function Table<T>({ data, columns }: { data: T[]; columns: Column<T>[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            {columns.map((column) => (
              <th key={column.key} className="border-b border-slate-200 px-3 py-3 font-semibold">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-b border-slate-100">
              {columns.map((column) => (
                <td key={column.key} className="border-b border-slate-100 px-3 py-3 align-top text-slate-700">
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
