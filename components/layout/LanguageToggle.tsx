'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AREA_KEYWORDS } from '@/lib/constants'

/**
 * One-click language switch, in the navbar.
 *
 * It renders only when the current page actually has a counterpart in the other
 * language. That restraint is the whole point: today the only English pages are
 * the 16 hand-written area pages, and `/en`, `/en/search` and `/en/faq` all
 * return 404. A toggle that is always visible would send most visitors to a
 * dead page, which is worse than no toggle.
 *
 * As English versions of other routes are added, add a rule to COUNTERPARTS and
 * the toggle starts appearing there — no change needed here or in the navbar.
 */

/** Area slugs that have a hand-written English page. The data-driven Thai area pages do not. */
const EN_AREA_SLUGS = new Set(AREA_KEYWORDS.map(a => a.slug))

export type Counterpart = { href: string; label: string; hrefLang: 'th' | 'en'; title: string }

/**
 * Exported for testing and so the rules live in one readable place.
 * Returns null when this page has no counterpart.
 */
export function counterpartFor(pathname: string): Counterpart | null {
  if (!pathname) return null

  // English area page → Thai. Every /en/area page has a Thai original.
  const en = pathname.match(/^\/en\/area\/(.+?)\/?$/)
  if (en) {
    return { href: `/area/${en[1]}`, label: 'ไทย', hrefLang: 'th', title: 'ดูหน้านี้เป็นภาษาไทย' }
  }

  // Thai area page → English, but only for the slugs that have one.
  const th = pathname.match(/^\/area\/(.+?)\/?$/)
  if (th) {
    const raw = th[1]
    let decoded = raw
    try { decoded = decodeURIComponent(raw) } catch { /* malformed escape — compare raw */ }
    if (EN_AREA_SLUGS.has(decoded) || EN_AREA_SLUGS.has(raw)) {
      return { href: `/en/area/${raw}`, label: 'EN', hrefLang: 'en', title: 'View this page in English' }
    }
  }

  return null
}

export default function LanguageToggle({ className = '' }: { className?: string }) {
  const pathname = usePathname()
  const target = counterpartFor(pathname || '')
  if (!target) return null

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
  if (!target) return null

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
