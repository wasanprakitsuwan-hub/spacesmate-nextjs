'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import PropertyCard from '@/components/ui/PropertyCard'
import { PROPERTY_TYPE_LABELS, AMENITY_LABELS } from '@/lib/constants'
import type { Property, PropertyType, SearchFilters } from '@/lib/types'

const BEDROOM_OPTIONS = [1, 2, 3, 4]
const PRICE_MAX_DEFAULT = 100000

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const [filters, setFilters] = useState<SearchFilters>({
    property_type: searchParams.get('type') ? [searchParams.get('type') as PropertyType] : [],
    price_min: 0,
    price_max: PRICE_MAX_DEFAULT,
    bedrooms: [],
    amenities: [],
    keyword: searchParams.get('q') || '',
  })

  const [sortBy, setSortBy] = useState('latest')

  useEffect(() => {
    fetchProperties()
  }, [filters, sortBy])

  async function fetchProperties() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.property_type?.length) params.set('type', filters.property_type.join(','))
      if (filters.price_min) params.set('price_min', String(filters.price_min))
      if (filters.price_max && filters.price_max < PRICE_MAX_DEFAULT) params.set('price_max', String(filters.price_max))
      if (filters.bedrooms?.length) params.set('beds', filters.bedrooms.join(','))
      if (filters.keyword) params.set('q', filters.keyword)
      params.set('sort', sortBy)

      const res = await fetch(`/api/search?${params.toString()}`)
      const data = await res.json()
      setProperties(data.properties || [])
      setTotal(data.total || 0)
    } catch {
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  function toggleType(type: PropertyType) {
    setFilters(prev => ({
      ...prev,
      property_type: prev.property_type?.includes(type)
        ? prev.property_type.filter(t => t !== type)
        : [...(prev.property_type || []), type],
    }))
  }

  function toggleBedroom(n: number) {
    setFilters(prev => ({
      ...prev,
      bedrooms: prev.bedrooms?.includes(n)
        ? prev.bedrooms.filter(b => b !== n)
        : [...(prev.bedrooms || []), n],
    }))
  }

  function toggleAmenity(key: string) {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities?.includes(key)
        ? prev.amenities.filter(a => a !== key)
        : [...(prev.amenities || []), key],
    }))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Sidebar Filters ── */}
        <aside className="lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-premium p-6 sticky top-24">
            <h2 className="font-bold text-spacemate-brandDark text-lg mb-5">ตัวกรองการค้นหา</h2>

            {/* Property Type */}
            <div className="mb-6">
              <h3 className="label mb-3">ประเภทที่พัก</h3>
              <div className="space-y-2">
                {Object.entries(PROPERTY_TYPE_LABELS).map(([type, label]) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.property_type?.includes(type as PropertyType)}
                      onChange={() => toggleType(type as PropertyType)}
                      className="w-4 h-4 rounded border-gray-300 text-spacemate-brandTeal focus:ring-spacemate-brandTeal"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-spacemate-brandDark">
                      {label.icon} {label.th}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="label mb-3">
                ราคา: ฿{(filters.price_min || 0).toLocaleString()} – ฿{(filters.price_max || PRICE_MAX_DEFAULT).toLocaleString()}
              </h3>
              <input
                type="range"
                min={0}
                max={PRICE_MAX_DEFAULT}
                step={1000}
                value={filters.price_max || PRICE_MAX_DEFAULT}
                onChange={e => setFilters(prev => ({ ...prev, price_max: Number(e.target.value) }))}
                className="w-full accent-spacemate-brandTeal"
              />
            </div>

            {/* Bedrooms */}
            <div className="mb-6">
              <h3 className="label mb-3">จำนวนห้องนอน</h3>
              <div className="flex gap-2 flex-wrap">
                {BEDROOM_OPTIONS.map(n => (
                  <button
                    key={n}
                    onClick={() => toggleBedroom(n)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium border transition-all ${
                      filters.bedrooms?.includes(n)
                        ? 'bg-spacemate-brandDark text-white border-spacemate-brandDark'
                        : 'bg-white text-gray-600 border-spacemate-borderLight hover:border-spacemate-brandTeal'
                    }`}
                  >
                    {n}{n === 4 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-6">
              <h3 className="label mb-3">สิ่งอำนวยความสะดวก</h3>
              <div className="space-y-2">
                {Object.entries(AMENITY_LABELS).slice(0, 6).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.amenities?.includes(key)}
                      onChange={() => toggleAmenity(key)}
                      className="w-4 h-4 rounded border-gray-300 text-spacemate-brandTeal focus:ring-spacemate-brandTeal"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-spacemate-brandDark">
                      {label.icon} {label.th}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button onClick={fetchProperties} className="btn-primary w-full text-sm">
              🔍 ค้นหา
            </button>
          </div>
        </aside>

        {/* ── Results ── */}
        <div className="flex-1 min-w-0">

          {/* Sort Bar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              {loading ? 'กำลังค้นหา...' : `พบ ${total.toLocaleString()} รายการ`}
            </p>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input-field w-auto text-sm py-2"
            >
              <option value="latest">ล่าสุด</option>
              <option value="price_asc">ราคาต่ำ → สูง</option>
              <option value="price_desc">ราคาสูง → ต่ำ</option>
              <option value="area_desc">พื้นที่มาก → น้อย</option>
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="h-48 bg-gradient-to-br from-spacemate-brandDark/10 to-spacemate-brandTeal/10" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {properties.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-semibold text-spacemate-brandDark text-lg mb-2">ไม่พบผลการค้นหา</h3>
              <p className="text-gray-400 text-sm">ลองปรับตัวกรอง หรือขยายพื้นที่การค้นหา</p>
            </div>
          )}

          {/* Pagination */}
          {properties.length > 0 && (
            <div className="flex justify-center gap-2 mt-10">
              {[1, 2, 3, 4, 5].map(page => (
                <button
                  key={page}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    page === 1
                      ? 'bg-spacemate-brandDark text-white'
                      : 'bg-white border border-spacemate-borderLight text-gray-600 hover:border-spacemate-brandTeal'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
