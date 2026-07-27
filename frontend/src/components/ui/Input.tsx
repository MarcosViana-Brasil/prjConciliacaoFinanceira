import type { InputHTMLAttributes } from 'react';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-10 w-full rounded-md border border-[var(--app-border-strong)] bg-[var(--app-input)] px-3 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)] focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 ${props.className ?? ''}`}
    />
  );
}
