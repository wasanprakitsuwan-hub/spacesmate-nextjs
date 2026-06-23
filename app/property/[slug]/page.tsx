import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase'
import { AMENITY_LABELS } from '@/lib/constants'
import type { Property } from '@/lib/types'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

async function getProperty(slug: string): Promise<Property | null> {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('properties')
      .select('*, images:property_images(*)')
      .eq('slug', slug)
      .eq('listing_status', 'active')
      .single()
    return data as Property | null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const property = await getProperty(params.slug)
  if (!property) return { title: 'ไม่พบประกาศ' }
  return {
    title: property.title_th,
    description: property.description_th.slice(0, 155),
    openGraph: {
      title: property.title_th,
      description: property.description_th.slice(0, 155),
      images: property.images?.[0]?.url ? [property.images[0].url] : [],
    },
  }
}

export default async function PropertyDetailPage({ params }: Props) {
  const property = await getProperty(params.slug)
  if (!property) notFound()

  const heroImage = property.images?.find(img => img.is_featured) || property.images?.[0]
  const galleryImages = property.images?.slice(1, 5) || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-spacemate-brandDark">หน้าแรก</Link>
        <span>›</span>
        <Link href="/search" className="hover:text-spacemate-brandDark">ค้นหาที่พัก</Link>
        <span>›</span>
        <span className="text-spacemate-textCharcoal">{property.sub_district}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Left: Main Content ── */}
        <div className="flex-1 min-w-0">

          {/* Gallery */}
          <div className="grid grid-cols-4 gap-2 mb-6 rounded-2xl overflow-hidden">
            {/* Hero */}
            <div className="col-span-4 md:col-span-2 relative h-64 md:h-96 bg-card-gradient">
              {heroImage?.url ? (
                <Image src={heroImage.url} alt={heroImage.alt_th} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-spacemate-brandDark to-spacemate-brandTeal" />
              )}
            </div>
            {/* Thumbnails */}
            <div className="col-span-4 md:col-span-2 grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => {
                const img = galleryImages[i]
                return (
                  <div key={i} className="relative h-28 md:h-[11.5rem] bg-card-gradient rounded-lg overflow-hidden">
                    {img?.url ? (
                      <Image src={img.url} alt={img.alt_th} fill className="object-cover hover:scale-105 transition-transform cursor-pointer" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-spacemate-brandDark/60 to-spacemate-brandTeal/60" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Title + Badges */}
          <div className="flex items-start gap-3 mb-4 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-spacemate-brandDark flex-1">
              {property.title_th}
            </h1>
            {property.verified && (
              <span className="badge-teal flex-shrink-0">✓ ยืนยันแล้ว</span>
            )}
          </div>

          {/* Location */}
          <p className="text-gray-500 text-sm mb-5 flex items-center gap-1">
            <span>📍</span> {property.address_th}
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { icon: '🛏', label: `${property.bedrooms} ห้องนอน` },
              { icon: '🚿', label: `${property.bathrooms} ห้องน้ำ` },
              { icon: '📐', label: `${property.area_sqm} ตร.ม.` },
              { icon: '🏢', label: property.floor ? `ชั้น ${property.floor}` : 'ไม่ระบุ' },
            ].map((stat) => (
              <div key={stat.label} className="bg-spacemate-bgLight rounded-xl p-3 text-center">
                <div className="text-xl mb-1">{stat.icon}</div>
                <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="font-bold text-spacemate-brandDark text-lg mb-3">รายละเอียด</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
              {property.description_th}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div className="mb-8">
              <h2 className="font-bold text-spacemate-brandDark text-lg mb-3">สิ่งอำนวยความสะดวก</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map(key => {
                  const amenity = AMENITY_LABELS[key]
                  return amenity ? (
                    <span key={key} className="flex items-center gap-2 bg-spacemate-bgLight border border-spacemate-borderLight px-3 py-2 rounded-full text-sm text-spacemate-textCharcoal">
                      <span>{amenity.icon}</span>
                      <span>{amenity.th}</span>
                    </span>
                  ) : null
                })}
              </div>
            </div>
          )}

          {/* Map Placeholder */}
          <div className="mb-8">
            <h2 className="font-bold text-spacemate-brandDark text-lg mb-3">แผนที่</h2>
            <div className="h-64 bg-spacemate-bgLight border-2 border-spacemate-brandTeal rounded-2xl flex items-center justify-center">
              <a
                href={`https://maps.google.com/?q=${property.lat},${property.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-spacemate-brandTeal font-medium text-sm hover:underline flex items-center gap-2"
              >
                <span>📍</span> ดูบนแผนที่ Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* ── Right: Contact Sidebar ── */}
        <aside className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-premium p-6 sticky top-24">

            {/* Price */}
            <div className="text-center mb-5 pb-5 border-b border-spacemate-borderLight">
              <p className="text-3xl font-bold text-spacemate-brandGold">
                ฿{property.price_from.toLocaleString()}
              </p>
              <p className="text-gray-400 text-sm">/เดือน</p>
            </div>

            {/* Agent */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-card-gradient rounded-full flex items-center justify-center text-white font-bold text-lg">
                SM
              </div>
              <div>
                <p className="font-semibold text-spacemate-brandDark text-sm">SpacesMate Agent</p>
                <p className="text-gray-400 text-xs">ตอบภายใน 1 ชั่วโมง</p>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="space-y-3">
              <a
                href="tel:0823535558"
                className="flex items-center justify-center gap-2 w-full bg-spacemate-brandDark text-white font-semibold py-3 rounded-xl hover:brightness-110 transition-all text-sm"
              >
                📞 โทร: 082-353-5558
              </a>
              <a
                href="https://line.me/R/ti/p/@spacesmate"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-spacemate-brandTeal text-white font-semibold py-3 rounded-xl hover:brightness-110 transition-all text-sm"
              >
                💬 LINE: @spacesmate
              </a>
              <button className="btn-primary w-full text-sm py-3">
                📅 นัดชมห้อง
              </button>
            </div>

            {/* Trust Badge */}
            <div className="mt-5 pt-4 border-t border-spacemate-borderLight text-center">
              <p className="text-xs text-gray-400">
                🔒 ปลอดภัย — ติดต่อโดยตรง ไม่มีค่าคอมมิชชั่น
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
