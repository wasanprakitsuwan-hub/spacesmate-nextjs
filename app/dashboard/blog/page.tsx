'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

interface BlogPost {
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
}

const CATEGORIES = ['คู่มือผู้เช่า', 'ความรู้การลงทุน', 'เกี่ยวกับเรา', 'PropTech', 'ทำเลน่าอยู่', 'เจ้าของทรัพย์']

const STATUS_MAP = {
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
async function getToken(): Promise<string> {
  const { data: { session } } = await createBrowserClient().auth.getSession()
  return session?.access_token ?? ''
}

/** Compute an SEO score (0–100) from post fields */
function calcSeoScore(post: Partial<BlogPost>): number {
  let score = 0
  if (post.metaTitle && post.metaTitle.length >= 20) score += 25
  if (post.metaDesc  && post.metaDesc.length  >= 80) score += 25
  const chars = (post.content ?? '').replace(/<[^>]*>/g, '').length
  if (chars >= 800)      score += 30
  else if (chars >= 300) score += 15
  if (post.thumbnail)    score += 10
  if (post.thumbnailAlt) score += 10
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
      <label style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b', marginBottom: 8, display: 'block' }}>
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
              <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>delete</span>
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
            style={{ width: '100%', padding: '9px 13px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f) }} />
    </div>
  )
}

// ── RichEditor ────────────────────────────────────────────────────────────────

function RichEditor({ initialValue, onChange }: { initialValue: string; onChange: (html: string) => void }) {
  const editorRef  = useRef<HTMLDivElement>(null)
  const mountedVal = useRef(initialValue)

  // Init on mount only — do NOT re-set on every render (breaks cursor position)
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = mountedVal.current || ''
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const exec = useCallback((cmd: string, val?: string) => {
    editorRef.current?.focus()
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    document.execCommand(cmd, false, val)
    onChange(editorRef.current?.innerHTML ?? '')
  }, [onChange])

  async function insertBodyImage() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        const webp = await fileToWebP(file, 1200, 0.85)
        const alt  = autoAlt(file.name)
        exec('insertHTML', `<img src="${webp}" alt="${alt}" style="max-width:100%;border-radius:10px;margin:14px 0;display:block;" data-autoalt="${!file.name ? 'true' : 'false'}" />`)
      } catch { /* ignore */ }
    }
    input.click()
  }

  function insertLink() {
    const url = prompt('ใส่ URL:', 'https://')
    if (url) exec('createLink', url)
  }

  const ToolBtn = ({ icon, cmd, val, title, onClick }: {
    icon: string; cmd?: string; val?: string; title: string; onClick?: () => void
  }) => (
    <button
      onMouseDown={e => { e.preventDefault(); onClick ? onClick() : exec(cmd!, val) }}
      title={title}
      style={{
        width: 32, height: 32, border: 'none', background: 'none', borderRadius: 7,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#334155', transition: 'background .12s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f0f7f4' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
    >
      {icon.length <= 3
        ? <span style={{ fontSize: 13, fontWeight: 800 }}>{icon}</span>
        : <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{icon}</span>
      }
    </button>
  )

  const Sep = () => <div style={{ width: 1, height: 22, background: '#e2e8f0', margin: '0 4px', flexShrink: 0 }} />

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 13, overflow: 'hidden', background: '#fff' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2, padding: '8px 12px',
        borderBottom: '1px solid #eef0ef', background: '#fafafa', flexWrap: 'wrap',
      }}>
        <ToolBtn icon="B" cmd="bold" title="Bold (Ctrl+B)" />
        <ToolBtn icon="I" cmd="italic" title="Italic (Ctrl+I)" />
        <ToolBtn icon="U" cmd="underline" title="Underline" />
        <Sep />
        <ToolBtn icon="H2" cmd="formatBlock" val="h2" title="Heading 2" />
        <ToolBtn icon="H3" cmd="formatBlock" val="h3" title="Heading 3" />
        <ToolBtn icon="P" cmd="formatBlock" val="p" title="ย่อหน้า" />
        <Sep />
        <ToolBtn icon="format_list_bulleted" cmd="insertUnorderedList" title="รายการ (•)" />
        <ToolBtn icon="format_list_numbered" cmd="insertOrderedList" title="รายการ (1.)" />
        <Sep />
        <ToolBtn icon="link" onClick={insertLink} title="ใส่ลิงก์" />
        <ToolBtn icon="add_photo_alternate" onClick={insertBodyImage} title="แทรกรูปภาพ (แปลงเป็น WebP อัตโนมัติ)" />
        <ToolBtn icon="horizontal_rule" cmd="insertHorizontalRule" title="เส้นคั่น" />
        <Sep />
        <ToolBtn icon="format_clear" cmd="removeFormat" title="ล้างรูปแบบ" />
        <ToolBtn icon="undo" cmd="undo" title="Undo" />
        <ToolBtn icon="redo" cmd="redo" title="Redo" />
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML ?? '')}
        style={{
          minHeight: 280, padding: '18px 20px', outline: 'none',
          fontSize: 14.5, lineHeight: 1.8, color: '#334155',
          fontFamily: "'Prompt', -apple-system, sans-serif",
        }}
        onKeyDown={e => {
          // Tab → indent
          if (e.key === 'Tab') { e.preventDefault(); exec('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;') }
        }}
      />

      {/* Style for editor content */}
      <style>{`
        [contenteditable] h2 { font-size:1.35em; font-weight:700; color:#02402e; margin:16px 0 8px; }
        [contenteditable] h3 { font-size:1.12em; font-weight:700; color:#02402e; margin:14px 0 6px; }
        [contenteditable] ul, [contenteditable] ol { padding-left:24px; margin:8px 0; }
        [contenteditable] li { margin:4px 0; }
        [contenteditable] a { color:#048c73; text-decoration:underline; }
        [contenteditable] img { max-width:100%; border-radius:10px; margin:12px 0; display:block; }
        [contenteditable] hr { border:none; border-top:2px solid #eef0ef; margin:18px 0; }
        [contenteditable]:empty:before { content:attr(data-ph); color:#94a3b8; pointer-events:none; }
      `}</style>
    </div>
  )
}

