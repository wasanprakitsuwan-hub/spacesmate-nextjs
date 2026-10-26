'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { STATIONS, type RailSystem } from '@/lib/stations'
import { LANDMARKS, LANDMARK_ICON, type LandmarkKind } from '@/lib/landmarks'
import { RAIL_SYSTEMS, LANDMARK_KINDS, parseCoords, type PlaceOverride } from '@/lib/search-places'
import { norm } from '@/lib/search-match'

/**
 * /dashboard/places — everything the search box knows, in one menu.
 *
 *   ชื่ออสังหา   property_names rows; coordinates make them map-searchable
 *   สถานที่      lib/landmarks.ts + search_places overrides
 *   สถานี        lib/stations.ts  + search_places overrides
 *   หน้า SEO อื่น seo_pages with no place_key
 *
 * Every place lists the SEO landing pages about it (seo_pages.place_key), zero
 * or many — a place can need a Thai page, an English page and an apartment
 * page. Pages about no single place live in the fourth tab. This replaced the
 * separate SEO Tracker and property-name screens.
 */

type Tab = 'names' | 'places' | 'stations' | 'seo'

type SeoPage = {
  id: string
  slug: string
  title_th: string | null
  title_en: string | null
  meta_description: string | null
  area_type: string
  status: string
  has_content: boolean
  page_score: number | null
  notes: string | null
  place_key: string | null
}

type PropertyName = {
  id: string
  name_th: string
  name_en: string | null
  lat: number | null
  lng: number | null
  aliases: string[] | null
  hidden: boolean | null
}

type Source = 'built-in' | 'edited' | 'added' | 'db'

/** One row of any of the three place tabs. */
type Row = {
  key: string                 // seo_pages.place_key form
  kind: 'station' | 'landmark' | 'name'
  id: string
  th: string
  en: string
  lat: number | null
  lng: number | null
  systems?: RailSystem[]
  landmarkKind?: LandmarkKind
  aliases: string[]
  hidden: boolean
  source: Source
}

const STATUS: Record<string, { bg: string; color: string; label: string }> = {
  planned:      { bg: '#f1f5f9', color: '#64748b', label: 'วางแผน' },
  built:        { bg: '#e0f2fe', color: '#0284c7', label: 'สร้างแล้ว' },
  published:    { bg: '#dcfce7', color: '#15803d', label: 'เผยแพร่แล้ว' },
  needs_update: { bg: '#fef9c3', color: '#a16207', label: 'ต้องอัปเดต' },
}

const AREA_TYPES: Record<string, string> = {
  bts: 'BTS', mrt: 'MRT', arl: 'ARL', srt: 'SRT', condo: 'ชื่ออสังหา', university: 'มหาวิทยาลัย',
  mall: 'ห้าง', hospital: 'โรงพยาบาล', transport: 'การเดินทาง', place: 'สถานที่', district: 'เขต/ย่าน', zone: 'โซน',
}

const LANDMARK_KIND_TH: Record<LandmarkKind, string> = {
  university: 'มหาวิทยาลัย', mall: 'ห้าง', hospital: 'โรงพยาบาล', transport: 'การเดินทาง', place: 'สถานที่อื่น',
}

const SOURCE_BADGE: Record<Source, { label: string; bg: string; color: string } | null> = {
  'built-in': null,
  db: null,
  edited: { label: 'แก้ไขแล้ว', bg: '#fdf3e3', color: '#b45309' },
  added: { label: 'เพิ่มใหม่', bg: '#e8f5f0', color: '#048c73' },
}

const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }
const label: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, color: '#64748b', marginBottom: 6 }
const btn = (primary: boolean): React.CSSProperties => ({
  padding: '10px 18px', borderRadius: 9, border: primary ? 'none' : '1.5px solid #e2e8f0',
  background: primary ? '#02402e' : '#fff', color: primary ? '#fff' : '#475569',
  fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
})

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

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/** A starting point for a new landing page about this place. */
function seoDefaults(row: Row): Partial<SeoPage> {
  if (row.kind === 'station') {
    const sys = row.systems?.[0] ?? 'BTS'
    return {
      slug: `condo-for-rent-${sys.toLowerCase()}-${slugify(row.en)}`,
      title_th: `คอนโดให้เช่า ${sys} ${row.th}`,
      title_en: `Condo for Rent ${sys} ${row.en}`,
      area_type: sys.toLowerCase(),
    }
  }
  if (row.kind === 'landmark') {
    return {
      slug: `condo-for-rent-near-${slugify(row.en)}`,
      title_th: `คอนโดให้เช่าใกล้${row.th}`,
      title_en: `Condo for Rent near ${row.en}`,
      area_type: row.landmarkKind ?? 'place',
    }
  }
  return {
    slug: `${slugify(row.en || row.th) || row.id.slice(0, 8)}-for-rent`,
    title_th: `${row.th} ให้เช่า`,
    title_en: row.en ? `${row.en} for Rent` : null,
    area_type: 'condo',
  }
}

