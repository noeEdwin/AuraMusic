import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { fetchArtistById, fetchSongsCatalog } from '../../catalog/catalogApi'
import { getApiErrorMessage } from '../../lib/api'
import { AppShellLayout } from '../layout/AppShellLayout'
import { StatusBanner } from '../shared/StatusBanner'
import { CatalogPagination } from './CatalogPagination'
import './catalog.css'

const PAGE_SIZE = 6

export function ArtistSongsView() {
  const { artistId } = useParams()
  const [artist, setArtist] = useState(null)
  const [filters, setFilters] = useState({ title: '' })
  const [draftFilters, setDraftFilters] = useState({ title: '' })
  const [page, setPage] = useState(0)
  const [catalog, setCatalog] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(0)
      setFilters((current) => {
        if (current.title === draftFilters.title) {
          return current
        }

        return draftFilters
      })
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [draftFilters])

  useEffect(() => {
    let ignore = false

    async function loadArtistSongs() {
      setIsLoading(true)
      setError('')

      try {
        const [artistData, songsData] = await Promise.all([
          fetchArtistById(artistId),
          fetchSongsCatalog({
            page,
            size: PAGE_SIZE,
            artistId,
            title: filters.title.trim(),
          }),
        ])

        if (!ignore) {
          setArtist(artistData)
          setCatalog(songsData)
        }
      } catch (requestError) {
        if (!ignore) {
          setError(getApiErrorMessage(requestError, 'No fue posible cargar las canciones del artista.'))
          setCatalog(null)
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadArtistSongs()

    return () => {
      ignore = true
    }
  }, [artistId, filters, page])

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
    const clearedFilters = { title: '' }
    setDraftFilters(clearedFilters)
    setFilters(clearedFilters)
    setPage(0)
  }

  const songs = catalog?.content ?? []

  return (
    <AppShellLayout contentClassName="content-grid catalog-grid">
      <section className="panel page-panel catalog-panel">
        <div className="catalog-header">
          <div className="catalog-title-group">
            <Link className="catalog-back-link" to="/artists">Volver a artistas</Link>
            <span className="page-panel-badge">Artista</span>
            <h1>{artist?.name ?? 'Canciones del artista'}</h1>
            <p>{artist?.bio || 'Consulta las canciones visibles de este artista.'}</p>
          </div>

          <div className="catalog-meta">
            <span>{catalog?.totalElements ?? 0} canciones</span>
            <span>{isLoading ? 'Actualizando...' : `Tamano de pagina ${PAGE_SIZE}`}</span>
          </div>
        </div>

        <form className="catalog-filters" onSubmit={handleFilterSubmit}>
          <div className="catalog-filter-grid catalog-search-filter-grid">
            <label className="catalog-field">
              <span>Titulo</span>
              <input name="title" value={draftFilters.title} onChange={handleDraftChange} placeholder="Buscar cancion del artista" />
            </label>

            <div className="catalog-filter-actions catalog-filter-actions-inline">
              <button className="catalog-submit" type="submit" disabled={isLoading}>
                {isLoading ? 'Buscando...' : 'Buscar ahora'}
              </button>
              <button className="catalog-clear" type="button" onClick={handleClearFilters} disabled={isLoading}>
                Limpiar
              </button>
            </div>
          </div>
        </form>

        <StatusBanner message={error} tone="error" />

        {isLoading && !catalog ? <div className="catalog-empty">Cargando canciones del artista...</div> : null}

        {!isLoading && !error && songs.length === 0 ? (
          <div className="catalog-empty">No se encontraron canciones de este artista con los filtros actuales.</div>
        ) : null}

        {!isLoading && songs.length > 0 ? (
          <div className="catalog-list-shell" role="table" aria-label="Canciones del artista">
            <div className="catalog-list-row catalog-list-head artist-songs-list-head" role="row">
              <span>Titulo</span>
              <span>Album</span>
              <span>Genero</span>
              <span>Tono</span>
              <span>BPM</span>
              <span>Duracion</span>
              <span>Acciones</span>
            </div>

            {songs.map((song) => (
              <article key={song.id} className="catalog-list-row artist-songs-list-row" role="row">
                <div className="catalog-primary-cell" data-label="Titulo">
                  <Link className="catalog-song-link" to={`/teleprompter?songId=${song.id}`}>
                    {song.title}
                  </Link>
                </div>
                <div className="catalog-cell" data-label="Album">{song.album ?? 'Sin album'}</div>
                <div className="catalog-cell" data-label="Genero">
                  <span className="catalog-pill">{song.genre ?? 'Sin genero'}</span>
                </div>
                <div className="catalog-cell song-key" data-label="Tono">{song.originalKey ?? 'N/D'}</div>
                <div className="catalog-cell" data-label="BPM">{song.bpm ?? 'N/D'}</div>
                <div className="catalog-cell" data-label="Duracion">{formatDuration(song.durationSeconds)}</div>
                <div className="catalog-cell catalog-actions-cell" data-label="Acciones">
                  <Link className="catalog-back-link" to={`/teleprompter?songId=${song.id}`}>Abrir</Link>
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

function formatDuration(durationSeconds) {
  if (!durationSeconds && durationSeconds !== 0) {
    return 'N/D'
  }

  const minutes = Math.floor(durationSeconds / 60)
  const seconds = durationSeconds % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
