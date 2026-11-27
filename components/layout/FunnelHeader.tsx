'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { SUBMIT_NEW_T, type Locale } from '@/lib/submit-new-i18n'

/**
 * Header for the owner funnel (lib/funnel): logo and one small link. Logged out
 * it says เข้าสู่ระบบ and returns them to the form; logged in it goes to their
 * listings. Nothing else, so an ad visitor has no detour out of the flow.
 * The logo is deliberately not a link to the homepage for the same reason.
 */
export default function FunnelHeader({ locale = 'th' }: { locale?: Locale }) {
  const t = SUBMIT_NEW_T[locale]
  const [signedIn, setSignedIn] = useState(false)
  useEffect(() => {
    createBrowserClient().auth.getSession()
      .then(({ data: { session } }) => setSignedIn(!!session))
      .catch(() => {})
  }, [])
  const lp = (p: string) => (locale === 'en' ? `/en${p}` : p)
  const href = signedIn
    ? '/owner-dashboard'
    : `${lp('/login')}?redirect=${encodeURIComponent(lp('/list-your-property/new'))}`
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 40, height: 56, background: '#ffffff', borderBottom: '1px solid #e5e2da' }}>
      <div style={{ maxWidth: 1120, height: '100%', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="SpacesMate" width={82} height={36} style={{ height: 36, width: "auto" }} />
        <a href={href} style={{ fontSize: 14, fontWeight: 500, color: '#037a64', textDecoration: 'none', padding: '10px 0' }}>
          {signedIn ? t.dashboard : t.login}
        </a>
      </div>
    </header>
  )
}
