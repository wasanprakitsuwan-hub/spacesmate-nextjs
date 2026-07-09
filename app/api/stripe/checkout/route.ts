import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES, PACKAGE_DAYS } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const packageId:       string = body.packageId       || 'basic'
    const promotionCodeId: string = body.promotionCodeId || ''

    const priceId = STRIPE_PRICES[packageId]
    if (!priceId) {
      return NextResponse.json(
        { error: 'ไม่พบแพ็กเกจที่เลือก กรุณาตรวจสอบการตั้งค่า Stripe' },
        { status: 400 }
      )
    }

    // ── 0. Capture logged-in user_id if present (non-fatal) ─────────────────
    const supabase = createServerClient()
    let userId: string | null = null
    const authToken = req.headers.get('authorization')?.replace('Bearer ', '')
    if (authToken) {
      try {
        const { data: { user } } = await supabase.auth.getUser(authToken)
        userId = user?.id ?? null
      } catch { /* no-op — guest checkout is allowed */ }
    }

    // ── 1. Save submission as pending_payment ───────────────────────────────
    // Support both new rich FormState fields and old simplified fields (backward compat)
    const titleTh      = body.title_th      || body.title       || null
    const propType     = body.property_type || body.type        || null
    const descTh       = body.description_th || body.description || null
    const addrTh       = body.address_th    || body.address     || null
    const subDistrict  = body.sub_district  || body.subdistrict || null
    const roomTypes    = body.room_types    || null  // serialized apartment_units / condo_rental / charges

    const { data: submission, error: dbError } = await supabase
      .from('submissions')
      .insert([{
        title:         titleTh,
        type:          propType,
        rent_type:     body.rentType      || 'month',
        rental_term:   body.rental_term   || body.rentalTerm || 'monthly',
        price:         body.price_from    ?? (body.price ? parseInt(body.price) : null),
        size:          body.area_sqm      || body.size || null,
        bedrooms:      body.bedrooms      ? parseInt(String(body.bedrooms))  : null,
        bathrooms:     body.bathrooms     ? parseInt(String(body.bathrooms)) : null,
        floor:         body.floor         || null,
        description:   descTh,
        amenities:     body.amenities     || [],
        address:       addrTh,
        province:      body.province      || null,
        district:      body.district      || null,
        subdistrict:   subDistrict,
        postcode:      body.postcode      || null,
        contact_name:  body.contactName   || null,
        contact_phone: body.contactPhone  || null,
        contact_email: body.contactEmail  || null,
        images:        Array.isArray(body.images) ? body.images : [],
        // Rich fields stored as extra JSON columns (if columns exist) or ignored gracefully
        title_en:       body.title_en      || null,
        description_en: body.description_en || null,
        lat:            body.lat           || null,
        lng:            body.lng           || null,
        room_types:     roomTypes,
        video_url:      body.video_url     || null,
        package_type:  packageId,
        user_id:       userId,             // stamped immediately if logged in
        status:        'pending_payment', // activated by webhook after payment
      }])
      .select('id')
      .single()

    if (dbError || !submission) {
      console.error('Supabase insert error:', dbError)
      return NextResponse.json({ error: 'บันทึกข้อมูลไม่สำเร็จ' }, { status: 500 })
    }

    const submissionId = submission.id as string
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spacesmate.com'

    // Package display names for Stripe
    const PACKAGE_LABELS: Record<string, string> = {
      basic:    'SpacesMate Basic — ลงประกาศ 1 เดือน',
      standard: 'SpacesMate Standard — ลงประกาศ 3 เดือน',
      premium:  'SpacesMate Premium — ลงประกาศ 12 เดือน',
    }

    // ── 2. Create Stripe Checkout Session ──────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: body.contactEmail || undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Pass submission ID so webhook can activate the listing
      subscription_data: {
        metadata: {
          submission_id: submissionId,
          package_id:    packageId,
          listing_title: body.title_th || body.title || '',
        },
      },
      metadata: {
        submission_id: submissionId,
        package_id:    packageId,
      },
      success_url: `${siteUrl}/submit/success?session_id={CHECKOUT_SESSION_ID}&id=${submissionId}`,
      cancel_url:  `${siteUrl}/submit/cancel?id=${submissionId}`,
      // If a promo code was validated on our page, apply it directly.
      // Otherwise let Stripe show the promo code field at checkout.
      ...(promotionCodeId
        ? { discounts: [{ promotion_code: promotionCodeId }] }
        : { allow_promotion_codes: true }),
      locale: 'auto',
      custom_text: {
        submit: {
          message: `ประกาศ "${body.title_th || body.title || 'ทรัพย์สินของคุณ'}" จะเผยแพร่ทันทีหลังชำระเงิน`,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Stripe checkout error:', msg)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดกับระบบชำระเงิน', detail: msg }, { status: 500 })
  }
}
