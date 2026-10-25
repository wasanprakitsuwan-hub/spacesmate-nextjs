/**
 * The "rent near a place" landing page, either locale. Data and wording come
 * from loadRentPage in lib/rent-pages; this file is layout only, and matches
 * the area page's look so the two families read as one site.
 */
// Link here is LocaleLink: write the Thai path, the reader's language is kept.
import Link from '@/components/ui/LocaleLink'
import { ItemListLd, BreadcrumbLd, FaqLd } from '@/components/seo/JsonLd'
import { AREA_CONTENT } from '@/lib/area-content'
import { distanceLabel } from '@/lib/search-match'
import { SITE, TYPE_NAME, foldedAreaFor, type RentView, type Locale, type RentType } from '@/lib/rent-pages'

const T = {
  th: {
    home: 'หน้าแรก', homeUrl: `${SITE}/`,
    search: 'ค้นหาที่พัก', searchUrl: `${SITE}/search`,
    rentBase: `${SITE}/rent`,
    count: (n: number) => `${n} ประกาศ`,
    from: (n: number) => `เริ่มต้น ฿${n.toLocaleString('en-US')}/เดือน`,
    perMonth: (n: number) => `฿${n.toLocaleString('en-US')}/เดือน`,
    away: (d: string) => `ห่าง ${d}`,
    beds: (n: number) => `${n} ห้องนอน`,
    sqm: (n: number) => `${n} ตร.ม.`,
    empty: 'ยังไม่มีประกาศในระยะนี้',
    searchWider: 'ค้นหาด้วยระยะที่กว้างขึ้น',
    whyRent: 'ทำไมถึงนิยมเช่าในย่านนี้?',
    about: 'ข้อมูลเพิ่มเติมเกี่ยวกับทำเลนี้',
    faq: 'คำถามที่พบบ่อย',
    nearby: 'ทำเลใกล้เคียง',
    ownerTitle: 'มีทรัพย์สินในย่านนี้?',
    ownerBody: 'ลงประกาศหรือฝากบริหารกับ SpacesMate เข้าถึงผู้เช่าที่กำลังมองหาในย่านนี้',
    listCta: 'ลงประกาศ ฿299',
    manageCta: 'ฝากบริหาร A–Z',
  },
  en: {
    home: 'Home', homeUrl: `${SITE}/en`,
    search: 'Search', searchUrl: `${SITE}/en/search`,
    rentBase: `${SITE}/en/rent`,
    count: (n: number) => `${n} listing${n === 1 ? '' : 's'}`,
    from: (n: number) => `From ฿${n.toLocaleString('en-US')}/mo`,
    perMonth: (n: number) => `฿${n.toLocaleString('en-US')}/mo`,
    away: (d: string) => `${d} away`,
    beds: (n: number) => `${n} bed${n === 1 ? '' : 's'}`,
    sqm: (n: number) => `${n} m²`,
    empty: 'Nothing listed within this radius yet',
    searchWider: 'Search a wider radius',
    whyRent: 'Why rent in this area?',
    about: 'About this area',
    faq: 'Frequently asked questions',
    nearby: 'Nearby places',
    ownerTitle: 'Own a property here?',
    ownerBody: 'List or manage your property with SpacesMate and reach renters looking in this area.',
    listCta: 'List your property ฿299',
    manageCta: 'Full management A–Z',
  },
} as const

/** /search pre-set to this place, for the empty state. Not a canonical page. */
function searchHref(view: RentView): string {
  const q = view.place.kind === 'station' ? `station=${view.place.id}` : `landmark=${encodeURIComponent(view.place.id)}`
  return `/search?${q}&r=5`
}

