import { useEffect, useMemo, useState } from 'react'

import { fetchArtistsCatalog, fetchSongsCatalog } from '../../catalog/catalogApi'
import { getApiErrorMessage } from '../../lib/api'
import { AppShellLayout } from '../layout/AppShellLayout'
import { StatusBanner } from '../shared/StatusBanner'
import { CatalogPagination } from './CatalogPagination'
import './catalog.css'

const PAGE_SIZE = 6

export function ArtistsCatalogView() {
  const [filters, setFilters] = useState({ name: '' })
  const [draftFilters, setDraftFilters] = useState({ name: '' })
  const [page, setPage] = useState(0)
  const [catalog, setCatalog] = useState(null)
  const [songTotalsByArtist, setSongTotalsByArtist] = useState({})
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const artists = useMemo(() => catalog?.content ?? [], [catalog])

  useEffect(() => {
    let ignore = false

    async function loadArtists() {
      setIsLoading(true)
      setError('')

      try {
        const data = await fetchArtistsCatalog({
          page,
          size: PAGE_SIZE,
          name: filters.name.trim(),
        })

        if (!ignore) {
          setCatalog(data)
        }
      } catch (requestError) {
        if (!ignore) {
          setError(getApiErrorMessage(requestError, 'No fue posible cargar el catalogo de artistas.'))
          setCatalog(null)
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadArtists()

    return () => {
      ignore = true
    }
  }, [filters, page])

  useEffect(() => {
    let ignore = false

    async function loadSongTotals() {
      if (!artists.length) {
        setSongTotalsByArtist({})
        return
      }

      try {
        const totals = await Promise.all(
          artists.map(async (artist) => {
            const data = await fetchSongsCatalog({ page: 0, size: 1, artistId: artist.id })
            return [artist.id, data.totalElements]
          }),
        )

        if (!ignore) {
          setSongTotalsByArtist(Object.fromEntries(totals))
        }
      } catch {
        if (!ignore) {
          setSongTotalsByArtist({})
        }
      }
    }

    void loadSongTotals()

    return () => {
      ignore = true
    }
  }, [artists])

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
    const clearedFilters = { name: '' }
    setDraftFilters(clearedFilters)
    setFilters(clearedFilters)
    setPage(0)
  }

  return (
    <AppShellLayout contentClassName="content-grid catalog-grid">
      <section className="panel page-panel catalog-panel">
        <div className="catalog-header">
          <div className="catalog-title-group">
            <span className="page-panel-badge">Catalogo</span>
            <h1>Artistas</h1>
            <p>Consulta artistas con busqueda y filtros del servidor sin paginar datos en local.</p>
          </div>

          <div className="catalog-meta">
            <span>{catalog?.totalElements ?? 0} resultados</span>
            <span>{isLoading ? 'Actualizando...' : `Tamano de pagina ${PAGE_SIZE}`}</span>
          </div>
        </div>

        <form className="catalog-filters" onSubmit={handleFilterSubmit}>
          <div className="catalog-filter-grid">
            <label className="catalog-field">
              <span>Nombre</span>
              <input name="name" value={draftFilters.name} onChange={handleDraftChange} placeholder="Ej. Luna" />
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

        {isLoading ? <div className="catalog-empty">Cargando artistas desde el servidor...</div> : null}

        {!isLoading && !error && artists.length === 0 ? (
          <div className="catalog-empty">No se encontraron artistas con los filtros actuales.</div>
        ) : null}

        {!isLoading && artists.length > 0 ? (
          <div className="catalog-list-shell" role="table" aria-label="Catalogo de artistas">
            <div className="catalog-list-row catalog-list-head artists-list-head" role="row">
              <span>Artista</span>
              <span>Biografia</span>
              <span>Canciones</span>
            </div>

            {artists.map((artist) => (
              <article key={artist.id} className="catalog-list-row artists-list-row" role="row">
                <div className="catalog-primary-cell" data-label="Artista">
                  <strong>{artist.name}</strong>
                  <span>{artist.imageUrl ? 'Imagen disponible' : 'Sin imagen'}</span>
                </div>
                <div className="catalog-cell catalog-copy" data-label="Biografia">{artist.bio || 'Sin biografia registrada todavia.'}</div>
                <div className="catalog-cell" data-label="Canciones">{formatSongTotal(songTotalsByArtist[artist.id])}</div>
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

function formatSongTotal(total) {
  if (typeof total !== 'number') {
    return 'Cargando...'
  }

  return `${total} ${total === 1 ? 'cancion' : 'canciones'}`
}
