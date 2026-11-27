'use client'

import { useEffect, useRef, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { SUBMIT_NEW_T, type Locale } from '@/lib/submit-new-i18n'
import { C, RADIUS, btnStyle } from '@/lib/ui'
import { trackEvent } from '@/lib/analytics'

/**
 * Six-digit email code, typed into the page the owner is already on.
 *
 * Shown before the first payment (see lib/email-verify). Sends the code as soon
 * as it appears, so the owner's next move is simply to open their mail app.
 */
export default function EmailCodePanel({
  locale = 'th', email, onVerified, confirmLabel,
}: {
  locale?: Locale
  email?: string
  onVerified: () => void
  confirmLabel?: string
}) {
  const t = SUBMIT_NEW_T[locale]
  const [code, setCode] = useState('')
  const [to, setTo] = useState(email ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [wait, setWait] = useState(0)
  const sentOnce = useRef(false)

  async function token() {
    const { data: { session } } = await createBrowserClient().auth.getSession()
    return session?.access_token ?? ''
  }

  async function send() {
    setError('')
    try {
      const res = await fetch('/api/auth/email-code', { method: 'POST', headers: { Authorization: `Bearer ${await token()}` } })
      const j = await res.json().catch(() => ({}))
      if (j.verified) { onVerified(); return }
      if (res.status === 429 && j.retry_after) { setWait(j.retry_after); return }
      if (!res.ok) { setError(t.codeSendFailed); return }
      if (j.email) setTo(j.email)
      setWait(60)
      trackEvent('email_code_sent')
    } catch {
      setError(t.codeSendFailed)
    }
  }

  useEffect(() => {
    if (sentOnce.current) return
    sentOnce.current = true
    void send()
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (wait <= 0) return
    const id = setTimeout(() => setWait(w => w - 1), 1000)
    return () => clearTimeout(id)
  }, [wait])

  async function confirm() {
    if (code.length !== 6) { setError(t.codeWrong); return }
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/auth/email-code/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await token()}` },
        body: JSON.stringify({ code }),
      })
      const j = await res.json().catch(() => ({}))
      if (res.ok && j.ok) {
        trackEvent('email_verified')
        onVerified()
        return
      }
      setError(j.error === 'too_many' ? t.codeTooMany : t.codeWrong)
    } catch {
      setError(t.genericError)
    }
    setBusy(false)
  }

  return (
    <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS, padding: 20 }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: C.green }}>{t.codeTitle}</h2>
      <p style={{ margin: '8px 0 16px', fontSize: 14.5, lineHeight: 1.65, color: C.ink }}>{t.codeBody(to || '…')}</p>
      <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, marginBottom: 6 }} htmlFor="sm-email-code">{t.codeLabel}</label>
      <input
        id="sm-email-code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        onKeyDown={e => { if (e.key === 'Enter') void confirm() }}
        style={{
          width: '100%', boxSizing: 'border-box', height: 56, padding: '0 14px',
          border: `1px solid ${code.length === 6 ? C.teal : C.border}`, borderRadius: RADIUS,
          fontSize: 26, fontWeight: 600, letterSpacing: 12, textAlign: 'center', fontFamily: 'monospace',
        }}
      />
      <p style={{ margin: '10px 0 0', fontSize: 13, color: C.muted }}>
        {wait > 0
          ? t.codeResendIn(wait)
          : <button type="button" onClick={() => void send()} style={{ background: 'none', border: 0, padding: 0, color: C.teal, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>{t.codeResend}</button>}
      </p>
      {error && <p role="alert" style={{ margin: '10px 0 0', fontSize: 13.5, color: '#b42318' }}>{error}</p>}
      <button type="button" onClick={() => void confirm()} disabled={busy} className="sm-btn-primary"
        style={{ ...btnStyle('primary'), width: '100%', height: 50, marginTop: 16, opacity: busy ? 0.7 : 1 }}>
        {busy ? t.saving : (confirmLabel ?? t.codeConfirm)}
      </button>
    </div>
  )
}
