// Link here is LocaleLink: it keeps the reader in the language they are already
// reading, so an href written as a Thai path resolves to its English
// counterpart on /en/* pages. An href with no English page passes through
// unchanged. The list of which is in lib/routes-i18n, deliberately not
// repeated here — it was copied into 16 files and went stale in all of them
// the moment /manage and /blog got English pages. See
// components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import { MAX_IMAGES_ANY_PACKAGE, PACKAGE_PRICE_THB } from '@/lib/packages'
import { localeHref } from '@/lib/routes-i18n'
import { SUBMIT_T, type Locale, type SubmitStrings } from '@/lib/pages-i18n'
import { buildPlans, PRICING_T, PRICING_FAQ_T } from '@/lib/pricing-i18n'
import { FaqLd } from '@/components/seo/JsonLd'


// ─── Data ─────────────────────────────────────────────────────────────────────

const stats = (t: SubmitStrings) => [
  { num: '50+',       label: t.statAreas },
  { num: `฿${PACKAGE_PRICE_THB.basic}`, label: t.statPriceSub },
  { num: t.statHours, label: t.statInstant },
]

const why = (t: SubmitStrings) => [
  { icon: 'person_search', title: t.why1Title, desc: t.why1Body },
  { icon: 'verified',      title: t.why2Title, desc: t.why2Body },
  { icon: 'payments',      title: t.why3Title, desc: t.why3Body },
  { icon: 'shuffle',       title: t.why4Title, desc: t.why4Body },
]

// Order matters and it changed: writing comes first and costs nothing, buying
// comes second. The old copy opened with "เลือกแพ็กเกจ", which put a price in
// front of someone before they had a listing to publish.
const steps = (t: SubmitStrings) => [
  { num: '1', title: t.step1TitleFull, desc: t.step1Desc(MAX_IMAGES_ANY_PACKAGE) },
  { num: '2', title: t.step2Title,     desc: t.step2Body },
  { num: '3', title: t.step3Title,     desc: t.step3Body },
]

