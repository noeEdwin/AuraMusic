export function LoadingScreen({ message = 'Cargando...' }) {
  return (
    <section className="page-state-shell">
      <div className="page-state-card panel page-state-card-loading">
        <div className="loading-orb" aria-hidden="true" />
        <h1>Preparando tu sesion</h1>
        <p>{message}</p>
      </div>
    </section>
  )
}
