import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type      = searchParams.get('type')
  const priceMin  = searchParams.get('price_min')
  const priceMax  = searchParams.get('price_max')
  const beds      = searchParams.get('beds')
  const keyword   = searchParams.get('q')
  const sort      = searchParams.get('sort') || 'latest'
  const page      = parseInt(searchParams.get('page') || '1')
  const perPage   = 24

  try {
    const supabase = createServerClient()
    let query = supabase
      .from('properties')
      .select('*, images:property_images(*)', { count: 'exact' })
      .eq('listing_status', 'active')

    // Filters
    if (type) {
      const types = type.split(',')
      query = query.in('property_type', types)
    }
    if (priceMin) query = query.gte('price_from', parseInt(priceMin))
    if (priceMax) query = query.lte('price_from', parseInt(priceMax))
    if (beds) {
      const bedNums = beds.split(',').map(Number)
      query = query.in('bedrooms', bedNums)
    }
    if (keyword) {
      query = query.or(`title_th.ilike.%${keyword}%,title_en.ilike.%${keyword}%,district.ilike.%${keyword}%,sub_district.ilike.%${keyword}%`)
    }

    // Sort
    switch (sort) {
      case 'price_asc':  query = query.order('price_from', { ascending: true });  break
      case 'price_desc': query = query.order('price_from', { ascending: false }); break
      case 'area_desc':  query = query.order('area_sqm', { ascending: false });   break
      default:           query = query.order('updated_at', { ascending: false });  break
    }

    // Pagination
    query = query.range((page - 1) * perPage, page * perPage - 1)

    const { data, count, error } = await query
    if (error) throw error

    // Fair Rotation: shuffle results for 'latest' sort
    const properties = sort === 'latest' ? (data || []).sort(() => Math.random() - 0.5) : (data || [])

    return NextResponse.json({ properties, total: count || 0, page, per_page: perPage })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ properties: [], total: 0, page: 1, per_page: perPage }, { status: 500 })
  }
}
