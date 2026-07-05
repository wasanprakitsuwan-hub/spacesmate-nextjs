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

      // ── Sync package info to user_profiles + stamp user_id ───────────────
      const customerEmail = session.customer_details?.email ?? session.customer_email ?? null
      let resolvedUserId: string | null = null

      try {
        if (customerEmail) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('email', customerEmail)
            .single()

          if (profile?.id) {
            resolvedUserId = profile.id
            await supabase.from('user_profiles').update({
              package_type:           packageId,
              package_expires_at:     expiresAt.toISOString(),
              stripe_subscription_id: subscriptionId,
              stripe_customer_id:     customerId,
            }).eq('id', profile.id)
            console.log(`user_profiles updated for ${customerEmail} → package=${packageId}`)

            // Stamp user_id on the submission so multi-sub owners see all packages
            await supabase.from('submissions')
              .update({ user_id: profile.id })
              .eq('id', submissionId)
            console.log(`submissions.user_id stamped → user=${profile.id}`)
          }
        }
      } catch (profileErr) {
        console.error('[profile sync] error (non-fatal):', profileErr)
      }

      // ── Auto-create a properties row so the listing is publicly visible ───
      // Paid submissions stay in `submissions` but public search reads `properties`.
      // We create the property here so it appears live immediately after payment.
      try {
        const { data: sub } = await supabase
          .from('submissions')
          .select('*')
          .eq('id', submissionId)
          .single()

        if (sub) {
          const slug = ((sub.title || 'listing') as string)
            .toLowerCase()
            .replace(/[^฀-๿\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
            .slice(0, 60) + '-' + Date.now().toString(36)

          const { error: propErr } = await supabase.from('properties').insert({
            slug,
            source_submission_id: submissionId,
            landlord_id:          resolvedUserId,
            title_th:             sub.title       || '',
            description_th:       sub.description || null,
            property_type:        sub.type        || 'คอนโดมิเนียม',
            price_from:           sub.price       || 0,
            area_sqm:             sub.size ? parseFloat(String(sub.size)) : null,
            bedrooms:             sub.bedrooms    || null,
            bathrooms:            sub.bathrooms   || null,
            floor:                sub.floor       || null,
            address_th:           sub.address     || null,
            district:             sub.district    || null,
            sub_district:         sub.subdistrict || null,
            province:             sub.province    || 'กรุงเทพมหานคร',
            postcode:             sub.postcode    || null,
            amenities:            Array.isArray(sub.amenities) ? sub.amenities : [],
            images:               Array.isArray(sub.images)    ? sub.images    : [],
            rental_term:          sub.rental_term || 'monthly',
            contact_name:         sub.contact_name  || null,
            contact_phone:        sub.contact_phone || null,
            package_type:         packageId,
            expires_at:           expiresAt.toISOString(),
            listing_status:       'active',
            verified:             false,
          })

          if (propErr) console.error('[webhook] auto-create property error:', propErr)
          else console.log(`Property auto-created from submission ${submissionId} → slug=${slug}`)
        }
      } catch (propCreateErr) {
        console.error('[webhook] auto-create property (non-fatal):', propCreateErr)
      }

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
      // Extend user_profiles expiry on renewal
      try {
        await supabase.from('user_profiles')
          .update({ package_expires_at: expiresAt.toISOString() })
          .eq('stripe_subscription_id', subscriptionId)
      } catch (profileErr) {
        console.error('[profile renew] error (non-fatal):', profileErr)
      }
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