// Cards for this page, built from the same source /pricing uses.
//
// This used to be its own copy of the package table, with savings: '22%' and
// '30%' written out as strings. They were right, but only because the prices
// had not changed since someone typed them: /pricing derives its figure from
// PACKAGE_PRICE_THB, so the first price change would have left this page
// advertising a discount the code could prove was wrong.
function packagesFor(locale: Locale) {
  const t = SUBMIT_T[locale]
  return buildPlans(locale).map(p => ({
    id: p.id,
    period: p.name,
    price: p.price,
    sub: `${t.oneListing} · ${p.durationLabel}`,
    badge: p.id === 'standard' ? t.recommendedBadge : null,
    savings: p.savingsPct > 0 ? `${p.savingsPct}%` : null,
    highlight: p.id === 'standard',
    features: p.features,
  }))
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubmitBody({ locale = 'th' }: { locale?: Locale }) {
  const t = SUBMIT_T[locale]
  const PACKAGES = packagesFor(locale)
  const STATS = stats(t)
  const WHY = why(t)
  const STEPS = steps(t)

  return (
    <div style={{ fontFamily: 'inherit', color: '#231f20' }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ background: '#02402e', padding: '56px 24px 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, alignItems: 'center' }} className="sm-hero-grid">

          {/* Left — Text */}
          <div>
            <p style={{ fontSize: 13.5, color: '#d97f11', fontWeight: 600, margin: '0 0 14px' }}>
              {t.ownersEyebrow}
            </p>
            <h1 style={{ margin: '0 0 6px', lineHeight: 1.15, letterSpacing: '-0.4px' }}>
              <span style={{ fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 700, color: '#fff', display: 'block' }}>
                {t.ownersTitle}
              </span>
              <span style={{ fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 700, color: '#d97f11', display: 'block' }}>
                {t.heroTitleB}
              </span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15.5, fontWeight: 300, lineHeight: 1.7, margin: '20px 0 32px', maxWidth: 480 }}>
              {t.ownersBody}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href={localeHref('/list-your-property/new', locale)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 15.5, borderRadius: 28, padding: '14px 28px', textDecoration: 'none' }}>
                {t.ownersCta1}<span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 300, 'FILL' 0", marginLeft: 5 }}>arrow_forward</span>
              </Link>
              <Link href="/manage"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: '#fff', fontWeight: 600, fontSize: 15.5, borderRadius: 28, padding: '14px 24px', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.5)' }}>
                {t.ownersCta2}
              </Link>
            </div>
          </div>

          {/* Right — Stats box */}
          <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '28px 30px', backdropFilter: 'blur(8px)' }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: i > 0 ? '20px 0 0' : '0 0 20px', borderBottom: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none', marginBottom: i < STATS.length - 1 ? 20 : 0 }}>
                <span style={{ fontSize: 'clamp(24px,3vw,32px)', fontWeight: 700, color: '#d97f11', minWidth: 100, lineHeight: 1.1 }}>{s.num}</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 300, lineHeight: 1.45 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY SECTION ──────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 600, margin: '0 0 8px', textAlign: 'center', color: '#111827' }}>
            {t.whyHeadingA} SpacesMate {t.whyHeadingB}
          </h2>
          <p style={{ color: '#6b7280', fontSize: 15, margin: '0 0 40px', textAlign: 'center', fontWeight: 300 }}>
            {t.whySub}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }} className="sm-why4">
            {WHY.map(w => (
              <div key={w.icon} style={{ background: '#fff', border: '1px solid #e5eae8', borderRadius: 16, padding: '28px 22px' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#048c73', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <span className="msym" style={{ fontSize: 26, color: '#fff' }}>{w.icon}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px', color: '#111827' }}>{w.title}</h3>
                <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, margin: 0, fontWeight: 300 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 STEPS ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '16px 24px 64px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 600, margin: '0 0 36px', textAlign: 'center', color: '#111827' }}>
            {t.stepsHeading}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }} className="sm-steps3">
            {STEPS.map(s => (
              <div key={s.num} style={{ background: '#fff', border: '1px solid #e5eae8', borderRadius: 18, padding: '36px 28px', textAlign: 'center' }}>
                {/* Teal circle number */}
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#048c73', color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  {s.num}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 10px', color: '#111827' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', margin: 0, fontWeight: 300, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      {/* id: /pricing redirects here (next.config.js). */}
      <section id="packages" style={{ background: '#e8f4ef', padding: '64px 24px 72px', scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 600, margin: '0 0 8px', textAlign: 'center', color: '#111827' }}>
            {t.packagesHeading}
          </h2>
          <p style={{ color: '#6b7280', fontSize: 15, margin: '0 0 8px', textAlign: 'center', fontWeight: 300 }}>
            {t.note1}
          </p>
          {/* The rule that removes the decision from the listing form: you are
              never choosing what you may enter, only how much of it shows. */}
          <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 16px', textAlign: 'center', fontWeight: 300, lineHeight: 1.6 }}>
            {t.note2Full(MAX_IMAGES_ANY_PACKAGE)}
            <br />{t.note2TailA}<strong style={{ color: '#02402e', fontWeight: 600 }}>{t.note2Strong}</strong>{t.note2TailB}
          </p>
          {/* Green promo note */}
          <p style={{ textAlign: 'center', fontSize: 14, color: '#02402e', fontWeight: 500, margin: '0 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span className="msym" style={{ fontSize: 16, color: '#d97f11', fontVariationSettings: "'wght' 400, 'FILL' 1" }}>check_circle</span>
            {t.note3}
          </p>

          {/* ── SM299 Promo banner ──────────────────────────────────────────── */}
          <div style={{ maxWidth: 860, margin: '0 auto 32px', padding: '14px 22px', background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: '1.5px solid #fde68a', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="msym" style={{ fontSize: 26, color: '#d97f11', fontVariationSettings: "'wght' 400, 'FILL' 1", flexShrink: 0 }}>sell</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#92400e' }}>{t.promoTitle}</p>
              <p style={{ margin: '3px 0 0', fontSize: 13.5, color: '#78350f' }}>
                {t.promoUseCode}{' '}
                <strong style={{ letterSpacing: 2, color: '#02402e', background: '#fff', padding: '2px 10px', borderRadius: 7, fontSize: 14, border: '1px solid #d97f11', fontFamily: 'monospace' }}>SM299</strong>
                {' '}{t.promoDetail}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, maxWidth: 860, margin: '0 auto' }} className="sm-pkg3">
            {PACKAGES.map((pkg) => (
              <div key={pkg.period} style={{ position: 'relative', background: '#fff', border: `2px solid ${pkg.highlight ? '#d97f11' : '#e5eae8'}`, borderRadius: 18, padding: '28px 22px', display: 'flex', flexDirection: 'column' }}>

                {/* 'most popular' badge */}
                {pkg.badge && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#d97f11', color: '#fff', fontSize: 12.5, fontWeight: 700, padding: '5px 18px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                    {pkg.badge}
                  </div>
                )}

                {/* Period */}
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 10px', color: '#374151' }}>{pkg.period}</h3>

                {/* Price */}
                <div style={{ marginBottom: 6, display: 'flex', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: 38, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{pkg.price}</span>
                    <span style={{ fontSize: 16, fontWeight: 500, color: '#111827', marginLeft: 4 }}>{t.baht}</span>
                  </div>
                  {pkg.savings && (
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', background: '#048c73', borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap', marginBottom: 4 }}>
                      {t.save} {pkg.savings}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 22px', fontWeight: 300 }}>{pkg.sub}</p>

                {/* Features */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {pkg.features.map((f, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: '#374151', lineHeight: 1.45, fontWeight: 300 }}>
                      <span className="msym" style={{ fontSize: 14, color: '#048c73', fontVariationSettings: "'wght' 400, 'FILL' 1", flexShrink: 0 }}>check</span>
                      {f}
                    </li>
                  ))}
                </ul>

              </div>
            ))}
          </div>

          {/* The cards show prices only. Slots are bought from the owner
              dashboard (/checkout), so this page has one call to action:
              write the listing. */}
          <div style={{ maxWidth: 860, margin: '30px auto 0', textAlign: 'center' }}>
            <Link href={localeHref('/list-your-property/new', locale)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, background: '#02402e', color: '#fff',
                fontWeight: 600, fontSize: 15, padding: '14px 30px', borderRadius: 28, textDecoration: 'none',
              }}>
              <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>edit_note</span>
              {t.draftTitle}
            </Link>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '10px 0 0', fontWeight: 300, lineHeight: 1.6 }}>
              {t.draftBody}
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      {/* Moved from /pricing with the page, structured data included, so the
          FAQ result in search follows it here. */}
      <FaqLd qa={PRICING_FAQ_T[locale]} />
      <section style={{ background: '#fff', padding: '64px 24px 0' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 600, margin: '0 0 24px', textAlign: 'center', color: '#111827' }}>
            {PRICING_T[locale].faqHeading}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PRICING_FAQ_T[locale].map(f => (
              <div key={f.q} style={{ border: '1px solid #e5eae8', borderRadius: 14, padding: '16px 20px' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#231f20', margin: '0 0 6px' }}>{f.q}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.65, fontWeight: 300 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '48px 24px 72px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(135deg,#02402e 0%,#036b56 100%)', borderRadius: 24, padding: '56px 24px', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 700, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.3px' }}>
              {t.closingTitle}
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', margin: '0 0 32px', fontWeight: 300 }}>
              {t.closingBody}
            </p>
            <Link href={localeHref('/list-your-property/new', locale)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 16, borderRadius: 30, padding: '15px 36px', textDecoration: 'none' }}>
              {t.ownersCta1} →
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 960px) {
          .sm-hero-grid { grid-template-columns: 1fr !important; }
          .sm-why4 { grid-template-columns: repeat(2,1fr) !important; }
          .sm-pkg3 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .sm-hero-grid { gap: 32px !important; }
          .sm-why4 { grid-template-columns: 1fr !important; }
          .sm-steps3 { grid-template-columns: 1fr !important; }
          .sm-pkg3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
