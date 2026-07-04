'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

interface LocationRequest {
  id: string
  text: string
  type: 'location' | 'project'
  submittedBy: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  trigger: string
  enabled: boolean
}

interface PropertyType {
  id: string
  name_th: string
  name_en: string
  active: boolean
}

interface AmenityTag {
  id: string
  name_th: string
  name_en: string
  category: string
}

// ── Defaults (used as initial state + fallback if API returns nothing) ─────────

const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  { id: '1', name: 'ยืนยันอีเมล (สมัครสมาชิก)', subject: 'ยืนยันอีเมลของคุณ — SpacesMate', trigger: 'เมื่อผู้ใช้สมัครใหม่', enabled: true },
  { id: '2', name: 'ประกาศได้รับการอนุมัติ', subject: 'ประกาศของคุณอนุมัติแล้ว — SpacesMate', trigger: 'เมื่อ admin อนุมัติประกาศ', enabled: true },
  { id: '3', name: 'แพ็กเกจใกล้หมดอายุ (7 วัน)', subject: 'แพ็กเกจของคุณจะหมดอายุใน 7 วัน', trigger: '7 วันก่อนแพ็กเกจหมด', enabled: true },
  { id: '4', name: 'แพ็กเกจหมดอายุ', subject: 'แพ็กเกจของคุณหมดอายุแล้ว — ต่ออายุได้เลย', trigger: 'วันที่แพ็กเกจหมดอายุ', enabled: false },
  { id: '5', name: 'ต้อนรับสมาชิกใหม่', subject: 'ยินดีต้อนรับสู่ SpacesMate 🏡', trigger: 'เมื่ออีเมลได้รับการยืนยัน', enabled: true },
  { id: '6', name: 'ประกาศถูกปฏิเสธ', subject: 'ประกาศของคุณต้องแก้ไข — SpacesMate', trigger: 'เมื่อ admin ปฏิเสธประกาศ', enabled: true },
]

const DEFAULT_PROPERTY_TYPES: PropertyType[] = [
  { id: '1', name_th: 'อพาร์ทเม้นท์',      name_en: 'Apartment',  active: true },
  { id: '2', name_th: 'คอนโดมิเนียม',       name_en: 'Condo',      active: true },
  { id: '3', name_th: 'บ้าน',               name_en: 'House',      active: true },
  { id: '4', name_th: 'ออฟฟิศ',             name_en: 'Office',     active: true },
  { id: '5', name_th: 'โคเวิร์กกิ้งสเปซ',   name_en: 'Co-Working', active: true },
  { id: '6', name_th: 'อาคารพาณิชย์',       name_en: 'Commercial', active: false },
]

const AMENITY_CATEGORIES = ['ห้องและสิ่งอำนวยความสะดวก', 'บริการส่วนกลาง', 'ความปลอดภัย', 'การเดินทาง']

const DEFAULT_AMENITIES: AmenityTag[] = [
  { id: '1',  name_th: 'เครื่องปรับอากาศ',       name_en: 'Air Conditioning', category: 'ห้องและสิ่งอำนวยความสะดวก' },
  { id: '2',  name_th: 'เฟอร์นิเจอร์ครบ',         name_en: 'Fully Furnished',  category: 'ห้องและสิ่งอำนวยความสะดวก' },
  { id: '3',  name_th: 'อินเทอร์เน็ต',             name_en: 'Internet',         category: 'ห้องและสิ่งอำนวยความสะดวก' },
  { id: '4',  name_th: 'สระว่ายน้ำ',               name_en: 'Swimming Pool',    category: 'บริการส่วนกลาง' },
  { id: '5',  name_th: 'ฟิตเนส',                   name_en: 'Fitness',          category: 'บริการส่วนกลาง' },
  { id: '6',  name_th: 'ที่จอดรถ',                 name_en: 'Parking',          category: 'บริการส่วนกลาง' },
  { id: '7',  name_th: 'รักษาความปลอดภัย 24 ชม.', name_en: '24hr Security',    category: 'ความปลอดภัย' },
  { id: '8',  name_th: 'กล้องวงจรปิด',             name_en: 'CCTV',             category: 'ความปลอดภัย' },
  { id: '9',  name_th: 'ใกล้ BTS/MRT',             name_en: 'Near BTS/MRT',     category: 'การเดินทาง' },
  { id: '10', name_th: 'ใกล้ห้างสรรพสินค้า',       name_en: 'Near Shopping',    category: 'การเดินทาง' },
  { id: '11', name_th: 'รับสัตว์เลี้ยง',            name_en: 'Pet Friendly',     category: 'ห้องและสิ่งอำนวยความสะดวก' },
  { id: '12', name_th: 'ลิฟต์',                    name_en: 'Elevator',         category: 'บริการส่วนกลาง' },
]

