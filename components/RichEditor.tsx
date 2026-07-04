'use client'

/**
 * RichEditor — shared rich text editor for SpacesMate admin + owner dashboards.
 *
 * Uses the native contentEditable + execCommand API (works in all modern browsers).
 * Key upgrade over the old inline editors: live active-state highlighting on toolbar
 * buttons — Bold/Italic/Underline/H2/H3/lists all glow green when the cursor is inside
 * the corresponding format.
 *
 * Props
 * ─────
 * value?          — controlled HTML string (listings, owner-dashboard)
 * initialValue?   — uncontrolled initial HTML (blog editor; set once on mount)
 * onChange        — fires on every edit with the current innerHTML
 * placeholder?    — grey placeholder text (default: 'อธิบายรายละเอียด...')
 * minHeight?      — editor min-height in px (default: 140)
 * showLink?       — add Link button
 * showImage?      — add Image button (requires onImageClick)
 * onImageClick?   — called when image button clicked; receives insertHtml helper
 * showHr?         — add Horizontal Rule button
 * showUndoRedo?   — add Undo / Redo buttons
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export interface RichEditorProps {
  value?: string
  initialValue?: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  showLink?: boolean
  showImage?: boolean
  onImageClick?: (insertHtml: (html: string) => void) => void
  showHr?: boolean
  showUndoRedo?: boolean
}

export default function RichEditor({
  value,
  initialValue,
  onChange,
  placeholder = 'อธิบายรายละเอียด...',
  minHeight = 140,
  showLink = false,
  showImage = false,
  onImageClick,
  showHr = false,
  showUndoRedo = false,
}: RichEditorProps) {
  const ref = useRef<HTMLDivElement>(null)

  // active format keys for toolbar highlighting
  const [fmts, setFmts] = useState<Set<string>>(new Set())

  // ── Mount: set initial HTML once (never re-run to avoid cursor reset) ──────
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = value ?? initialValue ?? ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Controlled mode: reset when parent clears value ────────────────────────
  useEffect(() => {
    if (value === '' && ref.current && ref.current.innerHTML !== '') {
      ref.current.innerHTML = ''
    }
  }, [value])

  // ── Read active formats from current selection ─────────────────────────────
  const refreshFmts = useCallback(() => {
    try {
      const f = new Set<string>()
      if (document.queryCommandState('bold'))               f.add('bold')
      if (document.queryCommandState('italic'))             f.add('italic')
      if (document.queryCommandState('underline'))          f.add('underline')
      if (document.queryCommandState('insertUnorderedList')) f.add('ul')
      if (document.queryCommandState('insertOrderedList'))   f.add('ol')
      const blk = document.queryCommandValue('formatBlock')
        .toLowerCase().replace(/^<|>$/g, '')
      if (blk) f.add('blk:' + blk)
      setFmts(f)
    } catch { /* safe in SSR/test */ }
  }, [])

  // ── Core command executor ──────────────────────────────────────────────────
  const exec = useCallback((cmd: string, arg?: string) => {
    ref.current?.focus()
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    document.execCommand(cmd, false, arg)
    onChange(ref.current?.innerHTML ?? '')
    refreshFmts()
  }, [onChange, refreshFmts])

  // ── Insert raw HTML at cursor (used by image callback) ─────────────────────
  const insertHtml = useCallback((html: string) => {
    exec('insertHTML', html)
  }, [exec])

  // ── Link prompt ────────────────────────────────────────────────────────────
  const handleLink = useCallback(() => {
    const url = prompt('ใส่ URL:', 'https://')
    if (url) exec('createLink', url)
  }, [exec])

  // ── Toolbar helpers ────────────────────────────────────────────────────────
  const isOn = (key: string) => fmts.has(key)

  const btnBase = (active: boolean): React.CSSProperties => ({
    width: 32, height: 32, border: 'none', flexShrink: 0,
    background: active ? '#d1f0e6' : 'transparent',
    borderRadius: 7, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: active ? '#02402e' : '#64748b',
    transition: 'background .12s, color .12s',
  })

  /** Separator line */
  const Sep = () => (
    <div style={{ width: 1, height: 22, background: '#e2e8f0', margin: '0 4px', flexShrink: 0 }} />
  )

  /**
   * A single toolbar button — rendered inline to avoid React re-mounting
   * on every render (which happens when sub-components are defined inside
   * the parent function).
   */
  const makeBtn = (
    key: string,
    active: boolean,
    title: string,
    icon: string,
    onClick: () => void,
  ) => (
    <button
      key={key}
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick() }}
      style={btnBase(active)}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = '#f0f7f4'
      }}
      onMouseLeave={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
      }}
    >
      {icon.length <= 3
        /* short label like B, I, U, H2, H3, P */
        ? <span style={{ fontSize: 12.5, fontWeight: 800, lineHeight: 1, fontFamily: 'inherit' }}>{icon}</span>
        /* Material Symbol name */
        : <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{icon}</span>
      }
    </button>
  )

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 13, overflow: 'hidden', background: '#fff' }}>

      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2, padding: '8px 12px',
        borderBottom: '1px solid #eef0ef', background: '#fafafa',
        flexWrap: 'wrap', rowGap: 4,
      }}>
        {/* Inline formatting */}
        {makeBtn('bold',      isOn('bold'),      'Bold (Ctrl+B)',      'B',  () => exec('bold'))}
        {makeBtn('italic',    isOn('italic'),    'Italic (Ctrl+I)',    'I',  () => exec('italic'))}
        {makeBtn('underline', isOn('underline'), 'Underline (Ctrl+U)', 'U',  () => exec('underline'))}

        <Sep />

        {/* Block type */}
        {makeBtn('h2', isOn('blk:h2'), 'Heading 2', 'H2', () => exec('formatBlock', 'h2'))}
        {makeBtn('h3', isOn('blk:h3'), 'Heading 3', 'H3', () => exec('formatBlock', 'h3'))}
        {makeBtn('p',  isOn('blk:p') || isOn('blk:div'), 'ย่อหน้า', 'P', () => exec('formatBlock', 'p'))}

        <Sep />

        {/* Lists */}
        {makeBtn('ul', isOn('ul'), 'รายการ (•)',  'format_list_bulleted', () => exec('insertUnorderedList'))}
        {makeBtn('ol', isOn('ol'), 'รายการ (1.)', 'format_list_numbered', () => exec('insertOrderedList'))}

        {/* Optional: link */}
        {showLink && (
          <>
            <Sep />
            {makeBtn('link', false, 'ใส่ลิงก์', 'link', handleLink)}
          </>
        )}

        {/* Optional: image */}
        {showImage && onImageClick &&
          makeBtn('img', false, 'แทรกรูปภาพ (WebP)', 'add_photo_alternate', () => onImageClick(insertHtml))
        }

        {/* Optional: horizontal rule */}
        {showHr &&
          makeBtn('hr', false, 'เส้นคั่น', 'horizontal_rule', () => exec('insertHorizontalRule'))
        }

        <Sep />

        {/* Clear format */}
        {makeBtn('clear', false, 'ล้างรูปแบบ', 'format_clear', () => exec('removeFormat'))}

        {/* Optional: undo / redo */}
        {showUndoRedo && (
          <>
            {makeBtn('undo', false, 'Undo (Ctrl+Z)', 'undo', () => exec('undo'))}
            {makeBtn('redo', false, 'Redo (Ctrl+Y)', 'redo', () => exec('redo'))}
          </>
        )}
      </div>

      {/* ── Editable area ── */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => {
          onChange(ref.current?.innerHTML ?? '')
          refreshFmts()
        }}
        onKeyUp={refreshFmts}
        onMouseUp={refreshFmts}
        onKeyDown={e => {
          // Tab → 4-space indent
          if (e.key === 'Tab') {
            e.preventDefault()
            exec('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;')
          }
        }}
        style={{
          minHeight,
          padding: '14px 16px',
          fontSize: 14,
          lineHeight: 1.8,
          color: '#334155',
          fontFamily: "'Prompt', -apple-system, sans-serif",
          outline: 'none',
        }}
      />

      {/* Scoped styles for editor content */}
      <style>{`
        [contenteditable][data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
          font-style: normal;
        }
        [contenteditable] h2 {
          font-size: 1.25em; font-weight: 700; color: #02402e; margin: .8em 0 .3em;
        }
        [contenteditable] h3 {
          font-size: 1.08em; font-weight: 600; color: #1e293b; margin: .6em 0 .25em;
        }
        [contenteditable] ul  { padding-left: 1.6em; margin: .4em 0; list-style-type: disc; }
        [contenteditable] ol  { padding-left: 1.6em; margin: .4em 0; list-style-type: decimal; }
        [contenteditable] li  { margin-bottom: 3px; display: list-item; }
        [contenteditable] a   { color: #048c73; text-decoration: underline; }
        [contenteditable] hr  { border: none; border-top: 1.5px solid #e2e8f0; margin: 16px 0; }
        [contenteditable] img { max-width: 100%; border-radius: 10px; margin: 12px 0; display: block; }
        [contenteditable] strong,
        [contenteditable] b   { font-weight: 700; }
        [contenteditable] em,
        [contenteditable] i   { font-style: italic; }
      `}</style>
    </div>
  )
}
