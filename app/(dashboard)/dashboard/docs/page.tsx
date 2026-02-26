'use client'

import { useState } from 'react'
import {
  BookOpen,
  Copy,
  Check,
  ChevronRight,
  Terminal,
  Shield,
  Zap,
  BarChart2,
  CreditCard,
  Globe,
  AlertCircle,
  Key,
  Server,
  GitBranch,
} from 'lucide-react'
import clsx from 'clsx'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// ─── Code block ───────────────────────────────────────────────────────────────
function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative group rounded-lg bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/60 border-b border-slate-700/60">
        <span className="text-xs text-slate-400 font-mono">{language}</span>
        <button onClick={copy} className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-slate-400 hover:text-white">
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="px-4 py-3 text-sm text-slate-100 font-mono overflow-x-auto leading-relaxed">{code}</pre>
    </div>
  )
}

// ─── Method badge ──────────────────────────────────────────────────────────────
function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    POST: 'bg-blue-100 text-blue-700 border border-blue-200',
    DELETE: 'bg-red-100 text-red-700 border border-red-200',
    PUT: 'bg-amber-100 text-amber-700 border border-amber-200',
    ANY: 'bg-purple-100 text-purple-700 border border-purple-200',
  }
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono', colors[method] ?? colors.GET)}>
      {method}
    </span>
  )
}

// ─── Endpoint doc ──────────────────────────────────────────────────────────────
interface EndpointProps {
  method: string
  path: string
  description: string
  auth?: string
  request?: string
  response?: string
  example?: string
}

