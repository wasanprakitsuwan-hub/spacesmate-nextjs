'use client'

import { useState, useRef, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { searchCondoRegistry, type CondoEntry } from '@/lib/condo-registry'
import { trackEvent } from '@/lib/analytics'

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: 'ข้อมูลทรัพย์สิน' },
  { num: 2, label: 'ที่ตั้ง' },
  { num: 3, label: 'รูปภาพ & ติดต่อ' },
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
    maxImages: 5,
    allowVideo: false,
    features: ['1 ประกาศ', 'รูปภาพสูงสุด 5 รูป', 'แสดงผล 1 เดือน', 'เผยแพร่ทันทีหลังชำระ', 'ต่ออายุได้ทุกเดือน'],
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
    maxImages: 10,
    allowVideo: false,
    features: ['1 ประกาศ', 'รูปภาพสูงสุด 10 รูป', 'แสดงผล 3 เดือน', 'เผยแพร่ทันทีหลังชำระ', 'ประหยัดกว่า Basic 22%'],
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
  images: string[]   // uploaded image URLs
}

const INITIAL: FormData = {
  packageId: 'basic',
  title: '', type: 'คอนโดมิเนียม', rentalTerm: '1_month',
  price: '', size: '', bedrooms: '', bathrooms: '', floor: '',
  description: '', amenities: [],
  address: '', province: 'กรุงเทพมหานคร', district: 'คลองเตย', subdistrict: 'คลองเตย', postcode: '',
  contactName: '', contactPhone: '', contactEmail: '',
  images: [],
}

// ─── Inner Form (reads URL search params) ─────────────────────────────────────

