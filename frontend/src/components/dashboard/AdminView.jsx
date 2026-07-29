import { useEffect, useState } from 'react'

import { fetchAdminSummary } from '../../admin/adminApi'
import { fetchArtistsCatalog, fetchSongsCatalog } from '../../catalog/catalogApi'
import { fetchBands } from '../../bands/bandsApi'
import { fetchSetlists } from '../../setlists/setlistsApi'
import { getApiErrorMessage } from '../../lib/api'
import { useAuth } from '../../auth/useAuth'
import { AppShellLayout } from '../layout/AppShellLayout'
import { StatusBanner } from '../shared/StatusBanner'
import '../setlist/setlists.css'
import './admin.css'

export function AdminView() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadAdminMetrics() {
      try {
        const [summary, bands, setlists, artists, songs] = await Promise.all([
          fetchAdminSummary(),
          fetchBands(),
          fetchSetlists(),
          fetchArtistsCatalog({ page: 0, size: 1 }),
          fetchSongsCatalog({ page: 0, size: 1 }),
        ])

        if (!ignore) {
          setMetrics({
            users: summary.totalUsers,
            bands: bands.length,
            setlists: setlists.length,
            artists: artists.totalElements ?? 0,
            songs: songs.totalElements ?? 0,
          })
        }
      } catch (requestError) {
        if (!ignore) setError(getApiErrorMessage(requestError, 'No fue posible cargar las métricas administrativas.'))
      }
    }

    void loadAdminMetrics()
    return () => { ignore = true }
  }, [])

  return (
    <AppShellLayout contentClassName="content-grid admin-grid">
      <section className="panel page-panel admin-panel">
        <div className="admin-hero">
          <div>
            <span className="page-panel-badge">Acceso privado</span>
            <h1>Consola del administrador</h1>
            <p>Este espacio reemplaza el dashboard general y solo está disponible para la cuenta con privilegios administrativos.</p>
          </div>
          <div className="admin-lock-badge">ADMIN</div>
        </div>

        <StatusBanner message={error} tone="error" />

        <div className="admin-stat-grid">
          <AdminStat label="Bandas registradas" value={metrics?.bands} />
          <AdminStat label="Usuarios registrados" value={metrics?.users} />
          <AdminStat label="Setlists disponibles" value={metrics?.setlists} />
          <AdminStat label="Artistas en catálogo" value={metrics?.artists} />
          <AdminStat label="Canciones en catálogo" value={metrics?.songs} />
        </div>

        <div className="admin-content-grid">
          <section className="admin-info-card admin-control-card">
            <p className="eyebrow">Identidad de control</p>
            <h2>{user?.displayName ?? user?.username}</h2>
            <dl className="admin-detail-list">
              <div><dt>Usuario interno</dt><dd>{user?.username}</dd></div>
              <div><dt>ID de cuenta</dt><dd>{user?.id}</dd></div>
              <div><dt>Correo de control</dt><dd>{user?.email}</dd></div>
              <div><dt>Nivel de acceso</dt><dd>Administrador principal</dd></div>
            </dl>
          </section>
        </div>
      </section>
    </AppShellLayout>
  )
}

function AdminStat({ label, value }) {
  return (
    <article className="admin-stat-card">
      <span>{label}</span>
      <strong>{typeof value === 'number' ? value : '...'}</strong>
    </article>
  )
}
