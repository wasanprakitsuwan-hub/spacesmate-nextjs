// /api/cron/check-expiry
// ─────────────────────────────────────────────────────────────────────────────
// Vercel cron job — runs daily at 00:00 Bangkok time (17:00 UTC).
// Configured in vercel.json:
//   { "path": "/api/cron/check-expiry", "schedule": "0 17 * * *" }
//
// Two jobs per run:
//   1. 7-day expiry warning  — finds listings expiring in 6–8 days,
//                              sends sendPackageExpiringAlert, marks expiry_warning_sent = true
//   2. Expire stale listings — finds approved listings past their expires_at,
//                              sends sendPackageExpiredAlert, sets status = 'expired'
//
// Security: protected by CRON_SECRET env var.
// Vercel passes  Authorization: Bearer {CRON_SECRET}  automatically.
// Set CRON_SECRET in Vercel dashboard → Settings → Environment Variables.

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendPackageExpiringAlert, sendPackageExpiredAlert } from '@/lib/email'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  // ── Auth: verify cron secret ─────────────────────────────────────────────
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const supabase  = createServerClient()
  const now       = new Date()
  const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL || 'https://spacesmate.com'
  const renewUrl  = `${siteUrl}/owner-dashboard`

  let warnCount   = 0
  let expireCount = 0
  const errors: string[] = []

  // ── 1. Seven-day expiry warnings ─────────────────────────────────────────
  // Window: expires_at is between now+6d and now+8d (catches the 7-day mark
  // even if the cron fires slightly early/late or skips one day)
  const warnFrom = new Date(now)
  warnFrom.setDate(now.getDate() + 6)
  const warnTo = new Date(now)
  warnTo.setDate(now.getDate() + 8)

  const { data: expiringSoon, error: warnErr } = await supabase
    .from('submissions')
    .select('id, title, contact_email, contact_name, package_type, expires_at')
    .eq('status', 'approved')
    .eq('expiry_warning_sent', false)
    .gte('expires_at', warnFrom.toISOString())
    .lte('expires_at', warnTo.toISOString())

  if (warnErr) {
    errors.push(`warn-query: ${warnErr.message}`)
  } else {
    for (const sub of (expiringSoon ?? [])) {
      try {
        if (sub.contact_email) {
          await sendPackageExpiringAlert({
            contactEmail: sub.contact_email,
            contactName:  sub.contact_name  ?? null,
            packageType:  sub.package_type  ?? null,
            expiresAt:    sub.expires_at,
            listingTitle: sub.title         ?? null,
            renewUrl,
          })
        }

        // Mark as sent even if no email — prevents re-querying every day
        await supabase
          .from('submissions')
          .update({ expiry_warning_sent: true })
          .eq('id', sub.id)

        warnCount++
        console.log(`[cron] 7-day warning sent → submission ${sub.id} (${sub.title})`)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`warn-email-${sub.id}: ${msg}`)
        console.error(`[cron] warn email failed for ${sub.id}:`, msg)
      }
    }
  }

  // ── 2. Expire listings past their expires_at ─────────────────────────────
  const { data: expired, error: expireErr } = await supabase
    .from('submissions')
    .select('id, title, contact_email, contact_name, package_type, expires_at')
    .eq('status', 'approved')
    .lt('expires_at', now.toISOString())

  if (expireErr) {
    errors.push(`expire-query: ${expireErr.message}`)
  } else {
    for (const sub of (expired ?? [])) {
      try {
        // Mark as expired first — so the listing is hidden immediately
        const { error: updateErr } = await supabase
          .from('submissions')
          .update({ status: 'expired' })
          .eq('id', sub.id)

        if (updateErr) throw new Error(updateErr.message)

        // Send expired notification
        if (sub.contact_email) {
          await sendPackageExpiredAlert({
            contactEmail: sub.contact_email,
            contactName:  sub.contact_name  ?? null,
            packageType:  sub.package_type  ?? null,
            expiresAt:    sub.expires_at,
            listingTitle: sub.title         ?? null,
            renewUrl,
          })
        }

        expireCount++
        console.log(`[cron] expired → submission ${sub.id} (${sub.title})`)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`expire-${sub.id}: ${msg}`)
        console.error(`[cron] expire failed for ${sub.id}:`, msg)
      }
    }
  }

  // ── 3. Expire slots, and take down whatever they were holding ────────────
  //
  // The slot owns the term, so this is where expiry actually happens now. Until
  // this ran, a listing could sit past its end date with listing_status still
  // 'active' — /api/listings/public filtered it out, but search and the building
  // pages did not, so it stayed reachable.
  let slotExpireCount = 0
  try {
    const { data: deadSlots } = await supabase
      .from('listing_slots')
      .select('id, property_id')
      .eq('status', 'active')
      .lt('expires_at', now.toISOString())   // NULL never matches — never-expiring slots are safe

    for (const slot of deadSlots ?? []) {
      // Release the listing as well as expiring the slot.
      //
      // The unique index on property_id is what makes double-claiming
      // impossible — but a dead slot still holding property_id would use up
      // that one allowed row, and the listing could never claim a new slot
      // again. Expiry has to let go.
      await supabase.from('listing_slots')
        .update({ status: 'expired', property_id: null, updated_at: now.toISOString() })
        .eq('id', slot.id)

      if (slot.property_id) {
        // The listing itself survives as the owner's own record — only its
        // public visibility ends.
        await supabase.from('properties')
          .update({ listing_status: 'expired' })
          .eq('id', slot.property_id)
      }
      slotExpireCount++
    }
    if (slotExpireCount) console.log(`[cron] expired ${slotExpireCount} slot(s)`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    errors.push(`slot-expiry: ${msg}`)
  }

  // ── 4. Legacy sweep: live listings past their own expiry with no slot ─────
  // Covers anything created before slots existed, or by a path that failed to
  // record one. Cheap, and it keeps every reader agreeing about what is live.
  let staleCount = 0
  try {
    const { data: stale } = await supabase
      .from('properties')
      .select('id')
      .eq('listing_status', 'active')
      .lt('expires_at', now.toISOString())

    for (const p of stale ?? []) {
      await supabase.from('properties').update({ listing_status: 'expired' }).eq('id', p.id)
      staleCount++
    }
    if (staleCount) console.log(`[cron] expired ${staleCount} stale listing(s)`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    errors.push(`stale-listings: ${msg}`)
  }

  const summary = {
    ok:               true,
    ran_at:              now.toISOString(),
    warnings_sent:       warnCount,
    submissions_expired: expireCount,
    slots_expired:       slotExpireCount,
    listings_expired:    staleCount,
    errors,
  }

  console.log('[cron/check-expiry]', JSON.stringify(summary))
  return NextResponse.json(summary)
}
