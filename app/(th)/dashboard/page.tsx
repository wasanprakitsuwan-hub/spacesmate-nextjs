'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { C, RADIUS, btnStyle } from '@/lib/ui'
import { PageHead, Section, Pill, Loading } from '@/components/admin/ui'

interface StatsData {
  activeListings: number
  listingsByType: Record<string, number>
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

const STATUS_COLORS: Record<string, { tone: 'amber' | 'green' | 'red'; label: string }> = {
  pending:  { tone: 'amber', label: 'รออนุมัติ' },
  approved: { tone: 'green', label: 'อนุมัติแล้ว' },
  rejected: { tone: 'red',   label: 'ปฏิเสธ' },
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        // /api/dashboard/stats is behind requireAdmin. This call previously sent
        // no Authorization header at all, so it was answered with 401 every
        // time — and because the old code never checked r.ok, the error body
        // was set as `stats`, every field came back undefined, and `?? 0`
        // painted a confident wall of zeros. The dashboard was not wrong about
        // the data; it was never allowed to read any.
        const { data: { session } } = await createBrowserClient().auth.getSession()
        if (!session) { setError('เซสชันหมดอายุ — กรุณาเข้าสู่ระบบใหม่'); setLoading(false); return }

        const r = await fetch('/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        const d = await r.json()

        // Never render a number we did not actually receive. A dashboard that
        // shows 0 when it means "I don't know" is worse than one that shows
        // nothing, because 0 is a fact people act on.
        if (!r.ok) throw new Error(d?.error || `โหลดข้อมูลไม่สำเร็จ (${r.status})`)
        setStats(d)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'โหลดข้อมูลไม่สำเร็จ')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const now = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  // Live counts from the database. This previously read a hardcoded demo array,
  // which meant every number on this screen was fiction.
  const byType: Record<string, number> = stats?.listingsByType ?? {}
  const maxTypeCount = Math.max(...ALL_TYPES.map(t => byType[t] ?? 0), 1)

  const kpis = [
    { label: 'ประกาศที่เผยแพร่อยู่', value: stats?.activeListings ?? 0, href: '/dashboard/listings' },
    { label: 'เจ้าของที่มีประกาศ',   value: stats?.uniqueUsers ?? 0,    href: '/dashboard/users' },
    { label: 'คำขอรอตรวจสอบ',       value: stats?.pending ?? 0,        href: '/dashboard/listings?status=pending' },
    { label: 'คำขอเดือนนี้',          value: stats?.thisMonth ?? 0,      href: '/dashboard/listings' },
  ]
  const box: React.CSSProperties = { background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS }

  return (
    <div>
      <PageHead title="ภาพรวมระบบ" sub={`อัปเดตล่าสุด ${now}`} />

      {loading ? <Loading /> : error ? (
        <div style={{ ...box, padding: '28px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 15, color: '#b42318', fontWeight: 500, margin: '0 0 4px' }}>{error}</p>
          <p style={{ fontSize: 13, color: C.muted, margin: '0 0 16px' }}>ไม่แสดงตัวเลขเมื่ออ่านข้อมูลไม่ได้ เพราะเลข 0 ที่ไม่ใช่ของจริงอันตรายกว่าไม่แสดงเลย</p>
          <button onClick={() => location.reload()} className="sm-btn-primary" style={btnStyle('primary')}>ลองใหม่</button>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, marginBottom: 16 }}>
            {kpis.map(k => (
              <a key={k.label} href={k.href} className="sm-card" style={{ ...box, padding: '16px 18px', textDecoration: 'none', display: 'block' }}>
                <div style={{ fontSize: 28, fontWeight: 600, color: C.green, lineHeight: 1.2 }}>{k.value}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{k.label}</div>
              </a>
            ))}
          </div>

          <div className="sm-ov-2col" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16, marginBottom: 16 }}>
            <Section title="ประกาศตามประเภท" aside={<span style={{ fontSize: 13, color: C.muted }}>รวม {stats?.activeListings ?? 0} รายการ</span>}>
              {/* This total must be the one the bars are drawn from (live listings, not the submissions queue). */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {ALL_TYPES.map(t => {
                  const count = byType[t] ?? 0
                  const pct = maxTypeCount > 0 ? (count / maxTypeCount) * 100 : 0
                  return (
                    <div key={t}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 14 }}>
                        <span style={{ color: C.ink }}>{TYPE_LABELS[t] ?? t}</span>
                        <span style={{ color: C.green, fontWeight: 600 }}>{count}</span>
                      </div>
                      <div style={{ height: 8, background: C.paper, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: C.teal, borderRadius: 4 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Section>

            <Section title="ประกาศล่าสุด" pad={false}>
              {(stats?.recentActivity ?? []).length === 0 ? (
                <p style={{ color: C.muted, fontSize: 14, margin: 0, padding: 18 }}>ยังไม่มีประกาศ</p>
              ) : (stats?.recentActivity ?? []).slice(0, 6).map(item => {
                const s = STATUS_COLORS[item.status] ?? STATUS_COLORS.pending
                return (
                  <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 18px', borderBottom: `1px solid ${C.line2}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, color: C.green, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title || '—'}</div>
                      <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{TYPE_LABELS[item.type] ?? item.type} · {timeAgo(item.created_at)}</div>
                    </div>
                    <Pill tone={s.tone}>{s.label}</Pill>
                  </div>
                )
              })}
            </Section>
          </div>

          <Section title="คิวคำขอจากฟอร์มลงประกาศ">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
              {[
                { label: 'รออนุมัติ',   value: stats?.pending ?? 0,  link: '/dashboard/listings?status=pending' },
                { label: 'อนุมัติแล้ว', value: stats?.approved ?? 0, link: '/dashboard/listings?status=approved' },
                { label: 'ปฏิเสธ',     value: stats?.rejected ?? 0, link: '/dashboard/listings?status=rejected' },
              ].map(s => (
                <a key={s.label} href={s.link} className="sm-card" style={{ display: 'block', border: `1px solid ${C.line}`, borderRadius: RADIUS, padding: '14px 16px', textDecoration: 'none' }}>
                  <div style={{ fontSize: 24, fontWeight: 600, color: C.green }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>{s.label}</div>
                </a>
              ))}
            </div>
          </Section>
          <style>{`@media (max-width: 900px) { .sm-ov-2col { grid-template-columns: 1fr !important; } }`}</style>
        </>
      )}
    </div>
  )
}
