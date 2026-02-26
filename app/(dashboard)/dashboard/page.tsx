'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  TrendingUp,
  ArrowRight,
  Zap,
  AlertTriangle,
  Server,
  GitBranch,
} from 'lucide-react'
import { subDays, formatISO, format } from 'date-fns'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { usage, keys, upstreams, routes } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import StatCard from '@/components/ui/StatCard'
import QuotaBar from '@/components/ui/QuotaBar'
import type { UsageTimeline } from '@/lib/types'

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`
  return `${Math.round(ms)}ms`
}

const PLAN_LIMITS: Record<string, number> = {
  free: 1,
  starter: 10,
  pro: 100,
}

export default function DashboardPage() {
  const { tenant } = useAuth()
  const [range] = useState(() => ({
    from: formatISO(subDays(new Date(), 29)),
    to: formatISO(new Date()),
  }))

  const { data: summary, isLoading: summaryLoading } = useSWR(
    ['usage-summary', range],
    () => usage.summary(range.from, range.to),
  )

  const { data: timeline, isLoading: timelineLoading } = useSWR(
    ['usage-timeline', range],
    () => usage.timeline(range.from, range.to, 'day'),
  )

  const { data: apiKeys } = useSWR('api-keys', () => keys.list())
  const { data: upstreamList } = useSWR('upstreams', () => upstreams.list())
  const { data: routeList } = useSWR('routes', () => routes.list())

  const activeKeys = apiKeys?.filter((k) => k.status === 'active').length ?? 0

  const chartData = (timeline ?? []).map((t: UsageTimeline) => ({
    date: format(new Date(t.timestamp), 'MMM d'),
    requests: t.total_requests,
    errors: t.error_requests,
    latency: Math.round(t.avg_latency_ms),
  }))

  const rateLimit = PLAN_LIMITS[tenant?.plan_id ?? 'free']

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="card p-5 bg-gradient-to-r from-brand-600 to-brand-700 border-brand-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Welcome back, {tenant?.name?.split(' ')[0]} 👋
            </h2>
            <p className="text-brand-200 text-sm mt-0.5">
              Here&apos;s what&apos;s happening with your API usage in the last 30 days.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium capitalize">{tenant?.plan_id} Plan</span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Requests"
          value={summaryLoading ? '—' : formatNum(summary?.total_requests ?? 0)}
          sublabel="Last 30 days"
          icon={<Activity className="w-5 h-5" />}
          accent="bg-brand-50 text-brand-600"
        />
        <StatCard
          label="Successful"
          value={summaryLoading ? '—' : formatNum(summary?.success_requests ?? 0)}
          sublabel={summaryLoading ? '' : `${summary?.total_requests ? ((summary.success_requests / summary.total_requests) * 100).toFixed(1) : '0'}% success rate`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accent="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Errors"
          value={summaryLoading ? '—' : formatNum(summary?.error_requests ?? 0)}
          sublabel={summaryLoading ? '' : `${summary?.total_requests ? ((summary.error_requests / summary.total_requests) * 100).toFixed(1) : '0'}% error rate`}
          icon={<XCircle className="w-5 h-5" />}
          accent="bg-red-50 text-red-500"
        />
        <StatCard
          label="Avg Latency"
          value={summaryLoading ? '—' : formatMs(summary?.avg_latency_ms ?? 0)}
          sublabel="Average response time"
          icon={<Clock className="w-5 h-5" />}
          accent="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Chart + sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Request timeline */}
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-900">Request Volume</h3>
              <p className="text-sm text-slate-500">Daily requests over the last 30 days</p>
            </div>
            <Link href="/dashboard/usage" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View details <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {timelineLoading ? (
            <div className="h-56 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 600, color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="requests" name="Requests" stroke="#6366f1" strokeWidth={2} fill="url(#reqGrad)" />
                <Area type="monotone" dataKey="errors" name="Errors" stroke="#ef4444" strokeWidth={1.5} fill="url(#errGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">
          {/* Quota */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Monthly Quota</h3>
              <Link href="/dashboard/billing" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
                Upgrade <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {summaryLoading ? (
              <div className="h-12 bg-slate-100 rounded animate-pulse" />
            ) : (
              <QuotaBar
                used={summary?.quota_used ?? 0}
                limit={summary?.quota_limit ?? 1}
              />
            )}
            {summary && summary.quota_remaining <= 0 && (
              <div className="flex items-center gap-2 mt-3 text-amber-600 text-xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                Quota exhausted — requests are being blocked
              </div>
            )}
          </div>

          {/* API Keys */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">API Keys</h3>
              <Link href="/dashboard/keys" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{activeKeys}</p>
                <p className="text-xs text-slate-500">Active keys</p>
              </div>
            </div>
          </div>

          {/* Rate limit */}
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{rateLimit} req/s</p>
                <p className="text-xs text-slate-500">Rate limit ({tenant?.plan_id} plan)</p>
              </div>
            </div>
          </div>

          {/* Gateway config */}
          <div className="card p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Gateway Config</p>
            <div className="space-y-3">
              <Link href="/dashboard/upstreams" className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Server className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm text-slate-700">Upstreams</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold text-slate-900">{upstreamList?.length ?? '—'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-500" />
                </div>
              </Link>
              <div className="h-px bg-slate-100" />
              <Link href="/dashboard/routes" className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <GitBranch className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm text-slate-700">Routes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold text-slate-900">{routeList?.length ?? '—'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-500" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { href: '/dashboard/keys', bg: 'bg-brand-100', text: 'text-brand-600', icon: <Key className="w-4 h-4" />, title: 'Create API Key', sub: 'Generate a new key' },
            { href: '/dashboard/usage', bg: 'bg-emerald-100', text: 'text-emerald-600', icon: <BarChart className="w-4 h-4" />, title: 'View Analytics', sub: 'Detailed usage reports' },
            { href: '/dashboard/upstreams', bg: 'bg-cyan-100', text: 'text-cyan-600', icon: <Server className="w-4 h-4" />, title: 'Add Upstream', sub: 'Configure a backend' },
            { href: '/dashboard/routes', bg: 'bg-amber-100', text: 'text-amber-600', icon: <GitBranch className="w-4 h-4" />, title: 'Add Route', sub: 'Map a path to upstream' },
            { href: '/dashboard/billing', bg: 'bg-purple-100', text: 'text-purple-600', icon: <CreditCard className="w-4 h-4" />, title: 'Upgrade Plan', sub: 'Get higher limits' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-colors group"
            >
              <div className={`w-8 h-8 rounded-lg ${item.bg} ${item.text} flex items-center justify-center shrink-0`}>
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                <p className="text-xs text-slate-500 truncate">{item.sub}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 ml-auto shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// Local icon import to avoid referencing unused imports
function BarChart({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="18" y="3" width="4" height="18" rx="1" />
      <rect x="10" y="8" width="4" height="13" rx="1" />
      <rect x="2" y="13" width="4" height="8" rx="1" />
    </svg>
  )
}

function CreditCard({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  )
}
