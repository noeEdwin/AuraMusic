import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { fetchSongsCatalog, updateSong } from '../../catalog/catalogApi'
import { getApiErrorMessage } from '../../lib/api'
import { parseTeleprompterSections } from '../../teleprompter/teleprompterParser'
import { mockTeleprompterSongs } from '../../teleprompter/mockTeleprompterSongs'
import { AppShellLayout } from '../layout/AppShellLayout'
import { StatusBanner } from '../shared/StatusBanner'
import { Icon } from '../ui/Icon'

const TELEPROMPTER_PAGE_SIZE = 20

export function TeleprompterView() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const scrollAreaRef = useRef(null)
  const [songs, setSongs] = useState([])
  const [selectedSongId, setSelectedSongId] = useState('')
  const [transposeSteps, setTransposeSteps] = useState(0)
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(false)
  const [isControlsOpen, setIsControlsOpen] = useState(false)
  const [isEditingLyrics, setIsEditingLyrics] = useState(false)
  const [isSavingLyrics, setIsSavingLyrics] = useState(false)
  const [lyricsDraft, setLyricsDraft] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [fontSizeScale, setFontSizeScale] = useState(1)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    async function loadSongs() {
      setIsLoading(true)
      setError('')

      try {
        const data = await fetchSongsCatalog({ page: 0, size: TELEPROMPTER_PAGE_SIZE })
        const songsWithLyrics = [
          ...mockTeleprompterSongs,
          ...(data.content ?? []).filter((song) => song.lyrics),
        ]

        if (!ignore) {
          setSongs(songsWithLyrics)
          setSelectedSongId((current) => {
            const requestedSongId = searchParams.get('songId')

            if (requestedSongId && songsWithLyrics.some((song) => String(song.id) === requestedSongId)) {
              return requestedSongId
            }

            if (current) {
              return current
            }

            const preferredSong = songsWithLyrics.find((song) => song.id === 'mock-kumbala')
            return String(preferredSong?.id ?? songsWithLyrics[0]?.id ?? '')
          })
        }
      } catch (requestError) {
        if (!ignore) {
          setError(getApiErrorMessage(requestError, 'No fue posible cargar canciones para el teleprompter.'))
          setSongs([])
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadSongs()

    return () => {
      ignore = true
    }
  }, [searchParams])

  useEffect(() => {
    const requestedSongId = searchParams.get('songId')

    if (requestedSongId && songs.some((song) => String(song.id) === requestedSongId)) {
      setSelectedSongId(requestedSongId)
    }
  }, [searchParams, songs])

  const selectedSong = useMemo(
    () => songs.find((song) => String(song.id) === selectedSongId) ?? null,
    [selectedSongId, songs],
  )
  const canPersistSelectedSong = selectedSong?.id != null && !String(selectedSong.id).startsWith('mock-')

  const parsedSections = useMemo(
    () => parseTeleprompterSections(selectedSong?.lyrics ?? '', transposeSteps),
    [selectedSong?.lyrics, transposeSteps],
  )

  useEffect(() => {
    setIsAutoScrollEnabled(false)
    setIsControlsOpen(false)
    setIsEditingLyrics(false)
    setLyricsDraft('')
    setSaveError('')
    setSaveMessage('')
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0
    }
  }, [selectedSongId])

  useEffect(() => {
    if (!isAutoScrollEnabled || !scrollAreaRef.current) {
      return undefined
    }

    const scrollElement = scrollAreaRef.current
    let frameId = 0

    function step() {
      const reachedBottom = scrollElement.scrollTop + scrollElement.clientHeight >= scrollElement.scrollHeight - 2

      if (reachedBottom) {
        setIsAutoScrollEnabled(false)
        return
      }

      scrollElement.scrollTop += 0.7
      frameId = window.requestAnimationFrame(step)
    }

    frameId = window.requestAnimationFrame(step)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [isAutoScrollEnabled])

  function decreaseFontSize() {
    setFontSizeScale((current) => Math.max(0.8, Number((current - 0.1).toFixed(2))))
  }

  function increaseFontSize() {
    setFontSizeScale((current) => Math.min(1.5, Number((current + 0.1).toFixed(2))))
  }

  function resetAdjustments() {
    setTransposeSteps(0)
    setFontSizeScale(1)
  }

  function startEditingLyrics() {
    setLyricsDraft(selectedSong?.lyrics ?? '')
    setIsEditingLyrics(true)
    setIsAutoScrollEnabled(false)
    setSaveError('')
    setSaveMessage('')
  }

  function cancelEditingLyrics() {
    setIsEditingLyrics(false)
    setLyricsDraft('')
    setSaveError('')
  }

  async function saveLyrics() {
    if (!selectedSong) {
      return
    }

    if (!canPersistSelectedSong) {
      setSaveError('Esta cancion es una demo local. Selecciona una cancion real del catalogo para guardar en la API.')
      return
    }

    setIsSavingLyrics(true)
    setSaveError('')
    setSaveMessage('')

    try {
      const updatedSong = await updateSong(selectedSong.id, buildUpdateSongPayload(selectedSong, lyricsDraft))
      setSongs((currentSongs) => currentSongs.map((song) => (song.id === updatedSong.id ? updatedSong : song)))
      setSelectedSongId(String(updatedSong.id))
      setIsEditingLyrics(false)
      setLyricsDraft('')
      setSaveMessage('Letra y acordes guardados en el catalogo.')
    } catch (requestError) {
      setSaveError(getApiErrorMessage(requestError, 'No fue posible guardar la letra y los acordes.'))
    } finally {
      setIsSavingLyrics(false)
    }
  }

  return (
    <AppShellLayout contentClassName="content-grid teleprompter-grid" topBarVariant="compact">
      <section className="panel teleprompter-panel">
        <div className="teleprompter-toolbar">
          <button className="teleprompter-back" type="button" aria-label="Regresar" onClick={() => navigate(-1)}>
            <Icon type="chevronLeft" />
          </button>

          <div className={`teleprompter-actions${isControlsOpen ? ' is-open' : ''}`}>
            <div className="teleprompter-adjustments" aria-label="Ajustes de tono y letra">
              <button className="teleprompter-action-button" type="button" onClick={() => setTransposeSteps((current) => current - 1)}>
                <Icon type="minus" />
              </button>
              <span className="teleprompter-key-chip">{getDisplayKey(selectedSong, transposeSteps)}</span>
              <button className="teleprompter-action-button" type="button" onClick={() => setTransposeSteps((current) => current + 1)}>
                <Icon type="plus" />
              </button>
              <button className="teleprompter-action-button teleprompter-font-button" type="button" onClick={decreaseFontSize}>
                A-
              </button>
              <button className="teleprompter-action-button teleprompter-font-button" type="button" onClick={increaseFontSize}>
                A+
              </button>
              <button className="teleprompter-action-button teleprompter-reset-button" type="button" onClick={resetAdjustments}>
                Reset
              </button>
            </div>
            <button
              className="teleprompter-action-button teleprompter-settings-button"
              type="button"
              aria-label="Mostrar ajustes del teleprompter"
              aria-expanded={isControlsOpen}
              onClick={() => setIsControlsOpen((current) => !current)}
            >
              <Icon type="gear" />
            </button>
          </div>
          <button className="teleprompter-edit-button" type="button" onClick={startEditingLyrics} disabled={!selectedSong}>
            <Icon type="note" />
            <span>Editar</span>
          </button>
        </div>

        <div className="teleprompter-stage">
          <StatusBanner message={error} tone="error" />
          <StatusBanner message={saveMessage} tone="info" />
          <StatusBanner message={saveError} tone="error" />

          {isEditingLyrics && selectedSong ? (
            <section className="teleprompter-editor" aria-label="Editor de letra y acordes">
              <div className="teleprompter-editor-header">
                <div>
                  <p className="eyebrow">Letra y acordes</p>
                  <h2>{selectedSong.title}</h2>
                </div>
                {!canPersistSelectedSong ? <span className="catalog-local-tag">Demo local sin guardado API</span> : null}
              </div>

              <textarea
                value={lyricsDraft}
                onChange={(event) => setLyricsDraft(event.target.value)}
                spellCheck="false"
                placeholder="Escribe la letra usando acordes inline, por ejemplo: [Cm]Luz roja en la [G7]esquina"
              />

              <p className="teleprompter-editor-help">Formato: usa secciones como [VERSO 1] y acordes inline como [Cm], [G7], [F#m].</p>

              <div className="teleprompter-editor-actions">
                <button className="secondary-action" type="button" onClick={cancelEditingLyrics} disabled={isSavingLyrics}>
                  Cancelar
                </button>
                <button className="catalog-submit" type="button" onClick={saveLyrics} disabled={isSavingLyrics || !canPersistSelectedSong}>
                  {isSavingLyrics ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </section>
          ) : null}

          {isLoading ? <div className="teleprompter-empty">Cargando canciones del catalogo...</div> : null}

          {!isLoading && !error && !selectedSong ? (
            <div className="teleprompter-empty">No hay canciones con letras disponibles para el teleprompter todavia.</div>
          ) : null}

          {!isLoading && selectedSong && !isEditingLyrics ? (
            <div className="teleprompter-scroll-area" ref={scrollAreaRef}>
              <header className="teleprompter-song-meta">
                <div>
                  <h1>{selectedSong.title}</h1>
                  <p>{selectedSong.artist?.name ?? 'Artista sin asignar'} · {selectedSong.album?.title ?? 'Sin album'}</p>
                </div>
                <div className="teleprompter-meta-pills">
                  <span>{selectedSong.genre ?? 'Sin genero'}</span>
                  <span>{selectedSong.bpm ?? 'N/D'} BPM</span>
                </div>
              </header>

              <div className="teleprompter-sections" style={{ '--teleprompter-font-scale': fontSizeScale }}>
                {parsedSections.map((section, sectionIndex) => (
                  <section key={`${section.label}-${sectionIndex}`} className="teleprompter-section-block">
                    <span className="teleprompter-section-badge">{section.label}</span>

                    <div className="teleprompter-lines">
                      {section.lines.map((line, lineIndex) => {
                        if (line.type === 'spacer') {
                          return <div key={`${section.label}-spacer-${lineIndex}`} className="teleprompter-spacer" />
                        }

                        return (
                          <div key={`${section.label}-line-${lineIndex}`} className="teleprompter-line">
                            {line.segments.map((segment, segmentIndex) => (
                              <div key={`${section.label}-segment-${lineIndex}-${segmentIndex}`} className={`teleprompter-segment${segment.chord && !segment.lyric ? ' chord-only' : ''}`}>
                                <span className="teleprompter-chord">{segment.chord ?? '\u00A0'}</span>
                                <span className="teleprompter-lyric">{segment.lyric || '\u00A0'}</span>
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <footer className="teleprompter-footer">
          <button className="teleprompter-play-button" type="button" onClick={() => setIsAutoScrollEnabled((current) => !current)}>
            <Icon type={isAutoScrollEnabled ? 'pause' : 'play'} />
          </button>

          <div className="teleprompter-footer-group">
            <span className="teleprompter-footer-label">Auto-scroll</span>
            <strong>{isAutoScrollEnabled ? 'Activo' : 'Pausado'}</strong>
          </div>

          <div className="teleprompter-footer-group teleprompter-bpm-box">
            <strong>{selectedSong?.bpm ?? 'N/D'}</strong>
            <span className="teleprompter-footer-label">BPM</span>
          </div>

          <div className="teleprompter-footer-group teleprompter-sync-box">
            <strong>Sincronizado</strong>
            <span className="teleprompter-footer-label">
              {selectedSong?.artist?.name ?? 'Catalogo local'}
            </span>
          </div>
        </footer>
      </section>
    </AppShellLayout>
  )
}

function buildUpdateSongPayload(song, lyrics) {
  return {
    artistId: song.artist?.id,
    albumId: song.album?.id ?? null,
    title: song.title,
    lyrics,
    durationSeconds: song.durationSeconds,
    genre: song.genre,
    originalKey: song.originalKey,
    bpm: song.bpm,
    audioUrl: song.audioUrl,
    coverUrl: song.coverUrl,
    trackNumber: song.trackNumber,
    explicitContent: Boolean(song.explicitContent),
  }
}

function getDisplayKey(song, transposeSteps) {
  if (!song?.originalKey) {
    return 'N/D'
  }

  const transposedSong = parseTeleprompterSections(`[VERSO]\n[${song.originalKey}]demo`, transposeSteps)
  const transposedKey = transposedSong[0]?.lines[0]?.segments[0]?.chord

  return transposedKey ?? song.originalKey
}
