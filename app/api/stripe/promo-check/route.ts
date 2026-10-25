import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { PACKAGE_PRICE_THB } from '@/lib/packages'
import { requireAuth, isErr } from '@/lib/auth-guard'
import { findPromotionCode } from '@/lib/stripe-promo'

/**
 * Check a promo code typed at /checkout and say what it takes off.
 *
 * The code itself lives in Stripe; this only looks it up so the page can show
 * "✓ ใช้โค้ด SM299 แล้ว ลด ฿299" before the buyer leaves for Stripe. The
 * payment routes look it up again and attach it to the session, and Stripe
 * enforces its rules (first purchase only, expiry, redemption limits) there.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isErr(auth)) return auth

  try {
    const { code = '', package_id = 'basic', quantity = 1 } = await req.json()
    const promo = await findPromotionCode(String(code))
    if (!promo) return NextResponse.json({ ok: false, reason: 'invalid' })

    const unit = PACKAGE_PRICE_THB[package_id as keyof typeof PACKAGE_PRICE_THB] ?? 0
    const subtotal = unit * Math.max(1, Math.min(Math.floor(Number(quantity) || 1), 50))
    const coupon = typeof promo.coupon === 'string' ? await stripe.coupons.retrieve(promo.coupon) : promo.coupon
    const min = promo.restrictions?.minimum_amount
    if (min && subtotal * 100 < min) return NextResponse.json({ ok: false, reason: 'minimum' })

    let discount = 0
    if (coupon.amount_off && (!coupon.currency || coupon.currency === 'thb')) discount = coupon.amount_off / 100
    else if (coupon.percent_off) discount = Math.round(subtotal * coupon.percent_off) / 100
    discount = Math.min(discount, subtotal)

    return NextResponse.json({
      ok: true,
      code: promo.code,
      promotion_code_id: promo.id,
      discount_thb: discount,
      first_time_only: promo.restrictions?.first_time_transaction === true,
    })
  } catch (err) {
    console.error('[promo-check]', err instanceof Error ? err.message : err)
    return NextResponse.json({ ok: false, reason: 'error' }, { status: 500 })
  }
}
