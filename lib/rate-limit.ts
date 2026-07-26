import { NextRequest } from 'next/server'

/**
 * Lightweight IP rate limiting for routes that must stay public.
 *
 * Some endpoints cannot be authenticated because the public listing form calls
 * them before any account exists — /api/geocode (proxies a paid Google API) and
 * /api/public-upload (writes to Supabase storage). Both are therefore open to
 * cost abuse. Rate limiting is the available mitigation.
 *
 * LIMITATIONS — worth being honest about:
 *   • State lives in module scope, so it resets on cold start and is not shared
 *     between Vercel instances. A determined attacker can wait one out.
 *   • Thai mobile carriers use large-scale NAT, so many real users share one
 *     public IP. Limits here are deliberately generous for that reason —
 *     /api/auth/pre-register allows only 3/hour, which is likely blocking
 *     legitimate mobile users.
 *
 * This is a speed bump, not a wall. Move to Upstash Redis when the traffic
 * justifies it.
 */

type Entry = { count: number; resetAt: number }
const buckets = new Map<string, Map<string, Entry>>()

export function getRealIp(req: NextRequest): string {
  return (
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    '0.0.0.0'
  )
}

/**
 * @param name   bucket name, so routes don't share a counter
 * @param max    requests allowed per window
 * @param windowMs  window length
 */
export function checkRate(
  req: NextRequest,
  name: string,
  max: number,
  windowMs: number,
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const ip  = getRealIp(req)
  const now = Date.now()

  let bucket = buckets.get(name)
  if (!bucket) { bucket = new Map(); buckets.set(name, bucket) }

  const entry = bucket.get(ip)

  if (!entry || now > entry.resetAt) {
    bucket.set(ip, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: max - 1, retryAfterSec: 0 }
  }

  if (entry.count >= max) {
    return { allowed: false, remaining: 0, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) }
  }

  entry.count += 1
  return { allowed: true, remaining: max - entry.count, retryAfterSec: 0 }
}

/**
 * Reject requests that did not originate from our own site.
 * Not a security boundary — Origin is trivially forged by a script — but it stops
 * casual hotlinking of a paid API from another page.
 */
export function isSameOrigin(req: NextRequest, allowedHosts: string[]): boolean {
  const raw = req.headers.get('origin') ?? req.headers.get('referer')
  if (!raw) return false
  try {
    return allowedHosts.includes(new URL(raw).hostname)
  } catch {
    return false
  }
}

export const ALLOWED_HOSTS = [
  'spacesmate.com',
  'www.spacesmate.com',
  'spacesmate-nextjs.vercel.app',
  'localhost',
]
