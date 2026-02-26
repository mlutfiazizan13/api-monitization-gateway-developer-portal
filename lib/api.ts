import type {
  AuthResponse,
  Tenant,
  APIKey,
  CreateKeyResponse,
  UsageSummary,
  UsageTimeline,
  EndpointUsage,
  Plan,
  StripeInvoice,
  Upstream,
  CreateUpstreamRequest,
  UpdateUpstreamRequest,
  Target,
  Route,
  CreateRouteRequest,
  UpdateRouteRequest,
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth: 'jwt' | 'none' = 'jwt',
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (auth === 'jwt') {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(body.error || body.message || `Request failed: ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  register: (data: { name: string; email: string; password: string }) =>
    request<Tenant>('/auth/register', { method: 'POST', body: JSON.stringify(data) }, 'none'),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }, 'none'),
}

// ─── Account ──────────────────────────────────────────────────────────────────

export const account = {
  me: () => request<Tenant>('/me'),
}

// ─── API Keys ─────────────────────────────────────────────────────────────────

export const keys = {
  list: () => request<APIKey[]>('/keys'),

  create: (data: { name: string; scopes: string[] }) =>
    request<CreateKeyResponse>('/keys', { method: 'POST', body: JSON.stringify(data) }),

  delete: (keyId: string) =>
    request<void>(`/keys/${keyId}`, { method: 'DELETE' }),

  rotate: (keyId: string) =>
    request<CreateKeyResponse>(`/keys/${keyId}/rotate`, { method: 'POST' }),
}

// ─── Usage ────────────────────────────────────────────────────────────────────

export const usage = {
  summary: (from: string, to: string) =>
    request<UsageSummary>(`/usage?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),

  timeline: (from: string, to: string, granularity: 'hour' | 'day' | 'minute' = 'day') =>
    request<UsageTimeline[]>(
      `/usage/timeline?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&granularity=${granularity}`,
    ),

  endpoints: (from: string, to: string) =>
    request<EndpointUsage[]>(
      `/usage/endpoints?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    ),
}

// ─── Billing ──────────────────────────────────────────────────────────────────

export const billing = {
  plan: () => request<Plan>('/billing/plan'),

  upgrade: (plan_id: string) =>
    request<{ message: string }>('/billing/upgrade', {
      method: 'POST',
      body: JSON.stringify({ plan_id }),
    }),

  invoices: () => request<StripeInvoice[]>('/billing/invoices'),

  portal: (return_url: string) =>
    request<{ url: string }>(`/billing/portal?return_url=${encodeURIComponent(return_url)}`),
}

// ─── Upstreams ────────────────────────────────────────────────────────────────

export const upstreams = {
  list: () => request<Upstream[]>('/upstreams'),

  get: (id: string) => request<Upstream>(`/upstreams/${id}`),

  create: (data: CreateUpstreamRequest) =>
    request<Upstream>('/upstreams', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UpdateUpstreamRequest) =>
    request<Upstream>(`/upstreams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => request<void>(`/upstreams/${id}`, { method: 'DELETE' }),

  addTarget: (upstreamId: string, url: string) =>
    request<Target>(`/upstreams/${upstreamId}/targets`, {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),

  removeTarget: (upstreamId: string, targetId: string) =>
    request<void>(`/upstreams/${upstreamId}/targets/${targetId}`, { method: 'DELETE' }),
}

// ─── Routes ───────────────────────────────────────────────────────────────────

export const routes = {
  list: () => request<Route[]>('/routes'),

  get: (id: string) => request<Route>(`/routes/${id}`),

  create: (data: CreateRouteRequest) =>
    request<Route>('/routes', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UpdateRouteRequest) =>
    request<Route>(`/routes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => request<void>(`/routes/${id}`, { method: 'DELETE' }),
}
