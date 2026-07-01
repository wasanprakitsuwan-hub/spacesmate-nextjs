'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'

interface ProfileData {
  full_name:      string
  phone:          string
  email:          string
  active_package: string | null
  package_expires_at: string | null
}

const PKG_LABEL: Record<string, string> = {
  basic:    'Basic (30 วัน)',
  standard: 'Standard (90 วัน)',
  premium:  'Premium (365 วัน)',
  admin:    'Admin (ไม่หมดอายุ)',
}

const INP: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 12,
  border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none',
  boxSizing: 'border-box', background: '#fff', color: '#334155', fontFamily: 'inherit',
  transition: 'border-color .15s',
}
const LBL: React.CSSProperties = {
  display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 6,
}

export default function ProfilePage() {
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
      const supabase = createBrowserClient()
      const { error: upErr } = await supabase
        .from('user_profiles')
        .update({ full_name: profile.full_name.trim(), phone: profile.phone.trim() })
        .eq('id', userId)
      if (upErr) throw new Error(upErr.message)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message || 'บันทึกไม่สำเร็จ')
    }
    setSaving(false)
  }

  async function handlePwdChange(e: React.FormEvent) {
    e.preventDefault()
    setPwdErr(''); setPwdMsg('')
    if (newPwd.length < 6) { setPwdErr('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return }
    if (newPwd !== newPwd2) { setPwdErr('รหัสผ่านไม่ตรงกัน'); return }
    setPwdSaving(true)
    try {
      const supabase = createBrowserClient()
      const { error: pwErr } = await supabase.auth.updateUser({ password: newPwd })
      if (pwErr) throw new Error(pwErr.message)
      setPwdMsg('เปลี่ยนรหัสผ่านสำเร็จแล้ว')
      setNewPwd(''); setNewPwd2('')
      setTimeout(() => { setPwdMsg(''); setPwdSection(false) }, 3000)
    } catch (err: any) {
      setPwdErr(err.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
    }
    setPwdSaving(false)
  }

  const hasActivePackage = profile.active_package !== null &&
    (profile.package_expires_at === null || new Date(profile.package_expires_at) > new Date())

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #048c73', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#94a3b8', fontSize: 14 }}>กำลังโหลดข้อมูล...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#02402e', margin: '0 0 4px', letterSpacing: '-0.3px' }}>ข้อมูลส่วนตัว</h1>
        <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>จัดการข้อมูลโปรไฟล์และการตั้งค่าบัญชี</p>
      </div>

      {/* ── Profile card ── */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 20, boxShadow: '0 4px 20px -10px rgba(2,64,46,0.08)', overflow: 'hidden', marginBottom: 20 }}>

        {/* Avatar / header */}
        <div style={{ background: 'linear-gradient(135deg, #02402e 0%, #048c73 100%)', padding: '28px 28px 22px', display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid rgba(255,255,255,0.35)' }}>
            <span className="msym" style={{ fontSize: 28, color: '#fff', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>person</span>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' }}>
              {profile.full_name || profile.email.split('@')[0]}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>{profile.email}</div>
            {hasActivePackage && (
              <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(217,127,17,0.25)', border: '1px solid rgba(217,127,17,0.5)', borderRadius: 20, padding: '3px 10px' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', letterSpacing: 0.5 }}>
                  {PKG_LABEL[profile.active_package!] ?? profile.active_package}
                </span>
              </div>
            )}
            {!hasActivePackage && (
              <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 20, padding: '3px 10px' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>ยังไม่มีแพ็กเกจ</span>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} style={{ padding: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={LBL}>ชื่อ-นามสกุล</label>
              <input
                type="text" value={profile.full_name}
                onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                placeholder="ชื่อจริง นามสกุล"
                style={INP}
                onFocus={e => (e.currentTarget.style.borderColor = '#048c73')}
                onBlur={e  => (e.currentTarget.style.borderColor = '#e2e8f0')}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={LBL}>เบอร์โทรศัพท์</label>
              <input
                type="tel" value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                placeholder="08x-xxx-xxxx"
                style={INP}
                onFocus={e => (e.currentTarget.style.borderColor = '#048c73')}
                onBlur={e  => (e.currentTarget.style.borderColor = '#e2e8f0')}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={LBL}>อีเมล</label>
              <input
                type="email" value={profile.email} readOnly
                style={{ ...INP, background: '#f8fafc', color: '#94a3b8', cursor: 'default' }}
              />
              <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '5px 0 0' }}>ไม่สามารถเปลี่ยนอีเมลได้ในขณะนี้</p>
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '11px 14px', color: '#b91c1c', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>warning</span>{error}
            </div>
          )}
          {saved && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '11px 14px', color: '#15803d', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>check_circle</span>บันทึกข้อมูลสำเร็จแล้ว
            </div>
          )}

          <button type="submit" disabled={saving}
            style={{ background: saving ? '#94a3b8' : '#02402e', color: '#fff', border: 'none', borderRadius: 14, padding: '13px 24px', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all .18s' }}>
            {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </form>
      </div>

      {/* ── Package info ── */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 20, boxShadow: '0 4px 20px -10px rgba(2,64,46,0.08)', padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#02402e', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>แพ็กเกจของฉัน</div>
        {hasActivePackage ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#d97f11,#fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="msym" style={{ fontSize: 18, color: '#fff', fontVariationSettings: "'wght' 400, 'FILL' 1" }}>grade</span>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#334155' }}>{PKG_LABEL[profile.active_package!] ?? profile.active_package}</div>
                {profile.package_expires_at && (
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>
                    หมดอายุ: {new Date(profile.package_expires_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}
                {!profile.package_expires_at && (
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>ไม่หมดอายุ</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 14px' }}>คุณยังไม่มีแพ็กเกจที่ใช้งานอยู่</p>
            <a href="/pricing"
              style={{ background: '#d97f11', color: '#fff', borderRadius: 22, padding: '11px 24px', fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, boxShadow: '0 4px 12px -4px rgba(217,127,17,0.45)' }}>
              <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>shopping_cart</span>ดูแพ็กเกจทั้งหมด
            </a>
          </div>
        )}
      </div>

      {/* ── Password change ── */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 20, boxShadow: '0 4px 20px -10px rgba(2,64,46,0.08)', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#02402e', letterSpacing: 1, textTransform: 'uppercase' }}>เปลี่ยนรหัสผ่าน</div>
          <button type="button" onClick={() => { setPwdSection(v => !v); setPwdErr(''); setPwdMsg('') }}
            style={{ fontSize: 13, fontWeight: 600, color: '#048c73', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            {pwdSection ? 'ยกเลิก' : 'เปลี่ยนรหัสผ่าน'}
          </button>
        </div>

        {pwdSection && (
          <form onSubmit={handlePwdChange} style={{ marginTop: 18 }}>
            <div style={{ marginBottom: 14 }}>
              <label style={LBL}>รหัสผ่านใหม่</label>
              <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required minLength={6}
                placeholder="อย่างน้อย 6 ตัวอักษร" style={INP}
                onFocus={e => (e.currentTarget.style.borderColor = '#048c73')}
                onBlur={e  => (e.currentTarget.style.borderColor = '#e2e8f0')} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={LBL}>ยืนยันรหัสผ่านใหม่</label>
              <input type="password" value={newPwd2} onChange={e => setNewPwd2(e.target.value)} required
                placeholder="••••••••" style={INP}
                onFocus={e => (e.currentTarget.style.borderColor = '#048c73')}
                onBlur={e  => (e.currentTarget.style.borderColor = '#e2e8f0')} />
            </div>

            {pwdErr && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', color: '#b91c1c', fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>warning</span>{pwdErr}
              </div>
            )}
            {pwdMsg && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', color: '#15803d', fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>check_circle</span>{pwdMsg}
              </div>
            )}

            <button type="submit" disabled={pwdSaving}
              style={{ background: pwdSaving ? '#94a3b8' : '#02402e', color: '#fff', border: 'none', borderRadius: 14, padding: '12px 22px', fontSize: 14, fontWeight: 700, cursor: pwdSaving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {pwdSaving ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
            </button>
          </form>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
