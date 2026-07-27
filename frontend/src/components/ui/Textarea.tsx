import type { TextareaHTMLAttributes } from 'react';

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-24 w-full rounded-md border border-[var(--app-border-strong)] bg-[var(--app-input)] px-3 py-2 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)] focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 ${props.className ?? ''}`}
    />
  );
}
