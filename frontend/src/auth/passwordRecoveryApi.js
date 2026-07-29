import { api } from '../lib/api'

export async function requestPasswordReset(email) {
  const { data } = await api.post('/api/auth/forgot-password', { email })
  return data
}

export async function resetPassword(token, password) {
  const { data } = await api.post('/api/auth/reset-password', { token, password })
  return data
}
