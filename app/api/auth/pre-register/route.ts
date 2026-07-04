/**
 * POST /api/auth/pre-register
 *
 * Pre-flight validation before Supabase signUp.  Checks:
 *   1. Honeypot field must be empty
 *   2. Disposable / bot email domain blocklist
 *   3. Bot-pattern username detection (5+ consecutive digits)
 *   4. IP-based rate limit (max 3 attempts per hour)
 *   5. Cloudflare Turnstile token (optional — skipped when env vars not set)
 *
 * Returns { ok: true } on pass, or { error: string } on failure.
 */

import { NextRequest, NextResponse } from 'next/server'
import { isBlockedDomain, looksLikeBot } from '@/lib/blocked-domains'

// ── In-memory rate limiter ─────────────────────────────────────────────────────
// Each entry: { count: number; resetAt: number (epoch ms) }
// Survives within a single Vercel function invocation; cleared on cold start.
// Good enough for an MVP — upgrade to Upstash Redis when needed.
const ipRateMap = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT_MAX  = 3          // max registrations per window
const RATE_LIMIT_MS   = 60 * 60 * 1000  // 1 hour window

function getRealIp(req: NextRequest): string {
  return (
    req.headers.get('cf-connecting-ip') ??          // Cloudflare
    req.headers.get('x-real-ip') ??                  // nginx
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    '0.0.0.0'
  )
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now   = Date.now()
  const entry = ipRateMap.get(ip)

  if (!entry || now > entry.resetAt) {
    // First request this window
    ipRateMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_MS })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 }
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count }
}

// ── Cloudflare Turnstile verifier ──────────────────────────────────────────────
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true  // Skip if not configured — set keys to enable

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token, remoteip: ip }),
  })
  const data = await res.json() as { success: boolean }
  return data.success === true
}

// ── Route handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip = getRealIp(req)

  let body: {
    email?: string
    honeypot?: string
    turnstileToken?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { email = '', honeypot = '', turnstileToken = '' } = body

  // 1. Honeypot — if filled, silently reject (bot detected)
  if (honeypot && honeypot.trim() !== '') {
    // Return 200 to fool the bot into thinking it succeeded
    return NextResponse.json({ ok: true })
  }

  // 2. Basic email validation
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'กรุณากรอกอีเมลให้ถูกต้อง' }, { status: 400 })
  }

  // 3. Disposable email domain check
  if (isBlockedDomain(email)) {
    return NextResponse.json(
      { error: 'ไม่รองรับอีเมลชั่วคราว กรุณาใช้อีเมลจริง' },
      { status: 400 }
    )
  }

  // 4. Bot-pattern username detection (e.g. kelek62373, hatid44185)
  if (looksLikeBot(email)) {
    return NextResponse.json(
      { error: 'ไม่รองรับอีเมลนี้ กรุณาใช้อีเมลจริง' },
      { status: 400 }
    )
  }

  // 5. IP rate limit
  const { allowed } = checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: 'มีการสมัครสมาชิกบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่' },
      { status: 429 }
    )
  }

  // 6. Cloudflare Turnstile (skipped when TURNSTILE_SECRET_KEY not set)
  if (process.env.TURNSTILE_SECRET_KEY) {
    if (!turnstileToken) {
      return NextResponse.json({ error: 'กรุณายืนยันว่าคุณไม่ใช่บอท' }, { status: 400 })
    }
    const valid = await verifyTurnstile(turnstileToken, ip)
    if (!valid) {
      return NextResponse.json({ error: 'การยืนยันตัวตนล้มเหลว กรุณาลองใหม่' }, { status: 400 })
    }
  }

  return NextResponse.json({ ok: true })
}
