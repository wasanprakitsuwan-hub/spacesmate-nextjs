import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { requireAdmin, isErr } from '@/lib/auth-guard'

export const dynamic = 'force-dynamic'

// Start of a calendar month in Bangkok time (UTC+7, no DST), as a Unix timestamp.
function bangkokMonthStart(offsetMonths: number): number {
  const now = new Date(Date.now() + 7 * 3600_000)
  const y = now.getUTCFullYear(), m = now.getUTCMonth() + offsetMonths
  return Math.floor((Date.UTC(y, m, 1) - 7 * 3600_000) / 1000)
}

// GET /api/dashboard/revenue
// Paid Stripe charges for this month and last month, net of refunds, plus the
// latest payments. Read straight from Stripe so it always matches the payouts.
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: 'STRIPE_SECRET_KEY not set' }, { status: 500 })

  try {
    const lastStart = bangkokMonthStart(-1)
    const thisStart = bangkokMonthStart(0)
    const charges = await stripe.charges.list({ created: { gte: lastStart }, limit: 100 }).autoPagingToArray({ limit: 2000 })
    const paid = charges.filter(c => c.paid && c.status === 'succeeded' && c.amount_refunded < c.amount)

    const sum = (from: number, to: number) => {
      const rows = paid.filter(c => c.created >= from && c.created < to)
      return {
        amount: rows.reduce((s, c) => s + (c.amount - c.amount_refunded), 0) / 100,
        count: rows.length,
      }
    }

    return NextResponse.json({
      currency: (paid[0]?.currency ?? 'thb').toUpperCase(),
      thisMonth: sum(thisStart, Infinity),
      lastMonth: sum(lastStart, thisStart),
      recent: paid.slice(0, 15).map(c => ({
        id: c.id,
        amount: (c.amount - c.amount_refunded) / 100,
        refunded: c.amount_refunded > 0,
        created: new Date(c.created * 1000).toISOString(),
        email: c.billing_details?.email ?? c.receipt_email ?? null,
        description: c.description ?? null,
        method: c.payment_method_details?.type ?? null,
      })),
    })
  } catch (err) {
    console.error('revenue GET error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to load revenue' }, { status: 500 })
  }
}
