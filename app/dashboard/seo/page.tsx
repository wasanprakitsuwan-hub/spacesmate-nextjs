'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'

interface SeoPage {
  id:               string
  slug:             string
  title_th:         string | null
  title_en:         string | null
  meta_description: string | null
  area_type:        string
  status:           string
  has_content:      boolean
  page_score:       number | null
  notes:            string | null
  created_at:       string
  updated_at:       string | null
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string; icon: string }> = {
  planned:      { bg: '#f1f5f9', color: '#64748b', label: 'วางแผน',     icon: 'schedule' },
  built:        { bg: '#e0f2fe', color: '#0284c7', label: 'สร้างแล้ว',  icon: 'build' },
  published:    { bg: '#dcfce7', color: '#15803d', label: 'เผยแพร่แล้ว',icon: 'public' },
  needs_update: { bg: '#fef9c3', color: '#a16207', label: 'ต้องอัปเดต', icon: 'update' },
}

const AREA_TYPE_LABEL: Record<string, string> = {
  bts:        'BTS',
  mrt:        'MRT',
  district:   'เขต/ย่าน',
  university: 'มหาวิทยาลัย',
  zone:       'โซน',
}

async function getToken() {
  const { data: { session } } = await createBrowserClient().auth.getSession()
  return session?.access_token ?? ''
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>
  const color = score >= 80 ? '#15803d' : score >= 50 ? '#a16207' : '#dc2626'
  const bg    = score >= 80 ? '#dcfce7' : score >= 50 ? '#fef9c3' : '#fee2e2'
  return (
    <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 8, background: bg, color }}>
      {score}/100
    </span>
  )
}

