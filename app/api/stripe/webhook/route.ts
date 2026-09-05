import { NextRequest, NextResponse } from 'next/server'
import { resolveBuildingId } from '@/lib/resolve-building'
import { stripe, PACKAGE_DAYS } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'
import { grantSlots, extendSlotsForSubscription, claimSlot, syncListingFromSlot } from '@/lib/slots'
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
    const packageId      = session.metadata?.package_id || 'basic'
    const subscriptionId = session.subscription as string | null
    const customerId     = session.customer as string | null

    // ── Slot purchase: grant entitlement, touch no listing ───────────────────
    //
    // Checked first because it is the only path with no listing in it at all.
    // The customer bought the right to publish; which listing they use it for is
    // their decision, made later, on the dashboard.
    if (session.metadata?.slot_purchase === 'true') {
      // ── Has this actually been paid? ───────────────────────────────────────
      //
      // A card is charged before checkout.session.completed fires, so this used
      // to be safe to skip. PromptPay is not: the customer is shown a QR code
      // and the session can complete while the payment is still pending — or
      // never be paid at all. Granting here would hand out a slot for an
      // abandoned QR.
      //
      // The condition is deliberately negative — hold when 'unpaid', grant
      // otherwise — rather than `=== 'paid'`. A ฿0 total (SM299 taking Basic to
      // nothing) collects no payment and completes as 'no_payment_required'.
      // Written as an equality check against 'paid', this would refuse the slot
      // to someone using the discount exactly as intended, and would break
      // every existing free-first-month card subscription too.
      if (session.payment_status === 'unpaid') {
        console.log(
          `[slots] ${session.id} completed but unpaid — holding. ` +
          `Waiting for checkout.session.async_payment_succeeded.`,
        )
        return NextResponse.json({ received: true, pending: true })
      }

      return await grantSlotsForSession(supabase, session, 'completed')
    }

    // Fall through to the listing paths below.
    return await handleListingCheckout(supabase, session, packageId, subscriptionId, customerId)
  }

  // ── Delayed payment resolved ───────────────────────────────────────────────
  //
  // PromptPay settles after the session completes. These two events are the
  // only signal that a held purchase has been paid or abandoned — without them
  // subscribed on the Stripe endpoint, a paid QR silently grants nothing and
  // the customer has paid for a slot they never receive.
  if (event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.metadata?.slot_purchase === 'true') {
      return await grantSlotsForSession(supabase, session, 'async_succeeded')
    }
    return NextResponse.json({ received: true })
  }

  if (event.type === 'checkout.session.async_payment_failed') {
    const session = event.data.object as Stripe.Checkout.Session
    // Nothing to revoke — the grant was held, not made. Logged loudly because
    // silence here looks identical to a customer who simply never tried.
    console.error(
      `[slots] async payment FAILED for session ${session.id} ` +
      `user=${session.metadata?.user_id ?? 'unknown'} ` +
      `pkg=${session.metadata?.package_id ?? 'unknown'} — no slots granted`,
    )
    return NextResponse.json({ received: true, failed: true })
  }

  return await handleOtherEvents(supabase, event)
}

/**
 * Grant the slots a checkout session paid for. Idempotent.
 *
 * Shared by checkout.session.completed and async_payment_succeeded so that a
 * card purchase and a PromptPay purchase are granted by exactly the same code —
 * the only difference between them is when this runs.
 */
