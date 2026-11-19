'use client'

/**
 * RichEditor — unified rich text editor for all SpacesMate editors.
 *
 * Full TinyMCE-style toolbar:
 *   B · I · U  |  H2 · H3 · P  |  Align ←·↑·→  |  • list · 1. list
 *   |  Link · HR  |  Image (blog only)  |  Clear · Undo · Redo
 *
 * Links open an inline panel (text, URL, new tab) instead of a browser
 * prompt, so an existing link can be changed or removed: put the cursor in
 * it, or click it, and the panel opens filled in. Ctrl/Cmd+K opens it too.
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
  /** Toolbar tooltips and the link prompt. Thai by default. */
  locale?: 'th' | 'en'
}

export default function RichEditor({
  value,
  initialValue,
  onChange,
  placeholder,
  minHeight = 200,
  showImage = false,
  onImageClick,
  locale = 'th',
}: RichEditorProps) {
  // The toolbar is icon-only, so these tooltips are the only text explaining
  // what each button does — which makes them the whole affordance for anyone
  // who does not recognise the icon, not decoration.
  const L = locale === 'en'
    ? { ph: 'Describe the details…', url: 'Enter a URL:', left: 'Align left', center: 'Align centre',
        right: 'Align right', bullet: 'Bulleted list', number: 'Numbered list', bold: 'Bold',
        italic: 'Italic', underline: 'Underline', link: 'Link', clear: 'Clear formatting',
        undo: 'Undo', redo: 'Redo', image: 'Insert image', divider: 'Divider',
        linkText: 'Link text', linkUrl: 'URL', newTab: 'Open in a new tab', apply: 'Apply link',
        unlink: 'Remove link', cancel: 'Cancel', needUrl: 'Enter a URL first.', editLink: 'Edit link',
        addLink: 'Add link', linkHint: 'For pages on SpacesMate you can type just the path, e.g. /search' }
    : { ph: 'อธิบายรายละเอียด...', url: 'ใส่ URL:', left: 'จัดชิดซ้าย', center: 'จัดกึ่งกลาง',
        right: 'จัดชิดขวา', bullet: 'รายการ (•)', number: 'รายการ (1.)', bold: 'ตัวหนา',
        italic: 'ตัวเอียง', underline: 'ขีดเส้นใต้', link: 'ลิงก์', clear: 'ล้างรูปแบบ',
        undo: 'ย้อนกลับ', redo: 'ทำซ้ำ', image: 'แทรกรูปภาพ', divider: 'เส้นคั่น',
        linkText: 'ข้อความที่แสดง', linkUrl: 'URL', newTab: 'เปิดในแท็บใหม่', apply: 'บันทึกลิงก์',
        unlink: 'ลบลิงก์', cancel: 'ยกเลิก', needUrl: 'กรุณาใส่ URL ก่อน', editLink: 'แก้ไขลิงก์',
        addLink: 'เพิ่มลิงก์', linkHint: 'ลิงก์ไปหน้าใน SpacesMate ใส่แค่ path ได้ เช่น /search' }
  const ph = placeholder ?? L.ph
  const ref = useRef<HTMLDivElement>(null)
  const [fmts, setFmts] = useState<Set<string>>(new Set())
  const [link, setLink] = useState<LinkDraft | null>(null)
  const [linkErr, setLinkErr] = useState(false)
  /** Selection at the moment the link panel opened; focus moves to the panel inputs after that. */
  const savedRange = useRef<Range | null>(null)
  const urlInput = useRef<HTMLInputElement>(null)

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

  /**
   * Open the link panel. With `target` (a link that was clicked) or a cursor
   * inside a link, the panel edits that link; otherwise it adds a new one
   * around the selected text, or at the cursor.
   */
  const openLink = useCallback((target?: HTMLAnchorElement | null, focusUrl = true) => {
    const root = ref.current
    if (!root) return
    const sel = window.getSelection()
    let range: Range | null = sel && sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null
    if (range && !root.contains(range.commonAncestorContainer)) range = null

    let a: HTMLAnchorElement | null = target ?? null
    if (!a && range) {
      const n = range.startContainer
      const el = n.nodeType === Node.ELEMENT_NODE ? (n as Element) : n.parentElement
      const found = el?.closest('a')
      a = found && root.contains(found) ? (found as HTMLAnchorElement) : null
    }
    savedRange.current = range
    setLinkErr(false)
    if (a) {
      const text = a.textContent ?? ''
      setLink({ anchor: a, text, origText: text, url: a.getAttribute('href') ?? '', newTab: a.getAttribute('target') === '_blank', focus: focusUrl })
    } else {
      const text = range?.toString() ?? ''
      setLink({ anchor: null, text, origText: text, url: 'https://', newTab: false, focus: focusUrl })
    }
  }, [])

  const closeLink = useCallback(() => {
    setLink(null)
    setLinkErr(false)
    savedRange.current = null
  }, [])

  /** Put the caret back where it was when the panel opened (or at the end). */
  const restoreRange = useCallback((): Range | null => {
    const root = ref.current
    if (!root) return null
    root.focus()
    const sel = window.getSelection()
    let range = savedRange.current
    if (!range || !root.contains(range.commonAncestorContainer)) {
      range = document.createRange()
      range.selectNodeContents(root)
      range.collapse(false)
    }
    sel?.removeAllRanges()
    sel?.addRange(range)
    return range
  }, [])

  const applyLink = useCallback(() => {
    const root = ref.current
    if (!root || !link) return
    const href = normaliseUrl(link.url)
    if (!href) { setLinkErr(true); urlInput.current?.focus(); return }
    const text = link.text.trim()
    const a = link.anchor

    if (a && root.contains(a)) {
      // Edit in place: keeps any formatting inside the link unless the text changed.
      a.setAttribute('href', href)
      setNewTab(a, link.newTab)
      if (text && text !== link.origText.trim()) a.textContent = text
    } else {
      const range = restoreRange()
      if (range && !range.collapsed && text === link.origText.trim()) {
        // Selected text unchanged: wrap it, keeping bold/italic inside.
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        document.execCommand('createLink', false, href)
        const sel = window.getSelection()
        root.querySelectorAll('a').forEach(el => {
          if (el.getAttribute('href') === href && sel?.containsNode(el, true)) setNewTab(el, link.newTab)
        })
      } else {
        const attrs = link.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        document.execCommand('insertHTML', false, `<a href="${escapeHtml(href)}"${attrs}>${escapeHtml(text || href)}</a>`)
      }
    }
    onChange(root.innerHTML)
    closeLink()
    refreshFmts()
  }, [link, onChange, closeLink, restoreRange, refreshFmts])

  const removeLink = useCallback(() => {
    const root = ref.current
    if (!root || !link) return
    const a = link.anchor
    if (a && root.contains(a) && a.parentNode) {
      const parent = a.parentNode
      while (a.firstChild) parent.insertBefore(a.firstChild, a)
      parent.removeChild(a)
    } else {
      // A selection that covers one or more links.
      restoreRange()
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      document.execCommand('unlink')
    }
    onChange(root.innerHTML)
    closeLink()
  }, [link, onChange, closeLink, restoreRange])

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
        {btn('left',   on('left'),   L.left,   'format_align_left',    () => exec('justifyLeft'))}
        {btn('center', on('center'), L.center,  'format_align_center',  () => exec('justifyCenter'))}
        {btn('right',  on('right'),  L.right,    'format_align_right',   () => exec('justifyRight'))}

        <Sep />

        {/* Lists */}
        {btn('ul', on('ul'), L.bullet,  'format_list_bulleted', () => exec('insertUnorderedList'))}
        {btn('ol', on('ol'), L.number, 'format_list_numbered', () => exec('insertOrderedList'))}

        <Sep />

        {/* Link */}
        {btn('link', !!link, L.link + ' (Ctrl+K)', 'link', () => openLink())}

        {/* Image — blog only */}
        {showImage && onImageClick &&
          btn('img', false, L.image, 'add_photo_alternate', () => onImageClick(insertHtml))
        }

        {/* HR */}
        {btn('hr', false, L.divider, 'horizontal_rule', () => exec('insertHorizontalRule'))}

        <Sep />

        {/* Clear / Undo / Redo */}
        {btn('clear', false, L.clear, 'format_clear', () => exec('removeFormat'), true)}
        {btn('undo',  false, 'Undo (Ctrl+Z)', 'undo',  () => exec('undo'),  true)}
        {btn('redo',  false, 'Redo (Ctrl+Y)', 'redo',  () => exec('redo'),  true)}
      </div>

      {/* ── Link panel ── */}
      {link && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 10,
          padding: '10px 12px', borderBottom: '1px solid #e8ecf0', background: '#f7faf9',
          fontFamily: "'Prompt', -apple-system, sans-serif",
        }}>
          <div style={{ width: '100%', fontSize: 12.5, fontWeight: 600, color: '#02402e' }}>
            {link.anchor ? L.editLink : L.addLink}
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 180px', fontSize: 12, color: '#475569' }}>
            {L.linkText}
            <input
              type="text"
              value={link.text}
              onChange={e => setLink(d => d && { ...d, text: e.target.value })}
              onKeyDown={e => linkKeys(e, applyLink, closeLink)}
              style={inputSt}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '2 1 240px', fontSize: 12, color: '#475569' }}>
            {L.linkUrl}
            <input
              ref={urlInput}
              autoFocus={link.focus}
              onFocus={e => e.currentTarget.select()}
              type="text"
              inputMode="url"
              value={link.url}
              onChange={e => { setLinkErr(false); setLink(d => d && { ...d, url: e.target.value }) }}
              onKeyDown={e => linkKeys(e, applyLink, closeLink)}
              style={{ ...inputSt, borderColor: linkErr ? '#b42318' : '#d1d9e0' }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#334155', padding: '6px 0', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={link.newTab}
              onChange={e => setLink(d => d && { ...d, newTab: e.target.checked })}
            />
            {L.newTab}
          </label>
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
            <button type="button" onClick={applyLink} style={panelBtn('primary')}>{L.apply}</button>
            {(link.anchor || (savedRange.current && !savedRange.current.collapsed)) && (
              <button type="button" onClick={removeLink} style={panelBtn('danger')}>{L.unlink}</button>
            )}
            <button type="button" onClick={closeLink} style={panelBtn('ghost')}>{L.cancel}</button>
          </div>
          <div style={{ width: '100%', fontSize: 11.5, color: linkErr ? '#b42318' : '#94a3b8' }}>
            {linkErr ? L.needUrl : L.linkHint}
          </div>
        </div>
      )}

      {/* ── Editor area ── */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={ph}
        onInput={() => { onChange(ref.current?.innerHTML ?? ''); refreshFmts() }}
        onKeyUp={refreshFmts}
        onMouseUp={refreshFmts}
        onClick={e => {
          // Clicking a link opens it in the panel, which is the only way to see its URL here.
          const a = (e.target as Element).closest?.('a')
          if (a && ref.current?.contains(a)) openLink(a as HTMLAnchorElement, false)
        }}
        onKeyDown={e => {
          if (e.key === 'Tab') { e.preventDefault(); exec('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;') }
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openLink() }
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

interface LinkDraft {
  /** The link being edited, or null when adding a new one. */
  anchor: HTMLAnchorElement | null
  text: string
  /** Text when the panel opened: unchanged text keeps the formatting inside the link. */
  origText: string
  url: string
  newTab: boolean
  /** Focus the URL box on open: yes from the toolbar or Ctrl+K, no when a link was clicked. */
  focus: boolean
}

/**
 * What the author typed, as an href. Bare domains get https://, a bare email
 * gets mailto:, and script-like schemes are refused (the public page's
 * sanitiser would drop them anyway, silently).
 */
function normaliseUrl(raw: string): string {
  const s = raw.trim()
  if (!s || /^https?:\/\/?$/i.test(s)) return ''
  if (/^\s*(javascript|vbscript|data|file|about)\s*:/i.test(s)) return ''
  if (/^(https?:\/\/|mailto:|tel:|line:|\/|#|\?)/i.test(s)) return s
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return 'mailto:' + s
  return 'https://' + s.replace(/^\/+/, '')
}

function setNewTab(a: HTMLAnchorElement, on: boolean) {
  if (on) {
    a.setAttribute('target', '_blank')
    a.setAttribute('rel', 'noopener noreferrer')
  } else {
    a.removeAttribute('target')
    a.removeAttribute('rel')
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function linkKeys(e: React.KeyboardEvent, apply: () => void, cancel: () => void) {
  if (e.key === 'Enter') { e.preventDefault(); apply() }
  if (e.key === 'Escape') { e.preventDefault(); cancel() }
}

const inputSt: React.CSSProperties = {
  padding: '7px 10px', fontSize: 13.5, border: '1px solid #d1d9e0', borderRadius: 6,
  fontFamily: 'inherit', color: '#1e293b', background: '#fff', outline: 'none', minWidth: 0,
}

function panelBtn(kind: 'primary' | 'danger' | 'ghost'): React.CSSProperties {
  return {
    padding: '7px 14px', fontSize: 13, borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
    border: kind === 'primary' ? '1px solid #02402e' : kind === 'danger' ? '1px solid #f1c4c0' : '1px solid #d1d9e0',
    background: kind === 'primary' ? '#02402e' : '#fff',
    color: kind === 'primary' ? '#fff' : kind === 'danger' ? '#b42318' : '#334155',
    whiteSpace: 'nowrap',
  }
}
