// Link here is LocaleLink: it keeps the reader in the language they are already
// reading, so an href written as a Thai path resolves to its English
// counterpart on /en/* pages. An href with no English page passes through
// unchanged. The list of which is in lib/routes-i18n, deliberately not
// repeated here — it was copied into 16 files and went stale in all of them
// the moment /manage and /blog got English pages. See
// components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import { localeHref } from '@/lib/routes-i18n'
import { ABOUT_T, type Locale } from '@/lib/marketing-i18n'

/**
 * The About page, shared by the Thai route at /about and the English one at
 * /en/about. One component, one locale prop — the same approach as the area and
 * property pages, so the two language versions cannot drift apart.
 */
export default function AboutBody({ locale = 'th' }: { locale?: Locale }) {
  const t = ABOUT_T[locale]
  // The four DNA titles are English in both locales — they are the brand's own
  // vocabulary, used verbatim in the Thai copy too.
  const TEAM = [
    { icon: 'construction',        title: 'Asset-Light',         desc: t.dna1Desc },
    { icon: 'bar_chart',           title: 'Performance-Aligned', desc: t.dna2Desc },
    { icon: 'smart_toy',           title: 'AI-Powered Ops',      desc: t.dna3Desc },
    { icon: 'language',            title: 'Bangkok-Local',       desc: t.dna4Desc },
  ]
  return (
    <div className="bg-white min-h-screen">

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#02402e 0%,#036b56 100%)', padding: '64px 24px 72px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#d97f11', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>{t.eyebrow}</p>
          <h1 style={{ fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 700, color: '#fff', margin: '0 0 20px', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
            Smarter Spaces.<br />Better Returns.
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', fontWeight: 300, lineHeight: 1.75, maxWidth: 560, margin: '0 auto 36px' }}>
            {t.heroSub}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/manage" style={{ background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 15, padding: '13px 28px', borderRadius: 28, textDecoration: 'none' }}>
              {t.ctaManage}
            </Link>
            <Link href={localeHref('/search', locale)} style={{ color: '#fff', fontWeight: 500, fontSize: 15, padding: '13px 24px', borderRadius: 28, textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.4)' }}>
              {t.ctaSearch}
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px' }}>

        {/* Mission */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center', marginBottom: 72 }} className="sm-2col">
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#d97f11', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 }}>{t.missionEyebrow}</p>
            <h2 style={{ fontSize: 30, fontWeight: 700, color: '#02402e', margin: '0 0 16px', lineHeight: 1.25 }}>
              {t.missionTitleA}<br />{t.missionTitleB}
            </h2>
            <p style={{ color: '#475569', fontSize: 15.5, lineHeight: 1.8, margin: '0 0 16px', fontWeight: 300 }}>
              {t.missionP1}
            </p>
            <p style={{ color: '#475569', fontSize: 15.5, lineHeight: 1.8, margin: 0, fontWeight: 300 }}>
              {t.missionP2}
            </p>
          </div>
          <div style={{ background: 'radial-gradient(120% 140% at 80% 10%,#055c43,#02402e 60%)', borderRadius: 24, padding: '40px 36px', color: '#fff' }}>
            <p style={{ fontSize: 13, color: '#d97f11', fontWeight: 600, margin: '0 0 20px' }}>{t.companyHeading}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                [t.companyNameThLabel, 'บริษัท เสปซเวิร์คส จำกัด'],
                [t.companyNameEnLabel, 'Space Works Co., Ltd.'],
                [t.regNoLabel,         '0105569001611'],
                [t.foundedLabel,       t.foundedValue],
                [t.officeLabel,        t.officeValue],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', flexShrink: 0 }}>{k}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 500, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Why SpacesMate */}
        <div style={{ marginBottom: 72 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#d97f11', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, textAlign: 'center' }}>{t.dnaEyebrow}</p>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#02402e', margin: '0 0 36px', textAlign: 'center' }}>{t.dnaHeading}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }} className="sm-2col">
            {TEAM.map(t => (
              <div key={t.title} style={{ padding: '28px 26px', background: '#fff', border: '1px solid #eef0ef', borderRadius: 20, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <span className="msym" style={{ fontSize: 36, flexShrink: 0, color: '#02402e', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{t.icon}</span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#02402e', margin: '0 0 8px' }}>{t.title}</h3>
                  <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.65, fontWeight: 300 }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two revenue streams */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 72 }} className="sm-2col">
          <div style={{ padding: '32px 28px', background: '#f7f9f8', border: '1px solid #eef0ef', borderRadius: 20 }}>
            <p style={{ margin: '0 0 14px' }}><span className="msym" style={{ fontSize: 26, color: '#02402e', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>apartment</span></p>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#02402e', margin: '0 0 10px' }}>{t.stream1Title}</h3>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: '0 0 14px', fontWeight: 300 }}>
              {t.stream1Desc}
            </p>
            <Link href={localeHref('/list-your-property', locale)} style={{ color: '#048c73', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>{t.stream1Cta}</Link>
          </div>
          <div style={{ padding: '32px 28px', background: '#02402e', borderRadius: 20 }}>
            <p style={{ margin: '0 0 14px' }}><span className="msym" style={{ fontSize: 26, color: '#fff', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>build</span></p>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>{t.stream2Title}</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: '0 0 14px', fontWeight: 300 }}>
              {t.stream2Desc}
            </p>
            <Link href="/manage" style={{ color: '#d97f11', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>{t.stream2Cta}</Link>
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'radial-gradient(120% 160% at 85% 10%,#055c43,#02402e 60%)', borderRadius: 24, padding: '52px 32px', textAlign: 'center', color: '#fff' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px' }}>{t.closingHeading}</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, margin: '0 0 28px', fontWeight: 300 }}>{t.closingSub}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/manage" style={{ background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 15, padding: '13px 28px', borderRadius: 28, textDecoration: 'none' }}>
              {t.closingCta1}
            </Link>
            <Link href={localeHref('/contact', locale)} style={{ color: '#fff', fontWeight: 500, fontSize: 15, padding: '13px 24px', borderRadius: 28, textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.35)' }}>
              {t.closingCta2}
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sm-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