// ── SeoBar ────────────────────────────────────────────────────────────────────

function SeoBar({ score }: { score: number }) {
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

// ── EditDrawer ────────────────────────────────────────────────────────────────

function EditDrawer({ post, onClose, onSave }: {
  post: BlogPost
  onClose: () => void
  onSave: (updated: BlogPost) => Promise<void>
}) {
  const [form, setForm]             = useState<BlogPost>({ ...post })
  const [slugEdited, setSlugEdited] = useState(!!post.slug && post.id !== 'NEW')
  const [saved, setSaved]           = useState(false)
  const [saving, setSaving]         = useState(false)
  const [saveError, setSaveError]   = useState('')
  const [activeTab, setActiveTab]   = useState<'content' | 'seo'>('content')

  function setF(k: keyof BlogPost, v: string) {
    setForm(f => {
      const next = { ...f, [k]: v }
      // Auto-slug from title unless manually edited
      if (k === 'title' && !slugEdited) {
        next.slug = generateSlug(v)
        // Auto alt text for thumbnail if not yet set
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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 11,
    border: '1px solid #e2e8f0', fontSize: 14, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit', color: '#02402e',
  }
  const labelStyle: React.CSSProperties = { fontSize: 12.5, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(2,64,46,0.18)', zIndex: 100, backdropFilter: 'blur(2px)' }} />

      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 640,
        background: '#fff', zIndex: 101, display: 'flex', flexDirection: 'column',
        boxShadow: '-10px 0 50px rgba(2,64,46,0.14)',
      }}>

        {/* Header */}
        <div style={{ padding: '18px 26px', borderBottom: '1px solid #eef0ef', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: '#02402e' }}>
              {post.id === 'NEW' ? 'เพิ่มบทความใหม่' : 'แก้ไขบทความ'}
            </div>
            <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              spacesmate.com/blog/{form.slug || '...'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
            <select value={form.status} onChange={e => setF('status', e.target.value)}
              style={{ padding: '7px 12px', borderRadius: 9, border: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit', color: '#02402e', background: '#fff', cursor: 'pointer' }}>
              <option value="draft">แบบร่าง</option>
              <option value="review">รอตรวจสอบ</option>
              <option value="published">เผยแพร่</option>
            </select>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, lineHeight: 1 }}>
              <span className="msym" style={{ fontSize: 22, color: '#94a3b8', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>close</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #eef0ef', padding: '0 26px', flexShrink: 0 }}>
          {([['content','เนื้อหา & รูปภาพ'],['seo','SEO']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setActiveTab(k)} style={{
              padding: '11px 18px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit',
              color: activeTab === k ? '#02402e' : '#94a3b8',
              borderBottom: activeTab === k ? '2px solid #02402e' : '2px solid transparent',
              marginBottom: -1,
            }}>{l}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {activeTab === 'content' && (
            <>
              {/* Title */}
              <div>
                <label style={labelStyle}>หัวข้อบทความ</label>
                <input
                  value={form.title}
                  onChange={e => setF('title', e.target.value)}
                  style={{ ...inputStyle, fontSize: 15.5, fontWeight: 600 }}
                  placeholder="ชื่อบทความ (ไทย หรือ อังกฤษ)"
                />
              </div>

              {/* Slug + Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>
                    Slug (URL)
                    {!slugEdited && <span style={{ marginLeft: 6, fontSize: 11, color: '#048c73', fontWeight: 500 }}>auto</span>}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      value={form.slug}
                      onChange={e => { setSlugEdited(true); setF('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) }}
                      style={inputStyle}
                      placeholder="auto-generated-from-title"
                    />
                    {slugEdited && (
                      <button
                        onClick={() => { setSlugEdited(false); setF('slug', generateSlug(form.title)) }}
                        title="รีเซ็ตเป็น auto"
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <span className="msym" style={{ fontSize: 16, color: '#94a3b8', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>refresh</span>
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>หมวดหมู่</label>
                  <select value={form.category} onChange={e => setF('category', e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Thumbnail */}
              <ThumbnailUploader
                value={form.thumbnail ?? ''}
                valueAlt={form.thumbnailAlt ?? ''}
                onChange={(src, alt) => setForm(f => ({ ...f, thumbnail: src, thumbnailAlt: alt || f.title }))}
              />

              {/* Rich text editor */}
              <div>
                <label style={labelStyle}>เนื้อหาบทความ</label>
                {/* key forces remount when switching posts so editor re-initialises */}
                <RichEditor
                  key={form.id}
                  initialValue={form.content ?? ''}
                  onChange={html => setForm(f => ({ ...f, content: html }))}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                  <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                    {(form.content ?? '').replace(/<[^>]*>/g, '').length} ตัวอักษร
                  </span>
                </div>
              </div>

              <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 11, fontSize: 12.5, color: '#64748b', lineHeight: 1.6 }}>
                <span className="msym" style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 6, color: '#048c73', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>info</span>
                รูปภาพทุกใบ (thumbnail + รูปในเนื้อหา) จะถูกแปลงเป็น WebP อัตโนมัติ และปรับขนาดให้เหมาะสมก่อน upload
              </div>
            </>
          )}

          {activeTab === 'seo' && (
            <>
              <div>
                <label style={labelStyle}>Meta Title <span style={{ color: '#94a3b8', fontWeight: 400 }}>(สำหรับ Google)</span></label>
                <input value={form.metaTitle ?? ''} onChange={e => setF('metaTitle', e.target.value)} style={inputStyle}
                  placeholder={`${form.title} | SpacesMate`} />
                <div style={{ fontSize: 11.5, color: (form.metaTitle?.length ?? 0) > 60 ? '#ef4444' : '#94a3b8', marginTop: 4 }}>
                  {(form.metaTitle ?? '').length}/60 ตัวอักษร {(form.metaTitle?.length ?? 0) > 60 ? '— ยาวเกินไป' : ''}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Meta Description</label>
                <textarea
                  value={form.metaDesc ?? ''}
                  onChange={e => setF('metaDesc', e.target.value)}
                  rows={3}
                  placeholder="คำอธิบายบทความ 120–160 ตัวอักษร"
                  style={{ ...inputStyle, resize: 'none' }}
                />
                <div style={{ fontSize: 11.5, color: (form.metaDesc?.length ?? 0) > 160 ? '#ef4444' : '#94a3b8', marginTop: 4 }}>
                  {(form.metaDesc ?? '').length}/160 ตัวอักษร
                </div>
              </div>

              {form.thumbnail && (
                <div>
                  <label style={labelStyle}>OG Image Preview</label>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.thumbnail} alt={form.thumbnailAlt} style={{ width: '100%', maxHeight: 160, objectFit: 'cover', display: 'block' }} />
                    <div style={{ padding: '10px 14px', background: '#f8fafc' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#02402e' }}>{form.metaTitle || form.title}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{form.metaDesc || '—'}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>spacesmate.com</div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label style={labelStyle}>SEO Score ปัจจุบัน</label>
                <div style={{ padding: '16px 18px', background: '#f8fafc', borderRadius: 12 }}>
                  <SeoBar score={form.seoScore} />
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 10, lineHeight: 1.6 }}>
                    {form.seoScore < 60 && 'Score ต่ำ — ควรเพิ่ม keyword density, alt text ของรูป, และ internal links'}
                    {form.seoScore >= 60 && form.seoScore < 80 && 'ดีขึ้นได้ — เพิ่ม meta description, headings H2/H3, และ length ของบทความ'}
                    {form.seoScore >= 80 && 'SEO Score ดี — อัปเดตเนื้อหาทุก 6 เดือนเพื่อรักษา ranking'}
                  </div>
                </div>
              </div>

              <div>
                <label style={labelStyle}>URL (Canonical)</label>
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 11, fontSize: 13, color: '#64748b', wordBreak: 'break-all' }}>
                  https://spacesmate.com/blog/{form.slug || '—'}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Thumbnail Alt Text <span style={{ color: '#94a3b8', fontWeight: 400 }}>(auto จากหัวข้อ)</span></label>
                <input
                  value={form.thumbnailAlt ?? ''}
                  onChange={e => setForm(f => ({ ...f, thumbnailAlt: e.target.value }))}
                  placeholder={form.title || 'คำอธิบายรูปภาพหลัก'}
                  style={inputStyle}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 26px', borderTop: '1px solid #eef0ef', flexShrink: 0 }}>
          {saveError && (
            <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 10, textAlign: 'right' }}>{saveError}</div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={onClose} disabled={saving} style={{
              padding: '10px 22px', borderRadius: 11, border: '1px solid #e2e8f0',
              background: '#fff', color: '#64748b', fontWeight: 600, fontSize: 13.5,
              cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.5 : 1,
            }}>ยกเลิก</button>
            <button onClick={handleSave} disabled={saving} style={{
              padding: '10px 28px', borderRadius: 11, border: 'none',
              background: saved ? '#22c55e' : '#02402e', color: '#fff', fontWeight: 600,
              fontSize: 13.5, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 8, transition: 'background .25s',
              opacity: saving ? 0.75 : 1,
            }}>
              <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 400, 'FILL' 0", animation: saving ? 'spin .8s linear infinite' : 'none' }}>
                {saving ? 'progress_activity' : saved ? 'check' : 'save'}
              </span>
              {saving ? 'กำลังบันทึก...' : saved ? 'บันทึกแล้ว' : 'บันทึก'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BlogPage() {
  const [posts, setPosts]           = useState<BlogPost[]>([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('')
  const [search, setSearch]         = useState('')
  const [editing, setEditing]       = useState<BlogPost | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  // ── Load posts from Supabase on mount ──────────────────────────────────────
  useEffect(() => {
    fetch('/api/dashboard/blog')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d.posts)) setPosts(d.posts) })
      .catch(err => console.error('Failed to load blog posts:', err))
      .finally(() => setLoading(false))
  }, [])

  const displayed = posts.filter(p => {
    if (filter && p.status !== filter) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // ── Create or update a post via API ────────────────────────────────────────
  async function handleSave(updated: BlogPost): Promise<void> {
    const token = await getToken()
    if (updated.id === 'NEW') {
      const r = await fetch('/api/dashboard/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updated),
      })
      if (!r.ok) {
        const d = await r.json().catch(() => ({}))
        throw new Error((d as { error?: string }).error ?? 'บันทึกไม่สำเร็จ')
      }
      const { post } = await r.json() as { post: BlogPost }
      setPosts(prev => [post, ...prev])
      setShowCreate(false)
    } else {
      const r = await fetch(`/api/dashboard/blog/${updated.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updated),
      })
      if (!r.ok) {
        const d = await r.json().catch(() => ({}))
        throw new Error((d as { error?: string }).error ?? 'บันทึกไม่สำเร็จ')
      }
      setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))
      setEditing(null)
    }
  }

  // ── Quick-publish from the post list ───────────────────────────────────────
  async function quickPublish(post: BlogPost) {
    const token = await getToken()
    await fetch(`/api/dashboard/blog/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'published' }),
    })
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'published' } : p))
  }

  // ── Delete a post ───────────────────────────────────────────────────────────
  async function deletePost(post: BlogPost) {
    if (!confirm(`ลบบทความ "${post.title}"?\nการลบไม่สามารถยกเลิกได้`)) return
    const token = await getToken()
    await fetch(`/api/dashboard/blog/${post.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setPosts(prev => prev.filter(p => p.id !== post.id))
  }

  const published  = posts.filter(p => p.status === 'published').length
  const totalViews = posts.reduce((s, p) => s + p.views, 0)
  const avgSeo     = posts.length > 0
    ? Math.round(posts.reduce((s, p) => s + p.seoScore, 0) / posts.length)
    : 0

  const KPI = [
    { label: 'เผยแพร่แล้ว',    value: published,                    icon: 'check_circle', bg: '#dcfce7', color: '#15803d' },
    { label: 'ยอดวิวทั้งหมด',  value: totalViews.toLocaleString(),  icon: 'visibility',   bg: '#e0f2f9', color: '#0284c7' },
    { label: 'SEO Score เฉลี่ย', value: `${avgSeo}/100`,             icon: 'search',       bg: '#e8f5f0', color: '#048c73' },
    { label: 'บทความทั้งหมด',  value: posts.length,                 icon: 'description',  bg: '#fff6e9', color: '#d97f11' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 3px', color: '#02402e' }}>บทความ</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>จัดการบล็อกและ SEO ของ spacesmate.com</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{
          padding: '10px 20px', borderRadius: 12, border: 'none',
          background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
        }}>
          <span className="msym" style={{ fontSize: 19, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>add</span>
          เพิ่มบทความใหม่
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 22 }}>
        {KPI.map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="msym" style={{ fontSize: 21, color: k.color, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{k.icon}</span>
            </span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#02402e', lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 3 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[{ v: '', l: 'ทั้งหมด' }, { v: 'published', l: 'เผยแพร่' }, { v: 'draft', l: 'แบบร่าง' }, { v: 'review', l: 'รอตรวจ' }].map(o => (
            <button key={o.v} onClick={() => setFilter(o.v)} style={{
              padding: '7px 15px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontSize: 12.5, fontWeight: 500, fontFamily: 'inherit',
              background: filter === o.v ? '#02402e' : '#f4f6f5',
              color: filter === o.v ? '#fff' : '#334155',
            }}>{o.l}</button>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <span className="msym" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 17, color: '#94a3b8', fontVariationSettings: "'wght' 300, 'FILL' 0", pointerEvents: 'none' }}>search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาบทความ..."
            style={{ width: '100%', padding: '8px 14px 8px 38px', borderRadius: 10, border: '1px solid #eef0ef', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Post list */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 20px -12px rgba(2,64,46,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eef0ef' }}>
              {['บทความ', 'หมวดหมู่', 'สถานะ', 'SEO Score', 'ยอดวิว', 'วันที่', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((post, i) => {
              const s = STATUS_MAP[post.status]
              return (
                <tr key={post.id} style={{ borderBottom: i < displayed.length - 1 ? '1px solid #f1f5f4' : 'none' }}>
                  <td style={{ padding: '12px 16px', maxWidth: 300 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {post.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.thumbnail} alt={post.thumbnailAlt} style={{ width: 44, height: 32, objectFit: 'cover', borderRadius: 7, flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 44, height: 32, borderRadius: 7, background: '#f0f7f4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span className="msym" style={{ fontSize: 16, color: '#c8e6da', fontVariationSettings: "'wght' 200, 'FILL' 0" }}>image</span>
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: '#02402e', lineHeight: 1.35 }}>{post.title}</div>
                        <div style={{ fontSize: 11.5, color: '#94a3b8' }}>/{post.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 13 }}>{post.category}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>
                  </td>
                  <td style={{ padding: '12px 16px', minWidth: 120 }}><SeoBar score={post.seoScore} /></td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#02402e' }}>{post.views > 0 ? post.views.toLocaleString() : '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 12.5, whiteSpace: 'nowrap' }}>
                    {new Date(post.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => setEditing(post)} style={{
                        padding: '7px 14px', borderRadius: 9, border: '1px solid #e2e8f0',
                        background: '#fff', color: '#02402e', fontSize: 12.5, fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit',
                      }}>
                        <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>edit</span>
                        แก้ไข
                      </button>
                      {post.status === 'draft' && (
                        <button onClick={() => quickPublish(post)}
                          style={{ padding: '7px 14px', borderRadius: 9, border: 'none', background: '#02402e', color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                          เผยแพร่
                        </button>
                      )}
                      <button onClick={() => deletePost(post)} style={{
                        padding: '7px 10px', borderRadius: 9, border: '1px solid #fecaca',
                        background: '#fff', color: '#ef4444', fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center',
                      }}>
                        <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {loading && (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
            <div style={{ width: 28, height: 28, border: '3px solid #eef0ef', borderTopColor: '#048c73', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 10px' }} />
            กำลังโหลดบทความ...
          </div>
        )}
        {!loading && displayed.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>ไม่พบบทความ</div>
        )}
      </div>

      {/* Drawer */}
      {(editing || showCreate) && (
        <EditDrawer
          post={editing ?? {
            id: 'NEW', title: '', slug: '', category: 'คู่มือผู้เช่า',
            status: 'draft', seoScore: 0, views: 0,
            date: new Date().toISOString().slice(0, 10), author: 'SpacesMate',
            content: '', thumbnail: '', thumbnailAlt: '', metaTitle: '', metaDesc: '',
          }}
          onClose={() => { setEditing(null); setShowCreate(false) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
