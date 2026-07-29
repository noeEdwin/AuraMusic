import { api } from '../lib/api'

export async function fetchAdminSummary() {
  const { data } = await api.get('/api/admin/summary')
  return data
}
