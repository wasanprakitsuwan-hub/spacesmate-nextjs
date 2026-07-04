'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'

interface PropertyName {
  id:         string
  name_th:    string
  name_en:    string | null
  created_at: string
  updated_at: string | null
}

type CallerRole = 'admin' | 'super_admin'

async function getToken() {
  const { data: { session } } = await createBrowserClient().auth.getSession()
  return session?.access_token ?? ''
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}

// ── Add / Edit Form ───────────────────────────────────────────────────────────
function NameForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: PropertyName
  onSave: (nameTh: string, nameEn: string) => Promise<void>
  onCancel: () => void
}) {
  const [nameTh,  setNameTh]  = useState(initial?.name_th ?? '')
  const [nameEn,  setNameEn]  = useState(initial?.name_en ?? '')
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  async function submit() {
    if (!nameTh.trim()) { setError('กรุณากรอกชื่อภาษาไทย'); return }
    setSaving(true); setError('')
    try {
      await onSave(nameTh.trim(), nameEn.trim())
    } catch (e: any) { setError(e.message) }
    setSaving(false)
  }

  const inp = { width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13.5, boxSizing: 'border-box' as const, outline: 'none', fontFamily: 'inherit' }

  return (
    <div style={{ background: '#f8faf9', borderRadius: 14, padding: '18px 20px', border: '1.5px solid #048c73' }}>
      <h4 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#02402e' }}>
        {initial ? 'แก้ไขชื่ออสังหาริมทรัพย์' : 'เพิ่มชื่อใหม่'}
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>ชื่อภาษาไทย *</label>
          <input value={nameTh} onChange={e => setNameTh(e.target.value)} placeholder="เช่น บ้านไพรวัลย์" style={inp}
            onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>ชื่อภาษาอังกฤษ</label>
          <input value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="e.g. Baan Praiwan" style={inp}
            onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
        </div>
      </div>
      {error && <div style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: 12.5 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>ยกเลิก</button>
        <button onClick={submit} disabled={saving} style={{ padding: '8px 20px', borderRadius: 9, border: 'none', background: saving ? '#94a3b8' : '#02402e', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
          {saving ? 'กำลังบันทึก...' : <><span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 4 }}>save</span>{initial ? 'บันทึกการแก้ไข' : 'เพิ่มชื่อ'}</>}
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PropertyNamesPage() {
  const [names,       setNames]       = useState<PropertyName[]>([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [callerRole,  setCallerRole]  = useState<CallerRole>('admin')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId,   setEditingId]   = useState<string | null>(null)
  const [deletingId,  setDeletingId]  = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      try {
        const r = await fetch('/api/auth/role', { headers: { Authorization: `Bearer ${session.access_token}` } })
        const { role } = await r.json()
        setCallerRole(role === 'super_admin' ? 'super_admin' : 'admin')
      } catch { /* default admin */ }
    })
  }, [])

  async function load() {
    setLoading(true)
    try {
      const token = await getToken()
      const r = await fetch('/api/dashboard/property-names', { headers: { Authorization: `Bearer ${token}` } })
      const d = await r.json()
      setNames(d.names ?? [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleAdd(nameTh: string, nameEn: string) {
    const token = await getToken()
    const r = await fetch('/api/dashboard/property-names', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name_th: nameTh, name_en: nameEn }),
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error ?? 'Add failed')
    setShowAddForm(false)
    load()
  }

  async function handleEdit(nameTh: string, nameEn: string) {
    if (!editingId) return
    const token = await getToken()
    const r = await fetch('/api/dashboard/property-names', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: editingId, name_th: nameTh, name_en: nameEn }),
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error ?? 'Update failed')
    setEditingId(null)
    load()
  }

  async function handleDelete(id: string) {
    setDeleteError('')
    const token = await getToken()
    const r = await fetch(`/api/dashboard/property-names?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    const d = await r.json()
    if (!r.ok) { setDeleteError(d.error ?? 'Delete failed'); return }
    setDeletingId(null)
    load()
  }

  const filtered = names.filter(n => {
    if (!search) return true
    const q = search.toLowerCase()
    return n.name_th.toLowerCase().includes(q) || (n.name_en || '').toLowerCase().includes(q)
  })

  const editingName = editingId ? names.find(n => n.id === editingId) : undefined

  return (
    <div style={{ fontFamily: "'Prompt', -apple-system, sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 3px', color: '#02402e' }}>ชื่ออสังหาริมทรัพย์</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>คลังชื่อโครงการ — ใช้สำหรับ autocomplete ในแบบฟอร์มลงประกาศคอนโด</p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setEditingId(null) }}
          disabled={showAddForm}
          style={{
            padding: '10px 18px', borderRadius: 12, border: 'none',
            background: showAddForm ? '#94a3b8' : '#02402e', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: showAddForm ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>add</span>
          เพิ่มชื่อใหม่
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'ชื่อทั้งหมด', value: names.length, icon: 'domain', bg: '#e8f5f0', color: '#048c73' },
          { label: 'มีชื่อ EN', value: names.filter(n => n.name_en).length, icon: 'translate', bg: '#e0f2f9', color: '#0284c7' },
          { label: 'ไม่มีชื่อ EN', value: names.filter(n => !n.name_en).length, icon: 'warning', bg: '#fdf3e3', color: '#d97f11' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 12px -6px rgba(2,64,46,0.07)' }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="msym" style={{ fontSize: 20, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{k.icon}</span>
            </span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#02402e', lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 3 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div style={{ marginBottom: 16 }}>
          <NameForm onSave={handleAdd} onCancel={() => setShowAddForm(false)} />
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาชื่อโครงการ..."
          style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #eef0ef', fontSize: 13.5, outline: 'none', background: '#fff', fontFamily: 'inherit', boxSizing: 'border-box' }} />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 20px -12px rgba(2,64,46,0.08)' }}>
        {loading ? (
          <div style={{ padding: '64px', textAlign: 'center' }}>
            <div style={{ width: 28, height: 28, border: '3px solid #eef0ef', borderTopColor: '#048c73', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>กำลังโหลด...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center' }}>
            <span className="msym" style={{ fontSize: 48, color: '#c7d2d0', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>domain</span>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: '12px 0 0' }}>
              {search ? 'ไม่พบชื่อที่ตรงกับคำค้นหา' : 'ยังไม่มีชื่อในคลัง — เพิ่มชื่อแรกเลย'}
            </p>
          </div>
        ) : (
          <>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #eef0ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>แสดง {filtered.length} จาก {names.length} ชื่อ</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#f8faf9', borderBottom: '1px solid #eef0ef' }}>
                  {['#', 'ชื่อภาษาไทย', 'ชื่อภาษาอังกฤษ', 'เพิ่มเมื่อ', ''].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 11.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((n, i) => (
                  <tr key={n.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f4' : 'none', background: i % 2 === 0 ? '#fff' : '#fafffe' }}>
                    <td style={{ padding: '13px 16px', color: '#94a3b8', fontSize: 12 }}>{i + 1}</td>

                    {/* Edit inline */}
                    {editingId === n.id ? (
                      <td colSpan={3} style={{ padding: '10px 16px' }}>
                        <NameForm initial={n} onSave={handleEdit} onCancel={() => setEditingId(null)} />
                      </td>
                    ) : (
                      <>
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ fontWeight: 600, color: '#02402e', fontSize: 14 }}>{n.name_th}</div>
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          {n.name_en
                            ? <span style={{ color: '#0284c7', fontSize: 13 }}>{n.name_en}</span>
                            : <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>}
                        </td>
                        <td style={{ padding: '13px 16px', color: '#94a3b8', fontSize: 12 }}>{fmtDate(n.created_at)}</td>
                      </>
                    )}

                    {editingId !== n.id && (
                      <td style={{ padding: '13px 16px' }}>
                        {deletingId === n.id ? (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: '#dc2626' }}>ยืนยันลบ?</span>
                            <button onClick={() => handleDelete(n.id)} style={{ padding: '4px 12px', borderRadius: 7, border: 'none', background: '#dc2626', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>ลบ</button>
                            <button onClick={() => { setDeletingId(null); setDeleteError('') }} style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>ยกเลิก</button>
                            {deleteError && <span style={{ fontSize: 12, color: '#dc2626' }}>{deleteError}</span>}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => { setEditingId(n.id); setShowAddForm(false) }}
                              style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #048c73', background: '#eaf6f1', color: '#048c73', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                              <span className="msym" style={{ fontSize: 13, marginRight: 4 }}>edit</span>แก้ไข
                            </button>
                            {callerRole === 'super_admin' && (
                              <button onClick={() => setDeletingId(n.id)}
                                style={{ padding: '5px 9px', borderRadius: 7, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                                <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>delete</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 12.5, color: '#15803d', display: 'flex', gap: 8 }}>
        <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1", flexShrink: 0 }}>info</span>
        <span>ชื่อในคลังนี้จะปรากฏเป็น autocomplete เมื่อผู้ใช้กรอกชื่อโครงการในแบบฟอร์มลงประกาศคอนโด กรุณาเพิ่มทั้งชื่อไทยและอังกฤษเพื่อการค้นหาที่ดีขึ้น</span>
      </div>
    </div>
  )
}
