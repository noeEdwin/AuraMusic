import { useEffect, useState } from 'react'

import { createBand, fetchBands, joinBand } from '../../bands/bandsApi'
import { useAuth } from '../../auth/useAuth'
import { getApiErrorMessage } from '../../lib/api'
import { AppShellLayout } from '../layout/AppShellLayout'
import { StatusBanner } from '../shared/StatusBanner'

const EMPTY_CREATE_FORM = { name: '', description: '', instrument: '' }
const EMPTY_JOIN_FORM = { inviteCode: '', instrument: '' }

export function BandsView() {
  const { role, user } = useAuth()
  const [bands, setBands] = useState([])
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM)
  const [joinForm, setJoinForm] = useState(EMPTY_JOIN_FORM)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let ignore = false

    async function loadBands() {
      try {
        const data = await fetchBands()
        if (!ignore) setBands(data)
      } catch (requestError) {
        if (!ignore) setError(getApiErrorMessage(requestError, 'No fue posible cargar tus bandas.'))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    void loadBands()
    return () => { ignore = true }
  }, [])

  function handleCreateChange(event) {
    const { name, value } = event.target
    setCreateForm((current) => ({ ...current, [name]: value }))
  }

  function handleJoinChange(event) {
    const { name, value } = event.target
    setJoinForm((current) => ({ ...current, [name]: value }))
  }

  async function handleCreate(event) {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setMessage('')

    try {
      const band = await createBand({
        name: createForm.name.trim(),
        description: createForm.description.trim() || null,
        instrument: createForm.instrument.trim(),
      })
      setBands((current) => [...current, band])
      setCreateForm(EMPTY_CREATE_FORM)
      setMessage('Banda creada. Ahora eres su lider.')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No fue posible crear la banda.'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleJoin(event) {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setMessage('')

    try {
      await joinBand({
        inviteCode: joinForm.inviteCode.trim(),
        instrument: joinForm.instrument.trim(),
      })
      const data = await fetchBands()
      setBands(data)
      setJoinForm(EMPTY_JOIN_FORM)
      setMessage('Te has unido a la banda.')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No fue posible unirte a la banda.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppShellLayout contentClassName="content-grid catalog-grid">
      <section className="panel page-panel catalog-panel">
        <div className="catalog-header">
          <div className="catalog-title-group">
            <span className="page-panel-badge">Bandas</span>
            <h1>Mis bandas</h1>
            <p>El creador de una banda queda como lider y administra sus integrantes.</p>
          </div>
          <span className="catalog-meta">{bands.length} bandas</span>
        </div>

        <StatusBanner message={error} tone="error" />
        <StatusBanner message={message} tone="info" />

        <div className="song-editor-grid">
          {role === 'MUSICIAN' || role === 'ADMIN' ? (
            <form className="song-artist-form" onSubmit={handleCreate}>
              <p className="eyebrow">Nueva banda</p>
              <h2>Crear banda</h2>
              <label className="catalog-field"><span>Nombre</span><input name="name" value={createForm.name} onChange={handleCreateChange} required maxLength={120} /></label>
              <label className="catalog-field"><span>Instrumento</span><input name="instrument" value={createForm.instrument} onChange={handleCreateChange} required maxLength={80} placeholder="Guitarra" /></label>
              <label className="catalog-field"><span>Descripcion</span><textarea name="description" value={createForm.description} onChange={handleCreateChange} maxLength={255} /></label>
              <button className="catalog-submit" type="submit" disabled={isSaving}>{isSaving ? 'Creando...' : 'Crear banda'}</button>
            </form>
          ) : null}

          <form className="song-artist-form" onSubmit={handleJoin}>
            <p className="eyebrow">Invitacion</p>
            <h2>Unirse a una banda</h2>
            <label className="catalog-field"><span>Codigo de invitacion</span><input name="inviteCode" value={joinForm.inviteCode} onChange={handleJoinChange} required /></label>
            <label className="catalog-field"><span>Instrumento</span><input name="instrument" value={joinForm.instrument} onChange={handleJoinChange} required maxLength={80} placeholder="Bajo" /></label>
            <button className="catalog-submit" type="submit" disabled={isSaving}>{isSaving ? 'Uniendo...' : 'Unirme'}</button>
          </form>
        </div>

        {isLoading ? <div className="catalog-empty">Cargando bandas...</div> : null}
        {!isLoading && bands.length === 0 ? <div className="catalog-empty">Todavia no perteneces a ninguna banda.</div> : null}
        {!isLoading && bands.length > 0 ? (
          <div className="catalog-list-shell" role="list" aria-label="Mis bandas">
            {bands.map((band) => (
              <article className="catalog-list-row" key={band.id} role="listitem">
                <div className="catalog-primary-cell"><strong>{band.name}</strong><span>Lider: {band.leader?.displayName ?? 'Sin nombre'}</span></div>
                <div className="catalog-cell catalog-copy">{band.description || 'Sin descripcion.'}</div>
                <div className="catalog-cell">{band.members?.length ?? 0} integrantes</div>
                <div className="catalog-cell"><strong>{band.leader?.id === user?.id ? 'Lider' : 'Integrante'}</strong><span>Codigo: {band.inviteCode}</span></div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </AppShellLayout>
  )
}
