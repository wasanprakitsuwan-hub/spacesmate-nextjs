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

  const summary = {
    ok:               true,
    ran_at:           now.toISOString(),
    warnings_sent:    warnCount,
    listings_expired: expireCount,
    errors,
  }

  console.log('[cron/check-expiry]', JSON.stringify(summary))
  return NextResponse.json(summary)
}
