'use client'

import { useEffect, useState, useCallback } from 'react'
import { properties, Property } from '@/lib/property-data'

// ── Submission type (from form queue) ──────────────────────────────────────
interface Submission {
  id: string
  title: string
  type: string
  status: 'pending' | 'approved' | 'rejected'
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  address: string | null
  district: string | null
  province: string | null
  price: number | null
  bedrooms: number | null
  bathrooms: number | null
  size: number | null
  description: string | null
  created_at: string
  updated_at: string | null
}

const TYPE_LABELS: Record<string, string> = {
  Condo:      'คอนโด',
  Apartment:  'อพาร์ทเม้นท์',
  House:      'บ้าน',
  Office:     'ออฟฟิศ',
  Coworking:  'Co-space',
  'Co-Working': 'Co-space',
}

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Condo:      { bg: '#e0f2f9', color: '#0284c7' },
  Apartment:  { bg: '#e8f5f0', color: '#048c73' },
  House:      { bg: '#f3e8ff', color: '#9333ea' },
  Office:     { bg: '#fef9c3', color: '#a16207' },
  Coworking:  { bg: '#fee2e2', color: '#b91c1c' },
  'Co-Working': { bg: '#fee2e2', color: '#b91c1c' },
}

function TypeChip({ type }: { type: string }) {
  const tc = TYPE_COLORS[type] ?? { bg: '#f4f6f5', color: '#64748b' }
  return (
    <span style={{ fontSize: 11.5, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: tc.bg, color: tc.color, whiteSpace: 'nowrap' }}>
      {TYPE_LABELS[type] ?? type}
    </span>
  )
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pending:   { bg: '#fef9c3', color: '#a16207', label: 'รออนุมัติ' },
    approved:  { bg: '#dcfce7', color: '#15803d', label: 'อนุมัติแล้ว' },
    rejected:  { bg: '#fee2e2', color: '#b91c1c', label: 'ปฏิเสธ' },
    published: { bg: '#dcfce7', color: '#15803d', label: 'เผยแพร่แล้ว' },
  }
  const s = map[status] ?? map.pending
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

