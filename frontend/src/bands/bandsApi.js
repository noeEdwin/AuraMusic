import { api } from '../lib/api'

export async function fetchBands() {
  const { data } = await api.get('/api/bands')
  return data
}

export async function createBand(payload) {
  const { data } = await api.post('/api/bands', payload)
  return data
}

export async function joinBand(payload) {
  const { data } = await api.post('/api/bands/join', payload)
  return data
}
