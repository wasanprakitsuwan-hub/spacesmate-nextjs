'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { C, RADIUS, btnStyle } from '@/lib/ui'
import { PageHead, Section, Pill, Loading } from '@/components/admin/ui'

interface StatsData {
  activeListings: number
  listingsByType: Record<string, number>
  uniqueUsers: number
  expiringSoon: number
  newThisMonth: number
  recentListings: Array<{
    id: string
    slug: string | null
    title_th: string | null
    property_type: string | null
    listing_status: string | null
    expires_at: string | null
    created_at: string
  }>
}

// Keys are the stored property_type values. These used to be capitalised
// while the recent list passed raw values through, so it printed "apartment".
const TYPE_LABELS: Record<string, string> = {
  condo:     'คอนโดมิเนียม',
  apartment: 'อพาร์ทเม้นท์',
  house:     'บ้าน',
  office:    'ออฟฟิศ',
  coworking: 'Co-Working',
}

const ALL_TYPES = ['condo', 'apartment', 'house', 'office', 'coworking']

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} นาทีที่แล้ว`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`
  const days = Math.floor(hrs / 24)
  return `${days} วันที่แล้ว`
}

/** Same states as จัดการประกาศ, so a listing reads the same on both screens. */
function stateOf(p: StatsData['recentListings'][number], now: number): { tone: 'amber' | 'green' | 'red'; label: string } {
  const exp = p.expires_at ? new Date(p.expires_at).getTime() : null
  if (p.listing_status === 'expired' || (exp !== null && exp < now)) return { tone: 'red', label: 'หมดอายุ' }
  if (p.listing_status === 'draft') return { tone: 'amber', label: 'ฉบับร่าง' }
  if (p.listing_status !== 'active') return { tone: 'amber', label: 'ซ่อนอยู่' }
  return { tone: 'green', label: 'เผยแพร่' }
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
    { label: 'ใกล้หมดอายุ (7 วัน)',   value: stats?.expiringSoon ?? 0,   href: '/dashboard/listings' },
    { label: 'ประกาศใหม่เดือนนี้',      value: stats?.newThisMonth ?? 0,   href: '/dashboard/listings' },
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
              {/* This total must be the one the bars are drawn from. */}
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
              {(stats?.recentListings ?? []).length === 0 ? (
                <p style={{ color: C.muted, fontSize: 14, margin: 0, padding: 18 }}>ยังไม่มีประกาศ</p>
              ) : (stats?.recentListings ?? []).map(item => {
                const s = stateOf(item, Date.now())
                return (
                  <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 18px', borderBottom: `1px solid ${C.line2}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, color: C.green, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title_th || '—'}</div>
                      <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{TYPE_LABELS[item.property_type ?? ''] ?? item.property_type ?? '—'} · {timeAgo(item.created_at)}</div>
                    </div>
                    <Pill tone={s.tone}>{s.label}</Pill>
                  </div>
                )
              })}
            </Section>
          </div>

          <style>{`@media (max-width: 900px) { .sm-ov-2col { grid-template-columns: 1fr !important; } }`}</style>
        </>
      )}
    </div>
  )
}
