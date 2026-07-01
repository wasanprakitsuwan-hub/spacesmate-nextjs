'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: 'เลือกแพ็กเกจ' },
  { num: 2, label: 'ข้อมูลทรัพย์สิน' },
  { num: 3, label: 'ที่ตั้ง' },
  { num: 4, label: 'รูปภาพ & ติดต่อ' },
]

const PACKAGES = [
  {
    id: 'basic',
    name: 'Basic',
    price: 299,
    priceLabel: '฿299',
    duration: 30,
    durationLabel: '1 เดือน',
    badge: null as string | null,
    highlight: false,
    note: 'เผยแพร่ทันทีหลังชำระ',
    maxImages: 8,
    allowVideo: false,
    features: ['1 ประกาศ', 'รูปภาพสูงสุด 8 รูป', 'แสดงผล 1 เดือน', 'เผยแพร่ทันทีหลังชำระ', 'ต่ออายุได้ทุกเดือน'],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 699,
    priceLabel: '฿699',
    duration: 90,
    durationLabel: '3 เดือน',
    badge: 'ยอดนิยม' as string | null,
    highlight: false,
    note: 'เผยแพร่ทันทีหลังชำระ',
    maxImages: 12,
    allowVideo: false,
    features: ['1 ประกาศ', 'รูปภาพสูงสุด 12 รูป', 'แสดงผล 3 เดือน', 'เผยแพร่ทันทีหลังชำระ', 'ประหยัดกว่า Basic 22%'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 2499,
    priceLabel: '฿2,499',
    duration: 365,
    durationLabel: '12 เดือน',
    badge: 'คุ้มที่สุด' as string | null,
    highlight: true,
    note: 'เผยแพร่ทันทีหลังชำระ',
    maxImages: 20,
    allowVideo: true,
    features: ['1 ประกาศ', 'รูปภาพสูงสุด 20 รูป', 'อัปโหลดวิดีโอได้', 'แสดงผล 12 เดือน', 'ประหยัดกว่า Basic 30%'],
  },
]

const TYPES = ['คอนโดมิเนียม','อพาร์ทเม้นท์','บ้าน','ออฟฟิศ','โคเวิร์กกิ้ง','ตึกแถว']
const PROVINCES = ['กรุงเทพมหานคร','นนทบุรี','สมุทรปราการ','ปทุมธานี','เชียงใหม่','ภูเก็ต']
const DISTRICTS = ['คลองเตย','วัฒนา','ห้วยขวาง','สาทร','บางรัก','ดินแดง','ลาดพร้าว','จตุจักร','บึงกุ่ม','บางเขน']
const SUBDISTRICTS = ['คลองเตย','พระโขนง','คลองตัน','ช่องนนทรี','สีลม','ลุมพินี','วัฒนา']
const AMENITIES_LIST = ['Wi-Fi','แอร์','ที่จอดรถ','เฟอร์นิเจอร์ครบ','ซักรีด','รักษาความปลอดภัย','สระว่ายน้ำ','ฟิตเนส']

const RENTAL_TERMS = [
  { value: 'daily',     label: 'รายวัน' },
  { value: '1_month',   label: '1 เดือน' },
  { value: '3_months',  label: '3 เดือน' },
  { value: '6_months',  label: '6 เดือน' },
  { value: '12_months', label: '12 เดือน' },
]
const TERM_SUFFIX: Record<string, string> = {
  daily: '/วัน', '1_month': '/เดือน',
  '3_months': '/3 เดือน', '6_months': '/6 เดือน', '12_months': '/12 เดือน',
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const fieldStyle: React.CSSProperties = {
  width: '100%', border: '1px solid #eef0ef', borderRadius: 12,
  padding: '12px 14px', fontSize: 15, outline: 'none',
  fontFamily: 'inherit', background: '#fff', color: '#231f20',
  boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6,
}
const focusOn  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.target.style.borderColor = '#048c73'
  e.target.style.boxShadow   = '0 0 0 3px rgba(4,140,115,0.12)'
}
const focusOff = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.target.style.borderColor = '#eef0ef'
  e.target.style.boxShadow   = 'none'
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  packageId: string
  title: string; type: string; rentalTerm: string
  price: string; size: string; bedrooms: string; bathrooms: string; floor: string
  description: string; amenities: string[]
  address: string; province: string; district: string; subdistrict: string; postcode: string
  contactName: string; contactPhone: string; contactEmail: string
}

