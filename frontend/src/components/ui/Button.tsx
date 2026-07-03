import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-emerald-700 text-white hover:bg-emerald-800',
  secondary: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50',
  danger: 'bg-rose-700 text-white hover:bg-rose-800',
  ghost: 'text-slate-700 hover:bg-slate-100'
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
