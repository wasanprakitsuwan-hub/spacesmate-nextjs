import CookieSettingsLink from '@/components/consent/CookieSettingsLink'
import { LEGAL_T, privacySections, type Locale } from '@/lib/legal-i18n'

/**
 * The privacy policy, shared by /privacy and /en/privacy.
 *
 * The content is in lib/legal-i18n, which carries both languages side by side
 * and the rules for editing them. The English is a translation; the Thai is the
 * operative text, and the final section of each document says so.
 */
export default function PrivacyBody({ locale = 'th' }: { locale?: Locale }) {
  const t = LEGAL_T[locale]
  const SECTIONS = privacySections(locale)
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div style={{ background: '#02402e', padding: '52px 24px 60px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontSize: 12, color: '#d97f11', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>Legal</p>
          <h1 style={{ fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>{t.privacyHeading}</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: 0 }}>{t.privacyEffective}</p>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '52px 24px 80px' }}>
        {/* Intro */}
        <div style={{ padding: '24px', background: '#f7f9f8', borderRadius: 16, border: '1px solid #eef0ef', marginBottom: 40 }}>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.75, margin: 0, fontWeight: 300 }}>
            {t.privacyIntro1a}<strong>Space Works Co., Ltd.</strong>{t.privacyIntro1b}<strong>SpacesMate</strong>{t.privacyIntro1c}
          </p>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.75, margin: '12px 0 0', fontWeight: 300 }}>
            {t.privacyIntro2}
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {SECTIONS.map(s => (
            <div key={s.title}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 14px' }}>{s.title}</h2>
              <div style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.8, whiteSpace: 'pre-line', fontWeight: 300 }}>{s.content}</div>
            </div>
          ))}
        </div>

        {/* Cookie settings — the withdrawal route promised in section 2 and 7.
            Repeated here as well as in the footer, because someone reading about
            their right to withdraw should be able to act on it without hunting. */}
        <div style={{ marginTop: 44, padding: '20px 24px', background: '#f7f9f8', borderRadius: 16, border: '1px solid #eef0ef' }}>
          <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.7, margin: '0 0 10px', fontWeight: 300 }}>
            {t.cookiePrompt}
          </p>
          <CookieSettingsLink className="text-sm font-semibold underline" />
        </div>
      </div>
    </div>
  )
}
