'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'

interface Listing {
  id: number
  title: string | null
  type: string | null
  price: number | null
  status: string | null
  contact_email: string | null
  contact_name: string | null
  district: string | null
  province: string | null
  package_type: string | null
  expires_at: string | null
  created_at: string | null
  address: string | null
  bedrooms: number | null
  bathrooms: number | null
  size: string | null
}

const STATUS_LABEL: Record<string, string> = {
  approved: 'เผยแพร่แล้ว',
  pending:  'รอตรวจสอบ',
  rejected: 'ถูกปฏิเสธ',
}
const STATUS_COLOR: Record<string, string> = {
  approved: '#048c73',
  pending:  '#d97f11',
  rejected: '#c0392b',
}
const STATUS_BG: Record<string, string> = {
  approved: '#eaf6f1',
  pending:  '#fdf3e3',
  rejected: '#fdecea',
}
const PKG_LABEL: Record<string, string> = {
  basic:    'Basic (30 วัน)',
  standard: 'Standard (90 วัน)',
  premium:  'Premium (365 วัน)',
  admin:    'Admin',
}
const TYPE_LABEL: Record<string, string> = {
  condo:     'คอนโดมิเนียม',
  apartment: 'อพาร์ทเม้นท์',
  house:     'บ้าน',
  office:    'ออฟฟิศ',
  coworking: 'โคเวิร์กกิ้ง',
}

function daysLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null
  const diff = new Date(expiresAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function OwnerDashboardPage() {
  const [listings, setListings]   = useState<Listing[]>([])
  const [loading, setLoading]     = useState(true)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      const email = session?.user.email ?? ''
      setUserEmail(email)
      if (!email) return

      fetch(`/api/owner/listings?email=${encodeURIComponent(email)}`)
        .then(r => r.json())
        .then((d: { listings?: Listing[] }) => setListings(d.listings ?? []))
        .catch(() => setListings([]))
        .finally(() => setLoading(false))
    })
  }, [])

  const active  = listings.filter(l => l.status === 'approved')
  const pending = listings.filter(l => l.status === 'pending')
  const expired = listings.filter(l => {
    if (l.status !== 'approved') return false
    const d = daysLeft(l.expires_at)
    return d !== null && d === 0
  })

  return (
    <div>
      {/* Welcome header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#02402e', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
          ยินดีต้อนรับ 👋
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0, fontWeight: 300 }}>
          {userEmail} — จัดการประกาศทรัพย์สินของคุณ
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }} className="sm-owner-stats">
        {[
          { label: 'ประกาศที่เผยแพร่', value: active.length, color: '#048c73', bg: '#eaf6f1' },
          { label: 'รอตรวจสอบ',        value: pending.length, color: '#d97f11', bg: '#fdf3e3' },
          { label: 'ประกาศทั้งหมด',    value: listings.length, color: '#02402e', bg: '#f0f7f4' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: '20px 22px', boxShadow: '0 4px 14px -8px rgba(2,64,46,0.08)' }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: s.color, letterSpacing: '-1px' }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 400 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Listings table */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px -10px rgba(2,64,46,0.08)' }}>
        {/* Table header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #eef0ef', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#02402e', margin: 0 }}>ประกาศของฉัน</h2>
          <Link href="/submit" style={{
            background: '#02402e', color: '#fff', fontSize: 13, fontWeight: 600,
            padding: '9px 18px', borderRadius: 22, textDecoration: 'none', display: 'inline-block',
          }}>
            + ลงประกาศใหม่
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '56px 24px', textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #048c73', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 14px' }} />
            <p style={{ color: '#94a3b8', fontSize: 14 }}>กำลังโหลดประกาศ...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : listings.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 40, margin: '0 0 12px' }}>🏠</p>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#02402e', margin: '0 0 8px' }}>ยังไม่มีประกาศ</h3>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px', fontWeight: 300 }}>
              ลงประกาศแรกของคุณวันนี้ เริ่มต้นเพียง ฿299/เดือน
            </p>
            <Link href="/submit" style={{
              background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 14,
              padding: '13px 28px', borderRadius: 26, textDecoration: 'none', display: 'inline-block',
            }}>
              ลงประกาศเลย →
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8faf9' }}>
                  {['ชื่อทรัพย์สิน', 'ประเภท', 'ราคา', 'แพ็กเกจ', 'หมดอายุ', 'สถานะ'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', letterSpacing: 0.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listings.map((l, i) => {
                  const days = daysLeft(l.expires_at)
                  const isExpiringSoon = days !== null && days > 0 && days <= 7
                  const status = l.status || 'pending'
                  return (
                    <tr key={l.id} style={{ borderTop: i > 0 ? '1px solid #f1f5f4' : 'none' }}>
                      <td style={{ padding: '16px', minWidth: 200 }}>
                        <div style={{ fontWeight: 600, color: '#231f20', fontSize: 14, marginBottom: 3 }}>
                          {l.title || '(ไม่ระบุชื่อ)'}
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 300 }}>
                          {l.district ? `${l.district} · ` : ''}{l.province || 'กรุงเทพมหานคร'}
                        </div>
                      </td>
                      <td style={{ padding: '16px', fontSize: 13, color: '#475569' }}>
                        {TYPE_LABEL[l.type ?? ''] || l.type || '—'}
                      </td>
                      <td style={{ padding: '16px', fontSize: 14, fontWeight: 600, color: '#d97f11', whiteSpace: 'nowrap' }}>
                        {l.price ? `฿${Number(l.price).toLocaleString('en-US')}` : '—'}
                      </td>
                      <td style={{ padding: '16px', fontSize: 13, color: '#475569' }}>
                        {PKG_LABEL[l.package_type ?? ''] || l.package_type || '—'}
                      </td>
                      <td style={{ padding: '16px', fontSize: 13, whiteSpace: 'nowrap' }}>
                        {days === null ? (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        ) : days === 0 ? (
                          <span style={{ color: '#c0392b', fontWeight: 600 }}>หมดอายุแล้ว</span>
                        ) : (
                          <span style={{ color: isExpiringSoon ? '#d97f11' : '#475569', fontWeight: isExpiringSoon ? 600 : 400 }}>
                            {isExpiringSoon && '⚠️ '}
                            {days} วัน
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          display: 'inline-block',
                          background: STATUS_BG[status] || '#f1f5f4',
                          color: STATUS_COLOR[status] || '#64748b',
                          fontSize: 12, fontWeight: 600,
                          padding: '4px 12px', borderRadius: 20,
                          whiteSpace: 'nowrap',
                        }}>
                          {STATUS_LABEL[status] || status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Renewal CTA — only if any active listings exist */}
      {active.length > 0 && (
        <div style={{
          marginTop: 28, background: 'linear-gradient(135deg,#02402e,#048c73)',
          borderRadius: 20, padding: '28px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
        }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
              ต้องการเพิ่มประกาศหรือต่ออายุแพ็กเกจ?
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: 300 }}>
              ลงประกาศเพิ่มเติมหรืออัปเกรดแพ็กเกจได้ตลอดเวลา
            </p>
          </div>
          <Link href="/submit" style={{
            background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 14,
            padding: '12px 24px', borderRadius: 22, textDecoration: 'none',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            ลงประกาศใหม่ →
          </Link>
        </div>
      )}

      {/* Info section */}
      <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="sm-owner-info">
        <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: '22px 24px' }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#02402e', margin: '0 0 10px' }}>📦 แพ็กเกจของเรา</h4>
          <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.8, fontWeight: 300 }}>
            <div>• Basic — ฿299/เดือน (30 วัน)</div>
            <div>• Standard — ฿699/3 เดือน <span style={{ color: '#048c73', fontWeight: 600 }}>ยอดนิยม</span></div>
            <div>• Premium — ฿2,499/ปี (365 วัน + วิดีโอ)</div>
          </div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: '22px 24px' }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#02402e', margin: '0 0 10px' }}>🤝 บริหารทรัพย์แบบ A–Z</h4>
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.8, margin: '0 0 14px', fontWeight: 300 }}>
            ให้ SpacesMate ดูแลทรัพย์สินของคุณครบวงจร ตั้งแต่หาผู้เช่า เก็บค่าเช่า จนถึงรายงาน P&L รายเดือน
          </p>
          <Link href="/manage" style={{ color: '#048c73', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            ดูบริการบริหารทรัพย์ →
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .sm-owner-stats { grid-template-columns: 1fr !important; }
          .sm-owner-info  { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
