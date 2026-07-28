'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { trackEvent } from '@/lib/analytics'

/**
 * One-time phone capture for owners who registered with Google.
 *
 * THE GAP THIS FILLS
 *   Email signup collects full_name and phone, and the on_auth_user_created
 *   trigger writes both into user_profiles. Google gives us a verified email and
 *   a name, but never a phone number — so a Google-registered landlord has an
 *   empty phone field.
 *
 *   That matters for exactly one group: people who registered and have not yet
 *   listed anything. They are the most valuable people to be able to call, and
 *   the only ones we would have no number for. The listing form collects a
 *   contact phone of its own, so anyone who lists is already reachable.
 *
 * WHY HERE AND NOT AT SIGN-IN
 *   Putting a form immediately after Google returns would reintroduce the
 *   friction the Google button exists to remove. This asks on the dashboard,
 *   once, at the point where the number is obviously needed — and it can be
 *   dismissed. It reappears next visit until given, because a landlord with no
 *   contact number is a real operational problem, not a cosmetic one.
 *
 * Also fires sign_up for genuinely new Google accounts. OAuth gives no
 * "is this a signup" signal, so the button sets a sessionStorage marker before
 * redirecting and we resolve it here by checking how old the account is.
 */
export default function PhonePrompt() {
  const [show,    setShow]    = useState(false)
  const [phone,   setPhone]   = useState('')
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    (async () => {
      try {
        const supabase = createBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // ── Resolve the pending Google auth into the right analytics event ──
        if (sessionStorage.getItem('sm_google_auth_pending')) {
          sessionStorage.removeItem('sm_google_auth_pending')
          // Under two minutes old means the account was created by this very
          // sign-in. Anything older is a returning user logging back in.
          const ageMs = Date.now() - new Date(user.created_at).getTime()
          if (ageMs < 2 * 60 * 1000) {
            trackEvent('sign_up', { method: 'google' })
            if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
              window.fbq('track', 'CompleteRegistration')
            }
          } else {
            trackEvent('login', { method: 'google' })
          }
        }

        // Only ask when the number is genuinely missing.
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('phone')
          .eq('id', user.id)
          .maybeSingle()

        const missing = !profile?.phone || String(profile.phone).trim() === ''
        if (missing && !sessionStorage.getItem('sm_phone_prompt_dismissed')) {
          setShow(true)
          trackEvent('phone_prompt_shown', { source: 'owner_dashboard' })
        }
      } catch {
        // Never let this block the dashboard. A missing prompt is a small loss;
        // a dashboard that will not load is a large one.
      }
    })()
  }, [])

  async function save() {
    const clean = phone.replace(/[^\d+]/g, '')
    if (clean.length < 9) {
      setError('กรุณากรอกเบอร์โทรให้ครบถ้วน')
      return
    }
    setSaving(true)
    setError('')
    try {
      // Through the server, not a client .update(): user_profiles has RLS with
      // no owner UPDATE policy, so a direct write would match zero rows and
      // still report success.
      const { data: { session } } = await createBrowserClient().auth.getSession()
      const res = await fetch('/api/owner/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ phone: clean }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'บันทึกไม่สำเร็จ')

      trackEvent('phone_prompt_saved', { source: 'owner_dashboard' })
      setShow(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ')
      setSaving(false)
    }
  }

  function dismiss() {
    // Session-scoped, not permanent: it returns next visit until we have a
    // number. Deliberate — but it never blocks anything in the meantime.
    sessionStorage.setItem('sm_phone_prompt_dismissed', '1')
    trackEvent('phone_prompt_dismissed', { source: 'owner_dashboard' })
    setShow(false)
  }

  if (!show) return null

  return (
    <div style={{
      background: '#fff', border: '1.5px solid #fde68a', borderLeft: '4px solid #d97f11',
      borderRadius: 14, padding: '16px 18px', marginBottom: 20,
      display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap',
    }}>
      <span className="msym" style={{ fontSize: 22, color: '#d97f11', fontVariationSettings: "'wght' 400, 'FILL' 1", flexShrink: 0 }}>
        call
      </span>

      <div style={{ flex: 1, minWidth: 220 }}>
        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: '#02402e' }}>
          เพิ่มเบอร์โทรติดต่อ
        </p>
        <p style={{ margin: '3px 0 10px', fontSize: 13, color: '#64748b' }}>
          เพื่อให้ผู้เช่าและทีมงาน SpacesMate ติดต่อคุณได้ — ใช้เวลาไม่ถึงนาที
        </p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={e => { setPhone(e.target.value); setError('') }}
            placeholder="08X-XXX-XXXX"
            style={{
              flex: 1, minWidth: 160, padding: '10px 14px', borderRadius: 10,
              border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit',
            }}
          />
          <button
            onClick={save}
            disabled={saving}
            style={{
              padding: '10px 20px', borderRadius: 10, border: 'none',
              background: saving ? '#94a3b8' : '#048c73', color: '#fff',
              fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {saving ? 'กำลังบันทึก…' : 'บันทึก'}
          </button>
          <button
            onClick={dismiss}
            disabled={saving}
            style={{
              padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0',
              background: '#fff', color: '#64748b', fontSize: 13.5, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            ไว้ทีหลัง
          </button>
        </div>

        {error && (
          <p style={{ margin: '8px 0 0', fontSize: 12.5, color: '#b91c1c' }}>{error}</p>
        )}
      </div>
    </div>
  )
}
