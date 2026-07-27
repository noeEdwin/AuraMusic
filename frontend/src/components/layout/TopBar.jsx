import { useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { Icon } from '../ui/Icon'

export function TopBar({ onMenuToggle }) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const displayName = user?.displayName ?? 'Invitado'
  const email = user?.email ?? 'sin-correo'
  const role = user?.role ?? 'SIN ROL'
  const avatarInitials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'AM'

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await logout()
      navigate('/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="topbar">
      <button className="icon-button topbar-menu-button" type="button" aria-label="Abrir menu" onClick={onMenuToggle}>
        <Icon type="menu" />
      </button>

      <label className="searchbar" htmlFor="quick-search">
        <Icon type="search" />
        <input id="quick-search" type="text" placeholder="Busca rapidamente canciones, listas de canciones o artistas..." />
      </label>

      <div className="topbar-meta">
        <div className="connection-pill">
          <span className="status-dot" />
          <span>CONECTADO</span>
        </div>

        <div className="role-pill">{role}</div>

        <div className="profile-chip">
          <div>
            <p className="profile-name">{displayName}</p>
            <p className="profile-email">{email}</p>
          </div>
          <div className="profile-avatar">{avatarInitials}</div>
        </div>

        <button className="logout-button" type="button" onClick={handleLogout} disabled={isLoggingOut}>
          <Icon type="logout" />
          <span>{isLoggingOut ? 'Cerrando...' : 'Logout'}</span>
        </button>
      </div>
    </header>
  )
}
