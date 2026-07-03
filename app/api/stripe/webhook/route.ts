import { NextRequest, NextResponse } from 'next/server'
import { stripe, PACKAGE_DAYS } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'
import Stripe from 'stripe'
import { sendNewListingAlert, sendListingConfirmation, sendPaymentConfirmation } from '@/lib/email'

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

    if (error) {
      console.error('Failed to activate submission:', error)
    } else {
      console.log(`Submission ${submissionId} activated (${packageId})`)

      // ── Send email notifications ──────────────────────────────────────────
      try {
        const { data: sub } = await supabase
          .from('submissions')
          .select('id, title, type, price, rent_type, size, bedrooms, bathrooms, address, district, province, contact_name, contact_phone, contact_email, package_type')
          .eq('id', submissionId)
          .single()

        if (sub) {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spacesmate.com'
          const emailData = {
            id:           String(sub.id),
            title:        sub.title,
            type:         sub.type,
            price:        sub.price,
            rentSuffix:   sub.rent_type === 'day' ? '/วัน' : '/เดือน',
            sizeSqm:      sub.size,
            bedrooms:     sub.bedrooms,
            bathrooms:    sub.bathrooms,
            address:      sub.address,
            district:     sub.district,
            province:     sub.province,
            contactName:  sub.contact_name,
            contactPhone: sub.contact_phone,
            contactEmail: sub.contact_email,
            packageType:  sub.package_type,
            listingUrl:   `${siteUrl}/search`,
            source:       'public_submit' as const,
          }
          await Promise.all([
            sendNewListingAlert(emailData),
            sendListingConfirmation(emailData),
          ])
        }
      } catch (emailErr) {
        // Email failure must never fail the webhook — Stripe will retry otherwise
        console.error('[email] notification error (non-fatal):', emailErr)
      }
    }
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

    const { data: renewedSub, error } = await supabase
      .from('submissions')
      .update({ status: 'approved', expires_at: expiresAt.toISOString() })
      .eq('stripe_subscription_id', subscriptionId)
      .select('title, contact_email, contact_name, package_type')
      .single()

    if (error) {
      console.error('Failed to renew submission:', error)
    } else {
      console.log(`Subscription ${subscriptionId} renewed`)
      // Send payment confirmation email
      try {
        const amountPaid = (invoice.amount_paid ?? 0) / 100 // Stripe amount is in satang
        if (renewedSub?.contact_email) {
          await sendPaymentConfirmation({
            contactEmail:  renewedSub.contact_email,
            contactName:   renewedSub.contact_name ?? null,
            packageType:   renewedSub.package_type ?? packageId,
            amount:        amountPaid,
            expiresAt:     expiresAt.toISOString(),
            listingTitle:  renewedSub.title ?? null,
          })
        }
      } catch (emailErr) {
        console.error('[email] payment confirmation error (non-fatal):', emailErr)
      }
    }
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
