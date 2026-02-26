'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  Zap,
  LayoutDashboard,
  Key,
  BarChart2,
  CreditCard,
  BookOpen,
  LogOut,
  ChevronRight,
  Server,
  GitBranch,
} from 'lucide-react'
import clsx from 'clsx'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/keys', icon: Key, label: 'API Keys' },
  { href: '/dashboard/usage', icon: BarChart2, label: 'Usage' },
  { href: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
  { href: '/dashboard/docs', icon: BookOpen, label: 'Documentation' },
]

const GATEWAY_ITEMS = [
  { href: '/dashboard/upstreams', icon: Server, label: 'Upstreams' },
  { href: '/dashboard/routes', icon: GitBranch, label: 'Routes' },
]

const PLAN_COLORS: Record<string, string> = {
  free: 'badge-blue',
  starter: 'badge-purple',
  pro: 'badge-green',
}

export default function Sidebar() {
  const pathname = usePathname()
  const { tenant, logout } = useAuth()

  return (
    <aside className="w-64 shrink-0 flex flex-col bg-slate-900 text-white min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/60">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-md shadow-brand-500/40">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">API Gateway</p>
          <p className="text-xs text-slate-400 mt-0.5">Developer Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active =
              href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                  active
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
              </Link>
            )
          })}
        </div>

        <div>
          <p className="px-3 mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Gateway Config
          </p>
          <div className="space-y-0.5">
            {GATEWAY_ITEMS.map(({ href, icon: Icon, label }) => {
              const active = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                    active
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                  {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* User card */}
      <div className="px-3 py-4 border-t border-slate-700/60">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 text-sm font-bold shrink-0">
            {tenant?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{tenant?.name}</p>
            <p className="text-xs text-slate-400 truncate">{tenant?.email}</p>
          </div>
        </div>

        {/* Plan badge */}
        {tenant && (
          <div className="px-3 mt-1">
            <span className={clsx('badge text-xs capitalize', PLAN_COLORS[tenant.plan_id] ?? 'badge-blue')}>
              {tenant.plan_id} plan
            </span>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 mt-2 w-full rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
