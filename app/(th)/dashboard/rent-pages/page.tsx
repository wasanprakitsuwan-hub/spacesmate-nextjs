'use client'

import { useEffect, useMemo, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import {
  DEFAULT_DISTRICT_TEMPLATE, DEFAULT_TEMPLATE, INDEX_MIN, RADIUS_KM, RENT_TYPES, TYPE_NAME,
  type RentPageSummary, type RentTemplate, type TemplateStrings, type RentType,
} from '@/lib/rent-slugs'
import { defaultRentContent } from '@/lib/rent-content'

/**
 * /dashboard/rent-pages — the "rent near a station or landmark" pages (/rent)
 * and the district pages (/area). A switch at the top picks which family the
 * template and the list below work on; each has its own template.
 *
 *   แม่แบบ (template)  One wording per language for every page, with
 *                      placeholders. Empty fields use the built-in default.
 *   รายการหน้า        Every page with its live listing count. Edit one page to
 *                      give it its own title, description or intro, or to keep
 *                      it out of Google whatever its count.
 *
 * Pages are indexed automatically at INDEX_MIN listings; nothing here needs
 * doing for a page to go live.
 */

async function authFetch(url: string, init: RequestInit = {}) {
  const { data: { session } } = await createBrowserClient().auth.getSession()
  const r = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token ?? ''}`, ...(init.headers ?? {}) },
  })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`)
  return d
}

const FIELDS: { key: keyof TemplateStrings; label: string; rows: number }[] = [
  { key: 'title_all', label: 'หัวข้อ — หน้ารวมทุกประเภท', rows: 1 },
  { key: 'title_type', label: 'หัวข้อ — หน้าแยกประเภท', rows: 1 },
  { key: 'desc_all', label: 'คำอธิบาย (meta) — หน้ารวม', rows: 3 },
  { key: 'desc_type', label: 'คำอธิบาย (meta) — หน้าแยกประเภท', rows: 3 },
  { key: 'intro_all', label: 'ย่อหน้าแนะนำ — หน้ารวม', rows: 3 },
  { key: 'intro_type', label: 'ย่อหน้าแนะนำ — หน้าแยกประเภท', rows: 3 },
]

type Kind = 'rent' | 'district'

const PLACEHOLDERS = [
  ['{place}', 'ชื่อสถานี/สถานที่/เขต เช่น BTS อ่อนนุช หรือ วัฒนา'],
  ['{type}', 'ประเภท เช่น คอนโดให้เช่า'],
  ['{count}', 'จำนวนประกาศ'],
  ['{price_from}', 'ราคาเริ่มต้น เช่น 7,500'],
  ['{type_short}', 'ประเภทแบบสั้น เช่น คอนโด'],
  ['{radius}', `รัศมี (${RADIUS_KM} กม.) เฉพาะหน้าสถานี/สถานที่`],
]

type Override = {
  title_th: string; title_en: string; meta_description: string; meta_description_en: string
  intro_th: string; intro_en: string; noindex: boolean
  highlights_th: string; highlights_en: string; body_th: string; body_en: string
}

const card: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20, marginBottom: 20 }
const input: React.CSSProperties = { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }
const btn = (primary = false): React.CSSProperties => ({
  padding: '8px 16px', borderRadius: 8, border: primary ? 'none' : '1px solid #d1d5db',
  background: primary ? '#02402e' : '#fff', color: primary ? '#fff' : '#475569',
  fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
})

function typeLabel(t: RentType | null) { return t ? TYPE_NAME.th[t] : 'ทุกประเภท' }