// ── Place form ────────────────────────────────────────────────────────────────

function PlaceForm({ row, kind, onClose, onSaved }: {
  row: Row | null
  kind: Row['kind']
  onClose: () => void
  onSaved: () => void
}) {
  const isNew = !row
  const [id, setId] = useState(row?.id ?? '')
  const [th, setTh] = useState(row?.th ?? '')
  const [en, setEn] = useState(row?.en ?? '')
  const [systems, setSystems] = useState<RailSystem[]>(row?.systems ?? ['BTS'])
  const [lk, setLk] = useState<LandmarkKind>(row?.landmarkKind ?? 'place')
  const [aliases, setAliases] = useState((row?.aliases ?? []).join(', '))
  const [lat, setLat] = useState(row?.lat != null ? String(row.lat) : '')
  const [lng, setLng] = useState(row?.lng != null ? String(row.lng) : '')
  const [paste, setPaste] = useState('')
  const [pasteMsg, setPasteMsg] = useState('')
  const [hidden, setHidden] = useState(row?.hidden ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function applyPaste(text: string) {
    setPaste(text)
    if (!text.trim()) { setPasteMsg(''); return }
    const c = parseCoords(text)
    if (c) { setLat(String(c.lat)); setLng(String(c.lng)); setPasteMsg('ได้พิกัดแล้ว') }
    else if (/goo\.gl|maps\.app/.test(text)) setPasteMsg('ลิงก์แบบย่อไม่มีพิกัด: เปิดลิงก์ก่อน แล้วคัดลอก URL เต็มจากแถบที่อยู่')
    else setPasteMsg('ไม่พบพิกัดในข้อความนี้')
  }

  async function save() {
    setSaving(true); setError('')
    const aliasList = aliases.split(',').map(a => a.trim()).filter(Boolean)
    try {
      if (kind === 'name') {
        if (!th.trim()) throw new Error('กรุณากรอกชื่อภาษาไทย')
        if ((lat === '') !== (lng === '')) throw new Error('กรอกพิกัดให้ครบทั้งสองค่า หรือเว้นว่างทั้งคู่')
        const body = { name_th: th, name_en: en, lat: lat || null, lng: lng || null, aliases: aliasList, hidden }
        if (isNew) await authFetch('/api/dashboard/property-names', { method: 'POST', body: JSON.stringify(body) })
        else await authFetch('/api/dashboard/property-names', { method: 'PATCH', body: JSON.stringify({ id: row!.id, ...body }) })
      } else {
        await authFetch('/api/dashboard/search-places', {
          method: 'PUT',
          body: JSON.stringify({ kind, id, th, en, lat, lng, systems, landmark_kind: lk, aliases: aliasList, hidden }),
        })
      }
      onSaved()
    } catch (e: any) {
      setError(e.message)
      setSaving(false)
    }
  }

  const title = isNew
    ? (kind === 'name' ? 'เพิ่มชื่ออสังหา' : kind === 'station' ? 'เพิ่มสถานี' : 'เพิ่มสถานที่')
    : `แก้ไข: ${row!.th}`

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 18px', fontSize: 17, fontWeight: 700, color: '#02402e' }}>{title}</h3>

        {kind !== 'name' && (
          <div style={{ marginBottom: 14 }}>
            <label style={label}>รหัส (ใช้ในลิงก์ค้นหา เช่น E4, chula)</label>
            <input value={id} onChange={e => setId(e.target.value.trim())} disabled={!isNew} style={{ ...inp, background: isNew ? '#fff' : '#f8fafc', fontFamily: 'monospace' }}
              placeholder={kind === 'station' ? 'PK16' : 'mega-bangna'} />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div><label style={label}>ชื่อภาษาไทย *</label><input value={th} onChange={e => setTh(e.target.value)} style={inp} /></div>
          <div><label style={label}>ชื่อภาษาอังกฤษ {kind !== 'name' && '*'}</label><input value={en} onChange={e => setEn(e.target.value)} style={inp} /></div>
        </div>

        {kind === 'station' && (
          <div style={{ marginBottom: 14 }}>
            <label style={label}>ระบบรถไฟ</label>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {RAIL_SYSTEMS.map(s => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                  <input type="checkbox" checked={systems.includes(s)}
                    onChange={e => setSystems(cur => e.target.checked ? [...cur, s] : cur.filter(x => x !== s))} />
                  {s}
                </label>
              ))}
            </div>
          </div>
        )}

        {kind === 'landmark' && (
          <div style={{ marginBottom: 14 }}>
            <label style={label}>ประเภท</label>
            <select value={lk} onChange={e => setLk(e.target.value as LandmarkKind)} style={inp}>
              {LANDMARK_KINDS.map(k => <option key={k} value={k}>{LANDMARK_KIND_TH[k]}</option>)}
            </select>
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={label}>ชื่อเรียกอื่น (คั่นด้วย ,) เช่น จุฬา, cu</label>
          <input value={aliases} onChange={e => setAliases(e.target.value)} style={inp} />
        </div>

        <div style={{ marginBottom: 6 }}>
          <label style={label}>พิกัด: วางลิงก์ Google Maps หรือ “ละติจูด, ลองจิจูด”</label>
          <input value={paste} onChange={e => applyPaste(e.target.value)} placeholder="https://www.google.com/maps/place/…/@13.7563,100.5018,17z" style={inp} />
          {pasteMsg && <p style={{ margin: '6px 0 0', fontSize: 12.5, color: pasteMsg === 'ได้พิกัดแล้ว' ? '#15803d' : '#b45309' }}>{pasteMsg}</p>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 6 }}>
          <div><label style={label}>ละติจูด {kind !== 'name' && '*'}</label><input value={lat} onChange={e => setLat(e.target.value.trim())} inputMode="decimal" style={inp} /></div>
          <div><label style={label}>ลองจิจูด {kind !== 'name' && '*'}</label><input value={lng} onChange={e => setLng(e.target.value.trim())} inputMode="decimal" style={inp} /></div>
        </div>
        {lat && lng && (
          <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, color: '#048c73' }}>
            ตรวจตำแหน่งบน Google Maps ↗
          </a>
        )}
        {kind === 'name' && (
          <p style={{ margin: '6px 0 0', fontSize: 12, color: '#94a3b8' }}>ไม่ใส่พิกัดได้ แต่ชื่อนี้จะไม่ปรากฏในช่องค้นหาตามระยะทาง</p>
        )}

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0', fontSize: 14 }}>
          <input type="checkbox" checked={!hidden} onChange={e => setHidden(!e.target.checked)} />
          แสดงในช่องค้นหา
        </label>

        {error && <div style={{ marginBottom: 14, padding: '10px 12px', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: 13.5 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={saving} style={btn(false)}>ยกเลิก</button>
          <button onClick={save} disabled={saving} style={{ ...btn(true), opacity: saving ? 0.6 : 1 }}>{saving ? 'กำลังบันทึก…' : 'บันทึก'}</button>
        </div>
      </div>
    </div>
  )
}

// ── SEO page form ─────────────────────────────────────────────────────────────

function SeoForm({ page, defaults, placeKey, placeName, onClose, onSaved }: {
  page: SeoPage | null
  defaults: Partial<SeoPage>
  placeKey: string | null
  placeName: string | null
  onClose: () => void
  onSaved: () => void
}) {
  const start = page ?? defaults
  const [slug, setSlug] = useState(start.slug ?? '')
  const [titleTh, setTitleTh] = useState(start.title_th ?? '')
  const [titleEn, setTitleEn] = useState(start.title_en ?? '')
  const [meta, setMeta] = useState(start.meta_description ?? '')
  const [areaType, setAreaType] = useState(start.area_type ?? 'district')
  const [status, setStatus] = useState(start.status ?? 'planned')
  const [hasContent, setHasContent] = useState(start.has_content ?? false)
  const [score, setScore] = useState(start.page_score != null ? String(start.page_score) : '')
  const [notes, setNotes] = useState(start.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setSaving(true); setError('')
    const n = score === '' ? null : Math.max(0, Math.min(100, Math.round(Number(score))))
    const body = {
      slug: slug.trim(), title_th: titleTh.trim() || null, title_en: titleEn.trim() || null,
      meta_description: meta.trim() || null, area_type: areaType, status, has_content: hasContent,
      page_score: Number.isFinite(n) ? n : null, notes: notes.trim() || null, place_key: placeKey,
    }
    try {
      if (!body.slug) throw new Error('กรุณากรอก slug')
      if (page) await authFetch('/api/dashboard/seo', { method: 'PATCH', body: JSON.stringify({ id: page.id, ...body }) })
      else await authFetch('/api/dashboard/seo', { method: 'POST', body: JSON.stringify(body) })
      onSaved()
    } catch (e: any) {
      setError(e.message)
      setSaving(false)
    }
  }

  async function remove() {
    if (!page || !confirm(`ลบหน้า /${page.slug} ?`)) return
    setSaving(true)
    try {
      await authFetch(`/api/dashboard/seo?id=${page.id}`, { method: 'DELETE' })
      onSaved()
    } catch (e: any) {
      setError(e.message)
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: '#02402e' }}>{page ? 'แก้ไขหน้า SEO' : 'เพิ่มหน้า SEO'}</h3>
        <p style={{ margin: '0 0 18px', fontSize: 13, color: '#94a3b8' }}>{placeName ? `เกี่ยวกับ: ${placeName}` : 'ไม่ผูกกับสถานที่ใด'}</p>

        <div style={{ marginBottom: 14 }}>
          <label style={label}>Slug (URL) *</label>
          <input value={slug} onChange={e => setSlug(e.target.value)} style={{ ...inp, fontFamily: 'monospace' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div><label style={label}>หัวข้อภาษาไทย</label><input value={titleTh} onChange={e => setTitleTh(e.target.value)} style={inp} /></div>
          <div><label style={label}>หัวข้อภาษาอังกฤษ</label><input value={titleEn} onChange={e => setTitleEn(e.target.value)} style={inp} /></div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={label}>Meta description <span style={{ color: meta.length > 160 ? '#dc2626' : '#94a3b8', fontWeight: 400 }}>({meta.length}/160)</span></label>
          <textarea value={meta} onChange={e => setMeta(e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={label}>ประเภทพื้นที่</label>
            <select value={areaType} onChange={e => setAreaType(e.target.value)} style={inp}>
              {Object.entries(AREA_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>สถานะ</label>
            <select value={status} onChange={e => setStatus(e.target.value)} style={inp}>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div><label style={label}>คะแนน (0–100)</label><input value={score} onChange={e => setScore(e.target.value)} inputMode="numeric" style={inp} /></div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 14 }}>
          <input type="checkbox" checked={hasContent} onChange={e => setHasContent(e.target.checked)} />
          มีเนื้อหาแล้ว
        </label>
        <div style={{ marginBottom: 14 }}>
          <label style={label}>โน้ต</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' }} />
        </div>

        {error && <div style={{ marginBottom: 14, padding: '10px 12px', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: 13.5 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div>{page && <button onClick={remove} disabled={saving} style={{ ...btn(false), color: '#dc2626', borderColor: '#fecaca' }}>ลบหน้านี้</button>}</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} disabled={saving} style={btn(false)}>ยกเลิก</button>
            <button onClick={save} disabled={saving} style={{ ...btn(true), opacity: saving ? 0.6 : 1 }}>{saving ? 'กำลังบันทึก…' : 'บันทึก'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── SEO chips under a place ───────────────────────────────────────────────────

function SeoChips({ pages, onOpen, onAdd }: { pages: SeoPage[]; onOpen: (p: SeoPage) => void; onAdd: () => void }) {
  return (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
      {pages.map(p => {
        const st = STATUS[p.status] ?? STATUS.planned
        return (
          <button key={p.id} onClick={() => onOpen(p)} title={`/${p.slug}`}
            style={{ fontSize: 11.5, padding: '3px 9px', borderRadius: 8, border: 'none', background: st.bg, color: st.color, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {st.label} · {p.title_th || p.slug}
          </button>
        )
      })}
      <button onClick={onAdd} title="เพิ่มหน้า SEO"
        style={{ fontSize: 11.5, padding: '3px 8px', borderRadius: 8, border: '1px dashed #c7d2d0', background: '#fff', color: '#64748b', cursor: 'pointer', fontFamily: 'inherit' }}>
        + SEO
      </button>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SearchPlacesAdmin() {
  const router = useRouter()
  const sp = useSearchParams()
  const tab = (['names', 'places', 'stations', 'seo'].includes(sp.get('tab') ?? '') ? sp.get('tab') : 'names') as Tab

  const [overrides, setOverrides] = useState<PlaceOverride[]>([])
  const [names, setNames] = useState<PropertyName[]>([])
  const [seo, setSeo] = useState<SeoPage[]>([])
  const [role, setRole] = useState<'admin' | 'super_admin'>('admin')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [q, setQ] = useState('')
  const [show, setShow] = useState<'all' | 'shown' | 'hidden' | 'nocoords'>('all')

  const [editing, setEditing] = useState<{ row: Row | null; kind: Row['kind'] } | null>(null)
  const [seoEditing, setSeoEditing] = useState<{ page: SeoPage | null; row: Row | null } | null>(null)

  async function load() {
    setLoading(true); setLoadError('')
    try {
      const [o, n, s] = await Promise.all([
        authFetch('/api/dashboard/search-places'),
        authFetch('/api/dashboard/property-names'),
        authFetch('/api/dashboard/seo'),
      ])
      setOverrides(o.overrides ?? [])
      setNames(n.names ?? [])
      setSeo(s.pages ?? [])
    } catch (e: any) {
      // Most likely the WEBSITE SQL for this screen has not been run yet.
      setLoadError(e.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    authFetch('/api/auth/role').then(d => setRole(d.role === 'super_admin' ? 'super_admin' : 'admin')).catch(() => {})
  }, [])

  // ── Rows per tab ────────────────────────────────────────────────────────────

  const stationRows = useMemo<Row[]>(() => {
    const ov = new Map(overrides.filter(o => o.kind === 'station').map(o => [o.id, o]))
    const rows: Row[] = STATIONS.map(s => {
      const o = ov.get(s.id)
      ov.delete(s.id)
      return o
        ? { key: `station:${s.id}`, kind: 'station', id: s.id, th: o.th, en: o.en, lat: o.lat, lng: o.lng, systems: o.systems ?? s.systems, aliases: o.aliases ?? [], hidden: o.hidden, source: 'edited' }
        : { key: `station:${s.id}`, kind: 'station', id: s.id, th: s.th, en: s.en, lat: s.lat, lng: s.lng, systems: s.systems, aliases: [], hidden: false, source: 'built-in' }
    })
    for (const o of Array.from(ov.values())) rows.push({ key: `station:${o.id}`, kind: 'station', id: o.id, th: o.th, en: o.en, lat: o.lat, lng: o.lng, systems: o.systems ?? ['BTS'], aliases: o.aliases ?? [], hidden: o.hidden, source: 'added' })
    return rows
  }, [overrides])

  const landmarkRows = useMemo<Row[]>(() => {
    const ov = new Map(overrides.filter(o => o.kind === 'landmark').map(o => [o.id, o]))
    const rows: Row[] = LANDMARKS.map(l => {
      const o = ov.get(l.id)
      ov.delete(l.id)
      return o
        ? { key: `landmark:${l.id}`, kind: 'landmark', id: l.id, th: o.th, en: o.en, lat: o.lat, lng: o.lng, landmarkKind: o.landmark_kind ?? l.kind, aliases: o.aliases ?? [], hidden: o.hidden, source: 'edited' }
        : { key: `landmark:${l.id}`, kind: 'landmark', id: l.id, th: l.th, en: l.en, lat: l.lat, lng: l.lng, landmarkKind: l.kind, aliases: l.aliases ?? [], hidden: false, source: 'built-in' }
    })
    for (const o of Array.from(ov.values())) rows.push({ key: `landmark:${o.id}`, kind: 'landmark', id: o.id, th: o.th, en: o.en, lat: o.lat, lng: o.lng, landmarkKind: o.landmark_kind ?? 'place', aliases: o.aliases ?? [], hidden: o.hidden, source: 'added' })
    return rows
  }, [overrides])

  const nameRows = useMemo<Row[]>(() => names.map(n => ({
    key: `name:${n.id}`, kind: 'name', id: n.id, th: n.name_th, en: n.name_en ?? '',
    lat: n.lat, lng: n.lng, aliases: n.aliases ?? [], hidden: !!n.hidden, source: 'db',
  })), [names])

  const allRows = useMemo(() => [...nameRows, ...landmarkRows, ...stationRows], [nameRows, landmarkRows, stationRows])
  const rowByKey = useMemo(() => new Map(allRows.map(r => [r.key, r])), [allRows])

  const seoByKey = useMemo(() => {
    const m = new Map<string, SeoPage[]>()
    for (const p of seo) if (p.place_key) m.set(p.place_key, [...(m.get(p.place_key) ?? []), p])
    return m
  }, [seo])

  // Pages with no place, or a place_key that no longer matches anything.
  const otherPages = useMemo(() => seo.filter(p => !p.place_key || !rowByKey.has(p.place_key)), [seo, rowByKey])

  /**
   * The place an unlinked page is probably about: the longest place name that
   * appears in its Thai title, slug or English title, of a kind that fits the
   * page's area type. A suggestion only — nothing links until someone presses.
   */
  const suggestionFor = useMemo(() => {
    const pools: Record<string, Row[]> = {
      bts: stationRows, mrt: stationRows, arl: stationRows, srt: stationRows,
      university: landmarkRows, mall: landmarkRows, hospital: landmarkRows, transport: landmarkRows, place: landmarkRows,
      condo: nameRows,
    }
    return (p: SeoPage): Row | null => {
      const pool = pools[p.area_type]
      if (!pool) return null
      const hay = [norm(p.title_th ?? ''), norm(p.title_en ?? ''), norm(p.slug.replace(/-/g, ''))]
      let best: { row: Row; len: number } | null = null
      for (const r of pool) {
        for (const name of [norm(r.th), norm(r.en)]) {
          if (name.length < 3) continue
          if (hay.some(h => h.includes(name)) && (!best || name.length > best.len)) best = { row: r, len: name.length }
        }
      }
      return best?.row ?? null
    }
  }, [stationRows, landmarkRows, nameRows])

  const suggestions = useMemo(
    () => otherPages.map(p => ({ page: p, row: suggestionFor(p) })).filter((x): x is { page: SeoPage; row: Row } => !!x.row),
    [otherPages, suggestionFor],
  )

  async function linkPage(page: SeoPage, row: Row | null) {
    await authFetch('/api/dashboard/seo', { method: 'PATCH', body: JSON.stringify({ id: page.id, place_key: row?.key ?? null }) })
  }

  async function linkAllSuggested() {
    if (!confirm(`ผูก ${suggestions.length} หน้ากับสถานที่ที่แนะนำ?`)) return
    try {
      for (const s of suggestions) await linkPage(s.page, s.row)
    } catch (e: any) { alert(e.message) }
    load()
  }

  async function resetPlace(row: Row) {
    const msg = row.source === 'added' ? `ลบ “${row.th}” ออกจากรายการค้นหา?` : `คืนค่า “${row.th}” เป็นข้อมูลตั้งต้น?`
    if (!confirm(msg)) return
    try {
      await authFetch(`/api/dashboard/search-places?kind=${row.kind}&id=${encodeURIComponent(row.id)}`, { method: 'DELETE' })
      load()
    } catch (e: any) { alert(e.message) }
  }

  async function deleteName(row: Row) {
    if (!confirm(`ลบชื่อ “${row.th}”?`)) return
    try {
      await authFetch(`/api/dashboard/property-names?id=${row.id}`, { method: 'DELETE' })
      load()
    } catch (e: any) { alert(e.message) }
  }

  function setTab(t: Tab) {
    setQ(''); setShow('all')
    router.replace(`/dashboard/places?tab=${t}`)
  }

  const tabRows = tab === 'names' ? nameRows : tab === 'places' ? landmarkRows : tab === 'stations' ? stationRows : []
  const nq = norm(q)
  const visible = tabRows.filter(r => {
    if (show === 'shown' && r.hidden) return false
    if (show === 'hidden' && !r.hidden) return false
    if (show === 'nocoords' && r.lat != null) return false
    if (!nq) return true
    return [r.th, r.en, r.id, ...r.aliases].some(x => norm(x).includes(nq))
  })

  const TABS: { id: Tab; label: string; icon: string; count: number }[] = [
    { id: 'names', label: 'ชื่ออสังหา', icon: 'domain', count: nameRows.length },
    { id: 'places', label: 'สถานที่', icon: 'place', count: landmarkRows.length },
    { id: 'stations', label: 'BTS / MRT / ARL / SRT', icon: 'train', count: stationRows.length },
    { id: 'seo', label: 'หน้า SEO อื่นๆ', icon: 'travel_explore', count: otherPages.length },
  ]

  const publishedCount = seo.filter(p => p.status === 'published').length

  return (
    <div style={{ fontFamily: "'Prompt', -apple-system, sans-serif" }}>
      {editing && (
        <PlaceForm row={editing.row} kind={editing.kind}
          onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />
      )}
      {seoEditing && (
        <SeoForm page={seoEditing.page}
          defaults={seoEditing.row ? seoDefaults(seoEditing.row) : {}}
          placeKey={seoEditing.page ? (seoEditing.row?.key ?? seoEditing.page.place_key) : (seoEditing.row?.key ?? null)}
          placeName={seoEditing.row?.th ?? null}
          onClose={() => setSeoEditing(null)} onSaved={() => { setSeoEditing(null); load() }} />
      )}

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 3px', color: '#02402e' }}>สถานที่ค้นหา</h1>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
          ทุกชื่อที่ช่องค้นหารู้จัก พร้อมพิกัดและหน้า SEO · หน้า SEO {seo.length} หน้า เผยแพร่แล้ว {publishedCount}
        </p>
      </div>

      {loadError && (
        <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: '#fef2f2', color: '#b91c1c', fontSize: 13.5 }}>
          โหลดข้อมูลไม่สำเร็จ: {loadError}. หากเพิ่งอัปเดต ให้รัน SQL ของหน้านี้ (WEBSITE) ก่อน
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', borderBottom: '1px solid #eef0ef' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', border: 'none', borderBottom: tab === t.id ? '2.5px solid #048c73' : '2.5px solid transparent', background: 'none', color: tab === t.id ? '#02402e' : '#64748b', fontWeight: tab === t.id ? 700 : 500, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            {t.label}
            <span style={{ fontSize: 11.5, background: '#f1f5f9', borderRadius: 10, padding: '1px 7px', color: '#64748b' }}>{t.count}</span>
          </button>
        ))}
      </div>

      {tab !== 'seo' ? (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="ค้นหาชื่อ รหัส หรือชื่อเรียกอื่น" style={{ ...inp, maxWidth: 320 }} />
            <select value={show} onChange={e => setShow(e.target.value as typeof show)} style={{ ...inp, width: 'auto' }}>
              <option value="all">ทั้งหมด</option>
              <option value="shown">แสดงในการค้นหา</option>
              <option value="hidden">ซ่อนอยู่</option>
              {tab === 'names' && <option value="nocoords">ยังไม่มีพิกัด</option>}
            </select>
            <div style={{ flex: 1 }} />
            <button onClick={() => setEditing({ row: null, kind: tab === 'names' ? 'name' : tab === 'places' ? 'landmark' : 'station' })}
              style={{ ...btn(true), display: 'flex', alignItems: 'center', gap: 6 }}>
              เพิ่ม
            </button>
          </div>

          <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 14, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: 820 }}>
              <thead>
                <tr style={{ background: '#f8faf9', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>ชื่อ</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>ประเภท</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>พิกัด</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>ค้นหา</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>หน้า SEO</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }} />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>กำลังโหลด…</td></tr>
                ) : visible.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>ไม่พบรายการ</td></tr>
                ) : visible.map(r => {
                  const badge = SOURCE_BADGE[r.source]
                  return (
                    <tr key={r.key} style={{ borderTop: '1px solid #f1f5f4', opacity: r.hidden ? 0.55 : 1 }}>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 600, color: '#02402e', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          {r.th}
                          {badge && <span style={{ fontSize: 10.5, padding: '1px 7px', borderRadius: 6, background: badge.bg, color: badge.color }}>{badge.label}</span>}
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>
                          {r.en || '—'}{r.kind !== 'name' && <span style={{ fontFamily: 'monospace' }}> · {r.id}</span>}
                          {r.aliases.length > 0 && <> · {r.aliases.join(', ')}</>}
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#475569', whiteSpace: 'nowrap' }}>
                        {r.kind === 'station' ? r.systems?.join('/') : r.kind === 'landmark' && r.landmarkKind ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <span className="msym" style={{ fontSize: 15 }}>{LANDMARK_ICON[r.landmarkKind]}</span>{LANDMARK_KIND_TH[r.landmarkKind]}
                          </span>
                        ) : 'อาคาร/โครงการ'}
                      </td>
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        {r.lat != null && r.lng != null ? (
                          <a href={`https://www.google.com/maps?q=${r.lat},${r.lng}`} target="_blank" rel="noopener noreferrer" style={{ color: '#048c73', fontFamily: 'monospace', fontSize: 12.5 }}>
                            {r.lat.toFixed(5)}, {r.lng.toFixed(5)}
                          </a>
                        ) : <span style={{ color: '#d97f11', fontSize: 12.5 }}>ยังไม่มีพิกัด</span>}
                      </td>
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', fontSize: 12.5, color: r.hidden ? '#94a3b8' : '#15803d' }}>
                        {r.hidden ? 'ซ่อน' : r.kind === 'name' && r.lat == null ? 'เฉพาะข้อความ' : 'แสดง'}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <SeoChips pages={seoByKey.get(r.key) ?? []}
                          onOpen={p => setSeoEditing({ page: p, row: r })}
                          onAdd={() => setSeoEditing({ page: null, row: r })} />
                      </td>
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'right' }}>
                        <button onClick={() => setEditing({ row: r, kind: r.kind })} title="แก้ไข"
                          style={{ padding: '5px 9px', borderRadius: 7, border: '1px solid #c7d2d0', background: '#fff', color: '#334155', cursor: 'pointer' }}>
                          แก้ไข
                        </button>
                        {(r.source === 'edited' || r.source === 'added') && (
                          <button onClick={() => resetPlace(r)} title={r.source === 'added' ? 'ลบ' : 'คืนค่าตั้งต้น'}
                            style={{ marginLeft: 5, padding: '5px 9px', borderRadius: 7, border: '1px solid #c7d2d0', background: '#fff', color: '#475569', cursor: 'pointer' }}>
                            {r.source === 'added' ? 'ลบ' : 'คืนค่าเดิม'}
                          </button>
                        )}
                        {r.kind === 'name' && role === 'super_admin' && (
                          <button onClick={() => deleteName(r)} title="ลบ"
                            style={{ marginLeft: 5, padding: '5px 9px', borderRadius: 7, border: '1px solid #fecaca', background: '#fff', color: '#dc2626', cursor: 'pointer' }}>
                            ลบ
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b', flex: 1, minWidth: 240 }}>
              หน้าที่ไม่ได้ผูกกับสถานที่ใด เช่น โซน หรือหัวข้อทั่วไป หน้าที่มีสถานที่ตรงกัน ระบบจะแนะนำให้ผูก
            </p>
            {suggestions.length > 0 && (
              <button onClick={linkAllSuggested} style={btn(false)}>ผูกตามที่แนะนำทั้งหมด ({suggestions.length})</button>
            )}
            <button onClick={() => setSeoEditing({ page: null, row: null })} style={{ ...btn(true), display: 'flex', alignItems: 'center', gap: 6 }}>
              เพิ่มหน้า SEO
            </button>
          </div>

          <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 14, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: 760 }}>
              <thead>
                <tr style={{ background: '#f8faf9', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>หน้า</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>ประเภท</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>สถานะ</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>สถานที่ที่แนะนำ</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }} />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>กำลังโหลด…</td></tr>
                ) : otherPages.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>ทุกหน้าผูกกับสถานที่แล้ว</td></tr>
                ) : otherPages.map(p => {
                  const st = STATUS[p.status] ?? STATUS.planned
                  const sug = suggestionFor(p)
                  return (
                    <tr key={p.id} style={{ borderTop: '1px solid #f1f5f4' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 600, color: '#02402e' }}>{p.title_th || p.title_en || '—'}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>/{p.slug}</div>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>{AREA_TYPES[p.area_type] ?? p.area_type}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: 11.5, padding: '3px 9px', borderRadius: 8, background: st.bg, color: st.color, fontWeight: 600 }}>{st.label}</span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        {sug ? (
                          <button onClick={async () => { try { await linkPage(p, sug); load() } catch (e: any) { alert(e.message) } }}
                            style={{ fontSize: 12.5, padding: '4px 10px', borderRadius: 8, border: '1px solid #048c73', background: '#fff', color: '#048c73', cursor: 'pointer', fontFamily: 'inherit' }}>
                            ผูกกับ {sug.th}
                          </button>
                        ) : <span style={{ color: '#94a3b8', fontSize: 12.5 }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <button onClick={() => setSeoEditing({ page: p, row: null })} title="แก้ไข"
                          style={{ padding: '5px 9px', borderRadius: 7, border: '1px solid #c7d2d0', background: '#fff', color: '#334155', cursor: 'pointer' }}>
                          แก้ไข
                        </button>
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
  )
}
