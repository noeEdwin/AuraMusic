import { AppShellLayout } from '../layout/AppShellLayout'

export function AdminView() {
  return (
    <AppShellLayout contentClassName="content-grid admin-grid">
      <section className="panel page-panel">
        <span className="page-panel-badge">ADMIN</span>
        <h1>Centro de control</h1>
        <p>
          Esta ruta queda protegida solo para administradores y sirve para validar la sesion JWT y el control por rol en frontend.
        </p>
      </section>
    </AppShellLayout>
  )
}
