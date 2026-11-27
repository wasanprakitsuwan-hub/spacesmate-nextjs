'use client'

import { useEffect, useRef } from 'react'

/** True when the Cloudflare Turnstile site key is configured for this build. */
export const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

/**
 * Cloudflare Turnstile check, rendered only when NEXT_PUBLIC_TURNSTILE_SITE_KEY
 * is set. /api/auth/pre-register refuses a signup without its token whenever
 * TURNSTILE_SECRET_KEY is set, so every signup form must show this.
 */
export default function TurnstileWidget({ onToken }: { onToken: (t: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!TURNSTILE_ENABLED) return
    if (!document.getElementById('cf-turnstile-script')) {
      const s = document.createElement('script')
      s.id = 'cf-turnstile-script'
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      s.async = true
      s.defer = true
      document.head.appendChild(s)
    }
    let attempts = 0
    let widgetId: string | undefined
    const poll = setInterval(() => {
      attempts++
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any
      if (w.turnstile && ref.current && !ref.current.dataset.rendered) {
        ref.current.dataset.rendered = 'true'
        widgetId = w.turnstile.render(ref.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
          callback: (token: string) => onToken(token),
          'expired-callback': () => onToken(''),
          'error-callback': () => onToken(''),
          theme: 'light',
          size: 'flexible',
        })
        clearInterval(poll)
      }
      if (attempts > 100) clearInterval(poll)   // give up after 10s (slow mobile data)
    }, 100)
    return () => {
      clearInterval(poll)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any
      if (widgetId !== undefined && w.turnstile) { try { w.turnstile.remove(widgetId) } catch { /* already gone */ } }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!TURNSTILE_ENABLED) return null
  return <div ref={ref} style={{ minHeight: 65, borderRadius: 10, overflow: 'hidden' }} />
}
