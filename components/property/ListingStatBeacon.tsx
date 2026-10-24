'use client'

import { useEffect } from 'react'

/**
 * Counts a view of this listing, and clicks on its LINE and phone buttons, for
 * the owner's statistics.
 *
 * A view counts once per listing per browser tab session: a refresh or a trip
 * to the gallery and back is the same visitor reading the same page. Contact
 * buttons mark themselves with data-stat="line" | "phone"; one listener here
 * catches them, so the server-rendered page needs no client buttons.
 *
 * sendBeacon because a click on tel: or LINE often leaves the page at once,
 * and a normal fetch would be cancelled with it.
 */
export default function ListingStatBeacon({ propertyId }: { propertyId: string }) {
  useEffect(() => {
    const send = (kind: 'view' | 'line' | 'phone') => {
      const body = JSON.stringify({ id: propertyId, kind })
      try {
        if (navigator.sendBeacon?.('/api/listings/stat', new Blob([body], { type: 'application/json' }))) return
      } catch { /* fall through to fetch */ }
      fetch('/api/listings/stat', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {})
    }

    const seenKey = `sm_seen_${propertyId}`
    let seen = false
    try { seen = sessionStorage.getItem(seenKey) === '1' } catch { /* storage blocked: count it */ }
    if (!seen) {
      send('view')
      try { sessionStorage.setItem(seenKey, '1') } catch { /* ignore */ }
    }

    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.('[data-stat]')
      const kind = el?.getAttribute('data-stat')
      if (kind === 'line' || kind === 'phone') send(kind)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [propertyId])

  return null
}
