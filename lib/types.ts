// ─── Tenant / Auth ────────────────────────────────────────────────────────────

export interface Tenant {
  id: string
  name: string
  email: string
  plan_id: 'free' | 'starter' | 'pro'
  status: 'active' | 'suspended'
  stripe_customer_id?: string
  created_at: string
}

export interface AuthResponse {
  tenant: Tenant
  token: string
}

// ─── API Keys ─────────────────────────────────────────────────────────────────

export interface APIKey {
  id: string
  tenant_id: string
  key_prefix: string
  name: string
  scopes: string[]
  status: 'active' | 'revoked' | 'suspended'
  expires_at?: string
  last_used_at?: string
  created_at: string
}

export interface CreateKeyResponse {
  key: APIKey
  secret: string
}

// ─── Usage ────────────────────────────────────────────────────────────────────

export interface UsageSummary {
  total_requests: number
  success_requests: number
  error_requests: number
  avg_latency_ms: number
  total_bytes_sent: number
  quota_limit: number
  quota_used: number
  quota_remaining: number
}

export interface UsageTimeline {
  timestamp: string
  total_requests: number
  error_requests: number
  avg_latency_ms: number
}

export interface EndpointUsage {
  endpoint: string
  method: string
  total_requests: number
  error_rate: number
  avg_latency_ms: number
}

// ─── Billing / Plans ──────────────────────────────────────────────────────────

export interface RateLimitConfig {
  per_second: number
  per_minute: number
}

export interface QuotaConfig {
  monthly: number
}

export interface OverageConfig {
  enabled: boolean
  price_per_request: number
}

export interface Plan {
  id: 'free' | 'starter' | 'pro'
  name: string
  price_monthly: number
  stripe_price_id: string
  rate_limit: RateLimitConfig
  quota: QuotaConfig
  overage?: OverageConfig
}

export interface StripeInvoice {
  id: string
  amount_paid: number
  currency: string
  status: string
  created: number
  invoice_pdf?: string
  hosted_invoice_url?: string
  period_start: number
  period_end: number
}

// ─── Upstreams ────────────────────────────────────────────────────────────────

export interface Target {
  id: string
  upstream_id: string
  url: string
  created_at: string
}

export interface Upstream {
  id: string
  name: string
  load_balance: string
  connect_timeout: string
  response_timeout: string
  retries: number
  targets: Target[]
  created_at: string
  updated_at: string
}

export interface CreateUpstreamRequest {
  name: string
  load_balance: string
  connect_timeout: string
  response_timeout: string
  retries: number
}

export type UpdateUpstreamRequest = Partial<CreateUpstreamRequest>

// ─── Routes ───────────────────────────────────────────────────────────────────

export interface Route {
  id: string
  path_prefix: string
  upstream_id: string
  strip_path: boolean
  created_at: string
  updated_at: string
}

export interface CreateRouteRequest {
  path_prefix: string
  upstream_id: string
  strip_path: boolean
}

export type UpdateRouteRequest = Partial<CreateRouteRequest>

// ─── Generic ─────────────────────────────────────────────────────────────────

export interface ApiError {
  error: string
  message?: string
}
