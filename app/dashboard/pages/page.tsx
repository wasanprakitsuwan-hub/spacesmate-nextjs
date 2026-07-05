'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase'

async function authHeaders(): Promise<HeadersInit> {
  const supabase = createBrowserClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }
    : { 'Content-Type': 'application/json' }
}

// ─────────────────────────────────────────────────────────────────────────────
// /dashboard/pages — Editable site page registry
// Fetches from Supabase via /api/dashboard/pages.
// Features: Edit drawer (label, meta, notes), Unpublish toggle, Delete.
// ─────────────────────────────────────────────────────────────────────────────

const SITE_URL = 'https://spacesmate.com'

type PageStatus = 'published' | 'unpublished'

interface SitePage {
  id:          string
  path:        string
  label_th:    string
  label_en:    string
  group_name:  string
  icon:        string
  page_type:   string   // live | dynamic | form | redirect
  status:      PageStatus
  is_indexable: boolean
  meta_title:  string | null
  meta_desc:   string | null
  notes:       string | null
  sort_order:  number
}

// ─── type badge ──────────────────────────────────────────────────────────────

const TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  live:     { label: 'Static',   color: '#02402e', bg: '#edf5f0' },
  dynamic:  { label: 'Dynamic',  color: '#0369a1', bg: '#e0f2fe' },
  form:     { label: 'Form',     color: '#92400e', bg: '#fef3c7' },
  redirect: { label: 'Event',    color: '#6d28d9', bg: '#ede9fe' },
}

// ─── edit drawer ─────────────────────────────────────────────────────────────

