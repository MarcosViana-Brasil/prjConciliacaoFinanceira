'use client';

import { useState, type FormEvent } from 'react';
import { BriefcaseBusiness } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/components/auth/AuthProvider';
import type { AuthSession } from '@/lib/auth-storage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('change_me');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const payload = (await response.json()) as { success: boolean; data?: AuthSession; error?: { message?: string } };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error?.message ?? 'Falha no login');
      }

      login(payload.data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Falha no login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-sm rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-700 text-white">
            <BriefcaseBusiness size={20} />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-slate-950">FIP Core</h1>
            <p className="text-xs text-slate-500">Acesso ao painel</p>
          </div>
        </div>
        <form className="grid gap-4" onSubmit={submit}>
          {error ? <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div> : null}
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">E-mail</span>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Senha</span>
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <Button disabled={loading} type="submit">
            Entrar
          </Button>
        </form>
      </section>
    </main>
  );
}
