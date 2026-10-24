import { AUTH_T, type Locale } from '@/lib/auth-i18n'
import { localeHref } from '@/lib/routes-i18n'

/**
 * "Questions?" links on the owner's path: how listing works, terms, privacy.
 * New tab on purpose — these sit beside a half-filled form or a checkout, and
 * reading the terms should not cost the owner what they have typed.
 */
export default function OwnerHelpLinks({ locale = 'th' }: { locale?: Locale }) {
  const t = AUTH_T[locale]
  const link = { color: '#048c73', textDecoration: 'none', fontWeight: 600 } as const
  return (
    <p style={{ textAlign: 'center', fontSize: 12.5, color: '#64748b', margin: '18px 0 0', lineHeight: 1.8 }}>
      {t.helpLead}{' '}
      <a href={`${localeHref('/faq', locale)}#owners`} target="_blank" rel="noopener" style={link}>{t.howToList}</a>
      {' · '}
      <a href={localeHref('/terms', locale)} target="_blank" rel="noopener" style={link}>{t.terms}</a>
      {' · '}
      <a href={localeHref('/privacy', locale)} target="_blank" rel="noopener" style={link}>{t.privacy}</a>
    </p>
  )
}
