'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { AUTH_T, type Locale } from '@/lib/auth-i18n'
import { flushPendingTerms, postTerms } from '@/lib/terms-consent'
import TermsTick from '@/components/auth/TermsTick'

/**
 * Asks a signed-in account to accept the Terms of Use and Privacy Policy once,
 * if it never has: Google sign-in from the login tab (which skips the sign-up
 * tick) and accounts created before sign-up asked. A Google sign-up's tick is
 * posted here first, so those owners never see the prompt.
 *
 * Fails open — if the check cannot run, nobody is blocked. See
 * app/api/consent/signup.
 */
export default function TermsGate({ locale = 'th' }: { locale?: Locale }) {
  const t = AUTH_T[locale]
  const [token,     setToken]     = useState<string | null>(null)
  const [show,      setShow]      = useState(false)
  const [accepted,  setAccepted]  = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [busy,      setBusy]      = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data: { session } } = await createBrowserClient().auth.getSession()
        if (!session) return
        await flushPendingTerms(session.access_token)
        const res = await fetch('/api/consent/signup', { headers: { Authorization: `Bearer ${session.access_token}` } })
        if (!res.ok) return
        const { accepted } = await res.json()
        if (!cancelled && accepted === false) { setToken(session.access_token); setShow(true) }
      } catch {
        // Fail open.
      }
    })()
    return () => { cancelled = true }
  }, [])

  async function accept() {
    if (!token || !accepted) return
    setBusy(true); setError('')
    const ok = await postTerms(token, marketing, 'terms_gate')
    setBusy(false)
    if (ok) setShow(false)
    else setError(t.termsGateFailed)
  }

  if (!show) return null
  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 18, padding: '26px 24px', maxWidth: 440, width: '100%' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 8px' }}>{t.termsGateTitle}</h2>
        <p style={{ fontSize: 13.5, color: '#475569', margin: '0 0 18px', lineHeight: 1.6 }}>{t.termsGateBody}</p>
        <TermsTick locale={locale} accepted={accepted} onAccepted={setAccepted} marketing={marketing} onMarketing={setMarketing} />
        {error && <p style={{ fontSize: 12.5, color: '#b91c1c', margin: '12px 0 0' }}>{error}</p>}
        <button type="button" onClick={accept} disabled={!accepted || busy}
          style={{ marginTop: 18, width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: !accepted || busy ? '#94a3b8' : '#048c73', color: '#fff', fontSize: 15, fontWeight: 700, cursor: !accepted || busy ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
          {t.termsGateCta}
        </button>
      </div>
    </div>
  )
}
