'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { properties, Property } from '@/lib/property-data'

const TYPE_LABELS: Record<string, string> = {
  Apartment: 'อพาร์ทเม้นท์', Condo: 'คอนโด', Office: 'ออฟฟิศ', 'Co-Working': 'Co-space',
}
const GRADS: Record<string, string> = {
  Apartment: 'linear-gradient(135deg,#02402e,#036b56)',
  Condo:     'linear-gradient(135deg,#036b56,#048c73)',
  Office:    'linear-gradient(135deg,#4a1d1d,#8b3a3a)',
  default:   'linear-gradient(135deg,#02402e,#048c73)',
}

// DB rental_term → price suffix
const TERM_SUFFIX: Record<string, string> = {
  daily: '/วัน', '1_month': '/เดือน', '3_months': '/เดือน',
  '6_months': '/เดือน', '12_months': '/เดือน',
}
const DB_TYPE_MAP: Record<string, Property['propertyType']> = {
  condo: 'Condo', apartment: 'Apartment', house: 'Apartment',
  office: 'Office', coworking: 'Co-Working',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptDbListing(l: any): Property {
  const suffix = TERM_SUFFIX[l.rental_term] ?? '/เดือน'
  return {
    id: 0,
    slug: l.slug,
    title: l.title_th || l.title_en || 'ไม่ระบุชื่อ',
    excerpt: l.description_th || '',
    priceMin: l.price_from || 0,
    priceDisplay: l.price_from
      ? `฿${Number(l.price_from).toLocaleString('en-US')}${suffix}`
      : 'สอบถามราคา',
    bedrooms: l.bedrooms || 0,
    bathrooms: l.bathrooms || 0,
    size: l.area_sqm ? String(l.area_sqm) : '',
    address: l.address_th || '',
    neighborhood: l.district || l.province || 'กรุงเทพมหานคร',
    lat: l.lat ? String(l.lat) : '',
    lng: l.lng ? String(l.lng) : '',
    image: '',
    propertyType: DB_TYPE_MAP[l.property_type] ?? 'Condo',
    listingType: 'Rent',
    amenities: l.amenities || [],
    featured: false,
    date: l.created_at || '',
  }
}

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function FeaturedListings() {
  // SSR-safe: start with static slice, then merge DB + shuffle on mount
  const [displayed, setDisplayed] = useState<Property[]>(properties.slice(0, 6))

  useEffect(() => {
    // Fetch DB listings and merge with static for full pool
    fetch('/api/listings/public')
      .then(r => r.json())
      .then((d: { listings?: unknown[] }) => {
        const dbListings = (d.listings ?? []).map(adaptDbListing)
        const all = [...properties, ...dbListings]
        setDisplayed(shuffle(all).slice(0, 6))
      })
      .catch(() => {
        // Fallback to static only on error
        setDisplayed(shuffle(properties).slice(0, 6))
      })
  }, [])

  return (
    <section style={{ background: '#f7f9f8', padding: '56px 0' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 600, margin: '0 0 6px', letterSpacing: '-0.4px', color: '#02402e' }}>ประกาศที่พักล่าสุด</h2>
            <p style={{ color: '#64748b', fontSize: 15, margin: 0, fontWeight: 300 }}>คอนโดและอพาร์ทเม้นท์ให้เช่าในกรุงเทพฯ — สุ่มแสดงใหม่ทุกครั้ง</p>
          </div>
          <Link href="/search" style={{ color: '#048c73', fontWeight: 600, fontSize: 14.5, textDecoration: 'none' }}>
            ดูประกาศทั้งหมด →
          </Link>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }} className="sm-feat-grid">
          {displayed.map((p) => {
            const bedroomLabel = p.bedrooms === 0 ? 'สตูดิโอ' : `${p.bedrooms} ห้องนอน`
            const grad = GRADS[p.propertyType] || GRADS.default
            return (
              <Link key={p.slug} href={`/property/${p.slug}`} className="sm-feat-card"
                style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', display: 'block', textDecoration: 'none', transition: 'all .25s', boxShadow: '0 6px 20px -10px rgba(2,64,46,0.10)' }}>
                {/* Image */}
                <div style={{ height: 185, background: grad, position: 'relative', overflow: 'hidden' }}>
                  {p.image && (
                    <img src={p.image} alt={p.title} loading="lazy" decoding="async"
                      className="sm-feat-img"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' }} />
                  )}
                  <span style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.9)', background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(4px)', padding: '3px 9px', borderRadius: 6 }}>
                    {TYPE_LABELS[p.propertyType] || p.propertyType}
                  </span>
                </div>
                {/* Content */}
                <div style={{ padding: 16 }}>
                  <p style={{ color: '#048c73', fontSize: 12, margin: '0 0 4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>location_on</span>{p.neighborhood}
                  </p>
                  <h3 style={{ fontSize: 14.5, fontWeight: 600, margin: '0 0 10px', lineHeight: 1.35, color: '#231f20', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} className="sm-feat-title">
                    {p.title}
                  </h3>
                  <div style={{ display: 'flex', gap: 10, borderTop: '1px solid #f3f5f4', paddingTop: 10, marginBottom: 10, fontSize: 11, color: '#7a8a85' }}>
                    <span>{bedroomLabel}</span>
                    {p.bathrooms > 0 && <span>{p.bathrooms} ห้องน้ำ</span>}
                    {p.size && <span>{p.size} ตร.ม.</span>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#d97f11' }}>{p.priceDisplay}</span>
                    <span style={{ color: '#048c73', fontSize: 12.5, fontWeight: 600 }}>ดูรายละเอียด →</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link href="/search"
            style={{ display: 'inline-block', background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 14, padding: '13px 28px', borderRadius: 24, textDecoration: 'none' }}>
            ดูประกาศทั้งหมด
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .sm-feat-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 600px) { .sm-feat-grid { grid-template-columns: 1fr !important; } }
        .sm-feat-card:hover {
          box-shadow: 0 16px 34px -12px rgba(2,64,46,0.18) !important;
          transform: translateY(-4px) !important;
        }
        .sm-feat-card:hover .sm-feat-img { transform: scale(1.06) !important; }
        .sm-feat-card:hover .sm-feat-title { color: #02402e !important; }
      `}</style>
    </section>
  )
}
