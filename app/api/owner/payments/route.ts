import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'
import { requireAuth, isErr } from '@/lib/auth-guard'

export const dynamic = 'force-dynamic'

export interface PaymentRow {
  id: string
  created: string                 // ISO
  amount: number                  // THB, what was actually paid
  currency: string
  package_id: string | null
  kind: 'once' | 'subscription' | 'renewal'
  method: string | null           // 'card' | 'promptpay' | …
  status: 'paid' | 'refunded' | 'partially_refunded'
  listing_title: string | null
  receipt_url: string | null      // Stripe receipt page
  invoice_pdf: string | null      // Stripe invoice PDF, when an invoice exists
  invoice_number: string | null
}

/**
 * GET /api/owner/payments
 *
 * The owner's payment history, read straight from Stripe so it always matches
 * what was charged. Nothing about payments is stored in our database: a slot
 * row knows its package and expiry, not what it cost.
 *
 * WHOSE PAYMENTS. A payment is the caller's only if it is tied to them by
 * something we wrote, never by something they could type:
 *   - a Stripe customer id we saved on their profile or one of their slots, or
 *   - a Checkout Session whose metadata.user_id is their id (we set it when the
 *     session was created, server side, from their login).
 * The email search below only finds candidates; each one must still carry
 * their user_id. Email alone is not proof — an owner can type any email at
 * Stripe's checkout.
 *
 * Sources, merged and de-duplicated:
 *   1. Paid invoices of their customers — subscription first payments and
 *      renewals, and one-time payments made after invoice_creation was turned on.
 *   2. Completed Checkout Sessions (one-time payments without an invoice, which
 *      is every PromptPay/card payment before this change). Many of those were
 *      guest checkouts with no customer, so they are found by the session ids
 *      on their slots and by the account email.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isErr(auth)) return auth
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: 'STRIPE_SECRET_KEY not set' }, { status: 500 })

  const supabase = createServerClient()
  const userId = auth.id

  const [{ data: profile }, { data: slots }] = await Promise.all([
    supabase.from('user_profiles').select('email, stripe_customer_id').eq('id', userId).maybeSingle(),
    supabase.from('listing_slots')
      .select('stripe_customer_id, stripe_checkout_session_id, stripe_subscription_id, property_id')
      .eq('user_id', userId),
  ])

  const customers = new Set<string>()
  if (profile?.stripe_customer_id) customers.add(profile.stripe_customer_id)
  const sessionIds = new Set<string>()
  const subToProperty = new Map<string, string>()
  for (const s of slots ?? []) {
    if (s.stripe_customer_id) customers.add(s.stripe_customer_id)
    if (s.stripe_checkout_session_id) sessionIds.add(s.stripe_checkout_session_id)
    if (s.stripe_subscription_id && s.property_id) subToProperty.set(s.stripe_subscription_id, s.property_id)
  }
  const email = (auth.email || profile?.email || '').trim()

  try {
    const rows = new Map<string, PaymentRow & { _propertyId: string | null }>()
    const invoiceIds = new Set<string>()

    // ── 1. Invoices ────────────────────────────────────────────────────────
    for (const customer of Array.from(customers)) {
      const invoices = await stripe.invoices
        .list({ customer, status: 'paid', limit: 100, expand: ['data.charge'] })
        .autoPagingToArray({ limit: 500 })
      for (const inv of invoices) {
        if ((inv.amount_paid ?? 0) <= 0) continue      // 100%-off promo months: nothing to receipt
        invoiceIds.add(inv.id)
        const charge = (typeof inv.charge === 'object' ? inv.charge : null) as Stripe.Charge | null
        const subId = typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id ?? null
        const meta = inv.subscription_details?.metadata ?? inv.metadata ?? {}
        rows.set(inv.id, {
          id: inv.id,
          created: new Date((inv.status_transitions?.paid_at ?? inv.created) * 1000).toISOString(),
          amount: inv.amount_paid / 100,
          currency: inv.currency.toUpperCase(),
          package_id: meta.package_id || null,
          kind: !subId ? 'once' : inv.billing_reason === 'subscription_cycle' ? 'renewal' : 'subscription',
          method: charge?.payment_method_details?.type ?? null,
          status: refundStatus(charge),
          listing_title: null,
          receipt_url: charge?.receipt_url ?? inv.hosted_invoice_url ?? null,
          invoice_pdf: inv.invoice_pdf ?? null,
          invoice_number: inv.number ?? null,
          _propertyId: meta.extend_property_id || meta.publish_property_id || (subId ? subToProperty.get(subId) ?? null : null),
        })
      }
    }

    // ── 2. Checkout Sessions ───────────────────────────────────────────────
    const sessions = new Map<string, Stripe.Checkout.Session>()
    const sessionExpand = ['data.payment_intent.latest_charge']
    for (const customer of Array.from(customers)) {
      const list = await stripe.checkout.sessions
        .list({ customer, limit: 100, expand: sessionExpand })
        .autoPagingToArray({ limit: 500 })
      for (const s of list) sessions.set(s.id, s)
    }
    if (email) {
      const list = await stripe.checkout.sessions
        .list({ customer_details: { email }, limit: 100, expand: sessionExpand })
        .autoPagingToArray({ limit: 500 })
      for (const s of list) sessions.set(s.id, s)
    }
    for (const id of Array.from(sessionIds)) {
      if (sessions.has(id)) continue
      try {
        sessions.set(id, await stripe.checkout.sessions.retrieve(id, { expand: ['payment_intent.latest_charge'] }))
      } catch { /* a test-mode or deleted session: skip it */ }
    }

    for (const s of Array.from(sessions.values())) {
      const owned = s.metadata?.user_id
        ? s.metadata.user_id === userId
        : !!(typeof s.customer === 'string' && customers.has(s.customer))
      if (!owned) continue
      if (s.mode !== 'payment' || s.status !== 'complete' || s.payment_status !== 'paid') continue
      const invId = typeof s.invoice === 'string' ? s.invoice : s.invoice?.id ?? null
      if (invId && invoiceIds.has(invId)) continue   // already listed from its invoice
      const pi = (typeof s.payment_intent === 'object' ? s.payment_intent : null) as Stripe.PaymentIntent | null
      const charge = (pi && typeof pi.latest_charge === 'object' ? pi.latest_charge : null) as Stripe.Charge | null
      if ((s.amount_total ?? 0) <= 0) continue
      const key = pi?.id ?? s.id
      if (rows.has(key)) continue
      rows.set(key, {
        id: key,
        created: new Date((charge?.created ?? s.created) * 1000).toISOString(),
        amount: (s.amount_total ?? 0) / 100,
        currency: (s.currency ?? 'thb').toUpperCase(),
        package_id: s.metadata?.package_id || null,
        kind: 'once',
        method: charge?.payment_method_details?.type ?? null,
        status: refundStatus(charge),
        listing_title: null,
        receipt_url: charge?.receipt_url ?? null,
        invoice_pdf: null,
        invoice_number: null,
        _propertyId: s.metadata?.extend_property_id || s.metadata?.publish_property_id || null,
      })
    }

    // ── Listing titles ─────────────────────────────────────────────────────
    const propIds = Array.from(new Set(Array.from(rows.values()).map(r => r._propertyId).filter((x): x is string => !!x)))
    if (propIds.length) {
      const { data: props } = await supabase
        .from('properties').select('id, title_th, title_en, landlord_id').in('id', propIds)
      const titles = new Map((props ?? [])
        .filter(p => p.landlord_id === userId)   // never show someone else's listing name
        .map(p => [p.id, { th: p.title_th as string, en: (p.title_en as string | null) ?? null }]))
      const locale = req.nextUrl.searchParams.get('locale') === 'en' ? 'en' : 'th'
      for (const r of Array.from(rows.values())) {
        const t = r._propertyId ? titles.get(r._propertyId) : undefined
        if (t) r.listing_title = locale === 'en' ? (t.en || t.th) : t.th
      }
    }

    const payments: PaymentRow[] = Array.from(rows.values())
      .map(({ _propertyId, ...r }) => { void _propertyId; return r })
      .sort((a, b) => b.created.localeCompare(a.created))

    return NextResponse.json({ payments })
  } catch (err) {
    console.error('owner payments GET error:', err)
    return NextResponse.json({ error: 'Failed to load payments' }, { status: 500 })
  }
}

function refundStatus(charge: Stripe.Charge | null): PaymentRow['status'] {
  if (!charge || !charge.amount_refunded) return 'paid'
  return charge.amount_refunded >= charge.amount ? 'refunded' : 'partially_refunded'
}
