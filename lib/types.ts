// ─── Property Types ───────────────────────────────────────────────────────────

export type PropertyType = 'apartment' | 'condo' | 'house' | 'coworking' | 'office'
export type PropertyStatus = 'for_rent' | 'for_sale'
export type ListingStatus = 'active' | 'inactive' | 'pending' | 'expired'

export interface Property {
  id: string
  slug: string
  title_th: string
  title_en: string
  description_th: string
  description_en: string
  property_type: PropertyType
  status: PropertyStatus
  price_from: number
  price_to: number
  area_sqm: number
  bedrooms: number
  bathrooms: number
  floor: number | null
  address_th: string
  district: string       // แขวง
  sub_district: string   // เขต
  province: string
  postcode: string
  lat: number | null
  lng: number | null
  amenities: string[]
  images: PropertyImage[]
  featured: boolean
  verified: boolean
  verified_at: string | null
  listing_status: ListingStatus
  landlord_id: string
  created_at: string
  updated_at: string
}

export interface PropertyImage {
  id: string
  property_id: string
  url: string
  alt_th: string
  alt_en: string
  is_featured: boolean
  sort_order: number
}

// ─── User / Landlord Types ────────────────────────────────────────────────────

export type UserRole = 'landlord' | 'admin'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  phone: string | null
  line_id: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
}

// ─── Subscription Types ───────────────────────────────────────────────────────

// PackageName and SubscriptionPackage were removed on 3 Sep 2026. Nothing
// imported either of them, and both described a product that does not exist:
// a 'trial' tier and a max_listings quota, in a system that sells one slot at
// a time and has no free tier.
//
// They mirrored the public.subscription_packages table (supabase/schema.sql),
// which is still seeded with the same wrong figures — trial ฿0, Standard ฿799,
// quotas of 1/3/10 — and which no application code reads. See the note there.
//
// Real package definitions live in lib/packages.ts.

export interface Subscription {
  id: string
  landlord_id: string
  package_id: string
  property_id: string
  starts_at: string
  expires_at: string
  is_active: boolean
  created_at: string
}

// ─── Search / Filter Types ────────────────────────────────────────────────────

export interface SearchFilters {
  property_type?: PropertyType[]
  status?: PropertyStatus
  price_min?: number
  price_max?: number
  area_min?: number
  area_max?: number
  bedrooms?: number[]
  amenities?: string[]
  district?: string
  keyword?: string
}

export interface SearchResult {
  properties: Property[]
  total: number
  page: number
  per_page: number
}

// ─── Area / SEO Types ─────────────────────────────────────────────────────────

export interface AreaKeyword {
  slug: string
  label_th: string
  label_en: string
  property_type: PropertyType
  station?: string
  district?: string
}
