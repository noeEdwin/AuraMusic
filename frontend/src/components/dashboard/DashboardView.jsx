import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { fetchBands } from '../../bands/bandsApi'
import { fetchSongsCatalog } from '../../catalog/catalogApi'
import { getApiErrorMessage } from '../../lib/api'
import { fetchSetlists } from '../../setlists/setlistsApi'
import { AppShellLayout } from '../layout/AppShellLayout'
import { StatusBanner } from '../shared/StatusBanner'
import { Icon } from '../ui/Icon'
import '../setlist/setlists.css'
import './dashboard.css'

export function DashboardView() {
  const { role, user } = useAuth()
  const [bands, setBands] = useState([])
  const [setlists, setSetlists] = useState([])
  const [songsCatalog, setSongsCatalog] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadDashboard() {
      setIsLoading(true)
      setError('')

      try {
        const [bandsData, setlistsData, songsData] = await Promise.all([
          fetchBands(),
          fetchSetlists(),
          fetchSongsCatalog({ page: 0, size: 5 }),
        ])

        if (!ignore) {
          setBands(bandsData)
          setSetlists(setlistsData)
          setSongsCatalog(songsData)
        }
      } catch (requestError) {
        if (!ignore) {
          setError(getApiErrorMessage(requestError, 'No fue posible cargar tu dashboard.'))
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      ignore = true
    }
  }, [])

  const latestSetlist = useMemo(() => getLatestSetlist(setlists), [setlists])
  const songs = songsCatalog?.content ?? []
  const songTotal = songsCatalog?.totalElements ?? 0
  const primaryBand = bands[0] ?? null

  return (
    <AppShellLayout>
      <section className="panel setlist-panel dashboard-home-panel">
        <div className="setlist-header dashboard-hero-header">
          <div>
            <p className="eyebrow">Tu espacio</p>
            <h1>{getDashboardTitle(role, user)}</h1>
            <p className="setlist-location">
              <Icon type={role === 'SOLO' ? 'user' : 'note'} />
              {getDashboardSubtitle(role, bands.length)}
            </p>
          </div>

          <div className="setlist-actions-top">
            <div className="duration-badge">
              <span className="duration-label">Canciones visibles</span>
              <strong>{isLoading ? '...' : songTotal}</strong>
            </div>
            <Link className="start-button dashboard-primary-link" to={songTotal > 0 ? '/setlists' : '/songs'}>
              <Icon type={songTotal > 0 ? 'list' : 'plus'} />
              <span>{songTotal > 0 ? 'Preparar setlist' : 'Agregar canciones'}</span>
            </Link>
          </div>
        </div>

        <StatusBanner message={error} tone="error" />

        <div className="dashboard-stat-grid">
          <DashboardStat label="Canciones" value={isLoading ? '...' : songTotal} />
          <DashboardStat label="Setlists" value={isLoading ? '...' : setlists.length} />
          <DashboardStat label={role === 'SOLO' ? 'Modo' : 'Bandas'} value={role === 'SOLO' ? 'Solista' : bands.length} />
        </div>

        <div className="dashboard-action-grid">
          {getActionCards(role, bands.length).map((action) => (
            <Link className="dashboard-action-card" key={action.to} to={action.to}>
              <span className="dashboard-action-icon"><Icon type={action.icon} /></span>
              <strong>{action.title}</strong>
              <span>{action.copy}</span>
            </Link>
          ))}
        </div>

        <div className="dashboard-section-heading">
          <div>
            <p className="eyebrow">Repertorio</p>
            <h2>{latestSetlist ? latestSetlist.name : 'Aun no tienes setlist activo'}</h2>
          </div>
          <Link className="secondary-action dashboard-inline-link" to="/setlists">
            <Icon type="list" />
            Ver setlists
          </Link>
        </div>

        {latestSetlist ? (
          <div className="songs-table" role="table" aria-label="Resumen del ultimo setlist">
            <div className="songs-row songs-head" role="row">
              <span>#</span>
              <span>Titulo</span>
              <span>Tono</span>
              <span>BPM</span>
              <span>Duracion</span>
            </div>
            {(latestSetlist.items ?? []).slice(0, 5).map((item, index) => (
              <div className="songs-row" key={item.id} role="row">
                <span className="songs-cell songs-index" data-label="#">{index + 1}</span>
                <span className="song-title songs-cell songs-title-cell" data-label="Titulo">{item.song?.title ?? 'Cancion sin titulo'}</span>
                <span className="song-key songs-cell" data-label="Tono">{item.song?.originalKey ?? 'N/D'}</span>
                <span className="songs-cell" data-label="BPM">{item.song?.bpm ?? 'N/D'}</span>
                <span className="songs-cell" data-label="Duracion">{formatDuration(item.song?.durationSeconds)}</span>
              </div>
            ))}
            {latestSetlist.items?.length ? null : <DashboardEmptyRow message="Este setlist todavia no tiene canciones." />}
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <strong>Crea tu primer setlist</strong>
            <span>Cuando agregues canciones, podras organizarlas para ensayo o presentacion.</span>
          </div>
        )}
      </section>

      <div className="side-column">
        <section className="panel info-panel dashboard-side-panel">
          <h3>
            <Icon type={role === 'SOLO' ? 'user' : 'userCircle'} />
            {getProfilePanelTitle(role, bands.length)}
          </h3>
          {renderProfilePanel(role, primaryBand, user)}
        </section>

        <section className="panel info-panel dashboard-side-panel">
          <h3>
            <Icon type="note" />
            Tus canciones
          </h3>
          <div className="favorite-list">
            {songs.length > 0 ? songs.map((song) => (
              <Link className="favorite-item dashboard-song-link" key={song.id} to={`/teleprompter?songId=${song.id}`}>
                <div className="favorite-title-wrap">
                  <Icon type="star" />
                  <span>{song.title}</span>
                </div>
                <span className="favorite-key">{song.originalKey ?? 'N/D'}</span>
              </Link>
            )) : (
              <div className="dashboard-empty-state compact">
                <strong>No hay canciones todavia</strong>
                <span>Agrega canciones propias para preparar setlists y teleprompter.</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShellLayout>
  )
}

function DashboardStat({ label, value }) {
  return (
    <div className="dashboard-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function DashboardEmptyRow({ message }) {
  return (
    <div className="songs-row" role="row">
      <span className="songs-cell songs-index" data-label="#">-</span>
      <span className="song-title songs-cell songs-title-cell" data-label="Titulo">{message}</span>
      <span className="song-key songs-cell" data-label="Tono">-</span>
      <span className="songs-cell" data-label="BPM">-</span>
      <span className="songs-cell" data-label="Duracion">-</span>
    </div>
  )
}

function getDashboardTitle(role, user) {
  if (role === 'SOLO') {
    return `Hola, ${user?.displayName ?? user?.username ?? 'solista'}`
  }

  if (role === 'ADMIN') {
    return 'Panel de control'
  }

  return `Hola, ${user?.displayName ?? user?.username ?? 'musico'}`
}

function getDashboardSubtitle(role, bandCount) {
  if (role === 'SOLO') {
    return 'Administra tu repertorio personal, canciones y ensayos.'
  }

  if (role === 'MUSICIAN' && bandCount === 0) {
    return 'Aun no perteneces a una banda. Unete o crea una para compartir repertorio.'
  }

  if (role === 'ADMIN') {
    return 'Gestiona tu cuenta y valida el flujo de la plataforma.'
  }

  return 'Revisa canciones, bandas y setlists compartidos contigo.'
}

function getActionCards(role, bandCount) {
  if (role === 'MUSICIAN' && bandCount === 0) {
    return [
      { icon: 'user', title: 'Unirte a una banda', copy: 'Usa un codigo de invitacion para entrar al repertorio compartido.', to: '/bands' },
      { icon: 'plus', title: 'Crear banda', copy: 'Forma tu banda y empieza a invitar integrantes.', to: '/bands' },
      { icon: 'note', title: 'Agregar canciones', copy: 'Carga tus primeras canciones mientras preparas la banda.', to: '/songs' },
    ]
  }

  if (role === 'SOLO') {
    return [
      { icon: 'note', title: 'Agregar canciones', copy: 'Construye tu biblioteca personal para ensayos y shows.', to: '/songs' },
      { icon: 'list', title: 'Crear setlist', copy: 'Ordena tus canciones por evento o presentacion.', to: '/setlists' },
      { icon: 'play', title: 'Abrir teleprompter', copy: 'Ensaya con letra y acordes desde tus canciones.', to: '/teleprompter' },
    ]
  }

  return [
    { icon: 'note', title: 'Ver canciones', copy: 'Consulta tus canciones y las de tus bandas.', to: '/songs' },
    { icon: 'list', title: 'Crear setlist', copy: 'Arma repertorios para ensayo o tocada.', to: '/setlists' },
    { icon: 'user', title: 'Gestionar bandas', copy: 'Revisa integrantes, codigos e invitaciones.', to: '/bands' },
  ]
}

function getLatestSetlist(setlists) {
  return [...setlists].sort((first, second) => {
    const firstTime = first.eventDate ? new Date(first.eventDate).getTime() : 0
    const secondTime = second.eventDate ? new Date(second.eventDate).getTime() : 0
    return secondTime - firstTime || second.id - first.id
  })[0] ?? null
}

function getProfilePanelTitle(role, bandCount) {
  if (role === 'SOLO') return 'Perfil solista'
  if (role === 'MUSICIAN' && bandCount === 0) return 'Siguiente paso'
  return 'Banda principal'
}

function renderProfilePanel(role, band, user) {
  if (role === 'SOLO') {
    return (
      <div className="dashboard-profile-copy">
        <strong>{user?.displayName ?? user?.username}</strong>
        <span>Tu biblioteca es personal. Solo veras canciones creadas por ti y setlists propios.</span>
        <Link className="outline-button dashboard-inline-link" to="/songs">Agregar mi primera cancion</Link>
      </div>
    )
  }

  if (!band) {
    return (
      <div className="dashboard-profile-copy">
        <strong>No perteneces a una banda</strong>
        <span>Unete con un codigo de invitacion o crea una banda para compartir canciones con tus integrantes.</span>
        <Link className="outline-button dashboard-inline-link" to="/bands">Ir a bandas</Link>
      </div>
    )
  }

  return (
    <div className="member-list">
      <div className="dashboard-band-summary">
        <strong>{band.name}</strong>
        <span>{band.members?.length ?? 0} integrantes</span>
      </div>
      {(band.members ?? []).slice(0, 4).map((member) => (
        <div className="member-item" key={member.id}>
          <div className={`member-avatar${member.user?.id === user?.id ? ' highlighted' : ''}`}>{getInitials(member.user?.displayName ?? member.user?.username)}</div>
          <div className="member-copy">
            <span className="member-name">{member.user?.displayName ?? member.user?.username}</span>
            <span className="member-role">{member.instrument}</span>
          </div>
          <span className="member-status online">{formatMemberRole(member.memberRole)}</span>
        </div>
      ))}
    </div>
  )
}

function getInitials(value = '') {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'AM'
}

function formatMemberRole(memberRole) {
  if (memberRole === 'LEADER') return 'Líder'
  if (memberRole === 'MEMBER') return 'Integrante'
  return memberRole ?? 'Integrante'
}

function formatDuration(durationSeconds) {
  if (!durationSeconds && durationSeconds !== 0) {
    return 'N/D'
  }

  const minutes = Math.floor(durationSeconds / 60)
  const seconds = durationSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
