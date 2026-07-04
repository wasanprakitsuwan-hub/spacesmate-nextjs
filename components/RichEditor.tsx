'use client'

/**
 * RichEditor — unified rich text editor for all SpacesMate editors.
 *
 * Full TinyMCE-style toolbar:
 *   B · I · U  |  H2 · H3 · P  |  Align ←·↑·→  |  • list · 1. list
 *   |  Link · HR  |  Image (blog only)  |  Clear · Undo · Redo
 *
 * Props
 * ─────
 * value?          — controlled HTML string
 * initialValue?   — uncontrolled initial HTML (set once on mount)
 * onChange        — fires on every edit with current innerHTML
 * placeholder?    — grey placeholder text
 * minHeight?      — editor area min-height in px (default: 200)
 * showImage?      — show image-insert button (blog editor only)
 * onImageClick?   — called when image button clicked; receives insertHtml helper
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export interface RichEditorProps {
  value?: string
  initialValue?: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  showImage?: boolean
  onImageClick?: (insertHtml: (html: string) => void) => void
}

export default function RichEditor({
  value,
  initialValue,
  onChange,
  placeholder = 'อธิบายรายละเอียด...',
  minHeight = 200,
  showImage = false,
  onImageClick,
}: RichEditorProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [fmts, setFmts] = useState<Set<string>>(new Set())

  // Mount once — never re-run (prevents cursor reset)
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value ?? initialValue ?? ''
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Controlled mode: reset when value is cleared externally
  useEffect(() => {
    if (value === '' && ref.current && ref.current.innerHTML !== '') {
      ref.current.innerHTML = ''
    }
  }, [value])

  // Detect active formats from current cursor / selection
  const refreshFmts = useCallback(() => {
    try {
      const f = new Set<string>()
      if (document.queryCommandState('bold'))               f.add('bold')
      if (document.queryCommandState('italic'))             f.add('italic')
      if (document.queryCommandState('underline'))          f.add('underline')
      if (document.queryCommandState('insertUnorderedList')) f.add('ul')
      if (document.queryCommandState('insertOrderedList'))   f.add('ol')
      if (document.queryCommandState('justifyLeft'))         f.add('left')
      if (document.queryCommandState('justifyCenter'))       f.add('center')
      if (document.queryCommandState('justifyRight'))        f.add('right')
      const blk = document.queryCommandValue('formatBlock').toLowerCase().replace(/^<|>$/g, '')
      if (blk) f.add('blk:' + blk)
      setFmts(f)
    } catch { /* safe in SSR */ }
  }, [])

  const exec = useCallback((cmd: string, arg?: string) => {
    ref.current?.focus()
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    document.execCommand(cmd, false, arg)
    onChange(ref.current?.innerHTML ?? '')
    refreshFmts()
  }, [onChange, refreshFmts])

  const insertHtml = useCallback((html: string) => exec('insertHTML', html), [exec])

  const handleLink = useCallback(() => {
    const url = prompt('ใส่ URL:', 'https://')
    if (url) exec('createLink', url)
  }, [exec])

  // ── Toolbar style helpers ──────────────────────────────────────────────────
  const on = (key: string) => fmts.has(key)

  const btnSt = (active: boolean, danger = false): React.CSSProperties => ({
    width: 30, height: 28, border: 'none', flexShrink: 0,
    background: active ? '#dcf5ed' : 'transparent',
    borderRadius: 5, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: active ? '#02402e' : danger ? '#94a3b8' : '#475569',
    transition: 'background .1s, color .1s',
  })

  const hoverOn  = (e: React.MouseEvent, active: boolean) => {
    if (!active) (e.currentTarget as HTMLElement).style.background = '#f0f7f4'
  }
  const hoverOff = (e: React.MouseEvent, active: boolean) => {
    if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
  }

  /** Vertical separator */
  const Sep = () => (
    <div style={{ width: 1, height: 18, background: '#dde1e6', margin: '0 3px', flexShrink: 0 }} />
  )

  /**
   * A single toolbar button — defined as an inline render call (not a
   * sub-component) to avoid React re-mounting on every render cycle.
   */
  const btn = (
    key: string,
    active: boolean,
    title: string,
    icon: string,
    onClick: () => void,
    danger = false,
  ) => (
    <button
      key={key}
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick() }}
      style={btnSt(active, danger)}
      onMouseEnter={e => hoverOn(e, active)}
      onMouseLeave={e => hoverOff(e, active)}
    >
      {icon.length <= 3
        ? <span style={{ fontSize: 11.5, fontWeight: 800, lineHeight: 1, userSelect: 'none' }}>{icon}</span>
        : <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 300, 'FILL' 0", userSelect: 'none' }}>{icon}</span>
      }
    </button>
  )

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      border: '1px solid #d1d9e0',
      borderRadius: 10,
      overflow: 'hidden',
      background: '#fff',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>

      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap',
        gap: 1, rowGap: 4, padding: '6px 10px',
        borderBottom: '1px solid #e8ecf0',
        background: 'linear-gradient(to bottom, #f7f9fb, #f1f4f7)',
      }}>

        {/* Inline: Bold / Italic / Underline */}
        {btn('bold',      on('bold'),      'Bold (Ctrl+B)',      'B',  () => exec('bold'))}
        {btn('italic',    on('italic'),    'Italic (Ctrl+I)',    'I',  () => exec('italic'))}
        {btn('underline', on('underline'), 'Underline (Ctrl+U)', 'U',  () => exec('underline'))}

        <Sep />

        {/* Block type: H2 / H3 / Paragraph */}
        {btn('h2', on('blk:h2'), 'Heading 2', 'H2', () => exec('formatBlock', 'h2'))}
        {btn('h3', on('blk:h3'), 'Heading 3', 'H3', () => exec('formatBlock', 'h3'))}
        {btn('p',  on('blk:p') || on('blk:div'), 'Paragraph', 'P', () => exec('formatBlock', 'p'))}

        <Sep />

        {/* Alignment */}
        {btn('left',   on('left'),   'จัดชิดซ้าย',   'format_align_left',    () => exec('justifyLeft'))}
        {btn('center', on('center'), 'จัดกึ่งกลาง',  'format_align_center',  () => exec('justifyCenter'))}
        {btn('right',  on('right'),  'จัดชิดขวา',    'format_align_right',   () => exec('justifyRight'))}

        <Sep />

        {/* Lists */}
        {btn('ul', on('ul'), 'รายการ (•)',  'format_list_bulleted', () => exec('insertUnorderedList'))}
        {btn('ol', on('ol'), 'รายการ (1.)', 'format_list_numbered', () => exec('insertOrderedList'))}

        <Sep />

        {/* Link */}
        {btn('link', false, 'ใส่ลิงก์', 'link', handleLink)}

        {/* Image — blog only */}
        {showImage && onImageClick &&
          btn('img', false, 'แทรกรูปภาพ (WebP)', 'add_photo_alternate', () => onImageClick(insertHtml))
        }

        {/* HR */}
        {btn('hr', false, 'เส้นคั่น', 'horizontal_rule', () => exec('insertHorizontalRule'))}

        <Sep />

        {/* Clear / Undo / Redo */}
        {btn('clear', false, 'ล้างรูปแบบ', 'format_clear', () => exec('removeFormat'), true)}
        {btn('undo',  false, 'Undo (Ctrl+Z)', 'undo',  () => exec('undo'),  true)}
        {btn('redo',  false, 'Redo (Ctrl+Y)', 'redo',  () => exec('redo'),  true)}
      </div>

      {/* ── Editor area ── */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => { onChange(ref.current?.innerHTML ?? ''); refreshFmts() }}
        onKeyUp={refreshFmts}
        onMouseUp={refreshFmts}
        onKeyDown={e => {
          if (e.key === 'Tab') { e.preventDefault(); exec('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;') }
        }}
        style={{
          minHeight,
          padding: '16px 18px',
          fontSize: 14,
          lineHeight: 1.85,
          color: '#1e293b',
          fontFamily: "'Prompt', -apple-system, sans-serif",
          outline: 'none',
          background: '#fff',
        }}
      />

      {/* Content styles — override Tailwind preflight for list markers */}
      <style>{`
        [contenteditable][data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: #9aa5b4;
          pointer-events: none;
        }
        [contenteditable] h2 {
          font-size: 1.22em; font-weight: 700; color: #02402e; margin: .85em 0 .3em;
        }
        [contenteditable] h3 {
          font-size: 1.07em; font-weight: 600; color: #1e293b; margin: .65em 0 .25em;
        }
        [contenteditable] ul  { padding-left: 1.6em; margin: .4em 0; list-style-type: disc; }
        [contenteditable] ol  { padding-left: 1.6em; margin: .4em 0; list-style-type: decimal; }
        [contenteditable] li  { margin-bottom: 4px; display: list-item; }
        [contenteditable] a   { color: #048c73; text-decoration: underline; }
        [contenteditable] hr  { border: none; border-top: 1.5px solid #e2e8f0; margin: 16px 0; }
        [contenteditable] img { max-width: 100%; border-radius: 10px; margin: 12px 0; display: block; }
        [contenteditable] strong, [contenteditable] b { font-weight: 700; }
        [contenteditable] em, [contenteditable] i     { font-style: italic; }
        [contenteditable] u   { text-decoration: underline; }
      `}</style>
    </div>
  )
}
