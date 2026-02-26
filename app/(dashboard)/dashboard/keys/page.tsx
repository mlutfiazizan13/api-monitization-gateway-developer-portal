'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import {
  Key,
  Plus,
  Copy,
  Trash2,
  RotateCcw,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Clock,
} from 'lucide-react'
import { format } from 'date-fns'
import { keys } from '@/lib/api'
import type { APIKey } from '@/lib/types'
import clsx from 'clsx'

const AVAILABLE_SCOPES = [
  { id: 'read', label: 'Read', description: 'GET requests through the gateway' },
  { id: 'write', label: 'Write', description: 'POST, PUT, PATCH requests' },
  { id: 'delete', label: 'Delete', description: 'DELETE requests through the gateway' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors" title="Copy">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

function SecretBanner({ secret, onDismiss }: { secret: string; onDismiss: () => void }) {
  const [show, setShow] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card border-emerald-200 bg-emerald-50 p-4 mb-6">
      <div className="flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-emerald-800">API Key Created — Save it now!</p>
          <p className="text-xs text-emerald-700 mt-0.5">This secret is shown only once. Copy and store it securely.</p>
          <div className="flex items-center gap-2 mt-3 bg-white rounded-lg px-3 py-2 border border-emerald-200">
            <code className="text-xs font-mono text-slate-700 flex-1 truncate">
              {show ? secret : '•'.repeat(Math.min(secret.length, 48))}
            </code>
            <button onClick={() => setShow(!show)} className="text-slate-400 hover:text-slate-700">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button onClick={copy} className="text-slate-400 hover:text-slate-700">
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button onClick={onDismiss} className="text-emerald-600 hover:text-emerald-800 text-xs font-medium shrink-0">
          Dismiss
        </button>
      </div>
    </div>
  )
}

function CreateKeyModal({ onClose, onCreated }: { onClose: () => void; onCreated: (secret: string) => void }) {
  const [name, setName] = useState('')
  const [scopes, setScopes] = useState<string[]>(['read'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleScope = (scope: string) => {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    if (scopes.length === 0) { setError('Select at least one scope'); return }
    setLoading(true)
    setError('')
    try {
      const res = await keys.create({ name: name.trim(), scopes })
      await mutate('api-keys')
      onCreated(res.secret)
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
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Create API Key</h2>
            <p className="text-xs text-slate-500">Keys are shown only once upon creation</p>
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Key Name</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., Production, Mobile App"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Scopes</label>
            <div className="space-y-2">
              {AVAILABLE_SCOPES.map((scope) => (
                <label key={scope.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-brand-300 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={scopes.includes(scope.id)}
                    onChange={() => toggleScope(scope.id)}
                    className="w-4 h-4 accent-brand-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{scope.label}</p>
                    <p className="text-xs text-slate-500">{scope.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? 'Creating…' : 'Create Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  danger,
  onConfirm,
  onClose,
}: {
  title: string
  description: string
  confirmLabel: string
  danger?: boolean
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
          <button
            onClick={handle}
            disabled={loading}
            className={clsx('flex-1 justify-center', danger ? 'btn-danger' : 'btn-primary')}
          >
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function KeysPage() {
  const { data: apiKeys, isLoading } = useSWR('api-keys', () => keys.list())
  const [showCreate, setShowCreate] = useState(false)
  const [newSecret, setNewSecret] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<APIKey | null>(null)
  const [rotateTarget, setRotateTarget] = useState<APIKey | null>(null)

  const handleDelete = async () => {
    if (!deleteTarget) return
    await keys.delete(deleteTarget.id)
    await mutate('api-keys')
    setDeleteTarget(null)
  }

  const handleRotate = async () => {
    if (!rotateTarget) return
    const res = await keys.rotate(rotateTarget.id)
    await mutate('api-keys')
    setRotateTarget(null)
    setNewSecret(res.secret)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Manage API keys for authenticating requests through the gateway.
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary shrink-0">
          <Plus className="w-4 h-4" />
          New API Key
        </button>
      </div>

      {/* Secret banner */}
      {newSecret && <SecretBanner secret={newSecret} onDismiss={() => setNewSecret(null)} />}

      {/* Keys list */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          </div>
        ) : !apiKeys || apiKeys.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Key className="w-6 h-6" />
            </div>
            <p className="font-medium text-slate-700">No API keys yet</p>
            <p className="text-sm text-slate-400 mt-1">Create your first key to start using the gateway.</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary mt-4 mx-auto">
              <Plus className="w-4 h-4" /> Create Key
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Key</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Scopes</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden lg:table-cell">Last Used</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {apiKeys.map((key) => (
                <tr key={key.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                        <Key className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-slate-900">{key.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">
                        {key.key_prefix}…
                      </code>
                      <CopyButton text={key.key_prefix} />
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {key.scopes.map((s) => (
                        <span key={s} className="badge badge-blue capitalize">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell text-slate-500">
                    {key.last_used_at ? (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {format(new Date(key.last_used_at), 'MMM d, yyyy')}
                      </div>
                    ) : (
                      <span className="text-slate-300">Never</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={clsx('badge capitalize', {
                      'badge-green': key.status === 'active',
                      'badge-red': key.status === 'revoked',
                      'badge-yellow': key.status === 'suspended',
                    })}>
                      {key.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setRotateTarget(key)}
                        className="p-1.5 rounded hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"
                        title="Rotate key"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(key)}
                        className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        title="Revoke key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Info card */}
      <div className="card p-4 border-slate-200 bg-slate-50/80">
        <h4 className="text-sm font-semibold text-slate-700 mb-2">Using your API key</h4>
        <p className="text-xs text-slate-500 mb-3">Pass your key using any of these methods:</p>
        <div className="space-y-1.5">
          {[
            'Authorization: Bearer gw_your_key_here',
            'X-API-Key: gw_your_key_here',
            'GET /gateway/endpoint?api_key=gw_your_key_here',
          ].map((ex) => (
            <code key={ex} className="block text-xs font-mono bg-white border border-slate-200 rounded px-3 py-2 text-slate-700">
              {ex}
            </code>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateKeyModal
          onClose={() => setShowCreate(false)}
          onCreated={(secret) => setNewSecret(secret)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Revoke API Key"
          description={`Are you sure you want to revoke "${deleteTarget.name}"? Any applications using this key will immediately lose access.`}
          confirmLabel="Revoke Key"
          danger
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
      {rotateTarget && (
        <ConfirmDialog
          title="Rotate API Key"
          description={`Rotating "${rotateTarget.name}" will invalidate the current key and generate a new one. Update your applications immediately.`}
          confirmLabel="Rotate Key"
          onConfirm={handleRotate}
          onClose={() => setRotateTarget(null)}
        />
      )}
    </div>
  )
}