const DEFAULT_COMPANY_INFO = {
  name_th:   'บริษัท เสปซเวิร์คส จำกัด',
  name_en:   'Space Works Co., Ltd.',
  reg_no:    '0105569001611',
  email:     'support@spacesmate.com',
  phone:     '',
  line_oa:   '@spacesmate',
  facebook:  'https://www.facebook.com/spacesmateTH',
  instagram: 'https://www.instagram.com/spacesmate/',
  tiktok:    'https://www.tiktok.com/@spacesmate',
  address:   'Summer Hill (unit 3026), 1106 ถนนสุขุมวิท แขวงพระโขนง เขตคลองเตย กรุงเทพฯ 10110',
}

const DEFAULT_SEO_SETTINGS = {
  title_template:    '%s | SpacesMate — ที่พักกรุงเทพ อพาร์ทเม้นท์ คอนโด บ้านเช่า',
  desc_template:     'SpacesMate — ค้นหา%s ในกรุงเทพ ราคาดี ทำเลเด่น ยืนยันแล้วทุกรายการ ไม่มีค่าใช้จ่ายซ่อน',
  og_sitename:       'SpacesMate',
  og_image:          'https://spacesmate.com/og-image.jpg',
  aeo_faq:           true,
  aeo_breadcrumb:    true,
  aeo_product:       true,
  aeo_localBusiness: true,
  sitemap_freq:      'weekly',
  canonical_domain:  'https://spacesmate.com',
  robots_index:      true,
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  const { data: { session } } = await createBrowserClient().auth.getSession()
  return session?.access_token ?? ''
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
        <span className="msym" style={{
          fontSize: 18, fontVariationSettings: "'wght' 400, 'FILL' 0",
          ...(saving ? { animation: 'spin .8s linear infinite', display: 'inline-block' } : {}),
        }}>
          {saving ? 'progress_activity' : saved ? 'check' : 'save'}
        </span>
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

// ── Section 1: คำขอเพิ่มทำเล / ชื่อโครงการ ──────────────────────────────────

function LocationRequests() {
  const [requests, setRequests] = useState<LocationRequest[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const token = await getToken()
        const r = await fetch('/api/dashboard/settings/location-requests', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const { requests: rows } = await r.json()
        setRequests(rows ?? [])
      } catch { /* fall through with empty list */ }
    })()
  }, [])

  async function update(id: string, status: 'approved' | 'rejected') {
    setRequests(r => r.map(req => req.id === id ? { ...req, status } : req))
    try {
      const token = await getToken()
      await fetch('/api/dashboard/settings/location-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status }),
      })
    } catch (e) {
      console.error('Failed to update location request:', e)
    }
  }

  const pending  = requests.filter(r => r.status === 'pending')
  const resolved = requests.filter(r => r.status !== 'pending')

  const typeLabel = (t: string) => t === 'location' ? 'ทำเล' : 'โครงการ'
  const typeBg    = (t: string) => t === 'location' ? '#e8f5f0' : '#eef2ff'
  const typeColor = (t: string) => t === 'location' ? '#048c73' : '#4f46e5'

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#02402e', margin: '0 0 4px' }}>คำขอเพิ่มทำเล / ชื่อโครงการ</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>ผู้ใช้เสนอคำค้นใหม่ — อนุมัติเพื่อสร้างหน้า SEO Landing Page อัตโนมัติ</p>
      </div>

      <div style={{ background: '#f0f7f4', border: '1px solid #c8e6da', borderRadius: 13, padding: '14px 18px', marginBottom: 22, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span className="msym" style={{ fontSize: 20, color: '#048c73', flexShrink: 0, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>info</span>
        <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
          เมื่ออนุมัติ — ระบบจะสร้างหน้า <strong>/area/[slug]</strong> ใหม่โดยอัตโนมัติ
          และนำคำค้นนั้นไปรวมใน sitemap.xml และ SEO keyword pool
        </div>
      </div>

      {pending.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
            รอการอนุมัติ ({pending.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.map(req => (
              <div key={req.id} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ padding: '4px 12px', borderRadius: 20, background: typeBg(req.type), color: typeColor(req.type), fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                  {typeLabel(req.type)}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#02402e', fontSize: 14 }}>{req.text}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>โดย {req.submittedBy} · {req.submittedAt}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => update(req.id, 'rejected')} style={{
                    padding: '7px 14px', borderRadius: 9, border: '1px solid #fecaca',
                    background: '#fff', color: '#b91c1c', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}>ปฏิเสธ</button>
                  <button onClick={() => update(req.id, 'approved')} style={{
                    padding: '7px 16px', borderRadius: 9, border: 'none',
                    background: '#02402e', color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}>อนุมัติ<span className="msym" style={{ fontSize: 14, margin: '0 3px', fontVariationSettings: "'wght' 300, 'FILL' 0", verticalAlign: 'middle' }}>arrow_forward</span>สร้างหน้า SEO</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>ประวัติ</div>
          <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 14, overflow: 'hidden' }}>
            {resolved.map((req, i) => (
              <div key={req.id} style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: i < resolved.length - 1 ? '1px solid #f1f5f4' : 'none' }}>
                <span style={{ padding: '3px 10px', borderRadius: 20, background: typeBg(req.type), color: typeColor(req.type), fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                  {typeLabel(req.type)}
                </span>
                <span style={{ flex: 1, fontSize: 13.5, color: '#334155', fontWeight: 500 }}>{req.text}</span>
                <span style={{
                  fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                  background: req.status === 'approved' ? '#dcfce7' : '#fee2e2',
                  color: req.status === 'approved' ? '#15803d' : '#b91c1c',
                }}>
                  {req.status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธ'}
                </span>
                <span style={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>{req.submittedAt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && (
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
          <span className="msym" style={{ fontSize: 40, color: '#e2e8f0', display: 'block', marginBottom: 10, fontVariationSettings: "'wght' 200, 'FILL' 0" }}>inbox</span>
          ไม่มีคำขอที่รอการอนุมัติ
        </div>
      )}
    </div>
  )
}

// ── Section 2: การแจ้งเตือนทางอีเมล์ ────────────────────────────────────────

function EmailNotifications() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_EMAIL_TEMPLATES)
  const [editing, setEditing]     = useState<EmailTemplate | null>(null)
  const [saved, setSaved]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    fetch('/api/dashboard/settings?key=email_templates')
      .then(r => r.json())
      .then(({ data }) => { if (Array.isArray(data)) setTemplates(data) })
      .catch(() => {})
  }, [])

  function toggle(id: string) {
    setTemplates(t => t.map(tpl => tpl.id === id ? { ...tpl, enabled: !tpl.enabled } : tpl))
  }

  async function handleSave() {
    setSaving(true); setSaveError('')
    try {
      await saveSetting('email_templates', templates)
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ')
    }
    setSaving(false)
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#02402e', margin: '0 0 4px' }}>การแจ้งเตือนทางอีเมล์</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>จัดการเทมเพลทอีเมลที่ส่งให้ผู้ใช้อัตโนมัติ</p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', marginBottom: 20 }}>
        {templates.map((tpl, i) => (
          <div key={tpl.id} style={{
            padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16,
            borderBottom: i < templates.length - 1 ? '1px solid #f1f5f4' : 'none',
          }}>
            <button onClick={() => toggle(tpl.id)} style={{
              width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', flexShrink: 0,
              background: tpl.enabled ? '#02402e' : '#e2e8f0', position: 'relative', transition: 'background .2s',
            }}>
              <span style={{
                position: 'absolute', top: 3, left: tpl.enabled ? 20 : 3,
                width: 16, height: 16, borderRadius: '50%', background: '#fff',
                transition: 'left .2s',
              }} />
            </button>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#02402e' }}>{tpl.name}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Trigger: {tpl.trigger}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>Subject: {tpl.subject}</div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <span style={{
                fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                background: tpl.enabled ? '#dcfce7' : '#f1f5f9', color: tpl.enabled ? '#15803d' : '#94a3b8',
              }}>{tpl.enabled ? 'เปิด' : 'ปิด'}</span>
              <button onClick={() => setEditing({ ...tpl })} style={{
                padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
                background: '#fff', color: '#64748b', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>edit</span>
                แก้ไข
              </button>
            </div>
          </div>
        ))}
      </div>

      <SaveButton onSave={handleSave} saved={saved} saving={saving} error={saveError} />

      {editing && (
        <>
          <div onClick={() => setEditing(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(2,64,46,0.18)', zIndex: 100 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            background: '#fff', borderRadius: 20, padding: 32, width: 500, zIndex: 101,
            boxShadow: '0 20px 60px rgba(2,64,46,0.18)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#02402e', marginBottom: 20 }}>แก้ไขอีเมล: {editing.name}</div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Subject Line</label>
              <input value={editing.subject} onChange={e => setEditing({ ...editing, subject: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 11, fontSize: 12.5, color: '#64748b', marginBottom: 20, lineHeight: 1.6 }}>
              <span className="msym" style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 6, color: '#048c73', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>info</span>
              Body ของอีเมลจัดการผ่าน Email Service Provider (Supabase Auth / SendGrid)
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditing(null)} style={{ padding: '9px 20px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit' }}>ยกเลิก</button>
              <button onClick={() => {
                setTemplates(t => t.map(tpl => tpl.id === editing.id ? editing : tpl))
                setEditing(null)
              }} style={{ padding: '9px 22px', borderRadius: 10, border: 'none', background: '#02402e', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>บันทึก</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Section 3: ประเภทและสิ่งอำนวยความสะดวก ──────────────────────────────────

function TypesAndAmenities() {
  const [propTypes, setPropTypes] = useState<PropertyType[]>(DEFAULT_PROPERTY_TYPES)
  const [amenities, setAmenities] = useState<AmenityTag[]>(DEFAULT_AMENITIES)
  const [newType, setNewType]     = useState({ th: '', en: '' })
  const [newAm, setNewAm]         = useState({ th: '', en: '', cat: AMENITY_CATEGORIES[0] })
  const [saved, setSaved]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/settings?key=property_types').then(r => r.json()),
      fetch('/api/dashboard/settings?key=amenities').then(r => r.json()),
    ]).then(([ptRes, amRes]) => {
      if (Array.isArray(ptRes.data)) setPropTypes(ptRes.data)
      if (Array.isArray(amRes.data)) setAmenities(amRes.data)
    }).catch(() => {})
  }, [])

  async function handleSave() {
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

  function addType() {
    if (!newType.th || !newType.en) return
    setPropTypes(t => [...t, { id: String(Date.now()), name_th: newType.th, name_en: newType.en, active: true }])
    setNewType({ th: '', en: '' })
  }
  function addAmenity() {
    if (!newAm.th || !newAm.en) return
    setAmenities(a => [...a, { id: String(Date.now()), name_th: newAm.th, name_en: newAm.en, category: newAm.cat }])
    setNewAm({ th: '', en: '', cat: AMENITY_CATEGORIES[0] })
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#02402e', margin: '0 0 4px' }}>ประเภทและสิ่งอำนวยความสะดวก</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>ตัวเลือกที่แสดงในฟอร์มลงประกาศ — เพิ่ม / ปิดการใช้งาน / ลบได้เลย</p>
      </div>

      {/* Property Types */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 22, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#02402e', margin: '0 0 16px' }}>ประเภทอสังหาริมทรัพย์</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          {propTypes.map(pt => (
            <div key={pt.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', background: '#f8fafc', borderRadius: 11 }}>
              <button onClick={() => setPropTypes(t => t.map(x => x.id === pt.id ? { ...x, active: !x.active } : x))} style={{
                width: 38, height: 21, borderRadius: 10, border: 'none', cursor: 'pointer', flexShrink: 0,
                background: pt.active ? '#02402e' : '#e2e8f0', position: 'relative', transition: 'background .2s',
              }}>
                <span style={{ position: 'absolute', top: 2.5, left: pt.active ? 19 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
              </button>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: pt.active ? '#02402e' : '#94a3b8' }}>{pt.name_th}</span>
              <span style={{ fontSize: 12.5, color: '#94a3b8' }}>{pt.name_en}</span>
              <button onClick={() => setPropTypes(t => t.filter(x => x.id !== pt.id))} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#cbd5e1',
              }}>
                <span className="msym" style={{ fontSize: 17, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>delete</span>
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>ชื่อ (ไทย)</label>
            <input value={newType.th} onChange={e => setNewType(n => ({ ...n, th: e.target.value }))} style={inputStyle} placeholder="เช่น วิลล่า" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>ชื่อ (อังกฤษ)</label>
            <input value={newType.en} onChange={e => setNewType(n => ({ ...n, en: e.target.value }))} style={inputStyle} placeholder="e.g. Villa" />
          </div>
          <button onClick={addType} style={{
            padding: '10px 16px', borderRadius: 11, border: 'none', background: '#02402e', color: '#fff',
            fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>add</span>
            เพิ่ม
          </button>
        </div>
      </div>

      {/* Amenities */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 22, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#02402e', margin: '0 0 16px' }}>สิ่งอำนวยความสะดวก</h3>
        {AMENITY_CATEGORIES.map(cat => {
          const items = amenities.filter(a => a.category === cat)
          if (items.length === 0) return null
          return (
            <div key={cat} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>{cat}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {items.map(am => (
                  <span key={am.id} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px 6px 14px', borderRadius: 20,
                    background: '#e8f5f0', color: '#02402e', fontSize: 13, fontWeight: 500,
                  }}>
                    {am.name_th}
                    <button onClick={() => setAmenities(a => a.filter(x => x.id !== am.id))} style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: '#94a3b8',
                    }}>
                      <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 0" }}>close</span>
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
            <select value={newAm.cat} onChange={e => setNewAm(n => ({ ...n, cat: e.target.value }))}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              {AMENITY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={addAmenity} style={{
            padding: '10px 16px', borderRadius: 11, border: 'none', background: '#02402e', color: '#fff',
            fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>add</span>
            เพิ่ม
          </button>
        </div>
      </div>

      <SaveButton onSave={handleSave} saved={saved} saving={saving} error={saveError} />
    </div>
  )
}

// ── Section 4: ข้อมูลบริษัท ──────────────────────────────────────────────────

function CompanyInfo() {
  const [form, setForm]           = useState(DEFAULT_COMPANY_INFO)
  const [saved, setSaved]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    fetch('/api/dashboard/settings?key=company_info')
      .then(r => r.json())
      .then(({ data }) => {
        if (data && typeof data === 'object') setForm({ ...DEFAULT_COMPANY_INFO, ...data as typeof DEFAULT_COMPANY_INFO })
      })
      .catch(() => {})
  }, [])

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    setSaving(true); setSaveError('')
    try {
      await saveSetting('company_info', form)
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ')
    }
    setSaving(false)
  }

  const groups = [
    {
      title: 'ข้อมูลทางกฎหมาย',
      fields: [
        { k: 'name_th', l: 'ชื่อบริษัท (ไทย)',      ph: 'บริษัท เสปซเวิร์คส จำกัด' },
        { k: 'name_en', l: 'ชื่อบริษัท (อังกฤษ)',    ph: 'Space Works Co., Ltd.' },
        { k: 'reg_no',  l: 'เลขทะเบียนนิติบุคคล',   ph: '0105569001611' },
        { k: 'address', l: 'ที่ตั้งสำนักงาน',          ph: 'Summer Hill (unit 3026), 1106 ถนนสุขุมวิท...' },
      ],
    },
    {
      title: 'ช่องทางติดต่อ',
      fields: [
        { k: 'email',   l: 'อีเมลติดต่อ',              ph: 'support@spacesmate.com' },
        { k: 'phone',   l: 'เบอร์โทรศัพท์',             ph: '+66 x xxxx xxxx' },
        { k: 'line_oa', l: 'LINE Official Account',     ph: '@spacesmate' },
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
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>ข้อมูลที่ใช้ในเอกสาร footer และช่องทางการติดต่อ</p>
      </div>

      {/* Logo section */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 22, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#02402e', margin: '0 0 16px' }}>โลโก้บริษัท</h3>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{
            width: 120, height: 60, borderRadius: 12, background: '#02402e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 16, color: '#fff', flexShrink: 0,
          }}>SpacesMate</div>
          <div>
            <div style={{ fontSize: 13.5, color: '#334155', marginBottom: 8 }}>โลโก้หลัก (พื้นหลังมืด)</div>
            <button style={{
              padding: '8px 16px', borderRadius: 9, border: '1px dashed #c8e6da',
              background: '#f0f7f4', color: '#048c73', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>upload</span>
              อัปโหลดโลโก้ใหม่
            </button>
            <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 6 }}>PNG หรือ SVG · พื้นหลังโปร่งใส · แนะนำ 400×200px</div>
          </div>
        </div>
      </div>

      {groups.map(g => (
        <div key={g.title} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 22, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#02402e', margin: '0 0 16px' }}>{g.title}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {g.fields.map(f => (
              <div key={f.k} style={f.k === 'address' ? { gridColumn: '1 / -1' } : {}}>
                <label style={labelStyle}>{f.l}</label>
                <input value={(form as Record<string, string>)[f.k] ?? ''} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={inputStyle} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <SaveButton onSave={handleSave} saved={saved} saving={saving} error={saveError} />
    </div>
  )
}

// ── Section 5: SEO & AEO เริ่มต้น ────────────────────────────────────────────

function SeoAeoSettings() {
  const [form, setForm]           = useState(DEFAULT_SEO_SETTINGS)
  const [saved, setSaved]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    fetch('/api/dashboard/settings?key=seo_settings')
      .then(r => r.json())
      .then(({ data }) => {
        if (data && typeof data === 'object') setForm({ ...DEFAULT_SEO_SETTINGS, ...data as typeof DEFAULT_SEO_SETTINGS })
      })
      .catch(() => {})
  }, [])

  function set(k: string, v: string | boolean) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    setSaving(true); setSaveError('')
    try {
      await saveSetting('seo_settings', form)
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ')
    }
    setSaving(false)
  }

  const toggleStyle = (on: boolean): React.CSSProperties => ({
    width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', flexShrink: 0,
    background: on ? '#02402e' : '#e2e8f0', position: 'relative', transition: 'background .2s',
  })

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#02402e', margin: '0 0 4px' }}>SEO & AEO เริ่มต้น</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>ตั้งค่า SEO ระดับเว็บไซต์ — Structured Data, Sitemap, Meta Templates</p>
      </div>

      {/* Meta templates */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 22, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#02402e', margin: '0 0 16px' }}>Meta Tag Templates</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Title Template <span style={{ color: '#94a3b8', fontWeight: 400 }}>(%s = ชื่อหน้า)</span></label>
            <input value={form.title_template} onChange={e => set('title_template', e.target.value)} style={inputStyle} />
            <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4 }}>{form.title_template.length}/70 ตัวอักษร</div>
          </div>
          <div>
            <label style={labelStyle}>Description Template <span style={{ color: '#94a3b8', fontWeight: 400 }}>(%s = คีย์เวิร์ดหลัก)</span></label>
            <textarea value={form.desc_template} onChange={e => set('desc_template', e.target.value)} rows={2}
              style={{ ...inputStyle, resize: 'none' }} />
            <div style={{ fontSize: 11.5, color: form.desc_template.length > 160 ? '#ef4444' : '#94a3b8', marginTop: 4 }}>
              {form.desc_template.length}/160 ตัวอักษร
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>OG Site Name</label>
              <input value={form.og_sitename} onChange={e => set('og_sitename', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>OG Default Image URL</label>
              <input value={form.og_image} onChange={e => set('og_image', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Canonical Domain</label>
              <input value={form.canonical_domain} onChange={e => set('canonical_domain', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Sitemap Update Frequency</label>
              <select value={form.sitemap_freq} onChange={e => set('sitemap_freq', e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* AEO Structured Data */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 22, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#02402e', margin: '0 0 4px' }}>AEO — Structured Data (Schema.org)</h3>
        <p style={{ fontSize: 12.5, color: '#94a3b8', margin: '0 0 18px' }}>เปิดใช้ JSON-LD Schema ที่เกี่ยวข้องในแต่ละหน้า — ช่วยให้ Google และ AI Answer Engine อ่านข้อมูลได้ถูกต้อง</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { k: 'aeo_faq',           l: 'FAQ Schema',              desc: 'หน้า FAQ, บทความ — เพิ่มโอกาสได้ Featured Snippet ใน Google' },
            { k: 'aeo_breadcrumb',    l: 'Breadcrumb Schema',       desc: 'แสดง path navigation ใน Google Search results' },
            { k: 'aeo_product',       l: 'RealEstateListing Schema', desc: 'ข้อมูลประกาศแต่ละรายการ — ราคา, ทำเล, คุณสมบัติ' },
            { k: 'aeo_localBusiness', l: 'LocalBusiness Schema',    desc: 'ข้อมูลบริษัท SpacesMate สำหรับ Google Business Profile' },
          ].map(s => (
            <div key={s.k} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: '#f8fafc', borderRadius: 12 }}>
              <button onClick={() => set(s.k, !(form as Record<string, unknown>)[s.k])} style={toggleStyle(!!(form as Record<string, unknown>)[s.k])}>
                <span style={{ position: 'absolute', top: 3, left: (form as Record<string, unknown>)[s.k] ? 20 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#02402e' }}>{s.l}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{s.desc}</div>
              </div>
              <span style={{
                fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                background: (form as Record<string, unknown>)[s.k] ? '#dcfce7' : '#f1f5f9',
                color:      (form as Record<string, unknown>)[s.k] ? '#15803d' : '#94a3b8',
              }}>{(form as Record<string, unknown>)[s.k] ? 'เปิด' : 'ปิด'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Robots */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 22, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#02402e', margin: '0 0 16px' }}>Robots & Indexing</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: '#f8fafc', borderRadius: 12 }}>
          <button onClick={() => set('robots_index', !form.robots_index)} style={toggleStyle(form.robots_index)}>
            <span style={{ position: 'absolute', top: 3, left: form.robots_index ? 20 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#02402e' }}>อนุญาตให้ Crawler Index เว็บไซต์</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>robots.txt: {form.robots_index ? 'Allow all / index, follow' : 'Disallow all (ซ่อนจาก Google)'}</div>
          </div>
          {!form.robots_index && (
            <span style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: '#fee2e2', color: '#b91c1c', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>warning</span>
              ซ่อนจาก Google
            </span>
          )}
        </div>
      </div>

      <SaveButton onSave={handleSave} saved={saved} saving={saving} error={saveError} />
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type SettingsTab = 'locations' | 'emails' | 'types' | 'company' | 'seo'

const SIDEBAR_NAV: Array<{ k: SettingsTab; label: string; icon: string; desc: string }> = [
  { k: 'locations', label: 'คำขอเพิ่มทำเล',      icon: 'add_location',  desc: 'อนุมัติทำเล / โครงการ' },
  { k: 'emails',    label: 'แจ้งเตือนอีเมล',      icon: 'mail',          desc: 'เทมเพลทอีเมล' },
  { k: 'types',     label: 'ประเภทและสิ่งอำนวยฯ', icon: 'tune',          desc: 'ตัวเลือกในฟอร์ม' },
  { k: 'company',   label: 'ข้อมูลบริษัท',         icon: 'business',      desc: 'โลโก้ ที่อยู่ โซเชียล' },
  { k: 'seo',       label: 'SEO & AEO เริ่มต้น',  icon: 'manage_search', desc: 'Meta, Schema, Robots' },
]

export default function SettingsPage() {
  const [active, setActive] = useState<SettingsTab>('locations')

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
                <span className="msym" style={{
                  fontSize: 20, flexShrink: 0, lineHeight: 1,
                  color: isActive ? '#d97f11' : '#94a3b8',
                  fontVariationSettings: "'wght' 300, 'FILL' 0",
                }}>{n.icon}</span>
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
          {active === 'locations' && <LocationRequests />}
          {active === 'emails'    && <EmailNotifications />}
          {active === 'types'     && <TypesAndAmenities />}
          {active === 'company'   && <CompanyInfo />}
          {active === 'seo'       && <SeoAeoSettings />}
        </div>
      </div>
    </div>
  )
}
