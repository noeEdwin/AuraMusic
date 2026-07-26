export function VenueCard() {
  return (
    <section className="panel venue-panel">
      <div className="venue-art">
        <div className="venue-glow" aria-hidden="true" />
        <div className="venue-copy">
          <span className="live-tag">EN VIVO</span>
          <h2>En Vivo Bar Central</h2>
        </div>
      </div>

      <button className="outline-button" type="button">Tocadas anteriores</button>
    </section>
  )
}