// ── Published listings tab (from property-data.ts) ──────────────────────────
function PublishedTab() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selected, setSelected] = useState<Property | null>(null)

  const displayed = properties.filter(p => {
    if (typeFilter && p.propertyType !== typeFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        p.title.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q)
      )
    }
    return true
  })

  const types = Array.from(new Set(properties.map(p => p.propertyType)))

  return (
    <div>
      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setTypeFilter('')} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, background: typeFilter === '' ? '#02402e' : '#f4f6f5', color: typeFilter === '' ? '#fff' : '#334155' }}>ทั้งหมด</button>
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, background: typeFilter === t ? '#02402e' : '#f4f6f5', color: typeFilter === t ? '#fff' : '#334155' }}>
              {TYPE_LABELS[t] ?? t}
            </button>
          ))}
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  ค้นหาชื่อ / ทำเล"
          style={{ flex: 1, minWidth: 200, padding: '7px 14px', borderRadius: 10, border: '1px solid #eef0ef', fontSize: 13, outline: 'none' }}
        />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 20px -12px rgba(2,64,46,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eef0ef' }}>
              {['ชื่อประกาศ', 'ประเภท', 'ทำเล', 'ราคา', 'ห้องนอน', 'สถานะ', ''].map(h => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < displayed.length - 1 ? '1px solid #f1f5f4' : 'none' }}>
                <td style={{ padding: '13px 16px', maxWidth: 280 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <img src={p.image} alt="" style={{ width: 44, height: 38, borderRadius: 8, objectFit: 'cover', flexShrink: 0, background: '#eef0ef' }} onError={e => (e.currentTarget.style.display = 'none')} />
                    <div>
                      <div style={{ fontWeight: 600, color: '#02402e', lineHeight: 1.3, fontSize: 13 }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '13px 16px' }}><TypeChip type={p.propertyType} /></td>
                <td style={{ padding: '13px 16px', color: '#64748b', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
                  {p.neighborhood}<br/><span style={{ fontSize: 11, color: '#b3bdb9' }}>{p.address}</span>
                </td>
                <td style={{ padding: '13px 16px', fontWeight: 700, color: '#02402e', whiteSpace: 'nowrap' }}>{p.priceDisplay}</td>
                <td style={{ padding: '13px 16px', color: '#64748b' }}>{p.bedrooms === 0 ? 'Studio' : `${p.bedrooms} ห้อง`}</td>
                <td style={{ padding: '13px 16px' }}><StatusChip status="published" /></td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setSelected(p)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #eef0ef', background: '#fff', color: '#02402e', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>รายละเอียด</button>
                    <a href={`/property/${p.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#e8f5f0', color: '#048c73', fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>↗ ดูหน้า</a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayed.length === 0 && <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>ไม่พบรายการ</div>}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }} onClick={() => setSelected(null)}>
          <div style={{ flex: 1 }} />
          <div style={{ width: 440, background: '#fff', boxShadow: '-8px 0 30px rgba(0,0,0,0.1)', padding: 28, overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0, color: '#02402e' }}>รายละเอียดประกาศ</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>
            <img src={selected.image} alt="" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 14, marginBottom: 18 }} />
            <StatusChip status="published" />
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'ชื่อประกาศ', value: selected.title },
                { label: 'ประเภท', value: TYPE_LABELS[selected.propertyType] ?? selected.propertyType },
                { label: 'ทำเล', value: selected.neighborhood },
                { label: 'ที่อยู่', value: selected.address },
                { label: 'ราคา', value: selected.priceDisplay },
                { label: 'ห้องนอน / ห้องน้ำ', value: `${selected.bedrooms === 0 ? 'Studio' : selected.bedrooms + ' ห้อง'} / ${selected.bathrooms} ห้อง` },
                { label: 'ขนาด', value: selected.size ? `${selected.size} ตร.ม.` : null },
              ].map(r => r.value ? (
                <div key={r.label}>
                  <div style={{ fontSize: 11.5, color: '#94a3b8', marginBottom: 2 }}>{r.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#02402e' }}>{r.value}</div>
                </div>
              ) : null)}
            </div>
            <a href={`/property/${selected.slug}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: 22, padding: '12px 0', borderRadius: 11, background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 14, textAlign: 'center', textDecoration: 'none' }}>
              ↗ ดูหน้าประกาศสด
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Submission queue tab (from Supabase submissions table) ──────────────────
function SubmissionsTab() {
  const [items, setItems] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selected, setSelected] = useState<Submission | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter) params.set('status', filter)
      const r = await fetch(`/api/dashboard/submissions?${params}`)
      const d = await r.json()
      setItems(d.data ?? d.submissions ?? [])
    } catch {}
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  async function updateStatus(id: string, status: string) {
    setActionLoading(id + status)
    await fetch(`/api/dashboard/submissions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    await load()
    setActionLoading(null)
  }

  const STATUS_OPTS = [
    { value: '', label: 'ทั้งหมด' },
    { value: 'pending', label: 'รออนุมัติ' },
    { value: 'approved', label: 'อนุมัติแล้ว' },
    { value: 'rejected', label: 'ปฏิเสธ' },
  ]

  return (
    <div>
      <div style={{ background: '#fff6e9', border: '1px solid #fed7aa', borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#92400e' }}>
        📬 นี่คือประกาศที่ส่งมาจากฟอร์ม <strong>/ลงประกาศ</strong> บนเว็บไซต์ — ต้องการอนุมัติก่อนเผยแพร่
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {STATUS_OPTS.map(o => (
          <button key={o.value} onClick={() => setFilter(o.value)} style={{
            padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 500,
            background: filter === o.value ? '#02402e' : '#f4f6f5', color: filter === o.value ? '#fff' : '#334155',
          }}>{o.label}</button>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ width: 28, height: 28, border: '3px solid #eef0ef', borderTopColor: '#048c73', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 10px' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            กำลังโหลด...
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '60px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: 6 }}>ยังไม่มีคำขอใหม่</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>เมื่อมีคนส่งประกาศผ่านเว็บไซต์ จะปรากฏที่นี่</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eef0ef' }}>
                {['ชื่อประกาศ', 'ประเภท', 'ทำเล', 'ราคา', 'ผู้ส่ง', 'วันที่', 'สถานะ', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} style={{ borderBottom: i < items.length - 1 ? '1px solid #f1f5f4' : 'none' }}>
                  <td style={{ padding: '12px 16px', maxWidth: 220 }}>
                    <div style={{ fontWeight: 600, color: '#02402e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title || '—'}</div>
                    {item.bedrooms != null && <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{item.bedrooms} นอน · {item.size ?? '—'} ตร.ม.</div>}
                  </td>
                  <td style={{ padding: '12px 16px' }}><TypeChip type={item.type} /></td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 12.5, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {[item.district, item.province].filter(Boolean).join(', ') || item.address || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#02402e', whiteSpace: 'nowrap' }}>
                    {item.price ? `฿${item.price.toLocaleString()}` : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500, color: '#334155', fontSize: 13 }}>{item.contact_name || '—'}</div>
                    <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{item.contact_email}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {new Date(item.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </td>
                  <td style={{ padding: '12px 16px' }}><StatusChip status={item.status} /></td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {item.status !== 'approved' && (
                        <button onClick={() => updateStatus(item.id, 'approved')} disabled={!!actionLoading} style={{ padding: '5px 10px', borderRadius: 7, border: 'none', background: '#02402e', color: '#fff', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>อนุมัติ</button>
                      )}
                      {item.status !== 'rejected' && (
                        <button onClick={() => updateStatus(item.id, 'rejected')} disabled={!!actionLoading} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #eef0ef', background: '#fff', color: '#b91c1c', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>ปฏิเสธ</button>
                      )}
                      <button onClick={() => setSelected(item)} style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid #eef0ef', background: '#fff', color: '#64748b', fontSize: 11.5, cursor: 'pointer' }}>ดู</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }} onClick={() => setSelected(null)}>
          <div style={{ flex: 1 }} />
          <div style={{ width: 420, background: '#fff', boxShadow: '-8px 0 30px rgba(0,0,0,0.1)', padding: 28, overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0, color: '#02402e' }}>คำขอประกาศ</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>
            <StatusChip status={selected.status} />
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'ชื่อประกาศ', value: selected.title },
                { label: 'ประเภท', value: TYPE_LABELS[selected.type] ?? selected.type },
                { label: 'ที่อยู่', value: selected.address },
                { label: 'เขต', value: selected.district },
                { label: 'จังหวัด', value: selected.province },
                { label: 'ราคา / เดือน', value: selected.price ? `฿${selected.price.toLocaleString()}` : null },
                { label: 'ห้องนอน', value: selected.bedrooms != null ? `${selected.bedrooms} ห้อง` : null },
                { label: 'ห้องน้ำ', value: selected.bathrooms != null ? `${selected.bathrooms} ห้อง` : null },
                { label: 'พื้นที่', value: selected.size != null ? `${selected.size} ตร.ม.` : null },
                { label: 'ผู้ส่ง', value: selected.contact_name },
                { label: 'อีเมล', value: selected.contact_email },
                { label: 'เบอร์โทร', value: selected.contact_phone },
                { label: 'วันที่ส่ง', value: new Date(selected.created_at).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
              ].map(row => row.value ? (
                <div key={row.label}>
                  <div style={{ fontSize: 11.5, color: '#94a3b8', marginBottom: 2 }}>{row.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#02402e' }}>{row.value}</div>
                </div>
              ) : null)}
            </div>
            <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
              {selected.status !== 'approved' && (
                <button onClick={() => { updateStatus(selected.id, 'approved'); setSelected(null) }} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>✓ อนุมัติ</button>
              )}
              {selected.status !== 'rejected' && (
                <button onClick={() => { updateStatus(selected.id, 'rejected'); setSelected(null) }} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid #eef0ef', background: '#fff', color: '#b91c1c', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>✕ ปฏิเสธ</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function ListingsPage() {
  const [tab, setTab] = useState<'published' | 'queue'>('published')

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 3px', color: '#02402e' }}>จัดการประกาศ</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>{properties.length} ประกาศเผยแพร่อยู่บนเว็บไซต์</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => setTab('published')} style={{
          padding: '9px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 600,
          background: tab === 'published' ? '#02402e' : '#f4f6f5', color: tab === 'published' ? '#fff' : '#64748b',
        }}>
          🏠 เผยแพร่แล้ว ({properties.length})
        </button>
        <button onClick={() => setTab('queue')} style={{
          padding: '9px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 600,
          background: tab === 'queue' ? '#02402e' : '#f4f6f5', color: tab === 'queue' ? '#fff' : '#64748b',
        }}>
          📬 คำขอใหม่จากฟอร์ม
        </button>
      </div>

      {tab === 'published' ? <PublishedTab /> : <SubmissionsTab />}
    </div>
  )
}
