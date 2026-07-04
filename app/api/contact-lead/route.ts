// /api/contact-lead
// ─────────────────────────────────────────────────────────────────────────────
// Receives the /contact page investor/partner form, then:
//   1. Writes to Google Sheet via GOOGLE_SCRIPT_URL (if set)
//   2. Emails the founder via Resend

import { NextRequest, NextResponse } from 'next/server'
import { sendContactEnquiry } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
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
  try {
    await sendContactEnquiry({ name, phone, email, intent, message })
    console.log('[contact-lead] Founder email sent')
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    errors.push(`email: ${msg}`)
    console.error('[contact-lead] Email error:', msg)
  }

  return NextResponse.json({ ok: true, errors: errors.length ? errors : undefined })
}
