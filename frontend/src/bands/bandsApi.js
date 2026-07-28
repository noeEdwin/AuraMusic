import { api } from '../lib/api'

export async function fetchBands() {
  const { data } = await api.get('/api/bands')
  return data
}
