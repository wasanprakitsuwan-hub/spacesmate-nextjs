import { NextRequest, NextResponse } from 'next/server'
import { stripe, PACKAGE_DAYS } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const sig  = req.headers.get('stripe-signature') ?? ''
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? ''
  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServerClient()

  // ── Handle events ─────────────────────────────────────────────────────────

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const submissionId     = session.metadata?.submission_id
    const packageId        = session.metadata?.package_id || 'basic'
    const subscriptionId   = session.subscription as string | null
    const customerId       = session.customer as string | null

    if (!submissionId) {
      console.error('No submission_id in session metadata')
      return NextResponse.json({ received: true })
    }

    const durationDays = PACKAGE_DAYS[packageId] ?? 30
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + durationDays)

    const { error } = await supabase
      .from('submissions')
      .update({
        status:                 'approved',
        stripe_customer_id:     customerId,
        stripe_subscription_id: subscriptionId,
        expires_at:             expiresAt.toISOString(),
      })
      .eq('id', submissionId)

    if (error) console.error('Failed to activate submission:', error)
    else console.log(`Submission ${submissionId} activated (${packageId})`)
  }

  // Subscription renewed → extend expires_at
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice
    const subscriptionId = invoice.subscription as string | null
    if (!subscriptionId) return NextResponse.json({ received: true })

    // Fetch subscription to get metadata
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const packageId    = subscription.metadata?.package_id || 'basic'
    const durationDays = PACKAGE_DAYS[packageId] ?? 30
    const expiresAt    = new Date()
    expiresAt.setDate(expiresAt.getDate() + durationDays)

    const { error } = await supabase
      .from('submissions')
      .update({ status: 'approved', expires_at: expiresAt.toISOString() })
      .eq('stripe_subscription_id', subscriptionId)

    if (error) console.error('Failed to renew submission:', error)
    else console.log(`Subscription ${subscriptionId} renewed`)
  }

  // Payment failed → mark as expired (listing hidden)
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const subscriptionId = invoice.subscription as string | null
    if (!subscriptionId) return NextResponse.json({ received: true })

    const { error } = await supabase
      .from('submissions')
      .update({ status: 'expired' })
      .eq('stripe_subscription_id', subscriptionId)

    if (error) console.error('Failed to expire submission on failed payment:', error)
    else console.log(`Submission expired — payment failed for subscription ${subscriptionId}`)
  }

  // Subscription cancelled → expire listing
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const subscriptionId = subscription.id

    const { error } = await supabase
      .from('submissions')
      .update({ status: 'expired', stripe_subscription_id: null })
      .eq('stripe_subscription_id', subscriptionId)

    if (error) console.error('Failed to expire submission on cancellation:', error)
    else console.log(`Subscription ${subscriptionId} cancelled — listing expired`)
  }

  return NextResponse.json({ received: true })
}
