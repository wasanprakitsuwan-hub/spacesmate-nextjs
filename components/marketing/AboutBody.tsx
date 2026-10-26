// Link here is LocaleLink: it keeps the reader in the language they are already
// reading, so an href written as a Thai path resolves to its English
// counterpart on /en/* pages. See components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import Icon, { type IconName } from '@/components/ui/Icon'
import { ABOUT_T, type Locale } from '@/lib/marketing-i18n'
import { C, WRAP, btnStyle, h2Style } from '@/lib/ui'

/**
 * The About page, shared by /about and /en/about.
 *
 * Round 6 layout (approved 26 Oct 2026): story with the two owner situations
 * beside a photo collage, what we do (two cards, each with a picture of that
 * service), then company details beside a closing call to action. The "Why
 * SpacesMate" section was removed at the Founder's request.
 *
 * No registration number or founding date (Founder, 25 Oct 2026: too detailed
 * for this page); the legal details live in the terms and on documents.
 */

/** Real listing photos from /public. */
const PHOTOS = {
  building: '/properties/metro-luxe-rama-4-unit-314-119-rent-bts-ekkamai.jpg',
  roomBed:  '/properties/p-apartment-charan-37-mrt-bang-khun-non.jpg',
  kitchen:  '/properties/laidback-place-sukhumvit-71.jpg',
  roomWood: '/properties/domethong-apartment-bts-yaek-kor-por-or-sai-mai.jpg',
}
const SITUATION_ICONS: IconName[] = ['family', 'building']
const OVERLAY_ICONS: IconName[] = ['userCheck', 'card', 'wrench', 'chart']

const well = (bg: string): React.CSSProperties => ({ width: 44, height: 44, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 })
const wrap = (pad: string): React.CSSProperties => ({ maxWidth: WRAP, margin: '0 auto', padding: pad, boxSizing: 'border-box' })

