'use client'

// Revenue from Stripe (paid charges, net of refunds). Promotion codes and
// payouts are managed in the Stripe dashboard; the links below go there.
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { C } from '@/lib/ui'
import { PageHead, Section, Stat, Notice, Loading, th, td, Pill } from '@/components/admin/ui'

interface Revenue {
  currency: string
  thisMonth: { amount: number; count: number }
  lastMonth: { amount: number; count: number }
  recent: { id: string; amount: number; refunded: boolean; created: string; email: string | null; description: string | null; method: string | null }[]
}

const METHOD: Record<string, string> = { promptpay: 'พร้อมเพย์', card: 'บัตร' }

export default function RevenuePage() {
  const [data, setData]       = useState<Revenue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await createBrowserClient().auth.getSession()
        const r = await fetch('/api/dashboard/revenue', { headers: { Authorization: `Bearer ${session?.access_token}` } })
        const d = await r.json()
        if (!r.ok) throw new Error(d.error ?? `โหลดข้อมูลไม่สำเร็จ (${r.status})`)
        setData(d)
      } catch (e) { setError(e instanceof Error ? e.message : 'โหลดข้อมูลไม่สำเร็จ') }
      setLoading(false)
    })()
  }, [])

  const money = (n: number) => `฿${n.toLocaleString('th-TH', { maximumFractionDigits: 2 })}`
  const link = { color: C.teal, textDecoration: 'none', fontSize: 14 }

  return (
    <div>
      <PageHead title="รายได้" sub="ยอดชำระที่สำเร็จจาก Stripe หักยอดคืนเงินแล้ว นับตามเดือนเวลาไทย" actions={<>
        <a href="https://dashboard.stripe.com/payments" target="_blank" rel="noreferrer" style={link}>เปิด Stripe →</a>
        <a href="https://dashboard.stripe.com/coupons" target="_blank" rel="noreferrer" style={{ ...link, marginLeft: 16 }}>โค้ดส่วนลด →</a>
      </>} />

      {loading ? <Loading /> : error || !data ? <Notice tone="err">{error || 'โหลดข้อมูลไม่สำเร็จ'} · ไม่แสดงตัวเลขเมื่ออ่านข้อมูลไม่ได้</Notice> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, marginBottom: 16 }}>
            <Stat value={money(data.thisMonth.amount)} label="รายได้เดือนนี้" />
            <Stat value={data.thisMonth.count} label="จำนวนการชำระเดือนนี้" />
            <Stat value={money(data.lastMonth.amount)} label="รายได้เดือนที่แล้ว" />
            <Stat value={data.lastMonth.count} label="จำนวนการชำระเดือนที่แล้ว" />
          </div>

          <Section title="การชำระล่าสุด" pad={false}>
            {data.recent.length === 0 ? <p style={{ padding: 18, margin: 0, color: C.muted, fontSize: 14 }}>ยังไม่มีการชำระในสองเดือนนี้</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>{['วันที่', 'ลูกค้า', 'รายการ', 'ช่องทาง', 'ยอด'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {data.recent.map(p => (
                      <tr key={p.id}>
                        <td style={{ ...td, whiteSpace: 'nowrap', color: C.muted }}>{new Date(p.created).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                        <td style={td}>{p.email ?? '—'}</td>
                        <td style={{ ...td, color: C.muted }}>{p.description ?? '—'}</td>
                        <td style={{ ...td, color: C.muted }}>{p.method ? (METHOD[p.method] ?? p.method) : '—'}</td>
                        <td style={{ ...td, whiteSpace: 'nowrap', fontWeight: 600, color: C.green }}>{money(p.amount)}{p.refunded && <> <Pill tone="amber">คืนเงินบางส่วน</Pill></>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </>
      )}
    </div>
  )
}
