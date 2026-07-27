import { Sidebar } from '../layout/Sidebar'
import { TopBar } from '../layout/TopBar'

export function AdminView() {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-layout">
        <TopBar />

        <main className="content-grid admin-grid">
          <section className="panel page-panel">
            <span className="page-panel-badge">ADMIN</span>
            <h1>Centro de control</h1>
            <p>
              Esta ruta queda protegida solo para administradores y sirve para validar la sesion JWT y el control por rol en frontend.
            </p>
          </section>
        </main>
      </div>
    </div>
  )
}