export default function RentPageBody({ view, locale }: { view: RentView; locale: Locale }) {
  const t = T[locale]
  const pageUrl = `${t.rentBase}/${encodeURI(view.slug)}`
  const folded = foldedAreaFor(view)
  const content = folded ? AREA_CONTENT[folded] : undefined
  const highlights = locale === 'en' ? content?.highlights_en : content?.highlights_th
  const body = locale === 'en' ? content?.body_en : content?.body_th
  const faq = [...view.faq, ...((locale === 'en' ? content?.faq_en : content?.faq_th) ?? [])]

  return (
    <div className="bg-white min-h-screen">
      <ItemListLd
        name={view.title}
        items={view.listings.map(l => ({
          url: `${SITE}${locale === 'en' ? '/en' : ''}/property/${encodeURI(l.slug)}`,
          name: (locale === 'en' && l.title_en) || l.title_th,
        }))}
      />
      <BreadcrumbLd trail={[
        { name: t.home, url: t.homeUrl },
        { name: t.search, url: t.searchUrl },
        { name: view.title, url: pageUrl },
      ]} />
      {faq.length > 0 && <FaqLd qa={faq} />}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#02402e,#048c73)', padding: '48px 24px 52px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: 'rgba(255,255,255,0.6)', fontSize: 13, flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{t.home}</Link>
            <span>/</span>
            <Link href="/search" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{t.search}</Link>
            <span>/</span>
            <span style={{ color: '#fff' }}>{view.placeLabel}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(22px,3.2vw,38px)', fontWeight: 700, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.3px' }}>
            {view.title}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, margin: '0 0 20px', fontWeight: 300, maxWidth: 760, lineHeight: 1.7 }}>
            {view.intro}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 13, fontWeight: 500, padding: '7px 16px', borderRadius: 20 }}>
              {t.count(view.listings.length)}
            </span>
            {view.priceFrom && (
              <span style={{ background: 'rgba(217,127,17,0.9)', color: '#fff', fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 20 }}>
                {t.from(view.priceFrom)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 72px' }}>

        {/* Property type chips — each a page of its own */}
        {view.typeLinks.length > 1 && (
          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
            {view.typeLinks.map(l => {
              const on = l.type === view.type
              return (
                <Link key={l.path} href={l.path} aria-current={on ? 'page' : undefined}
                  style={{ fontSize: 13.5, fontWeight: 600, padding: '8px 16px', borderRadius: 20, textDecoration: 'none', border: '1px solid', borderColor: on ? '#02402e' : '#dfe7e3', background: on ? '#02402e' : '#fff', color: on ? '#fff' : '#02402e' }}>
                  {l.label} <span style={{ opacity: 0.7, fontWeight: 500 }}>{l.count}</span>
                </Link>
              )
            })}
          </nav>
        )}

        {/* Listings */}
        {view.listings.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 48 }} className="sm-rent-grid">
            {view.listings.map(l => {
              const img = Array.isArray(l.images) && l.images.length ? l.images[0] : null
              const title = (locale === 'en' && l.title_en) || l.title_th
              const type = TYPE_NAME[locale][l.property_type as RentType] ?? l.property_type
              return (
                <Link key={l.slug} href={`/property/${l.slug}`} className="sm-rent-card"
                  style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', display: 'block', textDecoration: 'none', boxShadow: '0 6px 20px -10px rgba(2,64,46,0.10)', transition: 'all .25s' }}>
                  <div style={{ height: 160, background: 'linear-gradient(135deg,#02402e,#048c73)', position: 'relative', overflow: 'hidden' }}>
                    {img && <img src={img} alt={title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    <span style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 11, color: '#fff', background: 'rgba(0,0,0,0.32)', padding: '3px 9px', borderRadius: 6 }}>{type}</span>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <p style={{ color: '#048c73', fontSize: 12, margin: '0 0 4px', fontWeight: 500 }}>
                      {t.away(distanceLabel(l.km, locale))}{l.district ? ` · ${l.district}` : ''}
                    </p>
                    <h2 style={{ fontSize: 14, fontWeight: 600, color: '#231f20', margin: '0 0 6px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{title}</h2>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px' }}>
                      {[l.bedrooms ? t.beds(l.bedrooms) : null, l.area_sqm ? t.sqm(l.area_sqm) : null].filter(Boolean).join(' · ')}
                    </p>
                    <span style={{ fontSize: 15.5, fontWeight: 700, color: '#d97f11' }}>{t.perMonth(l.price_from)}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div style={{ padding: '48px 24px', textAlign: 'center', background: '#f7f9f8', borderRadius: 20, marginBottom: 48 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 18px' }}>{t.empty}</h2>
            <Link href={searchHref(view)} style={{ background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 14, padding: '12px 28px', borderRadius: 24, textDecoration: 'none', display: 'inline-block' }}>
              {t.searchWider}
            </Link>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, marginBottom: 48 }} className="sm-rent-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Hand-written text carried over from the /area page this one replaced */}
            {highlights && highlights.length > 0 && (
              <section style={{ background: '#f7f9f8', borderRadius: 20, padding: '24px 28px' }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#02402e', margin: '0 0 14px' }}>{t.whyRent}</h2>
                <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {highlights.map((h, i) => <li key={i} style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{h}</li>)}
                </ul>
              </section>
            )}
            {body && body.length > 0 && (
              <section style={{ border: '1px solid #eef0ef', borderRadius: 20, padding: '24px 28px' }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#02402e', margin: '0 0 12px' }}>{t.about}</h2>
                {body.map((p, i) => <p key={i} style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.85, margin: i < body.length - 1 ? '0 0 14px' : 0, fontWeight: 300 }}>{p}</p>)}
              </section>
            )}
            {faq.length > 0 && (
              <section style={{ background: '#f7f9f8', borderRadius: 20, padding: '24px 28px' }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#02402e', margin: '0 0 16px' }}>{t.faq}</h2>
                {faq.map((f, i) => (
                  <div key={i} style={{ marginBottom: i < faq.length - 1 ? 18 : 0 }}>
                    <h3 style={{ fontSize: 14.5, fontWeight: 600, color: '#231f20', margin: '0 0 6px' }}>{f.q}</h3>
                    <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0, fontWeight: 300 }}>{f.a}</p>
                  </div>
                ))}
              </section>
            )}
          </div>

          <aside style={{ background: '#02402e', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 14, alignSelf: 'start' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>{t.ownerTitle}</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6, fontWeight: 300 }}>{t.ownerBody}</p>
            <Link href="/list-your-property" style={{ background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 13.5, padding: '12px 0', borderRadius: 22, textAlign: 'center', textDecoration: 'none' }}>{t.listCta}</Link>
            <Link href="/manage" style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500, fontSize: 13, padding: '10px 0', borderRadius: 22, textAlign: 'center', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)' }}>{t.manageCta}</Link>
          </aside>
        </div>

        {view.nearby.length > 0 && (
          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 16px' }}>{t.nearby}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }} className="sm-rent-near">
              {view.nearby.map(n => (
                <Link key={n.path} href={n.path} className="sm-rent-nearlink"
                  style={{ padding: '14px 16px', background: '#f7f9f8', border: '1px solid #eef0ef', borderRadius: 14, textDecoration: 'none', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: '#02402e' }}>{n.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#048c73' }}>{n.count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .sm-rent-grid { grid-template-columns: repeat(2,1fr) !important; }
          .sm-rent-layout { grid-template-columns: 1fr !important; }
          .sm-rent-near { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 600px) {
          .sm-rent-grid, .sm-rent-near { grid-template-columns: 1fr !important; }
        }
        .sm-rent-card:hover { box-shadow: 0 16px 34px -12px rgba(2,64,46,0.18) !important; transform: translateY(-4px); }
        .sm-rent-nearlink:hover { border-color: #048c73 !important; background: #eaf6f1 !important; }
      `}</style>
    </div>
  )
}
