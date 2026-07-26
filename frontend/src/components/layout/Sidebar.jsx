import { navigationItems } from '../../data/dashboardData'
import { Icon } from '../ui/Icon'

export function Sidebar() {
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
        {navigationItems.map((item) => (
          <button key={item.label} className={`nav-item${item.active ? ' active' : ''}`} type="button">
            <Icon type={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <button className="create-setlist" type="button">
        <span className="create-setlist-plus">+</span>
        <span>Agregar Setlist</span>
      </button>
    </aside>
  )
}