// ── Edit Drawer ───────────────────────────────────────────────────────────────
function EditDrawer({ page, onClose, onSaved }: { page: SeoPage; onClose: () => void; onSaved: () => void }) {
  const [status,      setStatus]      = useState(page.status)
  const [titleTh,     setTitleTh]     = useState(page.title_th ?? '')
  const [titleEn,     setTitleEn]     = useState(page.title_en ?? '')
  const [metaDesc,    setMetaDesc]    = useState(page.meta_description ?? '')
  const [hasContent,  setHasContent]  = useState(page.has_content)
  const [pageScore,   setPageScore]   = useState<string>(page.page_score?.toString() ?? '')
  const [notes,       setNotes]       = useState(page.notes ?? '')
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  async function save() {
    setSaving(true); setError('')
    try {
      const token = await getToken()
      const r = await fetch('/api/dashboard/seo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id: page.id, status, title_th: titleTh.trim() || null, title_en: titleEn.trim() || null,
          meta_description: metaDesc.trim() || null, has_content: hasContent,
          page_score: pageScore ? parseInt(pageScore) : null, notes: notes.trim() || null,
        }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error ?? 'Save failed')
      onSaved(); onClose()
    } catch (e: any) { setError(e.message) }
    setSaving(false)
  }

  const inp = { width: '100%', padding: '13px 16px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 16, boxSizing: 'border-box' as const, outline: 'none', fontFamily: 'inherit' }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(2,64,46,0.25)', zIndex: 100, backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 680, background: '#fff', zIndex: 101, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 40px rgba(2,64,46,0.15)', fontFamily: "'Prompt', -apple-system, sans-serif" }}>
        <div style={{ padding: '22px 24px', borderBottom: '1px solid #eef0ef', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#02402e' }}>แก้ไข SEO Page</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8', fontFamily: 'monospace' }}>/{page.slug}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94a3b8', padding: 4 }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Status */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>สถานะ</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {Object.entries(STATUS_STYLE).map(([key, s]) => (
                <button key={key} onClick={() => setStatus(key)} style={{
                  padding: '10px 18px', borderRadius: 9, border: `1.5px solid ${status === key ? s.color : '#e2e8f0'}`,
                  background: status === key ? s.bg : '#fff', color: status === key ? s.color : '#64748b',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  <span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 4 }}>{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Titles */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Title (TH)</label>
            <input value={titleTh} onChange={e => setTitleTh(e.target.value)} placeholder="คอนโดให้เช่า BTS อโศก" style={inp}
              onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Title (EN)</label>
            <input value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="Condo for Rent BTS Asok" style={inp}
              onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
          </div>

          {/* Meta */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
              Meta Description <span style={{ color: metaDesc.length > 160 ? '#dc2626' : '#94a3b8', fontWeight: 400 }}>({metaDesc.length}/160)</span>
            </label>
            <textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value)} rows={3}
              placeholder="คอนโดให้เช่าใกล้ BTS อโศก ราคาถูก ทำเลดี..."
              style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }}
              onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
          </div>

          {/* Content + Score */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 15, color: '#02402e', fontWeight: 500 }}>
                <input type="checkbox" checked={hasContent} onChange={e => setHasContent(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer' }} />
                มีเนื้อหา (content)
              </label>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Page Score (0–100)</label>
              <input type="number" min={0} max={100} value={pageScore} onChange={e => setPageScore(e.target.value)} placeholder="—" style={{ ...inp, width: '100%' }}
                onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>หมายเหตุ</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="บันทึกเพิ่มเติม..."
              style={{ ...inp, resize: 'vertical' }}
              onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
          </div>

          {error && <div style={{ padding: '10px 13px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>{error}</div>}
        </div>

        <div style={{ padding: '18px 28px', borderTop: '1px solid #eef0ef', display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: 11, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>ยกเลิก</button>
          <button onClick={save} disabled={saving} style={{ flex: 2, padding: '14px', borderRadius: 11, border: 'none', background: saving ? '#94a3b8' : '#02402e', color: '#fff', fontSize: 15, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {saving ? 'กำลังบันทึก...' : <><span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 6 }}>save</span>บันทึก</>}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Add Drawer ────────────────────────────────────────────────────────────────
function AddDrawer({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [slug,     setSlug]     = useState('')
  const [titleTh,  setTitleTh]  = useState('')
  const [titleEn,  setTitleEn]  = useState('')
  const [areaType, setAreaType] = useState('bts')
  const [status,   setStatus]   = useState('planned')
  const [notes,    setNotes]    = useState('')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')

  async function create() {
    setSaving(true); setError('')
    try {
      const token = await getToken()
      const r = await fetch('/api/dashboard/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slug: slug.trim(), title_th: titleTh.trim() || null, title_en: titleEn.trim() || null, area_type: areaType, status, notes: notes.trim() || null }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error ?? 'Create failed')
      onSaved(); onClose()
    } catch (e: any) { setError(e.message) }
    setSaving(false)
  }

  const inp = { width: '100%', padding: '13px 16px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 16, boxSizing: 'border-box' as const, outline: 'none', fontFamily: 'inherit' }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(2,64,46,0.25)', zIndex: 100, backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 680, background: '#fff', zIndex: 101, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 40px rgba(2,64,46,0.15)', fontFamily: "'Prompt', -apple-system, sans-serif" }}>
        <div style={{ padding: '22px 24px', borderBottom: '1px solid #eef0ef', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#02402e' }}>เพิ่มหน้า SEO ใหม่</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>กรอก slug และข้อมูลเบื้องต้น</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94a3b8', padding: 4 }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Slug */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
              Slug (URL) <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#94a3b8', pointerEvents: 'none' }}>/</span>
              <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="condo-for-rent-bts-nana"
                style={{ ...inp, paddingLeft: 24 }}
                onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#94a3b8' }}>ใช้ตัวพิมพ์เล็ก, ตัวเลข และ - เท่านั้น</p>
          </div>

          {/* Area type */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>ประเภทพื้นที่</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.entries(AREA_TYPE_LABEL).map(([key, label]) => (
                <button key={key} onClick={() => setAreaType(key)} style={{
                  padding: '10px 18px', borderRadius: 9, border: `1.5px solid ${areaType === key ? '#02402e' : '#e2e8f0'}`,
                  background: areaType === key ? '#02402e' : '#fff', color: areaType === key ? '#fff' : '#64748b',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>{label}</button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>สถานะเริ่มต้น</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {Object.entries(STATUS_STYLE).map(([key, s]) => (
                <button key={key} onClick={() => setStatus(key)} style={{
                  padding: '10px 18px', borderRadius: 9, border: `1.5px solid ${status === key ? s.color : '#e2e8f0'}`,
                  background: status === key ? s.bg : '#fff', color: status === key ? s.color : '#64748b',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  <span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 4 }}>{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Titles */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Title (TH)</label>
            <input value={titleTh} onChange={e => setTitleTh(e.target.value)} placeholder="คอนโดให้เช่า BTS นานา" style={inp}
              onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Title (EN)</label>
            <input value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="Condo for Rent BTS Nana" style={inp}
              onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>หมายเหตุ</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="บันทึกเพิ่มเติม..."
              style={{ ...inp, resize: 'vertical' }}
              onFocus={e => (e.target.style.borderColor = '#048c73')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
          </div>

          {error && <div style={{ padding: '10px 13px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>{error}</div>}
        </div>

        <div style={{ padding: '18px 28px', borderTop: '1px solid #eef0ef', display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: 11, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>ยกเลิก</button>
          <button onClick={create} disabled={saving || !slug.trim()} style={{ flex: 2, padding: '14px', borderRadius: 11, border: 'none', background: (saving || !slug.trim()) ? '#94a3b8' : '#02402e', color: '#fff', fontSize: 15, fontWeight: 600, cursor: (saving || !slug.trim()) ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {saving ? 'กำลังเพิ่ม...' : <><span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 6 }}>add</span>เพิ่มหน้า SEO</>}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Delete Modal ──────────────────────────────────────────────────────────────
function DeleteModal({ page, onClose, onDeleted }: { page: SeoPage; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false)
  const [error,    setError]    = useState('')

  async function confirmDelete() {
    setDeleting(true); setError('')
    try {
      const token = await getToken()
      const r = await fetch(`/api/dashboard/seo?id=${page.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error ?? 'Delete failed')
      onDeleted(); onClose()
    } catch (e: any) { setError(e.message) }
    setDeleting(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,64,46,0.3)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)', fontFamily: "'Prompt', -apple-system, sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '32px', width: 420, boxShadow: '0 20px 60px rgba(2,64,46,0.2)' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          <span className="msym" style={{ fontSize: 28, color: '#dc2626', fontVariationSettings: "'wght' 400, 'FILL' 1" }}>delete</span>
        </div>
        <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#02402e' }}>ลบหน้า SEO นี้?</h3>
        <p style={{ margin: '0 0 6px', fontSize: 14, color: '#64748b' }}>คุณกำลังจะลบหน้า:</p>
        <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#048c73', background: '#f0fdf4', padding: '8px 12px', borderRadius: 8, marginBottom: 8 }}>/{page.slug}</div>
        {page.title_th && <p style={{ margin: '0 0 12px', fontSize: 13, color: '#94a3b8' }}>{page.title_th}</p>}
        <p style={{ margin: '0 0 24px', fontSize: 13, color: '#dc2626', fontWeight: 500 }}>การกระทำนี้ไม่สามารถยกเลิกได้</p>
        {error && <div style={{ padding: '10px 13px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '13px', borderRadius: 11, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>ยกเลิก</button>
          <button onClick={confirmDelete} disabled={deleting} style={{ flex: 1, padding: '13px', borderRadius: 11, border: 'none', background: deleting ? '#94a3b8' : '#dc2626', color: '#fff', fontSize: 15, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {deleting ? 'กำลังลบ...' : 'ลบออก'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SeoPage() {
  const [pages,       setPages]       = useState<SeoPage[]>([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [typeFilter,  setTypeFilter]  = useState<string>('all')
  const [statusFilt,  setStatusFilt]  = useState<string>('all')
  const [editingPage,  setEditingPage]  = useState<SeoPage | null>(null)
  const [deletingPage, setDeletingPage] = useState<SeoPage | null>(null)
  const [addingNew,    setAddingNew]    = useState(false)

  async function load() {
    setLoading(true)
    try {
      const token = await getToken()
      const r = await fetch('/api/dashboard/seo', { headers: { Authorization: `Bearer ${token}` } })
      const d = await r.json()
      setPages(d.pages ?? [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = pages.filter(p => {
    if (typeFilter !== 'all' && p.area_type !== typeFilter) return false
    if (statusFilt !== 'all' && p.status !== statusFilt) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.slug.includes(q) ||
      (p.title_th || '').toLowerCase().includes(q) ||
      (p.title_en || '').toLowerCase().includes(q)
    )
  })

  const totalPublished  = pages.filter(p => p.status === 'published').length
  const totalBuilt      = pages.filter(p => p.status === 'built').length
  const totalWithMeta   = pages.filter(p => p.meta_description).length
  const totalNeedUpdate = pages.filter(p => p.status === 'needs_update').length
  const avgScore        = pages.filter(p => p.page_score !== null).length > 0
    ? Math.round(pages.filter(p => p.page_score !== null).reduce((s, p) => s + (p.page_score ?? 0), 0) / pages.filter(p => p.page_score !== null).length)
    : null

  const kpiCards = [
    { label: 'หน้าทั้งหมด',    value: pages.length,    icon: 'web',         bg: '#e8f5f0', color: '#048c73' },
    { label: 'เผยแพร่แล้ว',    value: totalPublished,  icon: 'public',      bg: '#dcfce7', color: '#15803d' },
    { label: 'มี Meta Desc',   value: totalWithMeta,   icon: 'description', bg: '#e0f2fe', color: '#0284c7' },
    { label: 'ต้องอัปเดต',     value: totalNeedUpdate, icon: 'update',      bg: '#fef9c3', color: '#a16207' },
  ]

  const areaTypes = ['bts', 'mrt', 'district', 'university', 'zone']

  return (
    <div style={{ fontFamily: "'Prompt', -apple-system, sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {addingNew    && <AddDrawer onClose={() => setAddingNew(false)} onSaved={load} />}
      {deletingPage && <DeleteModal page={deletingPage} onClose={() => setDeletingPage(null)} onDeleted={load} />}
      {editingPage  && <EditDrawer page={editingPage}  onClose={() => setEditingPage(null)}  onSaved={load} />}

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 3px', color: '#02402e' }}>SEO Pages Tracker</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>ติดตามสถานะหน้า SEO ทุกพื้นที่ในกรุงเทพ · {pages.length} หน้า</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => setAddingNew(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 20px', borderRadius: 11, border: 'none', background: '#02402e', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>add</span>
            เพิ่มหน้า SEO
          </button>
          {avgScore !== null && (
            <div style={{ padding: '10px 20px', borderRadius: 12, background: '#f8faf9', border: '1px solid #eef0ef', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: avgScore >= 80 ? '#15803d' : avgScore >= 50 ? '#a16207' : '#dc2626' }}>{avgScore}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>คะแนนเฉลี่ย</div>
            </div>
          )}
        </div>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {kpiCards.map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 12px -6px rgba(2,64,46,0.07)' }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="msym" style={{ fontSize: 20, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{k.icon}</span>
            </span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#02402e', lineHeight: 1, letterSpacing: '-0.5px' }}>{k.value}</div>
              <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 3 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 16, padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#02402e' }}>ความคืบหน้า</span>
          <span style={{ fontSize: 12, color: '#64748b' }}>{totalPublished}/{pages.length} เผยแพร่แล้ว</span>
        </div>
        <div style={{ height: 8, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ display: 'flex', height: '100%' }}>
            {totalPublished > 0 && <div style={{ width: `${(totalPublished / pages.length) * 100}%`, background: '#15803d', transition: 'width .4s' }} />}
            {totalBuilt > 0 && <div style={{ width: `${(totalBuilt / pages.length) * 100}%`, background: '#0284c7', transition: 'width .4s' }} />}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          {[['#15803d', 'เผยแพร่แล้ว', totalPublished], ['#0284c7', 'สร้างแล้ว', totalBuilt], ['#64748b', 'วางแผน', pages.filter(p => p.status === 'planned').length], ['#a16207', 'ต้องอัปเดต', totalNeedUpdate]].map(([color, label, val]) => (
            <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color as string, flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, color: '#64748b' }}>{label} ({val})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา slug, ชื่อหน้า..."
          style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 12, border: '1px solid #eef0ef', fontSize: 13.5, outline: 'none', background: '#fff', fontFamily: 'inherit' }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => setTypeFilter('all')} style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${typeFilter === 'all' ? '#02402e' : '#e2e8f0'}`, background: typeFilter === 'all' ? '#02402e' : '#fff', color: typeFilter === 'all' ? '#fff' : '#64748b', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>ทั้งหมด</button>
          {areaTypes.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${typeFilter === t ? '#02402e' : '#e2e8f0'}`, background: typeFilter === t ? '#02402e' : '#fff', color: typeFilter === t ? '#fff' : '#64748b', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{AREA_TYPE_LABEL[t] ?? t}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {Object.entries(STATUS_STYLE).map(([key, s]) => (
            <button key={key} onClick={() => setStatusFilt(statusFilt === key ? 'all' : key)} style={{
              padding: '7px 12px', borderRadius: 9, border: `1.5px solid ${statusFilt === key ? s.color : '#e2e8f0'}`,
              background: statusFilt === key ? s.bg : '#fff', color: statusFilt === key ? s.color : '#64748b',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <span className="msym" style={{ fontSize: 12, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 3 }}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
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
            <span className="msym" style={{ fontSize: 48, color: '#c7d2d0', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>web</span>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: '12px 0 0' }}>ไม่พบหน้าที่ตรงกับเงื่อนไข</p>
          </div>
        ) : (
          <>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #eef0ef' }}>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>แสดง {filtered.length} จาก {pages.length} หน้า</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8faf9', borderBottom: '1px solid #eef0ef' }}>
                    {['Slug / URL', 'ชื่อหน้า', 'Meta', 'ประเภท', 'สถานะ', 'คะแนน', 'เนื้อหา', ''].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 11.5, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const ss = STATUS_STYLE[p.status] ?? STATUS_STYLE.planned
                    return (
                      <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f4' : 'none', background: i % 2 === 0 ? '#fff' : '#fafffe' }}>
                        <td style={{ padding: '12px 16px', minWidth: 240 }}>
                          <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#048c73', background: '#f0fdf4', padding: '3px 8px', borderRadius: 6, display: 'inline-block', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            /{p.slug}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', minWidth: 180 }}>
                          {p.title_th
                            ? <div><div style={{ fontWeight: 500, color: '#02402e', fontSize: 12.5 }}>{p.title_th}</div><div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{p.title_en || '—'}</div></div>
                            : <span style={{ color: '#fbbf24', fontSize: 12 }}><span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 3 }}>warning</span>ไม่มีชื่อหน้า</span>}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {p.meta_description
                            ? <span style={{ color: '#15803d', fontSize: 12 }}><span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>check_circle</span></span>
                            : <span style={{ color: '#dc2626', fontSize: 12 }}><span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>cancel</span></span>}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11.5, padding: '2px 9px', borderRadius: 8, background: '#f1f5f9', color: '#64748b', fontWeight: 600 }}>{AREA_TYPE_LABEL[p.area_type] ?? p.area_type}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 10, background: ss.bg, color: ss.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
                            <span className="msym" style={{ fontSize: 12, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 3 }}>{ss.icon}</span>{ss.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}><ScoreBadge score={p.page_score} /></td>
                        <td style={{ padding: '12px 16px' }}>
                          {p.has_content
                            ? <span style={{ fontSize: 11.5, padding: '2px 9px', borderRadius: 8, background: '#dcfce7', color: '#15803d', fontWeight: 600 }}>มีเนื้อหา</span>
                            : <span style={{ color: '#cbd5e1', fontSize: 12 }}>ว่าง</span>}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => setEditingPage(p)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #048c73', background: '#eaf6f1', color: '#048c73', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                              <span className="msym" style={{ fontSize: 13, marginRight: 4 }}>edit</span>แก้ไข
                            </button>
                            <button onClick={() => setDeletingPage(p)} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                              <span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 12, background: '#f8faf9', border: '1px solid #eef0ef', fontSize: 12.5, color: '#64748b', display: 'flex', gap: 8 }}>
        <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1", flexShrink: 0 }}>info</span>
        <span>หน้า SEO ทั้งหมดสร้างจาก Task #191 — ใช้หน้านี้ติดตามความคืบหน้าก่อนเผยแพร่จริง</span>
      </div>
    </div>
  )
}
