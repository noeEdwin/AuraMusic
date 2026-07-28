import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { fetchSongsCatalog, updateSong } from '../../catalog/catalogApi'
import { getApiErrorMessage } from '../../lib/api'
import { createLiveSessionClient } from '../../live/liveSessionClient'
import { fetchSetlist } from '../../setlists/setlistsApi'
import { parseTeleprompterSections } from '../../teleprompter/teleprompterParser'
import { mockTeleprompterSongs } from '../../teleprompter/mockTeleprompterSongs'
import { AppShellLayout } from '../layout/AppShellLayout'
import { StatusBanner } from '../shared/StatusBanner'
import { Icon } from '../ui/Icon'

const TELEPROMPTER_PAGE_SIZE = 20
const AUTO_SCROLL_PIXELS_PER_SECOND = 42

export function TeleprompterView() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { token } = useAuth()
  const scrollAreaRef = useRef(null)
  const liveClientRef = useRef(null)
  const [songs, setSongs] = useState([])
  const [liveSetlist, setLiveSetlist] = useState(null)
  const [liveSessionState, setLiveSessionState] = useState(null)
  const [liveConnectionState, setLiveConnectionState] = useState('local')
  const [liveError, setLiveError] = useState('')
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
  const bandId = searchParams.get('bandId')
  const setlistId = searchParams.get('setlistId')
  const requestedItemId = searchParams.get('itemId')
  const liveMemberRole = searchParams.get('memberRole')
  const shouldStartSession = searchParams.get('startSession') === 'true'
  const isLiveMode = Boolean(bandId && setlistId)
  const canControlLiveSession = liveMemberRole === 'LEADER'

  useEffect(() => {
    let ignore = false

    async function loadSongs() {
      setIsLoading(true)
      setError('')

      try {
        const [data, requestedSetlist] = await Promise.all([
          fetchSongsCatalog({ page: 0, size: TELEPROMPTER_PAGE_SIZE }),
          setlistId ? fetchSetlist(setlistId) : Promise.resolve(null),
        ])
        const candidateSongs = [
          ...mockTeleprompterSongs,
          ...(requestedSetlist?.items ?? []).map((item) => item.song).filter(Boolean),
          ...(data.content ?? []).filter((song) => song.lyrics),
        ]
        const songsWithLyrics = [...new Map(candidateSongs.map((song) => [String(song.id), song])).values()]

        if (!ignore) {
          setSongs(songsWithLyrics)
          setLiveSetlist(requestedSetlist)
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
  }, [searchParams, setlistId])

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
    if (!isLiveMode || !token || !liveSetlist) {
      liveClientRef.current = null
      setLiveConnectionState('local')
      setLiveSessionState(null)
      return undefined
    }

    let disposed = false
    let sentInitialCommand = false
    const client = createLiveSessionClient({
      bandId,
      token,
      onConnectionChange: (connectionState) => {
        if (disposed) return
        setLiveConnectionState(connectionState)

        if (connectionState === 'connected') {
          setLiveError('')
          const command = !sentInitialCommand && shouldStartSession
            ? {
                type: 'START_SESSION',
                setlistId: Number(setlistId),
                activeItemId: Number(requestedItemId),
              }
            : { type: 'SYNC_REQUEST' }
          sentInitialCommand = true
          client.publish(command)
        }
      },
      onError: (message) => {
        if (!disposed) setLiveError(message)
      },
      onState: (state) => {
        if (disposed) return

        setLiveSessionState(state)
        setIsAutoScrollEnabled(Boolean(state.active && state.playing))

        const activeItem = liveSetlist.items?.find((item) => String(item.id) === String(state.activeItemId))
        if (activeItem?.song?.id) setSelectedSongId(String(activeItem.song.id))
      },
    })

    liveClientRef.current = client
    client.connect()

    return () => {
      disposed = true
      if (liveClientRef.current === client) liveClientRef.current = null
      void client.disconnect()
    }
  }, [bandId, isLiveMode, liveSetlist, requestedItemId, setlistId, shouldStartSession, token])

  useEffect(() => {
    if (!isLiveMode) setIsAutoScrollEnabled(false)
    setIsControlsOpen(false)
    setIsEditingLyrics(false)
    setLyricsDraft('')
    setSaveError('')
    setSaveMessage('')
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0
    }
  }, [isLiveMode, selectedSongId])

  useEffect(() => {
    if (!isLiveMode || !liveSessionState?.active || !scrollAreaRef.current) return

    const targetScrollTop = liveSessionState.positionSeconds * AUTO_SCROLL_PIXELS_PER_SECOND
    if (Math.abs(scrollAreaRef.current.scrollTop - targetScrollTop) > 28) {
      scrollAreaRef.current.scrollTop = targetScrollTop
    }
  }, [isLiveMode, liveSessionState?.active, liveSessionState?.activeItemId, liveSessionState?.positionSeconds, selectedSongId])

  useEffect(() => {
    if (!isAutoScrollEnabled || !scrollAreaRef.current) {
      return undefined
    }

    const scrollElement = scrollAreaRef.current
    let frameId = 0
    let previousTimestamp = null

    function step(timestamp) {
      const reachedBottom = scrollElement.scrollTop + scrollElement.clientHeight >= scrollElement.scrollHeight - 2

      if (reachedBottom) {
        if (isLiveMode && !canControlLiveSession) return
        setIsAutoScrollEnabled(false)
        if (isLiveMode) liveClientRef.current?.publish({ type: 'PAUSE' })
        return
      }

      if (previousTimestamp !== null) {
        const elapsedMilliseconds = Math.min(timestamp - previousTimestamp, 50)
        scrollElement.scrollTop += AUTO_SCROLL_PIXELS_PER_SECOND * elapsedMilliseconds / 1000
      }
      previousTimestamp = timestamp
      frameId = window.requestAnimationFrame(step)
    }

    frameId = window.requestAnimationFrame(step)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [canControlLiveSession, isAutoScrollEnabled, isLiveMode, selectedSongId])

  useEffect(() => {
    if (!isLiveMode || !canControlLiveSession || liveConnectionState !== 'connected' || !liveSessionState?.active || !isAutoScrollEnabled) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      publishCurrentLivePosition()
    }, 2000)

    return () => window.clearInterval(intervalId)
  }, [canControlLiveSession, isAutoScrollEnabled, isLiveMode, liveConnectionState, liveSessionState?.active])

  function togglePlayback() {
    if (!isLiveMode) {
      setIsAutoScrollEnabled((current) => !current)
      return
    }

    if (liveConnectionState !== 'connected') {
      setLiveError('Espera a que la sesion en vivo termine de conectar.')
      return
    }

    publishCurrentLivePosition()
    const sent = liveClientRef.current?.publish({ type: isAutoScrollEnabled ? 'PAUSE' : 'PLAY' })
    if (!sent) setLiveError('No fue posible enviar el control a la sesion en vivo.')
  }

  function publishCurrentLivePosition() {
    if (!scrollAreaRef.current) return false

    return liveClientRef.current?.publish({
      type: 'SEEK',
      positionSeconds: Math.max(0, Math.round(scrollAreaRef.current.scrollTop / AUTO_SCROLL_PIXELS_PER_SECOND)),
    }) ?? false
  }

  function changeLiveSong(offset) {
    if (!canControlLiveSession || !liveSessionState?.active) return

    const items = liveSetlist?.items ?? []
    const activeIndex = items.findIndex((item) => String(item.id) === String(liveSessionState.activeItemId))
    const targetItem = items[activeIndex + offset]
    if (!targetItem) return

    const sent = liveClientRef.current?.publish({ type: 'CHANGE_SONG', activeItemId: targetItem.id })
    if (!sent) setLiveError('No fue posible cambiar la cancion activa.')
  }

  function closeLiveSession() {
    const sent = liveClientRef.current?.publish({ type: 'CLOSE_SESSION' })
    if (!sent) setLiveError('No fue posible cerrar la sesion en vivo.')
  }

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
          <StatusBanner message={liveError} tone="error" />

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
                  <span className={`teleprompter-live-pill ${liveConnectionState}`}>
                    {isLiveMode ? getLiveConnectionLabel(liveConnectionState, liveSessionState) : 'Modo local'}
                  </span>
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
          <div className="teleprompter-play-controls">
            {isLiveMode && canControlLiveSession ? <button className="teleprompter-skip-button" type="button" aria-label="Cancion anterior" onClick={() => changeLiveSong(-1)} disabled={!getAdjacentLiveItem(liveSetlist, liveSessionState, -1)}><Icon type="chevronLeft" /></button> : null}
            <button
              className="teleprompter-play-button"
              type="button"
              onClick={togglePlayback}
              disabled={isLiveMode && (liveConnectionState !== 'connected' || !liveSessionState?.active || !canControlLiveSession)}
            >
              <Icon type={isAutoScrollEnabled ? 'pause' : 'play'} />
            </button>
            {isLiveMode && canControlLiveSession ? <button className="teleprompter-skip-button" type="button" aria-label="Cancion siguiente" onClick={() => changeLiveSong(1)} disabled={!getAdjacentLiveItem(liveSetlist, liveSessionState, 1)}><Icon type="chevronRight" /></button> : null}
          </div>

          <div className="teleprompter-footer-group">
            <span className="teleprompter-footer-label">Auto-scroll</span>
            <strong>{isAutoScrollEnabled ? 'Activo' : 'Pausado'}</strong>
          </div>

          <div className="teleprompter-footer-group teleprompter-bpm-box">
            <strong>{selectedSong?.bpm ?? 'N/D'}</strong>
            <span className="teleprompter-footer-label">BPM</span>
          </div>

          <div className="teleprompter-footer-group teleprompter-sync-box">
            <strong>{isLiveMode ? getLiveConnectionLabel(liveConnectionState, liveSessionState) : 'Modo local'}</strong>
            <span className="teleprompter-footer-label">
              {isLiveMode ? liveSetlist?.name ?? 'Setlist de banda' : 'Sesion personal'}
            </span>
          </div>

          {isLiveMode && canControlLiveSession ? <button className="teleprompter-close-live-button" type="button" onClick={closeLiveSession} disabled={!liveSessionState?.active}>Cerrar sesion</button> : null}
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

function getLiveConnectionLabel(connectionState, sessionState) {
  if (connectionState === 'connecting') return 'Conectando'
  if (connectionState === 'error') return 'Error de conexion'
  if (connectionState !== 'connected') return 'Desconectado'
  if (!sessionState?.active) return 'Sesion inactiva'
  return 'En vivo'
}

function getAdjacentLiveItem(setlist, sessionState, offset) {
  const items = setlist?.items ?? []
  const activeIndex = items.findIndex((item) => String(item.id) === String(sessionState?.activeItemId))
  return activeIndex < 0 ? null : items[activeIndex + offset] ?? null
}
