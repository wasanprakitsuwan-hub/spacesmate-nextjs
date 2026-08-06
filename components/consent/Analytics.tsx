'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { readConsent, onConsentChange, trackingAllowed, type Consent } from '@/lib/consent'

/**
 * Google Tag Manager, loaded only after consent.
 *
 * Previously GTM was injected directly in app/layout.tsx on every request,
 * together with a <noscript> iframe that fired before anything else on the
 * page. Neither waited for permission.
 *
 * THE NOSCRIPT IFRAME IS GONE AND NOT COMING BACK
 *   It cannot be gated: a visitor with JavaScript disabled cannot be shown a
 *   consent banner, cannot answer it, and cannot have an answer stored. The
 *   only defensible behaviour for that visitor is to track nothing. Losing
 *   measurement of a tiny, unmeasurable minority is the correct trade.
 *
 * Google Consent Mode is deliberately not used here. It would let GTM load with
 * signals denied, which still sends Google cookieless pings. "We sent them less
 * than we could have" defends worse than "we sent nothing".
 */

const GTM_ID = 'GTM-PJ6X4NHS'

export default function Analytics() {
  const [consent, setConsent] = useState<Consent | null>(null)

  useEffect(() => {
    setConsent(readConsent())
    return onConsentChange(setConsent)
  }, [])

  // Withdrawal mid-session unloads nothing already running — scripts cannot be
  // un-executed. It does stop GTM loading on every subsequent navigation, and
  // the reload prompt in the banner covers the current page.
  if (!trackingAllowed(consent)) return null

  return (
    <Script id="gtm" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
    </Script>
  )
}