async function grantSlotsForSession(
  supabase: ReturnType<typeof createServerClient>,
  session: Stripe.Checkout.Session,
  via: 'completed' | 'async_succeeded',
) {
      const packageId      = session.metadata?.package_id || 'basic'
      const subscriptionId = session.subscription as string | null
      const customerId     = session.customer as string | null
      const userId   = session.metadata?.user_id
      const quantity = parseInt(session.metadata?.quantity || '1', 10)

      if (!userId) {
        // Nothing sensible to do — grant nothing rather than guess an owner.
        console.error('[slots] checkout completed without user_id', session.id)
        return NextResponse.json({ received: true })
      }

      // Idempotency guard. Now that a shortfall returns 500 and Stripe retries,
      // a delivery that inserted its rows and then failed to respond (timeout,
      // cold-start kill) would be retried and grant a second set. Slots are
      // money, so check before granting rather than trusting delivery-once.
      //
      // Keyed on the subscription when there is one, and on the checkout
      // session otherwise. The session is what makes this work for one-time
      // payments: PromptPay has no subscription id, so the old guard skipped
      // itself entirely and every retry granted another set of slots.
      //
      // It also covers the two-event PromptPay path, where completed and
      // async_payment_succeeded can both arrive for the same purchase.
      {
        const col = subscriptionId ? 'stripe_subscription_id' : 'stripe_checkout_session_id'
        const val = subscriptionId ?? session.id

        const { data: already, error: dupErr } = await supabase
          .from('listing_slots')
          .select('id')
          .eq(col, val)
          .limit(1)

        if (dupErr) {
          console.error('[slots] idempotency check failed —', dupErr.message)
          return NextResponse.json({ error: 'slot precheck failed' }, { status: 500 })
        }
        if ((already?.length ?? 0) > 0) {
          console.log(`[slots] ${val} already granted — skipping duplicate (via ${via})`)
          return NextResponse.json({ received: true, duplicate: true })
        }
      }

      const granted = await grantSlots(supabase, {
        userId,
        packageType:            packageId,
        quantity,
        stripeSubscriptionId:   subscriptionId,
        stripeCustomerId:       customerId,
        stripeCheckoutSessionId: session.id,
        source:                 session.metadata?.payment_method === 'promptpay' ? 'promptpay' : 'purchase',
      })

      // FAIL LOUDLY. grantSlots swallows its error and returns 0, so returning
      // 200 here tells Stripe everything is fine and it never retries — the
      // customer has paid and received nothing, and no system reports a problem.
      // That is exactly how a missing GRANT on listing_slots went unnoticed.
      //
      // A non-2xx makes Stripe retry with backoff for ~3 days, which turns a
      // transient database fault into a self-healing delay instead of lost
      // money, and puts the failure on the Stripe dashboard where it is visible.
      if (granted < quantity) {
        console.error(
          `[slots] GRANT SHORTFALL — paid for ${quantity}×${packageId}, granted ${granted}. ` +
          `user=${userId} session=${session.id} sub=${subscriptionId}`,
        )
        return NextResponse.json(
          { error: 'slot grant failed', granted, expected: quantity },
          { status: 500 },
        )
      }

      console.log(`[slots] granted ${granted}×${packageId} to ${userId}`)

      // Renewal came through this route: publish the listing straight into the
      // slot it just paid for. Ownership was verified in buy-slots, where there
      // was a session to verify it against — re-check the owner here anyway,
      // because webhook metadata should never be trusted on its own.
      const publishId = session.metadata?.publish_property_id
      if (granted > 0 && publishId) {
        try {
          const { data: target } = await supabase
            .from('properties')
            .select('id, landlord_id')
            .eq('id', publishId)
            .maybeSingle()

          if (target?.landlord_id === userId) {
            const slot = await claimSlot(supabase, userId, publishId)
            if (slot) {
              await syncListingFromSlot(supabase, slot)
              console.log(`[slots] auto-published ${publishId} into slot ${slot.id}`)
            }
          } else {
            console.error('[slots] publish_property_id does not belong to buyer — ignored')
          }
        } catch (pubErr) {
          // The slot is still granted; they can publish by hand.
          console.error('[slots] auto-publish (non-fatal):', pubErr)
        }
      }

      // Keep the profile in step so anything still reading package_type there
      // (the role API, the admin screen) sees an active customer.
      try {
        const expires = new Date()
        expires.setDate(expires.getDate() + (PACKAGE_DAYS[packageId] ?? 30))
        await supabase.from('user_profiles').update({
          package_type:           packageId,
          package_expires_at:     expires.toISOString(),
          stripe_subscription_id: subscriptionId,
          stripe_customer_id:     customerId,
        }).eq('id', userId)
      } catch (profileErr) {
        console.error('[slots profile sync] non-fatal:', profileErr)
      }

      return NextResponse.json({ received: true })
}


/**
 * The listing-bearing checkout paths: renewing an existing property, and the
 * public submit flow that creates one. Unchanged behaviour — lifted out of the
 * event handler so the slot path above could be shared with the async events.
 */
