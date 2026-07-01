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
  location: string | null
  created_at: string
}

const TYPE_LABELS: Record<string, string> = {
  Condo:     'คอนโด',
  Apartment: 'อพาร์ทเม้นท์',
  House:     'บ้าน',
  Office:    'ออฟฟิศ',
  Coworking: 'Co-space',
}

const COLS = [
  { status: 'pending',  label: 'รออนุมัติ',    color: '#a16207', bg: '#fef9c3', dot: '#d97f11' },
  { status: 'approved', label: 'อนุมัติแล้ว', color: '#15803d', bg: '#dcfce7', dot: '#22c55e' },
  { status: 'rejected', label: 'ปฏิเสธ',       color: '#b91c1c', bg: '#fee2e2', dot: '#ef4444' },
]

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function EnquiriesPage() {
  const [items, setItems] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/dashboard/submissions')
      const d = await r.json()
      setItems(d.data ?? d.submissions ?? [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function move(id: string, status: string) {
    setActionLoading(id)
    await fetch(`/api/dashboard/submissions/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    })
    await load()
    setActionLoading(null)
  }

  const byStatus = (status: string) => items.filter(i => i.status === status)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 3px', color: '#02402e' }}>คำขอรับบริการ</h1>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>จัดการสถานะประกาศแบบ Kanban</p>
      </div>

      {loading ? (
        <div style={{ padding: 80, textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ width: 30, height: 30, border: '3px solid #eef0ef', borderTopColor: '#048c73', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 12px' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          กำลังโหลด...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, alignItems: 'start' }}>
          {COLS.map(col => (
            <div key={col.status}>
              {/* Column header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: col.dot, display: 'inline-block' }} />
                <span style={{ fontWeight: 600, fontSize: 14, color: '#02402e' }}>{col.label}</span>
                <span style={{
                  marginLeft: 'auto', fontSize: 11.5, fontWeight: 700,
                  padding: '3px 9px', borderRadius: 20, background: col.bg, color: col.color,
                }}>{byStatus(col.status).length}</span>
              </div>

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 100 }}>
                {byStatus(col.status).length === 0 && (
                  <div style={{ background: '#f8fafc', border: '2px dashed #eef0ef', borderRadius: 14, padding: '28px 20px', textAlign: 'center', color: '#b3bdb9', fontSize: 13 }}>
                    ไม่มีรายการ
                  </div>
                )}
                {byStatus(col.status).map(item => (
                  <div key={item.id} style={{
                    background: '#fff', border: '1px solid #eef0ef', borderRadius: 14,
                    padding: '14px 16px', boxShadow: '0 2px 12px -6px rgba(2,64,46,0.08)',
                    opacity: actionLoading === item.id ? 0.6 : 1, transition: 'opacity .2s',
                  }}>
                    {/* Card header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: '#02402e', flex: 1, marginRight: 8, lineHeight: 1.35 }}>
                        {item.title || '—'}
                      </div>
                      <span style={{ fontSize: 10.5, color: '#94a3b8', flexShrink: 0 }}>{timeAgo(item.created_at)}</span>
                    </div>

                    {/* Type + location */}
                    <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 10 }}>
                      {TYPE_LABELS[item.type] ?? item.type}
                      {item.location && ` · ${item.location}`}
                    </div>

                    {/* Contact */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: '50%', background: '#e8f5f0',
                        color: '#048c73', fontSize: 11, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {(item.contact_name || item.contact_email || '?').charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: '#334155' }}>{item.contact_name || '—'}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.contact_email}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      {col.status !== 'approved' && (
                        <button
                          onClick={() => move(item.id, 'approved')}
                          disabled={!!actionLoading}
                          style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: 'none', background: '#02402e', color: '#fff', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}
                        >อนุมัติ</button>
                      )}
                      {col.status !== 'pending' && (
                        <button
                          onClick={() => move(item.id, 'pending')}
                          disabled={!!actionLoading}
                          style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: '1px solid #eef0ef', background: '#fff', color: '#a16207', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}
                        >รออนุมัติ</button>
                      )}
                      {col.status !== 'rejected' && (
                        <button
                          onClick={() => move(item.id, 'rejected')}
                          disabled={!!actionLoading}
                          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #eef0ef', background: '#fff', color: '#b91c1c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        ><span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>close</span></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
