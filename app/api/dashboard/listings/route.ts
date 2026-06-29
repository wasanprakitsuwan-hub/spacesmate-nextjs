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
  // Guard: service role key must be set or we cannot write to the DB
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        error:
          'Server config error: SUPABASE_SERVICE_ROLE_KEY is not set. ' +
          'Go to Vercel → Project → Settings → Environment Variables and add it, then redeploy.',
      },
      { status: 500 }
    )
  }

  try {
    const body = await req.json()
    const supabase = createServerClient()

    const userId    = body.userId as string | undefined
    const userEmail = (body.userEmail as string) || 'admin@spacesmate.com'

    // Upsert user_profile so landlord_id FK is satisfied (best-effort — don't fail the whole request)
    if (userId) {
      const { error: profileErr } = await supabase.from('user_profiles').upsert(
        { id: userId, email: userEmail, full_name: 'SpacesMate Admin', role: 'admin' },
        { onConflict: 'id', ignoreDuplicates: true }
      )
      if (profileErr) {
        // Log but continue — landlord_id will be null if profile upsert fails
        console.warn('user_profiles upsert warning (non-fatal):', profileErr.message)
      }
    }

    // Auto-generate slug if not provided
    const rawSlug =
      body.slug?.trim() ||
      ((body.title_th || 'listing') as string)
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80) +
      '-' + Date.now().toString(36)

    // Pass room_types as-is (JSONB — contains _type markers for apt_unit, charges, rental_detail)
    const roomTypes = Array.isArray(body.room_types) ? body.room_types : []

    const insertPayload: Record<string, unknown> = {
      slug:           rawSlug,
      title_th:       body.title_th,
      title_en:       body.title_en  || null,
      description_th: body.description_th || null,
      property_type:  body.property_type,
      status:         body.status    || 'for_rent',
      price_from:     parseInt(body.price_from) || 0,
      price_to:       body.price_to  ? parseInt(body.price_to)  : null,
      area_sqm:       body.area_sqm  ? parseFloat(body.area_sqm) : null,
      bedrooms:       parseInt(body.bedrooms)  || 1,
      bathrooms:      parseInt(body.bathrooms) || 1,
      floor:          body.floor     ? parseInt(body.floor) : null,
      address_th:     body.address_th    || null,
      district:       body.district      || null,
      sub_district:   body.sub_district  || null,
      province:       body.province      || 'กรุงเทพมหานคร',
      postcode:       body.postcode      || null,
      lat:            body.lat   ? parseFloat(body.lat) : null,
      lng:            body.lng   ? parseFloat(body.lng) : null,
      amenities:      body.amenities || [],
      rental_term:    body.rental_term   || '1_month',
      package_type:   body.package_type  || 'admin',
      expires_at:     body.expires_at    || null,
      listing_status: 'active',
      verified:       true,
      verified_at:    new Date().toISOString(),
    }

    // Only add landlord_id if userId exists (FK may be optional)
    if (userId) insertPayload.landlord_id = userId

    // Optional columns — added only when non-empty so they don't break
    // if the column doesn't exist yet (run supabase/fix-permissions.sql first)
    if (roomTypes.length > 0)          insertPayload.room_types = roomTypes
    if (Array.isArray(body.images) && body.images.length > 0) insertPayload.images = body.images
    if (body.video_url)                insertPayload.video_url = body.video_url

    const { data, error } = await supabase
      .from('properties')
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      console.error('properties insert error:', error)

      // Surface a human-readable fix for the most common error
      if (error.code === '42501') {
        return NextResponse.json(
          {
            error:
              'DB permission denied. Run this SQL in Supabase → SQL Editor:\n' +
              'GRANT ALL ON public.properties TO service_role;\n' +
              'GRANT ALL ON public.user_profiles TO service_role;',
          },
          { status: 500 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, listing: data })
  } catch (err: any) {
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
      'package_type', 'expires_at',
      // extended columns (run supabase/fix-permissions.sql to enable)
      'room_types', 'images', 'video_url',
    ]

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const k of ALLOWED) {
      if (fields[k] !== undefined) {
        update[k] = fields[k] === '' ? null : fields[k]
      }
    }

    // room_types passed as-is (JSONB with _type markers) — no normalisation needed

    const { data, error } = await supabase
      .from('properties')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, listing: data })
  } catch (err: any) {
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
  } catch (err: any) {
    console.error('listings DELETE error:', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
