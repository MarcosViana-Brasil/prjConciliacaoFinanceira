'use client';

import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-950">{title}</h1>
          <p className="text-xs text-slate-500">Operação financeira e rastreabilidade</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-600 sm:block">
            {user?.name ?? 'Operador'}
          </div>
          <Button variant="ghost" onClick={logout} title="Sair">
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </header>
  );
}