function SubmitNewForm() {
  const searchParams  = useSearchParams()
  const urlPkg        = searchParams.get('package') || 'basic'
  const initialPkg    = PACKAGES.find(p => p.id === urlPkg) ? urlPkg : 'basic'

  const [step, setStep]           = useState(0)
  const [form, setForm]           = useState<FormData>({ ...INITIAL, packageId: initialPkg })
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedPkg, setSubmittedPkg] = useState<string>(initialPkg)
  const [error, setError]         = useState<string | null>(null)
  const [consent, setConsent]     = useState(false)

  // ── Promo code state ──────────────────────────────────────────────────────
  const [promoInput,  setPromoInput]  = useState('')
  const [promoStatus, setPromoStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [promoData,   setPromoData]   = useState<{
    promotionCodeId: string
    discountTHB?:    number
    percentOff?:     number
  } | null>(null)
  const [promoError,  setPromoError]  = useState('')

  // ── Image upload state ────────────────────────────────────────────────────
  const [uploadingCount, setUploadingCount] = useState(0)
  const [uploadError, setUploadError]       = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Condo autocomplete state ──────────────────────────────────────────────
  const [condoSuggestions, setCondoSuggestions] = useState<CondoEntry[]>([])
  const [showSuggestions, setShowSuggestions]   = useState(false)
  const suggestionBlurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // ── Image upload handler ──────────────────────────────────────────────────
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploadError(null)

    const pkg = PACKAGES.find(p => p.id === form.packageId) ?? PACKAGES[0]
    const remaining = pkg.maxImages - form.images.length
    if (remaining <= 0) {
      setUploadError(`แพ็กเกจ ${pkg.name} อัปโหลดรูปได้สูงสุด ${pkg.maxImages} รูปแล้ว`)
      return
    }

    const toUpload = Array.from(files).slice(0, remaining)
    setUploadingCount(c => c + toUpload.length)

    const results = await Promise.all(
      toUpload.map(async (file, idx) => {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('packageId', form.packageId)
        fd.append('currentCount', String(form.images.length + idx))
        const res = await fetch('/api/public-upload', { method: 'POST', body: fd })
        const j   = await res.json()
        if (!res.ok) throw new Error(j.error || 'Upload failed')
        return j.url as string
      })
    ).catch(err => {
      setUploadError(err instanceof Error ? err.message : 'อัปโหลดไม่สำเร็จ กรุณาลองใหม่')
      return [] as string[]
    })

    setUploadingCount(c => c - toUpload.length)
    if (results.length > 0) {
      setForm(prev => ({ ...prev, images: [...prev.images, ...results] }))
    }
    // Reset file input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [form.packageId, form.images])

  function removeImage(url: string) {
    setForm(prev => ({ ...prev, images: prev.images.filter(u => u !== url) }))
  }

  async function applyPromo() {
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    setPromoStatus('checking')
    setPromoError('')
    setPromoData(null)
    try {
      const res  = await fetch('/api/stripe/validate-promo', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code }),
      })
      const json = await res.json()
      if (json.valid) {
        setPromoStatus('valid')
        setPromoData({ promotionCodeId: json.promotionCodeId, discountTHB: json.discountTHB, percentOff: json.percentOff })
      } else {
        setPromoStatus('invalid')
        setPromoError(json.error || 'โค้ดไม่ถูกต้อง')
      }
    } catch {
      setPromoStatus('invalid')
      setPromoError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
  }

  // ── Condo autocomplete handlers ───────────────────────────────────────────
  function onTitleChange(val: string) {
    set('title', val)
    if (form.type === 'คอนโดมิเนียม') {
      const suggestions = searchCondoRegistry(val, 7)
      setCondoSuggestions(suggestions)
      setShowSuggestions(suggestions.length > 0)
    }
  }

  function selectCondo(entry: CondoEntry) {
    set('title', entry.name)
    setCondoSuggestions([])
    setShowSuggestions(false)
  }

  function onTitleBlur() {
    suggestionBlurTimer.current = setTimeout(() => setShowSuggestions(false), 180)
  }

  function onTitleFocus(e: React.FocusEvent<HTMLInputElement>) {
    focusOn(e)
    if (suggestionBlurTimer.current) clearTimeout(suggestionBlurTimer.current)
    if (form.type === 'คอนโดมิเนียม' && condoSuggestions.length > 0) {
      setShowSuggestions(true)
    }
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
        body: JSON.stringify({
          ...form,
          promotionCodeId: promoData?.promotionCodeId ?? '',
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Server error')
      // Redirect to Stripe Checkout — user pays, then comes back to /submit/success
      if (json.url) {
        trackEvent('listing_checkout', { package_id: form.packageId, property_type: form.type })
        window.location.href = json.url
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
      setLoading(false)
    }
    // Note: don't setLoading(false) on success — page is redirecting to Stripe
  }

  const selectedPkg  = PACKAGES.find(p => p.id === form.packageId) ?? PACKAGES[0]

  // Compute final price after promo discount
  const discountTHB = promoData
    ? (promoData.discountTHB ?? Math.round(selectedPkg.price * (promoData.percentOff ?? 0) / 100))
    : 0
  const finalPrice = Math.max(0, selectedPkg.price - discountTHB)

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 460 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(140deg,#d97f11,#b36010)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <span className="msym" style={{ fontSize: 38, color: '#fff' }}>verified</span>
          </div>
          <h2 style={{ fontSize: 23, fontWeight: 600, color: '#02402e', margin: '0 0 10px' }}>
            ประกาศเผยแพร่แล้ว! <span className="msym" style={{ fontSize: 22, fontVariationSettings: "'wght' 400, 'FILL' 1", verticalAlign: 'middle', color: '#d97f11' }}>celebration</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: 14.5, fontWeight: 300, lineHeight: 1.65, margin: '0 0 8px' }}>
            ประกาศของคุณกำลังเผยแพร่บน SpacesMate แล้ว มีระยะเวลา {PACKAGES.find(p=>p.id===submittedPkg)?.durationLabel} ทีมงานจะติดต่อเพื่อยืนยันการชำระเงิน
          </p>
          <div style={{ background: '#f7f9f8', border: '1px solid #eef0ef', borderRadius: 14, padding: '14px 18px', marginBottom: 24, fontSize: 13.5, color: '#475569' }}>
            แพ็กเกจที่เลือก: <strong style={{ color: '#02402e' }}>{PACKAGES.find(p=>p.id===submittedPkg)?.name}</strong>
            {' · '}<a href="https://line.me/R/ti/p/@spacesmate" target="_blank" rel="noopener noreferrer" style={{ color: '#048c73' }}>ติดต่อทีมงานผ่าน LINE เพื่อชำระเงิน</a>
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

          {/* ── Package banner — always visible, read-only ───────────────── */}
          <div style={{ marginBottom: 24, padding: '11px 16px', background: selectedPkg.highlight ? '#fef9f0' : '#f0faf6', border: `1px solid ${selectedPkg.highlight ? '#fde68a' : '#a7f3d0'}`, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13.5, color: '#475569', display: 'flex', alignItems: 'center', gap: 7 }}>
              <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1", color: '#048c73' }}>check_circle</span>
              แพ็กเกจ: <strong style={{ color: '#02402e' }}>{selectedPkg.name}</strong>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <span>{selectedPkg.durationLabel}</span>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <span style={{ color: '#d97f11', fontWeight: 600 }}>{selectedPkg.priceLabel}</span>
            </span>
            <Link href="/submit" style={{ fontSize: 12, color: '#048c73', fontWeight: 600, textDecoration: 'none', padding: '4px 10px', border: '1px solid #a7f3d0', borderRadius: 8, whiteSpace: 'nowrap' }}>
              เปลี่ยนแพ็กเกจ
            </Link>
          </div>

          {/* ── STEP 0: Property Info ───────────────────────────────────── */}
          {step === 0 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 22px', color: '#02402e' }}>ข้อมูลทรัพย์สิน</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div style={{ position: 'relative' }}>
                  <label style={labelStyle}>
                    ชื่อประกาศ *
                    {form.type === 'คอนโดมิเนียม' && (
                      <span style={{ fontWeight: 400, color: '#94a3b8', marginLeft: 6 }}>— พิมพ์ชื่อคอนโดเพื่อดูคำแนะนำ</span>
                    )}
                  </label>
                  <input
                    style={fieldStyle}
                    value={form.title}
                    onChange={e => onTitleChange(e.target.value)}
                    placeholder={form.type === 'คอนโดมิเนียม' ? 'เช่น Lumpini 24, IDEO Q Sukhumvit 36' : 'เช่น อพาร์ทเม้นท์ศรีนครินทร์ ห้องสตูดิโอ'}
                    onFocus={onTitleFocus}
                    onBlur={e => { focusOff(e); onTitleBlur() }}
                  />
                  {showSuggestions && condoSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                      background: '#fff', border: '1px solid #eef0ef', borderRadius: 12,
                      boxShadow: '0 8px 24px -8px rgba(2,64,46,0.18)', marginTop: 4, overflow: 'hidden',
                    }}>
                      {condoSuggestions.map(entry => (
                        <button
                          key={entry.name}
                          type="button"
                          onMouseDown={() => selectCondo(entry)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            width: '100%', padding: '11px 14px', background: 'none', border: 'none',
                            textAlign: 'left', cursor: 'pointer', fontSize: 14, color: '#231f20',
                            borderBottom: '1px solid #f4f6f5', transition: 'background .15s',
                          }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f0faf6'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
                        >
                          <span className="msym" style={{ fontSize: 16, color: '#048c73', flexShrink: 0 }}>apartment</span>
                          <span>{entry.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
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
              </div>
            </div>
          )}

          {/* ── STEP 1: Location ────────────────────────────────────────── */}
          {step === 1 && (
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

          {/* ── STEP 2: Photos + Contact ─────────────────────────────────── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 22px', color: '#02402e' }}>รูปภาพ & ข้อมูลติดต่อ</h2>

              {/* Photo upload */}
              <div style={{ marginBottom: 20 }}>
                {/* Drop zone — only show when below limit */}
                {form.images.length < selectedPkg.maxImages && (
                  <div
                    style={{
                      border: `2px dashed ${uploadingCount > 0 ? '#d97f11' : '#048c73'}`,
                      borderRadius: 16, padding: '28px 24px', textAlign: 'center',
                      cursor: uploadingCount > 0 ? 'wait' : 'pointer',
                      background: uploadingCount > 0 ? '#fffbf0' : '#f7f9f8', marginBottom: 12,
                    }}
                    onClick={() => { if (uploadingCount === 0) fileInputRef.current?.click() }}
                    onDragOver={e => { e.preventDefault() }}
                    onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
                  >
                    {uploadingCount > 0 ? (
                      <>
                        <span className="msym" style={{ fontSize: 40, color: '#d97f11', animation: 'spin 1s linear infinite', display: 'block' }}>autorenew</span>
                        <p style={{ fontSize: 14.5, fontWeight: 600, color: '#d97f11', margin: '10px 0 4px' }}>
                          กำลังอัปโหลด {uploadingCount} รูป...
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="msym" style={{ fontSize: 44, color: '#048c73', opacity: .5 }}>photo_library</span>
                        <p style={{ fontSize: 15, fontWeight: 600, color: '#02402e', margin: '10px 0 5px' }}>คลิกหรือลากรูปภาพมาวางที่นี่</p>
                        <p style={{ fontSize: 13.5, color: '#94a3b8', margin: 0 }}>
                          JPG, PNG, WebP · สูงสุด 30 MB / รูป · เหลือ {selectedPkg.maxImages - form.images.length} รูป (แพ็กเกจ {selectedPkg.name}: {selectedPkg.maxImages} รูป)
                        </p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => handleFiles(e.target.files)}
                    />
                  </div>
                )}

                {/* Image limit reached notice */}
                {form.images.length >= selectedPkg.maxImages && (
                  <div style={{ padding: '12px 16px', background: '#f0faf6', border: '1px solid #a7f3d0', borderRadius: 12, fontSize: 13.5, color: '#02402e', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1", color: '#048c73' }}>check_circle</span>
                    อัปโหลดครบ {selectedPkg.maxImages} รูปแล้ว · <a href="/submit" style={{ color: '#048c73', fontWeight: 600 }}>อัปเกรดแพ็กเกจ</a>เพื่อเพิ่มรูป
                  </div>
                )}

                {/* Upload error */}
                {uploadError && (
                  <div style={{ padding: '10px 14px', background: '#fff0f0', border: '1px solid #fca5a5', borderRadius: 10, fontSize: 13.5, color: '#dc2626', marginBottom: 10 }}>
                    <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 5 }}>warning</span>
                    {uploadError}
                  </div>
                )}

                {/* Preview grid */}
                {form.images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: 10 }}>
                    {form.images.map((url, idx) => (
                      <div key={url} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '1', border: '1px solid #eef0ef' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`รูป ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {idx === 0 && (
                          <span style={{ position: 'absolute', top: 5, left: 5, background: '#02402e', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5 }}>หลัก</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: 0 }}
                        >
                          <span className="msym" style={{ fontSize: 14 }}>close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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

              {/* ── Promo code ─────────────────────────────────────────────── */}
              <div style={{ marginTop: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>โค้ดส่วนลด (ถ้ามี)</label>
                  {promoStatus !== 'valid' && (
                    <button
                      type="button"
                      onClick={() => { setPromoInput('SM299'); setPromoStatus('idle'); setPromoData(null); setPromoError('') }}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 700, color: '#92400e', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '3px 10px', cursor: 'pointer', letterSpacing: .5, lineHeight: 1.4 }}
                    >
                      <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>sell</span>
                      SM299 — ลด ฿299
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={promoInput}
                    onChange={e => {
                      setPromoInput(e.target.value.toUpperCase())
                      if (promoStatus !== 'idle') { setPromoStatus('idle'); setPromoData(null); setPromoError('') }
                    }}
                    onKeyDown={e => e.key === 'Enter' && applyPromo()}
                    placeholder="เช่น FREEMONTH"
                    disabled={promoStatus === 'valid'}
                    style={{ ...fieldStyle, flex: 1, letterSpacing: 1.5, fontWeight: 600,
                      borderColor: promoStatus === 'valid' ? '#048c73' : promoStatus === 'invalid' ? '#dc2626' : '#eef0ef',
                      background: promoStatus === 'valid' ? '#f0fdf4' : '#fff',
                    }}
                    onFocus={focusOn} onBlur={focusOff}
                  />
                  {promoStatus === 'valid' ? (
                    <button type="button"
                      onClick={() => { setPromoStatus('idle'); setPromoInput(''); setPromoData(null); setPromoError('') }}
                      style={{ padding: '10px 16px', borderRadius: 12, border: '1px solid #eef0ef', background: '#f8fafc', color: '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      ลบ
                    </button>
                  ) : (
                    <button type="button" onClick={applyPromo} disabled={promoStatus === 'checking' || !promoInput.trim()}
                      style={{ padding: '10px 18px', borderRadius: 12, border: 'none', background: promoInput.trim() ? '#02402e' : '#e2e8f0', color: promoInput.trim() ? '#fff' : '#94a3b8', fontWeight: 600, fontSize: 13, cursor: promoInput.trim() ? 'pointer' : 'default', whiteSpace: 'nowrap', transition: 'all .15s' }}>
                      {promoStatus === 'checking' ? (
                        <span className="msym" style={{ fontSize: 16, animation: 'spin 1s linear infinite' }}>autorenew</span>
                      ) : 'ใช้โค้ด'}
                    </button>
                  )}
                </div>
                {promoStatus === 'valid' && promoData && (
                  <p style={{ marginTop: 6, fontSize: 13, color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>check_circle</span>
                    ส่วนลด ฿{discountTHB.toLocaleString()} — ราคาที่ต้องชำระ ฿{finalPrice.toLocaleString()}
                  </p>
                )}
                {promoStatus === 'invalid' && promoError && (
                  <p style={{ marginTop: 6, fontSize: 13, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>error</span>
                    {promoError}
                  </p>
                )}
              </div>

              {/* Package summary */}
              <div style={{ marginTop: 16, background: 'linear-gradient(135deg,#eaf6f1,#d1fae5)', border: '1px solid rgba(4,140,115,0.2)', borderRadius: 16, padding: '18px 22px' }}>
                <p style={{ color: '#048c73', fontWeight: 700, fontSize: 15, margin: '0 0 2px' }}>
                  <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 5 }}>check_circle</span>
                  แพ็กเกจ {selectedPkg.name} — {selectedPkg.durationLabel}
                </p>
                <p style={{ color: '#94a3b8', fontSize: 12.5, margin: 0 }}>
                  {promoStatus === 'valid' ? (
                    <>
                      ราคาปกติ <span style={{ textDecoration: 'line-through' }}>฿{selectedPkg.price.toLocaleString()}</span>
                      {' '}→{' '}
                      <strong style={{ color: '#048c73' }}>฿{finalPrice.toLocaleString()}</strong> — เผยแพร่ทันทีหลังชำระ
                    </>
                  ) : (
                    <>หลังกด &ldquo;ชำระเงิน&rdquo; ระบบจะพาไปยัง Stripe เพื่อชำระ {selectedPkg.priceLabel} — เผยแพร่ทันที</>
                  )}
                </p>
              </div>

              {error && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: '#fff0f0', border: '1px solid #fca5a5', borderRadius: 10, fontSize: 14, color: '#dc2626' }}>
                  <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 5 }}>warning</span>{error}
                </div>
              )}
            </div>
          )}

          {/* ── Consent tick (last step only) ───────────────────────────── */}
          {step === STEPS.length - 1 && (
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 20, cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                style={{ marginTop: 3, width: 16, height: 16, accentColor: '#02402e', flexShrink: 0, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                ฉันยืนยันว่าฉันเป็นเจ้าของหรือมีสิทธิ์ในการลงประกาศทรัพย์สินนี้
                และยอมรับ{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#048c73', fontWeight: 600, textDecoration: 'underline' }}>ข้อกำหนดการใช้งาน</a>
                {' '}และ{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#048c73', fontWeight: 600, textDecoration: 'underline' }}>นโยบายความเป็นส่วนตัว</a>
                {' '}ของ SpacesMate
              </span>
            </label>
          )}

          {/* ── Navigation buttons ──────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 12, marginTop: 26, justifyContent: 'space-between' }}>
            {/* Back: step 0 → /submit (change package), step > 0 → previous step */}
            {step === 0 ? (
              <Link href="/submit"
                style={{ background: 'transparent', color: '#02402e', fontWeight: 600, fontSize: 14.5, border: '1.5px solid #02402e', borderRadius: 24, padding: '12px 26px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 300, 'FILL' 0", marginRight: 5 }}>arrow_back</span>เปลี่ยนแพ็กเกจ
              </Link>
            ) : (
              <button type="button" onClick={() => setStep(s => s - 1)} disabled={loading}
                style={{ background: 'transparent', color: '#02402e', fontWeight: 600, fontSize: 14.5, border: '1.5px solid #02402e', borderRadius: 24, padding: '12px 26px', cursor: 'pointer', transition: 'all .2s', opacity: loading ? .5 : 1 }}>
                <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 300, 'FILL' 0", marginRight: 5 }}>arrow_back</span>ย้อนกลับ
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button type="button" onClick={() => {
                const next = step + 1
                trackEvent(`listing_step_${next + 1}`, { from_step: step + 1, package_id: form.packageId })
                setStep(next)
              }}
                style={{ background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 24, padding: '13px 30px', cursor: 'pointer' }}>
                ถัดไป<span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 300, 'FILL' 0", marginLeft: 5 }}>arrow_forward</span>
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading || !consent}
                title={!consent ? 'กรุณายืนยันเงื่อนไขก่อนชำระเงิน' : undefined}
                style={{ background: (loading || !consent) ? '#94a3b8' : '#02402e', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 24, padding: '13px 30px', cursor: (loading || !consent) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'background .2s' }}>
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
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

// ─── Page export (Suspense required for useSearchParams in App Router) ─────────

export default function SubmitNewPage() {
  return (
    <Suspense>
      <SubmitNewForm />
    </Suspense>
  )
}
