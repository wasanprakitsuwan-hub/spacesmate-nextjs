import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// ── GET — fetch all properties from Supabase ─────────────────────────────────
export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ listings: data ?? [] })
  } catch (err) {
    console.error('listings GET error:', err)
    return NextResponse.json({ listings: [] }, { status: 500 })
  }
}

// ── POST — create a new property ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createServerClient()

    // Ensure user_profile exists for this admin user
    const userId = body.userId
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Upsert user_profile so landlord_id FK is satisfied
    await supabase.from('user_profiles').upsert({
      id: userId,
      email: body.userEmail || 'admin@spacesmate.com',
      full_name: body.userName || 'SpacesMate Admin',
      role: 'admin',
    }, { onConflict: 'id', ignoreDuplicates: true })

    // Auto-generate slug if not provided
    const rawSlug = body.slug?.trim() ||
      (body.title_th || 'listing')
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80) +
      '-' + Date.now().toString(36)

    const { data, error } = await supabase
      .from('properties')
      .insert({
        slug:           rawSlug,
        landlord_id:    userId,
        title_th:       body.title_th,
        title_en:       body.title_en || null,
        description_th: body.description_th || null,
        property_type:  body.property_type,
        status:         body.status || 'for_rent',
        price_from:     parseInt(body.price_from) || 0,
        price_to:       body.price_to ? parseInt(body.price_to) : null,
        area_sqm:       body.area_sqm ? parseFloat(body.area_sqm) : null,
        bedrooms:       parseInt(body.bedrooms) || 1,
        bathrooms:      parseInt(body.bathrooms) || 1,
        floor:          body.floor ? parseInt(body.floor) : null,
        address_th:     body.address_th || null,
        district:       body.district || null,
        sub_district:   body.sub_district || null,
        province:       body.province || 'กรุงเทพมหานคร',
        postcode:       body.postcode || null,
        lat:            body.lat ? parseFloat(body.lat) : null,
        lng:            body.lng ? parseFloat(body.lng) : null,
        amenities:      body.amenities || [],
        rental_term:    body.rental_term || 'monthly',
        listing_status: 'active',  // admin-created = immediately active
        verified:       true,
        verified_at:    new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('properties insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, listing: data })
  } catch (err) {
    console.error('listings POST error:', err)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}

// ── PATCH — update an existing property ──────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...fields } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const supabase = createServerClient()

    const ALLOWED = [
      'title_th', 'title_en', 'description_th', 'property_type', 'status',
      'price_from', 'price_to', 'area_sqm', 'bedrooms', 'bathrooms', 'floor',
      'address_th', 'district', 'sub_district', 'province', 'postcode',
      'lat', 'lng', 'amenities', 'listing_status', 'rental_term',
    ]
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const k of ALLOWED) {
      if (fields[k] !== undefined) update[k] = fields[k] === '' ? null : fields[k]
    }

    const { data, error } = await supabase
      .from('properties')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, listing: data })
  } catch (err) {
    console.error('listings PATCH error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

// ── DELETE — remove a property ────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const supabase = createServerClient()
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('listings DELETE error:', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
