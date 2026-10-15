import { LEGAL_T, termsSections, type Locale } from '@/lib/legal-i18n'

/**
 * The terms of use, shared by /terms and /en/terms. Content lives in
 * lib/legal-i18n alongside the privacy policy and the rules for editing both.
 */
export default function TermsBody({ locale = 'th' }: { locale?: Locale }) {
  const t = LEGAL_T[locale]
  const SECTIONS = termsSections(locale)
  return (
    <div className="bg-white min-h-screen">
      <div style={{ background: '#02402e', padding: '52px 24px 60px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontSize: 12, color: '#d97f11', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>Legal</p>
          <h1 style={{ fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>{t.termsHeading}</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: 0 }}>{t.termsEffective}</p>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '52px 24px 80px' }}>
        <div style={{ padding: '24px', background: '#f7f9f8', borderRadius: 16, border: '1px solid #eef0ef', marginBottom: 40 }}>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.75, margin: 0, fontWeight: 300 }}>
            {t.termsIntroA}<strong>support@spacesmate.com</strong>
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {SECTIONS.map(s => (
            <div key={s.title}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 14px' }}>{s.title}</h2>
              <div style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.8, whiteSpace: 'pre-line', fontWeight: 300 }}>{s.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
