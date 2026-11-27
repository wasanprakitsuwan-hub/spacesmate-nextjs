'use client'

import { useEffect, useState } from 'react'
import Link from '@/components/ui/LocaleLink'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import { createBrowserClient } from '@/lib/supabase'
// Google sign-ups carry no tick; TermsGate asks them once when they land.
import { termsMetadata } from '@/lib/terms-consent'
import { trackEvent } from '@/lib/analytics'
import { isInAppBrowser } from '@/lib/funnel'
import { SUBMIT_NEW_T, type Locale } from '@/lib/submit-new-i18n'
import { C, RADIUS, btnStyle } from '@/lib/ui'

/**
 * The account step of the listing form, asked only when the owner saves.
 *
 * Inside Facebook / Instagram / LINE's own browser, Google refuses to sign
 * anyone in ("disallowed_useragent"), so there the sheet leads with email and
 * password and explains how to reach Google. Everywhere else Google comes
 * first, because it is one tap and needs no inbox.
 *
 * With Supabase "Confirm email" off, signUp returns a session at once and the
 * draft saves straight away; the email is proven later, before the first
 * payment (lib/email-verify). While the switch is still on, signUp returns no
 * session: the sheet says to click the emailed link, and the draft waits in
 * localStorage for their return.
 */
export default function AccountSheet({
  locale = 'th', redirectTo, onDone, onClose,
}: {
  locale?: Locale
  /** Where Google brings them back to (this form; the draft is in localStorage). */
  redirectTo: string
  onDone: () => void
  onClose: () => void
}) {
  const t = SUBMIT_NEW_T[locale]
  const lp = (path: string) => (locale === 'en' ? `/en${path}` : path)
  const [inApp, setInApp] = useState(false)
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [showEmail, setShowEmail] = useState(false)
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [inbox, setInbox] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fb = isInAppBrowser()
    setInApp(fb)
    setShowEmail(fb)
    trackEvent('account_sheet_open', { in_app: fb })
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const addr = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) { setError(t.badEmail); return }
    if (pwd.length < 8) { setError(t.pwdTooShort); return }
    if (mode === 'signup' && !accepted) { setError(t.needAccept); return }
    setBusy(true); setError('')
    const supabase = createBrowserClient()
    try {
      if (mode === 'login') {
        const { data } = await supabase.auth.signInWithPassword({ email: addr, password: pwd })
        if (!data?.session) { setError(t.badLogin); setBusy(false); return }
        onDone()
        return
      }

      const pre = await fetch('/api/auth/pre-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: addr, honeypot }),
      })
      const preJ = await pre.json().catch(() => ({})) as { ok?: boolean; error?: string }
      if (!pre.ok || !preJ.ok) { setError(preJ.error ?? t.genericError); setBusy(false); return }

      const { data, error: err } = await supabase.auth.signUp({
        email: addr, password: pwd,
        options: {
          data: { ...termsMetadata(false) },
          emailRedirectTo: `${window.location.origin}${redirectTo}`,
        },
      })
      if (err) {
        if (/already registered|already exists/i.test(err.message)) {
          setMode('login'); setError(t.alreadyRegistered)
        } else {
          setError(err.message || t.genericError)
        }
        setBusy(false); return
      }
      // Supabase answers an existing address with a user that has no
      // identities, rather than an error, so it cannot be used to probe.
      if (data.user && (data.user.identities?.length ?? 0) === 0) {
        setMode('login'); setError(t.alreadyRegistered); setBusy(false); return
      }
      trackEvent('sign_up', { method: 'email', in_app: inApp })
      if (data.session) { onDone(); return }
      setInbox(addr)
    } catch {
      setError(t.genericError)
    }
    setBusy(false)
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
    } catch { /* clipboard blocked: the URL bar still works */ }
  }

  const input: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', height: 48, padding: '0 12px',
    border: `1px solid ${C.border}`, borderRadius: RADIUS, fontSize: 15, fontFamily: 'inherit',
  }
  const linkBtn: React.CSSProperties = { background: 'none', border: 0, padding: 0, color: C.teal, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit' }

  return (
    <div role="dialog" aria-modal="true" aria-label={t.acctTitle}
      style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(35,31,32,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <style>{`@keyframes smSheetIn { from { transform: translateY(24px); opacity: 0 } to { transform: none; opacity: 1 } }
        @media (min-width: 640px) { .sm-sheet { border-radius: 16px !important; margin-bottom: 10vh; } }`}</style>
      <div className="sm-sheet" style={{
        width: '100%', maxWidth: 440, maxHeight: '92vh', overflowY: 'auto', background: C.white,
        borderRadius: '18px 18px 0 0', padding: '20px 20px calc(24px + env(safe-area-inset-bottom, 0px))',
        animation: 'smSheetIn .22s ease-out', boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 21, fontWeight: 600, color: C.green }}>{mode === 'login' ? t.acctLoginTitle : t.acctTitle}</h2>
          <button type="button" onClick={onClose} style={{ ...linkBtn, color: C.muted }}>{t.close}</button>
        </div>

        {inbox ? (
          <p style={{ margin: '12px 0 0', fontSize: 14.5, lineHeight: 1.7, color: C.ink }}>{t.checkInbox(inbox)}</p>
        ) : (
          <>
            <p style={{ margin: '6px 0 18px', fontSize: 14, lineHeight: 1.6, color: C.muted }}>{t.acctBody}</p>

            {!inApp && (
              <>
                <GoogleSignInButton
                  locale={locale}
                  label={t.withGoogle}
                  redirectTo={redirectTo}
                />
                <p style={{ margin: '14px 0', fontSize: 13, color: C.muted, textAlign: 'center' }}>{t.or}</p>
                {!showEmail && (
                  <button type="button" onClick={() => setShowEmail(true)} style={{ ...btnStyle('ghost'), width: '100%', height: 48 }}>{t.withEmail}</button>
                )}
              </>
            )}

            {showEmail && (
              <form onSubmit={submit} style={{ display: 'grid', gap: 12 }} noValidate>
                {/* Bots fill every field; people never see this one. */}
                <input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)}
                  aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
                <label>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{t.email}</span>
                  <input type="email" inputMode="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={input} />
                </label>
                <label>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{mode === 'login' ? t.passwordLogin : t.password}</span>
                  <input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={pwd} onChange={e => setPwd(e.target.value)} placeholder={t.pwdHint} style={input} />
                </label>
                {mode === 'signup' && (
                  <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, lineHeight: 1.55, cursor: 'pointer' }}>
                    <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} style={{ width: 18, height: 18, accentColor: C.teal, marginTop: 2, flexShrink: 0 }} />
                    <span>
                      {t.acceptLead}{' '}
                      <Link href={lp('/terms')} target="_blank" style={{ color: C.teal }}>{t.terms}</Link>
                      {' '}{t.and}{' '}
                      <Link href={lp('/privacy')} target="_blank" style={{ color: C.teal }}>{t.privacy}</Link>
                    </span>
                  </label>
                )}
                {error && <p role="alert" style={{ margin: 0, fontSize: 13.5, color: '#b42318' }}>{error}</p>}
                <button type="submit" disabled={busy} className="sm-btn-primary" style={{ ...btnStyle('primary'), height: 52, fontSize: 16, opacity: busy ? 0.7 : 1 }}>
                  {busy ? t.saving : mode === 'login' ? t.loginAndSave : t.signupAndSave}
                </button>
                {mode === 'signup' && <p style={{ margin: 0, fontSize: 12.5, color: C.muted, textAlign: 'center' }}>{t.verifyLater}</p>}
              </form>
            )}

            {!showEmail && error && <p role="alert" style={{ margin: '10px 0 0', fontSize: 13.5, color: '#b42318' }}>{error}</p>}

            <p style={{ margin: '16px 0 0', fontSize: 13.5, textAlign: 'center', color: C.muted }}>
              {mode === 'signup' ? t.haveAccount : t.noAccount}{' '}
              <button type="button" style={linkBtn} onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setShowEmail(true); setError('') }}>
                {mode === 'signup' ? t.toLogin : t.toSignup}
              </button>
            </p>

            {inApp && (
              <div style={{ marginTop: 16, padding: 12, background: C.paper, borderRadius: RADIUS }}>
                <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: C.ink }}>{t.googleInApp}</p>
                <button type="button" onClick={copyLink} style={{ ...btnStyle('ghost'), marginTop: 8, height: 40, fontSize: 13.5 }}>{copied ? t.copied : t.copyLink}</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
