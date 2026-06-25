'use client'

import { useEffect, useState } from 'react'

interface UserRow {
  email: string
  name: string | null
  count: number
  approved: number
  pending: number
  lastSeen: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalListings, setTotalListings] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/dashboard/submissions')
        const d = await r.json()
        const subs = d.submissions ?? []

        // Aggregate by email
        const map: Record<string, UserRow> = {}
        for (const s of subs) {
          const email = s.contact_email || 'ไม่ระบุ'
          if (!map[email]) {
            map[email] = { email, name: s.contact_name, count: 0, approved: 0, pending: 0, lastSeen: s.created_at }
          }
          map[email].count++
          if (s.status === 'approved') map[email].approved++
          if (s.status === 'pending') map[email].pending++
          if (new Date(s.created_at) > new Date(map[email].lastSeen)) {
            map[email].lastSeen = s.created_at
          }
        }
        const rows = Object.values(map).sort((a, b) => b.count - a.count)
        setUsers(rows)
        setTotalUsers(rows.length)
        setTotalListings(subs.length)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const displayed = users.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return u.email.toLowerCase().includes(q) || (u.name || '').toLowerCase().includes(q)
  })

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'วันนี้'
    if (days === 1) return 'เมื่อวาน'
    if (days < 30) return `${days} วันที่แล้ว`
    const months = Math.floor(days / 30)
    return `${months} เดือนที่แล้ว`
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 3px', color: '#02402e' }}>ผู้ใช้งาน</h1>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>ผู้ลงประกาศในระบบทั้งหมด</p>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'ผู้ใช้ทั้งหมด', value: totalUsers, icon: '👥', bg: '#e8f5f0', color: '#048c73' },
          { label: 'ประกาศทั้งหมด', value: totalListings, icon: '🏠', bg: '#e0f2f9', color: '#0284c7' },
          { label: 'เฉลี่ย/ผู้ใช้', value: totalUsers > 0 ? (totalListings / totalUsers).toFixed(1) : '0', icon: '📊', bg: '#fff6e9', color: '#d97f11' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 42, height: 42, borderRadius: 12, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{k.icon}</span>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#02402e', lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  ค้นหาชื่อหรืออีเมล"
          style={{ width: '100%', padding: '10px 16px', borderRadius: 12, border: '1px solid #eef0ef', fontSize: 13.5, outline: 'none', background: '#fff', boxSizing: 'border-box' }}
        />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 20px -12px rgba(2,64,46,0.08)' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ width: 28, height: 28, border: '3px solid #eef0ef', borderTopColor: '#048c73', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 10px' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            กำลังโหลด...
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>ไม่พบผู้ใช้</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eef0ef' }}>
                {['ผู้ใช้', 'ประกาศทั้งหมด', 'อนุมัติแล้ว', 'รออนุมัติ', 'ล่าสุด'].map(h => (
                  <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((u, i) => (
                <tr key={u.email} style={{ borderBottom: i < displayed.length - 1 ? '1px solid #f1f5f4' : 'none' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 36, height: 36, borderRadius: '50%', background: '#e8f5f0', color: '#048c73',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0,
                      }}>{(u.name || u.email).charAt(0).toUpperCase()}</span>
                      <div>
                        <div style={{ fontWeight: 600, color: '#02402e' }}>{u.name || '—'}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#02402e', fontSize: 16 }}>{u.count}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: '#dcfce7', color: '#15803d' }}>{u.approved}</span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {u.pending > 0 ? (
                      <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: '#fef9c3', color: '#a16207' }}>{u.pending}</span>
                    ) : <span style={{ color: '#94a3b8', fontSize: 13 }}>—</span>}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#94a3b8', fontSize: 12.5 }}>{timeAgo(u.lastSeen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
