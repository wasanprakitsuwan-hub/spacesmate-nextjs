import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AREA_KEYWORDS } from '@/lib/constants'
import { properties } from '@/lib/property-data'
import { AREA_CONTENT } from '@/lib/area-content'

interface Props { params: { slug: string } }

// Same area matching as Thai page
const AREA_MATCH: Record<string, { type: string; terms: string[] }> = {
  'condo-rent-bts-asok':            { type: 'Condo',      terms: ['asok','อโศก','sukhumvit 21','สุขุมวิท 21'] },
  'apartment-rent-sukhumvit':       { type: 'Apartment',  terms: ['sukhumvit','สุขุมวิท'] },
  'condo-rent-bts-ekkamai':         { type: 'Condo',      terms: ['ekkamai','เอกมัย'] },
  'house-rent-lat-phrao':           { type: 'Apartment',  terms: ['lat phrao','ลาดพร้าว'] },
  'condo-rent-bts-thonglor':        { type: 'Condo',      terms: ['thonglor','ทองหล่อ','thong lor'] },
  'office-rent-silom':              { type: 'Office',     terms: ['silom','สีลม'] },
  'condo-rent-bts-on-nut':          { type: 'Condo',      terms: ['on nut','อ่อนนุช','on-nut'] },
  'apartment-rent-ratchada':        { type: 'Apartment',  terms: ['ratchada','รัชดา','ratchadaphisek'] },
  'house-rent-rama-9':              { type: 'Apartment',  terms: ['rama 9','พระราม 9','rama9'] },
  'condo-rent-mrt-lat-phrao':       { type: 'Condo',      terms: ['lat phrao','ลาดพร้าว'] },
  'coworking-rent-sukhumvit':       { type: 'Co-Working', terms: ['sukhumvit','สุขุมวิท'] },
  'condo-rent-bts-saphan-kwai':     { type: 'Condo',      terms: ['saphan kwai','สะพานควาย'] },
  'condo-rent-bts-ari':             { type: 'Condo',      terms: ['ari','อารีย์','aree'] },
  'apartment-rent-bang-na':         { type: 'Apartment',  terms: ['bang na','บางนา','bangna'] },
  'condo-rent-mrt-phahon-yothin':   { type: 'Condo',      terms: ['phahon','พหลโยธิน','phahonyothin'] },
  'office-rent-sathorn':            { type: 'Office',     terms: ['sathorn','สาทร'] },
}

export async function generateStaticParams() {
  return AREA_KEYWORDS.map(a => ({ slug: a.slug }))
}
export const dynamicParams = true

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const area = AREA_KEYWORDS.find(a => a.slug === params.slug)
  if (!area) return { title: 'Page not found | SpacesMate' }
  const content = AREA_CONTENT[params.slug]
  const title = content ? `${content.headline_en} | SpacesMate` : `${area.label_en} | SpacesMate`
  const description = content
    ? content.body_en[0].slice(0, 155)
    : `${area.label_en} in Bangkok — browse verified rentals and pricing on SpacesMate`
  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    alternates: { canonical: `/en/area/${params.slug}`, languages: { 'th': `/area/${params.slug}` } },
  }
}

const TYPE_LABELS: Record<string, string> = {
  Apartment: 'Apartment', Condo: 'Condominium', Office: 'Office Space', 'Co-Working': 'Co-Working Space',
}
const GRADS: Record<string, string> = {
  Apartment: 'linear-gradient(135deg,#02402e,#036b56)',
  Condo:     'linear-gradient(135deg,#036b56,#048c73)',
  Office:    'linear-gradient(135deg,#4a1d1d,#8b3a3a)',
  'Co-Working': 'linear-gradient(135deg,#02402e,#048c73)',
  default:   'linear-gradient(135deg,#02402e,#048c73)',
}

