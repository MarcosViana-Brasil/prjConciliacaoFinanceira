import type { SelectHTMLAttributes } from 'react';

export type SelectOption = {
  value: string;
  label: string;
};

export function Select({ options, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { options: SelectOption[] }) {
  return (
    <select
      {...props}
      className={`h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 ${props.className ?? ''}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
