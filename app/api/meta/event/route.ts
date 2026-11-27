import { NextRequest, NextResponse } from 'next/server'
import { checkRate, getRealIp, isSameOrigin, ALLOWED_HOSTS } from '@/lib/rate-limit'
import { META_PIXEL_ID } from '@/lib/tracking-config'

/**
 * POST /api/meta/event — server copy of a Meta pixel event (Conversions API).
 *
 * Called only by lib/analytics, right after the pixel fires, which happens
 * only with marketing consent. Does nothing until META_CAPI_TOKEN is set in
 * Vercel (Events Manager › the pixel › Settings › Conversions API ›
 * Generate access token).
 *
 * Sends no name, email or phone: just the browser's own Meta cookies (_fbp,
 * _fbc), IP and user agent, which Meta needs to match the event to the ad.
 */
const ALLOWED_EVENTS = new Set(['Lead', 'CompleteRegistration', 'Purchase', 'Contact'])

export async function POST(req: NextRequest) {
  const token = process.env.META_CAPI_TOKEN
  if (!token) return new NextResponse(null, { status: 204 })
  if (!isSameOrigin(req, ALLOWED_HOSTS)) return new NextResponse(null, { status: 403 })
  const rl = checkRate(req, 'meta-event', 60, 60 * 60 * 1000)
  if (!rl.allowed) return new NextResponse(null, { status: 429 })

  let b: Record<string, unknown>
  try { b = await req.json() } catch { return new NextResponse(null, { status: 400 }) }
  const event = String(b.event ?? '')
  const eventId = String(b.event_id ?? '').slice(0, 80)
  if (!ALLOWED_EVENTS.has(event) || !eventId) return new NextResponse(null, { status: 400 })

  const str = (v: unknown, n = 500) => (typeof v === 'string' && v ? v.slice(0, n) : undefined)
  const custom: Record<string, unknown> = {}
  if (typeof b.value === 'number') custom.value = b.value
  if (str(b.currency, 3)) custom.currency = str(b.currency, 3)
  if (str(b.content_name, 60)) custom.content_name = str(b.content_name, 60)

  const payload = {
    data: [{
      event_name: event,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: 'website',
      event_source_url: str(b.url),
      user_data: {
        client_ip_address: getRealIp(req),
        client_user_agent: req.headers.get('user-agent') ?? undefined,
        fbp: str(b.fbp, 200),
        fbc: str(b.fbc, 300),
      },
      custom_data: custom,
    }],
    ...(process.env.META_CAPI_TEST_CODE ? { test_event_code: process.env.META_CAPI_TEST_CODE } : {}),
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) console.error('[meta-capi]', res.status, (await res.text()).slice(0, 300))
  } catch (err) {
    console.error('[meta-capi] fetch failed:', err instanceof Error ? err.message : err)
  }
  return new NextResponse(null, { status: 204 })
}
