'use client'

import { AUTH_T, type Locale } from '@/lib/auth-i18n'
import { localeHref } from '@/lib/routes-i18n'

/**
 * The two sign-up ticks: terms + privacy (required) and marketing (optional,
 * separate — PDPA does not let it ride on the terms). See lib/terms-consent.
 */
export default function TermsTick({
  locale = 'th', accepted, onAccepted, marketing, onMarketing,
}: {
  locale?: Locale
  accepted: boolean
  onAccepted: (v: boolean) => void
  marketing: boolean
  onMarketing: (v: boolean) => void
}) {
  const t = AUTH_T[locale]
  const row = { display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer', fontSize: 13, color: '#475569', lineHeight: 1.5, textAlign: 'left' } as const
  const box = { width: 17, height: 17, accentColor: '#048c73', marginTop: 2, flexShrink: 0 } as const
  const link = { color: '#048c73', fontWeight: 600 } as const
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={row}>
        <input type="checkbox" checked={accepted} onChange={e => onAccepted(e.target.checked)} style={box} />
        <span>
          {t.acceptTerms}{' '}
          <a href={localeHref('/terms', locale)} target="_blank" rel="noopener" style={link}>{t.terms}</a>
          {' '}{t.and}{' '}
          <a href={localeHref('/privacy', locale)} target="_blank" rel="noopener" style={link}>{t.privacy}</a>
        </span>
      </label>
      <label style={row}>
        <input type="checkbox" checked={marketing} onChange={e => onMarketing(e.target.checked)} style={box} />
        <span>{t.marketingOptIn}</span>
      </label>
    </div>
  )
}
