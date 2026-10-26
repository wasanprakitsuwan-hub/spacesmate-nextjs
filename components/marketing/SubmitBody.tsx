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
import Icon, { type IconName } from '@/components/ui/Icon'
import CopyCodeButton from '@/components/marketing/CopyCodeButton'
import { getCheckoutPromo } from '@/lib/promo-server'
import { C, WRAP, h2Style } from '@/lib/ui'


// ─── Data ─────────────────────────────────────────────────────────────────────

/**
 * Layout follows the round 6 mockup (approved 26 Oct 2026): green hero with a
 * sample listing card, stats, four reasons, three steps each with a small
 * screenshot of that screen, packages with the promo banner, FAQ, and a
 * closing band with a photo.
 */

/** Real listing photos from /public. */
const PHOTOS = {
  room:     '/properties/domethong-apartment-bts-yaek-kor-por-or-sai-mai.jpg',
  roomWhite:'/properties/bannai-ratchada-soi-5-mrt-soonwatthanatham.jpg',
  kitchen:  '/properties/laidback-place-sukhumvit-71.jpg',
  building: '/properties/metro-luxe-rama-4-unit-314-119-rent-bts-ekkamai.jpg',
}

/** Secondary text on the green bands. */
const ON_GREEN = '#cfe3d9'

const stats = (t: SubmitStrings) => [
  { icon: 'pin' as IconName,  num: '50+',       label: t.statAreas },
  { icon: 'tag' as IconName,  num: `฿${PACKAGE_PRICE_THB.basic}`, label: t.statPriceSub },
  { icon: 'bolt' as IconName, num: t.statHours, label: t.statInstant },
]

const why = (t: SubmitStrings) => [
  { icon: 'renters' as IconName, title: t.why1Title, desc: t.why1Body },
  { icon: 'badge' as IconName,   title: t.why2Title, desc: t.why2Body },
  { icon: 'cash' as IconName,    title: t.why3Title, desc: t.why3Body },
  { icon: 'shuffle' as IconName, title: t.why4Title, desc: t.why4Body },
]

// Order matters and it changed: writing comes first and costs nothing, buying
// comes second. The old copy opened with "เลือกแพ็กเกจ", which put a price in
// front of someone before they had a listing to publish.
const steps = (t: SubmitStrings) => [
  { num: '1', title: t.step1TitleFull, desc: t.step1Desc(MAX_IMAGES_ANY_PACKAGE) },
  { num: '2', title: t.step2Title,     desc: t.step2Body },
  { num: '3', title: t.step3Title,     desc: t.step3Body },
]

/** Icons for PRICING_T.includes, by position. */
const INCLUDE_ICONS: IconName[] = ['eye', 'phone', 'chart', 'train', 'globe', 'search', 'shuffle', 'noFee']

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
    durationLabel: p.durationLabel,
    sub: `${t.oneListing} · ${p.durationLabel}`,
    badge: p.id === 'standard' ? t.recommendedBadge : null,
    savings: p.savingsPct > 0 ? `${p.savingsPct}%` : null,
    // Only worth saying for the multi-month packages; Basic is already per month.
    perMonth: p.savingsPct > 0 ? p.perMonth.toLocaleString('en-US') : null,
    highlight: p.id === 'standard',
    // Features are [duration, photos, video], so the icons follow that order.
    features: p.features.map((f, j) => ({ text: f, icon: (j === 0 ? 'clock' : j === 1 ? 'image' : p.allowVideo ? 'video' : 'videoOff') as IconName, muted: j === 2 && !p.allowVideo })),
  }))
}

// ─── Small pieces ─────────────────────────────────────────────────────────────

const wrap = (pad: string): React.CSSProperties => ({ maxWidth: WRAP, margin: '0 auto', padding: pad, boxSizing: 'border-box' })

/** A browser-chrome frame around a mini screenshot of a real screen. */
function Shot({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <figure aria-hidden="true" style={{ margin: 0, border: `1px solid ${C.line}`, borderRadius: 8, overflow: 'hidden', background: C.paper }}>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '8px 10px', borderBottom: `1px solid ${C.line}`, background: C.white }}>
        {[0, 1, 2].map(i => <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: C.border }} />)}
        <span style={{ marginLeft: 8, fontSize: 11, color: C.muted }}>{url}</span>
      </div>
      <div style={{ padding: 14, height: 230, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, lineHeight: 1.5 }}>
        {children}
      </div>
    </figure>
  )
}

