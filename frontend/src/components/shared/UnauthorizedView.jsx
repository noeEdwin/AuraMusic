import { Link } from 'react-router-dom'

export function UnauthorizedView() {
  return (
    <section className="page-state-shell">
      <div className="page-state-card panel">
        <span className="page-state-badge">403</span>
        <h1>No tienes acceso a esta vista</h1>
        <p>Tu rol actual no tiene permisos para abrir esta ruta.</p>
        <Link className="page-state-link" to="/dashboard">Volver al panel</Link>
      </div>
    </section>
  )
}
