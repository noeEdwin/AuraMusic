import { api } from '../lib/api'

export async function fetchSongsCatalog({ page, size, title, genre, artistId, ownerId }) {
  const { data } = await api.get('/api/songs', {
    params: {
      page,
      size,
      ...(title ? { title } : {}),
      ...(genre ? { genre } : {}),
      ...(artistId ? { artistId } : {}),
      ...(ownerId ? { ownerId } : {}),
    },
  })

  return data
}

export async function fetchArtistsCatalog({ page, size, name }) {
  const { data } = await api.get('/api/artists', {
    params: {
      page,
      size,
      ...(name ? { name } : {}),
    },
  })

  return data
}

export async function createArtist(payload) {
  const { data } = await api.post('/api/artists', payload)
  return data
}

export async function createSong(payload) {
  const { data } = await api.post('/api/songs', payload)
  return data
}

export async function deleteSong(songId) {
  await api.delete(`/api/songs/${songId}`)
}

export async function fetchSongById(songId) {
  const { data } = await api.get(`/api/songs/${songId}`)
  return data
}

export async function updateSong(songId, payload) {
  const { data } = await api.put(`/api/songs/${songId}`, payload)
  return data
}