function Endpoint({ method, path, description, auth, request, response, example }: EndpointProps) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-slate-50/80 transition-colors text-left"
      >
        <MethodBadge method={method} />
        <code className="text-sm font-mono text-slate-700 flex-1">{path}</code>
        <span className="text-xs text-slate-400 hidden sm:block">{description}</span>
        <ChevronRight className={clsx('w-4 h-4 text-slate-400 transition-transform shrink-0', open && 'rotate-90')} />
      </button>

      {open && (
        <div className="border-t border-slate-100 px-4 py-4 bg-slate-50/50 space-y-4">
          <p className="text-sm text-slate-600">{description}</p>

          {auth && (
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">Auth required: <span className="font-medium text-slate-700">{auth}</span></span>
            </div>
          )}

          {request && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Request Body</p>
              <CodeBlock code={request} language="json" />
            </div>
          )}

          {response && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Response</p>
              <CodeBlock code={response} language="json" />
            </div>
          )}

          {example && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Example</p>
              <CodeBlock code={example} language="bash" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Nav section ──────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'quickstart', label: 'Quick Start', icon: Zap },
  { id: 'authentication', label: 'Authentication', icon: Shield },
  { id: 'keys', label: 'API Keys', icon: Key },
  { id: 'upstreams', label: 'Upstreams', icon: Server },
  { id: 'routes-doc', label: 'Routes', icon: GitBranch },
  { id: 'gateway', label: 'Gateway', icon: Globe },
  { id: 'usage', label: 'Usage Analytics', icon: BarChart2 },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'errors', label: 'Errors', icon: AlertCircle },
]

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('quickstart')

  const scrollTo = (id: string) => {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex gap-6 relative">
      {/* Sidebar nav */}
      <aside className="hidden xl:block w-48 shrink-0">
        <div className="sticky top-0 space-y-0.5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 mb-2">Contents</p>
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={clsx(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                activeSection === id
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-10">
        {/* Quick Start */}
        <section id="quickstart" className="scroll-mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Quick Start</h2>
          </div>

          <div className="card p-5 space-y-4">
            <p className="text-sm text-slate-600">
              Get up and running with the API Gateway in minutes. The gateway proxies requests to your upstream
              API while handling authentication, rate limiting, and usage tracking automatically.
            </p>

            <div className="space-y-3">
              {[
                { step: '1', title: 'Register an account', desc: 'Create your developer account to get started.' },
                { step: '2', title: 'Create an API key', desc: 'Generate a key from the API Keys section.' },
                { step: '3', title: 'Make your first request', desc: `Send requests to ${API_BASE}/gateway/{path} with your key.` },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {s.step}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{s.title}</p>
                    <p className="text-xs text-slate-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">First request</p>
              <CodeBlock
                language="bash"
                code={`curl -X GET ${API_BASE}/gateway/your-endpoint \\
  -H "Authorization: Bearer gw_your_api_key_here"`}
              />
            </div>
          </div>
        </section>

        {/* Authentication */}
        <section id="authentication" className="scroll-mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Authentication</h2>
          </div>

          <div className="card p-5 space-y-5">
            <p className="text-sm text-slate-600">
              The gateway uses two authentication mechanisms: <strong>JWT tokens</strong> for the developer portal API,
              and <strong>API keys</strong> for proxied gateway requests.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-500" /> JWT (Portal API)
                </h4>
                <p className="text-xs text-slate-600 mb-3">Used for account management, key CRUD, usage data, and billing endpoints.</p>
                <CodeBlock language="http" code={`Authorization: Bearer eyJhbGc...`} />
                <p className="text-xs text-slate-400 mt-2">Token expires after 24 hours.</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-500" /> API Key (Gateway)
                </h4>
                <p className="text-xs text-slate-600 mb-3">Used for all proxied requests through the <code className="font-mono text-xs">/gateway</code> endpoint.</p>
                <CodeBlock language="http" code={`Authorization: Bearer gw_a1b2c3...
X-API-Key: gw_a1b2c3...
?api_key=gw_a1b2c3...`} />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800 text-sm">Auth Endpoints</h3>
              <Endpoint
                method="POST"
                path="/auth/register"
                description="Create a new developer account"
                request={`{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}`}
                response={`{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "plan_id": "free",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z"
}`}
                example={`curl -X POST ${API_BASE}/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"name":"John","email":"john@example.com","password":"pass123"}'`}
              />
              <Endpoint
                method="POST"
                path="/auth/login"
                description="Sign in and receive a JWT token"
                request={`{
  "email": "john@example.com",
  "password": "securepassword123"
}`}
                response={`{
  "tenant": { "id": "uuid", "name": "John Doe", ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`}
                example={`curl -X POST ${API_BASE}/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"john@example.com","password":"pass123"}'`}
              />
              <Endpoint
                method="GET"
                path="/me"
                description="Get your account details"
                auth="JWT"
                response={`{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "plan_id": "starter",
  "status": "active",
  "stripe_customer_id": "cus_xxx",
  "created_at": "2024-01-01T00:00:00Z"
}`}
                example={`curl ${API_BASE}/me \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`}
              />
            </div>
          </div>
        </section>

        {/* API Keys */}
        <section id="keys" className="scroll-mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">API Keys</h2>
          </div>

          <div className="card p-5 space-y-4">
            <p className="text-sm text-slate-600">
              API keys authenticate gateway requests. Keys use a <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">gw_</code> prefix
              followed by 48 hex characters. The raw key is shown only once on creation.
            </p>

            <div className="space-y-3">
              <Endpoint
                method="GET"
                path="/keys"
                description="List all your API keys"
                auth="JWT"
                response={`[
  {
    "id": "uuid",
    "name": "Production",
    "key_prefix": "gw_a1b2c3d4e5f6",
    "scopes": ["read", "write"],
    "status": "active",
    "last_used_at": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-01T00:00:00Z"
  }
]`}
                example={`curl ${API_BASE}/keys \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`}
              />
              <Endpoint
                method="POST"
                path="/keys"
                description="Create a new API key"
                auth="JWT"
                request={`{
  "name": "Production App",
  "scopes": ["read", "write"]
}`}
                response={`{
  "key": {
    "id": "uuid",
    "name": "Production App",
    "key_prefix": "gw_a1b2c3d4e5f6",
    "scopes": ["read", "write"],
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "secret": "gw_a1b2c3d4e5f6789abcdef0123456789abcdef0123456789"
}`}
                example={`curl -X POST ${API_BASE}/keys \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Production","scopes":["read","write"]}'`}
              />
              <Endpoint
                method="DELETE"
                path="/keys/{keyId}"
                description="Revoke an API key permanently"
                auth="JWT"
                example={`curl -X DELETE ${API_BASE}/keys/YOUR_KEY_ID \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`}
              />
              <Endpoint
                method="POST"
                path="/keys/{keyId}/rotate"
                description="Rotate a key — generates a new secret, invalidates the old one"
                auth="JWT"
                response={`{
  "key": { ... },
  "secret": "gw_new_secret_key_here..."
}`}
                example={`curl -X POST ${API_BASE}/keys/YOUR_KEY_ID/rotate \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`}
              />
            </div>
          </div>
        </section>

        {/* Upstreams */}
        <section id="upstreams" className="scroll-mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Upstreams</h2>
          </div>

          <div className="card p-5 space-y-4">
            <p className="text-sm text-slate-600">
              Upstreams represent named backend services with one or more target URLs. The gateway load-balances
              across targets using the configured strategy.
            </p>

            <div className="space-y-3">
              <Endpoint
                method="GET"
                path="/upstreams"
                description="List all configured upstreams"
                auth="JWT"
                response={`[
  {
    "id": "uuid",
    "name": "payments-service",
    "load_balance": "round-robin",
    "connect_timeout": "5s",
    "response_timeout": "30s",
    "retries": 3,
    "targets": [
      { "id": "uuid", "upstream_id": "uuid", "url": "http://payments:3001", "created_at": "..." },
      { "id": "uuid", "upstream_id": "uuid", "url": "http://payments:3002", "created_at": "..." }
    ],
    "created_at": "...",
    "updated_at": "..."
  }
]`}
              />
              <Endpoint
                method="POST"
                path="/upstreams"
                description="Create a new upstream"
                auth="JWT"
                request={`{
  "name": "payments-service",
  "load_balance": "round-robin",
  "connect_timeout": "5s",
  "response_timeout": "30s",
  "retries": 3
}`}
                example={`curl -X POST ${API_BASE}/upstreams \\
  -H "Authorization: Bearer YOUR_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"payments-service","load_balance":"round-robin","connect_timeout":"5s","response_timeout":"30s","retries":3}'`}
              />
              <Endpoint
                method="GET"
                path="/upstreams/{upstreamId}"
                description="Get a specific upstream with its targets"
                auth="JWT"
              />
              <Endpoint
                method="PUT"
                path="/upstreams/{upstreamId}"
                description="Update upstream configuration (all fields optional)"
                auth="JWT"
                request={`{
  "name": "payments-v2",
  "load_balance": "least-connections",
  "retries": 5
}`}
              />
              <Endpoint
                method="DELETE"
                path="/upstreams/{upstreamId}"
                description="Delete an upstream — fails with 409 if any routes reference it"
                auth="JWT"
              />
              <Endpoint
                method="POST"
                path="/upstreams/{upstreamId}/targets"
                description="Add a backend target URL to the upstream"
                auth="JWT"
                request={`{ "url": "http://payments:3003" }`}
                response={`{
  "id": "uuid",
  "upstream_id": "uuid",
  "url": "http://payments:3003",
  "created_at": "2024-01-01T00:00:00Z"
}`}
              />
              <Endpoint
                method="DELETE"
                path="/upstreams/{upstreamId}/targets/{targetId}"
                description="Remove a target — fails with 409 if it's the last target"
                auth="JWT"
              />
            </div>

            <div className="bg-slate-50 rounded-lg p-4 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-700">Load Balancing Strategies</p>
              <p><code className="font-mono">round-robin</code> — cycles through targets in order</p>
              <p><code className="font-mono">random</code> — picks a random target per request</p>
              <p><code className="font-mono">least-connections</code> — routes to the target with fewest active connections</p>
            </div>
          </div>
        </section>

        {/* Routes */}
        <section id="routes-doc" className="scroll-mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <GitBranch className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Routes</h2>
          </div>

          <div className="card p-5 space-y-4">
            <p className="text-sm text-slate-600">
              Routes map an incoming path prefix to an upstream. Routes are sorted by specificity (longest prefix
              first) so more specific routes take priority. Changes take effect immediately without restart.
            </p>

            <div className="space-y-3">
              <Endpoint
                method="GET"
                path="/routes"
                description="List all routes, sorted by path prefix specificity"
                auth="JWT"
                response={`[
  {
    "id": "uuid",
    "path_prefix": "/payments",
    "upstream_id": "uuid",
    "strip_path": true,
    "created_at": "...",
    "updated_at": "..."
  }
]`}
              />
              <Endpoint
                method="POST"
                path="/routes"
                description="Create a new route"
                auth="JWT"
                request={`{
  "path_prefix": "/payments",
  "upstream_id": "your-upstream-uuid",
  "strip_path": true
}`}
                example={`# With strip_path: requests to /gateway/payments/orders
# are forwarded as /orders to the upstream
curl -X POST ${API_BASE}/routes \\
  -H "Authorization: Bearer YOUR_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{"path_prefix":"/payments","upstream_id":"uuid","strip_path":true}'`}
              />
              <Endpoint
                method="GET"
                path="/routes/{routeId}"
                description="Get a specific route"
                auth="JWT"
              />
              <Endpoint
                method="PUT"
                path="/routes/{routeId}"
                description="Update a route (all fields optional)"
                auth="JWT"
                request={`{
  "path_prefix": "/payments/v2",
  "strip_path": false
}`}
              />
              <Endpoint
                method="DELETE"
                path="/routes/{routeId}"
                description="Delete a route — traffic to this prefix will return 502"
                auth="JWT"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-amber-800 mb-1">Strip Path Behaviour</p>
              <p className="text-xs text-amber-700">
                When <code className="font-mono">strip_path: true</code>, the matched prefix is removed before forwarding.
                Example: <code className="font-mono">/gateway/payments/orders</code> → <code className="font-mono">/orders</code>.
                When <code className="font-mono">false</code>, the full path is preserved.
              </p>
            </div>
          </div>
        </section>

        {/* Gateway */}
        <section id="gateway" className="scroll-mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Gateway</h2>
          </div>

          <div className="card p-5 space-y-5">
            <p className="text-sm text-slate-600">
              The gateway proxies all requests to the upstream API after authenticating your key and enforcing rate limits and quotas.
              The <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">/gateway</code> prefix is stripped before forwarding.
            </p>

            <div className="space-y-3">
              <Endpoint
                method="ANY"
                path="/gateway/{path}"
                description="Proxy any HTTP method to the upstream API"
                auth="API Key"
                example={`# GET request
curl ${API_BASE}/gateway/users \\
  -H "X-API-Key: gw_your_key_here"

# POST request
curl -X POST ${API_BASE}/gateway/orders \\
  -H "Authorization: Bearer gw_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"product_id": "123", "quantity": 2}'

# With query parameter
curl "${API_BASE}/gateway/search?q=hello&api_key=gw_your_key_here"`}
              />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Response Headers</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 pr-4 font-semibold text-slate-600">Header</th>
                      <th className="text-left py-2 font-semibold text-slate-600">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      ['X-RateLimit-Limit', 'Max requests per second for your plan'],
                      ['X-Quota-Limit', 'Monthly request quota'],
                      ['X-Quota-Remaining', 'Remaining requests this month'],
                      ['Retry-After', 'Seconds to wait after being rate limited (429 only)'],
                    ].map(([header, desc]) => (
                      <tr key={header}>
                        <td className="py-2 pr-4 font-mono text-brand-700">{header}</td>
                        <td className="py-2 text-slate-500">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-amber-800 mb-1.5 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Rate Limiting
              </h4>
              <p className="text-xs text-amber-700">
                Requests that exceed your plan&apos;s rate limit return <strong>429 Too Many Requests</strong>.
                The gateway uses a sliding window algorithm — spreading your requests over time
                prevents throttling.
              </p>
            </div>
          </div>
        </section>

        {/* Usage Analytics */}
        <section id="usage" className="scroll-mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Usage Analytics</h2>
          </div>

          <div className="card p-5 space-y-3">
            <p className="text-sm text-slate-600 mb-4">
              Query usage metrics for your account. All timestamps use RFC 3339 format.
            </p>
            <Endpoint
              method="GET"
              path="/usage?from=&to="
              description="Get usage summary for a time range"
              auth="JWT"
              example={`curl "${API_BASE}/usage?from=2024-01-01T00:00:00Z&to=2024-01-31T23:59:59Z" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`}
              response={`{
  "total_requests": 12500,
  "success_requests": 12100,
  "error_requests": 400,
  "avg_latency_ms": 142,
  "total_bytes_sent": 5242880,
  "quota_limit": 100000,
  "quota_used": 12500,
  "quota_remaining": 87500
}`}
            />
            <Endpoint
              method="GET"
              path="/usage/timeline?from=&to=&granularity=hour|day|minute"
              description="Time-series request data for charting"
              auth="JWT"
              response={`[
  {
    "timestamp": "2024-01-15T00:00:00Z",
    "total_requests": 450,
    "error_requests": 12,
    "avg_latency_ms": 135
  },
  ...
]`}
              example={`curl "${API_BASE}/usage/timeline?from=2024-01-01T00:00:00Z&to=2024-01-31T23:59:59Z&granularity=day" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`}
            />
            <Endpoint
              method="GET"
              path="/usage/endpoints?from=&to="
              description="Per-endpoint breakdown of usage"
              auth="JWT"
              response={`[
  {
    "endpoint": "/users",
    "method": "GET",
    "total_requests": 5200,
    "error_rate": 1.2,
    "avg_latency_ms": 95
  },
  ...
]`}
            />
          </div>
        </section>

        {/* Billing */}
        <section id="billing" className="scroll-mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Billing</h2>
          </div>

          <div className="card p-5 space-y-3">
            <p className="text-sm text-slate-600 mb-4">Manage your subscription and access billing history.</p>
            <Endpoint
              method="GET"
              path="/billing/plan"
              description="Get details of your current plan"
              auth="JWT"
              response={`{
  "id": "starter",
  "name": "Starter",
  "price_monthly": 2900,
  "rate_limit": { "per_second": 10, "per_minute": 300 },
  "quota": { "monthly": 100000 },
  "overage": { "enabled": true, "price_per_request": 0.001 }
}`}
            />
            <Endpoint
              method="POST"
              path="/billing/upgrade"
              description="Change your subscription plan"
              auth="JWT"
              request={`{ "plan_id": "starter" }`}
              response={`{ "message": "plan updated successfully" }`}
            />
            <Endpoint
              method="GET"
              path="/billing/invoices"
              description="List your billing history"
              auth="JWT"
              response={`[
  {
    "id": "in_xxx",
    "amount_paid": 2900,
    "currency": "usd",
    "status": "paid",
    "created": 1706745600,
    "period_start": 1704067200,
    "period_end": 1706745599,
    "invoice_pdf": "https://...",
    "hosted_invoice_url": "https://..."
  }
]`}
            />
            <Endpoint
              method="GET"
              path="/billing/portal?return_url="
              description="Get a Stripe billing portal URL"
              auth="JWT"
              response={`{ "url": "https://billing.stripe.com/session/..." }`}
            />
          </div>
        </section>

        {/* Errors */}
        <section id="errors" className="scroll-mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Error Codes</h2>
          </div>

          <div className="card p-5">
            <p className="text-sm text-slate-600 mb-4">
              All errors return a JSON body with an <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">error</code> field.
            </p>
            <CodeBlock language="json" code={`{
  "error": "unauthorized",
  "message": "Invalid or expired API key"
}`} />

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 pr-4 font-semibold text-slate-600 text-xs">Status</th>
                    <th className="text-left py-2 pr-4 font-semibold text-slate-600 text-xs">Error Code</th>
                    <th className="text-left py-2 font-semibold text-slate-600 text-xs">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['400', 'invalid_input', 'Request body or parameters are malformed'],
                    ['401', 'unauthorized', 'Missing or invalid JWT / API key'],
                    ['403', 'forbidden', 'Authenticated but not permitted (e.g., key revoked)'],
                    ['404', 'not_found', 'Resource does not exist'],
                    ['409', 'conflict', 'Resource already exists (e.g., duplicate email)'],
                    ['429', 'rate_limited', 'Too many requests — slow down'],
                    ['429', 'quota_exceeded', 'Monthly quota exhausted'],
                    ['500', 'internal', 'Unexpected server error'],
                    ['502', 'bad_gateway', 'Upstream API returned an error'],
                  ].map(([status, code, desc]) => (
                    <tr key={code}>
                      <td className="py-2.5 pr-4">
                        <span className={clsx('badge font-mono text-xs', {
                          'badge-red': ['401','403','429','500','502'].includes(status),
                          'badge-yellow': status === '400' || status === '409',
                          'badge-blue': status === '404',
                        })}>
                          {status}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-xs text-slate-700">{code}</td>
                      <td className="py-2.5 text-slate-500 text-xs">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SDK examples */}
        <section className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">SDK Examples</h3>
              <p className="text-xs text-slate-500">Making requests in popular languages</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">JavaScript / Node.js</p>
              <CodeBlock language="javascript" code={`const response = await fetch('${API_BASE}/gateway/your-endpoint', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer gw_your_api_key_here',
    'Content-Type': 'application/json',
  },
})

const data = await response.json()
console.log(data)`} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Python</p>
              <CodeBlock language="python" code={`import requests

headers = {"Authorization": "Bearer gw_your_api_key_here"}
response = requests.get("${API_BASE}/gateway/your-endpoint", headers=headers)
print(response.json())`} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Go</p>
              <CodeBlock language="go" code={`req, _ := http.NewRequest("GET", "${API_BASE}/gateway/your-endpoint", nil)
req.Header.Set("Authorization", "Bearer gw_your_api_key_here")

client := &http.Client{}
resp, err := client.Do(req)
defer resp.Body.Close()`} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">cURL</p>
              <CodeBlock language="bash" code={`curl -X GET ${API_BASE}/gateway/your-endpoint \\
  -H "Authorization: Bearer gw_your_api_key_here" \\
  -H "Accept: application/json"`} />
            </div>
          </div>
        </section>

        {/* Swagger link */}
        <div className="card p-5 bg-gradient-to-r from-brand-50 to-indigo-50 border-brand-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Interactive API Reference</p>
                <p className="text-sm text-slate-500">Explore and test all endpoints with Swagger UI</p>
              </div>
            </div>
            <a
              href={`${API_BASE}/swagger/index.html`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary shrink-0"
            >
              Open Swagger UI
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
