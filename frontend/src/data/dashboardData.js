export const navigationItems = [
  { label: 'Pagina principal', icon: 'grid', path: '/dashboard' },
  { label: 'Panel admin', icon: 'shield', path: '/admin', roles: ['ADMIN'] },
  { label: 'Canciones', icon: 'note', path: '/songs' },
  { label: 'Artistas', icon: 'user', path: '/artists' },
  { label: 'SetLists', icon: 'list' },
  { label: 'Configuracion', icon: 'gear' },
]

export const songs = [
  { number: '01', title: 'Kumbala', key: 'Cm', bpm: '107', duration: '4:27' },
  { number: '02', title: 'Amargo Adios', key: 'C', bpm: '134', duration: '3:34', active: true },
  { number: '03', title: 'La Celula Que Explota', key: 'G', bpm: '126', duration: '3:33' },
  { number: '04', title: 'Siguiendo la Luna', key: 'Dm', bpm: '85', duration: '4:51' },
]

export const members = [
  { initials: 'EN', name: 'Edwin Noe', role: 'Bajo', status: 'Conectado', online: true, highlight: true },
  { initials: 'SD', name: 'Farrera', role: 'Bateria', status: 'Conectado', online: true },
  { initials: 'EL', name: 'Luis', role: 'Voz', status: 'Desconectado', online: false },
]

export const favorites = [
  { title: 'Kumbala', key: 'Cm' },
  { title: 'Clavado en un Bar', key: 'G' },
  { title: 'No dejes que', key: 'Bm' },
]
