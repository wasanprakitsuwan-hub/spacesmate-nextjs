'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'

interface UserListings {
  total: number; active: number; pending: number; expired: number
}

interface UserRow {
  id:                  string
  email:               string
  first_name:          string | null
  last_name:           string | null
  full_name:           string | null
  phone:               string | null
  role:                string
  status:              string
  package:             string | null
  package_type:        string | null
  package_expires_at:  string | null
  created_at:          string
  updated_at:          string | null
  listings:            UserListings
}

interface DetailListing {
  id:               string
  title_th:         string | null
  title_en:         string | null
  slug:             string | null
  property_type:    string | null
  listing_status:   string | null
  package_type:     string | null
  created_at:       string
  expires_at:       string | null
  address_district: string | null
}

interface UserDetail {
  profile: UserRow & { display_name: string; active_package: string | null; package_expires_at: string | null }
  listings: DetailListing[]
}

type CallerRole = 'admin' | 'super_admin'

const ROLE_STYLE: Record<string, { bg: string; color: string; label: string; icon: string }> = {
  super_admin: { bg: '#fdf3e3', color: '#d97f11', label: 'Super Admin', icon: 'grade' },
  admin:       { bg: '#fff1e6', color: '#c2560c', label: 'Admin',       icon: 'key' },
  landlord:    { bg: '#eaf6f1', color: '#048c73', label: 'เจ้าของ',     icon: 'home' },
}

const PACKAGE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  free:     { bg: '#f1f5f9', color: '#64748b', label: 'Free' },
  basic:    { bg: '#e0f2fe', color: '#0284c7', label: 'Basic' },
  pro:      { bg: '#ede9fe', color: '#7c3aed', label: 'Pro' },
  premium:  { bg: '#fdf3e3', color: '#d97f11', label: 'Premium' },
}

const LISTING_STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  active:   { bg: '#dcfce7', color: '#15803d', label: 'เผยแพร่' },
  pending:  { bg: '#fef9c3', color: '#a16207', label: 'รออนุมัติ' },
  expired:  { bg: '#fee2e2', color: '#dc2626', label: 'หมดอายุ' },
  inactive: { bg: '#f1f5f9', color: '#64748b', label: 'ปิดใช้งาน' },
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'วันนี้'
  if (days === 1) return 'เมื่อวาน'
  if (days < 30) return `${days} วันที่แล้ว`
  return `${Math.floor(days / 30)} เดือนที่แล้ว`
}

async function getToken() {
  const { data: { session } } = await createBrowserClient().auth.getSession()
  return session?.access_token ?? ''
}

