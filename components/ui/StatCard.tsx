import { ReactNode } from 'react'
import clsx from 'clsx'

interface StatCardProps {
  label: string
  value: string | number
  sublabel?: string
  icon?: ReactNode
  trend?: { value: string; positive: boolean }
  accent?: string
}

export default function StatCard({ label, value, sublabel, icon, trend, accent }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 truncate">{value}</p>
          {sublabel && <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>}
          {trend && (
            <p className={clsx('text-xs font-medium mt-1', trend.positive ? 'text-emerald-600' : 'text-red-500')}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-3', accent ?? 'bg-brand-50 text-brand-600')}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
