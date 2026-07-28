import { useEffect, useState } from 'react'

import { Link } from 'react-router-dom'

import { createArtist, createSong, deleteSong, fetchArtistsCatalog, fetchSongsCatalog } from '../../catalog/catalogApi'
import { getApiErrorMessage } from '../../lib/api'
import { mockTeleprompterSongs } from '../../teleprompter/mockTeleprompterSongs'
import { AppShellLayout } from '../layout/AppShellLayout'
import { StatusBanner } from '../shared/StatusBanner'
import { CatalogPagination } from './CatalogPagination'

const PAGE_SIZE = 6
const INTERNAL_AUDIO_URL = 'pending-audio'
const EMPTY_SONG_FORM = {
  artistId: '',
  title: '',
  lyrics: '',
  durationSeconds: '',
  genre: '',
  originalKey: '',
  bpm: '',
  explicitContent: false,
}
const EMPTY_ARTIST_FORM = {
  name: '',
  bio: '',
  imageUrl: '',
}

export function SongsCatalogView() {
  const [filters, setFilters] = useState({ title: '', genre: '' })
  const [draftFilters, setDraftFilters] = useState({ title: '', genre: '' })
  const [page, setPage] = useState(0)
  const [catalog, setCatalog] = useState(null)
  const [artists, setArtists] = useState([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isArtistFormOpen, setIsArtistFormOpen] = useState(false)
  const [songForm, setSongForm] = useState(EMPTY_SONG_FORM)
  const [artistForm, setArtistForm] = useState(EMPTY_ARTIST_FORM)
  const [isSavingSong, setIsSavingSong] = useState(false)
  const [isSavingArtist, setIsSavingArtist] = useState(false)
  const [deletingSongId, setDeletingSongId] = useState(null)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let ignore = false

    async function loadArtists() {
      try {
        const data = await fetchArtistsCatalog({ page: 0, size: 50 })
        if (!ignore) {
          setArtists(data.content ?? [])
        }
      } catch (requestError) {
        if (!ignore) {
          setFormError(getApiErrorMessage(requestError, 'No fue posible cargar artistas para crear canciones.'))
        }
      }
    }

    void loadArtists()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadSongs() {
      setIsLoading(true)
      setError('')

      try {
        const data = await fetchSongsCatalog({
          page,
          size: PAGE_SIZE,
          title: filters.title.trim(),
          genre: filters.genre.trim(),
        })

        if (!ignore) {
          setCatalog(data)
        }
      } catch (requestError) {
        if (!ignore) {
          setError(getApiErrorMessage(requestError, 'No fue posible cargar el catalogo de canciones.'))
          setCatalog(null)
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadSongs()

    return () => {
      ignore = true
    }
  }, [filters, page, refreshKey])

  function handleDraftChange(event) {
    const { name, value } = event.target
    setDraftFilters((current) => ({ ...current, [name]: value }))
  }

  function handleFilterSubmit(event) {
    event.preventDefault()
    setPage(0)
    setFilters(draftFilters)
  }

  function handleClearFilters() {
    const clearedFilters = { title: '', genre: '' }
    setDraftFilters(clearedFilters)
    setFilters(clearedFilters)
    setPage(0)
  }

  function openCreateForm() {
    setIsCreateOpen(true)
    setSongForm(EMPTY_SONG_FORM)
    setArtistForm(EMPTY_ARTIST_FORM)
    setIsArtistFormOpen(false)
    setFormError('')
    setFormMessage('')
  }

  function closeCreateForm() {
    setIsCreateOpen(false)
    setSongForm(EMPTY_SONG_FORM)
    setArtistForm(EMPTY_ARTIST_FORM)
    setIsArtistFormOpen(false)
    setFormError('')
  }

  function handleSongFormChange(event) {
    const { checked, name, type, value } = event.target
    setSongForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleArtistFormChange(event) {
    const { name, value } = event.target
    setArtistForm((current) => ({ ...current, [name]: value }))
  }

  async function handleCreateArtist(event) {
    event.preventDefault()
    setIsSavingArtist(true)
    setFormError('')
    setFormMessage('')

    try {
      const artist = await createArtist({
        name: artistForm.name.trim(),
        bio: normalizeOptionalString(artistForm.bio),
        imageUrl: normalizeOptionalString(artistForm.imageUrl),
      })
      setArtists((current) => [...current, artist].sort((first, second) => first.name.localeCompare(second.name)))
      setSongForm((current) => ({ ...current, artistId: String(artist.id) }))
      setArtistForm(EMPTY_ARTIST_FORM)
      setIsArtistFormOpen(false)
      setFormMessage('Artista creado y seleccionado para la cancion.')
    } catch (requestError) {
      setFormError(getApiErrorMessage(requestError, 'No fue posible crear el artista.'))
    } finally {
      setIsSavingArtist(false)
    }
  }

  async function handleCreateSong(event) {
    event.preventDefault()
    setIsSavingSong(true)
    setFormError('')
    setFormMessage('')

    try {
      await createSong(buildCreateSongPayload(songForm))
      setFormMessage('Cancion guardada en el catalogo.')
      setIsCreateOpen(false)
      setSongForm(EMPTY_SONG_FORM)
      setPage(0)
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setFormError(getApiErrorMessage(requestError, 'No fue posible crear la cancion.'))
    } finally {
      setIsSavingSong(false)
    }
  }

  async function handleDeleteSong(song) {
    if (typeof song.id === 'string') {
      return
    }

    const shouldDelete = window.confirm(`Eliminar "${song.title}" del catalogo?`)

    if (!shouldDelete) {
      return
    }

    setDeletingSongId(song.id)
    setError('')

    try {
      await deleteSong(song.id)
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No fue posible eliminar la cancion.'))
    } finally {
      setDeletingSongId(null)
    }
  }

  const songs = [
    ...mockTeleprompterSongs,
    ...(catalog?.content ?? []),
  ]

  return (
    <AppShellLayout contentClassName="content-grid catalog-grid">
      <section className="panel page-panel catalog-panel">
        <div className="catalog-header">
          <div className="catalog-title-group">
            <span className="page-panel-badge">Catalogo</span>
            <h1>Canciones</h1>
            <p>Consulta canciones con filtros del servidor y navegacion paginada real.</p>
          </div>

          <div className="catalog-meta">
            <span>{catalog?.totalElements ?? 0} resultados</span>
            <span>{isLoading ? 'Actualizando...' : `Tamano de pagina ${PAGE_SIZE}`}</span>
            <button className="catalog-submit catalog-add-button" type="button" onClick={openCreateForm}>
              Agregar cancion
            </button>
          </div>
        </div>

        <form className="catalog-filters" onSubmit={handleFilterSubmit}>
          <div className="catalog-filter-grid">
            <label className="catalog-field">
              <span>Titulo</span>
              <input name="title" value={draftFilters.title} onChange={handleDraftChange} placeholder="Ej. Kumbala" />
            </label>

            <label className="catalog-field">
              <span>Genero</span>
              <input name="genre" value={draftFilters.genre} onChange={handleDraftChange} placeholder="Ej. Rock" />
            </label>
          </div>

          <div className="catalog-filter-actions">
            <button className="catalog-submit" type="submit" disabled={isLoading}>
              {isLoading ? 'Buscando...' : 'Aplicar filtros'}
            </button>
            <button className="catalog-clear" type="button" onClick={handleClearFilters} disabled={isLoading}>
              Limpiar
            </button>
          </div>
        </form>

        <StatusBanner message={error} tone="error" />
        <StatusBanner message={formError} tone="error" />
        <StatusBanner message={formMessage} tone="info" />

        {isCreateOpen ? (
          <form className="song-editor-form" onSubmit={handleCreateSong}>
            <div className="song-editor-header">
              <div>
                <p className="eyebrow">Nueva cancion</p>
                <h2>Agregar cancion</h2>
              </div>
              <button className="catalog-clear" type="button" onClick={closeCreateForm} disabled={isSavingSong}>
                Cerrar
              </button>
            </div>

            <div className="song-editor-grid">
              <label className="catalog-field">
                <span>Titulo</span>
                <input name="title" value={songForm.title} onChange={handleSongFormChange} required maxLength={160} placeholder="Ej. Camino Aurora" />
              </label>

              <label className="catalog-field">
                <span>Artista</span>
                <select name="artistId" value={songForm.artistId} onChange={handleSongFormChange} required>
                  <option value="">Selecciona un artista</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.id}>{artist.name}</option>
                  ))}
                </select>
              </label>
              <div className="catalog-field song-artist-create-toggle">
                <span>Artista no listado</span>
                <button className="catalog-clear" type="button" onClick={() => setIsArtistFormOpen((current) => !current)}>
                  {isArtistFormOpen ? 'Ocultar artista nuevo' : 'Crear artista nuevo'}
                </button>
              </div>

              <label className="catalog-field">
                <span>Duracion en segundos</span>
                <input name="durationSeconds" value={songForm.durationSeconds} onChange={handleSongFormChange} required min="1" type="number" placeholder="240" />
              </label>

              <label className="catalog-field">
                <span>Genero</span>
                <input name="genre" value={songForm.genre} onChange={handleSongFormChange} maxLength={80} placeholder="Rock Latino" />
              </label>

              <label className="catalog-field">
                <span>Tono original</span>
                <input name="originalKey" value={songForm.originalKey} onChange={handleSongFormChange} maxLength={10} placeholder="Cm" />
              </label>

              <label className="catalog-field">
                <span>BPM</span>
                <input name="bpm" value={songForm.bpm} onChange={handleSongFormChange} min="1" type="number" placeholder="108" />
              </label>
            </div>

            {isArtistFormOpen ? (
              <div className="song-artist-form">
                <div className="song-editor-header">
                  <div>
                    <p className="eyebrow">Artista nuevo</p>
                    <h3>Registrar artista</h3>
                  </div>
                </div>
                <div className="song-editor-grid">
                  <label className="catalog-field">
                    <span>Nombre</span>
                    <input name="name" value={artistForm.name} onChange={handleArtistFormChange} maxLength={120} placeholder="Nombre del artista" />
                  </label>
                  <label className="catalog-field">
                    <span>URL de imagen</span>
                    <input name="imageUrl" value={artistForm.imageUrl} onChange={handleArtistFormChange} maxLength={500} placeholder="https://..." />
                  </label>
                  <label className="catalog-field song-editor-wide">
                    <span>Bio</span>
                    <input name="bio" value={artistForm.bio} onChange={handleArtistFormChange} maxLength={5000} placeholder="Descripcion breve" />
                  </label>
                </div>
                <div className="song-editor-actions">
                  <button className="catalog-submit" type="button" onClick={handleCreateArtist} disabled={isSavingArtist || !artistForm.name.trim()}>
                    {isSavingArtist ? 'Creando...' : 'Crear y seleccionar artista'}
                  </button>
                </div>
              </div>
            ) : null}

            <label className="catalog-field song-editor-lyrics">
              <span>Letra y acordes</span>
              <textarea
                name="lyrics"
                value={songForm.lyrics}
                onChange={handleSongFormChange}
                placeholder="[VERSO 1]\n[Cm]Luz roja en la [G7]esquina"
              />
            </label>

            <label className="song-editor-check">
              <input name="explicitContent" checked={songForm.explicitContent} onChange={handleSongFormChange} type="checkbox" />
              <span>Contenido explicito</span>
            </label>

            <div className="song-editor-actions">
              <button className="catalog-clear" type="button" onClick={closeCreateForm} disabled={isSavingSong}>
                Cancelar
              </button>
              <button className="catalog-submit" type="submit" disabled={isSavingSong || artists.length === 0}>
                {isSavingSong ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        ) : null}

        {isLoading ? <div className="catalog-empty">Cargando canciones desde el servidor...</div> : null}

        {!isLoading && !error && songs.length === 0 ? (
          <div className="catalog-empty">No se encontraron canciones con los filtros actuales.</div>
        ) : null}

        {!isLoading && songs.length > 0 ? (
          <div className="catalog-list-shell" role="table" aria-label="Catalogo de canciones">
            <div className="catalog-list-row catalog-list-head songs-list-head" role="row">
              <span>Titulo</span>
              <span>Artista</span>
              <span>Album</span>
              <span>Genero</span>
              <span>Tono</span>
              <span>BPM</span>
              <span>Duracion</span>
              <span>Acciones</span>
            </div>

            {songs.map((song) => (
              <article key={song.id} className="catalog-list-row songs-list-row" role="row">
                <div className="catalog-primary-cell" data-label="Titulo">
                  <Link className="catalog-song-link" to={`/teleprompter?songId=${song.id}`}>
                    {song.title}
                  </Link>
                  {typeof song.id === 'string' ? <span className="catalog-local-tag">Demo local para teleprompter</span> : null}
                </div>
                <div className="catalog-cell" data-label="Artista">{song.artist?.name ?? 'Artista sin asignar'}</div>
                <div className="catalog-cell" data-label="Album">{song.album?.title ?? 'Sin album'}</div>
                <div className="catalog-cell" data-label="Genero">
                  <span className="catalog-pill">{song.genre ?? 'Sin genero'}</span>
                </div>
                <div className="catalog-cell song-key" data-label="Tono">{song.originalKey ?? 'N/D'}</div>
                <div className="catalog-cell" data-label="BPM">{song.bpm ?? 'N/D'}</div>
                <div className="catalog-cell" data-label="Duracion">{formatDuration(song.durationSeconds)}</div>
                <div className="catalog-cell catalog-actions-cell" data-label="Acciones">
                  {typeof song.id === 'string' ? (
                    <span className="catalog-local-tag">Demo</span>
                  ) : (
                    <button className="catalog-danger-button" type="button" onClick={() => handleDeleteSong(song)} disabled={deletingSongId === song.id}>
                      {deletingSongId === song.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : null}

        <CatalogPagination
          isLoading={isLoading}
          onNext={() => setPage((current) => current + 1)}
          onPrevious={() => setPage((current) => Math.max(0, current - 1))}
          page={catalog?.page ?? 0}
          totalPages={catalog?.totalPages ?? 0}
        />
      </section>
    </AppShellLayout>
  )
}

function buildCreateSongPayload(form) {
  return {
    artistId: Number(form.artistId),
    albumId: null,
    title: form.title.trim(),
    lyrics: form.lyrics,
    durationSeconds: Number(form.durationSeconds),
    genre: normalizeOptionalString(form.genre),
    originalKey: normalizeOptionalString(form.originalKey),
    bpm: normalizeOptionalNumber(form.bpm),
    audioUrl: INTERNAL_AUDIO_URL,
    coverUrl: null,
    trackNumber: null,
    explicitContent: form.explicitContent,
  }
}

function normalizeOptionalString(value) {
  const trimmedValue = value.trim()
  return trimmedValue ? trimmedValue : null
}

function normalizeOptionalNumber(value) {
  return value ? Number(value) : null
}

function formatDuration(durationSeconds) {
  if (!durationSeconds && durationSeconds !== 0) {
    return 'N/D'
  }

  const minutes = Math.floor(durationSeconds / 60)
  const seconds = durationSeconds % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
