'use client'

import { useEffect, useState, useCallback } from 'react'

interface Submission {
  id: string
  title: string
  type: string
  status: 'pending' | 'approved' | 'rejected'
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  // DB columns
  address: string | null
  district: string | null
  province: string | null
  price: number | null
  bedrooms: number | null
  bathrooms: number | null
  size: number | null       // DB uses 'size', not 'area'
  description: string | null
  amenities: string[] | null
  created_at: string
  updated_at: string | null
}

const TYPE_LABELS: Record<string, string> = {
  Condo:     'คอนโด',
  Apartment: 'อพาร์ทเม้นท์',
  House:     'บ้าน',
  Office:    'ออฟฟิศ',
  Coworking: 'Co-space',
}

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Condo:     { bg: '#e0f2f9', color: '#0284c7' },
  Apartment: { bg: '#e8f5f0', color: '#048c73' },
  House:     { bg: '#f3e8ff', color: '#9333ea' },
  Office:    { bg: '#fef9c3', color: '#a16207' },
  Coworking: { bg: '#fee2e2', color: '#b91c1c' },
}

const STATUS_OPTS = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'pending', label: 'รออนุมัติ' },
  { value: 'approved', label: 'อนุมัติแล้ว' },
  { value: 'rejected', label: 'ปฏิเสธ' },
]

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pending:  { bg: '#fef9c3', color: '#a16207', label: 'รออนุมัติ' },
    approved: { bg: '#dcfce7', color: '#15803d', label: 'อนุมัติแล้ว' },
    rejected: { bg: '#fee2e2', color: '#b91c1c', label: 'ปฏิเสธ' },
  }
  const s = map[status] ?? map.pending
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

