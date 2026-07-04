export type AuthUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

const storageKey = 'fip-core-auth';

export function getSession(): AuthSession | undefined {
  if (typeof window === 'undefined') return undefined;
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return undefined;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    clearSession();
    return undefined;
  }
}

export function setSession(session: AuthSession) {
  window.localStorage.setItem(storageKey, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(storageKey);
  }
}

export function getAuthHeaders(): Record<string, string> {
  const session = getSession();
  return session
    ? {
        Authorization: `Bearer ${session.token}`,
        'x-user-id': session.user.id,
        'x-user-name': session.user.name
      }
    : {};
}

export function hasAnyRole(user: AuthUser | undefined, roles: string[]) {
  if (!user) return false;
  return user.roles.includes('ADMIN') || roles.some((role) => user.roles.includes(role));
}
