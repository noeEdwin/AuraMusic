const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

const NOTE_TO_INDEX = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
}

const SECTION_PATTERN = /^[A-ZÁÉÍÓÚÜ0-9\s]+$/

export function parseTeleprompterSections(lyrics, transposeSteps = 0) {
  if (!lyrics) {
    return []
  }

  const lines = lyrics.split('\n')
  const sections = []
  let currentSection = createSection('Letra')

  lines.forEach((line) => {
    if (!line.trim()) {
      currentSection.lines.push({ type: 'spacer' })
      return
    }

    const sectionMatch = line.match(/^\[(.+)\]$/)

    if (sectionMatch && SECTION_PATTERN.test(sectionMatch[1].trim())) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection)
      }

      currentSection = createSection(formatSectionLabel(sectionMatch[1]))
      return
    }

    currentSection.lines.push({
      type: 'lyric',
      segments: parseChordLine(line, transposeSteps),
    })
  })

  if (currentSection.lines.length > 0) {
    sections.push(currentSection)
  }

  return sections
}

function createSection(label) {
  return { label, lines: [] }
}

function formatSectionLabel(label) {
  return label.trim().replace(/\s+/g, ' ')
}

function parseChordLine(line, transposeSteps) {
  const segments = []
  const chordPattern = /\[([^\]]+)\]/g
  let lastIndex = 0
  let activeChord = null
  let lyricBuffer = ''
  let match = chordPattern.exec(line)

  while (match) {
    lyricBuffer += line.slice(lastIndex, match.index)
    const chordCandidate = match[1].trim()

    if (isChordToken(chordCandidate)) {
      if (lyricBuffer || activeChord) {
        segments.push({
          chord: activeChord ? transposeChord(activeChord, transposeSteps) : null,
          lyric: lyricBuffer.trim() ? lyricBuffer : '',
        })
      }

      activeChord = chordCandidate
      lyricBuffer = ''
    } else {
      lyricBuffer += match[0]
    }

    lastIndex = chordPattern.lastIndex
    match = chordPattern.exec(line)
  }

  lyricBuffer += line.slice(lastIndex)

  if (lyricBuffer || activeChord) {
    segments.push({
      chord: activeChord ? transposeChord(activeChord, transposeSteps) : null,
      lyric: lyricBuffer.trim() ? lyricBuffer : '',
    })
  }

  return segments.length > 0 ? segments : [{ chord: null, lyric: line }]
}

function isChordToken(value) {
  return /^[A-G](?:#|b)?[^/]*(?:\/[A-G](?:#|b)?)?$/.test(value)
}

export function transposeChord(chord, steps) {
  if (!steps || !chord) {
    return chord
  }

  const match = chord.match(/^([A-G](?:#|b)?)([^/]*)?(?:\/([A-G](?:#|b)?))?$/)

  if (!match) {
    return chord
  }

  const [, root, suffix = '', bass] = match
  const nextRoot = transposeNote(root, steps)
  const nextBass = bass ? transposeNote(bass, steps) : null

  return `${nextRoot}${suffix}${nextBass ? `/${nextBass}` : ''}`
}

function transposeNote(note, steps) {
  const noteIndex = NOTE_TO_INDEX[note]

  if (noteIndex === undefined) {
    return note
  }

  const normalizedIndex = (noteIndex + steps + 120) % 12
  const noteTable = note.includes('b') ? FLAT_NOTES : SHARP_NOTES

  return noteTable[normalizedIndex]
}
