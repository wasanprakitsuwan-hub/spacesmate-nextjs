// /api/manage-lead
// ─────────────────────────────────────────────────────────────────────────────
// Receives the /manage page lead form, then:
//   1. Submits to Google Forms (server-side, no CORS issues)
//   2. Emails the founder via Resend
//
// Env vars for Google Forms (set in Vercel → Settings → Environment Variables):
//   GOOGLE_FORM_ID          — the form ID from the URL: docs.google.com/forms/d/e/{ID}/viewform
//   GOOGLE_ENTRY_NAME       — entry number for "ชื่อ-นามสกุล" field  (e.g. 123456789)
//   GOOGLE_ENTRY_PHONE      — entry number for "เบอร์โทรศัพท์" field
//   GOOGLE_ENTRY_TYPE       — entry number for "ประเภททรัพย์สิน" field
//   GOOGLE_ENTRY_LOCATION   — entry number for "ทำเล" field
//   GOOGLE_ENTRY_CHANNEL    — entry number for "ช่องทางติดต่อ" field
//
// To find entry numbers: open your Google Form, click ⋮ → "Get pre-filled link",
// fill in dummy values, click "Get link" — the URL shows entry.XXXXXXXXX=value.

import { NextRequest, NextResponse } from 'next/server'
import { sendManagementEnquiry } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  let body: { name?: string; phone?: string; type?: string; location?: string; channel?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name = '', phone = '', type = '', location = '', channel = '' } = body

  if (!name.trim() || !phone.trim()) {
    return NextResponse.json({ error: 'ชื่อและเบอร์โทรศัพท์จำเป็น' }, { status: 400 })
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
        body:    JSON.stringify({ name, phone, type, location, channel }),
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
  try {
    await sendManagementEnquiry({ name, phone, type, location, channel })
    console.log('[manage-lead] Founder email sent')
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    errors.push(`email: ${msg}`)
    console.error('[manage-lead] Email error:', msg)
  }

  return NextResponse.json({ ok: true, errors: errors.length ? errors : undefined })
}
