import Link from 'next/link'
import PropertyCard from '@/components/ui/PropertyCard'
import { createServerClient } from '@/lib/supabase'
import type { Property } from '@/lib/types'

async function getFeaturedListings(): Promise<Property[]> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('properties')
      .select('*, images:property_images(*)')
      .eq('listing_status', 'active')
      .eq('verified', true)
      .order('updated_at', { ascending: false })
      .limit(6)

    if (error) throw error
    // Fair Rotation: shuffle verified listings on every request
    return (data as Property[]).sort(() => Math.random() - 0.5)
  } catch {
    return []
  }
}

export default async function FeaturedListings() {
  const properties = await getFeaturedListings()

  return (
    <section className="py-14 bg-spacemate-bgLight">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-heading">ที่พักแนะนำ</h2>
            <p className="section-subheading">
              คัดเลือกจากประกาศที่ผ่านการยืนยันล่าสุด · อัปเดตทุก Refresh
            </p>
          </div>
          <Link href="/search" className="text-spacemate-brandTeal text-sm font-medium hover:underline hidden sm:block">
            ดูทั้งหมด →
          </Link>
        </div>

        {/* Grid */}
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property, index) => (
              <PropertyCard key={property.id} property={property} featured={index < 3} />
            ))}
          </div>
        ) : (
          /* Placeholder cards when DB is empty */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="h-48 bg-gradient-to-br from-spacemate-brandDark/20 to-spacemate-brandTeal/20" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fair Rotation Note */}
        <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1">
          <span>🔄</span>
          <span>ระบบ Fair Rotation — ที่พักแนะนำจะเปลี่ยนทุกครั้งที่โหลดหน้า เพื่อให้ทุกประกาศได้รับโอกาสเท่าเทียมกัน</span>
        </p>

        <div className="text-center mt-6 sm:hidden">
          <Link href="/search" className="btn-outline-dark inline-block text-sm">
            ดูที่พักทั้งหมด →
          </Link>
        </div>
      </div>
    </section>
  )
}
