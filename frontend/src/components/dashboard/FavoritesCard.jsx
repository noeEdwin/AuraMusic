import { Icon } from '../ui/Icon'

export function FavoritesCard() {
  return (
    <section className="panel info-panel favorites-panel">
      <h3>
        <Icon type="bookmark" />
        Canciones favoritas
      </h3>

      <div className="favorite-list">
        <div className="favorite-item">
          <div className="favorite-title-wrap">
            <Icon type="star" />
            <span>No hay canciones favoritas</span>
          </div>
        </div>
      </div>
    </section>
  )
}
