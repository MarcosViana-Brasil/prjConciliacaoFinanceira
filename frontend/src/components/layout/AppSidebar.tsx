'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { ZoomLogo } from '@/components/layout/ZoomLogo';
import { hasAnyRole } from '@/lib/auth-storage';

const items = [
  { href: '/dashboard', label: 'Dashboard', code: 'DB', roles: ['FINANCEIRO', 'AUDITOR', 'SOMENTE_LEITURA'] },
  { href: '/titulos', label: 'Títulos internos', code: 'TI', roles: ['FINANCEIRO', 'AUDITOR', 'SOMENTE_LEITURA'] },
  { href: '/rede/transacoes', label: 'Transações Rede', code: 'TR', roles: ['FINANCEIRO', 'AUDITOR', 'SOMENTE_LEITURA'] },
  { href: '/rede/recebiveis', label: 'Recebíveis Rede', code: 'RR', roles: ['FINANCEIRO', 'AUDITOR', 'SOMENTE_LEITURA'] },
  { href: '/jobs', label: 'Jobs de importação', code: 'JB', roles: ['FINANCEIRO', 'AUDITOR'] },
  { href: '/conciliacao', label: 'Executar conciliação', code: 'EC', roles: ['FINANCEIRO', 'AUDITOR', 'SOMENTE_LEITURA'] },
  { href: '/divergencias', label: 'Analisar divergências', code: 'AD', roles: ['FINANCEIRO', 'AUDITOR', 'SOMENTE_LEITURA'] },
  { href: '/payloads', label: 'Payloads e reprocessos', code: 'PR', roles: ['FINANCEIRO', 'AUDITOR'] },
  { href: '/auditoria', label: 'Auditoria', code: 'AU', roles: ['AUDITOR'] },
  { href: '/configuracoes', label: 'Configurações', code: 'CF', roles: ['ADMIN'] }
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[200px] text-white lg:block" style={{ backgroundColor: '#071625' }}>
      <div className="flex h-[104px] items-center px-4">
        <ZoomLogo inverted />
      </div>
      <nav className="space-y-3 px-6 py-4">
        {items.filter((item) => hasAnyRole(user, item.roles)).map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex min-h-10 items-center gap-3 rounded-md text-xs font-semibold transition ${
                active ? 'text-white' : 'text-blue-50 hover:text-white'
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-black tracking-normal transition ${
                  active ? 'bg-[#2f83d0] text-white shadow-sm' : 'text-white group-hover:bg-[#2a3c4d]'
                }`}
                style={active ? undefined : { backgroundColor: '#202E3B' }}
              >
                {item.code}
              </span>
              <span className="leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
