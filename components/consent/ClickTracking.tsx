'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

/**
 * One document-level click listener for link clicks worth counting:
 *
 *   line_click      any link to line.me or lin.ee (LINE chat)
 *   cta_list_click  any link to /list-your-property/new (Thai or /en)
 *
 * Capture phase, so it sees the click even when a component stops
 * propagation, and before a navigation away from the page.
 */
export default function ClickTracking() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a') as HTMLAnchorElement | null
      if (!a) return
      const href = a.href || ''
      if (/(^|\/\/|\.)(line\.me|lin\.ee)(\/|$)/.test(href)) {
        trackEvent('line_click', { link_url: href })
      } else if (href.includes('/list-your-property/new')) {
        trackEvent('cta_list_click', { cta_text: (a.innerText || '').trim().slice(0, 50) })
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])
  return null
}
