import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'

/** An active Stripe promotion code by what the buyer typed, or null. Server only. */
export async function findPromotionCode(code: string): Promise<Stripe.PromotionCode | null> {
  const clean = code.trim()
  if (!clean || clean.length > 64) return null
  const list = await stripe.promotionCodes.list({ code: clean, active: true, limit: 1 })
  const promo = list.data[0]
  if (!promo) return null
  if (promo.expires_at && promo.expires_at * 1000 < Date.now()) return null
  return promo
}

/**
 * What a checkout session gets for an optional promotion code id: the code
 * attached as a discount, or Stripe's own promo field when none was applied.
 * Stripe refuses a session that sets both.
 */
export async function promoSessionParams(promotionCodeId: unknown): Promise<
  { discounts: { promotion_code: string }[] } | { allow_promotion_codes: true }
> {
  if (typeof promotionCodeId === 'string' && promotionCodeId.startsWith('promo_')) {
    const promo = await stripe.promotionCodes.retrieve(promotionCodeId)
    if (promo.active) return { discounts: [{ promotion_code: promo.id }] }
    throw new Error('promo_inactive')
  }
  return { allow_promotion_codes: true }
}
