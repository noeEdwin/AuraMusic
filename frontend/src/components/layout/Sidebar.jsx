import { NavLink } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import logo from '../../assets/logo.png'
import { navigationItems } from '../../data/dashboardData'
import { Icon } from '../ui/Icon'

export function Sidebar({ isOpen = false, onNavigate, onToggle }) {
  const { role } = useAuth()

  const visibleItems = navigationItems.filter((item) => !item.roles || item.roles.includes(role))

  return (
    <aside className={`sidebar${isOpen ? ' is-open' : ''}`}>
      <div className="sidebar-top">
         <img className="sidebar-logo" src={logo} alt="AuraMusic" />
        <div>
          <p className="brand-name">AuraMusic</p>
        </div>
        <button className="icon-button menu-button" type="button" aria-label="Alternar menu" onClick={onToggle}>
          <Icon type="menu" />
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Navegacion principal">
        {visibleItems.map((item) => (
          item.path ? (
            <NavLink key={item.label} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} to={item.path} onClick={onNavigate}>
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

    </aside>
  )
}
