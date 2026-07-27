import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-violet-600 text-white shadow-lg shadow-violet-950/25 hover:bg-violet-500',
  secondary: 'border border-[var(--app-border-strong)] bg-[var(--app-panel-soft)] text-[var(--app-text)] hover:bg-[var(--app-panel-muted)]',
  danger: 'bg-rose-700 text-white hover:bg-rose-800',
  ghost: 'text-[var(--app-subtle)] hover:bg-[var(--app-panel-soft)] hover:text-[var(--app-text)]'
};

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
