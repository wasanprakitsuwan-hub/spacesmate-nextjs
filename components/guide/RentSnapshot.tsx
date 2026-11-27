import Link from 'next/link'
import { loadRentSnapshot } from '@/lib/rent-pages'
import { OWNER_GUIDE_UI as t } from '@/lib/owner-guides'
import { C, RADIUS } from '@/lib/ui'

const CHIP: Record<string, { bg: string; fg: string }> = {
  BTS: { bg: C.bts, fg: '#10300a' },
  MRT: { bg: C.mrt, fg: '#ffffff' },
  ARL: { bg: '#8a1538', fg: '#ffffff' },
  SRT: { bg: '#b5121b', fg: '#ffffff' },
}

/**
 * Median asking rent by station, from live SpacesMate listings: the one table
 * in the owner guides no other site can copy. Server component; the guide page
 * revalidates hourly like the rent pages it links to.
 */
export default async function RentSnapshot() {
  const rows = await loadRentSnapshot(8)
  return (
    <div style={{ marginTop: 18 }}>
      <p style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 600, color: C.green }}>{t.rentTitle}</p>
      {rows.length === 0 ? (
        <p style={{ margin: 0, fontSize: 14.5, color: C.muted, lineHeight: 1.6 }}>
          {t.rentEmpty} <Link href="/search" style={{ color: C.teal, textDecoration: 'none' }}>{t.rentSearch} →</Link>
        </p>
      ) : (
        <>
          <div style={{ overflowX: 'auto', border: `1px solid ${C.line}`, borderRadius: RADIUS }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14.5, minWidth: 480 }}>
              <thead>
                <tr style={{ background: C.paper, textAlign: 'left' }}>
                  <th scope="col" style={th}>{t.rentStation}</th>
                  <th scope="col" style={th}>{t.rentType}</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>{t.rentMedian}</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>{t.rentCount}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  // The place label starts with its systems ("BTS/MRT อโศก"); chips replace that prefix.
                  const label = r.place.replace(/^[A-Z/]+\s+/, '')
                  return (
                    <tr key={r.path} style={{ borderTop: `1px solid ${C.line2}` }}>
                      <td style={td}>
                        <Link href={r.path} style={{ color: C.ink, textDecoration: 'none' }}>
                          {r.systems.map(sys => {
                            const chip = CHIP[sys] ?? { bg: C.line, fg: C.ink }
                            return <span key={sys} style={{ display: 'inline-block', padding: '1px 7px', borderRadius: 4, background: chip.bg, color: chip.fg, fontSize: 12, fontWeight: 600, marginRight: 6 }}>{sys}</span>
                          })}
                          {label}
                        </Link>
                      </td>
                      <td style={td}>{t.typeName[r.type] ?? r.type}</td>
                      <td style={{ ...td, textAlign: 'right', color: C.amber, fontWeight: 500 }}>฿{r.median.toLocaleString('en-US')}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{r.count}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: C.muted, lineHeight: 1.55 }}>{t.rentNote}</p>
        </>
      )}
    </div>
  )
}

const th: React.CSSProperties = { padding: '10px 14px', fontWeight: 600, color: C.muted, fontSize: 13.5 }
const td: React.CSSProperties = { padding: '10px 14px', color: C.ink }
