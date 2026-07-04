import type { ApiResponse, QueryParams } from '@/types/api';
import { clearSession, getAuthHeaders } from '@/lib/auth-storage';
import { ApiError } from './errors';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type RequestOptions = {
  query?: QueryParams;
  body?: unknown;
  headers?: HeadersInit;
};

function buildUrl(path: string, query?: QueryParams) {
  const url = new URL(path.startsWith('/api') ? path : `/api${path}`, API_BASE_URL);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  Object.entries(getAuthHeaders()).forEach(([key, value]) => headers.set(key, value));

  const response = await fetch(buildUrl(path, options.query), {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: 'no-store'
  });
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (response.status === 401) {
    handleUnauthorized();
  }

  if (!response.ok || !payload?.success) {
    const error = payload && !payload.success ? payload.error : undefined;
    throw new ApiError(error?.message ?? 'Falha na requisicao.', error?.code, error?.details);
  }

  return payload.data;
}

async function requestList<T>(path: string, query?: QueryParams) {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  Object.entries(getAuthHeaders()).forEach(([key, value]) => headers.set(key, value));

  const response = await fetch(buildUrl(path, query), {
    headers,
    cache: 'no-store'
  });
  const payload = (await response.json().catch(() => null)) as ApiResponse<T[]> | null;

  if (response.status === 401) {
    handleUnauthorized();
  }

  if (!response.ok || !payload?.success) {
    const error = payload && !payload.success ? payload.error : undefined;
    throw new ApiError(error?.message ?? 'Falha na requisicao.', error?.code, error?.details);
  }

  return { data: payload.data, pagination: payload.pagination };
}

export const api = {
  get: <T>(path: string, query?: QueryParams) => request<T>('GET', path, { query }),
  list: requestList,
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, { body }),
  delete: <T>(path: string, body?: unknown) => request<T>('DELETE', path, { body })
};

function handleUnauthorized() {
  clearSession();

  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}
