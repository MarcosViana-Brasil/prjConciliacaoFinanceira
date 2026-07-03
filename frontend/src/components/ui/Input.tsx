import type { InputHTMLAttributes } from 'react';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 ${props.className ?? ''}`}
    />
  );
}
