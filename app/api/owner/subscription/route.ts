import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'

// GET — return current subscription status for the logged-in owner
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('package_type, package_expires_at, stripe_subscription_id, stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Fetch live Stripe subscription status if we have an ID
  let stripeStatus: string | null = null
  let nextBillingDate: string | null = null
  let cancelAtPeriodEnd = false

  if (profile.stripe_subscription_id) {
    try {
      const sub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id)
      stripeStatus      = sub.status
      cancelAtPeriodEnd = sub.cancel_at_period_end
      nextBillingDate   = sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null
    } catch {
      // Subscription may have been deleted in Stripe — treat as cancelled
      stripeStatus = 'canceled'
    }
  }

  return NextResponse.json({
    package_type:          profile.package_type,
    package_expires_at:    profile.package_expires_at,
    stripe_subscription_id: profile.stripe_subscription_id,
    stripe_status:         stripeStatus,
    cancel_at_period_end:  cancelAtPeriodEnd,
    next_billing_date:     nextBillingDate,
  })
}

// DELETE — cancel the subscription at period end
export async function DELETE(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('stripe_subscription_id, package_type, package_expires_at')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (!profile.stripe_subscription_id) {
    return NextResponse.json({ error: 'ไม่พบข้อมูล subscription' }, { status: 400 })
  }

  try {
    // Cancel at period end — listing stays active until expiry
    await stripe.subscriptions.update(profile.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    return NextResponse.json({
      success: true,
      message: 'ยกเลิก subscription แล้ว — ประกาศยังเผยแพร่ได้จนถึงวันหมดอายุ',
      expires_at: profile.package_expires_at,
    })
  } catch (err: any) {
    console.error('Cancel subscription error:', err)
    return NextResponse.json({ error: err.message ?? 'ยกเลิกไม่สำเร็จ' }, { status: 500 })
  }
}
