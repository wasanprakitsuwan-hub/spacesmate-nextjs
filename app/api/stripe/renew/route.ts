import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES, PACKAGE_DAYS } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'
import { requireAuth, isErr } from '@/lib/auth-guard'

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isErr(auth)) return auth

  try {
    const { property_id, package_id = 'basic' } = await req.json()
    if (!property_id) return NextResponse.json({ error: 'property_id required' }, { status: 400 })

    const priceId = STRIPE_PRICES[package_id as keyof typeof STRIPE_PRICES]
    if (!priceId) return NextResponse.json({ error: 'Invalid package' }, { status: 400 })

    const supabase = createServerClient()

    // Verify ownership + fetch listing details
    const { data: property } = await supabase
      .from('properties')
      .select('id, title_th, landlord_id, listing_status, source_submission_id')
      .eq('id', property_id)
      .single()

    if (!property || property.landlord_id !== auth.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Fetch user email for Stripe
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('id', auth.id)
      .single()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spacesmate.com'
    const durationDays = PACKAGE_DAYS[package_id as keyof typeof PACKAGE_DAYS] ?? 30

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: profile?.email || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: {
          renew_property_id:      property_id,
          source_submission_id:   property.source_submission_id ?? '',
          package_id,
          duration_days:          String(durationDays),
          listing_title:          property.title_th || '',
          user_id:                auth.id,
        },
      },
      metadata: {
        renew_property_id:    property_id,
        package_id,
      },
      success_url: `${siteUrl}/owner-dashboard?renewed=1`,
      cancel_url:  `${siteUrl}/owner-dashboard`,
      allow_promotion_codes: true,
      locale: 'auto',
      custom_text: {
        submit: {
          message: `ต่ออายุประกาศ "${property.title_th || 'ทรัพย์สินของคุณ'}" — จะเผยแพร่ทันทีหลังชำระเงิน`,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Stripe renew error:', msg)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด', detail: msg }, { status: 500 })
  }
}
