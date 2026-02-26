import clsx from 'clsx'

interface QuotaBarProps {
  used: number
  limit: number
  label?: string
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

export default function QuotaBar({ used, limit, label }: QuotaBarProps) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
  const isHigh = pct > 80
  const isMed = pct > 50

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-slate-600">{label ?? 'Monthly Quota'}</span>
        <span className="text-sm font-medium text-slate-700">
          {formatNum(used)} / {formatNum(limit)}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500',
            isHigh ? 'bg-red-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-1">{pct.toFixed(1)}% used this month</p>
    </div>
  )
}