export default function AreaPageEn({ params }: Props) {
  const area = AREA_KEYWORDS.find(a => a.slug === params.slug)
  if (!area) notFound()

  const content = AREA_CONTENT[params.slug]
  const match = AREA_MATCH[params.slug]
  const areaProps = match
    ? properties.filter(p => {
        if (p.propertyType !== match.type) return false
        const h = [p.neighborhood, p.address].join(' ').toLowerCase()
        return match.terms.some(t => h.includes(t.toLowerCase()))
      })
    : []

  const related = AREA_KEYWORDS
    .filter(a => a.slug !== params.slug && a.property_type === area.property_type)
    .slice(0, 4)

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#02402e,#048c73)', padding: '52px 24px 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
            <Link href="/en" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link href="/search" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Search Rentals</Link>
            <span>/</span>
            <span style={{ color: '#fff' }}>{area.label_en}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(22px,3.2vw,40px)', fontWeight: 700, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.3px' }}>
            {content ? content.headline_en : area.label_en}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, margin: '0 0 20px', fontWeight: 300 }}>
            {area.label_th} — Bangkok, Thailand
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 13, fontWeight: 500, padding: '7px 16px', borderRadius: 20, backdropFilter: 'blur(6px)' }}>
              {areaProps.length > 0 ? `${areaProps.length} listings` : 'Popular Area'}
            </span>
            {content && (
              <span style={{ display: 'inline-block', background: 'rgba(217,127,17,0.85)', color: '#fff', fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 20 }}>
                {content.price_from_en}
              </span>
            )}
            <Link href={`/area/${params.slug}`} style={{ display: 'inline-block', background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 500, padding: '7px 14px', borderRadius: 20, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}>
              🇹🇭 ภาษาไทย
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 72px' }}>

        {/* Listings */}
        {areaProps.length > 0 ? (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#02402e', margin: '0 0 24px' }}>
              Listings in {area.label_en}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 48 }} className="sm-area-grid">
              {areaProps.map(p => {
                const grad = GRADS[p.propertyType] || GRADS.default
                return (
                  <Link key={p.slug} href={`/property/${p.slug}`}
                    style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', display: 'block', textDecoration: 'none', transition: 'all .25s', boxShadow: '0 6px 20px -10px rgba(2,64,46,0.10)' }}
                    className="sm-area-card">
                    <div style={{ height: 160, background: grad, position: 'relative', overflow: 'hidden' }}>
                      {p.image && <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' }} className="sm-area-img" />}
                      <span style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 11, color: 'rgba(255,255,255,0.9)', background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(4px)', padding: '3px 9px', borderRadius: 6 }}>
                        {TYPE_LABELS[p.propertyType] || p.propertyType}
                      </span>
                    </div>
                    <div style={{ padding: '14px 16px' }}>
                      <p style={{ color: '#048c73', fontSize: 12, margin: '0 0 4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}><span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>location_on</span>{p.neighborhood}</p>
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#231f20', margin: '0 0 8px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 15.5, fontWeight: 700, color: '#d97f11' }}>{p.priceDisplay}</span>
                        <span style={{ color: '#048c73', fontSize: 12, fontWeight: 600 }}>View details →</span>
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
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 8px' }}>No listings yet in this area</h2>
            <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px', fontWeight: 300 }}>
              {area.label_en} is growing — explore nearby areas in the meantime.
            </p>
            <Link href="/search" style={{ background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 14, padding: '12px 28px', borderRadius: 24, textDecoration: 'none', display: 'inline-block' }}>
              Browse all listings
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
                    Why rent in this area?
                  </h2>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {content.highlights_en.map((h, i) => (
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
                    About this area
                  </h2>
                  {content.body_en.map((para, i) => (
                    <p key={i} style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.85, margin: i < content.body_en.length - 1 ? '0 0 14px' : 0, fontWeight: 300 }}>
                      {para}
                    </p>
                  ))}
                </div>

                {/* FAQ */}
                {content.faq_en.length > 0 && (
                  <div style={{ background: '#f7f9f8', borderRadius: 20, padding: '24px 28px' }}>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: '#02402e', margin: '0 0 16px' }}>Frequently Asked Questions</h2>
                    {content.faq_en.map((faq, i) => (
                      <div key={i} style={{ marginBottom: i < content.faq_en.length - 1 ? 18 : 0 }}>
                        <p style={{ fontSize: 14.5, fontWeight: 600, color: '#231f20', margin: '0 0 6px' }}>{faq.q}</p>
                        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0, fontWeight: 300 }}>{faq.a}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ background: '#f7f9f8', borderRadius: 20, padding: '28px' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 14px' }}>
                  Why rent in {area.label_en}?
                </h2>
                <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.8, margin: '0 0 16px', fontWeight: 300 }}>
                  This is one of the most in-demand rental locations in Bangkok
                  {area.station && ` — ${area.station} station offers easy public transit access`}
                  {area.district && ` and the ${area.district} district has everything you need: malls, restaurants, and workplaces`}.
                </p>
                <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.8, margin: 0, fontWeight: 300 }}>
                  SpacesMate lists only verified rentals in this area so you can find the right property quickly.
                </p>
              </div>
            )}
          </div>

          {/* Owner CTA sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#02402e', borderRadius: 20, padding: '28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>Own a property here?</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6, fontWeight: 300 }}>
                List or manage your property with SpacesMate — reach thousands of renters.
              </p>
              <Link href="/submit" style={{ background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 13.5, padding: '12px 0', borderRadius: 22, textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                List your property ฿299
              </Link>
              <Link href="/manage" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, fontSize: 13, padding: '10px 0', borderRadius: 22, textAlign: 'center', textDecoration: 'none', display: 'block', border: '1px solid rgba(255,255,255,0.25)' }}>
                Full management A–Z
              </Link>
            </div>
            {content && (
              <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 20, padding: '20px 22px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px' }}>Rental pricing here</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#d97f11', margin: '0 0 4px' }}>{content.price_from_en}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{content.price_from_th}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related areas */}
        {related.length > 0 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 16px' }}>Explore nearby areas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }} className="sm-related4">
              {related.map(r => (
                <Link key={r.slug} href={`/en/area/${r.slug}`}
                  style={{ padding: '14px 16px', background: '#f7f9f8', border: '1px solid #eef0ef', borderRadius: 14, textDecoration: 'none', display: 'block', transition: 'all .2s' }}
                  className="sm-area-related">
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: '#02402e', margin: '0 0 4px' }}>{r.label_en}</p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{r.label_th}</p>
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
