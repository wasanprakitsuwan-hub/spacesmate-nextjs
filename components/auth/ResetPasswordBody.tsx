'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { AUTH_T, type Locale } from '@/lib/auth-i18n'
import { localeHref } from '@/lib/routes-i18n'

const INP: React.CSSProperties = {
  width: '100%', padding: '13px 16px', borderRadius: 12,
  border: '1.5px solid #e2e8f0', fontSize: 15, fontFamily: 'inherit',
  outline: 'none', background: '#fff', boxSizing: 'border-box',
  transition: 'border-color .15s',
}

export default function ResetPasswordBody({ locale = 'th' }: { locale?: Locale }) {
  const t = AUTH_T[locale]
  const router  = useRouter()
  const [pwd,     setPwd]     = useState('')
  const [pwd2,    setPwd2]    = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [ready,   setReady]   = useState(false)  // session established via magic link

  // Supabase embeds the token in the URL hash when redirecting from the email link.
  // We need to wait for the auth state change that exchanges the token for a session.
  useEffect(() => {
    const supabase = createBrowserClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (!pwd || !pwd2)    { setError(t.needBothFields); return }
    if (pwd !== pwd2)     { setError(t.pwdMismatch); return }
    if (pwd.length < 8)   { setError(t.pwdTooShort); return }
    setLoading(true); setError('')
    try {
      const supabase = createBrowserClient()
      const { error: updateErr } = await supabase.auth.updateUser({ password: pwd })
      if (updateErr) throw updateErr
      setSuccess(true)
      setTimeout(() => router.push('/'), 3000)
    } catch (err: any) {
      setError(err.message ?? t.genericError)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8faf9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: "'Prompt', -apple-system, sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '36px 32px', maxWidth: 420, width: '100%', boxShadow: '0 8px 40px -10px rgba(2,64,46,0.14)' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#02402e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#d97f11', fontWeight: 800, fontSize: 18 }}>S</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, color: '#02402e' }}>SpacesMate</span>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <span className="msym" style={{ fontSize: 48, color: '#048c73', fontVariationSettings: "'wght' 400, 'FILL' 1" }}>check_circle</span>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#02402e', margin: '12px 0 6px' }}>{t.resetOk}</p>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{t.redirecting}</p>
          </div>
        ) : !ready ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#048c73', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 14px' }} />
            <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>{t.checkingLink}</p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '8px 0 0' }}>
              {t.takingLong}{' '}
              <a href={localeHref('/', locale)} style={{ color: '#048c73', fontWeight: 600 }}>{t.backHome}</a>
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <form onSubmit={handleReset}>
            <div style={{ marginBottom: 6 }}>
              <span className="msym" style={{ fontSize: 32, color: '#02402e', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>lock_reset</span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#02402e', margin: '0 0 6px' }}>{t.setNewPwdTitle}</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px' }}>{t.setNewPwdSub}</p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>{t.newPwd}</label>
              <div style={{ position: 'relative' }}>
                <input
                  style={{ ...INP, paddingRight: 46 }}
                  type={showPwd ? 'text' : 'password'}
                  value={pwd}
                  onChange={e => { setPwd(e.target.value); setError('') }}
                  placeholder={t.min8}
                  autoFocus
                  onFocus={e => (e.target.style.borderColor = '#048c73')}
                  onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{showPwd ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>{t.confirmNewPwd}</label>
              <input
                style={INP}
                type={showPwd ? 'text' : 'password'}
                value={pwd2}
                onChange={e => { setPwd2(e.target.value); setError('') }}
                placeholder={t.repeatPwd}
                onFocus={e => (e.target.style.borderColor = '#048c73')}
                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 12px', color: '#b91c1c', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1", flexShrink: 0 }}>warning</span>{error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: loading ? '#94a3b8' : '#02402e', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {loading ? t.savingPwd : t.savePwdBtn}
            </button>

            <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', margin: '16px 0 0' }}>
              <a href={localeHref('/', locale)} style={{ color: '#048c73', fontWeight: 600, textDecoration: 'none' }}>{t.backHome}</a>
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>
        )}
      </div>
    </div>
  )
}
