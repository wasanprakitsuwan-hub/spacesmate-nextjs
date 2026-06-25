import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Public endpoint — returns active, non-expired DB listings for homepage + search
export async function GET() {
  try {
    const supabase = createServerClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('properties')
      .select('id,slug,title_th,title_en,description_th,property_type,price_from,price_to,bedrooms,bathrooms,area_sqm,floor,address_th,district,sub_district,province,lat,lng,amenities,rental_term,created_at')
      .eq('listing_status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ listings: data ?? [] })
  } catch {
    return NextResponse.json({ listings: [] })
  }
}
