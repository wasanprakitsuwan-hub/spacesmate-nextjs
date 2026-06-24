'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createBrowserClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (authError) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-spacemate-bgLight flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-2xl font-bold text-spacemate-brandDark tracking-tight">Spaces<span className="text-spacemate-brandTeal">Mate</span></span>
          </Link>
          <p className="text-gray-400 text-sm mt-2">เข้าสู่ระบบเพื่อจัดการประกาศของคุณ</p>
        </div>

        <div className="bg-white rounded-2xl border border-spacemate-borderLight p-7 shadow-premium">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label block mb-1.5">อีเมล</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="email@example.com"
                className="input-field w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="label">รหัสผ่าน</label>
                <a href="#" className="text-xs text-spacemate-brandTeal hover:underline">ลืมรหัสผ่าน?</a>
              </div>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="input-field w-full"
              />
            </div>

            {error && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-amber-700 text-xs leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-spacemate-borderLight text-center">
            <p className="text-sm text-gray-400">
              ยังไม่มีบัญชี?{' '}
              <Link href="/submit" className="text-spacemate-brandTeal font-medium hover:underline">
                ลงประกาศฟรี 30 วัน
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          © 2026 Space Works Co., Ltd. · <Link href="/privacy" className="hover:underline">นโยบายความเป็นส่วนตัว</Link>
        </p>
      </div>
    </div>
  )
}
