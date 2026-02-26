'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { subDays, formatISO, format, startOfDay, endOfDay } from 'date-fns'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Activity, CheckCircle2, XCircle, Clock, Database, TrendingUp } from 'lucide-react'
import { usage } from '@/lib/api'
import StatCard from '@/components/ui/StatCard'
import QuotaBar from '@/components/ui/QuotaBar'

type Granularity = 'hour' | 'day'
type RangePreset = '7d' | '14d' | '30d'

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function formatBytes(b: number): string {
  if (b >= 1_073_741_824) return `${(b / 1_073_741_824).toFixed(2)} GB`
  if (b >= 1_048_576) return `${(b / 1_048_576).toFixed(2)} MB`
  if (b >= 1_024) return `${(b / 1_024).toFixed(1)} KB`
  return `${b} B`
}

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`
  return `${Math.round(ms)}ms`
}

const PRESETS: { label: string; value: RangePreset; days: number }[] = [
  { label: '7 days', value: '7d', days: 7 },
  { label: '14 days', value: '14d', days: 14 },
  { label: '30 days', value: '30d', days: 30 },
]

export default function UsagePage() {
  const [preset, setPreset] = useState<RangePreset>('30d')
  const [granularity, setGranularity] = useState<Granularity>('day')

  const getRange = useCallback((p: RangePreset) => {
    const days = PRESETS.find((x) => x.value === p)?.days ?? 30
    return {
      from: formatISO(startOfDay(subDays(new Date(), days - 1))),
      to: formatISO(endOfDay(new Date())),
    }
  }, [])

  const range = getRange(preset)

  const { data: summary, isLoading: summaryLoading } = useSWR(
    ['usage-summary', range.from, range.to],
    () => usage.summary(range.from, range.to),
  )

  const { data: timeline, isLoading: timelineLoading } = useSWR(
    ['usage-timeline', range.from, range.to, granularity],
    () => usage.timeline(range.from, range.to, granularity),
  )

  const { data: endpoints, isLoading: endpointsLoading } = useSWR(
    ['usage-endpoints', range.from, range.to],
    () => usage.endpoints(range.from, range.to),
  )

  const chartData = (timeline ?? []).map((t) => ({
    date: format(
      new Date(t.timestamp),
      granularity === 'hour' ? 'MMM d HH:mm' : 'MMM d',
    ),
    requests: t.total_requests,
    errors: t.error_requests,
    success: t.total_requests - t.error_requests,
    latency: Math.round(t.avg_latency_ms),
  }))

  const endpointData = (endpoints ?? [])
    .sort((a, b) => b.total_requests - a.total_requests)
    .slice(0, 10)
    .map((e) => ({
      name: `${e.method} ${e.endpoint}`,
      requests: e.total_requests,
      errorRate: parseFloat(e.error_rate.toFixed(1)),
      latency: Math.round(e.avg_latency_ms),
    }))

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPreset(p.value)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                preset === p.value
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden">
          {(['hour', 'day'] as Granularity[]).map((g) => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className={`px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                granularity === g
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              By {g}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          label="Total Requests"
          value={summaryLoading ? '—' : formatNum(summary?.total_requests ?? 0)}
          icon={<Activity className="w-5 h-5" />}
          accent="bg-brand-50 text-brand-600"
        />
        <StatCard
          label="Successful"
          value={summaryLoading ? '—' : formatNum(summary?.success_requests ?? 0)}
          sublabel={summaryLoading || !summary?.total_requests ? '' :
            `${((summary.success_requests / summary.total_requests) * 100).toFixed(1)}% rate`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accent="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Errors"
          value={summaryLoading ? '—' : formatNum(summary?.error_requests ?? 0)}
          sublabel={summaryLoading || !summary?.total_requests ? '' :
            `${((summary.error_requests / summary.total_requests) * 100).toFixed(1)}% rate`}
          icon={<XCircle className="w-5 h-5" />}
          accent="bg-red-50 text-red-500"
        />
        <StatCard
          label="Avg Latency"
          value={summaryLoading ? '—' : formatMs(summary?.avg_latency_ms ?? 0)}
          icon={<Clock className="w-5 h-5" />}
          accent="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Data Transferred"
          value={summaryLoading ? '—' : formatBytes(summary?.total_bytes_sent ?? 0)}
          icon={<Database className="w-5 h-5" />}
          accent="bg-purple-50 text-purple-600"
        />
        <StatCard
          label="Quota Remaining"
          value={summaryLoading ? '—' : formatNum(summary?.quota_remaining ?? 0)}
          sublabel={summaryLoading ? '' : `of ${formatNum(summary?.quota_limit ?? 0)} total`}
          icon={<TrendingUp className="w-5 h-5" />}
          accent="bg-cyan-50 text-cyan-600"
        />
      </div>

      {/* Quota bar */}
      {summary && (
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Monthly Quota Usage</h3>
          <QuotaBar used={summary.quota_used} limit={summary.quota_limit} />
        </div>
      )}

      {/* Request timeline chart */}
      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 mb-1">Request Volume</h3>
        <p className="text-sm text-slate-500 mb-5">Successful vs error requests over time</p>
        {timelineLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sucGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="errGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                labelStyle={{ fontWeight: 600, color: '#1e293b' }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="success" name="Success" stroke="#10b981" strokeWidth={2} fill="url(#sucGrad)" />
              <Area type="monotone" dataKey="errors" name="Errors" stroke="#ef4444" strokeWidth={1.5} fill="url(#errGrad2)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Latency chart */}
      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 mb-1">Average Latency</h3>
        <p className="text-sm text-slate-500 mb-5">Response time in milliseconds</p>
        {timelineLoading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} unit="ms" />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                labelStyle={{ fontWeight: 600, color: '#1e293b' }}
                formatter={(v: number) => [`${v}ms`, 'Avg Latency']}
              />
              <Line type="monotone" dataKey="latency" name="Latency" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top endpoints */}
      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 mb-1">Top Endpoints</h3>
        <p className="text-sm text-slate-500 mb-5">Most accessed endpoints by request volume</p>
        {endpointsLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          </div>
        ) : endpointData.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-slate-400 text-sm">
            No endpoint data available for this period.
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={Math.max(200, endpointData.length * 36)}>
              <BarChart
                data={endpointData}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={180}
                  tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  labelStyle={{ fontWeight: 600, color: '#1e293b', fontSize: 11 }}
                />
                <Bar dataKey="requests" name="Requests" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Table view */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 px-1 font-medium text-slate-500 text-xs uppercase tracking-wide">Endpoint</th>
                    <th className="text-right py-2 px-1 font-medium text-slate-500 text-xs uppercase tracking-wide">Requests</th>
                    <th className="text-right py-2 px-1 font-medium text-slate-500 text-xs uppercase tracking-wide">Error Rate</th>
                    <th className="text-right py-2 px-1 font-medium text-slate-500 text-xs uppercase tracking-wide">Avg Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(endpoints ?? []).slice(0, 10).map((ep, i) => (
                    <tr key={i} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-1">
                        <div className="flex items-center gap-2">
                          <span className={`badge text-xs uppercase font-mono ${
                            ep.method === 'GET' ? 'badge-green' :
                            ep.method === 'POST' ? 'badge-blue' :
                            ep.method === 'DELETE' ? 'badge-red' : 'badge-yellow'
                          }`}>{ep.method}</span>
                          <code className="text-xs text-slate-700">{ep.endpoint}</code>
                        </div>
                      </td>
                      <td className="py-2.5 px-1 text-right text-slate-700 font-medium">{formatNum(ep.total_requests)}</td>
                      <td className="py-2.5 px-1 text-right">
                        <span className={ep.error_rate > 5 ? 'text-red-500' : ep.error_rate > 1 ? 'text-amber-500' : 'text-emerald-600'}>
                          {ep.error_rate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-1 text-right text-slate-500">{formatMs(ep.avg_latency_ms)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
