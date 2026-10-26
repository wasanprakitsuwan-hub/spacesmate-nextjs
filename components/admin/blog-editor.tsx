'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import RichEditor from '@/components/RichEditor'
import { C, RADIUS, btnStyle } from '@/lib/ui'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string
  title: string
  slug: string
  category: string
  status: 'published' | 'draft' | 'review'
  seoScore: number
  views: number
  date: string
  author: string
  content?: string
  thumbnail?: string
  thumbnailAlt?: string
  metaTitle?: string
  metaDesc?: string
  language?: 'th' | 'en'
  keyword?: string
}

export const CATEGORIES = ['คู่มือผู้เช่า', 'ความรู้การลงทุน', 'เกี่ยวกับเรา', 'PropTech', 'ทำเลน่าอยู่', 'เจ้าของทรัพย์']

export const STATUS_MAP = {
  published: { bg: '#dcfce7', color: '#15803d', label: 'เผยแพร่แล้ว' },
  draft:     { bg: '#f1f5f9', color: '#64748b', label: 'แบบร่าง' },
  review:    { bg: '#fef9c3', color: '#a16207', label: 'รอตรวจสอบ' },
}

// ── Utilities ─────────────────────────────────────────────────────────────────

/** Resize + convert any image file to WebP data URL */
async function fileToWebP(file: File, maxW = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objUrl = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxW / img.naturalWidth)
      const w = Math.round(img.naturalWidth * scale)
      const h = Math.round(img.naturalHeight * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(objUrl)
      resolve(canvas.toDataURL('image/webp', quality))
    }
    img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error('Failed to load image')) }
    img.src = objUrl
  })
}

/** Auto-generate URL slug from title (handles Thai + English) */
function generateSlug(title: string): string {
  // Extract English/numeric words first
  const english = (title.match(/[a-zA-Z0-9]+/g) ?? []).join('-').toLowerCase()
  if (english.length >= 4) return english
  // Fallback: date-based unique slug
  const d = new Date()
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  return `post-${date}-${Math.random().toString(36).slice(2, 6)}`
}

/** Auto alt text from filename or post title */
function autoAlt(fileName: string, postTitle = ''): string {
  if (postTitle) return postTitle
  return fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
}

/** Retrieve the current user's JWT for authenticated API calls */
export async function getToken(): Promise<string> {
  const { data: { session } } = await createBrowserClient().auth.getSession()
  return session?.access_token ?? ''
}

/** Compute an SEO score (0–100) from post fields */
export function calcSeoScore(post: Partial<BlogPost>): number {
  let score = 0
  if (post.metaTitle && post.metaTitle.length >= 20) score += 20
  if (post.metaDesc  && post.metaDesc.length  >= 80) score += 20
  const chars = (post.content ?? '').replace(/<[^>]*>/g, '').length
  if (chars >= 800)      score += 30
  else if (chars >= 300) score += 15
  if (post.thumbnail)    score += 10
  if (post.thumbnailAlt) score += 10
  if (post.keyword)      score += 10  // keyword defined
  return Math.min(score, 100)
}

// ── ThumbnailUploader ─────────────────────────────────────────────────────────