function EditDrawer({
  page,
  onClose,
  onSaved,
}: {
  page: SitePage
  onClose: () => void
  onSaved: (updated: Partial<SitePage>) => void
}) {
  const [labelTh,   setLabelTh]   = useState(page.label_th)
  const [labelEn,   setLabelEn]   = useState(page.label_en)
  const [metaTitle, setMetaTitle] = useState(page.meta_title ?? '')
  const [metaDesc,  setMetaDesc]  = useState(page.meta_desc ?? '')
  const [notes,     setNotes]     = useState(page.notes ?? '')
  const [saving,    setSaving]    = useState(false)
  const [err,       setErr]       = useState('')

  async function save() {
    setSaving(true); setErr('')
    try {
      const r = await fetch('/api/dashboard/pages', {
        method: 'PATCH',
        headers: await authHeaders(),
        body: JSON.stringify({
          id: page.id,
          label_th:   labelTh.trim(),
          label_en:   labelEn.trim(),
          meta_title: metaTitle.trim() || null,
          meta_desc:  metaDesc.trim() || null,
          notes:      notes.trim() || null,
        }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Save failed')
      onSaved({ label_th: labelTh.trim(), label_en: labelEn.trim(), meta_title: metaTitle.trim() || null, meta_desc: metaDesc.trim() || null, notes: notes.trim() || null })
      onClose()
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 14,
    border: '1px solid #e2e8f0', background: '#fff', outline: 'none',
    fontFamily: "'Prompt', -apple-system, sans-serif", color: '#231f20',
    boxSizing: 'border-box',
  }
  const lbl: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block',
  }

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000 }} />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 680, zIndex: 1001,
        background: '#fff', boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column', fontFamily: "'Prompt', -apple-system, sans-serif",
      }}>
        {/* Header */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #eef0ef', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#231f20' }}>แก้ไขหน้าเพจ</h2>
            <code style={{ fontSize: 12, color: '#64748b', background: '#f8fafc', padding: '2px 7px', borderRadius: 5, marginTop: 4, display: 'inline-block' }}>{page.path}</code>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
            <span className="msym" style={{ fontSize: 22, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>close</span>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Labels */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={lbl}>ชื่อหน้า (ภาษาไทย)</label>
              <input style={inp} value={labelTh} onChange={e => setLabelTh(e.target.value)} placeholder="เช่น หน้าแรก" />
            </div>
            <div>
              <label style={lbl}>Page Name (English)</label>
              <input style={inp} value={labelEn} onChange={e => setLabelEn(e.target.value)} placeholder="e.g. Home" />
            </div>
          </div>

          {/* SEO */}
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#02402e', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>travel_explore</span>
              SEO Metadata
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={lbl}>Meta Title <span style={{ color: '#94a3b8', fontWeight: 400 }}>(max 60 chars)</span></label>
                <input
                  style={{ ...inp, borderColor: metaTitle.length > 60 ? '#ef4444' : '#e2e8f0' }}
                  value={metaTitle}
                  onChange={e => setMetaTitle(e.target.value)}
                  placeholder="SpacesMate | Page Title"
                />
                <div style={{ fontSize: 11, color: metaTitle.length > 60 ? '#ef4444' : '#94a3b8', marginTop: 4 }}>{metaTitle.length}/60</div>
              </div>
              <div>
                <label style={lbl}>Meta Description <span style={{ color: '#94a3b8', fontWeight: 400 }}>(max 155 chars)</span></label>
                <textarea
                  style={{ ...inp, resize: 'vertical', minHeight: 72, borderColor: metaDesc.length > 155 ? '#ef4444' : '#e2e8f0' } as React.CSSProperties}
                  value={metaDesc}
                  onChange={e => setMetaDesc(e.target.value)}
                  placeholder="Short description for Google search results..."
                />
                <div style={{ fontSize: 11, color: metaDesc.length > 155 ? '#ef4444' : '#94a3b8', marginTop: 4 }}>{metaDesc.length}/155</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={lbl}>Notes (internal only — not shown on site)</label>
            <textarea
              style={{ ...inp, resize: 'vertical', minHeight: 80 } as React.CSSProperties}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Internal notes about this page — purpose, status, upcoming changes..."
            />
          </div>

          {/* Read-only info */}
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              { label: 'Type',      value: page.page_type },
              { label: 'Indexable', value: page.is_indexable ? 'Yes' : 'No' },
              { label: 'Group',     value: page.group_name },
            ].map(i => (
              <div key={i.label}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>{i.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{i.value}</div>
              </div>
            ))}
          </div>

          {err && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#b91c1c', fontSize: 13 }}>
              {err}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid #eef0ef', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '10px 22px', borderRadius: 10, border: '1px solid #e2e8f0',
            background: '#fff', color: '#64748b', fontSize: 14, cursor: 'pointer',
          }}>ยกเลิก</button>
          <button onClick={save} disabled={saving} style={{
            padding: '10px 26px', borderRadius: 10, border: 'none',
            background: saving ? '#94a3b8' : '#02402e', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
          }}>
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── confirm modal ────────────────────────────────────────────────────────────

function ConfirmModal({
  title, message, confirmLabel, danger,
  onConfirm, onCancel,
}: {
  title: string; message: string; confirmLabel: string; danger?: boolean
  onConfirm: () => void; onCancel: () => void
}) {
  return (
    <>
      <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1100 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 1101, background: '#fff', borderRadius: 16, padding: '28px 32px',
        width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        fontFamily: "'Prompt', -apple-system, sans-serif",
      }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 600, color: '#231f20' }}>{title}</h3>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '9px 20px', borderRadius: 9, border: '1px solid #e2e8f0',
            background: '#fff', color: '#64748b', fontSize: 14, cursor: 'pointer',
          }}>ยกเลิก</button>
          <button onClick={onConfirm} style={{
            padding: '9px 20px', borderRadius: 9, border: 'none',
            background: danger ? '#ef4444' : '#02402e', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>{confirmLabel}</button>
        </div>
      </div>
    </>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function PagesPage() {
  const [pages,   setPages]   = useState<SitePage[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [editPage,    setEditPage]    = useState<SitePage | null>(null)
  const [deletePage,  setDeletePage]  = useState<SitePage | null>(null)
  const [togglingId,  setTogglingId]  = useState<string | null>(null)
  const [deletingId,  setDeletingId]  = useState<string | null>(null)
  const [toast,       setToast]       = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const r = await fetch('/api/dashboard/pages')
      const d = await r.json()
      setPages(d.pages ?? [])
    } catch {
      setError('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // Group pages by group_name, preserving order
  const grouped: Record<string, SitePage[]> = {}
  for (const p of pages) {
    if (!grouped[p.group_name]) grouped[p.group_name] = []
    grouped[p.group_name].push(p)
  }

  async function togglePublish(page: SitePage) {
    const newStatus: PageStatus = page.status === 'published' ? 'unpublished' : 'published'
    setTogglingId(page.id)
    try {
      const r = await fetch('/api/dashboard/pages', {
        method: 'PATCH',
        headers: await authHeaders(),
        body: JSON.stringify({ id: page.id, status: newStatus }),
      })
      if (!r.ok) throw new Error('Failed')
      setPages(prev => prev.map(p => p.id === page.id ? { ...p, status: newStatus } : p))
      showToast(newStatus === 'published' ? `✓ ${page.label_th} — เผยแพร่แล้ว` : `⏸ ${page.label_th} — ซ่อนแล้ว`)
    } catch {
      showToast('เกิดข้อผิดพลาด')
    } finally {
      setTogglingId(null)
    }
  }

  async function confirmDelete() {
    if (!deletePage) return
    setDeletingId(deletePage.id)
    try {
      const headers = await authHeaders()
      const r = await fetch(`/api/dashboard/pages?id=${deletePage.id}`, { method: 'DELETE', headers })
      if (!r.ok) throw new Error('Failed')
      setPages(prev => prev.filter(p => p.id !== deletePage.id))
      showToast(`ลบ ${deletePage.label_th} แล้ว`)
    } catch {
      showToast('เกิดข้อผิดพลาด')
    } finally {
      setDeletingId(null)
      setDeletePage(null)
    }
  }

  // Counts
  const published   = pages.filter(p => p.status === 'published').length
  const unpublished = pages.filter(p => p.status === 'unpublished').length
  const indexed     = pages.filter(p => p.is_indexable).length
  const dynamic     = pages.filter(p => p.page_type === 'dynamic').length

  return (
    <div style={{ fontFamily: "'Prompt', -apple-system, sans-serif", maxWidth: 1120 }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, right: 32, zIndex: 2000,
          background: '#231f20', color: '#fff', borderRadius: 12,
          padding: '12px 20px', fontSize: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#231f20', margin: '0 0 4px' }}>Site Pages</h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>จัดการทุก route ของ spacesmate.com — แก้ไข, ซ่อน, หรือลบหน้าเพจ</p>
        </div>
        <button onClick={load} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '9px 16px', borderRadius: 10, border: '1px solid #e2e8f0',
          background: '#fff', color: '#64748b', fontSize: 13, cursor: 'pointer',
        }}>
          <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>refresh</span>
          รีเฟรช
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 32 }}>
        {[
          { label: 'หน้าทั้งหมด',       value: pages.length, icon: 'web',            color: '#02402e' },
          { label: 'เผยแพร่อยู่',        value: published,    icon: 'check_circle',   color: '#048c73' },
          { label: 'ซ่อน (Unpublished)', value: unpublished,  icon: 'visibility_off', color: '#d97f11' },
          { label: 'Google Indexed',     value: indexed,      icon: 'travel_explore', color: '#0369a1' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#fff', border: '1px solid #eef0ef', borderRadius: 14,
            padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <span style={{
              width: 42, height: 42, borderRadius: 11, background: s.color + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span className="msym" style={{ fontSize: 22, color: s.color, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{s.icon}</span>
            </span>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#231f20', lineHeight: 1 }}>{loading ? '–' : s.value}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Error / Loading */}
      {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', color: '#b91c1c', marginBottom: 20 }}>{error}</div>}
      {loading && <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8', fontSize: 14 }}>กำลังโหลด...</div>}

      {/* Groups */}
      {!loading && Object.entries(grouped).map(([groupName, groupPages]) => (
        <div key={groupName} style={{ marginBottom: 28 }}>

          {/* Group header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
            <span className="msym" style={{ fontSize: 16, color: '#02402e', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>
              {groupPages[0]?.icon ?? 'web'}
            </span>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#231f20' }}>{groupName}</span>
            <span style={{
              marginLeft: 2, background: '#f1f5f9', color: '#64748b',
              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
            }}>{groupPages.length}</span>
          </div>

          {/* Table */}
          <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 14, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#fafbfa' }}>
                  {['หน้า', 'URL', 'ประเภท', 'สถานะ', 'Actions'].map((h, i) => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      color: '#94a3b8', fontWeight: 600, fontSize: 11,
                      letterSpacing: 0.5, borderBottom: '1px solid #eef0ef',
                      whiteSpace: 'nowrap',
                      width: i === 1 ? 220 : i === 4 ? 200 : undefined,
                    }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupPages.map((page, idx) => {
                  const typeMeta = TYPE_META[page.page_type] ?? TYPE_META.live
                  const isLast   = idx === groupPages.length - 1
                  const isUnpub  = page.status === 'unpublished'

                  return (
                    <tr key={page.id} style={{
                      borderBottom: isLast ? 'none' : '1px solid #f4f6f5',
                      background: isUnpub ? '#fffbf5' : '#fff',
                      opacity: isUnpub ? 0.8 : 1,
                    }}>

                      {/* Page name */}
                      <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="msym" style={{
                            fontSize: 18, color: isUnpub ? '#d97f11' : '#02402e', flexShrink: 0,
                            fontVariationSettings: "'wght' 300, 'FILL' 0",
                          }}>{page.icon}</span>
                          <div>
                            <div style={{ fontWeight: 600, color: '#231f20' }}>{page.label_th}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{page.label_en}</div>
                            {page.notes && (
                              <div style={{ fontSize: 11, color: '#64748b', marginTop: 3, fontStyle: 'italic' }}>{page.notes}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* URL */}
                      <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                        <code style={{
                          fontSize: 11, background: '#f8fafc', border: '1px solid #e2e8f0',
                          borderRadius: 6, padding: '3px 8px', color: '#334155',
                          display: 'inline-block', wordBreak: 'break-all',
                        }}>{page.path}</code>
                      </td>

                      {/* Type */}
                      <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                        <span style={{
                          background: typeMeta.bg, color: typeMeta.color,
                          fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
                        }}>{typeMeta.label}</span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                        <span style={{
                          background: isUnpub ? '#fef3c7' : '#edf5f0',
                          color: isUnpub ? '#92400e' : '#02402e',
                          fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                        }}>
                          <span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>
                            {isUnpub ? 'visibility_off' : 'visibility'}
                          </span>
                          {isUnpub ? 'ซ่อน' : 'เผยแพร่'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>

                          {/* Edit */}
                          <button
                            onClick={() => setEditPage(page)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '5px 10px', borderRadius: 8,
                              border: '1px solid #e2e8f0', background: '#fafbfa',
                              color: '#334155', fontSize: 12, cursor: 'pointer',
                            }}
                            title="แก้ไข"
                          >
                            <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>edit</span>
                            แก้ไข
                          </button>

                          {/* Unpublish / Publish toggle */}
                          <button
                            onClick={() => togglePublish(page)}
                            disabled={togglingId === page.id}
                            title={isUnpub ? 'เผยแพร่' : 'ซ่อนหน้านี้'}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '5px 10px', borderRadius: 8,
                              border: `1px solid ${isUnpub ? '#d97f11' : '#e2e8f0'}`,
                              background: isUnpub ? '#fef3c7' : '#fafbfa',
                              color: isUnpub ? '#92400e' : '#64748b',
                              fontSize: 12, cursor: togglingId === page.id ? 'wait' : 'pointer',
                              opacity: togglingId === page.id ? 0.5 : 1,
                            }}
                          >
                            <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>
                              {isUnpub ? 'visibility' : 'visibility_off'}
                            </span>
                            {isUnpub ? 'เผยแพร่' : 'ซ่อน'}
                          </button>

                          {/* Visit — only for non-dynamic routes */}
                          {!page.path.includes('[') && (
                            <a
                              href={`${SITE_URL}${page.path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="เปิดหน้านี้"
                              style={{
                                display: 'inline-flex', alignItems: 'center',
                                padding: '5px 8px', borderRadius: 8,
                                border: '1px solid #e2e8f0', background: '#fafbfa',
                                color: '#94a3b8', textDecoration: 'none',
                              }}
                            >
                              <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>open_in_new</span>
                            </a>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => setDeletePage(page)}
                            disabled={deletingId === page.id}
                            title="ลบหน้านี้"
                            style={{
                              display: 'inline-flex', alignItems: 'center',
                              padding: '5px 8px', borderRadius: 8,
                              border: '1px solid #fee2e2', background: '#fef2f2',
                              color: '#ef4444', cursor: 'pointer',
                            }}
                          >
                            <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Footer note */}
      {!loading && (
        <div style={{
          background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12,
          padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10,
          color: '#64748b', fontSize: 12,
        }}>
          <span className="msym" style={{ fontSize: 18, color: '#94a3b8', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>info</span>
          <span>
            "ซ่อน" ทำให้หน้าเพจ redirect ไป 404 สำหรับผู้เข้าชม (ใช้เวลา ~60 วิในการอัปเดต cache) —
            "ลบ" จะซ่อนออกจาก dashboard นี้ แต่ไม่ได้ลบ code ออกจาก Next.js codebase
          </span>
        </div>
      )}

      {/* Edit drawer */}
      {editPage && (
        <EditDrawer
          page={editPage}
          onClose={() => setEditPage(null)}
          onSaved={updated => {
            setPages(prev => prev.map(p => p.id === editPage.id ? { ...p, ...updated } : p))
            showToast(`✓ บันทึก ${editPage.label_th} แล้ว`)
          }}
        />
      )}

      {/* Delete confirm */}
      {deletePage && (
        <ConfirmModal
          title="ลบหน้าเพจ"
          message={`คุณแน่ใจหรือไม่ว่าต้องการลบ "${deletePage.label_th}" (${deletePage.path}) ออกจาก registry นี้? การลบไม่ได้ลบ code — หน้าจะยังมีอยู่ใน codebase`}
          confirmLabel="ลบออก"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setDeletePage(null)}
        />
      )}
    </div>
  )
}
