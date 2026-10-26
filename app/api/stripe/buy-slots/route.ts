import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES, PACKAGE_DAYS } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'
import { requireAuth, isErr } from '@/lib/auth-guard'
import { promoSessionParams } from '@/lib/stripe-promo'

/**
 * Buy a publishing slot, by card on auto-renew, for one named listing.
 *
 * Every purchase names its listing (Founder, 26 Oct 2026: the listing is chosen
 * with the package, one room per payment, and a paid slot stays with that
 * listing for its whole term). Slots bought in advance before this rule keep
 * working; nothing new is sold that way.
 *
 * The slots are created by the webhook on checkout.session.completed, never
 * here — a redirect the customer abandons must not grant anything.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isErr(auth)) return auth

  try {
    const { package_id = 'basic', quantity = 1, publish_property_id = null, promotion_code_id = null } = await req.json()

    const priceId = STRIPE_PRICES[package_id as keyof typeof STRIPE_PRICES]
    if (!priceId) return NextResponse.json({ error: 'Invalid package' }, { status: 400 })

    // Bound it. A typo in a quantity field should not create a 10,000-unit
    // subscription, and Stripe will happily take the order.
    // One payment = one listing. `quantity` is still read so an old client
    // does not error, but it no longer buys more than one.
    void quantity
    const qty = 1

    const supabase = createServerClient()

    // The listing this slot is for; the webhook publishes it into the slot as
    // soon as payment succeeds. Ownership is checked HERE, not in the webhook,
    // where a forged metadata value would arrive with no session to verify it
    // against.
    if (!publish_property_id) {
      return NextResponse.json({ error: 'listing_required' }, { status: 400 })
    }
    const { data: owned } = await supabase
      .from('properties')
      .select('id, landlord_id')
      .eq('id', publish_property_id)
      .maybeSingle()
    if (!owned || owned.landlord_id !== auth.id) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }
    const publishId = owned.id as string

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

    // A code typed and checked on /checkout rides in as a discount.
    const promoParams = await promoSessionParams(promotion_code_id)

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
      cancel_url:  `${siteUrl}/checkout`,
      ...promoParams,
      locale: 'auto',
      custom_text: {
        submit: {
          message: `ซื้อ 1 แพ็กเกจ — เผยแพร่ประกาศนี้ นาน ${days} วัน`,
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
