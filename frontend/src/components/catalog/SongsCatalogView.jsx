import { useEffect, useState } from 'react'

import { fetchSongsCatalog } from '../../catalog/catalogApi'
import { getApiErrorMessage } from '../../lib/api'
import { AppShellLayout } from '../layout/AppShellLayout'
import { StatusBanner } from '../shared/StatusBanner'
import { CatalogPagination } from './CatalogPagination'

const PAGE_SIZE = 6

export function SongsCatalogView() {
  const [filters, setFilters] = useState({ title: '', genre: '' })
  const [draftFilters, setDraftFilters] = useState({ title: '', genre: '' })
  const [page, setPage] = useState(0)
  const [catalog, setCatalog] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

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
  }, [filters, page])

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

  const songs = catalog?.content ?? []

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
            </div>

            {songs.map((song) => (
              <article key={song.id} className="catalog-list-row songs-list-row" role="row">
                <div className="catalog-primary-cell" data-label="Titulo">
                  <strong>{song.title}</strong>
                </div>
                <div className="catalog-cell" data-label="Artista">{song.artist?.name ?? 'Artista sin asignar'}</div>
                <div className="catalog-cell" data-label="Album">{song.album?.title ?? 'Sin album'}</div>
                <div className="catalog-cell" data-label="Genero">
                  <span className="catalog-pill">{song.genre ?? 'Sin genero'}</span>
                </div>
                <div className="catalog-cell song-key" data-label="Tono">{song.originalKey ?? 'N/D'}</div>
                <div className="catalog-cell" data-label="BPM">{song.bpm ?? 'N/D'}</div>
                <div className="catalog-cell" data-label="Duracion">{formatDuration(song.durationSeconds)}</div>
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
