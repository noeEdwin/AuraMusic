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
