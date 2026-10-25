'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { C, RADIUS, btnStyle } from '@/lib/ui'
import { PageHead, Stat, Pill, card, input, th, td, Loading } from '@/components/admin/ui'
import { type UserRow, type CallerRole, ROLE_STYLE, PACKAGE_STYLE, fmtDate, timeAgo, getToken } from '@/components/admin/users-shared'

// Full-width list. Each row opens the user's own page (/dashboard/users/[id]),
// where editing, suspending and deleting happen.
export default function UsersPage() {
  const router = useRouter()
  const [users,        setUsers]        = useState<UserRow[]>([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [roleFilter,   setRoleFilter]   = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [callerRole,   setCallerRole]   = useState<CallerRole>('admin')
  const [totalListings,setTotalListings]= useState(0)

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
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

  const landlordCount  = users.filter(u => u.role === 'landlord').length
  const adminCount     = users.filter(u => u.role === 'admin' || u.role === 'super_admin').length
  const suspendedCount = users.filter(u => u.status === 'suspended').length

  const roleTabs = callerRole === 'super_admin'
    ? [{ key: 'all', label: 'ทั้งหมด' }, { key: 'landlord', label: 'เจ้าของ' }, { key: 'admin', label: 'Admin' }, { key: 'super_admin', label: 'Super Admin' }]
    : [{ key: 'all', label: 'ทั้งหมด' }, { key: 'landlord', label: 'เจ้าของ' }]

  const chip = (on: boolean) => ({
    padding: '8px 12px', borderRadius: RADIUS, border: `1px solid ${on ? C.green : C.border}`,
    background: on ? C.green : C.white, color: on ? C.white : C.ink, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
  })

  return (
    <div>
      <PageHead title="ผู้ใช้งาน" sub="กดแก้ไขเพื่อเปิดหน้าข้อมูลของผู้ใช้แต่ละคน" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 20 }}>
        <Stat value={users.length} label="ผู้ใช้ทั้งหมด" />
        <Stat value={landlordCount} label="เจ้าของทรัพย์" />
        <Stat value={totalListings} label="ประกาศทั้งหมด" />
        {callerRole === 'super_admin'
          ? <Stat value={suspendedCount} label="บัญชีถูกระงับ" />
          : <Stat value={adminCount} label="ผู้ดูแลระบบ" />}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาชื่อ อีเมล หรือเบอร์โทร"
          style={{ ...input, flex: 1, minWidth: 220, width: 'auto' }} />
        {roleTabs.map(t => (
          <button key={t.key} onClick={() => setRoleFilter(t.key)} style={chip(roleFilter === t.key)}>{t.label}</button>
        ))}
        {callerRole === 'super_admin' && (
          <button onClick={() => setStatusFilter(statusFilter === 'suspended' ? 'all' : 'suspended')} style={chip(statusFilter === 'suspended')}>
            ถูกระงับ{suspendedCount > 0 ? ` (${suspendedCount})` : ''}
          </button>
        )}
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        {loading ? <Loading /> : filtered.length === 0 ? (
          <p style={{ padding: '48px 24px', textAlign: 'center', color: C.muted, fontSize: 14, margin: 0 }}>
            {search || roleFilter !== 'all' || statusFilter !== 'all' ? 'ไม่พบผู้ใช้ที่ตรงกับเงื่อนไข' : 'ยังไม่มีผู้ใช้ในระบบ'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['ผู้ใช้', 'เบอร์โทร', 'บทบาท', 'แพ็กเกจ', 'ประกาศ', 'สถานะ', 'สมัครเมื่อ', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const rs = ROLE_STYLE[u.role] ?? ROLE_STYLE.landlord
                  const ps = u.package ? (PACKAGE_STYLE[u.package] ?? PACKAGE_STYLE.free) : null
                  const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.full_name || '—'
                  const suspended = u.status === 'suspended'
                  return (
                    <tr key={u.id} className="sm-row-link" style={{ cursor: 'pointer' }} onClick={() => router.push(`/dashboard/users/${u.id}`)}>
                      <td style={{ ...td, minWidth: 220 }}>
                        <div style={{ fontWeight: 500, color: suspended ? C.faint : C.green }}>{name}</div>
                        <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{u.email}</div>
                      </td>
                      <td style={{ ...td, whiteSpace: 'nowrap', color: C.muted }}>{u.phone || '—'}</td>
                      <td style={td}><Pill tone={u.role === 'landlord' ? 'green' : 'amber'}>{rs.label}</Pill></td>
                      <td style={td}>{ps ? <Pill>{ps.label}</Pill> : <span style={{ color: C.faint }}>—</span>}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>
                        <strong style={{ fontWeight: 600, color: C.green }}>{u.listings.total}</strong>
                        {u.listings.active > 0 && <span style={{ color: C.muted, fontSize: 12.5 }}> · เผยแพร่ {u.listings.active}</span>}
                      </td>
                      <td style={td}>{suspended ? <Pill tone="red">ถูกระงับ</Pill> : <Pill tone="green">ปกติ</Pill>}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap', color: C.muted, fontSize: 12.5 }}>
                        {fmtDate(u.created_at)}<div style={{ fontSize: 12, color: C.faint }}>{timeAgo(u.created_at)}</div>
                      </td>
                      <td style={{ ...td, textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                        <Link href={`/dashboard/users/${u.id}`} className="sm-btn-ghost" style={{ ...btnStyle('ghost'), padding: '6px 12px', fontSize: 13 }}>แก้ไข</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div style={{ padding: '10px 16px', fontSize: 12.5, color: C.muted }}>แสดง {filtered.length} จาก {users.length} ผู้ใช้</div>
          </div>
        )}
      </div>
    </div>
  )
}
