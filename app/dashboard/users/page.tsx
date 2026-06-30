'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'

interface UserListings {
  total: number; active: number; pending: number; expired: number
}

interface UserRow {
  id:          string
  email:       string
  first_name:  string | null
  last_name:   string | null
  full_name:   string | null
  phone:       string | null
  role:        string
  package:     string | null
  created_at:  string
  updated_at:  string | null
  listings:    UserListings
}

type CallerRole = 'admin' | 'super_admin'

const ROLE_STYLE: Record<string, { bg: string; color: string; label: string; icon: string }> = {
  super_admin: { bg: '#fdf3e3', color: '#d97f11', label: 'Super Admin', icon: '⭐' },
  admin:       { bg: '#fff1e6', color: '#c2560c', label: 'Admin',       icon: '🔑' },
  landlord:    { bg: '#eaf6f1', color: '#048c73', label: 'เจ้าของ',     icon: '🏠' },
}

const PACKAGE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  free:     { bg: '#f1f5f9', color: '#64748b', label: 'Free' },
  basic:    { bg: '#e0f2fe', color: '#0284c7', label: 'Basic' },
  pro:      { bg: '#ede9fe', color: '#7c3aed', label: 'Pro' },
  premium:  { bg: '#fdf3e3', color: '#d97f11', label: 'Premium' },
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

