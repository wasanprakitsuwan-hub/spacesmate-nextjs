'use client'

import { useEffect } from 'react'
import { readConsent, onConsentChange } from '@/lib/consent'
import { captureAttribution, dropClickId } from '@/lib/funnel'

/** Keeps the ad's UTM tags (and fbclid, with marketing consent) for the listing. */
export default function FbAttribution() {
  useEffect(() => {
    captureAttribution(readConsent()?.marketing === true)
    return onConsentChange(c => {
      if (c?.marketing) captureAttribution(true)
      else dropClickId()
    })
  }, [])
  return null
}
