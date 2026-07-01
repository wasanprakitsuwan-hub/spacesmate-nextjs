import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES, PACKAGE_DAYS } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const packageId: string = body.packageId || 'basic'

    const priceId = STRIPE_PRICES[packageId]
    if (!priceId) {
      return NextResponse.json(
        { error: 'ไม่พบแพ็กเกจที่เลือก กรุณาตรวจสอบการตั้งค่า Stripe' },
        { status: 400 }
      )
    }

    // ── 1. Save submission as pending_payment ───────────────────────────────
    const supabase = createServerClient()
    const { data: submission, error: dbError } = await supabase
      .from('submissions')
      .insert([{
        title:         body.title         || null,
        type:          body.type          || null,
        rent_type:     body.rentType      || 'month',
        rental_term:   body.rentalTerm    || 'monthly',
        price:         body.price         ? parseInt(body.price)     : null,
        size:          body.size          || null,
        bedrooms:      body.bedrooms      ? parseInt(body.bedrooms)  : null,
        bathrooms:     body.bathrooms     ? parseInt(body.bathrooms) : null,
        floor:         body.floor         || null,
        description:   body.description   || null,
        amenities:     body.amenities     || [],
        address:       body.address       || null,
        province:      body.province      || null,
        district:      body.district      || null,
        subdistrict:   body.subdistrict   || null,
        postcode:      body.postcode      || null,
        contact_name:  body.contactName   || null,
        contact_phone: body.contactPhone  || null,
        contact_email: body.contactEmail  || null,
        package_type:  packageId,
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
          listing_title: body.title || '',
        },
      },
      metadata: {
        submission_id: submissionId,
        package_id:    packageId,
      },
      success_url: `${siteUrl}/submit/success?session_id={CHECKOUT_SESSION_ID}&id=${submissionId}`,
      cancel_url:  `${siteUrl}/submit/cancel?id=${submissionId}`,
      locale: 'auto',
      custom_text: {
        submit: {
          message: `ประกาศ "${body.title || 'ทรัพย์สินของคุณ'}" จะเผยแพร่ทันทีหลังชำระเงิน`,
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
