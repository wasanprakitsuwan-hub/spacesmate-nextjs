import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { PACKAGE_DAYS } from '@/lib/stripe'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json()
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Update submission status
    const { error } = await supabase
      .from('submissions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', params.id)

    if (error) throw error

    // ── When approving: publish to properties so listing appears on website ──
    if (status === 'approved') {
      try {
        const { data: sub } = await supabase
          .from('submissions')
          .select('*')
          .eq('id', params.id)
          .single()

        if (sub) {
          // Skip if a property row already exists for this submission
          const { data: existing } = await supabase
            .from('properties')
            .select('id')
            .eq('source_submission_id', params.id)
            .maybeSingle()

          if (!existing) {
            // Generate a URL-safe slug
            const slug =
              ((sub.title || 'listing') as string)
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
                .slice(0, 60) +
              '-' +
              Date.now().toString(36)

            // Calculate expiry
            const packageId = (sub.package_type as string) || 'free_trial'
            const durationDays = PACKAGE_DAYS[packageId] ?? 30
            const expiresAt = sub.expires_at
              ? new Date(sub.expires_at)
              : (() => {
                  const d = new Date()
                  d.setDate(d.getDate() + durationDays)
                  return d
                })()

            // Normalise property_type: submissions may store Thai labels,
            // but the properties table has an English-value check constraint.
            const TYPE_MAP: Record<string, string> = {
              'คอนโด': 'condo', 'คอนโดมิเนียม': 'condo',
              'อพาร์ทเม้นท์': 'apartment', 'อพาร์ตเมนต์': 'apartment',
              'บ้าน': 'house',
              'ออฟฟิศ': 'office',
              'โคเวิร์ก': 'coworking', 'โคเวิร์คกิ้งสเปซ': 'coworking',
            }
            const rawType = (sub.type as string) || ''
            const propertyType = TYPE_MAP[rawType] ?? (rawType || 'apartment')

            // Safe integer cast for fields that are text in submissions but int in properties
            const safeInt = (v: unknown): number | null => {
              const n = parseInt(String(v ?? ''), 10)
              return isNaN(n) ? null : n
            }

            const { error: propErr } = await supabase.from('properties').insert({
              slug,
              source_submission_id: params.id,
              landlord_id:          sub.user_id        || null,
              title_th:             sub.title          || '',
              title_en:             sub.title_en       || null,
              description_th:       sub.description    || null,
              description_en:       sub.description_en || null,
              property_type:        propertyType,
              price_from:           sub.price          || 0,
              price_to:             sub.price_to       || null,
              area_sqm:             sub.size ? parseFloat(String(sub.size)) : null,
              bedrooms:             safeInt(sub.bedrooms) ?? 0,
              bathrooms:            safeInt(sub.bathrooms) ?? 0,
              floor:                safeInt(sub.floor),
              address_th:           sub.address        || null,
              district:             sub.district       || null,
              sub_district:         sub.subdistrict    || null,
              province:             sub.province       || 'กรุงเทพมหานคร',
              postcode:             sub.postcode       || null,
              lat:                  sub.lat            || null,
              lng:                  sub.lng            || null,
              amenities:            Array.isArray(sub.amenities)   ? sub.amenities   : [],
              images:               Array.isArray(sub.images)      ? sub.images      : [],
              room_types:           Array.isArray(sub.room_types)  ? sub.room_types  : [],
              video_url:            sub.video_url      || null,
              rental_term:          sub.rental_term    || 'monthly',
              contact_name:         sub.contact_name   || null,
              contact_phone:        sub.contact_phone  || null,
              contact_line:         sub.contact_line   || null,
              package_type:         packageId,
              expires_at:           expiresAt.toISOString(),
              listing_status:       'active',
              verified:             false,
            })

            if (propErr) {
              console.error('[admin approve] property insert error:', propErr)
            } else {
              console.log(`[admin approve] Property published from submission ${params.id} → slug=${slug}`)
            }
          } else {
            // Property already exists (e.g. from Stripe webhook) — make sure it's active
            await supabase
              .from('properties')
              .update({ listing_status: 'active' })
              .eq('source_submission_id', params.id)
            console.log(`[admin approve] Existing property re-activated for submission ${params.id}`)
          }
        }
      } catch (propErr) {
        console.error('[admin approve] property sync error (non-fatal):', propErr)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('submission update error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