function ThumbnailUploader({
  value, valueAlt, onChange,
}: {
  value: string; valueAlt: string
  onChange: (src: string, alt: string) => void
}) {
  const [dragging, setDragging] = useState(false)
  const [converting, setConverting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function processFile(file: File, postTitle = '') {
    if (!file.type.startsWith('image/')) return
    setConverting(true)
    try {
      const webp = await fileToWebP(file, 1400, 0.88)
      const alt  = valueAlt || autoAlt(file.name, postTitle)
      onChange(webp, alt)
    } finally {
      setConverting(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  return (
    <div>
      <label style={{ fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 8, display: 'block' }}>
        Thumbnail / รูปปก
      </label>

      {value ? (
        <div style={{ position: 'relative', borderRadius: 13, overflow: 'hidden', border: '1px solid #eef0ef' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={valueAlt} style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)' }} />
          <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.4)', padding: '3px 9px', borderRadius: 20 }}>
              WebP · {Math.round(value.length * 0.75 / 1024)} KB
            </span>
            <button onClick={() => onChange('', '')} style={{
              background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 8, padding: '5px 10px',
              color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              
              เปลี่ยนรูป
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? '#048c73' : '#e2e8f0'}`,
            borderRadius: 13, padding: '32px 20px', textAlign: 'center', cursor: 'pointer',
            background: dragging ? '#f0f7f4' : '#fafafa', transition: 'all .18s',
          }}
        >
          {converting ? (
            <div>
              <div style={{ width: 28, height: 28, border: '3px solid #eef0ef', borderTopColor: '#048c73', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 10px' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <div style={{ fontSize: 13, color: '#64748b' }}>แปลงเป็น WebP...</div>
            </div>
          ) : (
            <>
              <span className="msym" style={{ fontSize: 38, color: '#c8e6da', display: 'block', marginBottom: 10, fontVariationSettings: "'wght' 200, 'FILL' 0" }}>add_photo_alternate</span>
              <div style={{ fontSize: 13.5, color: '#334155', fontWeight: 600, marginBottom: 4 }}>อัปโหลด Thumbnail</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>ลากวางหรือคลิก · JPG / PNG / WEBP · แปลงเป็น WebP อัตโนมัติ · แนะนำ 1200×630px</div>
            </>
          )}
        </div>
      )}

      {/* Alt text input */}
      {value && (
        <div style={{ marginTop: 10 }}>
          <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>
            Alt Text (auto-fill จากชื่อบทความ)
          </label>
          <input
            value={valueAlt}
            onChange={e => onChange(value, e.target.value)}
            placeholder="คำอธิบายรูปภาพ — สำหรับ SEO และ Accessibility"
            style={{ width: '100%', padding: '13px 16px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 16, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f) }} />
    </div>
  )
}

// ── Blog image inserter (WebP conversion + inject via RichEditor callback) ────

async function insertBodyImageBlog(insertHtml: (html: string) => void) {
  const input = document.createElement('input')
  input.type  = 'file'
  input.accept = 'image/*'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    try {
      const webp = await fileToWebP(file, 1200, 0.85)
      const alt  = autoAlt(file.name)
      insertHtml(
        `<img src="${webp}" alt="${alt}" style="max-width:100%;border-radius:10px;margin:14px 0;display:block;" />`
      )
    } catch { /* ignore */ }
  }
  input.click()
}

// ── SeoBar ────────────────────────────────────────────────────────────────────

export function SeoBar({ score }: { score: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#d97f11' : '#ef4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: '#f0f2f1', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 4 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 28 }}>{score}</span>
    </div>
  )
}

// ── AI meta generation helpers ────────────────────────────────────────────────

/** Call the generate-meta API and return just the field requested */
async function generateMeta(post: Partial<BlogPost>, field: 'title' | 'desc'): Promise<string | null> {
  try {
    const token = await getToken()
    const res = await fetch('/api/dashboard/blog/generate-meta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title:    post.title ?? '',
        content:  post.content ?? '',
        keyword:  post.keyword ?? post.title ?? '',
        language: post.language ?? 'th',
      }),
    })
    if (!res.ok) throw new Error('API error')
    const data = await res.json() as { metaTitle?: string; metaDesc?: string; error?: string }
    if (data.error) throw new Error(data.error)
    return field === 'title' ? (data.metaTitle ?? null) : (data.metaDesc ?? null)
  } catch (err) {
    console.error('generateMeta error:', err)
    alert('ไม่สามารถสร้าง Meta ได้ — ตรวจสอบ ANTHROPIC_API_KEY ใน Vercel Environment Variables')
    return null
  }
}

/** Sparkle button used for AI generation actions */
function AiGenButton({ label, loading, onClick }: { label: string; loading: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '4px 12px', borderRadius: 8, border: '1px solid #048c73',
        background: loading ? '#f0f9f6' : '#ffffff',
        color: '#048c73', fontSize: 12, fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', whiteSpace: 'nowrap',
        opacity: loading ? 0.7 : 1,
      }}
    >
      
      {loading ? 'กำลังสร้าง...' : label}
    </button>
  )
}

// ── BlogEditor ────────────────────────────────────────────────────────────────
// Full-page editor (/dashboard/blog/[id]): writing on the left, publishing and
// the SEO checklist on the right, so the suggestions sit beside the article.

export function BlogEditor({ post, onSave, onDelete }: {
  post: BlogPost
  onSave: (updated: BlogPost) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const [form, setForm]             = useState<BlogPost>({ ...post })
  const [slugEdited, setSlugEdited] = useState(!!post.slug && post.id !== 'NEW')
  const [saved, setSaved]           = useState(false)
  const [saving, setSaving]         = useState(false)
  const [saveError, setSaveError]   = useState('')
  const [aiLoading, setAiLoading]   = useState<'title' | 'desc' | null>(null)

  function setF(k: keyof BlogPost, v: string) {
    setForm(f => {
      const next = { ...f, [k]: v }
      // Auto-slug from title unless manually edited
      if (k === 'title' && !slugEdited) {
        next.slug = generateSlug(v)
        if (!next.thumbnailAlt) next.thumbnailAlt = v
      }
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    try {
      await onSave({ ...form, seoScore: calcSeoScore(form) })
      setSaved(true)
      setTimeout(() => setSaved(false), 2200)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }

  const score = calcSeoScore(form)
  const chars = (form.content ?? '').replace(/<[^>]*>/g, '').length
  const checks: { ok: boolean; text: string }[] = [
    { ok: !!form.keyword, text: 'กำหนด Keyword หลัก' },
    { ok: (form.metaTitle?.length ?? 0) >= 20 && (form.metaTitle?.length ?? 0) <= 60, text: `Meta Title 20–60 ตัวอักษร (ตอนนี้ ${(form.metaTitle ?? '').length})` },
    { ok: (form.metaDesc?.length ?? 0) >= 80 && (form.metaDesc?.length ?? 0) <= 160, text: `Meta Description 80–160 ตัวอักษร (ตอนนี้ ${(form.metaDesc ?? '').length})` },
    { ok: chars >= 800, text: `เนื้อหา 800 ตัวอักษรขึ้นไป (ตอนนี้ ${chars.toLocaleString()})` },
    { ok: !!form.thumbnail, text: 'มีรูปปก' },
    { ok: !!form.thumbnailAlt, text: 'มี Alt Text ของรูปปก' },
  ]
  if (form.keyword) {
    const kw = form.keyword.toLowerCase()
    checks.push({ ok: (form.title ?? '').toLowerCase().includes(kw), text: 'Keyword อยู่ในหัวข้อบทความ' })
    checks.push({ ok: (form.metaDesc ?? '').toLowerCase().includes(kw), text: 'Keyword อยู่ใน Meta Description' })
  }

  const box: React.CSSProperties = { background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS, marginBottom: 16 }
  const boxHead: React.CSSProperties = { padding: '12px 16px', borderBottom: `1px solid ${C.line}`, fontSize: 15, fontWeight: 600, color: C.green }
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: RADIUS, border: `1px solid ${C.border}`,
    fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: C.ink, background: C.white,
  }
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: C.muted, marginBottom: 6, display: 'block' }
  const hint = (bad: boolean): React.CSSProperties => ({ fontSize: 12, color: bad ? '#b42318' : C.faint, marginTop: 4 })

  return (
    <div className="sm-blog-ed" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 16, alignItems: 'start' }}>
      <div>
        <div style={{ ...box, padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>หัวข้อบทความ</label>
            <input value={form.title} onChange={e => setF('title', e.target.value)} style={{ ...inputStyle, fontSize: 18, fontWeight: 600, color: C.green }} placeholder="ชื่อบทความ" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Slug (URL){!slugEdited && <span style={{ marginLeft: 6, color: C.teal }}>auto</span>}</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  value={form.slug}
                  onChange={e => { setSlugEdited(true); setF('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) }}
                  style={inputStyle}
                  placeholder="auto-generated-from-title"
                />
                {slugEdited && (
                  <button type="button" onClick={() => { setSlugEdited(false); setF('slug', generateSlug(form.title)) }}
                    className="sm-btn-ghost" style={{ ...btnStyle('ghost'), padding: '8px 10px', fontSize: 13 }}>auto</button>
                )}
              </div>
            </div>
            <div>
              <label style={labelStyle}>หมวดหมู่</label>
              <select value={form.category} onChange={e => setF('category', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>ภาษาของบทความ</label>
            <div style={{ display: 'inline-flex', border: `1px solid ${C.border}`, borderRadius: RADIUS, overflow: 'hidden' }}>
              {([['th', 'ไทย'], ['en', 'English']] as const).map(([val, lbl]) => {
                const on = (form.language ?? 'th') === val
                return (
                  <button key={val} type="button" onClick={() => setF('language', val)} style={{
                    padding: '8px 18px', fontSize: 14, cursor: 'pointer', border: 'none', fontFamily: 'inherit',
                    background: on ? C.green : C.white, color: on ? C.white : C.ink,
                  }}>{lbl}</button>
                )
              })}
            </div>
            <p style={hint(false)}>บทความไทยแสดงที่ /blog และบทความอังกฤษแสดงที่ /en/blog แยกกัน</p>
          </div>

          <ThumbnailUploader
            value={form.thumbnail ?? ''}
            valueAlt={form.thumbnailAlt ?? ''}
            onChange={(src, alt) => setForm(f => ({ ...f, thumbnail: src, thumbnailAlt: alt || f.title }))}
          />

          <div>
            <label style={labelStyle}>เนื้อหาบทความ</label>
            {/* key forces remount when switching posts so editor re-initialises */}
            <RichEditor
              key={form.id}
              initialValue={form.content ?? ''}
              onChange={html => setForm(f => ({ ...f, content: html }))}
              showImage
              onImageClick={insertBodyImageBlog}
              minHeight={420}
            />
            <p style={{ ...hint(false), textAlign: 'right' }}>{chars.toLocaleString()} ตัวอักษร · รูปทุกใบแปลงเป็น WebP ก่อนอัปโหลด</p>
          </div>
        </div>
      </div>

      <aside style={{ position: 'sticky', top: 16 }}>
        <div style={box}>
          <div style={boxHead}>เผยแพร่</div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>สถานะ</label>
              <select value={form.status} onChange={e => setF('status', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="draft">แบบร่าง</option>
                <option value="review">รอตรวจสอบ</option>
                <option value="published">เผยแพร่</option>
              </select>
            </div>
            <div style={{ fontSize: 12.5, color: C.muted, wordBreak: 'break-all' }}>
              spacesmate.com{form.language === 'en' ? '/en' : ''}/blog/{form.slug || '…'}
            </div>
            {saveError && <div style={{ fontSize: 13, color: '#b42318' }}>{saveError}</div>}
            <button onClick={handleSave} disabled={saving} className="sm-btn-primary" style={{ ...btnStyle('primary'), opacity: saving ? 0.7 : 1 }}>
              {saving ? 'กำลังบันทึก...' : saved ? 'บันทึกแล้ว' : 'บันทึก'}
            </button>
            {onDelete && (
              <button type="button" onClick={onDelete} style={{ background: 'none', border: 'none', color: '#b42318', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', padding: 0, textAlign: 'left' }}>
                ลบบทความนี้
              </button>
            )}
          </div>
        </div>

        <div style={box}>
          <div style={{ ...boxHead, display: 'flex', justifyContent: 'space-between' }}>
            <span>SEO</span>
            <span style={{ color: score >= 80 ? C.teal : score >= 60 ? C.amber : '#b42318' }}>{score}/100</span>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <SeoBar score={score} />
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {checks.map(c => (
                <li key={c.text} style={{ display: 'flex', gap: 8, fontSize: 13, color: c.ok ? C.ink : C.muted, lineHeight: 1.5 }}>
                  <span style={{ color: c.ok ? C.teal : '#b42318', flexShrink: 0, width: 12 }}>{c.ok ? '✓' : '×'}</span>{c.text}
                </li>
              ))}
            </ul>

            <div>
              <label style={labelStyle}>Keyword หลัก</label>
              <input value={form.keyword ?? ''} onChange={e => setForm(f => ({ ...f, keyword: e.target.value }))} style={inputStyle} placeholder="เช่น ปล่อยเช่าคอนโด กรุงเทพ" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
                <label style={{ ...labelStyle, margin: 0 }}>Meta Title</label>
                <AiGenButton label="AI สร้าง" loading={aiLoading === 'title'} onClick={async () => {
                  setAiLoading('title')
                  try { const res = await generateMeta(form, 'title'); if (res) setForm(f => ({ ...f, metaTitle: res })) } finally { setAiLoading(null) }
                }} />
              </div>
              <input value={form.metaTitle ?? ''} onChange={e => setF('metaTitle', e.target.value)} style={inputStyle} placeholder={`${form.title} | SpacesMate`} />
              <div style={hint((form.metaTitle?.length ?? 0) > 60)}>{(form.metaTitle ?? '').length}/60</div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
                <label style={{ ...labelStyle, margin: 0 }}>Meta Description</label>
                <AiGenButton label="AI สร้าง" loading={aiLoading === 'desc'} onClick={async () => {
                  setAiLoading('desc')
                  try { const res = await generateMeta(form, 'desc'); if (res) setForm(f => ({ ...f, metaDesc: res })) } finally { setAiLoading(null) }
                }} />
              </div>
              <textarea value={form.metaDesc ?? ''} onChange={e => setF('metaDesc', e.target.value)} rows={4} placeholder="คำอธิบายบทความ 120–160 ตัวอักษร" style={{ ...inputStyle, resize: 'vertical' }} />
              <div style={hint((form.metaDesc?.length ?? 0) > 160)}>
                {(form.metaDesc ?? '').length}/160{(form.metaDesc?.length ?? 0) > 0 && (form.metaDesc?.length ?? 0) < 110 ? ' · สั้นไป ระบบจะเติมจากเนื้อหาให้ครบ' : ''}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Alt Text ของรูปปก</label>
              <input value={form.thumbnailAlt ?? ''} onChange={e => setForm(f => ({ ...f, thumbnailAlt: e.target.value }))} placeholder={form.title || 'คำอธิบายรูปภาพหลัก'} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>ตัวอย่างบน Google</label>
              <div style={{ border: `1px solid ${C.line}`, borderRadius: RADIUS, padding: '10px 12px' }}>
                <div style={{ fontSize: 12, color: C.muted }}>spacesmate.com › blog</div>
                <div style={{ fontSize: 15, color: '#1a0dab', marginTop: 2, lineHeight: 1.35 }}>{form.metaTitle || form.title || 'หัวข้อบทความ'}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>{form.metaDesc || '—'}</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @media (max-width: 1000px) { .sm-blog-ed { grid-template-columns: 1fr !important; } .sm-blog-ed aside { position: static !important; } }`}</style>
    </div>
  )
}
