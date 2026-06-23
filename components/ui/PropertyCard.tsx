import Link from 'next/link'
import Image from 'next/image'
import type { Property } from '@/lib/types'
import { PROPERTY_TYPE_LABELS } from '@/lib/constants'

interface PropertyCardProps {
  property: Property
  featured?: boolean
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('th-TH').format(price)
}

export default function PropertyCard({ property, featured = false }: PropertyCardProps) {
  const typeLabel = PROPERTY_TYPE_LABELS[property.property_type]

  return (
    <Link href={`/property/${property.slug}`} className="block">
      <div className="card overflow-hidden group cursor-pointer">

        {/* Image */}
        <div className="relative h-48 bg-card-gradient overflow-hidden">
          {property.images?.[0]?.url ? (
            <Image
              src={property.images[0].url}
              alt={property.images[0].alt_th}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-spacemate-brandDark to-spacemate-brandTeal flex items-center justify-center">
              <span className="text-4xl opacity-30">{typeLabel.icon}</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {featured && property.verified && (
              <span className="badge-gold text-xs">✨ แนะนำ</span>
            )}
            {property.verified && (
              <span className="badge-teal text-xs">✓ ยืนยันแล้ว</span>
            )}
          </div>

          {/* Property Type */}
          <div className="absolute top-3 right-3">
            <span className="bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              {typeLabel.th}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">

          {/* Title */}
          <h3 className="font-semibold text-spacemate-textCharcoal text-sm leading-snug line-clamp-2 mb-1 group-hover:text-spacemate-brandDark transition-colors">
            {property.title_th}
          </h3>

          {/* Location */}
          <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
            <span>📍</span>
            <span>{property.district}, {property.sub_district}</span>
          </p>

          {/* Stats Row */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <span>🛏</span> {property.bedrooms} ห้องนอน
              </span>
            )}
            <span className="flex items-center gap-1">
              <span>🚿</span> {property.bathrooms} ห้องน้ำ
            </span>
            <span className="flex items-center gap-1">
              <span>📐</span> {property.area_sqm} ตร.ม.
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-spacemate-brandGold font-bold text-lg">
                ฿{formatPrice(property.price_from)}
              </span>
              <span className="text-gray-400 text-xs ml-1">/เดือน</span>
            </div>
            <span className="text-spacemate-brandTeal text-xs font-medium hover:underline">
              ดูรายละเอียด →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
