'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AuthProvider>
      {pathname === '/login' ? (
        children
      ) : (
        <>
          <AppSidebar />
          <div className="min-h-screen lg:pl-64">
            <AppHeader />
            {children}
          </div>
        </>
      )}
    </AuthProvider>
  );
}
