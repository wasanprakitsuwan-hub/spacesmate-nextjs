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

  // NOTE: Google Forms submission is handled client-side (hidden iframe) to
  // avoid Google's bot detection which blocks server-side cloud IP submissions.
  // This route handles email notification only.

  const errors: string[] = []

  // ── Email notification to founder ─────────────────────────────────────────
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
