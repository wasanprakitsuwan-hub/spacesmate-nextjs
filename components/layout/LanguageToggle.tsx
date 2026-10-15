'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AREA_KEYWORDS } from '@/lib/constants'

/**
 * One-click language switch, in the navbar. Always visible.
 *
 * Where an exact counterpart exists — the 16 hand-written area pages — it goes
 * straight there and keeps your place. Everywhere else it falls back to the
 * English front door at `/en`, and from the English side back to `/`.
 *
 * The fallback is what makes "always visible" safe. `/en` used to 404, so an
 * unconditional toggle would have sent most visitors to a dead page; the
 * landing page at app/en/page.tsx exists to give it a real destination.
 *
 * As English versions of other routes are added, add a rule to counterpartFor()
 * and the toggle starts keeping place on those pages too.
 */

/** Area slugs that have a hand-written English page. The data-driven Thai area pages do not. */
const EN_AREA_SLUGS = new Set(AREA_KEYWORDS.map(a => a.slug))

export type Counterpart = { href: string; label: string; hrefLang: 'th' | 'en'; title: string }

/**
 * Exported for testing and so the rules live in one readable place.
 * Returns null when this page has no counterpart.
 */
const TO_THAI = (href: string): Counterpart =>
  ({ href, label: 'ไทย', hrefLang: 'th', title: 'ดูเว็บไซต์เป็นภาษาไทย' })
const TO_ENGLISH = (href: string): Counterpart =>
  ({ href, label: 'EN', hrefLang: 'en', title: 'View in English' })

export function counterpartFor(pathname: string): Counterpart {
  const path = pathname || '/'

  // ── Already on the English side ──
  if (path === '/en' || path.startsWith('/en/')) {
    // An English area page has an exact Thai original — keep the visitor's place.
    const enArea = path.match(/^\/en\/area\/(.+?)\/?$/)
    if (enArea) return TO_THAI(`/area/${enArea[1]}`)
    const enProp = path.match(/^\/en\/property\/(.+?)\/?$/)
    if (enProp) return TO_THAI(`/property/${enProp[1]}`)
    const enStatic = path.match(/^\/en\/(about|services|pricing|faq|contact|search)\/?$/)
    if (enStatic) return TO_THAI(`/${enStatic[1]}`)
    return TO_THAI('/')
  }

  // ── Thai side → English ──
  const th = path.match(/^\/area\/(.+?)\/?$/)
  if (th) {
    const raw = th[1]
    let decoded = raw
    try { decoded = decodeURIComponent(raw) } catch { /* malformed escape — compare raw */ }
    // The data-driven area pages are Thai-only, so they fall through to /en.
    if (EN_AREA_SLUGS.has(decoded) || EN_AREA_SLUGS.has(raw)) {
      return TO_ENGLISH(`/en/area/${raw}`)
    }
  }

  // Every listing has an English page — it falls back to the owner's Thai text
  // where no English was written, rather than not existing.
  const prop = path.match(/^\/property\/(.+?)\/?$/)
  if (prop) return TO_ENGLISH(`/en/property/${prop[1]}`)

  const stat = path.match(/^\/(about|services|pricing|faq|contact|search)\/?$/)
  if (stat) return TO_ENGLISH(`/en/${stat[1]}`)

  return TO_ENGLISH('/en')
}

export default function LanguageToggle({ className = '' }: { className?: string }) {
  const pathname = usePathname()
  const target = counterpartFor(pathname || '')
  const flag = target.hrefLang === 'en' ? '🇬🇧' : '🇹🇭'

  return (
    <Link
      href={target.href}
      hrefLang={target.hrefLang}
      title={target.title}
      aria-label={target.title}
      className={className}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 14, fontWeight: 600, color: '#334155',
        padding: '9px 14px', borderRadius: 20,
        border: '1.5px solid #e2e8f0', background: '#fff',
        textDecoration: 'none', cursor: 'pointer', transition: 'all .18s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#02402e'
        ;(e.currentTarget as HTMLElement).style.color = '#02402e'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'
        ;(e.currentTarget as HTMLElement).style.color = '#334155'
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 15, lineHeight: 1 }}>{flag}</span>
      {target.label}
    </Link>
  )
}

/** Same rule, styled as a row in the mobile drawer rather than a pill. */
export function MobileLanguageToggle({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const target = counterpartFor(pathname || '')
  const flag = target.hrefLang === 'en' ? '🇬🇧' : '🇹🇭'
  const text = target.hrefLang === 'en' ? 'View in English' : 'ดูเป็นภาษาไทย'

  return (
    <Link
      href={target.href}
      hrefLang={target.hrefLang}
      onClick={onNavigate}
      aria-label={target.title}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 12px', borderRadius: 12, fontSize: 15.5, fontWeight: 500, cursor: 'pointer', color: '#334155', textDecoration: 'none', transition: 'all .2s' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f4f8f6'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
    >
      <span aria-hidden="true" style={{ fontSize: 19, lineHeight: 1, width: 21, textAlign: 'center' }}>{flag}</span>
      {text}
    </Link>
  )
}
