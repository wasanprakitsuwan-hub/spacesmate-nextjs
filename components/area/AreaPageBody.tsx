/**
 * The area landing page, rendered for either locale.
 *
 * Previously this template existed twice — `app/area/[slug]/page.tsx` and
 * `app/en/area/[slug]/page.tsx` — as two hand-maintained copies. Both route
 * files are now thin wrappers over this component.
 *
 * Everything locale-dependent comes from AREA_T in lib/area-shared, so adding a
 * locale is a data change rather than another copy of the markup.
 */
import Link from 'next/link'
import { ItemListLd, BreadcrumbLd, FaqLd } from '@/components/seo/JsonLd'
import {
  AREA_T, GRADS, TYPE_LABELS, SEARCH_HREF, SEARCH_URL, SITE,
  type AreaView, type Locale,
} from '@/lib/area-shared'

/**
 * `slug` is the raw route param, not `area.slug`. For the data-driven Thai
 * areas the param arrives percent-encoded while the database value is decoded
 * Thai, and the breadcrumb URL and language-switch link have always been built
 * from the param. Using `area.slug` here silently changes those URLs.
 */
export default function AreaPageBody({ view, locale, slug }: { view: AreaView; locale: Locale; slug: string }) {
  const { area, content, areaProps, related } = view
  const t = AREA_T[locale]
  const types = TYPE_LABELS[locale]

  // The page shows its own language prominently and the other as a subtitle.
  const labelSelf = locale === 'th' ? area.label_th : area.label_en
  const labelOther = locale === 'th' ? area.label_en : area.label_th
  const headline = locale === 'th' ? content?.headline_th : content?.headline_en
  const highlights = locale === 'th' ? content?.highlights_th : content?.highlights_en
  const body = locale === 'th' ? content?.body_th : content?.body_en
  const faq = locale === 'th' ? content?.faq_th : content?.faq_en
  const priceSelf = locale === 'th' ? content?.price_from_th : content?.price_from_en
  const priceOther = locale === 'th' ? content?.price_from_en : content?.price_from_th

  const areaUrl = `${SITE}${t.areaPath}/${slug}`

  return (
    <div className="bg-white min-h-screen">

      <ItemListLd
        name={labelSelf}
        items={areaProps.map(ap => ({
          url: `${SITE}/property/${ap.slug}`,
          name: ap.title_th,
        }))}
      />
      <BreadcrumbLd
        trail={[
          { name: t.home, url: t.homeUrl },
          { name: t.search, url: SEARCH_URL },
          { name: labelSelf, url: areaUrl },
        ]}
      />
      {/* content is undefined for data-driven area pages — guard every use of it */}
      {faq && faq.length > 0 && <FaqLd qa={faq} />}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#02402e,#048c73)', padding: '52px 24px 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
            <Link href={t.homeHref} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{t.home}</Link>
            <span>/</span>
            <Link href={SEARCH_HREF} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{t.searchNav}</Link>
            <span>/</span>
            <span style={{ color: '#fff' }}>{labelSelf}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(22px,3.2vw,40px)', fontWeight: 700, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.3px' }}>
            {headline || labelSelf}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, margin: '0 0 20px', fontWeight: 300 }}>
            {labelOther} — {t.subtitleSuffix}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 13, fontWeight: 500, padding: '7px 16px', borderRadius: 20, backdropFilter: 'blur(6px)' }}>
              {areaProps.length > 0 ? t.listingsCount(areaProps.length) : t.popularArea}
            </span>
            {priceSelf && (
              <span style={{ display: 'inline-block', background: 'rgba(217,127,17,0.85)', color: '#fff', fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 20 }}>
                {priceSelf}
              </span>
            )}
            <Link href={`${t.switchPath}/${slug}`} style={{ display: 'inline-block', background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 500, padding: '7px 14px', borderRadius: 20, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}>
              {t.switchLabel}
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 72px' }}>

        {/* Listings */}
        {areaProps.length > 0 ? (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#02402e', margin: '0 0 24px' }}>
              {t.listingsHeading(labelSelf)}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 48 }} className="sm-area-grid">
              {areaProps.map(p => {
                const grad = GRADS[p.property_type] || GRADS.default
                const heroImg = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null
                return (
                  <Link key={p.slug} href={`/property/${p.slug}`}
                    style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', display: 'block', textDecoration: 'none', transition: 'all .25s', boxShadow: '0 6px 20px -10px rgba(2,64,46,0.10)' }}
                    className="sm-area-card">
                    <div style={{ height: 160, background: grad, position: 'relative', overflow: 'hidden' }}>
                      {heroImg && <img src={heroImg} alt={p.title_th} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' }} className="sm-area-img" />}
                      <span style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 11, color: 'rgba(255,255,255,0.9)', background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(4px)', padding: '3px 9px', borderRadius: 6 }}>
                        {types[p.property_type] || p.property_type}
                      </span>
                    </div>
                    <div style={{ padding: '14px 16px' }}>
                      <p style={{ color: '#048c73', fontSize: 12, margin: '0 0 4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}><span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>location_on</span>{p.district}</p>
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#231f20', margin: '0 0 8px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title_th}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 15.5, fontWeight: 700, color: '#d97f11' }}>{t.perPrice(p.price_from)}</span>
                        <span style={{ color: '#048c73', fontSize: 12, fontWeight: 600 }}>{t.viewDetails}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        ) : (
          <div style={{ padding: '56px 24px', textAlign: 'center', background: '#f7f9f8', borderRadius: 20, marginBottom: 48 }}>
            <p style={{ margin: '0 0 12px' }}><span className="msym" style={{ fontSize: 32, color: '#94a3b8', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>search</span></p>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 8px' }}>{t.noListingsTitle}</h2>
            <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px', fontWeight: 300 }}>
              {t.noListingsBody(labelSelf)}
            </p>
            <Link href={SEARCH_HREF} style={{ background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 14, padding: '12px 28px', borderRadius: 24, textDecoration: 'none', display: 'inline-block' }}>
              {t.browseAll}
            </Link>
          </div>
        )}

        {/* Area info — rich content block */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, marginBottom: 48 }} className="sm-area-layout">
          <div>
            {content ? (
              <>
                {/* Highlights */}
                <div style={{ background: '#f7f9f8', borderRadius: 20, padding: '24px 28px', marginBottom: 20 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: '#02402e', margin: '0 0 16px' }}>
                    {t.whyRent}
                  </h2>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(highlights ?? []).map((h, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                        <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: '#e6f4ef', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                          <span className="msym" style={{ fontSize: 13, color: '#048c73', fontVariationSettings: "'FILL' 1" }}>check</span>
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Body text */}
                <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 20, padding: '24px 28px', marginBottom: 20 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: '#02402e', margin: '0 0 14px' }}>
                    {t.aboutArea}
                  </h2>
                  {(body ?? []).map((para, i) => (
                    <p key={i} style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.85, margin: i < (body ?? []).length - 1 ? '0 0 14px' : 0, fontWeight: 300 }}>
                      {para}
                    </p>
                  ))}
                </div>

                {/* FAQ */}
                {faq && faq.length > 0 && (
                  <div style={{ background: '#f7f9f8', borderRadius: 20, padding: '24px 28px' }}>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: '#02402e', margin: '0 0 16px' }}>{t.faqHeading}</h2>
                    {faq.map((item, i) => (
                      <div key={i} style={{ marginBottom: i < faq.length - 1 ? 18 : 0 }}>
                        <p style={{ fontSize: 14.5, fontWeight: 600, color: '#231f20', margin: '0 0 6px' }}>{item.q}</p>
                        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0, fontWeight: 300 }}>{item.a}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Fallback generic content */
              <div style={{ background: '#f7f9f8', borderRadius: 20, padding: '28px' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 14px' }}>
                  {t.whyRentFallback(labelSelf)}
                </h2>
                {locale === 'th' ? (
                  <>
                    <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.8, margin: '0 0 16px', fontWeight: 300 }}>
                      ทำเลนี้เป็นหนึ่งในทำเลที่มีความต้องการสูงในกรุงเทพมหานคร
                      {area.station && ` สถานี ${area.station} เชื่อมต่อระบบขนส่งสาธารณะอย่างสะดวก`}
                      {area.district && ` ย่าน${area.district} มีสิ่งอำนวยความสะดวกครบครัน ทั้งห้างสรรพสินค้า ร้านอาหาร และสถานที่ทำงาน`}
                    </p>
                    <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.8, margin: 0, fontWeight: 300 }}>
                      SpacesMate คัดสรรประกาศที่ผ่านการตรวจสอบแล้วสำหรับทำเลนี้
                      เพื่อให้คุณพบที่พักที่ตรงความต้องการได้อย่างรวดเร็ว
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.8, margin: '0 0 16px', fontWeight: 300 }}>
                      This is one of the most in-demand rental locations in Bangkok
                      {area.station && ` — ${area.station} station offers easy public transit access`}
                      {area.district && ` and the ${area.district} district has everything you need: malls, restaurants, and workplaces`}.
                    </p>
                    <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.8, margin: 0, fontWeight: 300 }}>
                      SpacesMate lists only verified rentals in this area so you can find the right property quickly.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Owner CTA sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#02402e', borderRadius: 20, padding: '28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>{t.ownerTitle}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6, fontWeight: 300 }}>
                {t.ownerBody}
              </p>
              <Link href="/submit" style={{ background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 13.5, padding: '12px 0', borderRadius: 22, textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                {t.listCta}
              </Link>
              <Link href="/manage" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, fontSize: 13, padding: '10px 0', borderRadius: 22, textAlign: 'center', textDecoration: 'none', display: 'block', border: '1px solid rgba(255,255,255,0.25)' }}>
                {t.manageCta}
              </Link>
            </div>
            {content && (
              <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 20, padding: '20px 22px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px' }}>{t.pricingLabel}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#d97f11', margin: '0 0 4px' }}>{priceSelf}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{priceOther}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related areas */}
        {related.length > 0 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 16px' }}>{t.relatedHeading}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }} className="sm-related4">
              {related.map(r => (
                <Link key={r.slug} href={`${t.areaPath}/${encodeURI(r.slug)}`}
                  style={{ padding: '14px 16px', background: '#f7f9f8', border: '1px solid #eef0ef', borderRadius: 14, textDecoration: 'none', display: 'block', transition: 'all .2s' }}
                  className="sm-area-related">
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: '#02402e', margin: '0 0 4px' }}>
                    {locale === 'th' ? r.label_th : r.label_en}
                  </p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                    {locale === 'th' ? r.label_en : r.label_th}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .sm-area-grid { }
        @media (max-width: 900px) {
          .sm-area-grid { grid-template-columns: repeat(2,1fr) !important; }
          .sm-area-layout { grid-template-columns: 1fr !important; }
          .sm-related4 { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 600px) {
          .sm-area-grid { grid-template-columns: 1fr !important; }
          .sm-related4 { grid-template-columns: 1fr !important; }
        }
        .sm-area-card:hover { box-shadow: 0 16px 34px -12px rgba(2,64,46,0.18) !important; transform: translateY(-4px) !important; }
        .sm-area-card:hover .sm-area-img { transform: scale(1.06) !important; }
        .sm-area-related:hover { border-color: #048c73 !important; background: #eaf6f1 !important; }
      `}</style>
    </div>
  )
}
