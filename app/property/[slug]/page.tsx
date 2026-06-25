import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { properties, getPropertyBySlug, fetchPropertyContent, type Property } from '@/lib/property-data'
import { createServerClient } from '@/lib/supabase'
import PropertyGallery from '@/components/property/PropertyGallery'

interface Props {
  params: { slug: string }
}

// Static slugs rendered at build time; all other slugs resolved at runtime
export async function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }))
}

// Allow runtime resolution of slugs not in generateStaticParams (e.g. DB listings)
export const dynamicParams = true

// ── DB listing helpers ──────────────────────────────────────────────────────
const DB_TYPE_MAP: Record<string, Property['propertyType']> = {
  condo: 'Condo', apartment: 'Apartment', house: 'Apartment',
  office: 'Office', coworking: 'Co-Working',
}
const TERM_SUFFIX: Record<string, string> = {
  daily: '/วัน', '1_month': '/เดือน', '3_months': '/เดือน',
  '6_months': '/เดือน', '12_months': '/เดือน',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getDbPropertyRaw(slug: string): Promise<any | null> {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('slug', slug)
      .eq('listing_status', 'active')
      .single()
    return data ?? null
  } catch {
    return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeDbListing(raw: any): Property {
  const suffix = TERM_SUFFIX[raw.rental_term] ?? '/เดือน'
  return {
    id: 0,
    slug: raw.slug,
    title: raw.title_th || raw.title_en || 'ไม่ระบุชื่อ',
    excerpt: '',
    priceMin: raw.price_from || 0,
    priceDisplay: raw.price_from
      ? `฿${Number(raw.price_from).toLocaleString('en-US')}${suffix}`
      : 'สอบถามราคา',
    bedrooms: raw.bedrooms || 0,
    bathrooms: raw.bathrooms || 0,
    size: raw.area_sqm ? String(raw.area_sqm) : '',
    address: raw.address_th || '',
    neighborhood: raw.district || raw.province || 'กรุงเทพมหานคร',
    lat: raw.lat ? String(raw.lat) : '',
    lng: raw.lng ? String(raw.lng) : '',
    image: '',
    propertyType: DB_TYPE_MAP[raw.property_type] ?? 'Condo',
    listingType: 'Rent',
    amenities: raw.amenities || [],
    featured: false,
    date: raw.created_at || '',
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const staticP = getPropertyBySlug(params.slug)
  if (staticP) {
    return {
      title: `${staticP.title} | SpacesMate`,
      description: staticP.excerpt,
      openGraph: {
        title: staticP.title,
        description: staticP.excerpt,
        images: staticP.image ? [{ url: staticP.image, alt: staticP.title }] : [],
        type: 'website',
      },
    }
  }
  const raw = await getDbPropertyRaw(params.slug)
  if (!raw) return { title: 'ไม่พบประกาศ | SpacesMate' }
  const title = raw.title_th || raw.title_en || 'ประกาศ'
  return {
    title: `${title} | SpacesMate`,
    description: raw.description_th || '',
    openGraph: { title, description: raw.description_th || '', type: 'website' },
  }
}

const TYPE_LABELS: Record<string, string> = {
  Apartment: 'อพาร์ทเม้นท์',
  Condo: 'คอนโดมิเนียม',
  Office: 'ออฟฟิศ',
  'Co-Working': 'โคเวิร์กกิ้ง',
}

export default async function PropertyDetailPage({ params }: Props) {
  // 1. Try static data first (builds fast from property-data.ts)
  const staticP = getPropertyBySlug(params.slug)

  let p: Property
  let content: string | null = null

  if (staticP) {
    p = staticP
    // Fetch WP HTML content at runtime (cached by Next.js)
    content = await fetchPropertyContent(p.id)
  } else {
    // 2. Fall back to Supabase for admin-created / user-submitted listings
    const raw = await getDbPropertyRaw(params.slug)
    if (!raw) notFound()
    p = normalizeDbListing(raw)
    content = raw.description_th || null
  }

  const hasContent = content && !content.includes('เนื้อหาไม่พร้อม') && !content.includes('ไม่พบเนื้อหา')

  // Related properties — same type, exclude current, up to 3
  const related = properties
    .filter((r) => r.slug !== p.slug && r.propertyType === p.propertyType)
    .slice(0, 3)

  const bedroomLabel = p.bedrooms === 0 ? 'สตูดิโอ' : `${p.bedrooms} ห้องนอน`
  const typeLabel = TYPE_LABELS[p.propertyType] || p.propertyType

  return (
    <div className="bg-white min-h-screen">

      {/* Photo gallery — single image falls back to hero-only view */}
      <PropertyGallery
        images={p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : [])}
        title={p.title}
        priceDisplay={p.priceDisplay}
        typeLabel={typeLabel}
        featured={p.featured}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }} className="sm-detaillayout">

          {/* Main content column */}
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
              <Link href="/search" className="hover:text-spacemate-brandDark transition-colors">ค้นหาที่พัก</Link>
              <span>/</span>
              <span className="text-spacemate-brandDark font-medium line-clamp-1">{p.title}</span>
            </div>

            {/* Type + Daily badge */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="inline-block text-xs font-semibold text-spacemate-brandTeal bg-spacemate-bgLight px-3 py-1.5 rounded-full">
                {typeLabel}
              </span>
              {p.listingType === 'Daily' && (
                <span className="inline-block text-xs font-semibold text-white px-3 py-1.5 rounded-full"
                  style={{ background: '#d97f11' }}>เช่ารายวัน</span>
              )}
            </div>

            {/* Title */}
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.3px', color: '#02402e', lineHeight: 1.3 }}>
              {p.title}
            </h1>

            {/* Location */}
            <div className="flex items-center gap-2 mb-7" style={{ color: '#048c73', fontSize: 14, fontWeight: 500 }}>
              <span className="msym" style={{ fontSize: 16 }}>location_on</span>
              <span>{p.neighborhood}</span>
              {p.address && <span style={{ color: '#94a3b8', fontWeight: 400 }}>— {p.address}</span>}
            </div>

            {/* Key specs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12, marginBottom: 28, padding: 16, borderRadius: 16, border: '1px solid #eef0ef', background: '#f7f9f8' }}>
              <div style={{ textAlign: 'center' }}>
                <span className="msym" style={{ fontSize: 24, color: '#048c73', display: 'block', marginBottom: 4 }}>bed</span>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 2px' }}>ห้องนอน</p>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#231f20' }}>{bedroomLabel}</p>
              </div>
              {p.bathrooms > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <span className="msym" style={{ fontSize: 24, color: '#048c73', display: 'block', marginBottom: 4 }}>shower</span>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 2px' }}>ห้องน้ำ</p>
                  <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#231f20' }}>{p.bathrooms} ห้องน้ำ</p>
                </div>
              )}
              {p.size && (
                <div style={{ textAlign: 'center' }}>
                  <span className="msym" style={{ fontSize: 24, color: '#048c73', display: 'block', marginBottom: 4 }}>straighten</span>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 2px' }}>ขนาด</p>
                  <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#231f20' }}>{p.size} ตร.ม.</p>
                </div>
              )}
              <div style={{ textAlign: 'center' }}>
                <span className="msym" style={{ fontSize: 24, color: '#048c73', display: 'block', marginBottom: 4 }}>apartment</span>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 2px' }}>ประเภท</p>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#231f20' }}>{typeLabel}</p>
              </div>
            </div>

            {/* Excerpt */}
            {p.excerpt && (
              <p style={{ color: '#475569', fontSize: 15, lineHeight: 1.75, margin: '0 0 24px', paddingBottom: 24, borderBottom: '1px solid #eef0ef', fontWeight: 300 }}>
                {p.excerpt}
              </p>
            )}

            {/* Full WP content */}
            {hasContent && (
              <div
                className="property-content"
                style={{ color: '#475569', lineHeight: 1.75, fontSize: 15, marginBottom: 32 }}
                dangerouslySetInnerHTML={{ __html: content ?? '' }}
              />
            )}

            {/* Amenities */}
            {p.amenities.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 14px' }}>สิ่งอำนวยความสะดวก</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {p.amenities.map((a) => (
                    <span key={a} style={{ fontSize: 13, padding: '8px 14px', borderRadius: 20, fontWeight: 500, background: '#eaf6f1', color: '#02402e' }}>
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {p.lat && p.lng && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 14px' }}>ทำเลที่ตั้ง</h2>
                <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #eef0ef', boxShadow: '0 4px 16px -8px rgba(2,64,46,0.10)' }}>
                  <iframe
                    title="แผนที่ที่ตั้ง"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${(parseFloat(p.lng) - 0.009).toFixed(6)},${(parseFloat(p.lat) - 0.006).toFixed(6)},${(parseFloat(p.lng) + 0.009).toFixed(6)},${(parseFloat(p.lat) + 0.006).toFixed(6)}&layer=mapnik&marker=${p.lat},${p.lng}`}
                    width="100%"
                    height="240"
                    style={{ border: 'none', display: 'block' }}
                    loading="lazy"
                  />
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10, fontSize: 13, color: '#048c73', fontWeight: 500, textDecoration: 'none' }}
                >
                  <span className="msym" style={{ fontSize: 16 }}>open_in_new</span>
                  เปิดใน Google Maps
                </a>
              </div>
            )}
          </div>

          {/* Sticky sidebar */}
          <aside style={{ position: 'sticky', top: 86 }}>
            <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 20, padding: 22, boxShadow: '0 14px 34px -14px rgba(2,64,46,0.14)' }}>
              <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, margin: '0 0 4px' }}>ราคาเช่า</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: '#d97f11', margin: '0 0 16px', lineHeight: 1.1 }}>{p.priceDisplay}</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0', borderTop: '1px solid #f3f5f4', borderBottom: '1px solid #f3f5f4', marginBottom: 16 }}>
                <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#02402e,#048c73)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>S</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>SpacesMate</p>
                  <p style={{ fontSize: 12, color: '#048c73', fontWeight: 500, margin: 0 }}>ยืนยันตัวตนแล้ว ✓</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <a href="https://line.me/R/ti/p/@spacesmate" target="_blank" rel="noopener noreferrer"
                  style={{ background: '#06C755', color: '#fff', fontWeight: 600, fontSize: 14, padding: '13px 0', borderRadius: 24, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
                  <span className="msym" style={{ fontSize: 18 }}>chat</span>สอบถามผ่าน LINE
                </a>
                <a href="tel:+66621524526"
                  style={{ background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 14, padding: '13px 0', borderRadius: 24, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
                  <span className="msym" style={{ fontSize: 18 }}>call</span>โทร 062-152-4526
                </a>
              </div>

              <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', margin: '14px 0 0' }}>
                SpacesMate ให้บริการฟรี ไม่มีค่าคอมมิชชั่นจากผู้เช่า
              </p>
            </div>

            <Link href="/search"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 14, color: '#048c73', fontSize: 13.5, fontWeight: 500, textDecoration: 'none' }}>
              <span className="msym" style={{ fontSize: 15 }}>arrow_back</span>
              ดูประกาศทั้งหมด
            </Link>
          </aside>
        </div>

        {/* Related properties */}
        {related.length > 0 && (
          <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid #eef0ef' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 20px' }}>ประกาศที่คล้ายกัน</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }} className="sm-relatedgrid">
              {related.map((r) => (
                <Link key={r.slug} href={`/property/${r.slug}`} className="sm-prop-card"
                  style={{ borderRadius: 18, border: '1px solid #eef0ef', overflow: 'hidden', display: 'block', textDecoration: 'none', background: '#fff', transition: 'all .25s', boxShadow: '0 4px 16px -8px rgba(2,64,46,0.10)' }}>
                  <div style={{ height: 140, background: 'linear-gradient(135deg,#02402e,#048c73)', overflow: 'hidden' }}>
                    {r.image && (
                      <img src={r.image} alt={r.title} className="sm-prop-img"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' }} />
                    )}
                  </div>
                  <div style={{ padding: 14 }}>
                    <p style={{ fontSize: 12, color: '#048c73', fontWeight: 500, margin: '0 0 4px' }}>{r.neighborhood}</p>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: '#231f20', margin: '0 0 8px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.title}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#d97f11', margin: 0 }}>{r.priceDisplay}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Owner CTA block */}
        <div style={{ marginTop: 48, padding: 28, borderRadius: 20, color: '#fff', background: 'radial-gradient(120% 160% at 85% 10%, #055c43, #02402e 60%)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
            <span className="msym" style={{ fontSize: 40, color: '#048c73', flexShrink: 0 }}>home_work</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 6px' }}>มีทรัพย์สินอยากปล่อยเช่า?</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: '0 0 16px', fontWeight: 300 }}>
                ให้ SpacesMate ดูแลตั้งแต่หาผู้เช่า ทำสัญญา ไปจนถึงเก็บค่าเช่า — ครบวงจรในที่เดียว
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href="/services"
                  style={{ background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 13.5, padding: '10px 20px', borderRadius: 22, textDecoration: 'none', display: 'inline-block' }}>
                  ดูบริการรับฝากบริหาร
                </Link>
                <Link href="/submit"
                  style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, fontSize: 13.5, padding: '10px 20px', borderRadius: 22, textDecoration: 'none', display: 'inline-block', border: '1px solid rgba(255,255,255,0.2)' }}>
                  ลงประกาศที่พัก
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .sm-detaillayout { grid-template-columns: 1fr !important; }
          .sm-relatedgrid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .sm-relatedgrid { grid-template-columns: 1fr !important; }
        }
        .sm-prop-card:hover {
          box-shadow: 0 16px 34px -12px rgba(2,64,46,0.18) !important;
          transform: translateY(-4px) !important;
        }
        .sm-prop-card:hover .sm-prop-img { transform: scale(1.06) !important; }
        .property-content p { margin-bottom: 1.15rem; }
        .property-content h2 { font-size: 1.2rem; font-weight: 700; color: #02402e; margin: 1.75rem 0 0.7rem; }
        .property-content h3 { font-size: 1rem; font-weight: 600; color: #231f20; margin: 1.4rem 0 0.5rem; }
        .property-content ul, .property-content ol { padding-left: 1.4rem; margin-bottom: 1.15rem; }
        .property-content li { margin-bottom: 0.4rem; }
        .property-content strong, .property-content b { color: #231f20; font-weight: 600; }
        .property-content a { color: #048c73; text-decoration: underline; }
        .property-content img { border-radius: 12px; margin: 1.25rem 0; max-width: 100%; }
        .property-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem; }
        .property-content th { background: #02402e; color: #fff; padding: 10px 14px; text-align: left; }
        .property-content td { padding: 9px 14px; border-bottom: 1px solid #eef0ef; }
        .property-content tr:nth-child(even) td { background: #f7f9f8; }
      `}</style>
    </div>
  )
}
