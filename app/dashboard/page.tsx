'use client'

import { useEffect, useState } from 'react'
import { properties } from '@/lib/property-data'

interface StatsData {
  total: number
  pending: number
  approved: number
  rejected: number
  thisMonth: number
  byType: Record<string, number>
  staleCount: number
  uniqueUsers: number
  recentActivity: Array<{
    id: string
    title: string
    type: string
    status: string
    contact_name: string | null
    created_at: string
    updated_at: string | null
  }>
}

const TYPE_LABELS: Record<string, string> = {
  Apartment: 'อพาร์ทเม้นท์',
  Condo:     'คอนโดมิเนียม',
  House:     'บ้าน',
  Office:    'ออฟฟิศ',
  Coworking: 'Co-space',
}

const ALL_TYPES = ['Condo', 'Apartment', 'House', 'Office', 'Coworking']

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} นาทีที่แล้ว`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`
  const days = Math.floor(hrs / 24)
  return `${days} วันที่แล้ว`
}

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  pending:  { bg: '#fef9c3', color: '#a16207', label: 'รออนุมัติ' },
  approved: { bg: '#dcfce7', color: '#15803d', label: 'อนุมัติแล้ว' },
  rejected: { bg: '#fee2e2', color: '#b91c1c', label: 'ปฏิเสธ' },
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const now = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  // Build byType from static property data (real live listings)
  const staticByType: Record<string, number> = {}
  for (const p of properties) {
    const t = p.propertyType === 'Co-Working' ? 'Coworking' : p.propertyType
    staticByType[t] = (staticByType[t] || 0) + 1
  }

  const byType = staticByType
  const maxTypeCount = Math.max(...ALL_TYPES.map(t => byType[t] ?? 0), 1)

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 4px', color: '#02402e', letterSpacing: '-0.4px' }}>ภาพรวมระบบ</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>อัปเดตล่าสุด · {now}</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #eef0ef', borderTopColor: '#048c73', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ margin: 0, fontSize: 13 }}>กำลังโหลด...</p>
        </div>
      ) : (
        <>
          {/* ── KPI CARDS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
            {[
              {
                label: 'ประกาศทั้งหมด',
                value: properties.length,
                delta: `${stats?.pending ?? 0} คำขอรอตรวจสอบ`,
                deltaColor: (stats?.pending ?? 0) > 0 ? '#d97f11' : '#22c55e',
                iconBg: '#e8f5f0',
                iconColor: '#048c73',
                icon: 'home_work',
              },
              {
                label: 'ผู้ใช้ที่ลงประกาศ',
                value: stats?.uniqueUsers ?? 0,
                delta: `จากประกาศทั้งหมด`,
                deltaColor: '#94a3b8',
                iconBg: '#e0f2f9',
                iconColor: '#0284c7',
                icon: 'group',
              },
              {
                label: 'ยังไม่อัปเดต 6 เดือน',
                value: stats?.staleCount ?? 0,
                delta: stats?.staleCount ? 'ควรตรวจสอบ' : 'ทุกรายการเป็นปัจจุบัน',
                deltaColor: stats?.staleCount ? '#d97f11' : '#22c55e',
                iconBg: '#fff6e9',
                iconColor: '#d97f11',
                icon: 'schedule',
              },
              {
                label: 'รายได้เดือนนี้',
                value: '—',
                delta: 'เร็วๆ นี้',
                deltaColor: '#94a3b8',
                iconBg: '#f3e8ff',
                iconColor: '#9333ea',
                icon: 'payments',
              },
            ].map(k => (
              <div key={k.label} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 16, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontSize: 12.5, color: '#94a3b8' }}>{k.label}</span>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: k.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="msym" style={{ fontSize: 20, color: k.iconColor, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{k.icon}</span>
                  </span>
                </div>
                <div style={{ fontSize: 27, fontWeight: 700, color: '#02402e', lineHeight: 1 }}>{k.value}</div>
                <div style={{ fontSize: 11.5, color: k.deltaColor, marginTop: 7, fontWeight: 500 }}>{k.delta}</div>
              </div>
            ))}
          </div>

          {/* ── ROW 2: BY TYPE + STALE ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 20 }}>

            {/* Listings by type */}
            <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 22, boxShadow: '0 6px 20px -12px rgba(2,64,46,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#02402e' }}>ประกาศตามประเภท</h2>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>รวม {stats?.total ?? 0} รายการ</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {ALL_TYPES.map(t => {
                  const count = byType[t] ?? 0
                  const pct = maxTypeCount > 0 ? (count / maxTypeCount) * 100 : 0
                  return (
                    <div key={t}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13.5, color: '#334155', fontWeight: 500 }}>{TYPE_LABELS[t] ?? t}</span>
                        <span style={{ fontSize: 13, color: '#02402e', fontWeight: 600 }}>{count}</span>
                      </div>
                      <div style={{ height: 9, background: '#f0f2f1', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#048c73,#06a487)', borderRadius: 6, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Stale listings */}
            <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 22, boxShadow: '0 6px 20px -12px rgba(2,64,46,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: '#fff6e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="msym" style={{ fontSize: 20, color: '#d97f11', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>schedule</span>
              </span>
                <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#02402e' }}>ยังไม่อัปเดตสถานะ</h2>
              </div>
              <p style={{ fontSize: 12.5, color: '#94a3b8', margin: '0 0 14px' }}>ไม่มีการอัปเดตในรอบ 6 เดือน — ควรตรวจสอบว่ายังว่างอยู่</p>
              <div style={{ fontSize: 34, fontWeight: 700, color: '#d97f11', lineHeight: 1, marginBottom: 14 }}>
                {stats?.staleCount ?? 0}{' '}
                <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 400 }}>รายการ</span>
              </div>
              {stats?.staleCount === 0 ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 11, padding: '14px 16px', fontSize: 13, color: '#15803d', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="msym" style={{ fontSize: 17, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>check_circle</span>
                  ทุกรายการได้รับการอัปเดตแล้ว
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#64748b' }}>
                  มีประกาศ {stats?.staleCount} รายการที่ไม่ได้รับการอัปเดตนานกว่า 6 เดือน — ควรติดต่อเจ้าของทรัพย์สินเพื่อยืนยันสถานะห้องว่าง
                </div>
              )}
            </div>
          </div>

          {/* ── ROW 3: RECENT SUBMISSIONS + ACTIVITY ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Recent submissions */}
            <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 22, boxShadow: '0 6px 20px -12px rgba(2,64,46,0.08)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px', color: '#02402e' }}>ประกาศล่าสุด</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(stats?.recentActivity ?? []).slice(0, 4).map(item => {
                  const s = STATUS_COLORS[item.status] ?? STATUS_COLORS.pending
                  return (
                    <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 38, height: 38, borderRadius: '50%', background: '#e8f5f0',
                        color: '#048c73', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 14, flexShrink: 0,
                      }}>
                        {(item.contact_name || item.title || '?').charAt(0).toUpperCase()}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title || '—'}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                          {TYPE_LABELS[item.type] ?? item.type} · {timeAgo(item.created_at)}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 10, background: s.bg, color: s.color, flexShrink: 0 }}>
                        {s.label}
                      </span>
                    </div>
                  )
                })}
                {(stats?.recentActivity ?? []).length === 0 && (
                  <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>ยังไม่มีประกาศ</p>
                )}
              </div>
            </div>

            {/* Activity log */}
            <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 22, boxShadow: '0 6px 20px -12px rgba(2,64,46,0.08)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 14px', color: '#02402e' }}>กิจกรรมล่าสุด</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                {(stats?.recentActivity ?? []).slice(0, 5).map((item, i) => {
                  const msyms    = ['edit','add_circle','check_circle','cancel','description']
                  const colors   = ['#e8f5f0','#e0f2f9','#f0fdf4','#fee2e2','#fef9c3']
                  const iconColors = ['#048c73','#0284c7','#22c55e','#b91c1c','#a16207']
                  return (
                    <div key={item.id} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                      <span style={{ width: 28, height: 28, borderRadius: 8, background: colors[i % colors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="msym" style={{ fontSize: 16, color: iconColors[i % iconColors.length], fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{msyms[i % msyms.length]}</span>
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.45 }}>
                          {item.status === 'pending' ? `ประกาศใหม่เข้ามา — "${item.title}"` :
                           item.status === 'approved' ? `อนุมัติประกาศ — "${item.title}"` :
                           `อัปเดตสถานะ — "${item.title}"`}
                        </div>
                        <div style={{ fontSize: 11, color: '#b3bdb9', marginTop: 2 }}>{timeAgo(item.updated_at || item.created_at)}</div>
                      </div>
                    </div>
                  )
                })}
                {(stats?.recentActivity ?? []).length === 0 && (
                  <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>ยังไม่มีกิจกรรม</p>
                )}
              </div>
            </div>
          </div>

          {/* ── STATUS SUMMARY ── */}
          <div style={{ marginTop: 20, background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 22, boxShadow: '0 6px 20px -12px rgba(2,64,46,0.08)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px', color: '#02402e' }}>คิวคำขอจากฟอร์ม</h2>
            <p style={{ fontSize: 12.5, color: '#94a3b8', margin: '0 0 16px' }}>ประกาศที่ส่งมาผ่านฟอร์ม /ลงประกาศ บนเว็บไซต์</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[
                { label: 'รออนุมัติ', value: stats?.pending ?? 0, bg: '#fef9c3', color: '#a16207', link: '/dashboard/listings?status=pending' },
                { label: 'อนุมัติแล้ว', value: stats?.approved ?? 0, bg: '#dcfce7', color: '#15803d', link: '/dashboard/listings?status=approved' },
                { label: 'ปฏิเสธ', value: stats?.rejected ?? 0, bg: '#fee2e2', color: '#b91c1c', link: '/dashboard/listings?status=rejected' },
              ].map(s => (
                <a key={s.label} href={s.link} style={{ display: 'block', background: s.bg, borderRadius: 12, padding: '16px 20px', textDecoration: 'none' }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: s.color, fontWeight: 500 }}>{s.label}</div>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
