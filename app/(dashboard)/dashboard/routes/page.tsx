'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import {
  GitBranch,
  Plus,
  Trash2,
  Pencil,
  AlertCircle,
  Server,
  ArrowRight,
  Scissors,
  Info,
} from 'lucide-react'
import { routes, upstreams } from '@/lib/api'
import type { Route, CreateRouteRequest, UpdateRouteRequest, Upstream } from '@/lib/types'
import clsx from 'clsx'

// ─── Route form modal ──────────────────────────────────────────────────────────

function RouteModal({
  initial,
  upstreamList,
  onClose,
}: {
  initial?: Route
  upstreamList: Upstream[]
  onClose: () => void
}) {
  const isEdit = !!initial
  const [form, setForm] = useState<CreateRouteRequest>({
    path_prefix: initial?.path_prefix ?? '',
    upstream_id: initial?.upstream_id ?? (upstreamList[0]?.id ?? ''),
    strip_path: initial?.strip_path ?? false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.path_prefix.startsWith('/')) {
      setError('Path prefix must start with /')
      return
    }
    if (!form.upstream_id) {
      setError('Select an upstream')
      return
    }
    setError('')
    setLoading(true)
    try {
      if (isEdit) {
        const patch: UpdateRouteRequest = {}
        if (form.path_prefix !== initial!.path_prefix) patch.path_prefix = form.path_prefix
        if (form.upstream_id !== initial!.upstream_id) patch.upstream_id = form.upstream_id
        if (form.strip_path !== initial!.strip_path) patch.strip_path = form.strip_path
        await routes.update(initial!.id, patch)
      } else {
        await routes.create(form)
      }
      await mutate('routes')
      onClose()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEdit ? 'Edit Route' : 'New Route'}
            </h2>
            <p className="text-xs text-slate-500">Map a path prefix to an upstream service</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Path Prefix</label>
            <input
              className="input font-mono"
              placeholder="/payments"
              value={form.path_prefix}
              onChange={(e) => setForm((f) => ({ ...f, path_prefix: e.target.value }))}
              required
            />
            <p className="text-xs text-slate-400 mt-1">
              All requests starting with this prefix are routed to the selected upstream.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Upstream</label>
            {upstreamList.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                No upstreams available. Create one first.
              </div>
            ) : (
              <select
                className="input"
                value={form.upstream_id}
                onChange={(e) => setForm((f) => ({ ...f, upstream_id: e.target.value }))}
              >
                {upstreamList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.targets?.length ?? 0} target{(u.targets?.length ?? 0) !== 1 ? 's' : ''})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.strip_path}
                onChange={(e) => setForm((f) => ({ ...f, strip_path: e.target.checked }))}
                className="w-4 h-4 accent-brand-600"
              />
              <div>
                <p className="text-sm font-medium text-slate-700">Strip path prefix</p>
                <p className="text-xs text-slate-400">
                  Remove the prefix before forwarding (e.g. <code className="font-mono">/payments/orders</code> →{' '}
                  <code className="font-mono">/orders</code>)
                </p>
              </div>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button
              type="submit"
              disabled={loading || upstreamList.length === 0}
              className="btn-primary flex-1 justify-center"
            >
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Route'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Confirm dialog ────────────────────────────────────────────────────────────

function ConfirmDialog({
  title,
  description,
  onConfirm,
  onClose,
}: {
  title: string
  description: string
  onConfirm: () => Promise<void>
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const handle = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500 mt-1.5">{description}</p>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handle} disabled={loading} className="btn-danger flex-1 justify-center">
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function RoutesPage() {
  const { data: routeList, isLoading: routesLoading } = useSWR('routes', () => routes.list())
  const { data: upstreamList = [] } = useSWR('upstreams', () => upstreams.list())

  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<Route | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Route | null>(null)

  const upstreamMap = Object.fromEntries((upstreamList ?? []).map((u) => [u.id, u]))

  const handleDelete = async () => {
    if (!deleteTarget) return
    await routes.delete(deleteTarget.id)
    await mutate('routes')
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Define path-based routing rules to direct traffic to the right upstream.
        </p>
        <button onClick={() => setShowCreate(true)} className="btn-primary shrink-0">
          <Plus className="w-4 h-4" />
          New Route
        </button>
      </div>

      {/* Routes table */}
      <div className="card overflow-hidden">
        {routesLoading ? (
          <div className="p-10 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          </div>
        ) : !routeList || routeList.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <GitBranch className="w-6 h-6" />
            </div>
            <p className="font-medium text-slate-700">No routes configured</p>
            <p className="text-sm text-slate-400 mt-1">
              Create a route to map a path prefix to an upstream.
            </p>
            <button onClick={() => setShowCreate(true)} className="btn-primary mt-4 mx-auto">
              <Plus className="w-4 h-4" /> Create Route
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Path Prefix</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Upstream</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden lg:table-cell">Targets</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Strip Path</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {routeList.map((route) => {
                const upstream = upstreamMap[route.upstream_id]
                return (
                  <tr key={route.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <code className="text-sm font-mono font-semibold text-brand-700 bg-brand-50 px-2 py-1 rounded">
                        {route.path_prefix}
                      </code>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                          <Server className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-slate-700 font-medium">
                          {upstream?.name ?? <span className="text-slate-400 italic">Unknown</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-slate-500 text-xs">
                      {upstream ? (
                        <div className="space-y-0.5">
                          {(upstream.targets ?? []).slice(0, 2).map((t) => (
                            <code key={t.id} className="block font-mono text-slate-600">{t.url}</code>
                          ))}
                          {(upstream.targets?.length ?? 0) > 2 && (
                            <span className="text-slate-400">+{(upstream.targets?.length ?? 0) - 2} more</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {route.strip_path ? (
                        <span className="badge badge-purple flex items-center gap-1 w-fit">
                          <Scissors className="w-3 h-3" /> strip
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">preserve</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setEditTarget(route)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-brand-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(route)}
                          className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Visual flow diagram */}
      {routeList && routeList.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" />
            Routing Flow
          </h3>
          <div className="space-y-2">
            {routeList.map((route) => {
              const upstream = upstreamMap[route.upstream_id]
              return (
                <div key={route.id} className="flex items-center gap-2 flex-wrap text-sm">
                  <code className="bg-brand-50 text-brand-700 font-mono px-2 py-1 rounded border border-brand-200">
                    /gateway{route.path_prefix}*
                  </code>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  {route.strip_path && (
                    <>
                      <span className="text-xs text-purple-600 bg-purple-50 border border-purple-200 px-2 py-1 rounded">
                        strip prefix
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-700">{upstream?.name ?? route.upstream_id}</span>
                  </div>
                  {upstream && upstream.targets?.length > 0 && (
                    <>
                      <span className="text-slate-300">→</span>
                      <div className="flex gap-1 flex-wrap">
                        {upstream.targets.map((t) => (
                          <code key={t.id} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                            {t.url}
                          </code>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <RouteModal
          upstreamList={upstreamList}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editTarget && (
        <RouteModal
          initial={editTarget}
          upstreamList={upstreamList}
          onClose={() => setEditTarget(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Route"
          description={`Delete the route for "${deleteTarget.path_prefix}"? Traffic will no longer be routed to its upstream.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
