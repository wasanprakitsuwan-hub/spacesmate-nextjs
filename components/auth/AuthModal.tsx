'use client'

/**
 * AuthModal — login / signup popup.
 *
 * Anti-spam layers on signup:
 *   1. Honeypot hidden field — bots fill it, humans don't
 *   2. Pre-register API call (/api/auth/pre-register):
 *        - Disposable email domain blocklist
 *        - Bot-pattern username detection
 *        - IP rate limit (3/hour)
 *        - Cloudflare Turnstile token verification (when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set)
 *   3. Actual Supabase signUp only runs if pre-register returns { ok: true }
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'

interface Props {
  onClose: () => void
  defaultTab?: 'login' | 'signup'
}

const INP: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 12,
  border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit',
  outline: 'none', background: '#fff', boxSizing: 'border-box',
  transition: 'border-color .15s',
}
const LBL: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }
const FG: React.CSSProperties  = { marginBottom: 14 }

// ── Cloudflare Turnstile widget ────────────────────────────────────────────────
// Only rendered when NEXT_PUBLIC_TURNSTILE_SITE_KEY env var is present.
// Uses Turnstile's implicit rendering via data attributes.
function TurnstileWidget({ onToken }: { onToken: (t: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Turnstile script once
    const existing = document.getElementById('cf-turnstile-script')
    if (!existing) {
      const s = document.createElement('script')
      s.id  = 'cf-turnstile-script'
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      s.async = true
      s.defer = true
      document.head.appendChild(s)
    }

    // Wait for Turnstile to be available, then render
    let attempts = 0
    const poll = setInterval(() => {
      attempts++
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any
      if (w.turnstile && ref.current && !ref.current.dataset.rendered) {
        ref.current.dataset.rendered = 'true'
        w.turnstile.render(ref.current, {
          sitekey:  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
          callback: (token: string) => onToken(token),
          'expired-callback': () => onToken(''),
          theme: 'light',
          size: 'flexible',
        })
        clearInterval(poll)
      }
      if (attempts > 40) clearInterval(poll)  // give up after 4s
    }, 100)

    return () => clearInterval(poll)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={ref} style={{ margin: '4px 0 14px', minHeight: 65, borderRadius: 10, overflow: 'hidden' }} />
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AuthModal({ onClose, defaultTab = 'login' }: Props) {
  const router  = useRouter()
  const overlay = useRef<HTMLDivElement>(null)

  const [tab,      setTab]      = useState<'login' | 'signup'>(defaultTab)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPwd,   setLoginPwd]   = useState('')
  const [showPwd,    setShowPwd]    = useState(false)
  const [showPwd2,   setShowPwd2]   = useState(false)

  // Forgot password flow
  const [forgotPwd,   setForgotPwd]   = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')

  // Signup form
  const [signName,   setSignName]   = useState('')
  const [signEmail,  setSignEmail]  = useState('')
  const [signPwd,    setSignPwd]    = useState('')
  const [signPwd2,   setSignPwd2]   = useState('')
  const [signPhone,  setSignPhone]  = useState('')
  const [confirmedEmail, setConfirmedEmail] = useState('')

  // Anti-spam fields
  const [honeypot,        setHoneypot]        = useState('')   // must stay empty
  const [turnstileToken,  setTurnstileToken]  = useState('')   // set by Turnstile widget

  const turnstileEnabled = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  // Close on backdrop click
  function handleOverlay(e: React.MouseEvent) {
    if (e.target === overlay.current) onClose()
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function switchTab(t: 'login' | 'signup') {
    setTab(t); setError(''); setSuccess(''); setForgotPwd(false)
  }

  // ── Password strength ─────────────────────────────────────────────────────
  function pwdStrength(pwd: string): { level: 0|1|2|3; label: string; color: string } {
    if (!pwd) return { level: 0, label: '', color: '' }
    const hasLetter  = /[a-zA-Z]/.test(pwd)
    const hasNumber  = /[0-9]/.test(pwd)
    const hasSpecial = /[^a-zA-Z0-9]/.test(pwd)
    if (pwd.length < 8 || !hasLetter || !hasNumber)
      return { level: 1, label: 'อ่อน', color: '#ef4444' }
    if (hasSpecial || pwd.length >= 12)
      return { level: 3, label: 'แข็งแกร่ง', color: '#16a34a' }
    return { level: 2, label: 'ปานกลาง', color: '#d97f11' }
  }

  // ── Forgot Password ────────────────────────────────────────────────────────
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!forgotEmail) { setError('กรุณากรอกอีเมล'); return }
    setLoading(true); setError('')
    try {
      const supabase = createBrowserClient()
      const redirectTo = `${window.location.origin}/reset-password`
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), { redirectTo })
      if (resetErr) throw resetErr
      setSuccess(`ส่งลิงก์รีเซ็ตรหัสผ่านไปที่ ${forgotEmail} แล้ว — กรุณาตรวจสอบอีเมลของคุณ`)
      setForgotPwd(false)
    } catch (err: any) {
      setError(err.message ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
    setLoading(false)
  }

  async function getDashboardUrl(userId: string): Promise<string> {
    try {
      const supabase = createBrowserClient()
      const { data } = await supabase.from('user_profiles').select('role').eq('id', userId).single()
      return data?.role === 'admin' || data?.role === 'super_admin' ? '/dashboard' : '/owner-dashboard'
    } catch {
      return '/owner-dashboard'
    }
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!loginEmail || !loginPwd) { setError('กรุณากรอกอีเมลและรหัสผ่าน'); return }
    setLoading(true); setError('')
    try {
      const supabase = createBrowserClient()
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPwd })
      if (authErr) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      } else if (data.user) {
        onClose()
        const url = await getDashboardUrl(data.user.id)
        router.push(url)
        router.refresh()
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
    setLoading(false)
  }

  // ── Sign Up ────────────────────────────────────────────────────────────────
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!signName.trim() || !signEmail.trim() || !signPhone || !signPwd) { setError('กรุณากรอกข้อมูลให้ครบ'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signEmail.trim())) { setError('กรุณากรอกอีเมลที่ถูกต้อง เช่น name@email.com'); return }
    const cleanPhone = signPhone.replace(/[\s\-]/g, '')
    if (!/^0[6-9]\d{8}$/.test(cleanPhone)) { setError('เบอร์โทรศัพท์ไม่ถูกต้อง กรุณากรอกเบอร์มือถือ เช่น 081-234-5678'); return }
    if (signPwd !== signPwd2) { setError('รหัสผ่านไม่ตรงกัน'); return }
    if (signPwd.length < 8)  { setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'); return }
    if (!/[a-zA-Z]/.test(signPwd) || !/[0-9]/.test(signPwd)) { setError('รหัสผ่านต้องมีทั้งตัวอักษรและตัวเลข เช่น SpacesMate88'); return }

    setLoading(true); setError('')

    try {
      // ── Step 1: Pre-register validation (spam / rate limit / Turnstile) ──
      const preRes = await fetch('/api/auth/pre-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signEmail,
          honeypot,
          turnstileToken: turnstileEnabled ? turnstileToken : undefined,
        }),
      })
      const preData = await preRes.json() as { ok?: boolean; error?: string }

      if (!preRes.ok || !preData.ok) {
        setError(preData.error ?? 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่')
        setLoading(false)
        return
      }

      // ── Step 2: Actual Supabase sign-up ───────────────────────────────────
      const supabase = createBrowserClient()
      const { data, error: authErr } = await supabase.auth.signUp({
        email:    signEmail,
        password: signPwd,
        options:  {
          data: { full_name: signName },
          emailRedirectTo: `${window.location.origin}/owner-dashboard`,
        },
      })
      if (authErr) {
        setError(authErr.message || 'สมัครสมาชิกไม่สำเร็จ')
      } else if (data.user) {
        // Upsert profile as landlord
        await supabase.from('user_profiles').upsert(
          { id: data.user.id, email: signEmail, full_name: signName, phone: signPhone, role: 'landlord' },
          { onConflict: 'id', ignoreDuplicates: true }
        )
        setConfirmedEmail(signEmail)
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
    setLoading(false)
  }

  return (
    <div ref={overlay} onClick={handleOverlay} style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(2,64,46,0.35)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, width: '100%', maxWidth: 420,
        boxShadow: '0 24px 60px -12px rgba(2,64,46,0.28)',
        overflow: 'hidden', fontFamily: "'Prompt', -apple-system, sans-serif",
        animation: 'modalIn .2s ease',
      }}>
        {/* Header */}
        <div style={{ background: '#02402e', padding: '24px 28px 22px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: '#d97f11', color: '#02402e', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>S</span>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: 0.2 }}>SpacesMate</span>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 3, gap: 3 }}>
            {(['login', 'signup'] as const).map(t => (
              <button key={t} onClick={() => switchTab(t)} style={{
                flex: 1, padding: '9px', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600,
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? '#02402e' : 'rgba(255,255,255,0.7)',
                transition: 'all .18s',
              }}>
                {t === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
              </button>
            ))}
          </div>
          <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 20, background: 'rgba(255,255,255,0.12)', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', width: 32, height: 32, borderRadius: 8, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px 28px' }}>
          {confirmedEmail ? (
            <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
              <div style={{ width: 68, height: 68, borderRadius: 20, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <span className="msym" style={{ fontSize: 38, color: '#048c73', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>mark_email_unread</span>
              </div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 8px' }}>ตรวจสอบอีเมลของคุณ</p>
              <p style={{ fontSize: 13.5, color: '#475569', margin: '0 0 4px', lineHeight: 1.7 }}>เราส่งลิงก์ยืนยันไปที่</p>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: '#02402e', margin: '0 0 14px' }}>{confirmedEmail}</p>
              <p style={{ fontSize: 13, color: '#475569', margin: '0 0 20px', lineHeight: 1.8 }}>
                กดลิงก์ในอีเมลเพื่อยืนยันตัวตน<br />และระบบจะพาคุณเข้า Owner Dashboard ทันที
              </p>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, color: '#92400e', marginBottom: 20, textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span className="msym" style={{ fontSize: 15, color: '#d97f11', fontVariationSettings: "'wght' 400, 'FILL' 1", flexShrink: 0, marginTop: 1 }}>tips_and_updates</span>
                <span>ไม่ได้รับอีเมล? กรุณาตรวจสอบโฟลเดอร์ <strong>Spam</strong> หรือ <strong>Junk</strong></span>
              </div>
              <button onClick={onClose} style={{ width: '100%', padding: '12px', borderRadius: 14, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                ปิด
              </button>
            </div>
          ) : success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ margin: '0 0 10px' }}><span className="msym" style={{ fontSize: 36, color: '#048c73', fontVariationSettings: "'wght' 400, 'FILL' 1" }}>check_circle</span></p>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#02402e', margin: '0 0 6px' }}>สำเร็จ!</p>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{success}</p>
            </div>
          ) : forgotPwd ? (
            <form onSubmit={handleForgotPassword}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <span className="msym" style={{ fontSize: 36, color: '#048c73', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>lock_reset</span>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#02402e', margin: '8px 0 4px' }}>รีเซ็ตรหัสผ่าน</p>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>กรอกอีเมลที่ลงทะเบียนไว้ — เราจะส่งลิงก์ให้คุณ</p>
              </div>
              <div style={FG}>
                <label style={LBL}>อีเมล</label>
                <input style={INP} type="email" value={forgotEmail} onChange={e => { setForgotEmail(e.target.value); setError('') }} placeholder="email@example.com" autoFocus autoComplete="email" onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
              </div>
              {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 12px', color: '#b91c1c', fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}><span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1", flexShrink: 0 }}>warning</span>{error}</div>}
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: 14, border: 'none', background: loading ? '#94a3b8' : '#02402e', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: 4 }}>
                {loading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
              </button>
              <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', margin: '14px 0 0' }}>
                <button type="button" onClick={() => { setForgotPwd(false); setError('') }} style={{ color: '#048c73', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
                  กลับไปเข้าสู่ระบบ
                </button>
              </p>
            </form>
          ) : tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div style={FG}>
                <label style={LBL}>อีเมล</label>
                <input style={INP} type="email" value={loginEmail} onChange={e => { setLoginEmail(e.target.value); setError('') }} placeholder="email@example.com" autoFocus autoComplete="email" onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
              </div>
              <div style={{ ...FG, marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <label style={{ ...LBL, marginBottom: 0 }}>รหัสผ่าน</label>
                  <button type="button" onClick={() => { setForgotPwd(true); setError(''); setForgotEmail(loginEmail) }} style={{ fontSize: 12, color: '#048c73', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>ลืมรหัสผ่าน?</button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...INP, paddingRight: 44 }} type={showPwd ? 'text' : 'password'} value={loginPwd} onChange={e => { setLoginPwd(e.target.value); setError('') }} placeholder="••••••••" autoComplete="current-password" onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18 }}>
                    <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{showPwd ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 12px', color: '#b91c1c', fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}><span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1", flexShrink: 0 }}>warning</span>{error}</div>}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px', borderRadius: 14, border: 'none',
                background: loading ? '#94a3b8' : '#02402e', color: '#fff',
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', marginTop: 8, letterSpacing: 0.2,
              }}>
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', margin: '16px 0 0' }}>
                ยังไม่มีบัญชี?{' '}
                <button type="button" onClick={() => switchTab('signup')} style={{ color: '#048c73', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
                  สมัครสมาชิกฟรี
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              {/* ── Honeypot: hidden from humans, but bots fill it ── */}
              <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
                <label htmlFor="sm_website">Website</label>
                <input
                  id="sm_website"
                  name="website"
                  type="text"
                  value={honeypot}
                  onChange={e => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div style={FG}>
                <label style={LBL}>ชื่อ-นามสกุล</label>
                <input style={INP} type="text" value={signName} onChange={e => { setSignName(e.target.value); setError('') }} placeholder="สมชาย ใจดี" autoFocus autoComplete="name" onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
              </div>
              <div style={FG}>
                <label style={LBL}>อีเมล <span style={{ color: '#e53e3e' }}>*</span></label>
                <input style={INP} type="email" value={signEmail} onChange={e => { setSignEmail(e.target.value); setError('') }} placeholder="email@example.com" autoComplete="email" onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
              </div>
              <div style={FG}>
                <label style={LBL}>เบอร์โทรศัพท์ <span style={{ color: '#e53e3e' }}>*</span></label>
                <input style={INP} type="tel" value={signPhone} onChange={e => { setSignPhone(e.target.value); setError('') }} placeholder="08X-XXX-XXXX" autoComplete="tel" onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
              </div>
              <div style={FG}>
                <label style={LBL}>รหัสผ่าน</label>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...INP, paddingRight: 44 }} type={showPwd ? 'text' : 'password'} value={signPwd} onChange={e => { setSignPwd(e.target.value); setError('') }} placeholder="อย่างน้อย 8 ตัวอักษร ผสมตัวเลข" autoComplete="new-password" onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18 }}>
                    <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{showPwd ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {/* Strength meter */}
                {signPwd && (() => {
                  const s = pwdStrength(signPwd)
                  return (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ display: 'flex', gap: 3, marginBottom: 3 }}>
                        {[1,2,3].map(i => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 4, background: i <= s.level ? s.color : '#e2e8f0', transition: 'background .2s' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.label}</span>
                    </div>
                  )
                })()}
              </div>
              <div style={{ ...FG, marginBottom: 6 }}>
                <label style={LBL}>ยืนยันรหัสผ่าน</label>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...INP, paddingRight: 44 }} type={showPwd2 ? 'text' : 'password'} value={signPwd2} onChange={e => { setSignPwd2(e.target.value); setError('') }} placeholder="••••••••" autoComplete="new-password" onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
                  <button type="button" onClick={() => setShowPwd2(!showPwd2)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18 }}>
                    <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{showPwd2 ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* ── Cloudflare Turnstile (shows only when site key configured) ── */}
              {turnstileEnabled && (
                <TurnstileWidget onToken={setTurnstileToken} />
              )}

              {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 12px', color: '#b91c1c', fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}><span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1", flexShrink: 0 }}>warning</span>{error}</div>}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px', borderRadius: 14, border: 'none',
                background: loading ? '#94a3b8' : '#048c73', color: '#fff',
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', marginTop: 8, letterSpacing: 0.2,
              }}>
                {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิกฟรี'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', margin: '14px 0 0', lineHeight: 1.6 }}>
                การสมัครสมาชิกถือว่าคุณยอมรับ{' '}
                <a href="/terms" style={{ color: '#048c73' }}>เงื่อนไขการใช้งาน</a>{' '}
                และ{' '}
                <a href="/privacy" style={{ color: '#048c73' }}>นโยบายความเป็นส่วนตัว</a>
              </p>
              <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', margin: '10px 0 0' }}>
                มีบัญชีแล้ว?{' '}
                <button type="button" onClick={() => switchTab('login')} style={{ color: '#048c73', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
                  เข้าสู่ระบบ
                </button>
              </p>
            </form>
          )}
        </div>
      </div>

      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  )
}
