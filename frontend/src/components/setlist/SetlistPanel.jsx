import { Icon } from '../ui/Icon'
import './setlists.css'

export function SetlistPanel() {
  return (
    <section className="panel setlist-panel">
      <div className="setlist-header">
        <div>
          <p className="eyebrow">Setlist activa</p>
          <h1>Sin setlist activa</h1>
          <p className="setlist-location">
            <Icon type="pin" />
            Crea un setlist para iniciar una sesion
          </p>
        </div>

        <div className="setlist-actions-top">
          <div className="duration-badge">
            <span className="duration-label">Duracion total</span>
            <strong>0m</strong>
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

        <div className="songs-row" role="row">
          <span className="songs-cell songs-index" data-label="#">-</span>
          <span className="song-title songs-cell songs-title-cell" data-label="Titulo">No hay canciones agregadas</span>
          <span className="song-key songs-cell" data-label="Tono">-</span>
          <span className="songs-cell" data-label="BPM">-</span>
          <span className="songs-cell" data-label="Duracion">-</span>
        </div>
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
