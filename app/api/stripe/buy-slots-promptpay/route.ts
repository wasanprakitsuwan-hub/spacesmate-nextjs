import { NextRequest, NextResponse } from 'next/server'
import { stripe, PACKAGE_DAYS } from '@/lib/stripe'
import { PACKAGE_PRICE_THB } from '@/lib/packages'
import { createServerClient } from '@/lib/supabase'
import { requireAuth, isErr } from '@/lib/auth-guard'

/**
 * Buy publishing slots with PromptPay — a one-time payment.
 *
 * Separate from /api/stripe/buy-slots rather than a payment_method_types entry
 * on it, because Stripe's PromptPay supports one-time payments only: it cannot
 * be used for recurring billing and is hidden entirely on subscriptions with a
 * trial. A card buys a subscription that renews; PromptPay buys a fixed term
 * that expires. Those are genuinely different products and this route sells the
 * second one.
 *
 * Consequences the customer must be told about, and is, on the button:
 *   · no auto-renew — the slot lapses and the listing comes down
 *   · payment is asynchronous — the QR may be scanned minutes later
 *
 * The second one is why the webhook holds the grant until payment_status stops
 * being 'unpaid', and why checkout.session.async_payment_succeeded must be
 * enabled on the Stripe endpoint. Without that event subscribed, a paid QR
 * grants nothing at all.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isErr(auth)) return auth

  try {
    const { package_id = 'basic', quantity = 1, publish_property_id = null } = await req.json()

    const unitPrice = PACKAGE_PRICE_THB[package_id as keyof typeof PACKAGE_PRICE_THB]
    if (!unitPrice || unitPrice <= 0) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
    }

    // Same bound as the card route. A typo in a quantity field should not
    // create a 10,000-slot order, and Stripe will happily take it.
    const qty = Math.max(1, Math.min(Math.floor(Number(quantity) || 1), 50))

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
      // Recorded on the slot as `source`, so a one-time slot is
      // distinguishable from a subscription slot when one silently fails to
      // renew and somebody has to work out why.
      payment_method: 'promptpay',
    }

    const session = await stripe.checkout.sessions.create({
      // One-time, not subscription. PromptPay cannot do recurring.
      mode: 'payment',
      payment_method_types: ['promptpay'],
      ...customerParams,
      line_items: [{
        // Inline rather than a Price ID: STRIPE_PRICES holds recurring prices,
        // which are not valid in payment mode.
        price_data: {
          currency: 'thb',
          unit_amount: unitPrice * 100,   // satang
          product_data: {
            name: `SpacesMate ${package_id} — สล็อตลงประกาศ ${days} วัน`,
            description: '1 สล็อต = ประกาศออนไลน์ 1 รายการ · จ่ายครั้งเดียว ไม่ต่ออัตโนมัติ',
          },
        },
        quantity: qty,
      }],
      metadata,
      // sid lets the client-side purchase event carry a transaction_id, so a
      // refresh of the success page does not count as a second purchase.
      success_url: `${siteUrl}/owner-dashboard?slots=${qty}&pkg=${package_id}&pp=1&sid={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${siteUrl}/pricing`,
      allow_promotion_codes: true,
      locale: 'auto',
      // PromptPay QR codes expire. Give a generous window — an owner who walks
      // away to find their banking app should not come back to a dead code.
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
      custom_text: {
        submit: {
          message:
            'สแกน QR เพื่อชำระผ่านพร้อมเพย์ — จ่ายครั้งเดียว ไม่มีการต่ออายุอัตโนมัติ ' +
            `สล็อตจะใช้งานได้ ${days} วันนับจากวันที่เผยแพร่`,
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
