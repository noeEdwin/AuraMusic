import { useEffect, useState } from 'react'

import { api, setApiToken } from '../lib/api'
import { applyLocalAvatar, writeLocalAvatar } from './localAvatarStorage'
import { AuthContext } from './authContextValue'
import { readStoredSession, writeStoredSession } from './authStorage'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession())
  const [initialToken] = useState(() => readStoredSession()?.token ?? null)
  const [authFeedback, setAuthFeedback] = useState(null)
  const [isBootstrapping, setIsBootstrapping] = useState(() => Boolean(initialToken))

  useEffect(() => {
    setApiToken(session?.token ?? null)
    writeStoredSession(session)
  }, [session])

  useEffect(() => {
    let ignore = false

    async function restoreSession() {
      if (!initialToken) {
        setIsBootstrapping(false)
        return
      }

      setApiToken(initialToken)

      try {
        const { data } = await api.get('/api/auth/me')

        if (!ignore) {
           setSession((current) => (current ? { ...current, user: applyLocalAvatar(data) } : null))
        }
      } catch {
        if (!ignore) {
          setSession(null)
          setAuthFeedback({
            tone: 'warning',
            message: 'Tu sesion expiro o ya no es valida. Inicia sesion de nuevo.',
          })
        }
      } finally {
        if (!ignore) {
          setIsBootstrapping(false)
        }
      }
    }

    void restoreSession()

    return () => {
      ignore = true
    }
  }, [initialToken])

  function clearAuthFeedback() {
    setAuthFeedback(null)
  }

  async function login(credentials) {
    clearAuthFeedback()
    const { data } = await api.post('/api/auth/login', credentials)
    setSession({ ...data, user: applyLocalAvatar(data.user) })
    return data
  }

  async function register(payload) {
    clearAuthFeedback()
    const { data } = await api.post('/api/auth/register', payload)
    return data
  }

  async function updateProfile(payload) {
    const { data } = await api.put('/api/auth/profile', payload)
    setSession(data)
    return data
  }

  function updateLocalAvatar(dataUrl) {
    if (!session?.user) return
    writeLocalAvatar(session.user, dataUrl)
    setSession((current) => current ? { ...current, user: { ...current.user, avatarUrl: dataUrl || null } } : null)
  }

  async function logout() {
    try {
      if (session?.token) {
        await api.post('/api/auth/logout')
      }
      clearAuthFeedback()
    } catch {
      setAuthFeedback({
        tone: 'warning',
        message: 'La sesion local se cerro, pero no se pudo confirmar el logout con el servidor.',
      })
    } finally {
      setSession(null)
    }
  }

  const value = {
    authFeedback,
    clearAuthFeedback,
    isAuthenticated: Boolean(session?.token && session?.user),
    isBootstrapping,
    login,
    logout,
    register,
    updateProfile,
    updateLocalAvatar,
    role: session?.user?.role ?? null,
    session,
    token: session?.token ?? null,
    user: session?.user ?? null,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