async function handleListingCheckout(
  supabase: ReturnType<typeof createServerClient>,
  session: Stripe.Checkout.Session,
  packageId: string,
  subscriptionId: string | null,
  customerId: string | null,
) {
    // ── Renewal path: reactivate an existing property row ─────────────────────
    if (session.metadata?.renew_property_id) {
      const propertyId          = session.metadata.renew_property_id
      const sourceSubmissionId  = session.metadata?.source_submission_id || null
      const durationDays        = PACKAGE_DAYS[packageId] ?? 30
      const expiresAt           = new Date()
      expiresAt.setDate(expiresAt.getDate() + durationDays)

      // Reactivate the property
      const { error: propErr } = await supabase
        .from('properties')
        .update({
          listing_status: 'active',
          package_type:   packageId,
          expires_at:     expiresAt.toISOString(),
        })
        .eq('id', propertyId)

      if (propErr) console.error('[renew] Failed to reactivate property:', propErr)
      else {
        console.log(`Property ${propertyId} reactivated → package=${packageId}`)

        // Give the renewed listing a slot too, or extend the one it already has,
        // so every live listing is backed by exactly one slot regardless of which
        // route paid for it.
        try {
          const { data: existingSlot } = await supabase
            .from('listing_slots')
            .select('id')
            .eq('property_id', propertyId)
            .maybeSingle()

          if (existingSlot) {
            await supabase.from('listing_slots').update({
              status:                 'active',
              package_type:           packageId,
              expires_at:             expiresAt.toISOString(),
              stripe_subscription_id: subscriptionId,
              stripe_customer_id:     customerId,
              updated_at:             new Date().toISOString(),
            }).eq('id', existingSlot.id)
          } else {
            const { data: owner } = await supabase
              .from('properties').select('landlord_id').eq('id', propertyId).maybeSingle()
            if (owner?.landlord_id) {
              await supabase.from('listing_slots').insert({
                user_id:                owner.landlord_id,
                package_type:           packageId,
                status:                 'active',
                expires_at:             expiresAt.toISOString(),
                property_id:            propertyId,
                stripe_subscription_id: subscriptionId,
                stripe_customer_id:     customerId,
                source:                 'purchase',
              })
            }
          }
        } catch (slotErr) {
          console.error('[renew] slot sync (non-fatal):', slotErr)
        }
      }

      // Keep the original submission in sync so invoice.payment_succeeded works
      if (sourceSubmissionId) {
        await supabase.from('submissions')
          .update({
            status:                 'approved',
            expires_at:             expiresAt.toISOString(),
            stripe_subscription_id: subscriptionId,
            stripe_customer_id:     customerId,
          })
          .eq('id', sourceSubmissionId)
      }

      // Sync user_profiles package info
      try {
        const userId = session.metadata?.user_id
        if (userId) {
          await supabase.from('user_profiles').update({
            package_type:           packageId,
            package_expires_at:     expiresAt.toISOString(),
            stripe_subscription_id: subscriptionId,
            stripe_customer_id:     customerId,
          }).eq('id', userId)
        }
      } catch (profileErr) {
        console.error('[renew profile sync] non-fatal:', profileErr)
      }

      return NextResponse.json({ received: true })
    }

    // ── New listing path ───────────────────────────────────────────────────────
    const submissionId = session.metadata?.submission_id
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

      // ── Fetch submission once — used for user resolution, property creation, and email ──
      const { data: sub } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', submissionId)
        .single()

      // ── Resolve owner: user_id stamped at checkout is PRIMARY source ──────
      // Falls back to Stripe customer email only when user_id is absent
      // (e.g. guest checkout, or token expired before form submit).
      let resolvedUserId: string | null = sub?.user_id ?? null

      try {
        if (!resolvedUserId) {
          // Fallback: look up by the email Stripe collected at checkout
          const customerEmail = session.customer_details?.email ?? session.customer_email ?? null
          if (customerEmail) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('email', customerEmail)
              .single()
            resolvedUserId = profile?.id ?? null
            console.log(`[user resolve] fallback email lookup → ${customerEmail} → ${resolvedUserId}`)
          }
        } else {
          console.log(`[user resolve] user_id from submission → ${resolvedUserId}`)
        }

        // Update user_profiles with package info using the resolved user
        if (resolvedUserId) {
          await supabase.from('user_profiles').update({
            package_type:           packageId,
            package_expires_at:     expiresAt.toISOString(),
            stripe_subscription_id: subscriptionId,
            stripe_customer_id:     customerId,
          }).eq('id', resolvedUserId)
          console.log(`user_profiles updated → user=${resolvedUserId} package=${packageId}`)

          // Stamp user_id on submission if it wasn't already set (fallback path)
          if (!sub?.user_id) {
            await supabase.from('submissions')
              .update({ user_id: resolvedUserId })
              .eq('id', submissionId)
            console.log(`submissions.user_id stamped (fallback) → user=${resolvedUserId}`)
          }
        }
      } catch (profileErr) {
        console.error('[profile sync] error (non-fatal):', profileErr)
      }

      // ── Auto-create a properties row so the listing is publicly visible ───
      try {
        if (sub) {
          const slug = ((sub.title || 'listing') as string)
            .toLowerCase()
            .replace(/[^฀-๿\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
            .slice(0, 60) + '-' + Date.now().toString(36)

          const PROP_TYPE_MAP: Record<string, string> = {
            'คอนโด': 'condo', 'คอนโดมิเนียม': 'condo',
            'อพาร์ทเม้นท์': 'apartment', 'อพาร์ตเมนต์': 'apartment',
            'บ้าน': 'house', 'ออฟฟิศ': 'office',
            'โคเวิร์ก': 'coworking', 'โคเวิร์คกิ้งสเปซ': 'coworking',
          }
          const rawPropType = (sub.type as string) || ''
          const normalizedType = PROP_TYPE_MAP[rawPropType] ?? (rawPropType || 'apartment')
          const safeIntW = (v: unknown) => { const n = parseInt(String(v ?? ''), 10); return isNaN(n) ? null : n }

          const buildingId = await resolveBuildingId(supabase, sub.room_types)
          const { data: createdProp, error: propErr } = await supabase.from('properties').insert({
            slug,
            property_name_id:     buildingId,
            source_submission_id: submissionId,
            landlord_id:          resolvedUserId,   // always the account UUID now
            title_th:             sub.title       || '',
            description_th:       sub.description || null,
            property_type:        normalizedType,
            price_from:           sub.price       || 0,
            area_sqm:             sub.size ? parseFloat(String(sub.size)) : null,
            bedrooms:             safeIntW(sub.bedrooms) ?? 0,
            bathrooms:            safeIntW(sub.bathrooms) ?? 0,
            floor:                safeIntW(sub.floor),
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
            contact_email:        sub.contact_email || null,
            contact_line:         sub.contact_line  || null,
            package_type:         packageId,
            expires_at:           expiresAt.toISOString(),
            listing_status:       'active',
            verified:             false,
          }).select('id').maybeSingle()

          if (propErr) console.error('[webhook] auto-create property error:', propErr)
          else {
            console.log(`Property auto-created from submission ${submissionId} → landlord=${resolvedUserId} slug=${slug}`)

            // The public submit flow pays for a listing and a slot in the same
            // checkout, so record the slot it just bought — occupied by this
            // listing. Without this the listing would be live with no slot
            // behind it, and taking it down would silently destroy a paid term
            // that the owner should be able to reuse.
            try {
              if (createdProp?.id && resolvedUserId) {
                await supabase.from('listing_slots').insert({
                  user_id:                resolvedUserId,
                  package_type:           packageId,
                  status:                 'active',
                  expires_at:             expiresAt.toISOString(),
                  property_id:            createdProp.id,
                  stripe_subscription_id: subscriptionId,
                  stripe_customer_id:     customerId,
                  source:                 'purchase',
                })
              }
            } catch (slotErr) {
              console.error('[webhook] slot for submitted listing (non-fatal):', slotErr)
            }
          }
        }
      } catch (propCreateErr) {
        console.error('[webhook] auto-create property (non-fatal):', propCreateErr)
      }

      // ── Send email notifications (reuse sub fetched above) ───────────────
      try {
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

  return NextResponse.json({ received: true })
}

/**
 * Everything that is not a checkout session: renewals, failures, cancellations.
 * Unchanged — split out so the handler above reads as one decision per event.
 */
async function handleOtherEvents(
  supabase: ReturnType<typeof createServerClient>,
  event: Stripe.Event,
) {

  // Subscription renewed → extend expires_at on submissions + properties + user_profiles
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

    // Slots renew on the same invoice. Extending from the later of now and the
    // current expiry means paying early adds time instead of resetting it.
    try {
      const extended = await extendSlotsForSubscription(supabase, subscriptionId, packageId)
      if (extended > 0) {
        console.log(`[slots] extended ${extended} slot(s) on ${subscriptionId}`)
        // Mirror onto whatever listings occupy them.
        const { data: occupied } = await supabase
          .from('listing_slots')
          .select('property_id, expires_at, package_type')
          .eq('stripe_subscription_id', subscriptionId)
          .not('property_id', 'is', null)
        for (const slot of occupied ?? []) {
          await supabase.from('properties').update({
            listing_status: 'active',
            package_type:   slot.package_type,
            expires_at:     slot.expires_at,
          }).eq('id', slot.property_id)
        }
      }
    } catch (slotErr) {
      console.error('[slots renewal] non-fatal:', slotErr)
    }

    const { data: renewedSub, error } = await supabase
      .from('submissions')
      .update({ status: 'approved', expires_at: expiresAt.toISOString() })
      .eq('stripe_subscription_id', subscriptionId)
      .select('id, title, contact_email, contact_name, package_type')
      .single()

    if (error) {
      console.error('Failed to renew submission:', error)
    } else {
      console.log(`Subscription ${subscriptionId} renewed`)

      // ── Extend expires_at on the public properties row ─────────────────────
      if (renewedSub?.id) {
        try {
          await supabase.from('properties')
            .update({ expires_at: expiresAt.toISOString(), listing_status: 'active' })
            .eq('source_submission_id', renewedSub.id)
          console.log(`properties.expires_at extended for submission ${renewedSub.id}`)
        } catch (propErr) {
          console.error('[renewal] properties update error (non-fatal):', propErr)
        }
      }

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

  // Payment failed → mark as expired on submissions + properties
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const subscriptionId = invoice.subscription as string | null
    if (!subscriptionId) return NextResponse.json({ received: true })

    const { data: failedSub, error } = await supabase
      .from('submissions')
      .update({ status: 'expired' })
      .eq('stripe_subscription_id', subscriptionId)
      .select('id')
      .single()

    if (error) console.error('Failed to expire submission on failed payment:', error)
    else {
      console.log(`Submission expired — payment failed for subscription ${subscriptionId}`)
      // Also hide the public listing
      if (failedSub?.id) {
        try {
          await supabase.from('properties')
            .update({ listing_status: 'expired' })
            .eq('source_submission_id', failedSub.id)
        } catch (propErr) {
          console.error('[payment_failed] properties update (non-fatal):', propErr)
        }
      }
    }
  }

  // Subscription period ended (cancel_at_period_end reached) → expire listing
  // Note: this fires AFTER the period ends, so the listing was live until this point ✓
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const subscriptionId = subscription.id

    // Cancelled slots stop being usable, and whatever they were holding comes
    // down. The listing itself is untouched — it reverts to a draft the owner
    // still owns and can republish by buying another slot.
    try {
      const { data: dead } = await supabase
        .from('listing_slots')
        .select('id, property_id')
        .eq('stripe_subscription_id', subscriptionId)

      if (dead?.length) {
        await supabase.from('listing_slots')
          .update({ status: 'cancelled', property_id: null, updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', subscriptionId)

        for (const slot of dead) {
          if (!slot.property_id) continue
          await supabase.from('properties')
            .update({ listing_status: 'expired', expires_at: null })
            .eq('id', slot.property_id)
        }
        console.log(`[slots] cancelled ${dead.length} slot(s) on ${subscriptionId}`)
      }
    } catch (slotErr) {
      console.error('[slots cancellation] non-fatal:', slotErr)
    }

    const { data: cancelledSub, error } = await supabase
      .from('submissions')
      .update({ status: 'expired', stripe_subscription_id: null })
      .eq('stripe_subscription_id', subscriptionId)
      .select('id')
      .single()

    if (error) console.error('Failed to expire submission on cancellation:', error)
    else {
      console.log(`Subscription ${subscriptionId} cancelled — listing expired`)
      // Expire the public properties row so it disappears from search immediately
      if (cancelledSub?.id) {
        try {
          await supabase.from('properties')
            .update({ listing_status: 'expired' })
            .eq('source_submission_id', cancelledSub.id)
          console.log(`properties row expired for submission ${cancelledSub.id}`)
        } catch (propErr) {
          console.error('[cancellation] properties update (non-fatal):', propErr)
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