const INITIAL: FormData = {
  packageId: 'basic',
  title: '', type: 'คอนโดมิเนียม', rentalTerm: '1_month',
  price: '', size: '', bedrooms: '', bathrooms: '', floor: '',
  description: '', amenities: [],
  address: '', province: 'กรุงเทพมหานคร', district: 'คลองเตย', subdistrict: 'คลองเตย', postcode: '',
  contactName: '', contactPhone: '', contactEmail: '',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SubmitNewPage() {
  const [step, setStep]         = useState(0)
  const [form, setForm]         = useState<FormData>(INITIAL)
  const [loading, setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedPkg, setSubmittedPkg] = useState<string>('free_trial')
  const [error, setError]       = useState<string | null>(null)

  function set<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggleAmenity(a: string) {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter(x => x !== a)
        : [...prev.amenities, a],
    }))
  }

  async function handleSubmit() {
    if (!form.title.trim()) { setError('กรุณาระบุชื่อประกาศ'); return }
    if (!form.contactName.trim() || !form.contactPhone.trim()) {
      setError('กรุณากรอกชื่อและเบอร์โทรติดต่อ'); return
    }
    setError(null)
    setLoading(true)
    try {
      // Save listing + create Stripe Checkout Session
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Server error')
      // Redirect to Stripe Checkout — user pays, then comes back to /submit/success
      if (json.url) window.location.href = json.url
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
      setLoading(false)
    }
    // Note: don't setLoading(false) on success — page is redirecting to Stripe
  }

  const selectedPkg = PACKAGES.find(p => p.id === form.packageId) ?? PACKAGES[0]
  const isPaid = true // all packages are paid

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 460 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: isPaid ? 'linear-gradient(140deg,#d97f11,#b36010)' : 'linear-gradient(140deg,#06a487,#02402e)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <span className="msym" style={{ fontSize: 38, color: '#fff' }}>{isPaid ? 'verified' : 'check_circle'}</span>
          </div>
          <h2 style={{ fontSize: 23, fontWeight: 600, color: '#02402e', margin: '0 0 10px' }}>
            {isPaid ? <>ประกาศเผยแพร่แล้ว! <span className="msym" style={{ fontSize: 22, fontVariationSettings: "'wght' 400, 'FILL' 1", verticalAlign: 'middle', color: '#d97f11' }}>celebration</span></> : 'ประกาศของคุณถูกส่งแล้ว!'}
          </h2>
          <p style={{ color: '#64748b', fontSize: 14.5, fontWeight: 300, lineHeight: 1.65, margin: '0 0 8px' }}>
            {isPaid
              ? `ประกาศของคุณกำลังเผยแพร่บน SpacesMate แล้ว มีระยะเวลา ${PACKAGES.find(p=>p.id===submittedPkg)?.durationLabel} ทีมงานจะติดต่อเพื่อยืนยันการชำระเงิน`
              : 'ทีมงาน SpacesMate จะตรวจสอบและติดต่อกลับภายใน 24 ชั่วโมง'}
          </p>
          {!isPaid && (
            <p style={{ color: '#64748b', fontSize: 14.5, fontWeight: 300, lineHeight: 1.65, margin: '0 0 12px' }}>
              คุณจะได้รับสิทธิ์ทดลองใช้ฟรี 30 วัน
            </p>
          )}
          <div style={{ background: '#f7f9f8', border: '1px solid #eef0ef', borderRadius: 14, padding: '14px 18px', marginBottom: 24, fontSize: 13.5, color: '#475569' }}>
            แพ็กเกจที่เลือก: <strong style={{ color: '#02402e' }}>{PACKAGES.find(p=>p.id===submittedPkg)?.name}</strong>
            {isPaid && <> · <a href="https://line.me/R/ti/p/@spacesmate" target="_blank" rel="noopener noreferrer" style={{ color: '#048c73' }}>ติดต่อทีมงานผ่าน LINE เพื่อชำระเงิน</a></>}
          </div>
          <Link href="/" style={{ background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 15, borderRadius: 24, padding: '13px 28px', textDecoration: 'none', display: 'inline-block' }}>
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* ── Step progress bar ────────────────────────────────────────────── */}
      <div style={{ background: '#f7f9f8', borderBottom: '1px solid #eef0ef', padding: '28px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {STEPS.map((s, i) => {
              const done   = i < step
              const active = i === step
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
                    <span style={{
                      width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: 600, fontSize: 14, transition: 'all .3s',
                      background: done ? '#048c73' : active ? '#d97f11' : '#e2e8e6',
                      color: done || active ? '#fff' : '#94a3b8',
                    }}>
                      {done ? <span className="msym" style={{ fontSize: 18 }}>check</span> : s.num}
                    </span>
                    <span style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap', color: active ? '#02402e' : done ? '#048c73' : '#94a3b8' }}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, margin: '0 12px', transition: 'all .3s', background: done ? '#048c73' : '#e2e8e6' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '34px 24px 64px' }}>
        <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 20, padding: 32, boxShadow: '0 6px 20px -12px rgba(2,64,46,0.08)' }}>

          {/* ── STEP 0: Package selection ──────────────────────────────── */}
          {step === 0 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 6px', color: '#02402e' }}>เลือกแพ็กเกจ</h2>
              <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px' }}>เลือกแพ็กเกจที่เหมาะกับคุณ — ทดลองฟรีก่อนได้เลย ไม่ต้องชำระเงินทันที</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }} className="sm-pkg-grid">
                {PACKAGES.map(pkg => {
                  const selected = form.packageId === pkg.id
                  return (
                    <button key={pkg.id} type="button" onClick={() => set('packageId', pkg.id)}
                      style={{
                        textAlign: 'left', cursor: 'pointer', padding: 18, borderRadius: 16, transition: 'all .2s',
                        border: `2px solid ${selected ? '#048c73' : pkg.highlight ? '#d97f11' : '#eef0ef'}`,
                        background: selected ? '#eaf6f1' : pkg.highlight ? '#fef9f0' : '#fff',
                        position: 'relative',
                      }}>
                      {pkg.badge && (
                        <span style={{ position: 'absolute', top: 12, right: 12, background: '#d97f11', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>{pkg.badge}</span>
                      )}
                      {selected && (
                        <span style={{ position: 'absolute', top: 12, right: 12, background: '#048c73', color: '#fff', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>check</span></span>
                      )}
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#02402e', marginBottom: 4 }}>{pkg.name}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#d97f11', marginBottom: 2 }}>
                        {pkg.priceLabel}{pkg.price > 0 && <span style={{ fontSize: 13, fontWeight: 400, color: '#94a3b8' }}>/ครั้ง</span>}
                      </div>
                      <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 10 }}>ระยะเวลา {pkg.durationLabel}</div>
                      <div style={{ fontSize: 12, color: pkg.id === 'free_trial' ? '#a16207' : '#15803d', fontWeight: 600, marginBottom: 10, padding: '4px 8px', borderRadius: 6, background: pkg.id === 'free_trial' ? '#fef9c3' : '#dcfce7', display: 'inline-block' }}>
                        {pkg.note}
                      </div>
                      <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 12.5, color: '#475569', lineHeight: 1.8 }}>
                        {pkg.features.map(f => <li key={f}>{f}</li>)}
                      </ul>
                    </button>
                  )
                })}
              </div>
              <div style={{ marginTop: 18, padding: '14px 16px', background: '#f7f9f8', borderRadius: 12, fontSize: 13, color: '#64748b' }}>
                <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 5, verticalAlign: 'middle' }}>tips_and_updates</span>1 แพ็กเกจ = 1 ประกาศ · ต้องการลงหลายประกาศ? ซื้อหลายแพ็กเกจได้เลย · ทีมงานจะติดต่อยืนยันการชำระเงินหลังกด "เผยแพร่"
              </div>
            </div>
          )}

          {/* ── STEP 1: Property Info ───────────────────────────────────── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 22px', color: '#02402e' }}>ข้อมูลทรัพย์สิน</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div>
                  <label style={labelStyle}>ชื่อประกาศ *</label>
                  <input style={fieldStyle} value={form.title}
                    onChange={e => set('title', e.target.value)}
                    placeholder="เช่น คอนโด เมโทร ลักซ์ พระราม 4 ห้องสตูดิโอ"
                    onFocus={focusOn} onBlur={focusOff} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="sm-form2">
                  <div>
                    <label style={labelStyle}>ประเภท</label>
                    <select style={{ ...fieldStyle, cursor: 'pointer' }} value={form.type}
                      onChange={e => set('type', e.target.value)} onFocus={focusOn} onBlur={focusOff}>
                      {TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>ช่วงเช่า / ประเภทราคา</label>
                    <select style={{ ...fieldStyle, cursor: 'pointer' }} value={form.rentalTerm}
                      onChange={e => set('rentalTerm', e.target.value)} onFocus={focusOn} onBlur={focusOff}>
                      {RENTAL_TERMS.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>ราคาเช่า (บาท{TERM_SUFFIX[form.rentalTerm] ?? ''})</label>
                  <input type="number" style={fieldStyle} value={form.price}
                    onChange={e => set('price', e.target.value)}
                    placeholder={form.rentalTerm === 'daily' ? 'เช่น 900' : form.rentalTerm === 'yearly' ? 'เช่น 120000' : 'เช่น 15000'}
                    onFocus={focusOn} onBlur={focusOff} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }} className="sm-form4">
                  {[
                    { label: 'ขนาด ตร.ม.', ph: '28', field: 'size'     as const },
                    { label: 'ห้องนอน',    ph: '1',  field: 'bedrooms' as const },
                    { label: 'ห้องน้ำ',    ph: '1',  field: 'bathrooms'as const },
                    { label: 'ชั้น',        ph: '7',  field: 'floor'    as const },
                  ].map(f => (
                    <div key={f.field}>
                      <label style={labelStyle}>{f.label}</label>
                      <input type="number" placeholder={f.ph} style={fieldStyle}
                        value={form[f.field] as string}
                        onChange={e => set(f.field, e.target.value)}
                        onFocus={focusOn} onBlur={focusOff} />
                    </div>
                  ))}
                </div>

                <div>
                  <label style={labelStyle}>รายละเอียด</label>
                  <textarea rows={4} placeholder="อธิบายจุดเด่นของทรัพย์สิน สิ่งอำนวยความสะดวก และทำเล..." value={form.description}
                    onChange={e => set('description', e.target.value)}
                    style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.6 }}
                    onFocus={focusOn} onBlur={focusOff} />
                </div>

                <div>
                  <label style={{ ...labelStyle, marginBottom: 12 }}>สิ่งอำนวยความสะดวก</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                    {AMENITIES_LIST.map(a => {
                      const on = form.amenities.includes(a)
                      return (
                        <button key={a} type="button" onClick={() => toggleAmenity(a)}
                          style={{ padding: '8px 15px', borderRadius: 20, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', transition: 'all .2s', border: `1px solid ${on ? '#048c73' : '#eef0ef'}`, background: on ? '#eaf6f1' : '#fff', color: on ? '#02402e' : '#475569' }}>
                          {a}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Selected package reminder */}
                <div style={{ padding: '12px 16px', background: selectedPkg.highlight ? '#fef9f0' : '#f7f9f8', border: `1px solid ${selectedPkg.highlight ? '#fed7aa' : '#eef0ef'}`, borderRadius: 12, fontSize: 13, color: '#475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>แพ็กเกจที่เลือก: <strong style={{ color: '#02402e' }}>{selectedPkg.name}</strong> · {selectedPkg.durationLabel}</span>
                  <button type="button" onClick={() => setStep(0)} style={{ fontSize: 12, color: '#048c73', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>เปลี่ยน</button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Location ────────────────────────────────────────── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 22px', color: '#02402e' }}>ที่ตั้ง</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div>
                  <label style={labelStyle}>ที่อยู่</label>
                  <input style={fieldStyle} value={form.address}
                    onChange={e => set('address', e.target.value)}
                    placeholder="บ้านเลขที่ / อาคาร / ถนน / ซอย"
                    onFocus={focusOn} onBlur={focusOff} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }} className="sm-form2">
                  <div>
                    <label style={labelStyle}>จังหวัด</label>
                    <select style={{ ...fieldStyle, cursor: 'pointer' }} value={form.province}
                      onChange={e => set('province', e.target.value)} onFocus={focusOn} onBlur={focusOff}>
                      {PROVINCES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>เขต / อำเภอ</label>
                    <select style={{ ...fieldStyle, cursor: 'pointer' }} value={form.district}
                      onChange={e => set('district', e.target.value)} onFocus={focusOn} onBlur={focusOff}>
                      {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>แขวง / ตำบล</label>
                    <select style={{ ...fieldStyle, cursor: 'pointer' }} value={form.subdistrict}
                      onChange={e => set('subdistrict', e.target.value)} onFocus={focusOn} onBlur={focusOff}>
                      {SUBDISTRICTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>รหัสไปรษณีย์</label>
                    <input placeholder="10110" style={fieldStyle} maxLength={5}
                      value={form.postcode}
                      onChange={e => set('postcode', e.target.value)}
                      onFocus={focusOn} onBlur={focusOff} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>ตำแหน่งบนแผนที่</label>
                  <div style={{ height: 160, border: '2px dashed #048c73', borderRadius: 14, background: 'repeating-linear-gradient(45deg,#ecf5f2,#ecf5f2 12px,#e2f0eb 12px,#e2f0eb 24px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span className="msym" style={{ fontSize: 38, color: '#048c73', opacity: .6 }}>pin_drop</span>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#048c73', margin: 0 }}>ปักหมุดตำแหน่งที่พัก</p>
                    <p style={{ fontSize: 12.5, color: '#94a3b8', margin: 0 }}>จะเพิ่มฟีเจอร์แผนที่ในเวอร์ชันถัดไป</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Photos + Contact ─────────────────────────────────── */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 22px', color: '#02402e' }}>รูปภาพ & ข้อมูลติดต่อ</h2>

              {/* Photo upload */}
              <div style={{ border: '2px dashed #048c73', borderRadius: 16, padding: '36px 24px', textAlign: 'center', cursor: 'pointer', background: '#f7f9f8', marginBottom: 24 }}
                onClick={() => document.getElementById('img-input')?.click()}>
                <span className="msym" style={{ fontSize: 44, color: '#048c73', opacity: .5 }}>photo_library</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#02402e', margin: '12px 0 6px' }}>ลากรูปภาพมาวางที่นี่</p>
                <p style={{ fontSize: 13.5, color: '#94a3b8', margin: 0 }}>หรือคลิกเพื่อเลือกไฟล์ · JPG, PNG · สูงสุด 10 รูป</p>
                <input id="img-input" type="file" multiple accept="image/*" style={{ display: 'none' }} />
              </div>

              {/* Contact fields */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 20px' }}>
                <div style={{ flex: 1, height: 1, background: '#eef0ef' }} />
                <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>ข้อมูลผู้ติดต่อ</span>
                <div style={{ flex: 1, height: 1, background: '#eef0ef' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>ชื่อเจ้าของ / ผู้ติดต่อ *</label>
                  <input style={fieldStyle} value={form.contactName}
                    onChange={e => set('contactName', e.target.value)}
                    placeholder="ชื่อ-นามสกุล"
                    onFocus={focusOn} onBlur={focusOff} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="sm-form2">
                  <div>
                    <label style={labelStyle}>เบอร์โทรศัพท์ *</label>
                    <input type="tel" style={fieldStyle} value={form.contactPhone}
                      onChange={e => set('contactPhone', e.target.value)}
                      placeholder="0XX-XXX-XXXX"
                      onFocus={focusOn} onBlur={focusOff} />
                  </div>
                  <div>
                    <label style={labelStyle}>อีเมล (ถ้ามี)</label>
                    <input type="email" style={fieldStyle} value={form.contactEmail}
                      onChange={e => set('contactEmail', e.target.value)}
                      placeholder="email@example.com"
                      onFocus={focusOn} onBlur={focusOff} />
                  </div>
                </div>
              </div>

              {/* Package summary */}
              <div style={{ marginTop: 22, background: selectedPkg.id === 'free_trial' ? 'linear-gradient(135deg,#fef9f0,#fef3e2)' : 'linear-gradient(135deg,#eaf6f1,#d1fae5)', border: `1px solid ${selectedPkg.id === 'free_trial' ? 'rgba(217,127,17,0.2)' : 'rgba(4,140,115,0.2)'}`, borderRadius: 16, padding: '18px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <p style={{ color: selectedPkg.id === 'free_trial' ? '#d97f11' : '#048c73', fontWeight: 700, fontSize: 15, margin: '0 0 2px' }}>
                      {selectedPkg.id === 'free_trial'
                        ? <><span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 5 }}>celebration</span>ทดลองฟรี 30 วัน</>
                        : <><span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 5 }}>check_circle</span>แพ็กเกจ {selectedPkg.name} — {selectedPkg.durationLabel}</>}
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: 12.5, margin: 0 }}>
                      {selectedPkg.id === 'free_trial' ? 'ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง · ไม่ต้องใช้บัตรเครดิต' : `หลังกด "เผยแพร่" ทีมงานจะติดต่อยืนยันการชำระเงิน ${selectedPkg.priceLabel}`}
                    </p>
                  </div>
                  <button type="button" onClick={() => setStep(0)} style={{ fontSize: 12, color: '#048c73', fontWeight: 600, background: 'none', border: '1px solid #048c73', padding: '5px 12px', borderRadius: 8, cursor: 'pointer' }}>เปลี่ยนแพ็กเกจ</button>
                </div>
              </div>

              {error && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: '#fff0f0', border: '1px solid #fca5a5', borderRadius: 10, fontSize: 14, color: '#dc2626' }}>
                  <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 5 }}>warning</span>{error}
                </div>
              )}
            </div>
          )}

          {/* ── Navigation buttons ──────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 12, marginTop: 26, justifyContent: step > 0 ? 'space-between' : 'flex-end' }}>
            {step > 0 && (
              <button type="button" onClick={() => setStep(s => s - 1)} disabled={loading}
                style={{ background: 'transparent', color: '#02402e', fontWeight: 600, fontSize: 14.5, border: '1.5px solid #02402e', borderRadius: 24, padding: '12px 26px', cursor: 'pointer', transition: 'all .2s', opacity: loading ? .5 : 1 }}>
                <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 300, 'FILL' 0", marginRight: 5 }}>arrow_back</span>ย้อนกลับ
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={() => setStep(s => s + 1)}
                style={{ background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 24, padding: '13px 30px', cursor: 'pointer' }}>
                ถัดไป<span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 300, 'FILL' 0", marginLeft: 5 }}>arrow_forward</span>
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading}
                style={{ background: loading ? '#94a3b8' : '#02402e', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 24, padding: '13px 30px', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                {loading ? (
                  <><span className="msym" style={{ fontSize: 18, animation: 'spin 1s linear infinite' }}>autorenew</span>กำลังโหลด Stripe...</>
                ) : (
                  <><span className="msym" style={{ fontSize: 18 }}>payment</span>ชำระเงินและเผยแพร่</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .sm-form2 { grid-template-columns: 1fr !important; }
          .sm-form4 { grid-template-columns: 1fr 1fr !important; }
          .sm-pkg-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
