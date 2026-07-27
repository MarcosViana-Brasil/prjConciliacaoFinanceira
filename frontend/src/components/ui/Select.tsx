import type { SelectHTMLAttributes } from 'react';

export type SelectOption = {
  value: string;
  label: string;
};

export function Select({ options, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { options: SelectOption[] }) {
  return (
    <select
      {...props}
      className={`h-10 w-full rounded-md border border-[var(--app-border-strong)] bg-[var(--app-input)] px-3 text-sm text-[var(--app-text)] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 ${props.className ?? ''}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
