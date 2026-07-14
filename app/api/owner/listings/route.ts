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

    // ── Auto-claim: stamp user_id on submissions with matching email ──────────
    // Covers submissions created before account existed, or where webhook profile
    // lookup failed to stamp user_id (e.g. Stripe customer email mismatch).
    if (userEmail) {
      const { data: orphaned } = await supabase
        .from('submissions')
        .select('id')
        .eq('contact_email', userEmail)
        .is('user_id', null)
        .eq('status', 'approved')

      if (orphaned && orphaned.length > 0) {
        const orphanIds = orphaned.map((s: { id: string }) => s.id)

        await supabase.from('submissions')
          .update({ user_id: userId })
          .in('id', orphanIds)

        await supabase.from('properties')
          .update({ landlord_id: userId })
          .in('source_submission_id', orphanIds)
          .is('landlord_id', null)

        console.log(`[auto-claim] ${orphanIds.length} orphaned submission(s) claimed for ${userEmail}`)
      }
    }

    // ── Auto-claim: fix properties where submission is already owned but
    //    properties.landlord_id is null (webhook timing / profile lookup failure) ─
    try {
      const { data: ownedSubs } = await supabase
        .from('submissions')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'approved')

      if (ownedSubs && ownedSubs.length > 0) {
        const ownedSubIds = ownedSubs.map((s: { id: string }) => s.id)
        await supabase.from('properties')
          .update({ landlord_id: userId })
          .in('source_submission_id', ownedSubIds)
          .is('landlord_id', null)
      }
    } catch (claimErr) {
      console.error('[auto-claim] owned-submission property fix (non-fatal):', claimErr)
    }

    // ── Return all properties owned by this user ───────────────────────────
    const { data, error } = await supabase
      .from('properties')
      .select('id, slug, title_th, title_en, property_type, price_from, price_to, district, sub_district, province, postcode, address_th, floor, area_sqm, bedrooms, bathrooms, lat, lng, images, video_url, listing_status, package_type, expires_at, created_at, rental_term, verified, description_th, description_en, amenities, room_types, contact_name, contact_phone, contact_email, contact_line')
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
    if (fields.contact_name)  payload.contact_name  = fields.contact_name
    if (fields.contact_phone) payload.contact_phone = fields.contact_phone
    // contact_email is always sourced from the authenticated account — never from user input
    if (resolvedEmail)        payload.contact_email = resolvedEmail
    if (fields.contact_line)  payload.contact_line  = fields.contact_line

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

    // Special action: owner cancels their own manual package
    if (body.cancel_package === true) {
      const { error: cpErr } = await supabase
        .from('properties')
        .update({ package_type: null, expires_at: null, listing_status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', id)
      if (cpErr) throw cpErr
      return NextResponse.json({ success: true })
    }

    const ALLOWED = [
      'title_th', 'title_en', 'description_th', 'description_en', 'property_type',
      'price_from', 'price_to', 'area_sqm', 'bedrooms', 'bathrooms', 'floor',
      'address_th', 'district', 'sub_district', 'province', 'postcode',
      'lat', 'lng', 'amenities', 'rental_term', 'images', 'video_url',
      'room_types',  // apartment unit grid, condo rental detail, and rental charges
      'contact_name', 'contact_phone', 'contact_line',
      // contact_email is immutable after creation — always the account email
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

    // Verify ownership before deleting — also fetch source_submission_id for sub lookup
    const { data: existing } = await supabase
      .from('properties')
      .select('landlord_id, source_submission_id')
      .eq('id', id)
      .single()

    if (!existing || existing.landlord_id !== userId) {
      return NextResponse.json({ error: 'Not authorized to delete this listing' }, { status: 403 })
    }

    // ── Cancel the Stripe subscription tied to this listing (non-fatal) ───────
    // This prevents the owner being charged for a deleted listing and keeps
    // user_profiles clean so a new submission/checkout starts fresh.
    try {
      if (existing.source_submission_id) {
        const { data: sub } = await supabase
          .from('submissions')
          .select('stripe_subscription_id')
          .eq('id', existing.source_submission_id)
          .single()

        if (sub?.stripe_subscription_id) {
          const { stripe } = await import('@/lib/stripe')
          await stripe.subscriptions.cancel(sub.stripe_subscription_id)
          console.log(`[delete] Stripe subscription ${sub.stripe_subscription_id} cancelled`)

          // Clear package from user_profiles so slot is fully freed
          await supabase
            .from('user_profiles')
            .update({
              package_type:           null,
              package_expires_at:     null,
              stripe_subscription_id: null,
            })
            .eq('id', userId)
        }
      }
    } catch (stripeErr) {
      // Non-fatal — log and continue with property deletion
      console.error('[delete] Stripe cancel error (non-fatal):', stripeErr)
    }

    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('owner DELETE error:', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