// ── Edit Drawer ───────────────────────────────────────────────────────────────
function EditDrawer({
  user,
  callerRole,
  onClose,
  onSaved,
}: {
  user: UserRow
  callerRole: CallerRole
  onClose: () => void
  onSaved: () => void
}) {
  const [firstName, setFirstName] = useState(user.first_name ?? '')
  const [lastName,  setLastName]  = useState(user.last_name  ?? '')
  const [phone,     setPhone]     = useState(user.phone       ?? '')
  const [role,      setRole]      = useState(user.role)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  async function save() {
    setSaving(true)
    setError('')
    try {
      const body: Record<string, string> = {
        id:         user.id,
        callerRole,
        first_name: firstName.trim(),
        last_name:  lastName.trim(),
        phone:      phone.trim(),
      }
      if (callerRole === 'super_admin') body.role = role

      const r = await fetch('/api/dashboard/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error ?? 'Save failed')
      onSaved()
      onClose()
    } catch (e: any) {
      setError(e.message)
    }
    setSaving(false)
  }

  const canChangeRole = callerRole === 'super_admin'
  const availableRoles = callerRole === 'super_admin'
    ? ['landlord', 'admin', 'super_admin']
    : ['landlord']

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(2,64,46,0.25)',
        zIndex: 100, backdropFilter: 'blur(2px)',
      }} />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
        background: '#fff', zIndex: 101, display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(2,64,46,0.15)',
        fontFamily: "'Prompt', -apple-system, sans-serif",
      }}>
        {/* Header */}
        <div style={{ padding: '22px 24px', borderBottom: '1px solid #eef0ef', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#02402e' }}>แก้ไขข้อมูลผู้ใช้</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>{user.email}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94a3b8', lineHeight: 1, padding: 4 }}>×</button>
        </div>

        {/* Avatar + badge */}
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid #f1f5f9' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: ROLE_STYLE[user.role]?.bg ?? '#eaf6f1',
            color: ROLE_STYLE[user.role]?.color ?? '#048c73',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 22, flexShrink: 0,
          }}>
            {(user.first_name || user.email || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: '#02402e' }}>
              {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.full_name || '—'}
            </div>
            <div style={{ marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(() => {
                const rs = ROLE_STYLE[user.role] ?? ROLE_STYLE.landlord
                return (
                  <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 8, background: rs.bg, color: rs.color, fontWeight: 700 }}>
                    {rs.icon} {rs.label}
                  </span>
                )
              })()}
              {user.package && (() => {
                const ps = PACKAGE_STYLE[user.package!] ?? PACKAGE_STYLE.free
                return (
                  <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 8, background: ps.bg, color: ps.color, fontWeight: 700 }}>
                    📦 {ps.label}
                  </span>
                )
              })()}
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Email — read-only */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>อีเมล</label>
            <input value={user.email} readOnly style={{
              width: '100%', padding: '10px 13px', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: 13.5, boxSizing: 'border-box',
              background: '#f8faf9', color: '#94a3b8', fontFamily: 'inherit',
            }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* First name */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>ชื่อ</label>
              <input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="ชื่อจริง"
                style={{
                  width: '100%', padding: '10px 13px', borderRadius: 10,
                  border: '1.5px solid #e2e8f0', fontSize: 13.5, boxSizing: 'border-box',
                  outline: 'none', fontFamily: 'inherit',
                }}
                onFocus={e => (e.target.style.borderColor = '#048c73')}
                onBlur={e  => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>
            {/* Last name */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>นามสกุล</label>
              <input
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="นามสกุล"
                style={{
                  width: '100%', padding: '10px 13px', borderRadius: 10,
                  border: '1.5px solid #e2e8f0', fontSize: 13.5, boxSizing: 'border-box',
                  outline: 'none', fontFamily: 'inherit',
                }}
                onFocus={e => (e.target.style.borderColor = '#048c73')}
                onBlur={e  => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>เบอร์โทรศัพท์</label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="0xx-xxx-xxxx"
              style={{
                width: '100%', padding: '10px 13px', borderRadius: 10,
                border: '1.5px solid #e2e8f0', fontSize: 13.5, boxSizing: 'border-box',
                outline: 'none', fontFamily: 'inherit',
              }}
              onFocus={e => (e.target.style.borderColor = '#048c73')}
              onBlur={e  => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          {/* Role — super_admin only */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
              บทบาท {!canChangeRole && <span style={{ color: '#cbd5e1', fontWeight: 400 }}>(เฉพาะ Super Admin)</span>}
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              disabled={!canChangeRole}
              style={{
                width: '100%', padding: '10px 13px', borderRadius: 10,
                border: '1.5px solid #e2e8f0', fontSize: 13.5, boxSizing: 'border-box',
                outline: 'none', fontFamily: 'inherit', cursor: canChangeRole ? 'pointer' : 'not-allowed',
                background: canChangeRole ? '#fff' : '#f8faf9',
                color: canChangeRole ? '#02402e' : '#94a3b8',
              }}
            >
              {availableRoles.map(r => (
                <option key={r} value={r}>
                  {r === 'super_admin' ? '⭐ Super Admin' : r === 'admin' ? '🔑 Admin' : '🏠 เจ้าของ (Landlord)'}
                </option>
              ))}
            </select>
            {callerRole === 'super_admin' && (
              <p style={{ margin: '6px 0 0', fontSize: 11, color: '#94a3b8' }}>
                ⚠️ การเปลี่ยนบทบาทมีผลทันที
              </p>
            )}
          </div>

          {/* Package — read-only */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>แพ็กเกจปัจจุบัน</label>
            <div style={{ padding: '10px 13px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8faf9', fontSize: 13.5, color: '#94a3b8' }}>
              {user.package
                ? (() => { const ps = PACKAGE_STYLE[user.package!] ?? PACKAGE_STYLE.free; return <span style={{ color: ps.color, fontWeight: 600 }}>📦 {ps.label}</span> })()
                : '— ไม่มีแพ็กเกจ'}
            </div>
          </div>

          {/* Stats */}
          <div style={{ background: '#f8faf9', borderRadius: 12, padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'ประกาศทั้งหมด', value: user.listings.total,   color: '#02402e' },
              { label: 'เผยแพร่แล้ว',   value: user.listings.active,  color: '#15803d' },
              { label: 'รออนุมัติ',      value: user.listings.pending, color: '#a16207' },
              { label: 'หมดอายุ',        value: user.listings.expired, color: '#dc2626' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
            สมัครเมื่อ: {fmtDate(user.created_at)} · แก้ไขล่าสุด: {fmtDate(user.updated_at)}
          </div>

          {error && (
            <div style={{ padding: '10px 13px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #eef0ef', display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '11px', borderRadius: 11, border: '1.5px solid #e2e8f0',
            background: '#fff', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>ยกเลิก</button>
          <button onClick={save} disabled={saving} style={{
            flex: 2, padding: '11px', borderRadius: 11, border: 'none',
            background: saving ? '#94a3b8' : '#02402e', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          }}>
            {saving ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูล'}
          </button>
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
  const [callerRole,   setCallerRole]   = useState<CallerRole>('admin')
  const [totalListings,setTotalListings]= useState(0)
  const [editingUser,  setEditingUser]  = useState<UserRow | null>(null)

  // Determine own role first
  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      if (profile?.role === 'super_admin') setCallerRole('super_admin')
      else setCallerRole('admin')
    })
  }, [])

  async function load() {
    setLoading(true)
    try {
      const r = await fetch(`/api/dashboard/users?callerRole=${callerRole}`)
      const d = await r.json()
      setUsers(d.users ?? [])
      setTotalListings(d.totalListings ?? 0)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [callerRole])

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
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

  const superAdminCount = users.filter(u => u.role === 'super_admin').length
  const adminCount      = users.filter(u => u.role === 'admin').length
  const landlordCount   = users.filter(u => u.role === 'landlord').length
  const avgListings     = landlordCount > 0 ? (totalListings / landlordCount).toFixed(1) : '0'

  // Role filter tabs — super_admin sees all; admin sees only landlords
  const roleTabs = callerRole === 'super_admin'
    ? [
        { key: 'all',         label: 'ทั้งหมด' },
        { key: 'landlord',    label: '🏠 เจ้าของ' },
        { key: 'admin',       label: '🔑 Admin' },
        { key: 'super_admin', label: '⭐ Super Admin' },
      ]
    : [{ key: 'all', label: 'ทั้งหมด' }, { key: 'landlord', label: '🏠 เจ้าของ' }]

  // KPI cards — differ by role
  const kpiCards = callerRole === 'super_admin'
    ? [
        { label: 'ผู้ใช้ทั้งหมด',    value: users.length,    icon: '👥', bg: '#e8f5f0', color: '#048c73' },
        { label: 'เจ้าของทรัพย์',    value: landlordCount,   icon: '🏠', bg: '#e0f2f9', color: '#0284c7' },
        { label: 'ผู้ดูแลระบบ',      value: adminCount,      icon: '🔑', bg: '#fff1e6', color: '#c2560c' },
        { label: 'Super Admin',       value: superAdminCount, icon: '⭐', bg: '#fdf3e3', color: '#d97f11' },
      ]
    : [
        { label: 'เจ้าของทรัพย์',    value: landlordCount,   icon: '🏠', bg: '#e8f5f0', color: '#048c73' },
        { label: 'ประกาศทั้งหมด',    value: totalListings,   icon: '📋', bg: '#e0f2f9', color: '#0284c7' },
        { label: 'เฉลี่ยประกาศ/คน',  value: avgListings,     icon: '📊', bg: '#f1f5f9', color: '#64748b' },
        { label: 'แพ็กเกจ Active',   value: users.filter(u => u.package && u.package !== 'free').length, icon: '💳', bg: '#fdf3e3', color: '#d97f11' },
      ]

  return (
    <div style={{ fontFamily: "'Prompt', -apple-system, sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {editingUser && (
        <EditDrawer
          user={editingUser}
          callerRole={callerRole}
          onClose={() => setEditingUser(null)}
          onSaved={load}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 3px', color: '#02402e' }}>ผู้ใช้งาน</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
            {callerRole === 'super_admin' ? 'ผู้ใช้ทั้งหมดในระบบ' : 'เจ้าของทรัพย์ในระบบ'}
          </p>
        </div>
        {/* Role badge */}
        <span style={{
          fontSize: 11.5, fontWeight: 700, padding: '6px 14px', borderRadius: 10,
          background: callerRole === 'super_admin' ? '#fdf3e3' : '#fff1e6',
          color: callerRole === 'super_admin' ? '#d97f11' : '#c2560c',
          letterSpacing: 0.5,
        }}>
          {callerRole === 'super_admin' ? '⭐ Super Admin' : '🔑 Admin'}
        </span>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {kpiCards.map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 12px -6px rgba(2,64,46,0.07)' }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{k.icon}</span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#02402e', lineHeight: 1, letterSpacing: '-0.5px' }}>{k.value}</div>
              <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 3 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  ค้นหาชื่อ, อีเมล, เบอร์โทร"
          style={{ flex: 1, minWidth: 220, padding: '10px 14px', borderRadius: 12, border: '1px solid #eef0ef', fontSize: 13.5, outline: 'none', background: '#fff', fontFamily: 'inherit' }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {roleTabs.map(t => (
            <button key={t.key} onClick={() => setRoleFilter(t.key)} style={{
              padding: '9px 14px', borderRadius: 10, border: '1.5px solid',
              borderColor: roleFilter === t.key ? '#02402e' : '#e2e8f0',
              background: roleFilter === t.key ? '#02402e' : '#fff',
              color: roleFilter === t.key ? '#fff' : '#64748b',
              fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>{t.label}</button>
          ))}
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
            <p style={{ fontSize: 36, margin: '0 0 10px' }}>👥</p>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
              {search || roleFilter !== 'all' ? 'ไม่พบผู้ใช้ที่ตรงกับเงื่อนไข' : 'ยังไม่มีผู้ใช้ในระบบ'}
            </p>
          </div>
        ) : (
          <>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #eef0ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>แสดง {filtered.length} จาก {users.length} ผู้ใช้</span>
              {callerRole === 'admin' && (
                <span style={{ fontSize: 12, color: '#94a3b8' }}>📋 แสดงเฉพาะเจ้าของทรัพย์</span>
              )}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: '#f8faf9', borderBottom: '1px solid #eef0ef' }}>
                    {['ผู้ใช้', 'อีเมล', 'เบอร์โทร', 'บทบาท', 'แพ็กเกจ', 'ประกาศ', 'สมัครเมื่อ', ''].map(h => (
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
                    return (
                      <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f4' : 'none', background: i % 2 === 0 ? '#fff' : '#fafffe' }}>

                        {/* Name */}
                        <td style={{ padding: '13px 16px', minWidth: 180 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 36, height: 36, borderRadius: '50%', background: rs.bg, color: rs.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{initial}</span>
                            <div style={{ fontWeight: 600, color: '#02402e', fontSize: 13 }}>{displayName}</div>
                          </div>
                        </td>

                        {/* Email */}
                        <td style={{ padding: '13px 16px', color: '#64748b', fontSize: 12.5, maxWidth: 200 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                        </td>

                        {/* Phone */}
                        <td style={{ padding: '13px 16px', color: '#64748b', fontSize: 13, whiteSpace: 'nowrap' }}>
                          {u.phone || <span style={{ color: '#cbd5e1' }}>—</span>}
                        </td>

                        {/* Role */}
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 10, background: rs.bg, color: rs.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {rs.icon} {rs.label}
                          </span>
                        </td>

                        {/* Package */}
                        <td style={{ padding: '13px 16px' }}>
                          {ps ? (
                            <span style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 10, background: ps.bg, color: ps.color, fontWeight: 600 }}>
                              {ps.label}
                            </span>
                          ) : <span style={{ color: '#cbd5e1', fontSize: 13 }}>—</span>}
                        </td>

                        {/* Listings */}
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, color: '#02402e', fontSize: 15 }}>{u.listings.total}</span>
                            {u.listings.active > 0 && (
                              <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 8, background: '#dcfce7', color: '#15803d', fontWeight: 600 }}>{u.listings.active} เผยแพร่</span>
                            )}
                            {u.listings.pending > 0 && (
                              <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 8, background: '#fef9c3', color: '#a16207', fontWeight: 600 }}>{u.listings.pending} รอ</span>
                            )}
                          </div>
                        </td>

                        {/* Date */}
                        <td style={{ padding: '13px 16px', color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap' }}>
                          <div>{fmtDate(u.created_at)}</div>
                          <div style={{ fontSize: 11, marginTop: 1 }}>{timeAgo(u.created_at)}</div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => setEditingUser(u)}
                              style={{ padding: '5px 11px', borderRadius: 7, border: '1px solid #048c73', background: '#eaf6f1', color: '#048c73', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                            >
                              ✏️ แก้ไข
                            </button>
                            {u.listings.total > 0 && (
                              <a href={`/dashboard/listings?landlord=${u.id}`} style={{ padding: '5px 9px', borderRadius: 7, background: '#f1f5f9', color: '#64748b', fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                                🏠 ประกาศ
                              </a>
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

      {/* Info note for admin */}
      {callerRole === 'admin' && (
        <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 12, background: '#f8faf9', border: '1px solid #eef0ef', fontSize: 12.5, color: '#94a3b8', display: 'flex', gap: 8 }}>
          <span>ℹ️</span>
          <span>Admin สามารถดูและแก้ไขข้อมูลเจ้าของทรัพย์ได้เท่านั้น การเปลี่ยนบทบาทและจัดการ Admin/Super Admin ต้องใช้สิทธิ์ Super Admin</span>
        </div>
      )}
    </div>
  )
}
