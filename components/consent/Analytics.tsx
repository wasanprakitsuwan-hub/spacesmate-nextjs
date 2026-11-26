'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { Analytics as VercelAnalytics } from '@vercel/analytics/next'
import { readConsent, onConsentChange, type Consent } from '@/lib/consent'
import { GA_ID, META_PIXEL_ID } from '@/lib/tracking-config'
import ClickTracking from '@/components/consent/ClickTracking'

/**
 * Tag loader: GA4 (direct gtag.js), the Meta pixel and Vercel Web Analytics.
 *
 * GA4
 *   Loads for every visitor on the live site, with Consent Mode v2 defaults
 *   set to denied by <ConsentDefaults /> before this runs. The visitor's
 *   banner choice is passed to Google as a consent update, here, whenever it
 *   changes. GTM (GTM-PJ6X4NHS) is no longer loaded: it held only the GA4
 *   tag and a few event tags, so loading both would count every page twice.
 *   All events now go straight to GA4 through lib/analytics.
 *
 * META PIXEL
 *   Loaded only once the visitor allows marketing cookies, and told to revoke
 *   if they later withdraw. Nothing is sent to Meta before that, matching what
 *   the banner promises for marketing cookies.
 *
 * VERCEL WEB ANALYTICS
 *   Cookieless visitor counter, so visitors who decline still show up as
 *   anonymous counts. It stores no cookies and no IP address.
 */

function applyGoogleConsent(c: Consent | null) {
  window.gtag?.('consent', 'update', {
    analytics_storage:  c?.analytics ? 'granted' : 'denied',
    ad_storage:         c?.marketing ? 'granted' : 'denied',
    ad_user_data:       c?.marketing ? 'granted' : 'denied',
    ad_personalization: c?.marketing ? 'granted' : 'denied',
  })
}

/** The standard Meta base code, as a function so it runs only on consent. */
function loadMetaPixel() {
  if (window.fbq) return
  /* eslint-disable */
  ;(function (f: any, b: Document, e: string, v: string) {
    if (f.fbq) return
    const n: any = (f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    })
    if (!f._fbq) f._fbq = n
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = []
    const t = b.createElement(e) as HTMLScriptElement
    t.async = true; t.src = v
    const s = b.getElementsByTagName(e)[0]
    s.parentNode!.insertBefore(t, s)
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
  /* eslint-enable */
  window.fbq!('consent', 'grant')
  window.fbq!('init', META_PIXEL_ID)
  window.fbq!('track', 'PageView')
}

function applyMetaConsent(c: Consent | null) {
  if (c?.marketing) {
    if (window.fbq) window.fbq('consent', 'grant')
    else loadMetaPixel()
  } else if (window.fbq) {
    window.fbq('consent', 'revoke')
  }
}

export default function Analytics() {
  const [enabled, setEnabled] = useState(false)
  const [debug, setDebug] = useState(false)

  useEffect(() => {
    if (!window.__smTrack) return
    setEnabled(true)
    setDebug(new URLSearchParams(window.location.search).get('debug_mode') === 'true')

    // A returning visitor's choice was already given to Google by the
    // consent-default script. The pixel still needs loading if they allowed it.
    applyMetaConsent(readConsent())

    return onConsentChange(c => {
      applyGoogleConsent(c)
      applyMetaConsent(c)
    })
  }, [])

  return (
    <>
      <VercelAnalytics />
      <ClickTracking />
      {enabled && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4-config" strategy="afterInteractive">
            {`gtag('js', new Date());
gtag('config', '${GA_ID}'${debug ? ", { debug_mode: true }" : ''});`}
          </Script>
        </>
      )}
    </>
  )
}
