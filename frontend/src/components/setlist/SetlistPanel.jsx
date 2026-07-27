import { songs } from '../../data/dashboardData'
import { Icon } from '../ui/Icon'

export function SetlistPanel() {
  return (
    <section className="panel setlist-panel">
      <div className="setlist-header">
        <div>
          <p className="eyebrow">Setlist activa</p>
          <h1>En Vivo - Bar Central</h1>
          <p className="setlist-location">
            <Icon type="pin" />
            Ocotlan Oaxaca 11 Julio de 2026
          </p>
        </div>

        <div className="setlist-actions-top">
          <div className="duration-badge">
            <span className="duration-label">Duracion total</span>
            <strong>1h 45m</strong>
          </div>

          <button className="start-button" type="button">
            <Icon type="play" />
            <span>Comenzar sesion</span>
          </button>
        </div>
      </div>

      <div className="songs-table" role="table" aria-label="Setlist actual">
        <div className="songs-row songs-head" role="row">
          <span>#</span>
          <span>Titulo</span>
          <span>Tono</span>
          <span>BPM</span>
          <span>Duracion</span>
        </div>

        {songs.map((song) => (
          <div key={song.number} className={`songs-row${song.active ? ' active' : ''}`} role="row">
            <span className="songs-cell songs-index" data-label="#">{song.number}</span>
            <span className="song-title songs-cell songs-title-cell" data-label="Titulo">
              {song.active ? <span className="row-play">▸</span> : null}
              {song.title}
            </span>
            <span className="song-key songs-cell" data-label="Tono">{song.key}</span>
            <span className="songs-cell" data-label="BPM">{song.bpm}</span>
            <span className="songs-cell" data-label="Duracion">{song.duration}</span>
          </div>
        ))}
      </div>

      <div className="panel-actions">
        <button className="secondary-action" type="button">
          <Icon type="plus" />
          <span>Agregar cancion</span>
        </button>
        <button className="secondary-action" type="button">
          <Icon type="reorder" />
          <span>Reordenar</span>
        </button>
        <button className="secondary-action" type="button">
          <Icon type="share" />
          <span>Compartir</span>
        </button>
      </div>
    </section>
  )
}
