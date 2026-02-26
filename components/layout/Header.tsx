'use client'

import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/keys': 'API Keys',
  '/dashboard/usage': 'Usage Analytics',
  '/dashboard/billing': 'Billing & Plans',
  '/dashboard/docs': 'Documentation',
  '/dashboard/upstreams': 'Upstreams',
  '/dashboard/routes': 'Routes',
}

export default function Header() {
  const pathname = usePathname()
  const { tenant } = useAuth()
  const title = PAGE_TITLES[pathname] ?? 'Dashboard'

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell (decorative) */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <Bell className="w-4.5 h-4.5" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 text-sm font-bold">
          {tenant?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
      </div>
    </header>
  )
}
