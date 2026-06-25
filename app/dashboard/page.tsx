'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Stats {
  total: number
  pending: number
  approved: number
  thisMonth: number
}

interface Submission {
  id: string
  created_at: string
  title: string
  type: string
  rent_type: 'month' | 'day'
  price: number | null
  size: string | null
  bedrooms: number | null
  bathrooms: number | null
  floor: string | null
  address: string | null
  province: string | null
  district: string | null
  subdistrict: string | null
  postcode: string | null
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  description: string | null
  amenities: string[]
  status: 'pending' | 'approved' | 'rejected'
}

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected'] as const
type StatusTab = typeof STATUS_TABS[number]

const STATUS_LABELS: Record<string, string> = {
  all: 'ทั้งหมด', pending: 'รออนุมัติ', approved: 'อนุมัติแล้ว', rejected: 'ปฏิเสธ',
}

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  pending:  { bg: '#fef9c3', text: '#a16207', label: 'รออนุมัติ' },
  approved: { bg: '#dcfce7', text: '#15803d', label: 'อนุมัติแล้ว' },
  rejected: { bg: '#fee2e2', text: '#b91c1c', label: 'ปฏิเสธ' },
}

function formatPrice(price: number | null, rentType: string) {
  if (!price) return '—'
  return `฿${price.toLocaleString('th-TH')}/${rentType === 'day' ? 'วัน' : 'เดือน'}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}

function typeLabel(t: string) {
  const map: Record<string, string> = {
    Apartment: 'อพาร์ทเม้นท์', Condo: 'คอนโด', House: 'บ้าน',
    Office: 'ออฟฟิศ', Coworking: 'โคเวิร์กกิ้ง',
  }
  return map[t] || t
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const [authReady, setAuthReady] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, thisMonth: 0 })
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [tab, setTab] = useState<StatusTab>('all')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Auth guard
  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/login')
      } else {
        setUserEmail(data.session.user.email ?? '')
        setAuthReady(true)
      }
    })
  }, [router])

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true)
    const [statsRes, subsRes] = await Promise.all([
      fetch('/api/dashboard/stats'),
      fetch(`/api/dashboard/submissions?status=${tab}`),
    ])
    if (statsRes.ok) setStats(await statsRes.json())
    if (subsRes.ok) {
      const json = await subsRes.json()
      setSubmissions(json.data ?? [])
    }
    setLoading(false)
  }, [tab])

  useEffect(() => {
    if (authReady) fetchData()
  }, [authReady, fetchData])

  // Update status
  async function updateStatus(id: string, status: 'approved' | 'rejected' | 'pending') {
    setActionLoading(id + status)
    await fetch(`/api/dashboard/submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setActionLoading(null)
    fetchData()
  }

  async function handleLogout() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!authReady) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f9f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #048c73', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f9f8', fontFamily: "'Prompt', sans-serif" }}>

      {/* Top Bar */}
      <header style={{ background: '#02402e', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 16px rgba(2,64,46,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ color: '#d97f11', fontWeight: 700, fontSize: 18, textDecoration: 'none' }}>SpacesMate</Link>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
          <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 500 }}>Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12.5 }}>{userEmail}</span>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', fontSize: 12.5, padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
            ออกจากระบบ
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

        {/* Page Title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#02402e', margin: '0 0 4px', letterSpacing: '-0.4px' }}>ประกาศที่ส่งเข้ามา</h1>
          <p style={{ color: '#64748b', fontSize: 13.5, margin: 0 }}>จัดการและอนุมัติประกาศที่พักจากเจ้าของทรัพย์สิน</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'ทั้งหมด', value: stats.total, color: '#02402e', bg: '#f0fdf4', icon: '📋' },
            { label: 'รออนุมัติ', value: stats.pending, color: '#a16207', bg: '#fefce8', icon: '⏳' },
            { label: 'อนุมัติแล้ว', value: stats.approved, color: '#15803d', bg: '#f0fdf4', icon: '✅' },
            { label: 'เดือนนี้', value: stats.thisMonth, color: '#048c73', bg: '#f0fdfa', icon: '📅' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 12px -6px rgba(2,64,46,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 8px', fontWeight: 500, letterSpacing: 0.3 }}>{s.label}</p>
                  <p style={{ color: s.color, fontSize: 34, fontWeight: 700, margin: 0, lineHeight: 1 }}>{s.value}</p>
                </div>
                <div style={{ width: 42, height: 42, background: s.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#fff', borderRadius: 12, border: '1px solid #eef0ef', padding: 5, width: 'fit-content' }}>
          {STATUS_TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', fontFamily: 'inherit',
                background: tab === t ? '#02402e' : 'transparent',
                color: tab === t ? '#fff' : '#64748b',
                transition: 'all .15s',
              }}
            >
              {STATUS_LABELS[t]}
              {t === 'pending' && stats.pending > 0 && (
                <span style={{ marginLeft: 6, background: '#d97f11', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px -6px rgba(2,64,46,0.06)' }}>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>กำลังโหลดข้อมูล...</div>
          ) : submissions.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 36, margin: '0 0 8px' }}>📭</p>
              <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>ไม่มีประกาศในหมวดนี้</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eef0ef' }}>
                  {['วันที่', 'ชื่อประกาศ', 'ประเภท', 'ราคา', 'ที่อยู่', 'ผู้ติดต่อ', 'สถานะ', 'จัดการ'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11.5, color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: 0.4 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, i) => {
                  const badge = STATUS_BADGE[sub.status] || STATUS_BADGE.pending
                  const isExpanded = expandedId === sub.id
                  return (
                    <>
                      <tr
                        key={sub.id}
                        onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                        style={{ borderBottom: '1px solid #f3f5f4', background: isExpanded ? '#f0fdf4' : i % 2 === 0 ? '#fff' : '#fafcfb', cursor: 'pointer' }}
                      >
                        <td style={{ padding: '13px 16px', fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>{formatDate(sub.created_at)}</td>
                        <td style={{ padding: '13px 16px', maxWidth: 200 }}>
                          <p style={{ fontSize: 13.5, fontWeight: 600, color: '#231f20', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.title || '—'}</p>
                          <p style={{ fontSize: 11.5, color: '#94a3b8', margin: 0 }}>
                            {sub.bedrooms != null ? `${sub.bedrooms} นอน` : ''}{sub.size ? ` · ${sub.size} ตร.ม.` : ''}
                          </p>
                        </td>
                        <td style={{ padding: '13px 16px', fontSize: 12.5, color: '#475569', whiteSpace: 'nowrap' }}>{typeLabel(sub.type)}</td>
                        <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600, color: '#d97f11', whiteSpace: 'nowrap' }}>{formatPrice(sub.price, sub.rent_type)}</td>
                        <td style={{ padding: '13px 16px', fontSize: 12.5, color: '#475569', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {[sub.district, sub.province].filter(Boolean).join(' · ') || '—'}
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#231f20', margin: '0 0 2px' }}>{sub.contact_name || '—'}</p>
                          <p style={{ fontSize: 11.5, color: '#94a3b8', margin: 0 }}>{sub.contact_phone || ''}</p>
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{ background: badge.bg, color: badge.text, fontSize: 11.5, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>{badge.label}</span>
                        </td>
                        <td style={{ padding: '13px 16px' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {sub.status !== 'approved' && (
                              <button
                                onClick={() => updateStatus(sub.id, 'approved')}
                                disabled={!!actionLoading}
                                style={{ background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: 8, padding: '5px 11px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: actionLoading === sub.id + 'approved' ? 0.5 : 1 }}
                              >
                                ✓ อนุมัติ
                              </button>
                            )}
                            {sub.status !== 'rejected' && (
                              <button
                                onClick={() => updateStatus(sub.id, 'rejected')}
                                disabled={!!actionLoading}
                                style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 8, padding: '5px 11px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: actionLoading === sub.id + 'rejected' ? 0.5 : 1 }}
                              >
                                ✕ ปฏิเสธ
                              </button>
                            )}
                            {sub.status !== 'pending' && (
                              <button
                                onClick={() => updateStatus(sub.id, 'pending')}
                                disabled={!!actionLoading}
                                style={{ background: '#fef9c3', color: '#a16207', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                                title="คืนสถานะ"
                              >
                                ↺
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {isExpanded && (
                        <tr key={sub.id + '-exp'}>
                          <td colSpan={8} style={{ padding: '20px 24px 24px', background: '#f0fdf4', borderBottom: '1px solid #d1fae5' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
                              <div>
                                <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.6 }}>ที่อยู่เต็ม</p>
                                <p style={{ fontSize: 13.5, color: '#231f20', margin: 0, lineHeight: 1.7 }}>
                                  {[sub.address, sub.subdistrict, sub.district, sub.province, sub.postcode].filter(Boolean).join(', ') || '—'}
                                </p>
                              </div>
                              <div>
                                <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.6 }}>ผู้ติดต่อ</p>
                                <p style={{ fontSize: 13.5, fontWeight: 600, color: '#231f20', margin: '0 0 5px' }}>{sub.contact_name || '—'}</p>
                                <p style={{ fontSize: 13, color: '#475569', margin: '0 0 3px' }}>📞 {sub.contact_phone || '—'}</p>
                                <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>✉️ {sub.contact_email || '—'}</p>
                              </div>
                              <div>
                                <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.6 }}>สิ่งอำนวยความสะดวก</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                  {(sub.amenities || []).length > 0
                                    ? sub.amenities.map(a => (
                                        <span key={a} style={{ background: '#e0f2f1', color: '#047857', fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 500 }}>{a}</span>
                                      ))
                                    : <span style={{ color: '#94a3b8', fontSize: 13 }}>—</span>
                                  }
                                </div>
                              </div>
                              {sub.description && (
                                <div style={{ gridColumn: '1 / -1' }}>
                                  <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.6 }}>รายละเอียดเพิ่มเติม</p>
                                  <p style={{ fontSize: 13.5, color: '#475569', margin: 0, lineHeight: 1.75 }}>{sub.description}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <p style={{ textAlign: 'center', color: '#cbd5e1', fontSize: 12, marginTop: 24 }}>
          SpacesMate Admin · Space Works Co., Ltd. · © {new Date().getFullYear()}
        </p>
      </main>
    </div>
  )
}
