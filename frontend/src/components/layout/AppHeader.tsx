'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { ThemeToggleButton } from '@/components/layout/ThemeProvider';
import { ZoomLogo } from '@/components/layout/ZoomLogo';
import { Button } from '@/components/ui/Button';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/titulos': 'Títulos financeiros',
  '/rede/transacoes': 'Transações Rede',
  '/rede/recebiveis': 'Recebíveis Rede',
  '/conciliacao': 'Conciliação',
  '/divergencias': 'Divergências',
  '/auditoria': 'Auditoria',
  '/payloads': 'Payloads brutos',
  '/jobs': 'Jobs',
  '/configuracoes': 'Configurações'
};

export function AppHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const title = titles[pathname] ?? (pathname.startsWith('/titulos/') ? 'Título financeiro' : 'FIP Core');

  return (
    <header className="sticky top-0 z-30 bg-transparent px-4 pt-4 lg:px-5">
      <div className="flex min-h-[70px] items-center justify-between rounded-xl border border-[var(--app-border)] bg-[var(--app-header)] px-4 shadow-sm">
        <div className="flex min-w-0 items-center gap-5">
          <div className="hidden sm:block">
            <ZoomLogo compact />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-[#03437d]">Conciliação Financeira Control Center</h1>
            <p className="truncate text-xs font-medium text-[var(--app-muted)]">{title} · operação, testes e rastreabilidade</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <div className="hidden rounded-md border border-[var(--app-border)] bg-[var(--app-panel)] px-3 py-2 text-xs font-medium text-[var(--app-subtle)] md:block">
            {user?.name ?? 'Operador'}
          </div>
          <Button onClick={logout} title="Sair">
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
