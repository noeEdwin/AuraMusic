import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { fetchSongsCatalog } from '../../catalog/catalogApi'
import { getApiErrorMessage } from '../../lib/api'
import {
  addSetlistItem,
  createSetlist,
  deleteSetlist,
  fetchSetlist,
  fetchSetlists,
  removeSetlistItem,
  reorderSetlistItems,
  updateSetlist,
} from '../../setlists/setlistsApi'
import { AppShellLayout } from '../layout/AppShellLayout'
import { StatusBanner } from '../shared/StatusBanner'
import { Icon } from '../ui/Icon'

export function SetlistsView() {
  const { setlistId } = useParams()

  return setlistId ? <SetlistBuilderView setlistId={setlistId} /> : <SetlistsListView />
}

function SetlistsListView() {
  const navigate = useNavigate()
  const [setlists, setSetlists] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [draft, setDraft] = useState({ name: '', description: '', eventDate: '' })
  const [deletingId, setDeletingId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  useEffect(() => {
    let ignore = false

    async function load() {
      setIsLoading(true)
      try {
        const data = await fetchSetlists()
        if (!ignore) setSetlists(data)
      } catch (requestError) {
        if (!ignore) setError(getApiErrorMessage(requestError, 'No fue posible cargar los setlists.'))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    void load()
    return () => { ignore = true }
  }, [])

  function handleDraftChange(event) {
    const { name, value } = event.target
    setDraft((current) => ({ ...current, [name]: value }))
  }

  async function handleCreate(event) {
    event.preventDefault()
    setError('')
    try {
      const created = await createSetlist({ ...draft, eventDate: draft.eventDate || null, bandId: null })
      navigate(`/setlists/${created.id}`)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No fue posible crear el setlist.'))
    }
  }

  async function handleDelete(setlist) {
    if (pendingDelete?.id !== setlist.id) {
      setPendingDelete(setlist)
      return
    }

    setDeletingId(setlist.id)
    setError('')
    try {
      await deleteSetlist(setlist.id)
      setSetlists((current) => current.filter((item) => item.id !== setlist.id))
      setPendingDelete(null)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No fue posible eliminar el setlist.'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AppShellLayout contentClassName="content-grid setlists-grid">
      <section className="panel page-panel setlists-page">
        <div className="catalog-header">
          <div className="catalog-title-group">
            <span className="page-panel-badge">Repertorios</span>
            <h1>Setlists</h1>
            <p>Crea, organiza y prepara los repertorios de tus presentaciones.</p>
          </div>
          <button className="catalog-submit" type="button" onClick={() => setIsCreateOpen((current) => !current)}>
            <Icon type="plus" /> Crear setlist
          </button>
        </div>

        <StatusBanner message={error} tone="error" />

        {isCreateOpen ? (
          <form className="setlist-create-form" onSubmit={handleCreate}>
            <div className="catalog-filter-grid">
              <label className="catalog-field"><span>Nombre</span><input name="name" value={draft.name} onChange={handleDraftChange} required maxLength={140} placeholder="Tour 2026 - Bar Sevilla" /></label>
              <label className="catalog-field"><span>Fecha del evento</span><input name="eventDate" value={draft.eventDate} onChange={handleDraftChange} type="date" /></label>
              <label className="catalog-field setlist-description-field"><span>Descripcion</span><input name="description" value={draft.description} onChange={handleDraftChange} maxLength={255} placeholder="Repertorio para presentacion en vivo" /></label>
            </div>
            <div className="song-editor-actions"><button className="catalog-clear" type="button" onClick={() => setIsCreateOpen(false)}>Cancelar</button><button className="catalog-submit" type="submit">Guardar</button></div>
          </form>
        ) : null}

        {isLoading ? <div className="catalog-empty">Cargando setlists...</div> : null}
        {!isLoading && !error && setlists.length === 0 ? <div className="catalog-empty">Todavia no tienes setlists. Crea el primero.</div> : null}

        {!isLoading && setlists.length > 0 ? (
          <div className="setlists-row-list">
            {setlists.map((setlist) => (
              <article className="setlist-summary-row" key={setlist.id}>
                <Link to={`/setlists/${setlist.id}`} className="setlist-summary-link">
                  <span className="page-panel-badge">{setlist.items?.length ?? 0} canciones</span>
                  <h2>{setlist.name}</h2>
                  <p>{setlist.description || 'Sin descripcion'}</p>
                  <span className="setlist-summary-date">{formatDate(setlist.eventDate)}</span>
                </Link>
                <div className="setlist-summary-actions">
                  <button className="catalog-danger-button" type="button" onClick={() => handleDelete(setlist)} disabled={deletingId === setlist.id}>
                    {deletingId === setlist.id ? 'Eliminando...' : pendingDelete?.id === setlist.id ? 'Confirmar' : 'Eliminar'}
                  </button>
                  {pendingDelete?.id === setlist.id ? <button className="catalog-clear" type="button" onClick={() => setPendingDelete(null)}>Cancelar</button> : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </AppShellLayout>
  )
}

function SetlistBuilderView({ setlistId }) {
  const navigate = useNavigate()
  const [setlist, setSetlist] = useState(null)
  const [songs, setSongs] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState(null)
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  const [draggedItemId, setDraggedItemId] = useState(null)

  useEffect(() => {
    let ignore = false
    async function load() {
      setIsLoading(true)
      try {
        const [setlistData, songsData] = await Promise.all([fetchSetlist(setlistId), fetchSongsCatalog({ page: 0, size: 50 })])
        if (!ignore) {
          setSetlist(setlistData)
          setDraft({ name: setlistData.name, description: setlistData.description ?? '', eventDate: setlistData.eventDate ?? '' })
          setSongs(songsData.content ?? [])
        }
      } catch (requestError) {
        if (!ignore) setError(getApiErrorMessage(requestError, 'No fue posible cargar el setlist.'))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    void load()
    return () => { ignore = true }
  }, [setlistId])

  const availableSongs = useMemo(() => {
    const itemSongIds = new Set((setlist?.items ?? []).map((item) => item.song?.id))
    return songs.filter((song) => !itemSongIds.has(song.id) && song.title.toLowerCase().includes(search.toLowerCase()))
  }, [search, setlist, songs])

  const firstSongId = setlist?.items?.[0]?.song?.id

  function handleDraftChange(event) {
    const { name, value } = event.target
    setDraft((current) => ({ ...current, [name]: value }))
  }

  async function saveDetails(event) {
    event.preventDefault()
    setIsSaving(true)
    try {
      const updated = await updateSetlist(setlistId, { ...draft, eventDate: draft.eventDate || null })
      setSetlist((current) => ({ ...current, ...updated }))
      setIsEditingDetails(false)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No fue posible actualizar la informacion.'))
    } finally {
      setIsSaving(false)
    }
  }

  async function addSong(song) {
    try {
      const updated = await addSetlistItem(setlistId, { songId: song.id, position: (setlist.items?.length ?? 0) + 1, transposeSteps: 0, breakSeconds: 0, notes: null })
      setSetlist(updated)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No fue posible agregar la cancion.'))
    }
  }

  async function removeSong(itemId) {
    try {
      await removeSetlistItem(setlistId, itemId)
      setSetlist((current) => ({ ...current, items: current.items.filter((item) => item.id !== itemId) }))
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No fue posible quitar la cancion.'))
    }
  }

  async function dropItem(targetId) {
    if (!draggedItemId || draggedItemId === targetId || !setlist) return
    const items = [...setlist.items]
    const fromIndex = items.findIndex((item) => item.id === draggedItemId)
    const toIndex = items.findIndex((item) => item.id === targetId)
    const [moved] = items.splice(fromIndex, 1)
    items.splice(toIndex, 0, moved)
    setDraggedItemId(null)
    try {
      const updated = await reorderSetlistItems(setlistId, items.map((item) => item.id))
      setSetlist(updated)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No fue posible reordenar el setlist.'))
    }
  }

  function openTeleprompter(songId) {
    if (!songId) return
    navigate(`/teleprompter?songId=${songId}`)
  }

  function handleSongKeyDown(event, songId) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openTeleprompter(songId)
    }
  }

  if (isLoading || !setlist || !draft) {
    return <AppShellLayout contentClassName="content-grid setlists-grid"><div className="catalog-empty">Cargando setlist...</div></AppShellLayout>
  }

  return (
    <AppShellLayout contentClassName="content-grid setlist-builder-grid">
      <section className="panel setlist-builder-page">
        <div className="builder-topline">
          <button className="teleprompter-back" type="button" aria-label="Regresar a setlists" onClick={() => navigate(-1)}><Icon type="chevronLeft" /></button>
          <span className="page-panel-badge">Setlist</span>
          <span className="builder-total"><span>Duracion estimada</span><strong>{formatDuration(setlist.totalDurationSeconds)}</strong></span>
        </div>

        <div className="builder-heading">
          <div><h1>{setlist.name}</h1><p>{setlist.description || 'Sin descripcion'}{setlist.eventDate ? ` · ${formatDate(setlist.eventDate)}` : ''}</p></div>
          <div className="builder-heading-actions">
            <button className="catalog-submit builder-play-button" type="button" onClick={() => openTeleprompter(firstSongId)} disabled={!firstSongId}>
              <Icon type="play" /> Iniciar
            </button>
            {isEditingDetails ? (
              <button className="catalog-submit" type="submit" form="setlist-details-form" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar cambios'}</button>
            ) : (
              <button className="catalog-clear" type="button" onClick={() => setIsEditingDetails(true)}>Editar</button>
            )}
          </div>
        </div>

        <StatusBanner message={error} tone="error" />

        <div className="setlist-builder-columns">
          <div className="builder-setlist-column">
            <form id="setlist-details-form" className="setlist-details-form" onSubmit={saveDetails}>
              <label className="catalog-field"><span>Nombre</span><input name="name" value={draft.name} onChange={handleDraftChange} disabled={!isEditingDetails} required maxLength={140} /></label>
              <label className="catalog-field"><span>Descripcion</span><input name="description" value={draft.description} onChange={handleDraftChange} disabled={!isEditingDetails} maxLength={255} /></label>
              <label className="catalog-field"><span>Fecha</span><input name="eventDate" value={draft.eventDate} onChange={handleDraftChange} disabled={!isEditingDetails} type="date" /></label>
            </form>

            <div className="builder-song-list">
              {setlist.items?.map((item, index) => (
                <article key={item.id} className="builder-song-item" draggable role="button" tabIndex={0} onClick={() => openTeleprompter(item.song?.id)} onKeyDown={(event) => handleSongKeyDown(event, item.song?.id)} onDragStart={() => setDraggedItemId(item.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => dropItem(item.id)}>
                  <span className="builder-drag-handle">⠿</span><span className="builder-song-number">{String(index + 1).padStart(2, '0')}</span>
                  <div className="builder-song-copy"><strong>{item.song?.title}</strong><span>{item.song?.artist?.name ?? 'Artista sin asignar'}</span></div>
                  <span className="catalog-pill">{item.song?.originalKey ?? 'N/D'}</span><span className="builder-song-bpm">{item.song?.bpm ?? 'N/D'} BPM</span><span>{formatDuration(item.song?.durationSeconds)}</span>
                  <button className="icon-button builder-remove-button" type="button" aria-label={`Quitar ${item.song?.title}`} onClick={(event) => { event.stopPropagation(); removeSong(item.id) }}><Icon type="minus" /></button>
                </article>
              ))}
              {setlist.items?.length === 0 ? <div className="catalog-empty">Agrega canciones desde la libreria.</div> : null}
            </div>
          </div>

          <aside className="builder-library">
            <div className="builder-library-header"><div><p className="eyebrow">Libreria</p><h2>Agregar canciones</h2></div><span>{availableSongs.length}</span></div>
            <label className="searchbar builder-search"><Icon type="search" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar canciones..." /></label>
            <div className="builder-library-list">
              {availableSongs.map((song) => <button className="builder-library-song" type="button" key={song.id} onClick={() => addSong(song)}><span><strong>{song.title}</strong><small>{song.artist?.name ?? 'Artista sin asignar'} · {song.bpm ?? 'N/D'} BPM</small></span><span className="builder-add-icon">+</span></button>)}
              {availableSongs.length === 0 ? <p className="catalog-copy">No hay canciones disponibles.</p> : null}
            </div>
          </aside>
        </div>

        <div className="builder-summary"><div><span>Canciones</span><strong>{setlist.items?.length ?? 0}</strong></div><div><span>BPM promedio</span><strong>{averageBpm(setlist.items)}</strong></div><div><span>Tonalidad</span><strong>{setlist.items?.map((item) => item.song?.originalKey).filter(Boolean).join(' / ') || 'N/D'}</strong></div></div>
      </section>
    </AppShellLayout>
  )
}

function formatDate(value) {
  if (!value) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}

function formatDuration(seconds) {
  const total = Number(seconds ?? 0)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

function averageBpm(items = []) {
  const bpms = items.map((item) => item.song?.bpm).filter(Boolean)
  return bpms.length ? Math.round(bpms.reduce((sum, bpm) => sum + bpm, 0) / bpms.length) : 'N/D'
}
