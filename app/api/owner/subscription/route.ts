import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES, PACKAGE_DAYS } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'

export interface SubscriptionItem {
  submission_id: string | null
  listing_title: string | null
  stripe_subscription_id: string
  stripe_status: string
  package_type: string
  expires_at: string | null
  cancel_at_period_end: boolean
  next_billing_date: string | null
}

// GET — return ALL subscriptions for the logged-in owner
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get profile — need both stripe_customer_id and the direct stripe_subscription_id
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('stripe_customer_id, stripe_subscription_id, package_type, package_expires_at')
    .eq('id', user.id)
    .single()

  // Build a map: stripe_subscription_id → DB metadata
  const subMap = new Map<string, {
    submission_id: string | null
    listing_title: string | null
    package_type: string
    expires_at: string | null
  }>()

  // 1. Submissions owned by this user_id
  const { data: ownedSubs } = await supabase
    .from('submissions')
    .select('id, title_th, title, stripe_subscription_id, package_type, expires_at')
    .eq('user_id', user.id)
    .not('stripe_subscription_id', 'is', null)

  for (const sub of ownedSubs ?? []) {
    if (sub.stripe_subscription_id) {
      subMap.set(sub.stripe_subscription_id, {
        submission_id: sub.id,
        listing_title: (sub as any).title_th || sub.title || null,
        package_type:  sub.package_type || 'basic',
        expires_at:    sub.expires_at,
      })
    }
  }

  // 2. Direct stripe_subscription_id on user_profiles
  //    (covers cases where checkout was anonymous — no user_id on submissions,
  //     no stripe_customer_id populated — but profile was manually/webhook updated)
  if (profile?.stripe_subscription_id && !subMap.has(profile.stripe_subscription_id)) {
    const { data: matchedSub } = await supabase
      .from('submissions')
      .select('id, title_th, title, package_type, expires_at')
      .eq('stripe_subscription_id', profile.stripe_subscription_id)
      .maybeSingle()

    subMap.set(profile.stripe_subscription_id, {
      submission_id: matchedSub?.id ?? null,
      listing_title: (matchedSub as any)?.title_th || matchedSub?.title || null,
      package_type:  matchedSub?.package_type || (profile as any).package_type || 'basic',
      expires_at:    matchedSub?.expires_at ?? (profile as any).package_expires_at ?? null,
    })
  }

  // 3. Subscriptions linked to this user's Stripe customer_id
  //    (covers anonymous checkouts where submission.user_id is null)
  if (profile?.stripe_customer_id) {
    try {
      const customerSubs = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        limit: 20,
      })
      for (const stripeSub of customerSubs.data) {
        if (subMap.has(stripeSub.id)) continue  // already captured via user_id

        // Try to find corresponding submission row
        const { data: matchedSub } = await supabase
          .from('submissions')
          .select('id, title_th, title, package_type, expires_at')
          .eq('stripe_subscription_id', stripeSub.id)
          .maybeSingle()

        subMap.set(stripeSub.id, {
          submission_id: matchedSub?.id ?? null,
          listing_title: (matchedSub as any)?.title_th || matchedSub?.title || null,
          package_type:  stripeSub.metadata?.package_id || matchedSub?.package_type || 'basic',
          expires_at:    matchedSub?.expires_at ?? null,
        })
      }
    } catch {
      // Stripe customer not found or API error — non-fatal
    }
  }

  // 4. Fetch live Stripe status for every entry in the map
  const results: SubscriptionItem[] = []

  for (const [subId, meta] of Array.from(subMap.entries())) {
    try {
      const stripeSub = await stripe.subscriptions.retrieve(subId)
      results.push({
        submission_id:           meta.submission_id,
        listing_title:           meta.listing_title,
        stripe_subscription_id:  subId,
        stripe_status:           stripeSub.status,
        package_type:            (stripeSub.metadata?.package_id as string) || meta.package_type,
        expires_at:              meta.expires_at,
        cancel_at_period_end:    stripeSub.cancel_at_period_end,
        next_billing_date:       stripeSub.current_period_end
          ? new Date(stripeSub.current_period_end * 1000).toISOString()
          : null,
      })
    } catch {
      // Subscription was deleted in Stripe — include as cancelled so owner can see it
      results.push({
        submission_id:          meta.submission_id,
        listing_title:          meta.listing_title,
        stripe_subscription_id: subId,
        stripe_status:          'canceled',
        package_type:           meta.package_type,
        expires_at:             meta.expires_at,
        cancel_at_period_end:   false,
        next_billing_date:      null,
      })
    }
  }

  // Sort: active first, then by expires_at desc
  results.sort((a, b) => {
    const aActive = a.stripe_status === 'active' ? 0 : 1
    const bActive = b.stripe_status === 'active' ? 0 : 1
    if (aActive !== bActive) return aActive - bActive
    return (b.expires_at ?? '').localeCompare(a.expires_at ?? '')
  })

  return NextResponse.json({ subscriptions: results })
}