export default function RentPagesAdmin() {
  const [kind, setKind] = useState<Kind>('rent')
  const [templates, setTemplates] = useState<Record<Kind, RentTemplate>>({ rent: DEFAULT_TEMPLATE, district: DEFAULT_DISTRICT_TEMPLATE })
  const [storedAll, setStoredAll] = useState<Record<Kind, RentTemplate | null>>({ rent: null, district: null })
  const template = templates[kind]
  const stored = storedAll[kind]
  const defaults = kind === 'district' ? DEFAULT_DISTRICT_TEMPLATE : DEFAULT_TEMPLATE
  const setTemplate = (f: (t: RentTemplate) => RentTemplate) => setTemplates(all => ({ ...all, [kind]: f(all[kind]) }))
  const [pages, setPages] = useState<RentPageSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string | null>(null)
  const [lang, setLang] = useState<'th' | 'en'>('th')
  const [filter, setFilter] = useState<'indexed' | 'listed' | 'all'>('listed')
  const [typeFilter, setTypeFilter] = useState<'any' | 'none' | RentType>('any')
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Override | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const d = await authFetch('/api/dashboard/rent-pages')
      setTemplates({ rent: d.template, district: d.districtTemplate })
      setStoredAll({ rent: d.stored, district: d.districtStored })
      setPages(d.pages)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  async function saveTemplate() {
    setSaving(true); setMsg(null)
    try {
      await authFetch('/api/dashboard/rent-pages', { method: 'PATCH', body: JSON.stringify({ template, kind }) })
      setMsg('บันทึกแม่แบบแล้ว หน้าเว็บจะใช้ข้อความใหม่ทันที')
      await load()
    } catch (e) { setMsg(e instanceof Error ? e.message : String(e)) } finally { setSaving(false) }
  }

  function openEditor(p: RentPageSummary) {
    const o = p.override ?? {}
    setEditing(p.slug)
    setDraft({
      title_th: o.title_th ?? '', title_en: o.title_en ?? '',
      meta_description: o.meta_description ?? '', meta_description_en: o.meta_description_en ?? '',
      intro_th: o.intro_th ?? '', intro_en: o.intro_en ?? '', noindex: o.noindex === true,
      // Pre-filled with the drafted text so it can be edited rather than retyped.
      ...writeupFields(p, o),
    })
  }

  async function saveOverride() {
    if (!editing || !draft) return
    setSaving(true); setMsg(null)
    try {
      // Text left exactly as drafted is not saved as an override, so a later
      // improvement to the draft still reaches this page.
      const p = pages.find(x => x.slug === editing)
      const d = p ? writeupFields(p, {}) : null
      const send = { ...draft }
      if (d) for (const k of WRITEUP_KEYS) if (send[k].trim() === d[k].trim()) send[k] = ''
      await authFetch('/api/dashboard/rent-pages', { method: 'PUT', body: JSON.stringify({ slug: editing, ...send }) })
      setMsg('บันทึกแล้ว')
      setEditing(null); setDraft(null)
      await load()
    } catch (e) { setMsg(e instanceof Error ? e.message : String(e)) } finally { setSaving(false) }
  }

  const shown = useMemo(() => {
    const n = q.trim().toLowerCase()
    return pages
      .filter(p => (kind === 'district') === (p.placeKind === 'district'))
      .filter(p => filter === 'all' || (filter === 'indexed' ? p.indexable : p.count > 0))
      .filter(p => typeFilter === 'any' || (typeFilter === 'none' ? p.type === null : p.type === typeFilter))
      .filter(p => !n || p.placeTh.toLowerCase().includes(n) || p.placeEn.toLowerCase().includes(n) || p.slug.includes(n))
      .sort((a, b) => b.count - a.count || a.placeTh.localeCompare(b.placeTh, 'th'))
      .slice(0, 300)
  }, [pages, kind, filter, typeFilter, q])

  const ofKind = pages.filter(p => (kind === 'district') === (p.placeKind === 'district'))
  const indexedCount = ofKind.filter(p => p.indexable).length
  const listedCount = ofKind.filter(p => p.count > 0).length
  const isCustom = (k: keyof TemplateStrings) => Boolean(stored?.[lang]?.[k])

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#02402e', margin: '0 0 4px' }}>หน้าค้นหาตามทำเล</h1>
      <div style={{ display: 'flex', gap: 6, margin: '8px 0 12px' }}>
        <button onClick={() => { setKind('rent'); setEditing(null); setDraft(null) }} style={btn(kind === 'rent')}>ใกล้สถานี/สถานที่ (/rent)</button>
        <button onClick={() => { setKind('district'); setEditing(null); setDraft(null) }} style={btn(kind === 'district')}>ตามเขต (/area)</button>
      </div>
      <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 20px' }}>
        {kind === 'district'
          ? <>หน้า &ldquo;ห้องเช่า เขต…&rdquo; สำหรับทุกเขต ขึ้น Google อัตโนมัติเมื่อมีอย่างน้อย {INDEX_MIN} ประกาศในเขตนั้น</>
          : <>หน้า &ldquo;ห้องเช่าใกล้…&rdquo; สำหรับทุกสถานีและสถานที่ ขึ้น Google อัตโนมัติเมื่อมีอย่างน้อย {INDEX_MIN} ประกาศในรัศมี {RADIUS_KM} กม.</>}
        {' '}ตอนนี้ขึ้น Google {indexedCount} หน้า · มีประกาศ {listedCount} หน้า · ทั้งหมด {ofKind.length} หน้า
      </p>

      {msg && <div style={{ ...card, background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534', padding: 12 }}>{msg}</div>}

      {/* Template */}
      <section style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>แม่แบบข้อความ — {kind === 'district' ? 'หน้าเขต' : 'หน้าสถานี/สถานที่'}</h2>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['th', 'en'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={btn(lang === l)}>{l === 'th' ? 'ภาษาไทย' : 'English'}</button>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px' }}>
          ใช้ตัวแปร: {PLACEHOLDERS.map(([k, v]) => <span key={k} style={{ marginRight: 12 }}><code>{k}</code> {v}</span>)}
          {lang === 'en' && <span><code>{'{type_lower}'}</code> type in lower case</span>}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {FIELDS.map(f => (
            <label key={f.key} style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
              {f.label} {isCustom(f.key) ? <span style={{ color: '#048c73', fontWeight: 500 }}>· แก้ไขแล้ว</span> : <span style={{ color: '#94a3b8', fontWeight: 500 }}>· ค่าเริ่มต้น</span>}
              <textarea rows={f.rows} value={template[lang][f.key]} style={{ ...input, marginTop: 4, resize: 'vertical' }}
                onChange={e => setTemplate(t => ({ ...t, [lang]: { ...t[lang], [f.key]: e.target.value } }))} />
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={saveTemplate} disabled={saving} style={btn(true)}>{saving ? 'กำลังบันทึก…' : 'บันทึกแม่แบบ'}</button>
          <button onClick={() => setTemplate(t => ({ ...t, [lang]: { ...defaults[lang] } }))} style={btn()}>คืนค่าเริ่มต้น ({lang.toUpperCase()})</button>
        </div>
      </section>

      {/* Pages */}
      <section style={card}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 12px 0 0' }}>รายการหน้า</h2>
          <select value={filter} onChange={e => setFilter(e.target.value as typeof filter)} style={{ ...input, width: 'auto' }}>
            <option value="indexed">ขึ้น Google แล้ว</option>
            <option value="listed">มีประกาศ</option>
            <option value="all">ทั้งหมด</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as typeof typeFilter)} style={{ ...input, width: 'auto' }}>
            <option value="any">ทุกแบบ</option>
            <option value="none">หน้ารวมทุกประเภท</option>
            {RENT_TYPES.map(t => <option key={t} value={t}>{TYPE_NAME.th[t]}</option>)}
          </select>
          <input placeholder={kind === 'district' ? 'ค้นหาเขต' : 'ค้นหาสถานี/สถานที่'} value={q} onChange={e => setQ(e.target.value)} style={{ ...input, width: 220 }} />
        </div>

        {loading ? <p style={{ color: '#64748b' }}>กำลังโหลด…</p> : shown.length === 0 ? (
          <p style={{ color: '#64748b' }}>ไม่มีหน้าที่ตรงกับตัวกรอง</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#64748b', fontSize: 12 }}>
                <th style={{ padding: 8 }}>{kind === 'district' ? 'เขต' : 'สถานที่'}</th><th style={{ padding: 8 }}>ประเภท</th>
                <th style={{ padding: 8 }}>ประกาศ</th><th style={{ padding: 8 }}>สถานะ</th><th style={{ padding: 8 }} />
              </tr>
            </thead>
            <tbody>
              {shown.map(p => (
                <Row key={p.slug} p={p} editing={editing === p.slug} draft={draft} setDraft={setDraft}
                  onEdit={() => openEditor(p)} onCancel={() => { setEditing(null); setDraft(null) }}
                  onSave={saveOverride} saving={saving} />
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

function Row({ p, editing, draft, setDraft, onEdit, onCancel, onSave, saving }: {
  p: RentPageSummary; editing: boolean; draft: Override | null
  setDraft: (d: Override) => void; onEdit: () => void; onCancel: () => void; onSave: () => void; saving: boolean
}) {
  const forced = p.override?.noindex === true
  const status = p.indexable
    ? { label: 'ขึ้น Google', bg: '#dcfce7', color: '#15803d' }
    : forced ? { label: 'ปิดไม่ให้ขึ้น Google', bg: '#fee2e2', color: '#b91c1c' }
      : { label: `ยังไม่ขึ้น (ต้องมี ${INDEX_MIN})`, bg: '#f1f5f9', color: '#64748b' }
  const custom = p.override && ['title_th', 'title_en', 'meta_description', 'meta_description_en', 'intro_th', 'intro_en', ...WRITEUP_KEYS]
    .some(k => (p.override as Record<string, unknown>)[k])
  const path = p.path
  const set = (k: keyof Override, v: string | boolean) => draft && setDraft({ ...draft, [k]: v })

  return (
    <>
      <tr style={{ borderTop: '1px solid #f1f5f9' }}>
        <td style={{ padding: 8 }}>
          <div style={{ fontWeight: 600 }}>{p.placeTh}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{p.placeEn}</div>
        </td>
        <td style={{ padding: 8 }}>{typeLabel(p.type)}</td>
        <td style={{ padding: 8, fontVariantNumeric: 'tabular-nums' }}>{p.count}</td>
        <td style={{ padding: 8 }}>
          <span style={{ background: status.bg, color: status.color, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{status.label}</span>
          {custom && <span style={{ marginLeft: 6, fontSize: 12, color: '#048c73' }}>· ข้อความเฉพาะหน้า</span>}
        </td>
        <td style={{ padding: 8, whiteSpace: 'nowrap', textAlign: 'right' }}>
          <a href={path} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#048c73', marginRight: 10 }}>TH</a>
          <a href={`/en${path}`} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#048c73', marginRight: 10 }}>EN</a>
          <button onClick={editing ? onCancel : onEdit} style={btn()}>{editing ? 'ปิด' : 'แก้ไข'}</button>
        </td>
      </tr>
      {editing && draft && (
        <tr>
          <td colSpan={5} style={{ padding: '4px 8px 16px' }}>
            <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px' }}>เว้นว่างไว้เพื่อใช้ข้อความจากแม่แบบ ใช้ตัวแปรแบบแม่แบบไม่ได้ในช่องนี้ ช่องเกี่ยวกับทำเลใส่ข้อความร่างไว้ให้แล้ว (ถ้ามี) แก้ได้เลย ถ้าลบให้ว่างจะกลับไปใช้ข้อความร่าง</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {([
                ['title_th', 'หัวข้อ (ไทย)', 1], ['title_en', 'Title (English)', 1],
                ['meta_description', 'คำอธิบาย meta (ไทย)', 2], ['meta_description_en', 'Meta description (English)', 2],
                ['intro_th', 'ย่อหน้าแนะนำ (ไทย)', 3], ['intro_en', 'Intro (English)', 3],
                ['highlights_th', 'ทำไมถึงนิยมเช่าในย่านนี้ (ไทย) — บรรทัดละข้อ', 5], ['highlights_en', 'Why people rent here (English) — one per line', 5],
                ['body_th', 'ข้อมูลเพิ่มเติมเกี่ยวกับทำเลนี้ (ไทย) — เว้นบรรทัดระหว่างย่อหน้า', 8], ['body_en', 'About this area (English) — blank line between paragraphs', 8],
              ] as [keyof Override, string, number][]).map(([k, label, rows]) => (
                <label key={k} style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                  {label}
                  <textarea rows={rows} value={String(draft[k] ?? '')} onChange={e => set(k, e.target.value)} style={{ ...input, marginTop: 4, resize: 'vertical' }} />
                </label>
              ))}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, margin: '10px 0' }}>
              <input type="checkbox" checked={draft.noindex} onChange={e => set('noindex', e.target.checked)} />
              ไม่ให้หน้านี้ขึ้น Google แม้จะมีประกาศครบ
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onSave} disabled={saving} style={btn(true)}>{saving ? 'กำลังบันทึก…' : 'บันทึก'}</button>
              <button onClick={onCancel} style={btn()}>ยกเลิก</button>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

const WRITEUP_KEYS = ['highlights_th', 'highlights_en', 'body_th', 'body_en'] as const

/** The page's saved write-up, or the drafted / carried-over text, as editable text. */
function writeupFields(p: RentPageSummary, o: Partial<Record<(typeof WRITEUP_KEYS)[number], string | null>>) {
  const d = defaultRentContent(p.placeKey, p.type)
  return {
    highlights_th: o.highlights_th ?? (d ? d.highlights.th.join('\n') : ''),
    highlights_en: o.highlights_en ?? (d ? d.highlights.en.join('\n') : ''),
    body_th: o.body_th ?? (d ? d.body.th.join('\n\n') : ''),
    body_en: o.body_en ?? (d ? d.body.en.join('\n\n') : ''),
  }
}
