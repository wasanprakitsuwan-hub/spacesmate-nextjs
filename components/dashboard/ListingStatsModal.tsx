'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import type { DashStrings } from '@/lib/dashboard-i18n'

type Counts = { views: number; line: number; phone: number }
type Stats = { totals: { d7: Counts; d30: Counts; all: Counts }; daily: ({ day: string } & Counts)[] }

/** One listing's views and contact taps — the dashboard's Stats button. */
export default function ListingStatsModal({ listingId, title, t, onClose }: {
  listingId: string
  title: string
  t: DashStrings
  onClose: () => void
}) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const { data: { session } } = await createBrowserClient().auth.getSession()
        const r = await fetch(`/api/owner/listings/stats?id=${encodeURIComponent(listingId)}`, {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        })
        if (!r.ok) throw new Error()
        setStats(await r.json())
      } catch { setError(true) }
    })()
  }, [listingId])

  const max = Math.max(1, ...(stats?.daily.map(d => d.views) ?? [0]))
  const periods: { key: keyof Stats['totals']; label: string }[] = [
    { key: 'd7', label: t.last7 }, { key: 'd30', label: t.last30 }, { key: 'all', label: t.allTime },
  ]

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, padding: 24, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px -10px rgba(0,0,0,0.25)' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#02402e' }}>{t.statsTitle}</h3>
        <p style={{ margin: '2px 0 18px', fontSize: 12.5, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>

        {error ? (
          <p style={{ color: '#b91c1c', fontSize: 13.5 }}>{t.statsFailed}</p>
        ) : !stats ? (
          <p style={{ color: '#94a3b8', fontSize: 13.5 }}>{t.loading}</p>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, marginBottom: 18 }}>
              <thead>
                <tr style={{ color: '#94a3b8', fontSize: 12 }}>
                  <th />
                  {periods.map(p => <th key={p.key} style={{ textAlign: 'right', fontWeight: 600, padding: '4px 0' }}>{p.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {([['views', t.statViews], ['line', t.statLine], ['phone', t.statPhone]] as const).map(([k, label]) => (
                  <tr key={k} style={{ borderTop: '1px solid #f1f5f4' }}>
                    <td style={{ padding: '8px 0', color: '#475569' }}>{label}</td>
                    {periods.map(p => (
                      <td key={p.key} style={{ textAlign: 'right', fontWeight: 700, color: '#02402e' }}>{stats.totals[p.key][k].toLocaleString()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: '#64748b' }}>{t.viewsPerDay}</p>
            <svg viewBox="0 0 300 80" width="100%" height="80" role="img" aria-label={t.viewsPerDay} style={{ display: 'block' }}>
              {stats.daily.map((d, i) => {
                const h = (d.views / max) * 72
                return (
                  <rect key={d.day} x={i * 10 + 1} y={78 - h} width={8} height={Math.max(h, d.views ? 2 : 0.5)} rx={1.5}
                    fill={d.views ? '#048c73' : '#e2e8f0'}>
                    <title>{`${d.day}: ${d.views}`}</title>
                  </rect>
                )
              })}
            </svg>
            <p style={{ margin: '12px 0 0', fontSize: 11.5, color: '#94a3b8', lineHeight: 1.5 }}>{t.statsNote}</p>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{t.close}</button>
        </div>
      </div>
    </div>
  )
}
