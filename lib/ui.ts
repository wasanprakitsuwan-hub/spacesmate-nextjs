/**
 * Design tokens for the 2026 redesign (approved by the Founder on 25 Oct 2026).
 *
 * Calm and quiet: a warm paper ground, hairline borders, no shadows, brand green
 * for headings and the footer. The brand teal and amber are deepened here
 * because the brand values fail WCAG AA contrast as text and on buttons
 * (#048c73 on white is 3.9:1, #d97f11 is 2.9:1). The brand values stay in
 * tailwind.config for the logo and illustrations.
 *
 * Most of this codebase styles inline, so these are plain constants rather than
 * Tailwind classes; the Tailwind `sm-*` colours mirror them for class users.
 */
import type { CSSProperties } from 'react'

export const C = {
  paper:  '#f7f6f2',   // page ground
  white:  '#ffffff',   // cards, inputs
  line:   '#e5e2da',   // section and card borders
  line2:  '#ece9e2',   // row dividers inside a card
  border: '#dcd8ce',   // input and button borders
  ink:    '#231f20',   // body text
  muted:  '#6b6660',   // secondary text (5.4:1 on paper)
  faint:  '#a8a29a',   // placeholders, disabled
  green:  '#02402e',   // headings, footer, selected states
  teal:   '#037a64',   // links, primary buttons (5.3:1 with white)
  amber:  '#a65f08',   // prices only (5.0:1 on white)
  tint:   '#eaf4f0',   // selected chip, icon wells
  amberTint: '#fbf0e1',
  bts:    '#6CBE45',
  mrt:    '#1E4F9C',
} as const

export const RADIUS = 6
export const WRAP = 1240

/** Primary / ghost / light button styles, matching the mockup. */
export function btnStyle(kind: 'primary' | 'ghost' | 'light' = 'primary'): CSSProperties {
  const base: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '11px 18px', borderRadius: RADIUS, fontWeight: 500, fontSize: 15,
    textDecoration: 'none', cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1.4,
  }
  if (kind === 'ghost') return { ...base, background: C.white, color: C.ink, border: `1px solid ${C.border}` }
  if (kind === 'light') return { ...base, background: C.white, color: C.green, border: `1px solid ${C.white}` }
  return { ...base, background: C.teal, color: C.white, border: `1px solid ${C.teal}` }
}

export function h2Style(size = 24): CSSProperties {
  return { margin: 0, fontSize: size, fontWeight: 600, color: C.green, lineHeight: 1.35 }
}
