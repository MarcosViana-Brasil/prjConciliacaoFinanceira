'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearSession, getSession, setSession, type AuthSession, type AuthUser } from '@/lib/auth-storage';

type AuthContextValue = {
  user?: AuthUser;
  login: (session: AuthSession) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setCurrentSession] = useState<AuthSession>();
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const stored = getSession();
    setCurrentSession(stored);
    setReady(true);

    if (!stored && pathname !== '/login') {
      router.replace('/login');
    }
  }, [pathname, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user,
      login(nextSession) {
        setSession(nextSession);
        setCurrentSession(nextSession);
        router.replace('/dashboard');
      },
      logout() {
        clearSession();
        setCurrentSession(undefined);
        router.replace('/login');
      }
    }),
    [router, session?.user]
  );

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Carregando...</div>;
  }

  if (!session && pathname !== '/login') {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Redirecionando...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
}
