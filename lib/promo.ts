/**
 * The checkout promotion: one code, typed by the owner at /checkout.
 *
 * Codes are created in Stripe (Products › Coupons › Promotion codes), where
 * their amount, expiry and "first purchase only" rules live. This setting only
 * says which code to advertise on the checkout page and what to call it, so
 * changing the offer is: create the code in Stripe, then change it here
 * (Dashboard › Settings › การชำระเงิน). Stored in site_settings under
 * 'checkout_promo' and readable through /api/settings/public, because it is
 * shown to every buyer anyway.
 */
export type CheckoutPromo = {
  enabled: boolean
  code: string
  title_th: string
  title_en: string
  note_th: string
  note_en: string
}

export const DEFAULT_PROMO: CheckoutPromo = {
  // Off until the code exists in Stripe; an advertised code that Stripe
  // rejects is worse than no banner.
  enabled: false,
  code: 'SM299',
  title_th: 'ลงประกาศแรกฟรี 1 เดือน',
  title_en: 'Your first listing free for 1 month',
  note_th: 'กรอกโค้ดด้านล่าง ลด ฿299 สำหรับการซื้อครั้งแรก',
  note_en: 'Enter the code below for ฿299 off your first purchase',
}

export function normalisePromo(raw: unknown): CheckoutPromo {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<CheckoutPromo>
  return {
    enabled: r.enabled === true,
    code: typeof r.code === 'string' ? r.code.trim().toUpperCase() : DEFAULT_PROMO.code,
    title_th: r.title_th || DEFAULT_PROMO.title_th,
    title_en: r.title_en || DEFAULT_PROMO.title_en,
    note_th: r.note_th || DEFAULT_PROMO.note_th,
    note_en: r.note_en || DEFAULT_PROMO.note_en,
  }
}
