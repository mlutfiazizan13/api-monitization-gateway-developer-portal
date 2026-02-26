'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import {
  Server,
  Plus,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Globe,
  RefreshCw,
  Check,
  Link,
} from 'lucide-react'
import { upstreams } from '@/lib/api'
import type { Upstream, CreateUpstreamRequest, UpdateUpstreamRequest } from '@/lib/types'
import clsx from 'clsx'

const LB_OPTIONS = ['round-robin', 'random', 'least-connections']

// ─── Upstream form modal ───────────────────────────────────────────────────────

function UpstreamModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Upstream
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!initial
  const [form, setForm] = useState<CreateUpstreamRequest>({
    name: initial?.name ?? '',
    load_balance: initial?.load_balance ?? 'round-robin',
    connect_timeout: initial?.connect_timeout ?? '5s',
    response_timeout: initial?.response_timeout ?? '30s',
    retries: initial?.retries ?? 3,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof CreateUpstreamRequest, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isEdit) {
        const patch: UpdateUpstreamRequest = {}
        if (form.name !== initial!.name) patch.name = form.name
        if (form.load_balance !== initial!.load_balance) patch.load_balance = form.load_balance
        if (form.connect_timeout !== initial!.connect_timeout) patch.connect_timeout = form.connect_timeout
        if (form.response_timeout !== initial!.response_timeout) patch.response_timeout = form.response_timeout
        if (form.retries !== initial!.retries) patch.retries = form.retries
        await upstreams.update(initial!.id, patch)
      } else {
        await upstreams.create(form)
      }
      await mutate('upstreams')
      onSaved()
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
          <div className="w-9 h-9 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
            <Server className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            {isEdit ? 'Edit Upstream' : 'New Upstream'}
          </h2>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
            <input
              className="input"
              placeholder="e.g., payments-service"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Load Balancing</label>
            <select
              className="input"
              value={form.load_balance}
              onChange={(e) => set('load_balance', e.target.value)}
            >
              {LB_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Connect Timeout</label>
              <input
                className="input"
                placeholder="5s"
                value={form.connect_timeout}
                onChange={(e) => set('connect_timeout', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Response Timeout</label>
              <input
                className="input"
                placeholder="30s"
                value={form.response_timeout}
                onChange={(e) => set('response_timeout', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Retries</label>
            <input
              type="number"
              min={0}
              max={10}
              className="input"
              value={form.retries}
              onChange={(e) => set('retries', parseInt(e.target.value) || 0)}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Upstream'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Add target modal ──────────────────────────────────────────────────────────

function AddTargetModal({
  upstream,
  onClose,
}: {
  upstream: Upstream
  onClose: () => void
}) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await upstreams.addTarget(upstream.id, url.trim())
      await mutate('upstreams')
      onClose()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Add Target</h2>
        <p className="text-sm text-slate-500 mb-4">
          Add a backend URL to <span className="font-medium text-slate-700">{upstream.name}</span>
        </p>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Target URL</label>
            <input
              className="input font-mono text-sm"
              placeholder="http://service:8080"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? 'Adding…' : 'Add Target'}
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
  confirmLabel,
  onConfirm,
  onClose,
}: {
  title: string
  description: string
  confirmLabel: string
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
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Upstream row ──────────────────────────────────────────────────────────────

function UpstreamRow({
  upstream,
  onEdit,
  onDelete,
}: {
  upstream: Upstream
  onEdit: (u: Upstream) => void
  onDelete: (u: Upstream) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [addingTarget, setAddingTarget] = useState(false)
  const [removingTarget, setRemovingTarget] = useState<string | null>(null)

  const handleRemoveTarget = async (targetId: string) => {
    await upstreams.removeTarget(upstream.id, targetId)
    await mutate('upstreams')
    setRemovingTarget(null)
  }

  return (
    <>
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        {/* Header row */}
        <div className="flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-slate-50/60 transition-colors">
          <button onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-slate-700">
            {expanded
              ? <ChevronDown className="w-4 h-4" />
              : <ChevronRight className="w-4 h-4" />}
          </button>

          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Server className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900">{upstream.name}</p>
            <p className="text-xs text-slate-400 font-mono">{upstream.id.slice(0, 8)}…</p>
          </div>

          <span className="badge badge-blue hidden sm:inline-flex">{upstream.load_balance}</span>

          <div className="flex items-center gap-1 text-xs text-slate-500 hidden md:flex">
            <Globe className="w-3.5 h-3.5" />
            {upstream.targets?.length ?? 0} target{(upstream.targets?.length ?? 0) !== 1 ? 's' : ''}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(upstream)}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-brand-600 transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(upstream)}
              className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-4 space-y-4">
            {/* Config pills */}
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { label: 'Connect timeout', value: upstream.connect_timeout },
                { label: 'Response timeout', value: upstream.response_timeout },
                { label: 'Retries', value: upstream.retries },
              ].map((item) => (
                <div key={item.label} className="bg-white border border-slate-200 rounded-lg px-3 py-1.5">
                  <span className="text-slate-500">{item.label}: </span>
                  <span className="font-medium text-slate-800 font-mono">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Targets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Targets</p>
                <button
                  onClick={() => setAddingTarget(true)}
                  className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  <Plus className="w-3 h-3" /> Add Target
                </button>
              </div>

              {!upstream.targets || upstream.targets.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No targets yet — add one to route traffic.</p>
              ) : (
                <div className="space-y-1.5">
                  {upstream.targets.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                      <Link className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <code className="text-xs font-mono text-slate-700 flex-1 truncate">{t.url}</code>
                      <button
                        onClick={() => setRemovingTarget(t.id)}
                        className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                        title="Remove target"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {addingTarget && (
        <AddTargetModal upstream={upstream} onClose={() => setAddingTarget(false)} />
      )}

      {removingTarget && (
        <ConfirmDialog
          title="Remove Target"
          description="Remove this target from the upstream? It will no longer receive traffic."
          confirmLabel="Remove"
          onConfirm={() => handleRemoveTarget(removingTarget)}
          onClose={() => setRemovingTarget(null)}
        />
      )}
    </>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function UpstreamsPage() {
  const { data: upstreamList, isLoading } = useSWR('upstreams', () => upstreams.list())
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<Upstream | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Upstream | null>(null)

  const handleDelete = async () => {
    if (!deleteTarget) return
    await upstreams.delete(deleteTarget.id)
    await mutate('upstreams')
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Configure backend services and their targets for load balancing.
        </p>
        <button onClick={() => setShowCreate(true)} className="btn-primary shrink-0">
          <Plus className="w-4 h-4" />
          New Upstream
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="card p-10 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        </div>
      ) : !upstreamList || upstreamList.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Server className="w-6 h-6" />
          </div>
          <p className="font-medium text-slate-700">No upstreams configured</p>
          <p className="text-sm text-slate-400 mt-1">Create an upstream to define backend services.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary mt-4 mx-auto">
            <Plus className="w-4 h-4" /> Create Upstream
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {upstreamList.map((u) => (
            <UpstreamRow
              key={u.id}
              upstream={u}
              onEdit={(u) => setEditTarget(u)}
              onDelete={(u) => setDeleteTarget(u)}
            />
          ))}
        </div>
      )}

      {/* Info */}
      <div className="card p-4 bg-slate-50/80">
        <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-slate-400" /> Load Balancing Strategies
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: 'round-robin', desc: 'Cycles through targets in order. Best for equal capacity.' },
            { name: 'random', desc: 'Picks a random target per request. Simple and stateless.' },
            { name: 'least-connections', desc: 'Routes to the target with fewest active connections.' },
          ].map((s) => (
            <div key={s.name} className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-semibold text-slate-700 font-mono mb-1">{s.name}</p>
              <p className="text-xs text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showCreate && (
        <UpstreamModal onClose={() => setShowCreate(false)} onSaved={() => {}} />
      )}
      {editTarget && (
        <UpstreamModal initial={editTarget} onClose={() => setEditTarget(null)} onSaved={() => {}} />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Upstream"
          description={`Delete "${deleteTarget.name}"? This will fail if any routes reference it.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
