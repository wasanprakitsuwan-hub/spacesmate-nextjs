import LegalLayout from '@/components/marketing/LegalLayout'
import Icon from '@/components/ui/Icon'
import { LEGAL_T, termsSections, type Locale } from '@/lib/legal-i18n'
import { C } from '@/lib/ui'

/**
 * The terms of use, shared by /terms and /en/terms. Content lives in
 * lib/legal-i18n alongside the privacy policy and the rules for editing both.
 */
export default function TermsBody({ locale = 'th' }: { locale?: Locale }) {
  const t = LEGAL_T[locale]
  return (
    <LegalLayout
      doc="terms"
      docsNav={t.docsNav}
      privacyLabel={t.privacyHeading}
      termsLabel={t.termsHeading}
      heading={t.termsHeading}
      effective={t.termsEffective}
      tocLabel={t.toc}
      intro={<p style={{ margin: 0 }}>{t.termsIntroA}<strong>support@spacesmate.com</strong></p>}
      sections={termsSections(locale)}
      after={
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', borderTop: `1px solid ${C.line2}`, paddingTop: 20 }}>
          <Icon name="mail" size={24} color={C.teal} />
          <span style={{ fontSize: 14.5 }}>{t.termsQuestions}<a href="mailto:support@spacesmate.com" style={{ color: C.teal }}>support@spacesmate.com</a></span>
        </div>
      }
    />
  )
}
