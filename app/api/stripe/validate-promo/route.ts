// /api/stripe/validate-promo
// Validates a Stripe promotion code and returns discount info.
// Used by /submit/new to show live discounted price before checkout.

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()
    if (!code?.trim()) {
      return NextResponse.json({ valid: false, error: 'กรุณากรอกโค้ดส่วนลด' })
    }

    const list = await stripe.promotionCodes.list({
      code:   code.trim().toUpperCase(),
      active: true,
      limit:  1,
    })

    if (!list.data.length) {
      return NextResponse.json({ valid: false, error: 'โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุแล้ว' })
    }

    const promo  = list.data[0]
    const coupon = promo.coupon

    if (!coupon.valid) {
      return NextResponse.json({ valid: false, error: 'โค้ดส่วนลดนี้หมดอายุแล้ว' })
    }

    // Build discount info
    // THB is a non-zero-decimal currency in Stripe → amount_off is in satang (÷ 100 = baht)
    const result: {
      valid:            true
      promotionCodeId:  string
      discountTHB?:     number
      percentOff?:      number
    } = {
      valid:           true,
      promotionCodeId: promo.id,
    }

    if (coupon.amount_off != null) {
      result.discountTHB = Math.round(coupon.amount_off / 100)
    } else if (coupon.percent_off != null) {
      result.percentOff = coupon.percent_off
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[validate-promo]', err)
    return NextResponse.json({ valid: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' })
  }
}
