import { api } from '../lib/api'

export async function fetchSetlists() {
  const { data } = await api.get('/api/setlists')
  return data
}

export async function fetchSetlist(setlistId) {
  const { data } = await api.get(`/api/setlists/${setlistId}`)
  return data
}

export async function createSetlist(payload) {
  const { data } = await api.post('/api/setlists', payload)
  return data
}

export async function updateSetlist(setlistId, payload) {
  const { data } = await api.put(`/api/setlists/${setlistId}`, payload)
  return data
}

export async function deleteSetlist(setlistId) {
  await api.delete(`/api/setlists/${setlistId}`)
}

export async function addSetlistItem(setlistId, payload) {
  const { data } = await api.post(`/api/setlists/${setlistId}/items`, payload)
  return data
}

export async function removeSetlistItem(setlistId, itemId) {
  await api.delete(`/api/setlists/${setlistId}/items/${itemId}`)
}

export async function reorderSetlistItems(setlistId, itemIds) {
  const { data } = await api.put(`/api/setlists/${setlistId}/items/reorder`, { itemIds })
  return data
}

export async function updateSetlistItem(setlistId, itemId, payload) {
  const { data } = await api.put(`/api/setlists/${setlistId}/items/${itemId}`, payload)
  return data
}
