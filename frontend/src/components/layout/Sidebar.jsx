import { NavLink } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { navigationItems } from '../../data/dashboardData'
import { Icon } from '../ui/Icon'

export function Sidebar() {
  const { role } = useAuth()

  const visibleItems = navigationItems.filter((item) => !item.roles || item.roles.includes(role))

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand-mark" aria-hidden="true" />
        <div>
          <p className="brand-name">AuraMusic</p>
        </div>
        <button className="icon-button menu-button" type="button" aria-label="Abrir menu">
          <Icon type="menu" />
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Navegacion principal">
        {visibleItems.map((item) => (
          item.path ? (
            <NavLink key={item.label} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} to={item.path}>
              <Icon type={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ) : (
            <button key={item.label} className="nav-item nav-item-static" type="button">
              <Icon type={item.icon} />
              <span>{item.label}</span>
            </button>
          )
        ))}
      </nav>

      <button className="create-setlist" type="button">
        <span className="create-setlist-plus">+</span>
        <span>Agregar Setlist</span>
      </button>
    </aside>
  )
}
