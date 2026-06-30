'use client'

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

  // Signup form
  const [signName,   setSignName]   = useState('')
  const [signEmail,  setSignEmail]  = useState('')
  const [signPwd,    setSignPwd]    = useState('')
  const [signPwd2,   setSignPwd2]   = useState('')

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
    setTab(t); setError(''); setSuccess('')
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
    if (!signName || !signEmail || !signPwd) { setError('กรุณากรอกข้อมูลให้ครบ'); return }
    if (signPwd !== signPwd2) { setError('รหัสผ่านไม่ตรงกัน'); return }
    if (signPwd.length < 6)  { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return }
    setLoading(true); setError('')
    try {
      const supabase = createBrowserClient()
      const { data, error: authErr } = await supabase.auth.signUp({
        email:    signEmail,
        password: signPwd,
        options:  { data: { full_name: signName } },
      })
      if (authErr) {
        setError(authErr.message || 'สมัครสมาชิกไม่สำเร็จ')
      } else if (data.user) {
        // Upsert profile as landlord
        await supabase.from('user_profiles').upsert(
          { id: data.user.id, email: signEmail, full_name: signName, role: 'landlord' },
          { onConflict: 'id', ignoreDuplicates: true }
        )
        onClose()
        router.push('/owner-dashboard')
        router.refresh()
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
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ fontSize: 36, margin: '0 0 10px' }}>✅</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#02402e', margin: '0 0 6px' }}>สำเร็จ!</p>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{success}</p>
            </div>
          ) : tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div style={FG}>
                <label style={LBL}>อีเมล</label>
                <input style={INP} type="email" value={loginEmail} onChange={e => { setLoginEmail(e.target.value); setError('') }} placeholder="email@example.com" autoFocus autoComplete="email" onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
              </div>
              <div style={{ ...FG, marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <label style={{ ...LBL, marginBottom: 0 }}>รหัสผ่าน</label>
                  <button type="button" style={{ fontSize: 12, color: '#048c73', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>ลืมรหัสผ่าน?</button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...INP, paddingRight: 44 }} type={showPwd ? 'text' : 'password'} value={loginPwd} onChange={e => { setLoginPwd(e.target.value); setError('') }} placeholder="••••••••" autoComplete="current-password" onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18 }}>
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 12px', color: '#b91c1c', fontSize: 13, marginBottom: 14 }}>⚠️ {error}</div>}

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
              <div style={FG}>
                <label style={LBL}>ชื่อ-นามสกุล</label>
                <input style={INP} type="text" value={signName} onChange={e => { setSignName(e.target.value); setError('') }} placeholder="สมชาย ใจดี" autoFocus autoComplete="name" onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
              </div>
              <div style={FG}>
                <label style={LBL}>อีเมล</label>
                <input style={INP} type="email" value={signEmail} onChange={e => { setSignEmail(e.target.value); setError('') }} placeholder="email@example.com" autoComplete="email" onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
              </div>
              <div style={FG}>
                <label style={LBL}>รหัสผ่าน</label>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...INP, paddingRight: 44 }} type={showPwd ? 'text' : 'password'} value={signPwd} onChange={e => { setSignPwd(e.target.value); setError('') }} placeholder="อย่างน้อย 6 ตัวอักษร" autoComplete="new-password" onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18 }}>
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div style={{ ...FG, marginBottom: 6 }}>
                <label style={LBL}>ยืนยันรหัสผ่าน</label>
                <input style={INP} type="password" value={signPwd2} onChange={e => { setSignPwd2(e.target.value); setError('') }} placeholder="••••••••" autoComplete="new-password" onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
              </div>

              {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 12px', color: '#b91c1c', fontSize: 13, marginBottom: 14 }}>⚠️ {error}</div>}

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
