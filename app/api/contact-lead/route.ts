// /api/contact-lead
// ─────────────────────────────────────────────────────────────────────────────
// Receives the /contact page investor/partner form, then:
//   1. Writes to Google Sheet via GOOGLE_SCRIPT_URL (if set)
//   2. Emails the founder via Resend

import { NextRequest, NextResponse } from 'next/server'
import { checkRate } from '@/lib/rate-limit'
import { sendContactEnquiry } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  // Public lead form — spam brake.
  const rl = checkRate(req, 'contact-lead', 10, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'ส่งข้อมูลบ่อยเกินไป กรุณาลองใหม่ในภายหลัง' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    )
  }

  let body: { name?: string; phone?: string; email?: string; intent?: string; message?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name = '', phone = '', email = '', intent = '', message = '' } = body

  if (!name.trim() || !phone.trim()) {
    return NextResponse.json({ error: 'ชื่อและเบอร์โทรศัพท์จำเป็น' }, { status: 400 })
  }

  const errors: string[] = []

  // ── 1. Google Apps Script → writes directly to Google Sheet ──────────────
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL
  if (scriptUrl) {
    try {
      const res = await fetch(scriptUrl, {
        method:   'POST',
        headers:  { 'Content-Type': 'application/json' },
        body:     JSON.stringify({ name, phone, email, intent, message, source: 'contact' }),
        redirect: 'follow',
      })
      if (!res.ok) {
        errors.push(`sheets: HTTP ${res.status}`)
        console.error('[contact-lead] Apps Script error:', res.status)
      } else {
        console.log('[contact-lead] Google Sheet row written')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`sheets: ${msg}`)
      console.error('[contact-lead] Apps Script fetch error:', msg)
    }
  } else {
    console.warn('[contact-lead] GOOGLE_SCRIPT_URL not set — skipping Sheet write')
  }

  // ── 2. Email notification to founder ──────────────────────────────────────
  // Email is the only record of a lead, so if it did not go the visitor has
  // to hear about it — otherwise they wait for a call that never comes.
  let emailed = false
  try {
    emailed = await sendContactEnquiry({ name, phone, email, intent, message })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    errors.push(`email: ${msg}`)
  }
  if (!emailed) {
    console.error('[contact-lead] Founder email NOT sent — lead returned to the visitor', errors)
    return NextResponse.json({ error: 'email_failed' }, { status: 502 })
  }
  console.log('[contact-lead] Founder email sent')

  return NextResponse.json({ ok: true, errors: errors.length ? errors : undefined })
}
