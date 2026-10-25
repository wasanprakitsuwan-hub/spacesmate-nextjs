// Link here is LocaleLink: it keeps the reader in the language they are already
// reading, so an href written as a Thai path resolves to its English
// counterpart on /en/* pages. See components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import { ABOUT_T, type Locale } from '@/lib/marketing-i18n'
import { C, RADIUS, WRAP, btnStyle, h2Style } from '@/lib/ui'

/**
 * The About page, shared by /about and /en/about.
 *
 * No registration number or founding date (Founder, 25 Oct 2026: too detailed
 * for this page); the legal details live in the terms and on documents.
 */
export default function AboutBody({ locale = 'th' }: { locale?: Locale }) {
  const t = ABOUT_T[locale]
  const wrap: React.CSSProperties = { maxWidth: WRAP, margin: '0 auto' }
  const section: React.CSSProperties = { padding: '52px 16px', borderTop: `1px solid ${C.line}` }
  return (
    <div style={{ background: C.paper }}>
      <section style={{ padding: '56px 16px 52px' }}>
        <div style={wrap}>
          <p style={{ fontSize: 14, fontWeight: 500, color: C.teal, margin: '0 0 12px' }}>{t.eyebrow}</p>
          <h1 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 600, color: C.green, margin: '0 0 16px', lineHeight: 1.25 }}>
            {t.heroTitleA}<br />{t.heroTitleB}
          </h1>
          <p style={{ fontSize: 17, color: C.ink, lineHeight: 1.75, margin: '0 0 26px', maxWidth: 720 }}>{t.heroSub}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/manage" className="sm-btn-primary" style={btnStyle('primary')}>{t.ctaManage}</Link>
            <Link href="/search" className="sm-btn-ghost" style={btnStyle('ghost')}>{t.ctaSearch}</Link>
          </div>
        </div>
      </section>

      <section style={{ ...section, background: C.white }}>
        <div className="sm-ab-2" style={{ ...wrap, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            { n: '01', title: t.stream1Title, desc: t.stream1Desc, cta: t.stream1Cta, href: '/list-your-property' },
            { n: '02', title: t.stream2Title, desc: t.stream2Desc, cta: t.stream2Cta, href: '/manage#enquiry' },
          ].map(x => (
            <div key={x.n} style={{ border: `1px solid ${C.line}`, borderRadius: RADIUS, padding: '24px 24px' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.teal }}>{x.n}</p>
              <h2 style={{ ...h2Style(21), margin: '4px 0 8px' }}>{x.title}</h2>
              <p style={{ fontSize: 15, color: C.ink, lineHeight: 1.7, margin: '0 0 14px' }}>{x.desc}</p>
              <Link href={x.href} style={{ color: C.teal, fontSize: 15, textDecoration: 'none' }}>{x.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      <section style={section}>
        <div style={wrap}>
          <h2 style={{ ...h2Style(26), margin: '0 0 24px' }}>{t.whyHeading}</h2>
          <div className="sm-ab-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 28 }}>
            {t.why.map((w, i) => (
              <div key={w.title} style={{ borderTop: `2px solid ${i === 0 ? C.green : C.line}`, paddingTop: 14 }}>
                <h3 style={{ fontSize: 16.5, fontWeight: 600, color: C.green, margin: '0 0 6px' }}>{w.title}</h3>
                <p style={{ fontSize: 14.5, color: C.ink, lineHeight: 1.7, margin: 0 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...section, background: C.white }}>
        <div style={wrap}>
          <h2 style={{ ...h2Style(22), margin: '0 0 14px' }}>{t.companyHeading}</h2>
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '10px 28px', fontSize: 15 }}>
            <dt style={{ color: C.muted }}>{t.operatedByLabel}</dt><dd style={{ margin: 0, color: C.ink }}>{t.operatedBy}</dd>
            <dt style={{ color: C.muted }}>{t.officeLabel}</dt><dd style={{ margin: 0, color: C.ink }}>{t.officeValue}</dd>
          </dl>
        </div>
      </section>

      <section style={{ background: C.green, padding: '48px 16px' }}>
        <div style={{ ...wrap, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 600, color: C.white, margin: '0 0 6px' }}>{t.closingHeading}</h2>
            <p style={{ color: 'rgba(255,255,255,.78)', fontSize: 15.5, margin: 0 }}>{t.closingSub}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/manage" style={btnStyle('light')}>{t.closingCta1}</Link>
            <Link href="/contact" style={{ ...btnStyle('ghost'), background: 'transparent', color: C.white, borderColor: 'rgba(255,255,255,.45)' }}>{t.closingCta2}</Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) { .sm-ab-4 { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px) { .sm-ab-2, .sm-ab-4 { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