export default function ListingsPage() {
  const [items, setItems] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [search, setSearch] = useState('')
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
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: status as any } : null)
    setActionLoading(null)
  }

  const displayed = items.filter(i => {
    if (typeFilter && i.type !== typeFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        (i.title || '').toLowerCase().includes(q) ||
        (i.contact_name || '').toLowerCase().includes(q) ||
        (i.contact_email || '').toLowerCase().includes(q) ||
        (i.address || '').toLowerCase().includes(q) ||
        (i.district || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 3px', color: '#02402e' }}>จัดการประกาศ</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>รวม {items.length} รายการ</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 14, padding: '14px 18px', marginBottom: 18, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUS_OPTS.map(o => (
            <button key={o.value} onClick={() => setFilter(o.value)} style={{
              padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all .15s',
              background: filter === o.value ? '#02402e' : '#f4f6f5',
              color: filter === o.value ? '#fff' : '#334155',
            }}>{o.label}</button>
          ))}
        </div>

        {/* Type filter */}
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{
          padding: '7px 12px', borderRadius: 10, border: '1px solid #eef0ef',
          fontSize: 13, background: '#fff', color: '#334155', cursor: 'pointer',
        }}>
          <option value="">ทุกประเภท</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        {/* Search */}
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  ค้นหาชื่อ / อีเมล / ทำเล"
          style={{ flex: 1, minWidth: 200, padding: '8px 14px', borderRadius: 10, border: '1px solid #eef0ef', fontSize: 13, outline: 'none' }}
        />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 20px -12px rgba(2,64,46,0.1)' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ width: 30, height: 30, border: '3px solid #eef0ef', borderTopColor: '#048c73', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 10px' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            กำลังโหลด...
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>ไม่พบรายการ</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eef0ef' }}>
                {['ชื่อประกาศ', 'ประเภท', 'ทำเล', 'ราคา / เดือน', 'ผู้ลงประกาศ', 'วันที่', 'สถานะ', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, letterSpacing: 0.3, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((item, i) => {
                const tc = TYPE_COLORS[item.type] ?? { bg: '#f4f6f5', color: '#64748b' }
                return (
                  <tr key={item.id} style={{ borderBottom: i < displayed.length - 1 ? '1px solid #f1f5f4' : 'none' }}>
                    <td style={{ padding: '13px 16px', maxWidth: 220 }}>
                      <div style={{ fontWeight: 600, color: '#02402e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title || '—'}</div>
                      {item.bedrooms != null && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{item.bedrooms} ห้องนอน · {item.size ?? '—'} ตร.ม.</div>}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: tc.bg, color: tc.color, whiteSpace: 'nowrap' }}>
                        {TYPE_LABELS[item.type] ?? item.type}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', color: '#64748b', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {[item.district, item.province].filter(Boolean).join(', ') || item.address || '—'}
                    </td>
                    <td style={{ padding: '13px 16px', fontWeight: 600, color: '#02402e', whiteSpace: 'nowrap' }}>
                      {item.price ? `฿${item.price.toLocaleString()}` : '—'}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ fontWeight: 500, color: '#334155' }}>{item.contact_name || '—'}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>{item.contact_email || ''}</div>
                    </td>
                    <td style={{ padding: '13px 16px', color: '#94a3b8', whiteSpace: 'nowrap', fontSize: 12.5 }}>
                      {new Date(item.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <StatusChip status={item.status} />
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {item.status !== 'approved' && (
                          <button
                            onClick={() => updateStatus(item.id, 'approved')}
                            disabled={actionLoading === item.id + 'approved'}
                            style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#02402e', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: actionLoading === item.id + 'approved' ? 0.6 : 1 }}
                          >อนุมัติ</button>
                        )}
                        {item.status !== 'rejected' && (
                          <button
                            onClick={() => updateStatus(item.id, 'rejected')}
                            disabled={actionLoading === item.id + 'rejected'}
                            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #eef0ef', background: '#fff', color: '#b91c1c', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: actionLoading === item.id + 'rejected' ? 0.6 : 1 }}
                          >ปฏิเสธ</button>
                        )}
                        <button
                          onClick={() => setSelected(item)}
                          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #eef0ef', background: '#fff', color: '#64748b', fontSize: 12, cursor: 'pointer' }}
                        >รายละเอียด</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }} onClick={() => setSelected(null)}>
          <div style={{ flex: 1 }} />
          <div
            style={{ width: 420, background: '#fff', boxShadow: '-8px 0 30px rgba(0,0,0,0.1)', padding: 28, overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0, color: '#02402e' }}>รายละเอียดประกาศ</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <StatusChip status={selected.status} />
            </div>

            {[
              { label: 'ชื่อประกาศ', value: selected.title },
              { label: 'ประเภท', value: TYPE_LABELS[selected.type] ?? selected.type },
              { label: 'ที่อยู่', value: selected.address },
              { label: 'เขต / แขวง', value: selected.district },
              { label: 'จังหวัด', value: selected.province },
              { label: 'ราคา / เดือน', value: selected.price ? `฿${selected.price.toLocaleString()}` : null },
              { label: 'ห้องนอน', value: selected.bedrooms != null ? `${selected.bedrooms} ห้อง` : null },
              { label: 'ห้องน้ำ', value: selected.bathrooms != null ? `${selected.bathrooms} ห้อง` : null },
              { label: 'พื้นที่', value: selected.size != null ? `${selected.size} ตร.ม.` : null },
              { label: 'ผู้ลงประกาศ', value: selected.contact_name },
              { label: 'อีเมล', value: selected.contact_email },
              { label: 'เบอร์โทร', value: selected.contact_phone },
              { label: 'วันที่ส่ง', value: new Date(selected.created_at).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
            ].map(row => row.value ? (
              <div key={row.label} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11.5, color: '#94a3b8', marginBottom: 3 }}>{row.label}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#02402e' }}>{row.value}</div>
              </div>
            ) : null)}

            <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
              {selected.status !== 'approved' && (
                <button
                  onClick={() => { updateStatus(selected.id, 'approved'); setSelected(null) }}
                  style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                >✓ อนุมัติ</button>
              )}
              {selected.status !== 'rejected' && (
                <button
                  onClick={() => { updateStatus(selected.id, 'rejected'); setSelected(null) }}
                  style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid #eef0ef', background: '#fff', color: '#b91c1c', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                >✕ ปฏิเสธ</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
