import CookieSettingsLink from '@/components/consent/CookieSettingsLink'
import LegalLayout from '@/components/marketing/LegalLayout'
import Icon, { type IconName } from '@/components/ui/Icon'
import { LEGAL_T, privacySections, type Locale } from '@/lib/legal-i18n'
import { C, RADIUS } from '@/lib/ui'

/**
 * The privacy policy, shared by /privacy and /en/privacy.
 *
 * The content is in lib/legal-i18n, which carries both languages side by side
 * and the rules for editing them. The English is a translation; the Thai is the
 * operative text, and the final section of each document says so.
 */
const SUMMARY_ICONS: IconName[] = ['database', 'lock', 'rights']

export default function PrivacyBody({ locale = 'th' }: { locale?: Locale }) {
  const t = LEGAL_T[locale]
  return (
    <LegalLayout
      doc="privacy"
      docsNav={t.docsNav}
      privacyLabel={t.privacyHeading}
      termsLabel={t.termsHeading}
      heading={t.privacyHeading}
      effective={t.privacyEffective}
      summary={t.privacySummary.map((c, i) => ({ ...c, icon: SUMMARY_ICONS[i] }))}
      tocLabel={t.toc}
      intro={<>
        <p style={{ margin: 0 }}>{t.privacyIntro1a}<strong>Space Works Co., Ltd.</strong>{t.privacyIntro1b}<strong>SpacesMate</strong>{t.privacyIntro1c}</p>
        <p style={{ margin: '12px 0 0' }}>{t.privacyIntro2}</p>
      </>}
      sections={privacySections(locale)}
      after={<>
        {/* Cookie settings — the withdrawal route promised in sections 2 and 7.
            Here as well as in the footer, because someone reading about their
            right to withdraw should be able to act on it without hunting. */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', background: C.paper, border: `1px solid ${C.line}`, borderRadius: 8, padding: '16px 18px' }}>
          <Icon name="cookie" size={24} color={C.teal} />
          <span style={{ flex: '1 1 260px', fontSize: 14.5 }}>{t.cookieBox}</span>
          <CookieSettingsLink style={{ background: C.white, color: C.green, border: `1px solid ${C.border}`, borderRadius: RADIUS, padding: '9px 14px', minHeight: 44, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', borderTop: `1px solid ${C.line2}`, paddingTop: 20 }}>
          <Icon name="mail" size={24} color={C.teal} />
          <span style={{ fontSize: 14.5 }}>{t.privacyQuestions}<a href="mailto:support@spacesmate.com" style={{ color: C.teal }}>support@spacesmate.com</a></span>
        </div>
      </>}
    />
  )
}
