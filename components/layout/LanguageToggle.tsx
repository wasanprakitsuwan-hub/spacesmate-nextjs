'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { enPath, isEnglishPath, thPath } from '@/lib/routes-i18n'

/**
 * One-click language switch, in the navbar. Always visible.
 *
 * Where a counterpart exists it goes straight there and keeps the visitor's
 * place. Where it does not, it falls back to the English front door at `/en`,
 * and from the English side back to `/`.
 *
 * The fallback is what makes "always visible" safe. `/en` used to 404, so an
 * unconditional toggle would have sent most visitors to a dead page; the
 * landing page at app/en/page.tsx exists to give it a real destination.
 *
 * WHICH PAGES HAVE A COUNTERPART
 *   lib/routes-i18n decides, and it is the only place that does. This component
 *   used to carry its own regexes listing the English routes, a second copy of
 *   what lib/site-i18n held as EN_ROUTES — so adding an English page meant
 *   updating two lists, and nothing broke if you updated one. The toggle would
 *   keep place on a page whose links all dropped to Thai, or the reverse.
 */

export type Counterpart = { href: string; label: string; hrefLang: 'th' | 'en'; title: string }

const TO_THAI = (href: string): Counterpart =>
  ({ href, label: 'ไทย', hrefLang: 'th', title: 'ดูเว็บไซต์เป็นภาษาไทย' })
const TO_ENGLISH = (href: string): Counterpart =>
  ({ href, label: 'EN', hrefLang: 'en', title: 'View in English' })

/** Exported so the rule can be read, and tested, without rendering anything. */
export function counterpartFor(pathname: string): Counterpart {
  const path = pathname || '/'

  // Every English page has a Thai original, so this direction always keeps place.
  if (isEnglishPath(path)) return TO_THAI(thPath(path))

  // The other way round can fail: /building, individual blog articles and the
  // admin surfaces have no English version. Those land on the English home
  // page instead. (/manage, /blog and the data-driven area pages were on this
  // list and are not any more — lib/routes-i18n is the live answer, this
  // comment is only an illustration of the failure mode.)
  return TO_ENGLISH(enPath(path) ?? '/en')
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
