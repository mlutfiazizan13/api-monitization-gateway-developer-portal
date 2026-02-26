'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { format } from 'date-fns'
import {
  CreditCard,
  Check,
  Download,
  ExternalLink,
  Zap,
  AlertCircle,
  Star,
} from 'lucide-react'
import { billing } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import clsx from 'clsx'

interface PlanDef {
  id: 'free' | 'starter' | 'pro'
  name: string
  price: number
  rateLimit: string
  quota: string
  overage: string | null
  features: string[]
  popular?: boolean
}

const PLANS: PlanDef[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    rateLimit: '1 req/sec',
    quota: '1,000 / month',
    overage: null,
    features: [
      '1,000 monthly requests',
      '1 request/second',
      'API key management',
      'Usage dashboard',
      'Community support',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    rateLimit: '10 req/sec',
    quota: '100,000 / month',
    overage: '$0.001 / req',
    popular: true,
    features: [
      '100,000 monthly requests',
      '10 requests/second',
      'Overage billing ($0.001/req)',
      'Multiple API keys',
      'Usage analytics',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    rateLimit: '100 req/sec',
    quota: '1,000,000 / month',
    overage: '$0.0005 / req',
    features: [
      '1,000,000 monthly requests',
      '100 requests/second',
      'Overage billing ($0.0005/req)',
      'Unlimited API keys',
      'Advanced analytics',
      'Priority support',
      'SLA guarantee',
    ],
  },
]

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export default function BillingPage() {
  const { tenant, refresh } = useAuth()
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [upgradeError, setUpgradeError] = useState('')
  const [portalLoading, setPortalLoading] = useState(false)

  const { data: invoices, isLoading: invoicesLoading } = useSWR(
    'billing-invoices',
    () => billing.invoices(),
  )

  const handleUpgrade = async (planId: string) => {
    if (planId === tenant?.plan_id) return
    setUpgrading(planId)
    setUpgradeError('')
    try {
      await billing.upgrade(planId)
      await refresh()
    } catch (e) {
      setUpgradeError((e as Error).message)
    } finally {
      setUpgrading(null)
    }
  }

  const handlePortal = async () => {
    setPortalLoading(true)
    try {
      const res = await billing.portal(window.location.href)
      window.open(res.url, '_blank')
    } catch (e) {
      setUpgradeError((e as Error).message)
    } finally {
      setPortalLoading(false)
    }
  }

  const currentPlan = PLANS.find((p) => p.id === tenant?.plan_id) ?? PLANS[0]

  return (
    <div className="space-y-6">
      {/* Current plan summary */}
      <div className="card p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Current Plan</p>
              <p className="text-xl font-bold text-slate-900 capitalize">{currentPlan.name}</p>
              <p className="text-sm text-slate-500">
                {currentPlan.price === 0 ? 'Free forever' : `$${currentPlan.price}/month`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-500">Rate Limit</p>
              <p className="text-sm font-semibold text-slate-700">{currentPlan.rateLimit}</p>
            </div>
            <div className="w-px h-8 bg-slate-200 hidden sm:block" />
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-500">Monthly Quota</p>
              <p className="text-sm font-semibold text-slate-700">{currentPlan.quota}</p>
            </div>
            {tenant?.plan_id !== 'free' && (
              <>
                <div className="w-px h-8 bg-slate-200 hidden sm:block" />
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="btn-secondary text-xs"
                >
                  {portalLoading ? 'Opening…' : 'Billing Portal'}
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error alert */}
      {upgradeError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {upgradeError}
        </div>
      )}

      {/* Plans grid */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-4">Choose a Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === tenant?.plan_id
            const isUpgrade = !isCurrent
            const isLoading = upgrading === plan.id

            return (
              <div
                key={plan.id}
                className={clsx(
                  'card p-5 flex flex-col relative',
                  plan.popular ? 'border-brand-400 shadow-md shadow-brand-100' : '',
                  isCurrent ? 'border-emerald-300 bg-emerald-50/30' : '',
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge badge-purple px-3 py-1 shadow-sm">
                      <Star className="w-3 h-3 fill-current" /> Most Popular
                    </span>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-3 left-4">
                    <span className="badge badge-green px-3 py-1 shadow-sm">
                      <Check className="w-3 h-3" /> Current Plan
                    </span>
                  </div>
                )}

                <div className="mb-4 pt-2">
                  <p className="text-lg font-bold text-slate-900">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-extrabold text-slate-900">${plan.price}</span>
                    {plan.price > 0 && <span className="text-slate-500 text-sm">/month</span>}
                  </div>
                  {plan.overage && (
                    <p className="text-xs text-slate-500 mt-0.5">+ {plan.overage} overage</p>
                  )}
                </div>

                <div className="space-y-2 mb-5 flex-1">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Zap className="w-3.5 h-3.5 text-brand-500" />
                    {plan.rateLimit}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CreditCardIcon className="w-3.5 h-3.5 text-brand-500" />
                    {plan.quota} requests
                  </div>
                  <div className="h-px bg-slate-100 my-3" />
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrent || !!upgrading}
                  className={clsx(
                    'w-full justify-center py-2',
                    isCurrent
                      ? 'btn-secondary opacity-60 cursor-not-allowed'
                      : plan.popular
                      ? 'btn-primary'
                      : 'btn-secondary',
                  )}
                >
                  {isLoading
                    ? 'Processing…'
                    : isCurrent
                    ? 'Current Plan'
                    : plan.price === 0
                    ? 'Downgrade'
                    : 'Upgrade'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Invoices */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Billing History</h3>
        </div>

        {invoicesLoading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          </div>
        ) : !invoices || invoices.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No invoices yet — upgrade to a paid plan to see billing history.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Period</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Amount</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 text-slate-700">
                    {format(new Date(inv.period_start * 1000), 'MMM d')} –{' '}
                    {format(new Date(inv.period_end * 1000), 'MMM d, yyyy')}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">
                    {formatCents(inv.amount_paid)} {inv.currency.toUpperCase()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={clsx('badge capitalize', {
                      'badge-green': inv.status === 'paid',
                      'badge-red': inv.status === 'uncollectible',
                      'badge-yellow': inv.status === 'open',
                      'badge-blue': inv.status === 'draft',
                    })}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      {inv.invoice_pdf && (
                        <a
                          href={inv.invoice_pdf}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      {inv.hosted_invoice_url && (
                        <a
                          href={inv.hosted_invoice_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                          title="View invoice"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  )
}
