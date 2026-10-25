'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { C, btnStyle } from '@/lib/ui'
import { PageHead, Section, Pill, Notice, Loading, input, label, th, td } from '@/components/admin/ui'
import {
  type UserRow, type UserDetail, type CallerRole,
  ROLE_STYLE, PACKAGE_STYLE, LISTING_STATUS_STYLE, fmtDate, getToken,
  SuspendModal, DeleteConfirmModal,
} from '@/components/admin/users-shared'

// One user's page: profile, listings, an edit form and the account actions.
// Replaces the old side drawers on the users list.
export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [detail,     setDetail]     = useState<UserDetail | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [callerRole, setCallerRole] = useState<CallerRole>('admin')
  const [myId,       setMyId]       = useState('')
  const [modal,      setModal]      = useState<'suspend' | 'delete' | null>(null)
  const [msg,        setMsg]        = useState<{ tone: 'ok' | 'err'; text: string } | null>(null)
  const [busy,       setBusy]       = useState<'' | 'reset' | 'resend' | 'save'>('')

  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [phone,     setPhone]     = useState('')
  const [role,      setRole]      = useState('landlord')
  const [pkg,       setPkg]       = useState('')
  const [pkgExpiry, setPkgExpiry] = useState('')

  useEffect(() => {
    createBrowserClient().auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      setMyId(session.user.id)
      try {
        const r = await fetch('/api/auth/role', { headers: { Authorization: `Bearer ${session.access_token}` } })
        const { role } = await r.json()
        setCallerRole(role === 'super_admin' ? 'super_admin' : 'admin')
      } catch {}
    })
  }, [])

  async function load() {
    setLoading(true); setError('')
    try {
      const token = await getToken()
      const r = await fetch(`/api/dashboard/users/detail?id=${id}`, { headers: { Authorization: `Bearer ${token}` } })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error ?? 'Load failed')
      setDetail(d)
      const p = d.profile
      setFirstName(p.first_name ?? ''); setLastName(p.last_name ?? ''); setPhone(p.phone ?? '')
      setRole(p.role); setPkg(p.package_type ?? ''); setPkgExpiry(p.package_expires_at ? p.package_expires_at.slice(0, 10) : '')
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  useEffect(() => { if (id) load() }, [id])

  async function save() {
    setBusy('save'); setMsg(null)
    try {
      const body: Record<string, string> = { id, first_name: firstName.trim(), last_name: lastName.trim(), phone: phone.trim() }
      if (callerRole === 'super_admin') {
        body.role = role
        if (pkg) body.package_type = pkg
        if (pkgExpiry) body.package_expires_at = new Date(pkgExpiry).toISOString()
      }
      const token = await getToken()
      const r = await fetch('/api/dashboard/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error ?? 'Save failed')
      setMsg({ tone: 'ok', text: 'บันทึกข้อมูลแล้ว' })
      load()
    } catch (e: any) { setMsg({ tone: 'err', text: `ผิดพลาด: ${e.message}` }) }
    setBusy('')
  }

  // Same email the owner gets from "ลืมรหัสผ่าน" on the login page.
  async function sendReset() {
    if (!detail) return
    setBusy('reset'); setMsg(null)
    try {
      const { error: err } = await createBrowserClient().auth.resetPasswordForEmail(detail.profile.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (err) throw err
      setMsg({ tone: 'ok', text: `ส่งลิงก์ตั้งรหัสผ่านใหม่ไปที่ ${detail.profile.email} แล้ว` })
    } catch (e: any) { setMsg({ tone: 'err', text: `ผิดพลาด: ${e.message}` }) }
    setBusy('')
  }

  async function resendConfirmation() {
    setBusy('resend'); setMsg(null)
    try {
      const token = await getToken()
      const r = await fetch('/api/dashboard/users/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error ?? 'Failed')
      setMsg({ tone: 'ok', text: 'ส่งอีเมลยืนยันแล้ว' })
    } catch (e: any) { setMsg({ tone: 'err', text: `ผิดพลาด: ${e.message}` }) }
    setBusy('')
  }

  const back = { href: '/dashboard/users', label: 'ผู้ใช้งานทั้งหมด' }
  if (loading) return <div><PageHead title="ผู้ใช้งาน" back={back} /><Loading /></div>
  if (error || !detail) return <div><PageHead title="ผู้ใช้งาน" back={back} /><Notice tone="err">{error || 'ไม่พบผู้ใช้'}</Notice></div>

  const p = detail.profile
  const listings = detail.listings
  const name = [p.first_name, p.last_name].filter(Boolean).join(' ') || p.full_name || p.email
  const suspended = p.status === 'suspended'
  const isSuper = callerRole === 'super_admin'
  // The modals take a list row; build one from the detail.
  const row: UserRow = {
    ...p,
    package: p.active_package,
    listings: {
      total:   listings.length,
      active:  listings.filter(l => l.listing_status === 'active').length,
      pending: listings.filter(l => l.listing_status === 'pending').length,
      expired: listings.filter(l => l.listing_status === 'expired').length,
    },
  }
  const disabledInput = { ...input, background: C.paper, color: C.faint }

  return (
    <div>
      {modal === 'suspend' && <SuspendModal user={row} onClose={() => setModal(null)} onDone={load} />}
      {modal === 'delete' && <DeleteConfirmModal user={row} onClose={() => setModal(null)} onDeleted={() => router.push('/dashboard/users')} />}

      <PageHead
        back={back}
        title={name}
        sub={<>{p.email} · <Pill tone={p.role === 'landlord' ? 'green' : 'amber'}>{(ROLE_STYLE[p.role] ?? ROLE_STYLE.landlord).label}</Pill>{suspended && <> <Pill tone="red">ถูกระงับ</Pill></>}</>}
      />

      {msg && <div style={{ marginBottom: 16 }}><Notice tone={msg.tone}>{msg.text}</Notice></div>}

      <div className="sm-admin-2col" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 16, alignItems: 'start' }}>
        <div>
          <Section title="ข้อมูลบัญชี">
            <dl style={{ display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: 10, margin: 0, fontSize: 14 }}>
              {[
                ['อีเมล', p.email],
                ['เบอร์โทร', p.phone || '—'],
                ['สมัครเมื่อ', fmtDate(p.created_at)],
                ['แก้ไขล่าสุด', fmtDate(p.updated_at)],
                ['แพ็กเกจ', p.active_package ? (PACKAGE_STYLE[p.active_package]?.label ?? p.active_package) : '—'],
                ['หมดอายุ', p.package_expires_at ? fmtDate(p.package_expires_at) : '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'contents' }}>
                  <dt style={{ color: C.muted }}>{k}</dt>
                  <dd style={{ margin: 0, color: C.ink }}>{v}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section title={`ประกาศ (${listings.length})`} pad={false}>
            {listings.length === 0 ? (
              <p style={{ padding: 18, margin: 0, color: C.muted, fontSize: 14 }}>ยังไม่มีประกาศ</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>{['ประกาศ', 'สถานะ', 'แพ็กเกจ', 'หมดอายุ', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {listings.map(l => {
                      const ls = LISTING_STATUS_STYLE[l.listing_status ?? 'inactive'] ?? LISTING_STATUS_STYLE.inactive
                      const tone = l.listing_status === 'active' ? 'green' : l.listing_status === 'expired' ? 'red' : l.listing_status === 'pending' ? 'amber' : 'neutral'
                      return (
                        <tr key={l.id}>
                          <td style={{ ...td, minWidth: 220 }}>
                            <div style={{ color: C.green, fontWeight: 500 }}>{l.title_th || l.title_en || 'ไม่มีชื่อ'}</div>
                            <div style={{ fontSize: 12.5, color: C.muted }}>{(l as any).district || l.property_type || '—'}</div>
                          </td>
                          <td style={td}><Pill tone={tone}>{ls.label}</Pill></td>
                          <td style={{ ...td, color: C.muted }}>{l.package_type ? (PACKAGE_STYLE[l.package_type]?.label ?? l.package_type) : '—'}</td>
                          <td style={{ ...td, color: C.muted, whiteSpace: 'nowrap' }}>{fmtDate(l.expires_at)}</td>
                          <td style={{ ...td, textAlign: 'right' }}>
                            <Link href={`/dashboard/listings?editId=${l.id}`} style={{ color: C.teal, fontSize: 13, textDecoration: 'none' }}>แก้ไข</Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          <Section title="แก้ไขข้อมูล">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div><label style={label}>ชื่อ</label><input value={firstName} onChange={e => setFirstName(e.target.value)} style={input} /></div>
              <div><label style={label}>นามสกุล</label><input value={lastName} onChange={e => setLastName(e.target.value)} style={input} /></div>
              <div><label style={label}>เบอร์โทรศัพท์</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0xx-xxx-xxxx" style={input} /></div>
              <div>
                <label style={label}>บทบาท{!isSuper && ' (เฉพาะ Super Admin)'}</label>
                <select value={role} onChange={e => setRole(e.target.value)} disabled={!isSuper} style={isSuper ? input : disabledInput}>
                  {(isSuper ? ['landlord', 'admin', 'super_admin'] : [role]).map(r => (
                    <option key={r} value={r}>{r === 'super_admin' ? 'Super Admin' : r === 'admin' ? 'Admin' : 'เจ้าของ (Landlord)'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={label}>แพ็กเกจ{!isSuper && ' (เฉพาะ Super Admin)'}</label>
                <select value={pkg} onChange={e => setPkg(e.target.value)} disabled={!isSuper} style={isSuper ? input : disabledInput}>
                  <option value="">ไม่มีแพ็กเกจ</option>
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div>
                <label style={label}>แพ็กเกจหมดอายุ</label>
                <input type="date" value={pkgExpiry} onChange={e => setPkgExpiry(e.target.value)} disabled={!isSuper} style={isSuper ? input : disabledInput} />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button onClick={save} disabled={busy === 'save'} className="sm-btn-primary" style={btnStyle('primary')}>
                {busy === 'save' ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </button>
            </div>
          </Section>
        </div>

        <aside>
          <Section title="จัดการบัญชี">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={sendReset} disabled={busy === 'reset'} className="sm-btn-ghost" style={{ ...btnStyle('ghost'), justifyContent: 'flex-start' }}>
                {busy === 'reset' ? 'กำลังส่ง...' : 'ส่งลิงก์ตั้งรหัสผ่านใหม่'}
              </button>
              <button onClick={resendConfirmation} disabled={busy === 'resend'} className="sm-btn-ghost" style={{ ...btnStyle('ghost'), justifyContent: 'flex-start' }}>
                {busy === 'resend' ? 'กำลังส่ง...' : 'ส่งอีเมลยืนยันใหม่'}
              </button>
              {listings.length > 0 && (
                <Link href={`/dashboard/listings?landlord=${p.id}`} className="sm-btn-ghost" style={{ ...btnStyle('ghost'), justifyContent: 'flex-start' }}>ดูประกาศในหน้าจัดการประกาศ</Link>
              )}
              {isSuper && p.id !== myId && (
                <>
                  <button onClick={() => setModal('suspend')} className="sm-btn-ghost" style={{ ...btnStyle('ghost'), justifyContent: 'flex-start', color: suspended ? C.green : C.amber }}>
                    {suspended ? 'เปิดใช้งานบัญชี' : 'ระงับบัญชี'}
                  </button>
                  <button onClick={() => setModal('delete')} className="sm-btn-ghost" style={{ ...btnStyle('ghost'), justifyContent: 'flex-start', color: '#b42318' }}>
                    ลบผู้ใช้
                  </button>
                </>
              )}
            </div>
            <p style={{ margin: '12px 0 0', fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>
              ลิงก์ตั้งรหัสผ่านใหม่คืออีเมลเดียวกับปุ่ม &quot;ลืมรหัสผ่าน&quot; ในหน้าเข้าสู่ระบบ แอดมินไม่เห็นรหัสผ่านของผู้ใช้
            </p>
          </Section>
        </aside>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @media (max-width: 900px) { .sm-admin-2col { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
