export function Icon({ type }) {
  const icons = {
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1.5" />
        <rect x="14" y="4" width="6" height="6" rx="1.5" />
        <rect x="4" y="14" width="6" height="6" rx="1.5" />
        <rect x="14" y="14" width="6" height="6" rx="1.5" />
      </>
    ),
    note: <path d="M14 5v9.5a2.5 2.5 0 1 1-2-2.45V7.3l7-1.75V13.5a2.5 2.5 0 1 1-2-2.45V8.1L14 8.85" />,
    user: (
      <>
        <circle cx="12" cy="8" r="3.25" />
        <path d="M6.5 19a5.5 5.5 0 0 1 11 0" />
      </>
    ),
    userCircle: (
      <>
        <circle cx="12" cy="9" r="3" />
        <path d="M6.5 18.5a5.5 5.5 0 0 1 11 0" />
      </>
    ),
    list: (
      <>
        <path d="M9 7h10" />
        <path d="M9 12h10" />
        <path d="M9 17h10" />
        <circle cx="5" cy="7" r="1" fill="currentColor" stroke="none" />
        <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="5" cy="17" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    gear: (
      <>
        <circle cx="12" cy="12" r="2.75" />
        <path d="M19 12a7 7 0 0 0-.07-.96l2.02-1.58-2-3.46-2.45.77a7.3 7.3 0 0 0-1.66-.96L14.5 3h-5l-.34 2.81c-.58.22-1.13.54-1.65.95l-2.46-.76-2 3.46 2.03 1.58A7.86 7.86 0 0 0 5 12c0 .33.03.65.08.96l-2.03 1.58 2 3.46 2.46-.76c.51.41 1.06.72 1.64.94L9.5 21h5l.34-2.82c.58-.22 1.14-.54 1.66-.95l2.45.77 2-3.46-2.02-1.58c.04-.31.07-.63.07-.96Z" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3.5 19 6v5.5c0 4.14-2.72 7.98-7 9.5-4.28-1.52-7-5.36-7-9.5V6l7-2.5Z" />
      </>
    ),
    search: <path d="m20 20-4.2-4.2M10.8 17a6.2 6.2 0 1 1 0-12.4 6.2 6.2 0 0 1 0 12.4Z" />,
    menu: (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </>
    ),
    chevronLeft: <path d="m15 18-6-6 6-6" />,
    chevronRight: <path d="m9 18 6-6-6-6" />,
    chevronDown: <path d="m6 9 6 6 6-6" />,
    mail: (
      <>
        <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v9A1.5 1.5 0 0 1 18.5 18h-13A1.5 1.5 0 0 1 4 16.5Z" />
        <path d="m5 8 7 5 7-5" />
      </>
    ),
    phone: (
      <>
        <path d="M8 4.5h8" />
        <path d="M9 3.5h6A1.5 1.5 0 0 1 16.5 5v14A1.5 1.5 0 0 1 15 20.5H9A1.5 1.5 0 0 1 7.5 19V5A1.5 1.5 0 0 1 9 3.5Z" />
        <path d="M11 17.5h2" />
      </>
    ),
    pin: (
      <>
        <path d="M12 20s6-5.44 6-10a6 6 0 1 0-12 0c0 4.56 6 10 6 10Z" />
        <circle cx="12" cy="10" r="2" />
      </>
    ),
    lock: (
      <>
        <rect x="5.5" y="10" width="13" height="9.5" rx="2" />
        <path d="M8.5 10V8a3.5 3.5 0 1 1 7 0v2" />
      </>
    ),
    eye: (
      <>
        <path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    minus: <path d="M5 12h14" />,
    logout: (
      <>
        <path d="M9 20H6.5A1.5 1.5 0 0 1 5 18.5v-13A1.5 1.5 0 0 1 6.5 4H9" />
        <path d="M13 16l4-4-4-4" />
        <path d="M17 12H9" />
      </>
    ),
    pause: (
      <>
        <path d="M9 7v10" />
        <path d="M15 7v10" />
      </>
    ),
    play: <path d="M9 7.5v9l7-4.5-7-4.5Z" fill="currentColor" stroke="none" />,
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    reorder: (
      <>
        <path d="M6 8h12" />
        <path d="M6 12h12" />
        <path d="M6 16h12" />
      </>
    ),
    share: (
      <>
        <circle cx="18" cy="6" r="2" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="18" cy="18" r="2" />
        <path d="M8 11 16 7" />
        <path d="m8 13 8 4" />
      </>
    ),
    bookmark: <path d="M7 20V5.5A1.5 1.5 0 0 1 8.5 4h7A1.5 1.5 0 0 1 17 5.5V20l-5-3-5 3Z" />,
    star: <path d="m12 4.75 1.9 3.85 4.25.62-3.08 3 .73 4.23L12 14.45l-3.8 2 .73-4.23-3.08-3 4.25-.62L12 4.75Z" />,
  }

  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[type]}
    </svg>
  )
}
