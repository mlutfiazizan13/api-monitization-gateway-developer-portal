'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { auth, account } from '@/lib/api'
import { saveToken, removeToken, isAuthenticated } from '@/lib/auth'
import type { Tenant } from '@/lib/types'

interface AuthContextValue {
  tenant: Tenant | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refresh = useCallback(async () => {
    if (!isAuthenticated()) {
      setLoading(false)
      return
    }
    try {
      const me = await account.me()
      setTenant(me)
    } catch {
      removeToken()
      setTenant(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = async (email: string, password: string) => {
    const res = await auth.login({ email, password })
    saveToken(res.token)
    setTenant(res.tenant)
    router.push('/dashboard')
  }

  const register = async (name: string, email: string, password: string) => {
    await auth.register({ name, email, password })
    // Auto-login after registration
    await login(email, password)
  }

  const logout = () => {
    removeToken()
    setTenant(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ tenant, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
