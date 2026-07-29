export const navigationItems = [
  { label: 'Pagina principal', icon: 'grid', path: '/dashboard' },
  { label: 'Panel admin', icon: 'shield', path: '/admin', roles: ['ADMIN'] },
  { label: 'Canciones', icon: 'note', path: '/songs' },
  { label: 'Artistas', icon: 'user', path: '/artists' },
  { label: 'SetLists', icon: 'list', path: '/setlists' },
  { label: 'Bandas', icon: 'user', path: '/bands' },
]

export const members = [
  { initials: 'EN', name: 'Edwin Noe', role: 'Bajo', status: 'Conectado', online: true, highlight: true },
  { initials: 'SD', name: 'Farrera', role: 'Bateria', status: 'Conectado', online: true },
  { initials: 'EL', name: 'Luis', role: 'Voz', status: 'Desconectado', online: false },
]
