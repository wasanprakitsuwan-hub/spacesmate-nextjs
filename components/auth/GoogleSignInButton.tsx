'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { trackEvent } from '@/lib/analytics'

/**
 * Sign in / register with Google.
 *
 * WHY THIS EXISTS
 *   Email registration needs a password, then an inbox visit, then a click back.
 *   Every step loses people, and the ones it loses hardest are exactly who the
 *   Facebook ads bring: someone on a phone, mid-scroll, who has no intention of
 *   switching to their email app. Google sign-in is one tap and no inbox.
 *
 * WHAT IT SKIPS, AND WHY THAT IS FINE
 *   /api/auth/pre-register (honeypot, disposable-domain blocklist, bot-pattern
 *   detection, IP rate limit) never runs on this path. That is a gain, not a
 *   hole: Google has already proved a human with a real account, which is what
 *   those checks were approximating. The IP rate limit in particular was
 *   rejecting legitimate Thai users behind carrier-grade NAT — flagged in that
 *   route as a prime suspect in the ads conversion gap.
 *
 * WHAT STILL HAPPENS
 *   The `on_auth_user_created` trigger fires on the auth.users insert exactly as
 *   it does for email signup, creating the user_profiles row with role
 *   'landlord' and full_name from Google. Only `phone` is missing — Google does
 *   not provide one — which is collected later by the dashboard prompt.
 *
 * NO CALLBACK ROUTE
 *   The browser client uses supabase-js defaults (implicit flow,
 *   detectSessionInUrl), so the session is read from the URL fragment when the
 *   user lands. Adding a /auth/callback route would do nothing here.
 */
export default function GoogleSignInButton({
  redirectTo = '/owner-dashboard',
  label = 'ดำเนินการต่อด้วย Google',
}: {
  redirectTo?: string
  label?: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function signIn() {
    setLoading(true)
    setError('')
    try {
      trackEvent('sign_in_google_start', { redirect_to: redirectTo })

      // Marker so the landing page can tell a brand-new account from a returning
      // one. OAuth returns no "is this a signup" flag, and firing sign_up on
      // every Google login would badly overstate registrations.
      sessionStorage.setItem('sm_google_auth_pending', '1')

      const { error: err } = await createBrowserClient().auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${redirectTo}`,
          queryParams: { prompt: 'select_account' },
        },
      })
      if (err) throw err
      // Success navigates away; no state to reset.
    } catch (err) {
      sessionStorage.removeItem('sm_google_auth_pending')
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={signIn}
        disabled={loading}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10, padding: '12px 16px', borderRadius: 24,
          border: '1.5px solid #e2e8f0', background: '#fff', color: '#231f20',
          fontSize: 14.5, fontWeight: 600, fontFamily: 'inherit',
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
          transition: 'all .15s',
        }}
      >
        {/* Google's mark must keep its own colours — restyling it in brand green
            breaches Google's identity guidelines. */}
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3A12 12 0 0 1 12 24a12 12 0 0 1 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7A20 20 0 0 0 24 4a20 20 0 1 0 19.6 16.5z"/>
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7A20 20 0 0 0 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.6 5.1A20 20 0 0 0 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.3 0-1.3-.1-2.3-.4-4.5z"/>
        </svg>
        {loading ? 'กำลังเชื่อมต่อ…' : label}
      </button>

      {error && (
        <p style={{ margin: '8px 0 0', fontSize: 12.5, color: '#b91c1c', textAlign: 'center' }}>
          {error}
        </p>
      )}
    </div>
  )
}