// ── Suspend Confirm Modal ─────────────────────────────────────────────────────
function SuspendModal({ user, onClose, onDone }: { user: UserRow; onClose: () => void; onDone: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const isSuspending = user.status !== 'suspended'
  const displayName  = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.full_name || user.email

  async function confirm() {
    setLoading(true); setError('')
    try {
      const token = await getToken()
      const r = await fetch('/api/dashboard/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: user.id, status: isSuspending ? 'suspended' : 'active' }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error ?? 'Failed')
      onDone(); onClose()
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(2,64,46,0.3)', zIndex: 200, backdropFilter: 'blur(3px)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 400, background: '#fff', borderRadius: 20, zIndex: 201,
        boxShadow: '0 24px 60px rgba(0,0,0,0.18)', fontFamily: "'Prompt', -apple-system, sans-serif", overflow: 'hidden',
      }}>
        <div style={{
          background: isSuspending ? '#fff7ed' : '#f0fdf4',
          borderBottom: `1px solid ${isSuspending ? '#fed7aa' : '#bbf7d0'}`,
          padding: '20px 24px', display: 'flex', gap: 14, alignItems: 'flex-start',
        }}>
          <span className="msym" style={{ fontSize: 28, color: isSuspending ? '#c2560c' : '#15803d', flexShrink: 0, fontVariationSettings: "'wght' 400, 'FILL' 1", marginTop: 2 }}>
            {isSuspending ? 'block' : 'check_circle'}
          </span>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: isSuspending ? '#92400e' : '#14532d' }}>
              {isSuspending ? 'ระงับบัญชีผู้ใช้' : 'เปิดใช้งานบัญชี'}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: isSuspending ? '#b45309' : '#166534' }}>
              {isSuspending ? 'ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้' : 'ผู้ใช้จะสามารถเข้าสู่ระบบได้ตามปกติ'}
            </p>
          </div>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#f8faf9', borderRadius: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: ROLE_STYLE[user.role]?.bg ?? '#eaf6f1', color: ROLE_STYLE[user.role]?.color ?? '#048c73', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
              {(user.first_name || user.email || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#02402e' }}>{displayName}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{user.email}</div>
            </div>
          </div>
          {error && <div style={{ padding: '10px 13px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>{error}</div>}
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f4', display: 'flex', gap: 10 }}>
          <button onClick={onClose} disabled={loading} style={{ flex: 1, padding: '11px', borderRadius: 11, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>ยกเลิก</button>
          <button onClick={confirm} disabled={loading} style={{
            flex: 2, padding: '11px', borderRadius: 11, border: 'none',
            background: loading ? '#94a3b8' : isSuspending ? '#c2560c' : '#15803d', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            {loading ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} />กำลังดำเนินการ...</>
              : <><span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>{isSuspending ? 'block' : 'check_circle'}</span>{isSuspending ? 'ระงับบัญชี' : 'เปิดใช้งาน'}</>}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteConfirmModal({ user, onClose, onDeleted }: { user: UserRow; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false)
  const [error,    setError]    = useState('')
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.full_name || user.email

  async function confirm() {
    setDeleting(true); setError('')
    try {
      const token = await getToken()
      const r = await fetch(`/api/dashboard/users?id=${user.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error ?? 'Delete failed')
      onDeleted(); onClose()
    } catch (e: any) { setError(e.message); setDeleting(false) }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(2,64,46,0.3)', zIndex: 200, backdropFilter: 'blur(3px)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 420, background: '#fff', borderRadius: 20, zIndex: 201,
        boxShadow: '0 24px 60px rgba(0,0,0,0.18)', fontFamily: "'Prompt', -apple-system, sans-serif", overflow: 'hidden',
      }}>
        <div style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca', padding: '20px 24px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <span className="msym" style={{ fontSize: 28, color: '#dc2626', flexShrink: 0, fontVariationSettings: "'wght' 400, 'FILL' 1", marginTop: 2 }}>delete_forever</span>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#991b1b' }}>ลบผู้ใช้งาน</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#b91c1c' }}>การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
          </div>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#f8faf9', borderRadius: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: ROLE_STYLE[user.role]?.bg ?? '#eaf6f1', color: ROLE_STYLE[user.role]?.color ?? '#048c73', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
              {(user.first_name || user.email || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#02402e' }}>{displayName}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{user.email}</div>
            </div>
          </div>
          <div style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.7 }}>
            <p style={{ margin: '0 0 8px' }}>การลบจะดำเนินการดังนี้:</p>
            <ul style={{ margin: 0, paddingLeft: '1.4em' }}>
              <li>ลบบัญชีออกจากระบบทั้งหมด (ถาวร)</li>
              <li>ประกาศทั้งหมด <strong style={{ color: '#c2410c' }}>{user.listings.total} รายการ</strong> จะถูกซ่อนโดยอัตโนมัติ</li>
              <li>ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้อีก</li>
            </ul>
          </div>
          {error && <div style={{ marginTop: 14, padding: '10px 13px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>{error}</div>}
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f4', display: 'flex', gap: 10 }}>
          <button onClick={onClose} disabled={deleting} style={{ flex: 1, padding: '11px', borderRadius: 11, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>ยกเลิก</button>
          <button onClick={confirm} disabled={deleting} style={{
            flex: 2, padding: '11px', borderRadius: 11, border: 'none',
            background: deleting ? '#94a3b8' : '#dc2626', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            {deleting ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} />กำลังลบ...</>
              : <><span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>delete_forever</span>ยืนยันการลบ</>}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Edit Drawer ───────────────────────────────────────────────────────────────
function EditDrawer({ user, callerRole, onClose, onSaved }: { user: UserRow; callerRole: CallerRole; onClose: () => void; onSaved: () => void }) {
  const [firstName,         setFirstName]         = useState(user.first_name ?? '')
  const [lastName,          setLastName]           = useState(user.last_name  ?? '')
  const [phone,             setPhone]              = useState(user.phone       ?? '')
  const [role,              setRole]               = useState(user.role)
  const [packageType,       setPackageType]        = useState(user.package_type ?? '')
  const [packageExpiresAt,  setPackageExpiresAt]   = useState(
    user.package_expires_at ? user.package_expires_at.slice(0, 10) : ''
  )
  const [saving,            setSaving]             = useState(false)
  const [error,             setError]              = useState('')

  async function save() {
    setSaving(true); setError('')
    try {
      const body: Record<string, string> = { id: user.id, first_name: firstName.trim(), last_name: lastName.trim(), phone: phone.trim() }
      if (callerRole === 'super_admin') {
        body.role = role
        if (packageType) body.package_type = packageType
        if (packageExpiresAt) body.package_expires_at = new Date(packageExpiresAt).toISOString()
      }
      const token = await getToken()
      const r = await fetch('/api/dashboard/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error ?? 'Save failed')
      onSaved(); onClose()
    } catch (e: any) { setError(e.message) }
    setSaving(false)
  }

  const canChangeRole    = callerRole === 'super_admin'
  const canChangePackage = callerRole === 'super_admin'
  const availableRoles   = callerRole === 'super_admin' ? ['landlord', 'admin', 'super_admin'] : ['landlord']
  const inp = { width: '100%', padding: '13px 16px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 16, boxSizing: 'border-box' as const, outline: 'none', fontFamily: 'inherit' }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(2,64,46,0.25)', zIndex: 100, backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 680, background: '#fff', zIndex: 101, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 40px rgba(2,64,46,0.15)', fontFamily: "'Prompt', -apple-system, sans-serif" }}>
        <div style={{ padding: '22px 28px', borderBottom: '1px solid #eef0ef', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#02402e' }}>แก้ไขข้อมูลผู้ใช้</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>{user.email}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94a3b8', padding: 4 }}>×</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: ROLE_STYLE[user.role]?.bg ?? '#eaf6f1', color: ROLE_STYLE[user.role]?.color ?? '#048c73', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, flexShrink: 0 }}>
            {(user.first_name || user.email || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: '#02402e' }}>{[user.first_name, user.last_name].filter(Boolean).join(' ') || user.full_name || '—'}</div>
            <div style={{ marginTop: 4, display: 'flex', gap: 6 }}>
              {(() => { const rs = ROLE_STYLE[user.role] ?? ROLE_STYLE.landlord; return <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 8, background: rs.bg, color: rs.color, fontWeight: 700 }}><span className="msym" style={{ fontSize: 12, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 3 }}>{rs.icon}</span>{rs.label}</span> })()}
              {user.status === 'suspended' && <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 8, background: '#fee2e2', color: '#dc2626', fontWeight: 700 }}><span className="msym" style={{ fontSize: 12, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 3 }}>block</span>ถูกระงับ</span>}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div><label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>อีเมล</label><input value={user.email} readOnly style={{ ...inp, background: '#f8faf9', color: '#94a3b8' }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>ชื่อ</label><input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="ชื่อจริง" style={inp} onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} /></div>
            <div><label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>นามสกุล</label><input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="นามสกุล" style={inp} onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} /></div>
          </div>
          <div><label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>เบอร์โทรศัพท์</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0xx-xxx-xxxx" style={inp} onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} /></div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>บทบาท {!canChangeRole && <span style={{ color: '#cbd5e1', fontWeight: 400 }}>(เฉพาะ Super Admin)</span>}</label>
            <select value={role} onChange={e => setRole(e.target.value)} disabled={!canChangeRole} style={{ ...inp, cursor: canChangeRole ? 'pointer' : 'not-allowed', background: canChangeRole ? '#fff' : '#f8faf9', color: canChangeRole ? '#02402e' : '#94a3b8' }}>
              {availableRoles.map(r => <option key={r} value={r}>{r === 'super_admin' ? 'Super Admin' : r === 'admin' ? 'Admin' : 'เจ้าของ (Landlord)'}</option>)}
            </select>
          </div>

          {/* Package fields — super_admin only */}
          <div style={{ background: '#f0f7f4', borderRadius: 14, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span className="msym" style={{ fontSize: 18, color: '#02402e', fontVariationSettings: "'wght' 400, 'FILL' 1" }}>workspace_premium</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#02402e' }}>จัดการแพ็กเกจ</span>
              {!canChangePackage && <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>(เฉพาะ Super Admin)</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>แพ็กเกจ</label>
                <select
                  value={packageType}
                  onChange={e => setPackageType(e.target.value)}
                  disabled={!canChangePackage}
                  style={{ ...inp, fontSize: 14, cursor: canChangePackage ? 'pointer' : 'not-allowed', background: canChangePackage ? '#fff' : '#f8faf9', color: canChangePackage ? '#02402e' : '#94a3b8' }}
                >
                  <option value="">ไม่มีแพ็กเกจ</option>
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>วันหมดอายุ</label>
                <input
                  type="date"
                  value={packageExpiresAt}
                  onChange={e => setPackageExpiresAt(e.target.value)}
                  disabled={!canChangePackage}
                  style={{ ...inp, fontSize: 14, cursor: canChangePackage ? 'text' : 'not-allowed', background: canChangePackage ? '#fff' : '#f8faf9', color: canChangePackage ? '#02402e' : '#94a3b8' }}
                />
              </div>
            </div>
          </div>

          <div style={{ background: '#f8faf9', borderRadius: 12, padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[{ label: 'ประกาศทั้งหมด', value: user.listings.total, color: '#02402e' }, { label: 'เผยแพร่แล้ว', value: user.listings.active, color: '#15803d' }, { label: 'รออนุมัติ', value: user.listings.pending, color: '#a16207' }, { label: 'หมดอายุ', value: user.listings.expired, color: '#dc2626' }].map(s => (
              <div key={s.label}><div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div><div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{s.label}</div></div>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: '#94a3b8' }}>สมัครเมื่อ: {fmtDate(user.created_at)} · แก้ไขล่าสุด: {fmtDate(user.updated_at)}</div>
          {error && <div style={{ padding: '10px 13px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>{error}</div>}
        </div>

        <div style={{ padding: '18px 28px', borderTop: '1px solid #eef0ef', display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: 11, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>ยกเลิก</button>
          <button onClick={save} disabled={saving} style={{ flex: 2, padding: '14px', borderRadius: 11, border: 'none', background: saving ? '#94a3b8' : '#02402e', color: '#fff', fontSize: 15, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {saving ? 'กำลังบันทึก...' : <><span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 6 }}>save</span>บันทึกข้อมูล</>}
          </button>
        </div>
      </div>
    </>
  )
}

// ── User Detail Drawer (#204) ─────────────────────────────────────────────────
function DetailDrawer({ userId, onClose, onEdit, callerRole }: { userId: string; onClose: () => void; onEdit?: () => void; callerRole?: CallerRole }) {
  const router = useRouter()
  const [detail,  setDetail]  = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true); setError('')
      try {
        const token = await getToken()
        const r = await fetch(`/api/dashboard/users/detail?id=${userId}`, { headers: { Authorization: `Bearer ${token}` } })
        const d = await r.json()
        if (!r.ok) throw new Error(d.error ?? 'Load failed')
        setDetail(d)
      } catch (e: any) { setError(e.message) }
      setLoading(false)
    }
    load()
  }, [userId])

  const p = detail?.profile

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(2,64,46,0.25)', zIndex: 100, backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 680, background: '#fff', zIndex: 101, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 40px rgba(2,64,46,0.15)', fontFamily: "'Prompt', -apple-system, sans-serif" }}>
        <div style={{ padding: '22px 28px', borderBottom: '1px solid #eef0ef', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#02402e' }}>รายละเอียดผู้ใช้</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>คลิกแถวเพื่อดูข้อมูลและประกาศทั้งหมด</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94a3b8', padding: 4 }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ width: 28, height: 28, border: '3px solid #eef0ef', borderTopColor: '#048c73', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>กำลังโหลด...</p>
            </div>
          ) : error ? (
            <div style={{ padding: '20px', background: '#fef2f2', borderRadius: 12, color: '#dc2626', fontSize: 13 }}>{error}</div>
          ) : p ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Profile card */}
              <div style={{ background: '#f8faf9', borderRadius: 16, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', flexShrink: 0, background: ROLE_STYLE[p.role]?.bg ?? '#eaf6f1', color: ROLE_STYLE[p.role]?.color ?? '#048c73', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22 }}>
                    {(p.first_name || p.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#02402e' }}>{p.display_name}</div>
                    <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>{p.email}</div>
                    <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(() => { const rs = ROLE_STYLE[p.role] ?? ROLE_STYLE.landlord; return <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 8, background: rs.bg, color: rs.color, fontWeight: 700 }}><span className="msym" style={{ fontSize: 12, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 3 }}>{rs.icon}</span>{rs.label}</span> })()}
                      {p.status === 'suspended' && <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 8, background: '#fee2e2', color: '#dc2626', fontWeight: 700 }}><span className="msym" style={{ fontSize: 12, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 3 }}>block</span>ถูกระงับ</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'เบอร์โทร', value: p.phone || '—' },
                    { label: 'สมัครเมื่อ', value: fmtDate(p.created_at) },
                    { label: 'แก้ไขล่าสุด', value: fmtDate(p.updated_at) },
                    { label: 'แพ็กเกจ', value: p.active_package ? (PACKAGE_STYLE[p.active_package]?.label ?? p.active_package) : '—' },
                    { label: 'หมดอายุ', value: p.package_expires_at ? fmtDate(p.package_expires_at) : '—' },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>{item.label}</div>
                      <div style={{ fontSize: 13.5, color: '#02402e', fontWeight: 500, marginTop: 2 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {p.package_expires_at && new Date(p.package_expires_at) < new Date(Date.now() + 7 * 86400000) && (
                <div style={{ padding: '12px 14px', borderRadius: 12, background: '#fef9c3', border: '1px solid #fde047', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="msym" style={{ fontSize: 18, color: '#a16207', fontVariationSettings: "'wght' 400, 'FILL' 1" }}>warning</span>
                  <span style={{ fontSize: 13, color: '#a16207' }}>แพ็กเกจใกล้หมดอายุ: {fmtDate(p.package_expires_at)}</span>
                </div>
              )}

              {/* Listings */}
              <div>
                <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#02402e', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>apartment</span>
                  ประกาศทั้งหมด ({detail?.listings.length ?? 0})
                </h3>
                {(detail?.listings.length ?? 0) === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', background: '#f8faf9', borderRadius: 12 }}>
                    <span className="msym" style={{ fontSize: 32, color: '#c7d2d0', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>apartment</span>
                    <p style={{ color: '#94a3b8', fontSize: 13, margin: '8px 0 0' }}>ยังไม่มีประกาศ</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {detail!.listings.map(l => {
                      const title = l.title_th || l.title_en || 'ไม่มีชื่อ'
                      const ls = LISTING_STATUS_STYLE[l.listing_status ?? 'inactive'] ?? LISTING_STATUS_STYLE.inactive
                      const ps = l.package_type ? (PACKAGE_STYLE[l.package_type] ?? PACKAGE_STYLE.free) : null
                      const expiringSoon = l.expires_at && new Date(l.expires_at) < new Date(Date.now() + 7 * 86400000) && l.listing_status === 'active'
                      return (
                        <div key={l.id} style={{ padding: '13px 14px', borderRadius: 12, border: '1px solid #eef0ef', background: '#fff', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <span className="msym" style={{ fontSize: 22, color: '#048c73', fontVariationSettings: "'wght' 300, 'FILL' 0", flexShrink: 0, marginTop: 1 }}>apartment</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13.5, color: '#02402e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
                            <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{l.address_district || l.property_type || '—'}</div>
                            <div style={{ marginTop: 6, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 7, background: ls.bg, color: ls.color, fontWeight: 600 }}>{ls.label}</span>
                              {ps && <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 7, background: ps.bg, color: ps.color, fontWeight: 600 }}>{ps.label}</span>}
                              {expiringSoon && <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 7, background: '#fef9c3', color: '#a16207', fontWeight: 600 }}>ใกล้หมดอายุ</span>}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{fmtDate(l.created_at)}</div>
                            {l.expires_at && <div style={{ fontSize: 10.5, color: '#94a3b8' }}>หมด {fmtDate(l.expires_at)}</div>}
                            <button
                              onClick={() => { onClose(); router.push(`/dashboard/listings?editId=${l.id}`) }}
                              title="แก้ไขประกาศนี้"
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 7, border: '1px solid #c7d2d0', background: '#fff', color: '#334155', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                              <span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>edit</span>แก้ไข
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #eef0ef', display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 11, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>ปิด</button>
          {onEdit && (
            <button onClick={onEdit} style={{ flex: 2, padding: '11px', borderRadius: 11, border: 'none', background: '#02402e', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <span className="msym" style={{ fontSize: 17, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>edit</span>แก้ไขข้อมูล
            </button>
          )}
        </div>
      </div>
    </>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [users,        setUsers]        = useState<UserRow[]>([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [roleFilter,   setRoleFilter]   = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [callerRole,   setCallerRole]   = useState<CallerRole>('admin')
  const [totalListings,setTotalListings]= useState(0)
  const [editingUser,  setEditingUser]  = useState<UserRow | null>(null)
  const [deletingUser, setDeletingUser] = useState<UserRow | null>(null)
  const [suspendUser,  setSuspendUser]  = useState<UserRow | null>(null)
  const [detailUserId, setDetailUserId] = useState<string | null>(null)
  const [myId,         setMyId]         = useState<string>('')

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      setMyId(session.user.id)
      try {
        const r = await fetch('/api/auth/role', { headers: { Authorization: `Bearer ${session.access_token}` } })
        const { role } = await r.json()
        setCallerRole(role === 'super_admin' ? 'super_admin' : 'admin')
      } catch { setCallerRole('admin') }
    })
  }, [])

  async function load() {
    setLoading(true)
    try {
      const token = await getToken()
      const r = await fetch('/api/dashboard/users', { headers: { Authorization: `Bearer ${token}` } })
      const d = await r.json()
      setUsers(d.users ?? [])
      setTotalListings(d.totalListings ?? 0)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [callerRole])

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (statusFilter === 'suspended' && u.status !== 'suspended') return false
    if (statusFilter === 'active' && u.status === 'suspended') return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.email.toLowerCase().includes(q) ||
      (u.full_name  || '').toLowerCase().includes(q) ||
      (u.first_name || '').toLowerCase().includes(q) ||
      (u.last_name  || '').toLowerCase().includes(q) ||
      (u.phone      || '').includes(q)
    )
  })

  const landlordCount   = users.filter(u => u.role === 'landlord').length
  const adminCount      = users.filter(u => u.role === 'admin').length
  const suspendedCount  = users.filter(u => u.status === 'suspended').length
  const avgListings     = landlordCount > 0 ? (totalListings / landlordCount).toFixed(1) : '0'

  const roleTabs = callerRole === 'super_admin'
    ? [{ key: 'all', label: 'ทั้งหมด', icon: '' }, { key: 'landlord', label: 'เจ้าของ', icon: 'home' }, { key: 'admin', label: 'Admin', icon: 'key' }, { key: 'super_admin', label: 'Super Admin', icon: 'grade' }]
    : [{ key: 'all', label: 'ทั้งหมด', icon: '' }, { key: 'landlord', label: 'เจ้าของ', icon: 'home' }]

  const kpiCards = callerRole === 'super_admin'
    ? [
        { label: 'ผู้ใช้ทั้งหมด',  value: users.length,   icon: 'group',     bg: '#e8f5f0', color: '#048c73' },
        { label: 'เจ้าของทรัพย์',  value: landlordCount,  icon: 'home',      bg: '#e0f2f9', color: '#0284c7' },
        { label: 'ผู้ดูแลระบบ',    value: adminCount,     icon: 'key',       bg: '#fff1e6', color: '#c2560c' },
        { label: 'บัญชีถูกระงับ',  value: suspendedCount, icon: 'block',     bg: '#fee2e2', color: '#dc2626' },
      ]
    : [
        { label: 'เจ้าของทรัพย์',   value: landlordCount,  icon: 'home',      bg: '#e8f5f0', color: '#048c73' },
        { label: 'ประกาศทั้งหมด',   value: totalListings,  icon: 'list_alt',  bg: '#e0f2f9', color: '#0284c7' },
        { label: 'เฉลี่ยประกาศ/คน', value: avgListings,    icon: 'bar_chart', bg: '#f1f5f9', color: '#64748b' },
        { label: 'แพ็กเกจ Active',  value: users.filter(u => u.package && u.package !== 'free').length, icon: 'credit_card', bg: '#fdf3e3', color: '#d97f11' },
      ]

  return (
    <div style={{ fontFamily: "'Prompt', -apple-system, sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {editingUser && <EditDrawer user={editingUser} callerRole={callerRole} onClose={() => setEditingUser(null)} onSaved={load} />}
      {deletingUser && <DeleteConfirmModal user={deletingUser} onClose={() => setDeletingUser(null)} onDeleted={() => { setDeletingUser(null); load() }} />}
      {suspendUser && <SuspendModal user={suspendUser} onClose={() => setSuspendUser(null)} onDone={load} />}
      {detailUserId && <DetailDrawer
        userId={detailUserId}
        callerRole={callerRole}
        onClose={() => setDetailUserId(null)}
        onEdit={() => {
          const u = users.find(x => x.id === detailUserId)
          if (u) { setDetailUserId(null); setEditingUser(u) }
        }}
      />}

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 3px', color: '#02402e' }}>ผู้ใช้งาน</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>คลิกที่แถวเพื่อดูรายละเอียด · {callerRole === 'super_admin' ? 'ผู้ใช้ทั้งหมดในระบบ' : 'เจ้าของทรัพย์ในระบบ'}</p>
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 700, padding: '6px 14px', borderRadius: 10, background: callerRole === 'super_admin' ? '#fdf3e3' : '#fff1e6', color: callerRole === 'super_admin' ? '#d97f11' : '#c2560c', letterSpacing: 0.5 }}>
          <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 5 }}>{callerRole === 'super_admin' ? 'grade' : 'key'}</span>
          {callerRole === 'super_admin' ? 'Super Admin' : 'Admin'}
        </span>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {kpiCards.map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 12px -6px rgba(2,64,46,0.07)' }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="msym" style={{ fontSize: 20, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{k.icon}</span>
            </span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#02402e', lineHeight: 1, letterSpacing: '-0.5px' }}>{k.value}</div>
              <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 3 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาชื่อ, อีเมล, เบอร์โทร"
          style={{ flex: 1, minWidth: 220, padding: '10px 14px', borderRadius: 12, border: '1px solid #eef0ef', fontSize: 13.5, outline: 'none', background: '#fff', fontFamily: 'inherit' }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {roleTabs.map(t => (
            <button key={t.key} onClick={() => setRoleFilter(t.key)} style={{
              padding: '9px 14px', borderRadius: 10, border: '1.5px solid',
              borderColor: roleFilter === t.key ? '#02402e' : '#e2e8f0',
              background: roleFilter === t.key ? '#02402e' : '#fff',
              color: roleFilter === t.key ? '#fff' : '#64748b',
              fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {t.icon && <span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 4 }}>{t.icon}</span>}
              {t.label}
            </button>
          ))}
          {callerRole === 'super_admin' && (
            <button onClick={() => setStatusFilter(statusFilter === 'suspended' ? 'all' : 'suspended')} style={{
              padding: '9px 14px', borderRadius: 10, border: '1.5px solid',
              borderColor: statusFilter === 'suspended' ? '#dc2626' : '#e2e8f0',
              background: statusFilter === 'suspended' ? '#fef2f2' : '#fff',
              color: statusFilter === 'suspended' ? '#dc2626' : '#64748b',
              fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 4 }}>block</span>
              ถูกระงับ {suspendedCount > 0 && `(${suspendedCount})`}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 20px -12px rgba(2,64,46,0.08)' }}>
        {loading ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: 28, height: 28, border: '3px solid #eef0ef', borderTopColor: '#048c73', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>กำลังโหลด...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 10px' }}><span className="msym" style={{ fontSize: 36, color: '#c7d2d0', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>group</span></p>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
              {search || roleFilter !== 'all' || statusFilter !== 'all' ? 'ไม่พบผู้ใช้ที่ตรงกับเงื่อนไข' : 'ยังไม่มีผู้ใช้ในระบบ'}
            </p>
          </div>
        ) : (
          <>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #eef0ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>แสดง {filtered.length} จาก {users.length} ผู้ใช้</span>
              <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="msym" style={{ fontSize: 14 }}>touch_app</span>คลิกแถวเพื่อดูรายละเอียด
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: '#f8faf9', borderBottom: '1px solid #eef0ef' }}>
                    {['ผู้ใช้', 'อีเมล', 'เบอร์โทร', 'บทบาท', 'แพ็กเกจ', 'ประกาศ', 'สถานะ', 'สมัครเมื่อ', ''].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 11.5, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => {
                    const rs = ROLE_STYLE[u.role] ?? ROLE_STYLE.landlord
                    const ps = u.package ? (PACKAGE_STYLE[u.package] ?? PACKAGE_STYLE.free) : null
                    const initial = (u.first_name || u.email || '?').charAt(0).toUpperCase()
                    const displayName = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.full_name || '—'
                    const isSuspended = u.status === 'suspended'
                    return (
                      <tr key={u.id}
                        onClick={() => setDetailUserId(u.id)}
                        style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f4' : 'none', background: isSuspended ? '#fffbfb' : i % 2 === 0 ? '#fff' : '#fafffe', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f0faf6')}
                        onMouseLeave={e => (e.currentTarget.style.background = isSuspended ? '#fffbfb' : i % 2 === 0 ? '#fff' : '#fafffe')}
                      >
                        <td style={{ padding: '13px 16px', minWidth: 180 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 36, height: 36, borderRadius: '50%', background: rs.bg, color: rs.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0, opacity: isSuspended ? 0.5 : 1 }}>{initial}</span>
                            <div style={{ fontWeight: 600, color: isSuspended ? '#94a3b8' : '#02402e', fontSize: 13 }}>{displayName}</div>
                          </div>
                        </td>
                        <td style={{ padding: '13px 16px', color: '#64748b', fontSize: 12.5, maxWidth: 200 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                        </td>
                        <td style={{ padding: '13px 16px', color: '#64748b', fontSize: 13, whiteSpace: 'nowrap' }}>{u.phone || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 10, background: rs.bg, color: rs.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
                            <span className="msym" style={{ fontSize: 12, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 3 }}>{rs.icon}</span>{rs.label}
                          </span>
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          {ps ? <span style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 10, background: ps.bg, color: ps.color, fontWeight: 600 }}>{ps.label}</span> : <span style={{ color: '#cbd5e1', fontSize: 13 }}>—</span>}
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, color: '#02402e', fontSize: 15 }}>{u.listings.total}</span>
                            {u.listings.active > 0 && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 8, background: '#dcfce7', color: '#15803d', fontWeight: 600 }}>{u.listings.active} เผยแพร่</span>}
                            {u.listings.pending > 0 && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 8, background: '#fef9c3', color: '#a16207', fontWeight: 600 }}>{u.listings.pending} รอ</span>}
                          </div>
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          {isSuspended
                            ? <span style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 10, background: '#fee2e2', color: '#dc2626', fontWeight: 600, whiteSpace: 'nowrap' }}><span className="msym" style={{ fontSize: 12, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 3 }}>block</span>ถูกระงับ</span>
                            : <span style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 10, background: '#dcfce7', color: '#15803d', fontWeight: 600, whiteSpace: 'nowrap' }}><span className="msym" style={{ fontSize: 12, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 3 }}>check_circle</span>ปกติ</span>}
                        </td>
                        <td style={{ padding: '13px 16px', color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap' }}>
                          <div>{fmtDate(u.created_at)}</div>
                          <div style={{ fontSize: 11, marginTop: 1 }}>{timeAgo(u.created_at)}</div>
                        </td>
                        <td style={{ padding: '13px 16px' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => setEditingUser(u)} style={{ padding: '5px 11px', borderRadius: 7, border: '1px solid #048c73', background: '#eaf6f1', color: '#048c73', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                              <span className="msym" style={{ fontSize: 13, marginRight: 4 }}>edit</span>แก้ไข
                            </button>
                            {u.listings.total > 0 && (
                              <a href={`/dashboard/listings?landlord=${u.id}`} onClick={e => e.stopPropagation()} style={{ padding: '5px 9px', borderRadius: 7, background: '#f1f5f9', color: '#64748b', fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                                <span className="msym" style={{ fontSize: 13, marginRight: 4 }}>home</span>ประกาศ
                              </a>
                            )}
                            {callerRole === 'super_admin' && u.id !== myId && (
                              <>
                                <button onClick={() => setSuspendUser(u)} title={isSuspended ? 'เปิดใช้งาน' : 'ระงับบัญชี'}
                                  style={{ padding: '5px 9px', borderRadius: 7, border: `1px solid ${isSuspended ? '#bbf7d0' : '#fed7aa'}`, background: isSuspended ? '#f0fdf4' : '#fff7ed', color: isSuspended ? '#15803d' : '#c2560c', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                  <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>{isSuspended ? 'lock_open' : 'block'}</span>
                                </button>
                                <button onClick={() => setDeletingUser(u)} title="ลบผู้ใช้งาน"
                                  style={{ padding: '5px 9px', borderRadius: 7, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                  <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>delete</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {callerRole === 'admin' && (
        <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 12, background: '#f8faf9', border: '1px solid #eef0ef', fontSize: 12.5, color: '#94a3b8', display: 'flex', gap: 8 }}>
          <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1", flexShrink: 0 }}>info</span>
          <span>Admin สามารถดูและแก้ไขข้อมูลเจ้าของทรัพย์ได้เท่านั้น การเปลี่ยนบทบาทและระงับบัญชีต้องใช้สิทธิ์ Super Admin</span>
        </div>
      )}
    </div>
  )
}
