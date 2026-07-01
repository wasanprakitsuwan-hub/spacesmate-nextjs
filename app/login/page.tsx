'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'

export default function LoginPage() {
  const [tab,      setTab]      = useState<'login' | 'signup'>('login')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const router = useRouter()

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPwd,   setLoginPwd]   = useState('')

  // Signup fields
  const [signName,  setSignName]  = useState('')
  const [signEmail, setSignEmail] = useState('')
  const [signPwd,   setSignPwd]   = useState('')
  const [signPwd2,  setSignPwd2]  = useState('')

  function switchTab(t: 'login' | 'signup') {
    setTab(t); setError(''); setSuccess('')
  }

  // ── Login ────────────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const supabase = createBrowserClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail, password: loginPwd,
      })
      if (authError) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง')
      } else if (data.user) {
        // Use service-role API to bypass RLS
        const r = await fetch('/api/auth/role', {
          headers: { Authorization: `Bearer ${data.session?.access_token}` },
        })
        const { role } = await r.json()
        router.push(role === 'admin' || role === 'super_admin' ? '/dashboard' : '/owner-dashboard')
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    }
    setLoading(false)
  }

  // ── Sign Up ───────────────────────────────────────────────────────────────
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (signPwd !== signPwd2) { setError('รหัสผ่านไม่ตรงกัน'); return }
    if (signPwd.length < 6)  { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return }
    setLoading(true); setError('')
    try {
      const supabase = createBrowserClient()
      const { data, error: authErr } = await supabase.auth.signUp({
        email: signEmail, password: signPwd,
        options: { data: { full_name: signName } },
      })
      if (authErr) {
        setError(authErr.message || 'สมัครสมาชิกไม่สำเร็จ')
      } else if (data.user) {
        // Profile is created automatically via DB trigger on auth.users insert.
        // Show the email confirmation screen immediately.
        setSuccess(signEmail)
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-spacemate-bgLight flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-2xl font-bold text-spacemate-brandDark tracking-tight">
              Spaces<span className="text-spacemate-brandTeal">Mate</span>
            </span>
          </Link>
          <p className="text-gray-400 text-sm mt-2">
            {tab === 'login' ? 'เข้าสู่ระบบเพื่อจัดการประกาศของคุณ' : 'สมัครสมาชิกเพื่อลงประกาศฟรี'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-spacemate-borderLight shadow-premium overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-spacemate-borderLight">
            {(['login', 'signup'] as const).map(t => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                  tab === t
                    ? 'text-spacemate-brandDark border-b-2 border-spacemate-brandDark bg-white'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
              </button>
            ))}
          </div>

          <div className="p-7">
            {/* ── LOGIN FORM ── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="label block mb-1.5">อีเมล</label>
                  <input
                    type="email" value={loginEmail}
                    onChange={e => { setLoginEmail(e.target.value); setError('') }}
                    required placeholder="email@example.com"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="label">รหัสผ่าน</label>
                    <a href="#" className="text-xs text-spacemate-brandTeal hover:underline">ลืมรหัสผ่าน?</a>
                  </div>
                  <input
                    type="password" value={loginPwd}
                    onChange={e => { setLoginPwd(e.target.value); setError('') }}
                    required placeholder="••••••••"
                    className="input-field w-full"
                  />
                </div>
                {error && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-amber-700 text-xs">{error}</p>
                  </div>
                )}
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </button>
                <p className="text-center text-sm text-gray-400 pt-1">
                  ยังไม่มีบัญชี?{' '}
                  <button type="button" onClick={() => switchTab('signup')} className="text-spacemate-brandTeal font-medium hover:underline">
                    สมัครสมาชิกฟรี
                  </button>
                </p>
              </form>
            )}

            {/* ── SIGNUP SUCCESS ── */}
            {tab === 'signup' && success && (
              <div className="text-center py-4 space-y-4">
                <div><span className="msym" style={{ fontSize: 44, color: '#02402e', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>mail</span></div>
                <h3 className="text-lg font-bold text-spacemate-brandDark">ตรวจสอบอีเมลของคุณ</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  เราได้ส่งลิงก์ยืนยันบัญชีไปที่<br/>
                  <span className="font-semibold text-spacemate-brandDark">{success}</span>
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  กรุณาคลิกลิงก์ในอีเมลเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ<br/>
                  หากไม่พบอีเมล ให้ตรวจสอบในโฟลเดอร์ Spam
                </p>
                <button
                  type="button"
                  onClick={() => { setSuccess(''); switchTab('login') }}
                  className="btn-primary w-full"
                >
                  กลับไปเข้าสู่ระบบ
                </button>
              </div>
            )}

            {/* ── SIGNUP FORM ── */}
            {tab === 'signup' && !success && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="label block mb-1.5">ชื่อ-นามสกุล</label>
                  <input
                    type="text" value={signName}
                    onChange={e => { setSignName(e.target.value); setError('') }}
                    required placeholder="ชื่อจริง นามสกุล"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="label block mb-1.5">อีเมล</label>
                  <input
                    type="email" value={signEmail}
                    onChange={e => { setSignEmail(e.target.value); setError('') }}
                    required placeholder="email@example.com"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="label block mb-1.5">รหัสผ่าน</label>
                  <input
                    type="password" value={signPwd}
                    onChange={e => { setSignPwd(e.target.value); setError('') }}
                    required placeholder="อย่างน้อย 6 ตัวอักษร"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="label block mb-1.5">ยืนยันรหัสผ่าน</label>
                  <input
                    type="password" value={signPwd2}
                    onChange={e => { setSignPwd2(e.target.value); setError('') }}
                    required placeholder="••••••••"
                    className="input-field w-full"
                  />
                </div>
                {error && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-amber-700 text-xs">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-green-700 text-xs">{success}</p>
                  </div>
                )}
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิกฟรี'}
                </button>
                <p className="text-center text-sm text-gray-400 pt-1">
                  มีบัญชีแล้ว?{' '}
                  <button type="button" onClick={() => switchTab('login')} className="text-spacemate-brandTeal font-medium hover:underline">
                    เข้าสู่ระบบ
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          © 2026 Space Works Co., Ltd. ·{' '}
          <Link href="/privacy" className="hover:underline">นโยบายความเป็นส่วนตัว</Link>
        </p>
      </div>
    </div>
  )
}
