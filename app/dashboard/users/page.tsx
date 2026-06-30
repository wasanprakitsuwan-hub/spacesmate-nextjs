'use client'

import { useEffect, useState } from 'react'

interface UserListings {
  total: number; active: number; pending: number; expired: number
}

interface UserRow {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
  updated_at: string | null
  listings: UserListings
}

const ROLE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  admin:    { bg: '#fdf3e3', color: '#d97f11', label: 'Admin' },
  landlord: { bg: '#eaf6f1', color: '#048c73', label: 'เจ้าของ' },
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
  const months = Math.floor(days / 30)
  return `${months} เดือนที่แล้ว`
}

export default function UsersPage() {
  const [users,         setUsers]         = useState<UserRow[]>([])
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [roleFilter,    setRoleFilter]    = useState<'all' | 'admin' | 'landlord'>('all')
  const [totalListings, setTotalListings] = useState(0)
  const [changingRole,  setChangingRole]  = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const r = await fetch('/api/dashboard/users')
      const d = await r.json()
      setUsers(d.users ?? [])
      setTotalListings(d.totalListings ?? 0)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleRole(user: UserRow) {
    const newRole = user.role === 'admin' ? 'landlord' : 'admin'
    if (!confirm(`เปลี่ยน ${user.email} เป็น ${newRole === 'admin' ? 'Admin' : 'เจ้าของ'}?`)) return
    setChangingRole(user.id)
    try {
      await fetch('/api/dashboard/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, role: newRole }),
      })
      await load()
    } catch {}
    setChangingRole(null)
  }

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return u.email.toLowerCase().includes(q) || (u.full_name || '').toLowerCase().includes(q)
  })

  const adminCount    = users.filter(u => u.role === 'admin').length
  const landlordCount = users.filter(u => u.role === 'landlord').length
  const avgListings   = landlordCount > 0 ? (totalListings / landlordCount).toFixed(1) : '0'

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 3px', color: '#02402e' }}>ผู้ใช้งาน</h1>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>ผู้ลงประกาศในระบบทั้งหมด</p>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'ผู้ใช้ทั้งหมด',    value: users.length,   icon: '👥', bg: '#e8f5f0', color: '#048c73' },
          { label: 'เจ้าของทรัพย์',    value: landlordCount,  icon: '🏠', bg: '#e0f2f9', color: '#0284c7' },
          { label: 'ผู้ดูแลระบบ',      value: adminCount,     icon: '🔑', bg: '#fdf3e3', color: '#d97f11' },
          { label: 'เฉลี่ยประกาศ/คน',  value: avgListings,    icon: '📊', bg: '#f1f5f9', color: '#64748b' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 12px -6px rgba(2,64,46,0.07)' }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{k.icon}</span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#02402e', lineHeight: 1, letterSpacing: '-0.5px' }}>{k.value}</div>
              <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 3 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  ค้นหาชื่อหรืออีเมล"
          style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 12, border: '1px solid #eef0ef', fontSize: 13.5, outline: 'none', background: '#fff', fontFamily: 'inherit' }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'landlord', 'admin'] as const).map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} style={{
              padding: '9px 16px', borderRadius: 10, border: '1.5px solid',
              borderColor: roleFilter === r ? '#02402e' : '#e2e8f0',
              background: roleFilter === r ? '#02402e' : '#fff',
              color: roleFilter === r ? '#fff' : '#64748b',
              fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {r === 'all' ? 'ทั้งหมด' : r === 'landlord' ? '🏠 เจ้าของ' : '🔑 Admin'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 20px -12px rgba(2,64,46,0.08)' }}>
        {loading ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: 28, height: 28, border: '3px solid #eef0ef', borderTopColor: '#048c73', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 12px' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
              {loading && <span style={{ fontSize: 12, color: '#94a3b8' }}>⟳ กำลังอัปเดต...</span>}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: '#f8faf9', borderBottom: '1px solid #eef0ef' }}>
                    {['ผู้ใช้', 'บทบาท', 'ประกาศทั้งหมด', 'เผยแพร่', 'รออนุมัติ', 'สมัครเมื่อ', ''].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 11.5, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => {
                    const rs = ROLE_STYLE[u.role] ?? ROLE_STYLE.landlord
                    const initial = (u.full_name || u.email || '?').charAt(0).toUpperCase()
                    return (
                      <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f4' : 'none', background: i % 2 === 0 ? '#fff' : '#fafffe' }}>
                        {/* User cell */}
                        <td style={{ padding: '13px 16px', minWidth: 220 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 36, height: 36, borderRadius: '50%', background: u.role === 'admin' ? '#fdf3e3' : '#e8f5f0', color: u.role === 'admin' ? '#d97f11' : '#048c73', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{initial}</span>
                            <div>
                              <div style={{ fontWeight: 600, color: '#02402e', fontSize: 13 }}>{u.full_name || '—'}</div>
                              <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 1 }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        {/* Role */}
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 10, background: rs.bg, color: rs.color, fontWeight: 600 }}>{rs.label}</span>
                        </td>
                        {/* Listing counts */}
                        <td style={{ padding: '13px 16px', fontWeight: 700, color: '#02402e', fontSize: 15 }}>{u.listings.total}</td>
                        <td style={{ padding: '13px 16px' }}>
                          {u.listings.active > 0
                            ? <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 10, background: '#dcfce7', color: '#15803d' }}>{u.listings.active}</span>
                            : <span style={{ color: '#cbd5e1', fontSize: 13 }}>—</span>}
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          {u.listings.pending > 0
                            ? <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 10, background: '#fef9c3', color: '#a16207' }}>{u.listings.pending}</span>
                            : <span style={{ color: '#cbd5e1', fontSize: 13 }}>—</span>}
                        </td>
                        {/* Date */}
                        <td style={{ padding: '13px 16px', color: '#94a3b8', fontSize: 12 }}>
                          <div>{fmtDate(u.created_at)}</div>
                          <div style={{ fontSize: 11, marginTop: 1 }}>{timeAgo(u.created_at)}</div>
                        </td>
                        {/* Actions */}
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {/* View listings */}
                            <a href={`/dashboard/listings?landlord=${u.id}`} style={{ padding: '5px 9px', borderRadius: 7, background: '#eaf6f1', color: '#048c73', fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                              🏠 ดูประกาศ
                            </a>
                            {/* Toggle role */}
                            <button
                              onClick={() => toggleRole(u)}
                              disabled={changingRole === u.id}
                              title={`เปลี่ยนเป็น ${u.role === 'admin' ? 'เจ้าของ' : 'Admin'}`}
                              style={{ padding: '5px 9px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: changingRole === u.id ? 0.5 : 1 }}
                            >
                              {changingRole === u.id ? '...' : u.role === 'admin' ? '→ เจ้าของ' : '→ Admin'}
                            </button>
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
    </div>
  )
}
