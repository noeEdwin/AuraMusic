import { api } from '../lib/api'

export async function fetchAdminSummary() {
  const { data } = await api.get('/api/admin/summary')
  return data
}

export async function fetchAdminUsers() {
  const { data } = await api.get('/api/admin/users')
  return data
}

export async function updateAdminUser(userId, payload) {
  const { data } = await api.put(`/api/admin/users/${userId}`, payload)
  return data
}

export async function activateAdminUser(userId) {
  const { data } = await api.put(`/api/admin/users/${userId}/activate`)
  return data
}

export async function deactivateAdminUser(userId) {
  await api.delete(`/api/admin/users/${userId}`)
}
