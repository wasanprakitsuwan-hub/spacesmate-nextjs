'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { DASH_T, type Locale } from '@/lib/dashboard-i18n'
import { C, RADIUS } from '@/lib/ui'

interface ProfileData {
  full_name:      string
  phone:          string
  email:          string
  active_package: string | null
  package_expires_at: string | null
}



const INP: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: RADIUS,
  border: `1px solid ${C.border}`, fontSize: 14, outline: 'none',
  boxSizing: 'border-box', background: C.white, color: C.ink, fontFamily: 'inherit',
}
const LBL: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 6,
}

export default function ProfileBody({ locale = 'th' }: { locale?: Locale }) {
  const t = DASH_T[locale]
  const [profile,  setProfile]  = useState<ProfileData>({ full_name: '', phone: '', email: '', active_package: null, package_expires_at: null })
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState('')
  const [userId,   setUserId]   = useState('')

  // Password change
  const [pwdSection, setPwdSection] = useState(false)
  const [newPwd,     setNewPwd]     = useState('')
  const [newPwd2,    setNewPwd2]    = useState('')
  const [pwdSaving,  setPwdSaving]  = useState(false)
  const [pwdMsg,     setPwdMsg]     = useState('')
  const [pwdErr,     setPwdErr]     = useState('')

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      setUserId(session.user.id)
      // Fetch profile via service-role API for RLS bypass
      const r = await fetch('/api/auth/role', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const d = await r.json()
      setProfile({
        full_name:          d.full_name          ?? '',
        phone:              d.phone              ?? '',
        email:              session.user.email   ?? '',
        active_package:     d.active_package     ?? null,
        package_expires_at: d.package_expires_at ?? null,
      })
      setLoading(false)
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(''); setSaved(false)
    try {
      // Through the server: the browser has no write access to user_profiles,
      // and a direct update there can match zero rows and still report success.
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error(t.saveFailed)
      const res = await fetch('/api/owner/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ full_name: profile.full_name, phone: profile.phone }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(locale === 'th' && j.error ? j.error : t.saveFailed)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message || t.saveFailed)
    }
    setSaving(false)
  }

  async function handlePwdChange(e: React.FormEvent) {
    e.preventDefault()
    setPwdErr(''); setPwdMsg('')
    if (newPwd.length < 8) { setPwdErr(t.passwordTooShort); return }
    if (newPwd !== newPwd2) { setPwdErr(t.passwordMismatch); return }
    setPwdSaving(true)
    try {
      const supabase = createBrowserClient()
      const { error: pwErr } = await supabase.auth.updateUser({ password: newPwd })
      if (pwErr) throw new Error(pwErr.message)
      setPwdMsg(t.passwordOk)
      setNewPwd(''); setNewPwd2('')
      setTimeout(() => { setPwdMsg(''); setPwdSection(false) }, 3000)
    } catch (err: any) {
      setPwdErr(err.message || t.passwordFailed)
    }
    setPwdSaving(false)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #048c73', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#94a3b8', fontSize: 14 }}>{t.loadingData}</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    )
  }

  const card: React.CSSProperties = { background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }
  const h2: React.CSSProperties = { margin: 0, fontSize: 16, fontWeight: 600, color: C.green }
  const hint: React.CSSProperties = { fontSize: 12, color: C.muted, margin: '5px 0 0' }
  const btn = (primary: boolean, busy: boolean): React.CSSProperties => ({
    alignSelf: 'flex-start', background: primary ? C.teal : C.white, color: primary ? C.white : C.ink,
    border: `1px solid ${primary ? C.teal : C.border}`, borderRadius: RADIUS, padding: '9px 18px', fontSize: 14, fontWeight: 500,
    cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1, fontFamily: 'inherit',
  })
  const note = (ok: boolean): React.CSSProperties => ({
    background: ok ? '#e6f2ec' : '#fbe9e7', border: `1px solid ${ok ? '#c6dfd3' : '#f1c4bd'}`, borderRadius: RADIUS,
    padding: '10px 14px', color: ok ? C.green : '#b42318', fontSize: 13,
  })

  return (
    <div style={{ maxWidth: 820, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: C.green, margin: 0 }}>{t.profileTitle}</h1>
        <span style={{ fontSize: 13, color: C.muted }}>{t.profileSub}</span>
      </div>

      <form onSubmit={handleSave} style={card}>
        <h2 style={h2}>{t.contactDetails}</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <label style={LBL}>{t.fullName}</label>
            <input type="text" value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} placeholder={t.fullNamePlaceholder} style={INP} />
          </div>
          <div style={{ flex: '1 1 220px' }}>
            <label style={LBL}>{t.phone}</label>
            <input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="08x-xxx-xxxx" style={INP} />
          </div>
          <div style={{ flex: '1 1 100%' }}>
            <label style={LBL}>{t.email}</label>
            <input type="email" value={profile.email} readOnly style={{ ...INP, background: C.paper, color: C.muted, cursor: 'default' }} />
            <p style={hint}>{t.emailLocked}</p>
          </div>
        </div>
        {error && <div role="alert" style={note(false)}>{error}</div>}
        {saved && <div role="status" style={note(true)}>{t.saveOk}</div>}
        <button type="submit" disabled={saving} style={btn(true, saving)}>{saving ? t.saving : t.saveProfile}</button>
      </form>

      <section style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h2 style={h2}>{t.changePassword}</h2>
          <button type="button" onClick={() => { setPwdSection(v => !v); setPwdErr(''); setPwdMsg('') }} style={btn(false, false)}>
            {pwdSection ? t.cancel : t.changePassword}
          </button>
        </div>
        {pwdSection && (
          <form onSubmit={handlePwdChange} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 240px' }}>
                <label style={LBL}>{t.newPassword}</label>
                <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required minLength={6} placeholder={t.min8} style={INP} />
              </div>
              <div style={{ flex: '1 1 240px' }}>
                <label style={LBL}>{t.confirmNewPassword}</label>
                <input type="password" value={newPwd2} onChange={e => setNewPwd2(e.target.value)} required placeholder="••••••••" style={INP} />
              </div>
            </div>
            {pwdErr && <div role="alert" style={note(false)}>{pwdErr}</div>}
            {pwdMsg && <div role="status" style={note(true)}>{pwdMsg}</div>}
            <button type="submit" disabled={pwdSaving} style={btn(true, pwdSaving)}>{pwdSaving ? t.saving : t.savePassword}</button>
          </form>
        )}
      </section>
    </div>
  )
}
