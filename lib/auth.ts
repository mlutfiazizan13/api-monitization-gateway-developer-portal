export function saveToken(token: string) {
  localStorage.setItem('token', token)
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export function removeToken() {
  localStorage.removeItem('token')
}

export function isAuthenticated(): boolean {
  const token = getToken()
  if (!token) return false
  try {
    const [, payload] = token.split('.')
    const decoded = JSON.parse(atob(payload))
    return decoded.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export function getTokenPayload(): { sub: string; email: string; plan: string } | null {
  const token = getToken()
  if (!token) return null
  try {
    const [, payload] = token.split('.')
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}
