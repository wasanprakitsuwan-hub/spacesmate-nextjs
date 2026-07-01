import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// ── Package → Stripe Price ID mapping ────────────────────────────────────────
// Set these Price IDs after creating products in your Stripe Dashboard
export const STRIPE_PRICES: Record<string, string> = {
  basic:    process.env.STRIPE_PRICE_BASIC    ?? '',
  standard: process.env.STRIPE_PRICE_STANDARD ?? '',
  premium:  process.env.STRIPE_PRICE_PREMIUM  ?? '',
}

// Package metadata (used to set expires_at on webhook)
export const PACKAGE_DAYS: Record<string, number> = {
  basic:    30,
  standard: 90,
  premium:  365,
}
