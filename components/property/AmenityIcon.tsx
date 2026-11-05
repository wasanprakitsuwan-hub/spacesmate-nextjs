/**
 * Line icons for the property page: one per amenity, plus the spec row
 * (bedrooms, bathrooms, size, floor).
 *
 * Inline SVG, not the Material Symbols font. That font loads after hydration,
 * so its ligature names ("ac_unit") would flash as text and be read by search
 * engines as page copy. Paths follow the Lucide set (ISC licence), 24px grid,
 * stroke only, so they take the text colour.
 *
 * Amenities are matched on name_en, not name_th, so this file holds no Thai
 * (the EN coverage check) and an amenity added later in Settings still finds an
 * icon if its English name says what it is. No match falls back to a dot.
 */
import type { ReactNode } from 'react'

const I: Record<string, ReactNode> = {
  snow: <><path d="M2 12h20M12 2v20" /><path d="m20 16-4-4 4-4M4 8l4 4-4 4M16 4l-4 4-4-4M8 20l4-4 4 4" /></>,
  sofa: <><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" /><path d="M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" /><path d="M4 18v2M20 18v2" /></>,
  armchair: <><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" /><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" /><path d="M5 18v2M19 18v2" /></>,
  wifi: <><path d="M12 20h.01" /><path d="M2 8.82a15 15 0 0 1 20 0M5 12.86a10 10 0 0 1 14 0M8.5 16.43a5 5 0 0 1 7 0" /></>,
  washer: <><rect x="3" y="2" width="18" height="20" rx="2" /><path d="M3 6h18M7 4h.01" /><circle cx="12" cy="14" r="4" /></>,
  drop: <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />,
  hob: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="2" /><circle cx="15.5" cy="15.5" r="2" /><circle cx="15.5" cy="8.5" r="1" /><circle cx="8.5" cy="15.5" r="1" /></>,
  microwave: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M6 9h8v6H6zM18 9v.01M18 12v.01M18 15v.01" /></>,
  fridge: <><path d="M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z" /><path d="M5 10h14M15 7v6" /></>,
  tv: <><rect x="2" y="7" width="20" height="15" rx="2" /><path d="m17 2-5 5-5-5" /></>,
  table: <><path d="M3 8h18M5 8v12M19 8v12M5 13h14" /></>,
  pot: <><path d="M2 12h20M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8M4 8l16-4" /><path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8" /></>,
  balcony: <><path d="M3 21h18M3 12h18M6 12v9M10 12v9M14 12v9M18 12v9M7 12V4h10v8" /></>,
  paw: <><circle cx="11" cy="4" r="2" /><circle cx="18" cy="8" r="2" /><circle cx="20" cy="16" r="2" /><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.05Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" /></>,
  parking: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 17V7h4a3 3 0 0 1 0 6H9" /></>,
  waves: <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />,
  dumbbell: <path d="M6 5v14M18 5v14M3 8v8M21 8v8M6 12h12" />,
  shield: <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />,
  video: <><path d="m16 13 5.22 3.48a.5.5 0 0 0 .78-.42V7.87a.5.5 0 0 0-.75-.43L16 10.5" /><rect x="2" y="6" width="14" height="12" rx="2" /></>,
  lift: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="m9 10 3-3 3 3M9 14l3 3 3-3" /></>,
  card: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></>,
  shirt: <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />,
  bag: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18M16 10a4 4 0 0 1-8 0" /></>,
  store: <><path d="M3 9l1.5-5h15L21 9M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0zM5 13v8h14v-8M10 21v-5h4v5" /></>,
  utensils: <><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></>,
  tree: <><circle cx="12" cy="9" r="6" /><path d="M12 15v7M9 22h6" /></>,
  gamepad: <><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 12h4M8 10v4M15 13h.01M18 11h.01" /></>,
  ball: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2v20M4.9 4.9c4 4 4 10.2 0 14.2M19.1 4.9c-4 4-4 10.2 0 14.2" /></>,
  vending: <><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M9 6h6M9 10h6M5 15h14M9 18.5h6" /></>,
  dot: <circle cx="12" cy="12" r="2.5" />,
  cross: <path d="M18 6 6 18M6 6l12 12" />,
  // spec row
  bed: <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />,
  bath: <><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.68 3 4 3.68 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" /><path d="M10 5 8 7M2 12h20M7 19v2M17 19v2" /></>,
  area: <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />,
  layers: <><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" /><path d="m2 12 8.58 3.91a2 2 0 0 0 1.66 0L21 12M2 17l8.58 3.91a2 2 0 0 0 1.66 0L21 17" /></>,
}

/** English-name keywords → icon. First match wins, so specific before general. */
const RULES: [RegExp, string][] = [
  [/air ?con|\bac\b|aircon/, 'snow'],
  [/sofa/, 'sofa'],
  [/furnish/, 'armchair'],
  [/wi-?fi|internet/, 'wifi'],
  [/washing|washer/, 'washer'],
  [/water heater|heater|shower/, 'drop'],
  [/hob|stove|induction/, 'hob'],
  [/microwave/, 'microwave'],
  [/fridge|refrigerator/, 'fridge'],
  [/cctv|camera/, 'video'],
  [/\btv\b|television/, 'tv'],
  [/dining|table/, 'table'],
  [/kitchen/, 'pot'],
  [/balcony/, 'balcony'],
  [/pet/, 'paw'],
  [/parking|car park/, 'parking'],
  [/pool|swim/, 'waves'],
  [/fitness|gym/, 'dumbbell'],
  [/security|guard/, 'shield'],
  [/elevator|lift/, 'lift'],
  [/key ?card|access/, 'card'],
  [/laundry/, 'shirt'],
  [/shopping|mall/, 'bag'],
  [/convenience|store|shop/, 'store'],
  [/restaurant|food|cafe/, 'utensils'],
  [/garden|park/, 'tree'],
  [/game/, 'gamepad'],
  [/basketball|court|sport/, 'ball'],
  [/vending|coin/, 'vending'],
]

export function amenityIconKey(nameEn: string): string {
  const n = (nameEn || '').toLowerCase()
  for (const [re, key] of RULES) if (re.test(n)) return key
  return 'dot'
}

export default function AmenityIcon({ name, size = 20, color = 'currentColor' }: { name: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      {I[name] ?? I.dot}
    </svg>
  )
}
