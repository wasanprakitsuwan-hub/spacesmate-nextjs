// /api/manage-lead
// ─────────────────────────────────────────────────────────────────────────────
// Receives the /manage page lead form, then:
//   1. Submits to Google Forms (server-side, no CORS issues)
//   2. Emails the founder via Resend
//
// Env vars for Google Forms (set in Vercel → Settings → Environment Variables):
//   GOOGLE_FORM_ID          — the form ID from the URL: docs.google.com/forms/d/e/{ID}/viewform
//   GOOGLE_ENTRY_NAME       — entry number for "ชื่อ-นามสกุล" field  (e.g. 123456789)
//   (The form now sends firstName, lastName and email; `name` is still passed
//   to the Sheet as "first last" so an existing script keeps working.)
//   GOOGLE_ENTRY_PHONE      — entry number for "เบอร์โทรศัพท์" field
//   GOOGLE_ENTRY_TYPE       — entry number for "ประเภททรัพย์สิน" field
//   GOOGLE_ENTRY_LOCATION   — entry number for "ทำเล" field
//   GOOGLE_ENTRY_CHANNEL    — entry number for "ช่องทางติดต่อ" field
//
// To find entry numbers: open your Google Form, click ⋮ → "Get pre-filled link",
// fill in dummy values, click "Get link" — the URL shows entry.XXXXXXXXX=value.

import { NextRequest, NextResponse } from 'next/server'
import { checkRate } from '@/lib/rate-limit'
import { sendManagementEnquiry } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  // Public lead form — spam brake.
  const rl = checkRate(req, 'manage-lead', 10, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'ส่งข้อมูลบ่อยเกินไป กรุณาลองใหม่ในภายหลัง' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    )
  }

  let body: { firstName?: string; lastName?: string; email?: string; phone?: string; type?: string; location?: string; channel?: string; building?: string; rooms?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { phone = '', type = '', location = '', channel = '' } = body
  const firstName = String(body.firstName ?? '').trim().slice(0, 100)
  const lastName  = String(body.lastName ?? '').trim().slice(0, 100)
  const email     = String(body.email ?? '').trim().slice(0, 200)
  const name      = `${firstName} ${lastName}`.trim()
  const building = String(body.building ?? '').slice(0, 200)
  const rooms    = String(body.rooms ?? '').slice(0, 20)

  if (!firstName || !lastName || !phone.trim() || !email) {
    return NextResponse.json({ error: 'ชื่อ นามสกุล เบอร์โทรศัพท์ และอีเมลจำเป็น' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' }, { status: 400 })
  }

  const errors: string[] = []

  // ── 1. Google Apps Script → writes directly to Google Sheet ──────────────
  // Set GOOGLE_SCRIPT_URL in Vercel env vars to the deployed web app URL.
  // Script must be deployed as "Anyone" access with doPost(e) handler.
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL
  if (scriptUrl) {
    try {
      const res = await fetch(scriptUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, firstName, lastName, email, phone, type, location, channel, building, rooms }),
        redirect: 'follow',
      })
      if (!res.ok) {
        errors.push(`sheets: HTTP ${res.status}`)
        console.error('[manage-lead] Apps Script error:', res.status)
      } else {
        console.log('[manage-lead] Google Sheet row written')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`sheets: ${msg}`)
      console.error('[manage-lead] Apps Script fetch error:', msg)
    }
  } else {
    console.warn('[manage-lead] GOOGLE_SCRIPT_URL not set — skipping Sheet write')
  }

  // ── 2. Email notification to founder ──────────────────────────────────────
  // Email is the only record of a lead, so if it did not go the visitor has
  // to hear about it — otherwise they wait for a call that never comes.
  let emailed = false
  try {
    emailed = await sendManagementEnquiry({ firstName, lastName, email, phone, type, location, channel, building, rooms })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    errors.push(`email: ${msg}`)
  }
  if (!emailed) {
    console.error('[manage-lead] Founder email NOT sent — lead returned to the visitor', errors)
    return NextResponse.json({ error: 'email_failed' }, { status: 502 })
  }
  console.log('[manage-lead] Founder email sent')

  return NextResponse.json({ ok: true, errors: errors.length ? errors : undefined })
}
