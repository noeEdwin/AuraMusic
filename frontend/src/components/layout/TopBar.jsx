import { useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { Icon } from '../ui/Icon'
import { AvatarImage } from '../shared/AvatarImage'
import '../profile/profile.css'

export function TopBar({ onMenuToggle, variant = 'default' }) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  const displayName = user?.displayName ?? 'Invitado'
  const email = user?.email ?? 'sin-correo'
  const role = user?.role ?? 'SIN ROL'
  const isCompact = variant === 'compact'

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
    <header className={`topbar${isCompact ? ' topbar-compact' : ''}`}>
      <button className="icon-button topbar-menu-button" type="button" aria-label="Abrir menu" onClick={onMenuToggle}>
        <Icon type="menu" />
      </button>

      {!isCompact ? (
        <label className="searchbar" htmlFor="quick-search">
          <Icon type="search" />
          <input id="quick-search" type="text" placeholder="Busca rapidamente canciones, listas de canciones o artistas..." />
        </label>
      ) : null}

      <div className="topbar-meta">
        <div className="connection-pill">
          <span className="status-dot" />
          <span className="connection-label">CONECTADO</span>
        </div>

        <div className="role-pill">{role}</div>

        <div className="profile-chip">
          <div className="profile-copy">
            <p className="profile-name">{displayName}</p>
            <p className="profile-email">{email}</p>
          </div>
           <button
             className="profile-avatar-button"
             type="button"
             aria-expanded={isProfileMenuOpen}
             aria-label="Abrir menu de usuario"
             onClick={() => setIsProfileMenuOpen((current) => !current)}
           >
              <AvatarImage src={user?.avatarUrl} alt="Foto de perfil" />
           </button>
           {isProfileMenuOpen ? (
             <div className="profile-dropdown">
               <div className="profile-dropdown-heading">
                 <strong>{displayName}</strong>
                 <span>{email}</span>
               </div>
               <button className="profile-dropdown-item" type="button" onClick={() => { setIsProfileMenuOpen(false); navigate('/profile') }}>
                 <Icon type="gear" />
                 <span>Configuración</span>
               </button>
             </div>
           ) : null}
         </div>

        <button className="logout-button" type="button" onClick={handleLogout} disabled={isLoggingOut}>
          <Icon type="logout" />
          <span className="logout-label">{isLoggingOut ? 'Cerrando...' : 'Logout'}</span>
        </button>
      </div>
    </header>
  )
}
