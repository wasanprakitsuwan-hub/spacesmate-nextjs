import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBuilding, getBuildingsWithListings } from '@/lib/buildings'
import { ItemListLd, BreadcrumbLd } from '@/components/seo/JsonLd'

interface Props { params: { slug: string } }

export const revalidate = 3600

const SITE = 'https://spacesmate.com'

const TYPE_TH: Record<string, string> = {
  condo: 'คอนโด', apartment: 'อพาร์ทเม้นท์', house: 'บ้าน',
  office: 'ออฟฟิศ', coworking: 'โคเวิร์กกิ้งสเปซ',
}

export async function generateStaticParams() {
  const buildings = await getBuildingsWithListings()
  return buildings.map(b => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await getBuilding(params.slug)
  if (!found) return { title: 'ไม่พบอาคาร | SpacesMate' }

  const { building, listings } = found
  const cheapest = listings.reduce((min, l) => (l.price_from && l.price_from < min ? l.price_from : min), Infinity)
  const priceText = Number.isFinite(cheapest) ? ` เริ่มต้น ฿${cheapest.toLocaleString()}/เดือน` : ''

  const title = `${building.nameTh} ให้เช่า — ${building.count} ห้องว่าง | SpacesMate`
  const description =
    `ห้องเช่าใน ${building.nameTh}${building.nameEn ? ` (${building.nameEn})` : ''} ` +
    `รวม ${building.count} ประกาศ${priceText} ดูรูป ราคา และติดต่อเจ้าของโดยตรงที่ SpacesMate`

  return {
    title,
    description,
    openGraph: { title, description, type: 'website', images: listings[0]?.images?.[0] ? [listings[0].images[0]] : [] },
    alternates: { canonical: `/building/${encodeURI(building.slug)}` },
  }
}

export default async function BuildingPage({ params }: Props) {
  const found = await getBuilding(params.slug)
  if (!found) notFound()

  const { building, listings } = found
  const url = `${SITE}/building/${encodeURI(building.slug)}`
  const district = listings.find(l => l.district)?.district ?? null

  return (
    <div className="bg-white min-h-screen">
      <ItemListLd
        name={`${building.nameTh} ให้เช่า`}
        items={listings.map(l => ({ url: `${SITE}/property/${l.slug}`, name: l.title_th }))}
      />
      <BreadcrumbLd
        trail={[
          { name: 'หน้าแรก', url: `${SITE}/` },
          { name: 'ค้นหาที่พัก', url: `${SITE}/search` },
          { name: building.nameTh, url },
        ]}
      />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#02402e,#048c73)', padding: '52px 24px 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>หน้าแรก</Link>
            <span>/</span>
            <Link href="/search" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>ค้นหาที่พัก</Link>
            <span>/</span>
            <span style={{ color: '#fff' }}>{building.nameTh}</span>
          </div>

          <h1 style={{ fontSize: 'clamp(22px,3.2vw,40px)', fontWeight: 700, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.3px' }}>
            {building.nameTh} ให้เช่า
          </h1>
          {building.nameEn && (
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, margin: '0 0 20px', fontWeight: 300 }}>
              {building.nameEn}{district ? ` — ${district} กรุงเทพมหานคร` : ' — กรุงเทพมหานคร'}
            </p>
          )}
          <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 13, fontWeight: 500, padding: '7px 16px', borderRadius: 20 }}>
            {building.count} ประกาศ
          </span>
        </div>
      </div>

      {/* Listings */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 18 }}>
          {listings.map(l => (
            <Link key={l.slug} href={`/property/${encodeURI(l.slug)}`}
              style={{ textDecoration: 'none', border: '1px solid #eef0ef', borderRadius: 14, overflow: 'hidden', display: 'block', background: '#fff' }}>
              <div style={{ aspectRatio: '4/3', background: '#f1f5f4', overflow: 'hidden' }}>
                {l.images?.[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.images[0]} alt={l.title_th} loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ padding: '12px 14px 14px' }}>
                <p style={{ fontSize: 11.5, color: '#048c73', margin: '0 0 4px', fontWeight: 600 }}>
                  {TYPE_TH[l.property_type] ?? l.property_type}
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#231f20', margin: '0 0 6px', lineHeight: 1.35 }}>
                  {l.title_th}
                </p>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 8px' }}>
                  {[l.bedrooms ? `${l.bedrooms} ห้องนอน` : null, l.area_sqm ? `${l.area_sqm} ตร.ม.` : null]
                    .filter(Boolean).join(' · ') || ' '}
                </p>
                <p style={{ fontSize: 17, fontWeight: 700, color: '#d97f11', margin: 0 }}>
                  {l.price_from ? `฿${Number(l.price_from).toLocaleString()}` : 'สอบถาม'}
                  {l.price_from ? <span style={{ fontSize: 12, fontWeight: 400, color: '#94a3b8' }}>/เดือน</span> : null}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