export default function AboutBody({ locale = 'th' }: { locale?: Locale }) {
  const t = ABOUT_T[locale]
  const company = [
    { icon: 'buildingPlain' as IconName, label: t.operatedByLabel, value: t.operatedBy },
    { icon: 'pin' as IconName,           label: t.officeLabel,     value: t.officeValue },
    { icon: 'chat' as IconName,          label: t.contactLabel,    value: t.contactValue },
  ]
  return (
    <div style={{ background: C.paper, color: C.ink }}>

      {/* ── 1. Story + photos ── */}
      <section style={{ ...wrap('64px 16px 56px'), display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 520px', minWidth: 0 }}>
          <p style={{ fontSize: 14, color: C.teal, fontWeight: 500, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="info" size={18} color={C.teal} />{t.eyebrow}</p>
          <h1 style={{ margin: '0 0 18px', fontSize: 'clamp(30px, 4vw, 42px)', lineHeight: 1.3, fontWeight: 600, color: C.green }}>{t.heroTitle}</h1>
          <p style={{ margin: '0 0 20px', fontSize: 17, lineHeight: 1.8, maxWidth: 580 }}>{t.heroSub}</p>
          <ul style={{ listStyle: 'none', margin: '0 0 24px', padding: 0, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 580 }}>
            {t.situations.map((s, i) => (
              <li key={s.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ ...well(C.tint), width: 40, height: 40 }}><Icon name={SITUATION_ICONS[i]} color={C.green} /></span>
                <span>
                  <span style={{ display: 'block', fontWeight: 600, color: C.green, fontSize: 15.5 }}>{s.title}</span>
                  <span style={{ display: 'block', fontSize: 14.5, color: C.muted }}>{s.desc}</span>
                </span>
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/manage" className="sm-btn-primary" style={btnStyle('primary')}>{t.ctaManage}</Link>
            <Link href="/search" className="sm-btn-ghost" style={{ ...btnStyle('ghost'), color: C.green, gap: 8 }}><Icon name="search" size={18} color={C.green} />{t.ctaSearch}</Link>
          </div>
        </div>
        <div style={{ flex: '1 1 420px', minWidth: 0, display: 'flex', gap: 10 }}>
          <img src={PHOTOS.building} alt={t.photoAlts[0]} style={{ flex: '1.3 1 0', minWidth: 0, height: 400, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
          <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <img src={PHOTOS.roomBed} alt={t.photoAlts[1]} style={{ width: '100%', height: 195, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
            <img src={PHOTOS.kitchen} alt={t.photoAlts[2]} style={{ width: '100%', height: 195, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
          </div>
        </div>
      </section>

      {/* ── 2. What we do: each card pictures its own service ── */}
      <section style={{ background: C.white, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
        <div style={wrap('56px 16px')}>
          <h2 style={{ ...h2Style(26), margin: '0 0 24px' }}>{t.whatHeading}</h2>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>

            {/* Listing platform: a miniature of the search results */}
            <div style={{ flex: '1 1 440px', minWidth: 0, border: `1px solid ${C.line}`, borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <figure aria-hidden="true" style={{ margin: 0, height: 220, background: C.paper, borderBottom: `1px solid ${C.line}`, padding: 16, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: '7px 10px', fontSize: 13, color: C.muted }}>
                  <Icon name="search" size={15} color={C.teal} strokeWidth={1.8} />{t.stream1Search}
                </span>
                {t.stream1Rows.map((r, i) => (
                  <span key={r.name} style={{ display: 'flex', gap: 10, background: C.white, border: `1px solid ${C.line}`, borderRadius: 6, padding: 8 }}>
                    <img src={i === 0 ? PHOTOS.roomWood : PHOTOS.roomBed} alt="" loading="lazy" style={{ width: 84, height: 62, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                      <span style={{ fontWeight: 600, color: C.green, fontSize: 13 }}>{r.name}</span>
                      <span><span style={{ fontSize: 11, fontWeight: 600, background: '#84c341', color: '#1d2a0c', borderRadius: 3, padding: '1px 6px' }}>{r.station}</span></span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.amber }}>{t.samplePrice}<span style={{ fontWeight: 400, color: C.muted }}>{t.perMonth}</span></span>
                    </span>
                  </span>
                ))}
              </figure>
              <div style={{ padding: 22 }}>
                <span style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                  <span style={well(C.tint)}><Icon name="doc" size={22} color={C.green} /></span>
                  <h3 style={{ ...h2Style(20), margin: 0 }}>{t.stream1Title}</h3>
                </span>
                <p style={{ margin: '0 0 10px', color: C.muted, lineHeight: 1.8, fontSize: 15 }}>{t.stream1Desc}</p>
                <Link href="/list-your-property" style={{ color: C.teal, fontWeight: 500, display: 'inline-flex', gap: 6, alignItems: 'center', textDecoration: 'none', fontSize: 15 }}>
                  {t.stream1Cta}<Icon name="arrowRight" size={16} color={C.teal} strokeWidth={1.8} />
                </Link>
              </div>
            </div>

            {/* Building management: the building, with what the team handles */}
            <div style={{ flex: '1 1 440px', minWidth: 0, border: `1px solid ${C.line}`, borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <figure style={{ margin: 0, height: 220, position: 'relative' }}>
                <img src={PHOTOS.building} alt={t.photoAlts[0]} loading="lazy" style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
                <figcaption style={{ position: 'absolute', right: 14, bottom: 14, background: C.white, borderRadius: 6, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.green }}>{t.stream2Overlay}</span>
                  {t.stream2Items.map((it, i) => (
                    <span key={it} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}><Icon name={OVERLAY_ICONS[i]} size={16} color={C.teal} strokeWidth={1.8} />{it}</span>
                  ))}
                </figcaption>
              </figure>
              <div style={{ padding: 22 }}>
                <span style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                  <span style={well(C.green)}><Icon name="building" size={22} color={C.white} /></span>
                  <h3 style={{ ...h2Style(20), margin: 0 }}>{t.stream2Title}</h3>
                </span>
                <p style={{ margin: '0 0 10px', color: C.muted, lineHeight: 1.8, fontSize: 15 }}>{t.stream2Desc}</p>
                <Link href="/manage#enquiry" style={{ color: C.teal, fontWeight: 500, display: 'inline-flex', gap: 6, alignItems: 'center', textDecoration: 'none', fontSize: 15 }}>
                  {t.stream2Cta}<Icon name="arrowRight" size={16} color={C.teal} strokeWidth={1.8} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Company + closing CTA ── */}
      <section style={{ ...wrap('64px 16px 72px'), display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'stretch' }}>
        <div style={{ flex: '1 1 440px', minWidth: 0, background: C.white, border: `1px solid ${C.line}`, borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ ...h2Style(20) }}>{t.companyHeading}</h2>
          {company.map(c => (
            <div key={c.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ marginTop: 2 }}><Icon name={c.icon} size={22} color={C.teal} /></span>
              <span>
                <span style={{ display: 'block', fontSize: 13.5, color: C.muted }}>{c.label}</span>
                <span style={{ display: 'block', fontSize: 15 }}>{c.value}</span>
              </span>
            </div>
          ))}
        </div>
        <div style={{ flex: '1 1 440px', minWidth: 0, background: C.green, color: C.white, borderRadius: 8, padding: 28, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
          <h2 style={{ ...h2Style(24), color: C.white }}>{t.closingHeading}</h2>
          <p style={{ color: '#cfe3d9', margin: 0, fontSize: 15.5 }}>{t.closingSub}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
            <Link href="/manage" style={btnStyle('light')}>{t.closingCta1}</Link>
            <Link href="/contact" style={{ ...btnStyle('ghost'), background: 'transparent', color: C.white, borderColor: 'rgba(255,255,255,.5)' }}>{t.closingCta2}</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
