import { Icon } from '../ui/Icon'

export function TopBar() {
  return (
    <header className="topbar">
      <label className="searchbar" htmlFor="quick-search">
        <Icon type="search" />
        <input id="quick-search" type="text" placeholder="Busca rapidamente canciones, listas de canciones o artistas..." />
      </label>

      <div className="topbar-meta">
        <div className="connection-pill">
          <span className="status-dot" />
          <span>CONECTADO</span>
        </div>

        <div className="role-pill">Bajo, Bateria, Voz</div>

        <div className="profile-chip">
          <div>
            <p className="profile-name">Diego Ash</p>
            <p className="profile-role">Guitarra</p>
          </div>
          <div className="profile-avatar">DA</div>
        </div>
      </div>
    </header>
  )
}
