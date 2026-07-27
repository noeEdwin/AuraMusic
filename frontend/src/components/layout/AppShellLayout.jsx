import { useState } from 'react'

import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShellLayout({ children, contentClassName = 'content-grid' }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  function toggleSidebar() {
    setIsSidebarOpen((current) => !current)
  }

  function closeSidebar() {
    setIsSidebarOpen(false)
  }

  return (
    <div className={`app-shell${isSidebarOpen ? ' sidebar-open' : ''}`}>
      <button
        className={`sidebar-backdrop${isSidebarOpen ? ' visible' : ''}`}
        type="button"
        aria-label="Cerrar menu lateral"
        onClick={closeSidebar}
      />

      <Sidebar isOpen={isSidebarOpen} onNavigate={closeSidebar} onToggle={toggleSidebar} />

      <div className="main-layout">
        <TopBar onMenuToggle={toggleSidebar} />
        <main className={contentClassName}>{children}</main>
      </div>
    </div>
  )
}
