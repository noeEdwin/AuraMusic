const STORAGE_KEY = 'auramusic.auth'

export function readStoredSession() {
  const rawSession = localStorage.getItem(STORAGE_KEY)

  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function writeStoredSession(session) {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}