const field: React.CSSProperties = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 4, padding: '5px 8px' }
const thumb = (w: number | string, h: number): React.CSSProperties => ({ width: w, height: h, objectFit: 'cover', borderRadius: 3, display: 'block', flexShrink: 0 })

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SubmitBody({ locale = 'th' }: { locale?: Locale }) {
  const t = SUBMIT_T[locale]
  const pt = PRICING_T[locale]
  const PACKAGES = packagesFor(locale)
  const STATS = stats(t)
  const WHY = why(t)
  const STEPS = steps(t)
  // Shown only while the promo is switched on in Settings › การชำระเงิน, so the
  // page never advertises a code that Stripe would reject.
  const promo = await getCheckoutPromo()
  const promoTitle = locale === 'en' ? promo.title_en : promo.title_th
  const newHref = localeHref('/list-your-property/new', locale)
  const standard = PACKAGES.find(p => p.id === 'standard') ?? PACKAGES[0]

  return (
    <div style={{ background: C.paper, color: C.ink }}>

      {/* ── 1. Hero: green band, text left, sample listing card right ── */}
      <section style={{ background: C.green, color: C.white }}>
        <div style={{ ...wrap('64px 16px'), display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 520px', minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
              <span style={{ fontSize: 14, color: ON_GREEN, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="home" size={18} color={ON_GREEN} />{t.ownersEyebrow}</span>
              {promo.enabled && (
                <a href="#packages" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f2b25c', color: '#2b1800', borderRadius: 999, padding: '4px 12px', fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}>
                  <Icon name="tag" size={15} color="#2b1800" strokeWidth={1.8} />{promoTitle} · {t.useCode} {promo.code}
                </a>
              )}
            </div>
            <h1 style={{ margin: '0 0 18px', fontSize: 'clamp(32px, 4.5vw, 46px)', lineHeight: 1.25, fontWeight: 600, color: C.white }}>
              {t.ownersTitle}<br />{t.heroTitleB}
            </h1>
            <p style={{ margin: '0 0 24px', fontSize: 17, lineHeight: 1.75, color: ON_GREEN, maxWidth: 560 }}>{t.ownersBody}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href={newHref} style={{ background: C.white, color: C.green, padding: '12px 20px', borderRadius: 6, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontSize: 15 }}>
                <Icon name="plus" size={18} color={C.green} strokeWidth={1.8} />{t.ownersCta1}
              </Link>
              <Link href="/manage" style={{ color: C.white, border: '1px solid rgba(255,255,255,0.5)', padding: '11px 18px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontSize: 15 }}>
                <Icon name="buildingPlain" size={18} color={C.white} />{t.ownersCta2}
              </Link>
            </div>
          </div>

          {/* What a published listing looks like. Placeholders in brackets, not invented data. */}
          <div style={{ flex: '0 1 400px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 13, color: ON_GREEN }}>{t.sampleCaption}</span>
            <article aria-hidden="true" style={{ background: C.white, color: C.ink, borderRadius: 8, overflow: 'hidden' }}>
              <img src={PHOTOS.room} alt="" style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 500, background: C.tint, color: C.green, borderRadius: 4, padding: '2px 8px' }}>{t.sampleType}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, background: '#84c341', color: '#1d2a0c', borderRadius: 4, padding: '2px 8px' }}>{t.sampleStation}</span>
                </span>
                <span style={{ fontWeight: 600, fontSize: 17, color: C.green }}>{t.sampleName}</span>
                <span style={{ display: 'flex', gap: 14, fontSize: 13.5, color: C.muted }}>
                  <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}><Icon name="bed" size={16} color={C.muted} />{t.sampleBeds}</span>
                  <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}><Icon name="grid" size={16} color={C.muted} />{t.sampleSize}</span>
                </span>
                <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: `1px solid ${C.line2}`, paddingTop: 10, marginTop: 2 }}>
                  <span style={{ fontSize: 20, fontWeight: 600, color: C.amber }}>{t.samplePrice}<span style={{ fontSize: 13, color: C.muted, fontWeight: 400 }}>{t.perMonth}</span></span>
                  <span style={{ fontSize: 13, color: C.teal, display: 'flex', gap: 4, alignItems: 'center' }}><Icon name="chat" size={16} color={C.teal} />{t.sampleContact}</span>
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* stats */}
      <section style={{ background: C.white, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ ...wrap('0 16px'), display: 'flex', flexWrap: 'wrap' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ flex: '1 1 260px', display: 'flex', gap: 14, alignItems: 'center', padding: '22px 20px 22px 0' }}>
              <Icon name={s.icon} size={28} color={C.teal} />
              <span>
                <span style={{ display: 'block', fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 600, color: C.green, lineHeight: 1.3 }}>{s.num}</span>
                <span style={{ display: 'block', fontSize: 14, color: C.muted }}>{s.label}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 2. Why ── */}
      <section style={wrap('64px 16px 24px')}>
        <h2 style={{ ...h2Style(28), margin: '0 0 6px' }}>{t.whyHeadingA} SpacesMate {t.whyHeadingB}</h2>
        <p style={{ margin: '0 0 26px', color: C.muted, fontSize: 15 }}>{t.whySub}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {WHY.map(w => (
            <div key={w.title} style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: 10, padding: 24, background: C.white, border: `1px solid ${C.line}`, borderRadius: 8 }}>
              <span style={{ width: 48, height: 48, borderRadius: 8, background: C.tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={w.icon} size={24} color={C.green} /></span>
              <h3 style={{ fontWeight: 600, fontSize: 17, color: C.green, margin: 0, lineHeight: 1.4 }}>{w.title}</h3>
              <p style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.75, margin: 0 }}>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Steps, each with a screenshot of that screen ── */}
      <section style={wrap('48px 16px 64px')}>
        <h2 style={{ ...h2Style(28), margin: '0 0 24px' }}>{t.stepsHeading}</h2>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {STEPS.map((s, i) => (
            <li key={s.num} style={{ flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {i === 0 && (
                <Shot url="spacesmate.com/list-your-property/new">
                  <span style={{ fontWeight: 600, color: C.green, fontSize: 13 }}>{t.shotNewTitle}</span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}><span style={{ color: C.muted }}>{t.shotListingName}</span><span style={field}>{t.shotListingValue}</span></span>
                  <span style={{ display: 'flex', gap: 6 }}>
                    <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}><span style={{ color: C.muted }}>{t.shotRent}</span><span style={field}>{t.shotRentValue}</span></span>
                    <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}><span style={{ color: C.muted }}>{t.shotSize}</span><span style={field}>{t.sampleSize}</span></span>
                  </span>
                  <span style={{ color: C.muted }}>{t.shotPhotos(MAX_IMAGES_ANY_PACKAGE)}</span>
                  <span style={{ display: 'flex', gap: 6 }}>
                    {[PHOTOS.room, PHOTOS.roomWhite, PHOTOS.kitchen].map(src => <img key={src} src={src} alt="" loading="lazy" style={thumb('25%', 46)} />)}
                    <span style={{ width: '25%', height: 46, border: `1px dashed ${C.teal}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.teal, fontSize: 16 }}>+</span>
                  </span>
                  <span style={{ marginTop: 'auto', alignSelf: 'flex-end', ...field, padding: '5px 10px' }}>{t.shotSaveDraft}</span>
                </Shot>
              )}
              {i === 1 && (
                <Shot url="spacesmate.com/checkout">
                  <span style={{ display: 'flex', gap: 8, alignItems: 'center', background: C.white, border: `1px solid ${C.line}`, borderRadius: 4, padding: 6 }}>
                    <img src={PHOTOS.room} alt="" loading="lazy" style={thumb(40, 30)} />
                    <span style={{ display: 'flex', flexDirection: 'column' }}><span style={{ color: C.muted, fontSize: 11 }}>{t.shotSelected}</span><span style={{ fontWeight: 600, color: C.green }}>{t.shotListingValue}</span></span>
                  </span>
                  {PACKAGES.map(p => {
                    const on = p.id === standard.id
                    return (
                      <span key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: on ? C.tint : C.white, border: on ? `1.5px solid ${C.teal}` : `1px solid ${C.border}`, borderRadius: 4, padding: '7px 9px' }}>
                        <span style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontWeight: 600, color: C.green }}>{p.period}</span><span style={{ color: C.muted, fontSize: 11 }}>{p.durationLabel}</span></span>
                        <span style={{ fontWeight: 600 }}>฿{p.price}</span>
                      </span>
                    )
                  })}
                  <span style={{ marginTop: 'auto', background: C.teal, color: C.white, borderRadius: 4, padding: '6px 10px', textAlign: 'center' }}>{t.shotPay(standard.price)}</span>
                </Shot>
              )}
              {i === 2 && (
                <Shot url="spacesmate.com/owner-dashboard">
                  <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: C.green, fontSize: 13 }}>{t.shotMine}</span>
                    <span style={{ display: 'flex', gap: 4, alignItems: 'center', color: C.teal }}><Icon name="check" size={14} color={C.teal} strokeWidth={2} />{t.shotPaid}</span>
                  </span>
                  <span style={{ display: 'flex', gap: 8, background: C.white, border: `1px solid ${C.line}`, borderRadius: 4, padding: 8 }}>
                    <img src={PHOTOS.room} alt="" loading="lazy" style={thumb(64, 50)} />
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                      <span style={{ fontWeight: 600, color: C.green }}>{t.shotListingValue}</span>
                      <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><span style={{ background: C.tint, color: C.green, borderRadius: 3, padding: '1px 6px', fontWeight: 600 }}>{t.shotLive}</span><span style={{ color: C.muted }}>{standard.period}</span></span>
                      <span style={{ color: C.muted }}>{t.shotAutoClose}</span>
                    </span>
                  </span>
                  <span style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                    {[t.shotEdit, t.shotExtend, t.shotStats].map(b => <span key={b} style={{ flex: 1, textAlign: 'center', ...field }}>{b}</span>)}
                  </span>
                </Shot>
              )}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ width: 32, height: 32, borderRadius: '50%', background: i === 0 ? C.green : C.tint, color: i === 0 ? C.white : C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", fontWeight: 600, flexShrink: 0 }}>{s.num}</span>
                <span>
                  <h3 style={{ fontWeight: 600, fontSize: 17, color: C.green, margin: '0 0 2px' }}>{s.title}</h3>
                  <p style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 4. Packages ── */}
      {/* id: /pricing redirects here (next.config.js). */}
      <section id="packages" style={{ background: C.white, borderTop: `1px solid ${C.line}`, scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 16px', boxSizing: 'border-box' }}>
          <h2 style={{ ...h2Style(28), margin: '0 0 6px', textAlign: 'center' }}>{t.packagesHeading}</h2>
          <p style={{ margin: '0 0 8px', color: C.muted, textAlign: 'center', fontSize: 15 }}>{t.note1}</p>
          {/* The rule that removes the decision from the listing form: you are
              never choosing what you may enter, only how much of it shows. */}
          <p style={{ margin: '0 0 24px', color: C.muted, textAlign: 'center', fontSize: 14, lineHeight: 1.6 }}>
            {t.note2Full(MAX_IMAGES_ANY_PACKAGE)}
            <br />{t.note2TailA}<strong style={{ color: C.green, fontWeight: 600 }}>{t.note2Strong}</strong>{t.note2TailB}
          </p>

          {promo.enabled && (
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', background: C.amber, color: C.white, borderRadius: 8, padding: '22px 26px', marginBottom: 24 }}>
              <span style={{ width: 56, height: 56, borderRadius: '50%', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="gift" size={28} color={C.amber} strokeWidth={1.8} /></span>
              <span style={{ flex: '1 1 320px', minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 24, fontWeight: 600, lineHeight: 1.3 }}>{promoTitle}</span>
                <span style={{ display: 'block', fontSize: 15, marginTop: 2 }}>{t.promoSub}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'stretch', background: C.white, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 600, letterSpacing: 3, color: C.amber, padding: '8px 20px', borderRight: '2px dashed #e8c79a', display: 'flex', alignItems: 'center' }}>{promo.code}</span>
                <CopyCodeButton code={promo.code} label={t.copyCode} copiedLabel={t.copied} />
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'stretch' }}>
            {PACKAGES.map(pkg => (
              <div key={pkg.id} style={{ flex: '1 1 280px', border: pkg.highlight ? `2px solid ${C.teal}` : `1px solid ${C.line}`, borderRadius: 8, padding: pkg.highlight ? 23 : 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontWeight: 600, color: C.green, margin: 0, fontSize: 16 }}>{pkg.period}</h3>
                  {pkg.badge && <span style={{ fontSize: 12, fontWeight: 600, background: C.teal, color: C.white, borderRadius: 4, padding: '2px 8px' }}>{pkg.badge}</span>}
                </span>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 600, color: C.ink, lineHeight: 1.1 }}>{pkg.price}</span>
                  <span style={{ color: C.muted }}>{t.baht}</span>
                  {pkg.savings && <span style={{ fontSize: 12, fontWeight: 600, color: C.green, background: C.tint, borderRadius: 4, padding: '2px 8px' }}>{t.save} {pkg.savings}</span>}
                </span>
                <span style={{ fontSize: 13.5, color: C.muted }}>
                  {pkg.sub}
                  {pkg.perMonth && <> · {pt.avgPrefix} <span style={{ color: C.amber, fontWeight: 500 }}>{pkg.perMonth} {pt.avgSuffix}</span></>}
                </span>
                <ul style={{ listStyle: 'none', margin: 0, padding: '12px 0 0', borderTop: `1px solid ${C.line2}`, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14.5 }}>
                  {pkg.features.map(f => (
                    <li key={f.text} style={{ display: 'flex', gap: 8, alignItems: 'center', color: f.muted ? C.muted : C.ink }}>
                      <Icon name={f.icon} size={18} color={f.muted ? C.muted : C.teal} />{f.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* What every package gets. The cards above carry only what differs
              (duration, price, photos, video), so this list is not repeated
              three times. */}
          <div style={{ marginTop: 16, border: `1px solid ${C.line}`, borderRadius: 8, padding: '22px 24px', background: C.paper }}>
            <h3 style={{ fontWeight: 600, color: C.green, margin: '0 0 12px', fontSize: 16 }}>{pt.includesTitle}</h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: '10px 24px', fontSize: 14.5 }}>
              {pt.includes.map((f, j) => (
                <li key={f} style={{ flex: '1 1 300px', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Icon name={INCLUDE_ICONS[j] ?? 'check'} size={18} color={C.teal} />{f}
                </li>
              ))}
            </ul>
          </div>

          {/* The cards show prices only. Slots are bought from the owner
              dashboard (/checkout), so this page has one call to action:
              write the listing. */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 28, textAlign: 'center' }}>
            <Link href={newHref} className="sm-btn-primary" style={{ background: C.teal, color: C.white, padding: '13px 24px', borderRadius: 6, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontSize: 15 }}>
              <Icon name="edit" size={18} color={C.white} strokeWidth={1.8} />{t.draftTitle}
            </Link>
            <span style={{ fontSize: 13.5, color: C.muted }}>{t.draftBody}</span>
          </div>
        </div>
      </section>

      {/* ── 5. FAQ ── */}
      {/* Moved from /pricing with the page, structured data included, so the
          FAQ result in search follows it here. Every answer is shown open. */}
      <FaqLd qa={PRICING_FAQ_T[locale]} />
      <section style={{ borderTop: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '64px 16px', boxSizing: 'border-box' }}>
          <h2 style={{ ...h2Style(28), margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}><Icon name="help" size={26} color={C.green} />{pt.faqHeading}</h2>
          <div style={{ borderTop: `1px solid ${C.line}` }}>
            {PRICING_FAQ_T[locale].map(f => (
              <div key={f.q} style={{ borderBottom: `1px solid ${C.line}`, padding: '16px 0' }}>
                <h3 style={{ fontWeight: 600, color: C.green, margin: 0, fontSize: 15.5 }}>{f.q}</h3>
                <p style={{ margin: '8px 0 0', color: '#4a4642', lineHeight: 1.8, fontSize: 15 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Closing: text + photo ── */}
      <section style={wrap('0 16px 72px')}>
        <div style={{ background: C.green, borderRadius: 8, overflow: 'hidden', display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
          <div style={{ flex: '1 1 440px', minWidth: 0, padding: '44px 40px', display: 'flex', flexDirection: 'column', gap: 14, color: C.white, justifyContent: 'center', boxSizing: 'border-box' }}>
            <h2 style={{ ...h2Style(30), color: C.white, lineHeight: 1.3 }}>{t.closingTitle}</h2>
            <p style={{ color: ON_GREEN, fontSize: 16, margin: 0 }}>{t.closingBody}</p>
            <Link href={newHref} style={{ alignSelf: 'flex-start', background: C.white, color: C.green, padding: '12px 22px', borderRadius: 6, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 4, textDecoration: 'none', fontSize: 15 }}>
              {t.ownersCta1}<Icon name="arrowRight" size={18} color={C.green} strokeWidth={1.8} />
            </Link>
          </div>
          <img src={PHOTOS.building} alt={t.closingAlt} loading="lazy" style={{ flex: '1 1 360px', minWidth: 0, height: 300, objectFit: 'cover', display: 'block' }} />
        </div>
      </section>
    </div>
  )
}
