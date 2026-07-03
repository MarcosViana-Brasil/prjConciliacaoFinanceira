'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BriefcaseBusiness,
  Database,
  FileClock,
  FileText,
  Gauge,
  Landmark,
  Scale,
  Settings,
  ShieldCheck,
  TriangleAlert
} from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: Gauge },
  { href: '/titulos', label: 'Títulos', icon: FileText },
  { href: '/rede/transacoes', label: 'Transações Rede', icon: Activity },
  { href: '/rede/recebiveis', label: 'Recebíveis Rede', icon: Landmark },
  { href: '/conciliacao', label: 'Conciliação', icon: Scale },
  { href: '/divergencias', label: 'Divergências', icon: TriangleAlert },
  { href: '/auditoria', label: 'Auditoria', icon: ShieldCheck },
  { href: '/payloads', label: 'Payloads', icon: Database },
  { href: '/jobs', label: 'Jobs', icon: FileClock },
  { href: '/configuracoes', label: 'Configurações', icon: Settings }
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-700 text-white">
          <BriefcaseBusiness size={19} />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-950">FIP Core</p>
          <p className="text-xs text-slate-500">Conciliação financeira</p>
        </div>
      </div>
      <nav className="space-y-1 p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium ${
                active ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