// PATCH — upgrade a specific subscription to a higher plan (with proration)
export async function PATCH(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { subscription_id?: string; new_package_id?: string } = {}
  try { body = await req.json() } catch { /* empty body */ }

  const { subscription_id: subscriptionId, new_package_id: newPackageId } = body
  if (!subscriptionId) return NextResponse.json({ error: 'subscription_id required' }, { status: 400 })
  if (!newPackageId)   return NextResponse.json({ error: 'new_package_id required' }, { status: 400 })

  const newPriceId = STRIPE_PRICES[newPackageId]
  if (!newPriceId) return NextResponse.json({ error: 'Invalid package' }, { status: 400 })

  // Verify ownership — submission user_id OR stripe_customer_id OR profile.stripe_subscription_id
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('stripe_customer_id, stripe_subscription_id')
    .eq('id', user.id)
    .single()

  const { data: ownedRow } = await supabase
    .from('submissions')
    .select('id')
    .eq('user_id', user.id)
    .eq('stripe_subscription_id', subscriptionId)
    .maybeSingle()

  if (!ownedRow) {
    // Check stripe_customer_id
    if (profile?.stripe_customer_id) {
      try {
        const s = await stripe.subscriptions.retrieve(subscriptionId)
        if (s.customer !== profile.stripe_customer_id) {
          return NextResponse.json({ error: 'ไม่มีสิทธิ์อัปเกรด subscription นี้' }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ error: 'ไม่พบ subscription' }, { status: 404 })
      }
    } else if (profile?.stripe_subscription_id !== subscriptionId) {
      // Last resort — profile.stripe_subscription_id match
      return NextResponse.json({ error: 'ไม่มีสิทธิ์อัปเกรด subscription นี้' }, { status: 403 })
    }
  }

  try {
    // Retrieve current subscription to get item ID and validate tier
    const currentSub = await stripe.subscriptions.retrieve(subscriptionId)
    const currentPriceId = currentSub.items.data[0]?.price?.id
    if (currentPriceId === newPriceId) {
      return NextResponse.json({ error: 'คุณใช้แพ็กเกจนี้อยู่แล้ว' }, { status: 400 })
    }
    const itemId = currentSub.items.data[0]?.id
    if (!itemId) return NextResponse.json({ error: 'ไม่พบรายการใน subscription' }, { status: 400 })

    // Swap price with proration — Stripe charges the difference immediately
    const updatedSub = await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: itemId, price: newPriceId }],
      proration_behavior: 'create_prorations',
      metadata: { ...currentSub.metadata, package_id: newPackageId },
    })

    // Extend expires_at based on new package duration from now
    const durationDays = PACKAGE_DAYS[newPackageId] ?? 30
    const newExpiresAt = new Date()
    newExpiresAt.setDate(newExpiresAt.getDate() + durationDays)

    // Sync new package type to submissions and user_profiles
    await supabase.from('submissions')
      .update({ package_type: newPackageId, expires_at: newExpiresAt.toISOString() })
      .eq('stripe_subscription_id', subscriptionId)

    await supabase.from('user_profiles')
      .update({ package_type: newPackageId, package_expires_at: newExpiresAt.toISOString() })
      .eq('id', user.id)

    console.log(`Subscription ${subscriptionId} upgraded → ${newPackageId}`)
    return NextResponse.json({
      success: true,
      message: `อัปเกรดเป็น ${newPackageId} สำเร็จแล้ว`,
      new_package_type: newPackageId,
      stripe_status: updatedSub.status,
    })
  } catch (err: any) {
    console.error('Upgrade subscription error:', err)
    return NextResponse.json({ error: err.message ?? 'อัปเกรดไม่สำเร็จ' }, { status: 500 })
  }
}

// DELETE — cancel a specific subscription at period end
export async function DELETE(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { subscription_id?: string } = {}
  try { body = await req.json() } catch { /* empty body */ }
  const subscriptionId = body.subscription_id
  if (!subscriptionId) return NextResponse.json({ error: 'subscription_id required' }, { status: 400 })

  // Verify ownership — either a submission owned by this user, or belongs to this user's Stripe customer
  const { data: ownedRow } = await supabase
    .from('submissions')
    .select('id')
    .eq('user_id', user.id)
    .eq('stripe_subscription_id', subscriptionId)
    .maybeSingle()

  if (!ownedRow) {
    // Fallback: check stripe_customer_id
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profile?.stripe_customer_id) {
      try {
        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId)
        if (stripeSub.customer !== profile.stripe_customer_id) {
          return NextResponse.json({ error: 'ไม่มีสิทธิ์ยกเลิก subscription นี้' }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ error: 'ไม่พบ subscription' }, { status: 404 })
      }
    } else {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์ยกเลิก subscription นี้' }, { status: 403 })
    }
  }

  try {
    await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })
    return NextResponse.json({
      success: true,
      message: 'ยกเลิก subscription แล้ว — ประกาศยังเผยแพร่ได้จนถึงวันหมดอายุ',
    })
  } catch (err: any) {
    console.error('Cancel subscription error:', err)
    return NextResponse.json({ error: err.message ?? 'ยกเลิกไม่สำเร็จ' }, { status: 500 })
  }
}
