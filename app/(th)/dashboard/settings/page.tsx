'use client'

import { useState, useEffect } from 'react'
import { AMENITY_SECTIONS, DEFAULT_AMENITIES as SHARED_DEFAULT_AMENITIES, normaliseAmenity, type Amenity, type AmenitySection } from '@/lib/amenities'
import { createBrowserClient } from '@/lib/supabase'
import { DEFAULT_PROMO, normalisePromo, type CheckoutPromo } from '@/lib/promo'
import {
  DEFAULT_COMPANY_INFO, normaliseCompany, type CompanyInfo,
  EMAIL_TEMPLATE_INFO, normaliseEmailTemplates, type EmailTemplate,
  normalisePropertyTypes, type SiteType,
} from '@/lib/site-config'

// ── Types ─────────────────────────────────────────────────────────────────────

// Amenities are defined once in lib/amenities.ts — the listing form reads the
// same model, which is what this screen previously failed to control. Company
// info, owner emails and property types are modelled in lib/site-config.ts,
// which is also what the footer, the emails and the listing form read.
type AmenityTag = Amenity

const DEFAULT_AMENITIES: AmenityTag[] = SHARED_DEFAULT_AMENITIES

// ── Auth helpers ──────────────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  const { data: { session } } = await createBrowserClient().auth.getSession()
  return session?.access_token ?? ''
}

/**
 * Read one setting.
 *
 * /api/dashboard/settings is admin-only. Every read on this screen used to omit
 * the token while every WRITE sent it — and that asymmetry was dangerous, not
 * merely broken. The read came back 401, each empty .catch() swallowed it, the
 * form sat on its hardcoded defaults as though nothing were saved, and then the
 * next save wrote those defaults back over whatever was actually stored.
 *
 * Failures are thrown so a section can show them rather than silently present
 * defaults as if they were the saved values.
 */
