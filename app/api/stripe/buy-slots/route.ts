import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES, PACKAGE_DAYS } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'
import { requireAuth, isErr } from '@/lib/auth-guard'

/**
 * Buy publishing slots.
 *
 * Deliberately knows nothing about any listing. That is the whole point of the
 * change: previously every payment route needed a property_id or created a
 * submissions row first, so /pricing had nothing it could sell to someone who
 * had not already filled in the form.
 *
 * The slots are created by the webhook on checkout.session.completed, never
 * here — a redirect the customer abandons must not grant anything.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isErr(auth)) return auth

  try {
    const { package_id = 'basic', quantity = 1, publish_property_id = null } = await req.json()

    const priceId = STRIPE_PRICES[package_id as keyof typeof STRIPE_PRICES]
    if (!priceId) return NextResponse.json({ error: 'Invalid package' }, { status: 400 })

    // Bound it. A typo in a quantity field should not create a 10,000-unit
    // subscription, and Stripe will happily take the order.
    const qty = Math.max(1, Math.min(Math.floor(Number(quantity) || 1), 50))

    const supabase = createServerClient()

    // Optional: publish this listing into the slot as soon as it exists, so
    // "renew" is one step for the customer rather than pay-then-go-find-it.
    // Ownership is checked HERE, not in the webhook, where a forged metadata
    // value would arrive with no session to verify it against.
    let publishId: string | null = null
    if (publish_property_id) {
      const { data: owned } = await supabase
        .from('properties')
        .select('id, landlord_id')
        .eq('id', publish_property_id)
        .maybeSingle()
      if (owned?.landlord_id === auth.id) publishId = owned.id as string
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('email, stripe_customer_id')
      .eq('id', auth.id)
      .single()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spacesmate.com'
    const days = PACKAGE_DAYS[package_id as keyof typeof PACKAGE_DAYS] ?? 30

    // Reuse the customer so a saved card is pre-filled.
    const customerParams = profile?.stripe_customer_id
      ? { customer: profile.stripe_customer_id }
      : { customer_email: profile?.email || undefined }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      ...customerParams,
      line_items: [{ price: priceId, quantity: qty }],
      subscription_data: {
        metadata: {
          slot_purchase: 'true',
          user_id:       auth.id,
          package_id,
          quantity:      String(qty),
          duration_days: String(days),
          publish_property_id: publishId ?? '',
        },
      },
      metadata: {
        slot_purchase: 'true',
        user_id:       auth.id,
        package_id,
        quantity:      String(qty),
        publish_property_id: publishId ?? '',
      },
      // sid lets the client-side purchase event carry a transaction_id, so a
      // refresh of the success page does not count as a second purchase.
      success_url: `${siteUrl}/owner-dashboard?slots=${qty}&pkg=${package_id}&sid={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${siteUrl}/pricing`,
      allow_promotion_codes: true,
      locale: 'auto',
      custom_text: {
        submit: {
          message: qty > 1
            ? `ซื้อ ${qty} สล็อต — เผยแพร่ประกาศได้ ${qty} รายการ นาน ${days} วัน`
            : `ซื้อ 1 สล็อต — เผยแพร่ประกาศได้ 1 รายการ นาน ${days} วัน`,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Stripe buy-slots error:', msg)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด', detail: msg }, { status: 500 })
  }
}
