import { useEffect, useState } from 'react'

import { api, setApiToken } from '../lib/api'
import { AuthContext } from './authContextValue'
import { readStoredSession, writeStoredSession } from './authStorage'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession())

  useEffect(() => {
    setApiToken(session?.token ?? null)
    writeStoredSession(session)
  }, [session])

  async function login(credentials) {
    const { data } = await api.post('/api/auth/login', credentials)
    setSession(data)
    return data
  }

  async function register(payload) {
    const { data } = await api.post('/api/auth/register', payload)
    setSession(data)
    return data
  }

  async function logout() {
    try {
      if (session?.token) {
        await api.post('/api/auth/logout')
      }
    } finally {
      setSession(null)
    }
  }

  const value = {
    isAuthenticated: Boolean(session?.token && session?.user),
    login,
    logout,
    register,
    role: session?.user?.role ?? null,
    session,
    token: session?.token ?? null,
    user: session?.user ?? null,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
