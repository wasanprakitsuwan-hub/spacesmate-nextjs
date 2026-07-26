'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Building picker for condo and house listings.
 *
 * WHY THIS EXISTS
 *   This field used to be free text. property_names already held 135 registered
 *   buildings and was referenced by nothing, so every listing recorded its
 *   building as a string — meaning "ลุมพินี วิลล์" and "ลุมพินีวิลล์" were different
 *   buildings, listings could not be grouped, and building pages were impossible.
 *
 *   Choosing from the registry sets property_name_id, which is what links the
 *   listing to /building/[slug]. Renters search by building name more than by
 *   almost anything else, so this is the highest-value field on the form.
 *
 * BEHAVIOUR
 *   Type to filter. Thai and English both match, and matching ignores spaces so
 *   "ลุมพินีวิลล์" finds "ลุมพินี วิลล์". Nothing found? The typed text is kept and
 *   an admin can register it later — the listing simply has no building page yet.
 *   Blocking submission over an unregistered building would be worse.
 */

type NameRow = { id: string; name_th: string; name_en: string | null; slug?: string | null }

const norm = (s: string) => String(s || '').toLowerCase().replace(/\s+/g, '')

export default function BuildingAutocomplete({
  value, valueId, onChange, placeholder, inputStyle, labelStyle, label,
}: {
  value: string
  valueId: string
  onChange: (name: string, id: string) => void
  placeholder?: string
  inputStyle?: React.CSSProperties
  labelStyle?: React.CSSProperties
  label?: string
}) {
  const [names, setNames]   = useState<NameRow[]>([])
  const [open, setOpen]     = useState(false)
  const [query, setQuery]   = useState(value)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    fetch('/api/dashboard/property-names')
      .then(r => r.json())
      .then(d => setNames(d.names ?? []))
      .catch(() => { /* registry unavailable — field still works as free text */ })
  }, [])

  // click-away
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const matches = useMemo(() => {
    const k = norm(query)
    if (!k) return names.slice(0, 8)
    return names
      .filter(n => norm(n.name_th).includes(k) || norm(n.name_en ?? '').includes(k))
      .slice(0, 8)
  }, [query, names])

  const linked = Boolean(valueId)

  return (
    <div ref={boxRef} style={{ position: 'relative', marginBottom: 16 }}>
      {label && <label style={labelStyle}>{label}</label>}

      <input
        value={query}
        onChange={e => {
          setQuery(e.target.value)
          setOpen(true)
          // typing invalidates any previous selection — the id must never point at
          // a building the text no longer says
          onChange(e.target.value, '')
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        style={{ ...inputStyle, borderColor: linked ? '#048c73' : (inputStyle?.borderColor as string) }}
      />

      {linked && (
        <p style={{ fontSize: 11.5, color: '#048c73', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>check_circle</span>
          เชื่อมกับอาคารในระบบแล้ว — ประกาศนี้จะแสดงในหน้าอาคาร
        </p>
      )}
      {!linked && query.trim() !== '' && (
        <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '5px 0 0' }}>
          ยังไม่ได้เลือกจากรายการ — บันทึกได้ แต่จะยังไม่มีหน้าอาคาร
        </p>
      )}

      {open && matches.length > 0 && (
        <div style={{
          position: 'absolute', zIndex: 40, top: '100%', left: 0, right: 0, marginTop: 4,
          background: '#fff', border: '1px solid #eef0ef', borderRadius: 12,
          boxShadow: '0 12px 30px -8px rgba(2,64,46,0.18)', maxHeight: 260, overflowY: 'auto',
        }}>
          {matches.map(n => (
            <button
              key={n.id}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setQuery(n.name_th); onChange(n.name_th, n.id); setOpen(false) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px',
                border: 'none', background: n.id === valueId ? '#f2f9f6' : '#fff',
                cursor: 'pointer', fontSize: 13.5, color: '#231f20',
              }}
            >
              <span style={{ fontWeight: 600 }}>{n.name_th}</span>
              {n.name_en && <span style={{ color: '#94a3b8', marginLeft: 8, fontSize: 12 }}>{n.name_en}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
