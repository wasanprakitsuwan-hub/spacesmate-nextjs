import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth, isErr } from '@/lib/auth-guard'
import { sendNewListingAlert, sendListingConfirmation } from '@/lib/email'

const PACKAGE_DAYS: Record<string, number> = {
  basic:    30,
  standard: 90,
  premium:  365,
  admin:    0, // no expiry
}

function computeExpiry(pkg: string): string | null {
  const days = PACKAGE_DAYS[pkg]
  if (!days) return null
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

// ── GET — fetch owner's own listings from properties table ────────────────────
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isErr(auth)) return auth

  try {
    const userId    = auth.id
    const userEmail = auth.email ?? ''
    const supabase  = createServerClient()

    // ── Auto-claim orphaned submissions (paid before account existed) ──────
    // Find any approved submissions with matching email but no user_id.
    if (userEmail) {
      const { data: orphaned } = await supabase
        .from('submissions')
        .select('id')
        .eq('contact_email', userEmail)
        .is('user_id', null)
        .eq('status', 'approved')

      if (orphaned && orphaned.length > 0) {
        const orphanIds = orphaned.map((s: { id: string }) => s.id)

        // Stamp user_id on submissions
        await supabase.from('submissions')
          .update({ user_id: userId })
          .in('id', orphanIds)

        // Claim the corresponding properties rows (linked by source_submission_id)
        await supabase.from('properties')
          .update({ landlord_id: userId })
          .in('source_submission_id', orphanIds)
          .is('landlord_id', null)

        console.log(`[auto-claim] ${orphanIds.length} orphaned submission(s) claimed for ${userEmail}`)
      }
    }

    // ── Return all properties owned by this user ───────────────────────────
    const { data, error } = await supabase
      .from('properties')
      .select('id, slug, title_th, title_en, property_type, price_from, price_to, district, address_th, images, listing_status, package_type, expires_at, created_at, bedrooms, bathrooms, area_sqm, rental_term, verified')
      .eq('landlord_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ listings: data ?? [] })
  } catch (err: any) {
    console.error('owner GET error:', err)
    return NextResponse.json({ listings: [] })
  }
}

// ── POST — create a new listing for the owner ─────────────────────────────────
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isErr(auth)) return auth

  try {
    const body = await req.json()
    const { userEmail, ...fields } = body
    // userId from verified JWT — never trust client body
    const userId   = auth.id
    const resolvedEmail = auth.email || userEmail || ''

    const supabase = createServerClient()

    // Upsert user_profile so landlord_id FK is satisfied
    await supabase.from('user_profiles').upsert(
      { id: userId, email: resolvedEmail, full_name: fields.full_name || '', role: 'landlord' },
      { onConflict: 'id', ignoreDuplicates: true }
    )

    const pkg = fields.package_type || 'basic'
    const rawSlug = fields.slug?.trim() ||
      ((fields.title_th || 'listing') as string)
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80) + '-' + Date.now().toString(36)

    const payload: Record<string, unknown> = {
      slug:           rawSlug,
      landlord_id:    userId,
      title_th:       fields.title_th || '',
      title_en:       fields.title_en || null,
      description_th: fields.description_th || null,
      description_en: fields.description_en || null,
      property_type:  fields.property_type || 'condo',
      status:         'for_rent',
      price_from:     parseInt(fields.price_from) || 0,
      price_to:       fields.price_to ? parseInt(fields.price_to) : null,
      area_sqm:       fields.area_sqm ? parseFloat(fields.area_sqm) : null,
      bedrooms:       parseInt(fields.bedrooms) || 1,
      bathrooms:      parseInt(fields.bathrooms) || 1,
      floor:          fields.floor ? parseInt(fields.floor) : null,
      address_th:     fields.address_th || null,
      district:       fields.district || null,
      sub_district:   fields.sub_district || null,
      province:       fields.province || 'กรุงเทพมหานคร',
      postcode:       fields.postcode || null,
      lat:            fields.lat ? parseFloat(fields.lat) : null,
      lng:            fields.lng ? parseFloat(fields.lng) : null,
      amenities:      fields.amenities || [],
      rental_term:    fields.rental_term || 'monthly',
      package_type:   pkg,
      expires_at:     computeExpiry(pkg),
      listing_status: 'active',
      verified:       false,
      verified_at:    null,
    }

    if (Array.isArray(fields.images) && fields.images.length > 0) payload.images = fields.images
    if (fields.video_url) payload.video_url = fields.video_url

    const { data, error } = await supabase
      .from('properties')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('owner POST error:', error)
      if (error.code === '42501') {
        return NextResponse.json({ error: 'DB permission denied — run fix-permissions.sql in Supabase' }, { status: 500 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // ── Send email notifications ──────────────────────────────────────────────
    try {
      const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL || 'https://spacesmate.com'
      const slug     = data?.slug ?? ''
      const emailData = {
        id:           String(data?.id ?? ''),
        title:        data?.title_th ?? fields.title_th ?? null,
        type:         data?.property_type ?? null,
        price:        data?.price_from ?? null,
        rentSuffix:   '/เดือน',
        sizeSqm:      data?.area_sqm ?? null,
        bedrooms:     data?.bedrooms ?? null,
        bathrooms:    data?.bathrooms ?? null,
        address:      data?.address_th ?? null,
        district:     data?.district ?? null,
        province:     data?.province ?? null,
        contactName:  fields.full_name || null,
        contactPhone: fields.contact_phone || null,
        contactEmail: resolvedEmail || null,
        packageType:  pkg,
        listingUrl:   slug ? `${siteUrl}/property/${slug}` : null,
        source:       'owner_dashboard' as const,
      }
      await Promise.all([
        sendNewListingAlert(emailData),
        sendListingConfirmation(emailData),
      ])
    } catch (emailErr) {
      console.error('[email] notification error (non-fatal):', emailErr)
    }

    return NextResponse.json({ success: true, listing: data })
  } catch (err: any) {
    console.error('owner POST error:', err)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}

// ── PATCH — update owner's own listing ───────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isErr(auth)) return auth

  try {
    const body = await req.json()
    const { id, ...fields } = body
    const userId = auth.id
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const supabase = createServerClient()

    // Verify ownership before updating
    const { data: existing } = await supabase
      .from('properties')
      .select('landlord_id')
      .eq('id', id)
      .single()

    if (!existing || existing.landlord_id !== userId) {
      return NextResponse.json({ error: 'Not authorized to edit this listing' }, { status: 403 })
    }

    const ALLOWED = [
      'title_th', 'title_en', 'description_th', 'description_en', 'property_type',
      'price_from', 'price_to', 'area_sqm', 'bedrooms', 'bathrooms', 'floor',
      'address_th', 'district', 'sub_district', 'province', 'postcode',
      'lat', 'lng', 'amenities', 'rental_term', 'images', 'video_url',
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
  } catch (err: any) {
    console.error('owner PATCH error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

// ── DELETE — remove owner's own listing ──────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isErr(auth)) return auth

  try {
    const { id } = await req.json()
    const userId = auth.id
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const supabase = createServerClient()

    // Verify ownership before deleting
    const { data: existing } = await supabase
      .from('properties')
      .select('landlord_id')
      .eq('id', id)
      .single()

    if (!existing || existing.landlord_id !== userId) {
      return NextResponse.json({ error: 'Not authorized to delete this listing' }, { status: 403 })
    }

    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('owner DELETE error:', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