async function loadSetting<T = unknown>(key: string): Promise<T | null> {
  const token = await getToken()
  const r = await fetch(`/api/dashboard/settings?key=${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(d?.error || `โหลดค่าไม่สำเร็จ (${r.status})`)
  return (d?.data ?? null) as T | null
}

async function saveSetting(key: string, value: unknown): Promise<void> {
  const token = await getToken()
  const r = await fetch('/api/dashboard/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ key, value }),
  })
  if (!r.ok) {
    const d = await r.json().catch(() => ({})) as { error?: string; detail?: string }
    throw new Error(d.detail || d.error || 'บันทึกไม่สำเร็จ')
  }
}

// ── Shared Components ─────────────────────────────────────────────────────────

function SaveButton({ onSave, saved, saving, error }: {
  onSave:  () => void
  saved:   boolean
  saving?: boolean
  error?:  string
}) {
  return (
    <div>
      {error && (
        <div style={{ color: '#ef4444', fontSize: 12.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>error</span>
          {error}
        </div>
      )}
      <button onClick={onSave} disabled={!!saving} style={{
        padding: '10px 24px', borderRadius: 11, border: 'none',
        background: saved ? '#22c55e' : '#02402e', color: '#fff', fontWeight: 600,
        fontSize: 13.5, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', gap: 8, transition: 'background .25s',
        opacity: saving ? 0.7 : 1,
      }}>
        
        {saving ? 'กำลังบันทึก...' : saved ? 'บันทึกแล้ว' : 'บันทึกการตั้งค่า'}
      </button>
    </div>
  )
}

const labelStyle: React.CSSProperties = { fontSize: 12.5, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 11,
  border: '1px solid #e2e8f0', fontSize: 14, outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit', color: '#02402e',
}

// ── Section 1: การแจ้งเตือนทางอีเมล ─────────────────────────────────────────
// lib/email.ts reads these subjects and on/off switches when it sends.

function EmailNotifications() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(normaliseEmailTemplates(null))
  const [saved, setSaved]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    loadSetting<unknown>('email_templates')
      .then(data => setTemplates(normaliseEmailTemplates(data)))
      .catch(e => setSaveError(e instanceof Error ? e.message : 'โหลดค่าไม่สำเร็จ'))
  }, [])

  function set(id: string, patch: Partial<EmailTemplate>) {
    setTemplates(t => t.map(tpl => tpl.id === id ? { ...tpl, ...patch } : tpl))
  }

  async function handleSave() {
    setSaving(true); setSaveError('')
    try {
      await saveSetting('email_templates', templates.map(t => ({ ...t, subject: t.subject.trim() })))
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ')
    }
    setSaving(false)
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#02402e', margin: '0 0 4px' }}>การแจ้งเตือนทางอีเมล</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>อีเมลที่ระบบส่งให้เจ้าของประกาศ แก้หัวเรื่องหรือปิดการส่งได้ที่นี่ มีผลกับอีเมลฉบับถัดไปภายใน 5 นาที</p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', marginBottom: 14 }}>
        {templates.map((tpl, i) => {
          const info = EMAIL_TEMPLATE_INFO[tpl.id]
          return (
            <div key={tpl.id} style={{ padding: '16px 20px', borderBottom: i < templates.length - 1 ? '1px solid #f1f5f4' : 'none' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 4 }}>
                <input type="checkbox" checked={tpl.enabled} onChange={e => set(tpl.id, { enabled: e.target.checked })} />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: '#02402e' }}>{info.name}</span>
                <span style={{ fontSize: 12, color: tpl.enabled ? '#15803d' : '#94a3b8' }}>{tpl.enabled ? 'ส่ง' : 'ไม่ส่ง'}</span>
              </label>
              <div style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 8px 26px' }}>ส่งเมื่อ: {info.trigger}</div>
              <div style={{ marginLeft: 26 }}>
                <label style={labelStyle}>หัวเรื่องอีเมล{info.vars && <span style={{ fontWeight: 400, color: '#94a3b8' }}> · ใช้ {info.vars}</span>}</label>
                <input value={tpl.subject} onChange={e => set(tpl.id, { subject: e.target.value })} style={inputStyle} />
              </div>
            </div>
          )
        })}
      </div>

      <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6, margin: '0 0 18px' }}>
        อีเมลยืนยันตอนสมัครสมาชิกส่งโดย Supabase แก้ได้ที่ Supabase Dashboard › Authentication › Email Templates
        อีเมลแจ้งเตือนถึงผู้ก่อตั้ง (ประกาศใหม่ ฟอร์มติดต่อ) ส่งทุกครั้งและไม่ได้อยู่ในหน้านี้
      </p>

      <SaveButton onSave={handleSave} saved={saved} saving={saving} error={saveError} />
    </div>
  )
}

// ── Section 2: ประเภทและสิ่งอำนวยความสะดวก ──────────────────────────────────

function TypesAndAmenities() {
  const [propTypes, setPropTypes] = useState<SiteType[]>(normalisePropertyTypes(null))
  const [amenities, setAmenities] = useState<AmenityTag[]>(DEFAULT_AMENITIES)
  const [newAm, setNewAm]         = useState<{ th: string; en: string; sec: AmenitySection }>({ th: '', en: '', sec: 'unit' })
  const [saved, setSaved]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    Promise.all([
      loadSetting<unknown>('property_types'),
      loadSetting<Record<string, unknown>[]>('amenities'),
    ]).then(([propertyTypes, amenityRows]) => {
      setPropTypes(normalisePropertyTypes(propertyTypes))
      // Older saved lists used four categories; normaliseAmenity maps them onto
      // the two sections so nothing has to be re-entered by hand.
      if (Array.isArray(amenityRows) && amenityRows.length) {
        const list = amenityRows
          .map((r, k) => normaliseAmenity(r, k))
          .filter(Boolean) as AmenityTag[]
        if (list.length) setAmenities(list)
      }
    }).catch(e => setSaveError(e instanceof Error ? e.message : 'โหลดค่าไม่สำเร็จ'))
  }, [])

  async function handleSave() {
    if (!propTypes.some(t => t.active)) { setSaveError('ต้องเปิดอย่างน้อย 1 ประเภท'); return }
    setSaving(true); setSaveError('')
    try {
      await Promise.all([
        saveSetting('property_types', propTypes),
        saveSetting('amenities', amenities),
      ])
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ')
    }
    setSaving(false)
  }

  function setType(value: string, patch: Partial<SiteType>) {
    setPropTypes(t => t.map(x => x.value === value ? { ...x, ...patch } : x))
  }
  function addAmenity() {
    if (!newAm.th) return   // Thai name is the identity; English is optional
    setAmenities(a => [...a, { id: String(Date.now()), name_th: newAm.th, name_en: newAm.en, section: newAm.sec }])
    setNewAm({ th: '', en: '', sec: 'unit' })
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#02402e', margin: '0 0 4px' }}>ประเภทและสิ่งอำนวยความสะดวก</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>ตัวเลือกที่แสดงในฟอร์มลงประกาศ ทั้งหน้าลงประกาศของเจ้าของและหน้าแอดมิน</p>
      </div>

      {/* Property Types */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 22, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#02402e', margin: '0 0 16px' }}>ประเภทอสังหาริมทรัพย์</h3>
        <p style={{ fontSize: 12.5, color: '#64748b', margin: '-8px 0 14px', lineHeight: 1.6 }}>
          ปิดประเภทเพื่อซ่อนจากฟอร์มลงประกาศ ประกาศเดิมของประเภทนั้นยังแสดงอยู่ แก้ชื่อที่แสดงบนปุ่มได้
          เพิ่มประเภทใหม่ไม่ได้จากหน้านี้ เพราะต้องมีตัวกรองค้นหาและหน้าทำเลรองรับ
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {propTypes.map(pt => (
            <div key={pt.value} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr', gap: 12, alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 11 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: pt.active ? '#02402e' : '#94a3b8', cursor: 'pointer' }}>
                <input type="checkbox" checked={pt.active} onChange={e => setType(pt.value, { active: e.target.checked })} />
                {pt.active ? 'แสดง' : 'ซ่อน'}
              </label>
              <input aria-label="ชื่อ (ไทย)" value={pt.name_th} onChange={e => setType(pt.value, { name_th: e.target.value })} style={inputStyle} />
              <input aria-label="ชื่อ (อังกฤษ)" value={pt.name_en} onChange={e => setType(pt.value, { name_en: e.target.value })} style={inputStyle} />
            </div>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 22, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#02402e', margin: '0 0 16px' }}>สิ่งอำนวยความสะดวก</h3>
        {AMENITY_SECTIONS.map(sec => {
          const cat = sec.label_th
          const items = amenities.filter(a => a.section === sec.key)
          if (items.length === 0) return null
          return (
            <div key={sec.key} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>{cat}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {items.map(am => (
                  <span key={am.id} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px 6px 14px', borderRadius: 20,
                    background: '#e8f5f0', color: '#02402e', fontSize: 13, fontWeight: 500,
                  }}>
                    {am.name_th}
                    <button
                      title={`ลบ "${am.name_th}"`}
                      onClick={() => {
                        // properties.amenities stores the Thai name, so removing
                        // or renaming an item orphans it on every listing that
                        // already selected it — it simply stops being displayed.
                        const ok = window.confirm(
                          `ลบ "${am.name_th}" ออกจากรายการ?\n\n` +
                          'ประกาศที่เลือกรายการนี้ไว้แล้วจะไม่แสดงรายการนี้อีก ' +
                          '(ข้อมูลอื่นของประกาศไม่ได้รับผลกระทบ)'
                        )
                        if (ok) setAmenities(a => a.filter(x => x.id !== am.id))
                      }}
                      style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: '#94a3b8',
                    }}>
                      ลบ
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )
        })}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', paddingTop: 14, borderTop: '1px solid #f0f2f1' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>สิ่งอำนวยความสะดวก (ไทย)</label>
            <input value={newAm.th} onChange={e => setNewAm(n => ({ ...n, th: e.target.value }))} style={inputStyle} placeholder="เช่น สวนหย่อม" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>(อังกฤษ)</label>
            <input value={newAm.en} onChange={e => setNewAm(n => ({ ...n, en: e.target.value }))} style={inputStyle} placeholder="e.g. Garden" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>หมวดหมู่</label>
            <select value={newAm.sec} onChange={e => setNewAm(n => ({ ...n, sec: e.target.value as AmenitySection }))}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              {AMENITY_SECTIONS.map(sc => <option key={sc.key} value={sc.key}>{sc.label_th}</option>)}
            </select>
          </div>
          <button onClick={addAmenity} style={{
            padding: '10px 16px', borderRadius: 11, border: 'none', background: '#02402e', color: '#fff',
            fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            
            เพิ่ม
          </button>
        </div>
      </div>

      <SaveButton onSave={handleSave} saved={saved} saving={saving} error={saveError} />
    </div>
  )
}

// ── Section 3: ข้อมูลบริษัท ─────────────────────────────────────────────────
// Read by the footer, the LINE button, the contact and /manage pages and the
// site's Organization schema (lib/site-settings → RootShell).

function CompanyInfoSection() {
  const [form, setForm]           = useState<CompanyInfo>(DEFAULT_COMPANY_INFO)
  const [saved, setSaved]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    loadSetting<unknown>('company_info')
      .then(data => setForm(normaliseCompany(data)))
      .catch(e => setSaveError(e instanceof Error ? e.message : 'โหลดค่าไม่สำเร็จ'))
  }, [])

  function set(k: keyof CompanyInfo, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    setSaving(true); setSaveError('')
    try {
      // Saved as the site will read it, so the form shows what is live.
      const clean = normaliseCompany(form)
      await saveSetting('company_info', clean)
      setForm(clean)
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ')
    }
    setSaving(false)
  }

  const groups: { title: string; fields: { k: keyof CompanyInfo; l: string; ph: string; wide?: boolean }[] }[] = [
    {
      title: 'ที่ตั้งสำนักงาน',
      fields: [
        { k: 'address',    l: 'ที่อยู่ (ไทย) แสดงในหน้าภาษาไทย',         ph: 'Summer Hill (unit 3026), 1106 ถนนสุขุมวิท...', wide: true },
        { k: 'address_en', l: 'Address (English) แสดงในหน้า /en',      ph: 'Summer Hill (unit 3026), 1106 Sukhumvit Road...', wide: true },
      ],
    },
    {
      title: 'ช่องทางติดต่อ',
      fields: [
        { k: 'email',   l: 'อีเมลติดต่อ',          ph: 'support@spacesmate.com' },
        { k: 'phone',   l: 'เบอร์โทรศัพท์',         ph: '02-012-5190' },
        { k: 'line_oa', l: 'LINE Official Account', ph: '@spacesmate' },
      ],
    },
    {
      title: 'โซเชียลมีเดีย',
      fields: [
        { k: 'facebook',  l: 'Facebook URL',  ph: 'https://www.facebook.com/spacesmateTH' },
        { k: 'instagram', l: 'Instagram URL', ph: 'https://www.instagram.com/spacesmate/' },
        { k: 'tiktok',    l: 'TikTok URL',    ph: 'https://www.tiktok.com/@spacesmate' },
      ],
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#02402e', margin: '0 0 4px' }}>ข้อมูลบริษัท</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>ใช้ใน footer ปุ่ม LINE หน้าติดต่อเรา หน้ารับบริหารอาคาร และข้อมูลบริษัทที่ Google อ่าน มีผลภายใน 5 นาทีหลังบันทึก</p>
      </div>

      {groups.map(g => (
        <div key={g.title} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 22, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#02402e', margin: '0 0 16px' }}>{g.title}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {g.fields.map(f => (
              <div key={f.k} style={f.wide ? { gridColumn: '1 / -1' } : {}}>
                <label style={labelStyle}>{f.l}</label>
                <input value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={inputStyle} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6, margin: '0 0 18px' }}>
        ชื่อบริษัท เลขทะเบียน และที่อยู่ในนโยบายความเป็นส่วนตัวและข้อกำหนดการใช้งานเป็นข้อความทางกฎหมาย
        แก้ในตัวเอกสารเท่านั้น ไม่ได้ดึงจากหน้านี้ ช่องที่เว้นว่างจะใช้ค่าเดิม
      </p>

      <SaveButton onSave={handleSave} saved={saved} saving={saving} error={saveError} />
    </div>
  )
}

// ── Section 4: การชำระเงิน (โค้ดส่วนลดหน้าชำระเงิน) ─────────────────────────────

function PaymentSettings() {
  const [form, setForm]           = useState<CheckoutPromo>(DEFAULT_PROMO)
  const [saved, setSaved]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    loadSetting<CheckoutPromo>('checkout_promo')
      .then(data => { if (data && typeof data === 'object') setForm(normalisePromo(data)) })
      .catch(e => setSaveError(e instanceof Error ? e.message : 'โหลดค่าไม่สำเร็จ'))
  }, [])

  function set<K extends keyof CheckoutPromo>(k: K, v: CheckoutPromo[K]) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    setSaving(true); setSaveError('')
    try {
      await saveSetting('checkout_promo', { ...form, code: form.code.trim().toUpperCase() })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ')
    }
    setSaving(false)
  }

  const card = { background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 22, marginBottom: 16 }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#02402e', margin: '0 0 4px' }}>การชำระเงิน</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>ข้อความโปรโมชันและโค้ดส่วนลดที่แสดงในขั้น “ส่วนลด” ของหน้าชำระเงิน</p>
      </div>

      <div style={{ ...card, background: '#fbf0e1', borderColor: '#f1dcbc' }}>
        <div style={{ fontSize: 13.5, color: '#5c3a06', lineHeight: 1.65 }}>
          <strong>สร้างโค้ดใน Stripe ก่อน</strong> ที่ Stripe Dashboard › Products › Coupons สร้างคูปอง (เช่น ลด ฿299 ใช้ได้ครั้งแรกเท่านั้น)
          แล้วเพิ่ม Promotion code ให้ตรงกับโค้ดด้านล่าง ระบบจะตรวจโค้ดกับ Stripe ทุกครั้งที่ผู้ใช้กด “ใช้โค้ด”
          ถ้าโค้ดใน Stripe หมดอายุหรือถูกปิด ผู้ใช้จะเห็นว่าโค้ดใช้ไม่ได้
        </div>
      </div>

      <div style={card}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#334155', cursor: 'pointer', marginBottom: 18 }}>
          <input type="checkbox" checked={form.enabled} onChange={e => set('enabled', e.target.checked)} />
          แสดงโปรโมชันในหน้าชำระเงิน
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1', maxWidth: 260 }}>
            <label style={labelStyle}>โค้ด (ตรงกับ Promotion code ใน Stripe)</label>
            <input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="SM299" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>หัวข้อ (ไทย)</label>
            <input value={form.title_th} onChange={e => set('title_th', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Title (English)</label>
            <input value={form.title_en} onChange={e => set('title_en', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>คำอธิบาย (ไทย)</label>
            <input value={form.note_th} onChange={e => set('note_th', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Note (English)</label>
            <input value={form.note_en} onChange={e => set('note_en', e.target.value)} style={inputStyle} />
          </div>
        </div>
      </div>

      <SaveButton onSave={handleSave} saved={saved} saving={saving} error={saveError} />
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type SettingsTab = 'emails' | 'types' | 'company' | 'payments'

const SIDEBAR_NAV: Array<{ k: SettingsTab; label: string; desc: string }> = [
  { k: 'emails',    label: 'แจ้งเตือนอีเมล',      desc: 'หัวเรื่อง เปิด/ปิดการส่ง' },
  { k: 'types',     label: 'ประเภทและสิ่งอำนวยฯ', desc: 'ตัวเลือกในฟอร์ม' },
  { k: 'company',   label: 'ข้อมูลบริษัท',         desc: 'ที่อยู่ ช่องทางติดต่อ โซเชียล' },
  { k: 'payments',  label: 'การชำระเงิน',         desc: 'โค้ดส่วนลด โปรโมชัน' },
]

export default function SettingsPage() {
  const [active, setActive] = useState<SettingsTab>('emails')

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 3px', color: '#02402e' }}>ตั้งค่า</h1>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>กำหนดค่าระบบ เนื้อหา SEO และช่องทางการสื่อสาร</p>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <div style={{ width: 220, flexShrink: 0, background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: '10px 10px', position: 'sticky', top: 24 }}>
          {SIDEBAR_NAV.map(n => {
            const isActive = active === n.k
            return (
              <button key={n.k} onClick={() => setActive(n.k)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 13px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: isActive ? '#02402e' : 'transparent', textAlign: 'left', fontFamily: 'inherit',
                marginBottom: 2, transition: 'background .15s',
              }}>
                
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? '#fff' : '#334155', lineHeight: 1.2 }}>{n.label}</div>
                  <div style={{ fontSize: 11, color: isActive ? 'rgba(255,255,255,0.55)' : '#94a3b8', marginTop: 2 }}>{n.desc}</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {active === 'emails'    && <EmailNotifications />}
          {active === 'types'     && <TypesAndAmenities />}
          {active === 'company'   && <CompanyInfoSection />}
          {active === 'payments'  && <PaymentSettings />}
        </div>
      </div>
    </div>
  )
}
