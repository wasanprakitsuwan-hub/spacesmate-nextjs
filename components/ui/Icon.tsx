/**
 * Line icons for the marketing pages (round 6 redesign, approved 26 Oct 2026).
 *
 * One stroke style everywhere: 24 viewBox, 1.7 stroke, round caps. Paths are
 * hand-drawn so no icon font or library loads on these pages. Icons are always
 * decorative here (the label beside them carries the meaning), so aria-hidden.
 */
const PATHS = {
  building: 'M4 21V5l8-3 8 3v16M9 21v-4h6v4M8 8h1M8 12h1M15 8h1M15 12h1',
  buildingPlain: 'M4 21V5l8-3 8 3v16M9 21v-4h6v4',
  home: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-5h4v5',
  arrowDown: 'M12 5v14M6 13l6 6 6-6',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  chat: 'M21 11.5c0 4.1-4 7.5-9 7.5-1 0-2-.1-2.9-.4L5 20l1-3.3C4.2 15.3 3 13.5 3 11.5 3 7.4 7 4 12 4s9 3.4 9 7.5z',
  pin: 'M12 21s7-6.3 7-12a7 7 0 10-14 0c0 5.7 7 12 7 12zM12 11a2 2 0 100-4 2 2 0 000 4z',
  percent: 'M12 3a9 9 0 100 18 9 9 0 000-18zM9 15l6-6M9.5 9.5h.01M14.5 14.5h.01',
  trend: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  coin: 'M12 2v20M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  wrench: 'M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z',
  megaphone: 'M3 10v4h4l6 4V6L7 10zM17 9a4 4 0 010 6',
  userCheck: 'M10 11a4 4 0 100-8 4 4 0 000 8zM2 21c0-4 3.6-6 8-6M16 16l2 2 4-4',
  contract: 'M6 3h9l5 5v13H6zM14 3v6h6M9 13h8M9 17h6',
  card: 'M3 6h18v12H3zM3 10h18M7 15h3',
  team: 'M9 11a3 3 0 100-6 3 3 0 000 6zM17 11a3 3 0 100-6M3 20c0-3 3-5 6-5s6 2 6 5M15 15c3 0 6 2 6 5',
  form: 'M5 3h10l4 4v14H5zM9 12h6M9 16h4M9 8h3',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5',
  sign: 'M16 3l5 5L9 20H4v-5zM13 6l5 5M3 21h18',
  clock: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2',
  lock: 'M6 11V8a6 6 0 0112 0v3M5 11h14v10H5zM12 15v2',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4z',
  check: 'M5 12l5 5 9-10',
  plus: 'M12 5v14M5 12h14',
  image: 'M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6',
  video: 'M3 6h13v12H3zM16 10l5-3v10l-5-3',
  videoOff: 'M3 6h13v12H3zM16 10l5-3v10l-5-3M3 3l18 18',
  shuffle: 'M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5',
  train: 'M7 15h10M9 19h6M6 3h12l1 12H5zM9 3v4M15 3v4',
  renters: 'M9 11a4 4 0 100-8 4 4 0 000 8zM2 21c0-4 3-6 7-6M17 18a3 3 0 100-6 3 3 0 000 6zM21 22l-2-2',
  noFee: 'M12 3a9 9 0 100 18 9 9 0 000-18zM9 15l6-6',
  tag: 'M20 12l-8 8-9-9V3h8zM7.5 7.5h.01',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  gift: 'M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 110-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 100-5C13 2 12 7 12 7z',
  bolt: 'M13 2L5 13h6l-1 9 8-11h-6z',
  badge: 'M12 3l2.4 1.8 3-.2 1 2.8 2.5 1.7-.9 2.9.9 2.9-2.5 1.7-1 2.8-3-.2L12 21l-2.4-1.8-3 .2-1-2.8-2.5-1.7.9-2.9-.9-2.9 2.5-1.7 1-2.8 3 .2zM9 12l2 2 4-4',
  help: 'M12 3a9 9 0 100 18 9 9 0 000-18zM9.5 9a2.5 2.5 0 015 .5c0 1.5-2.5 2-2.5 3.5M12 17h.01',
  globe: 'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z',
  bed: 'M3 18v-6a3 3 0 013-3h12a3 3 0 013 3v6M3 18h18M5 9V6h14v3',
  grid: 'M4 4h16v16H4zM4 10h16M10 4v16',
  cash: 'M3 6h18v12H3zM12 15a3 3 0 100-6 3 3 0 000 6zM6 9v.01M18 15v.01',
  family: 'M8 8a3 3 0 100-6 3 3 0 000 6zM17 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM2 21v-2a5 5 0 0110 0v2M13 21v-1.5a4 4 0 018 0V21',
  doc: 'M3 5h18v14H3zM7 9h6M7 13h10M7 17h4',
  info: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 11v6M12 7.5h.01',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  database: 'M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7',
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  calendar: 'M4 5h16v16H4zM4 9h16M8 3v4M16 3v4',
  refresh: 'M21 12a9 9 0 11-3-6.7M21 4v5h-5',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM12 11v4M12 8h.01',
  cookie: 'M12 3a9 9 0 109 9 4 4 0 01-4-4 4 4 0 01-5-5zM8 13h.01M11 17h.01M15 14h.01',
  rights: 'M9 11a4 4 0 100-8 4 4 0 000 8zM2 21c0-4 3-6 7-6M16 13l2 2 4-4',
} as const

export type IconName = keyof typeof PATHS

export default function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 1.7 }: {
  name: IconName
  size?: number
  color?: string
  strokeWidth?: number
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={{ flexShrink: 0, display: 'block' }}>
      <path d={PATHS[name]} />
    </svg>
  )
}
