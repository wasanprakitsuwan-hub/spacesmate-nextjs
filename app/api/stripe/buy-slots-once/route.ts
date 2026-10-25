import { NextRequest, NextResponse } from 'next/server'
import { stripe, PACKAGE_DAYS } from '@/lib/stripe'
import { PACKAGE_PRICE_THB } from '@/lib/packages'
import { createServerClient } from '@/lib/supabase'
import { requireAuth, isErr } from '@/lib/auth-guard'
import { promoSessionParams } from '@/lib/stripe-promo'

/**
 * Buy publishing slots as a one-time payment — PromptPay or card.
 *
 * THE PRIMARY PURCHASE PATH. /api/stripe/buy-slots is the secondary one: it
 * sells the same slots as a card subscription that auto-renews, for owners who
 * would rather not think about it again.
 *
 * Why the split is by BILLING MODEL and not by payment method
 *   Stripe's PromptPay supports one-time payments only — it cannot back
 *   recurring billing, and is hidden entirely on subscription sessions. So a
 *   route that must offer PromptPay has to be `mode: 'payment'`. Once it is,
 *   card works here too, which is why this route now carries both and the
 *   customer picks at Stripe rather than before it.
 *
 *   The old shape — card here, PromptPay there — made the buyer choose a
 *   billing model while thinking they were choosing a payment method. Thai
 *   owners overwhelmingly reach for PromptPay, so the old default quietly
 *   pushed the most common payment method onto the secondary button.
 *
 * Consequences the customer must be told about, and is, on the button:
 *   · no auto-renew — the slot lapses and the listing comes down
 *   · PromptPay payment is asynchronous — the QR may be scanned minutes later
 *
 * The last one is why the webhook holds the grant until payment_status stops
 * being 'unpaid', and why checkout.session.async_payment_succeeded must be
 * enabled on the Stripe endpoint. Without that event subscribed, a paid QR
 * grants nothing at all. Card on this route settles synchronously and is
 * granted by checkout.session.completed like any other paid session.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isErr(auth)) return auth

  try {
    const { package_id = 'basic', quantity = 1, publish_property_id = null, extend_property_id = null, promotion_code_id = null, method = null } = await req.json()

    const unitPrice = PACKAGE_PRICE_THB[package_id as keyof typeof PACKAGE_PRICE_THB]
    if (!unitPrice || unitPrice <= 0) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
    }

    // Same bound as the card route. A typo in a quantity field should not
    // create a 10,000-slot order, and Stripe will happily take it.
    // Extending buys exactly one term for one listing.
    const qty = extend_property_id ? 1 : Math.max(1, Math.min(Math.floor(Number(quantity) || 1), 50))

    const supabase = createServerClient()

    // Ownership is checked HERE, not in the webhook, where a forged metadata
    // value would arrive with no session to verify it against.
    let publishId: string | null = null
    if (publish_property_id) {
      const { data: owned } = await supabase
        .from('properties')
        .select('id, landlord_id')
        .eq('id', publish_property_id)
        .maybeSingle()
      if (owned && owned.landlord_id === auth.id) publishId = owned.id as string
    }

    // Same check for an extension: the term is added to this listing's slot.
    let extendId: string | null = null
    if (extend_property_id) {
      const { data: owned } = await supabase
        .from('properties')
        .select('id, landlord_id')
        .eq('id', extend_property_id)
        .maybeSingle()
      if (!owned || owned.landlord_id !== auth.id) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
      }
      extendId = owned.id as string
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('email, stripe_customer_id')
      .eq('id', auth.id)
      .single()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spacesmate.com'
    const days    = PACKAGE_DAYS[package_id as keyof typeof PACKAGE_DAYS] ?? 30

    const customerParams = profile?.stripe_customer_id
      ? { customer: profile.stripe_customer_id }
      : { customer_email: profile?.email || undefined }

    // The metadata contract is identical to the card route's. The webhook reads
    // exactly these keys and does not care which route produced the session —
    // so a PromptPay purchase is granted by the same code path as a card one,
    // and the two cannot drift apart.
    const metadata = {
      slot_purchase: 'true',
      user_id:       auth.id,
      package_id,
      quantity:      String(qty),
      duration_days: String(days),
      publish_property_id: publishId ?? '',
      // Set when the owner pressed Extend: the webhook adds this term to the
      // slot the listing already holds instead of leaving a new free slot.
      extend_property_id: extendId ?? '',
      // Recorded on the slot as `source`, so a one-time slot is
      // distinguishable from a subscription slot when one silently fails to
      // renew and somebody has to work out why.
      //
      // 'once' rather than the method the buyer picks at Stripe: what matters
      // downstream is that this slot does not renew. The actual instrument is
      // on the PaymentIntent if anyone ever needs it.
      payment_method: 'once',
    }

    // A code typed and checked on /checkout rides in as a discount.
    const promoParams = await promoSessionParams(promotion_code_id)
    // /checkout lets the buyer pick PromptPay or card up front; without a
    // choice Stripe offers both, as before.
    const methods: ('promptpay' | 'card')[] = method === 'promptpay' ? ['promptpay'] : method === 'card' ? ['card'] : ['promptpay', 'card']

    const session = await stripe.checkout.sessions.create({
      // One-time, not subscription — and therefore able to offer PromptPay,
      // which cannot do recurring. Card rides along on the same session.
      mode: 'payment',
      payment_method_types: methods,
      ...customerParams,
      line_items: [{
        // Inline rather than a Price ID: STRIPE_PRICES holds recurring prices,
        // which are not valid in payment mode.
        price_data: {
          currency: 'thb',
          unit_amount: unitPrice * 100,   // satang
          product_data: {
            name: extendId
              ? `SpacesMate ${package_id} — ต่ออายุประกาศ ${days} วัน`
              : `SpacesMate ${package_id} — แพ็กเกจลงประกาศ ${days} วัน`,
            description: '1 แพ็กเกจ = ประกาศออนไลน์ 1 รายการ · จ่ายครั้งเดียว ไม่ต่ออัตโนมัติ',
          },
        },
        quantity: qty,
      }],
      metadata,
      // sid lets the client-side purchase event carry a transaction_id, so a
      // refresh of the success page does not count as a second purchase.
      success_url: `${siteUrl}/owner-dashboard?slots=${qty}&pkg=${package_id}&pp=1&sid={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${siteUrl}/checkout`,
      ...promoParams,
      locale: 'auto',
      // One hour, kept deliberately short now that card shares this session.
      //
      // The tempting change is 24h so a card buyer who wanders off still has a
      // live session. It is the wrong trade: a QR that stays payable for a day
      // can be scanned long after the buyer gave up and bought again, and a
      // duplicate charge costs more — in money and in trust — than the re-click
      // a lapsed session costs. An expired session is one button press to
      // recreate; a duplicate payment is a refund conversation.
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
      custom_text: {
        submit: {
          message:
            'จ่ายครั้งเดียว ไม่มีการต่ออายุอัตโนมัติ — ' +
            `แพ็กเกจใช้งานได้ ${days} วันนับจากวันที่เผยแพร่ประกาศ`,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[slots/promptpay] checkout error:', msg)
    return NextResponse.json({ error: msg || 'ไม่สามารถเริ่มการชำระเงินได้' }, { status: 500 })
  }
}
