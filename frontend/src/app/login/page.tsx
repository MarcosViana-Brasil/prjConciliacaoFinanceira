'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/components/auth/AuthProvider'
import { ThemeToggleButton } from '@/components/layout/ThemeProvider'
import { ZoomLogo } from '@/components/layout/ZoomLogo'
import type { AuthSession } from '@/lib/auth-storage'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default function LoginPage() {
    const { login } = useAuth()
    const [email, setEmail] = useState('admin@example.com')
    const [password, setPassword] = useState('change_me')
    const [error, setError] = useState<string>()
    const [loading, setLoading] = useState(false)

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(undefined)

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            const payload = (await response.json()) as { success: boolean; data?: AuthSession; error?: { message?: string } }

            if (!response.ok || !payload.success || !payload.data) {
                throw new Error(payload.error?.message ?? 'Falha no login')
            }

            login(payload.data)
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Falha no login')
        } finally {
            setLoading(false)
        }
    }

    return (
        // <main className="app-wallpaper flex min-h-screen items-center justify-center px-4">
        <main className="flex min-h-screen items-center justify-center px-4">
            <div className="fixed right-4 top-4">
                <ThemeToggleButton />
            </div>
            <section className="w-full max-w-sm rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] p-6 shadow-xl shadow-slate-900/10">
                <div className="mb-6">
                    <ZoomLogo />
                    <h1 className="mt-5 text-lg font-bold text-[var(--app-text)]">Entrar no painel</h1>
                    <p className="text-xs font-medium text-[var(--app-muted)]">Conciliação financeira e testes operacionais</p>
                </div>
                <form className="grid gap-4" onSubmit={submit}>
                    {error ? <div className="rounded-md border border-[var(--app-danger-border)] bg-[var(--app-danger-bg)] p-3 text-sm text-[var(--app-danger-text)]">{error}</div> : null}
                    <label className="grid gap-1 text-sm">
                        <span className="font-medium text-[var(--app-subtle)]">E-mail</span>
                        <Input value={email} onChange={(event) => setEmail(event.target.value)} />
                    </label>
                    <label className="grid gap-1 text-sm">
                        <span className="font-medium text-[var(--app-subtle)]">Senha</span>
                        <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                    </label>
                    <Button disabled={loading} type="submit">
                        Entrar
                    </Button>
                </form>
            </section>
        </main>
    )
}
