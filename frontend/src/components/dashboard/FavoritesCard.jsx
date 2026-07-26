import { favorites } from '../../data/dashboardData'
import { Icon } from '../ui/Icon'

export function FavoritesCard() {
  return (
    <section className="panel info-panel favorites-panel">
      <h3>
        <Icon type="bookmark" />
        Canciones favoritas
      </h3>

      <div className="favorite-list">
        {favorites.map((song) => (
          <div key={song.title} className="favorite-item">
            <div className="favorite-title-wrap">
              <Icon type="star" />
              <span>{song.title}</span>
            </div>
            <span className="favorite-key">{song.key}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
