'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { trackEvent } from '@/lib/analytics'
import { createBrowserClient } from '@/lib/supabase'
import {
  FormState, BLANK, prepareSubmitData, ListingFormFields,
} from '@/components/listing/SharedListingForm'

// ── Packages ────────────────────────────────────────────────────────────────
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
    maxImages: 10,
    allowVideo: false,
    features: ['1 ประกาศ', 'รูปภาพสูงสุด 10 รูป', 'แสดงผล 1 เดือน', 'เผยแพร่ทันทีหลังชำระ', 'ต่ออายุได้ทุกเดือน'],
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
    maxImages: 10,
    allowVideo: false,
    features: ['1 ประกาศ', 'รูปภาพสูงสุด 10 รูป', 'แสดงผล 12 เดือน', 'เผยแพร่ทันทีหลังชำระ', 'ประหยัดกว่า Basic 30%'],
  },
]

// ── Styles ────────────────────────────────────────────────────────────────────
const SINP: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: '1px solid #e2e8f0', fontSize: 14, outline: 'none',
  fontFamily: 'inherit', background: '#fff', color: '#231f20',
  boxSizing: 'border-box',
}

// ── Inner Form ────────────────────────────────────────────────────────────────
function SubmitNewForm() {
  const searchParams = useSearchParams()
  const urlPkg       = searchParams.get('package') || 'basic'
  const initialPkg   = PACKAGES.find(p => p.id === urlPkg) ? urlPkg : 'basic'

  const [step, setStep] = useState(0) // 0=package, 1=listing, 2=contact+pay
  const [form, setForm] = useState<FormState>({ ...BLANK, package_type: initialPkg })

  // Contact info (separate from listing FormState)
  const [contactName,  setContactName]  = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')

  // Promo code state
  const [promoInput,  setPromoInput]  = useState('')
  const [promoStatus, setPromoStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [promoData,   setPromoData]   = useState<{
    promotionCodeId: string; discountTHB?: number; percentOff?: number
  } | null>(null)
  const [promoError, setPromoError] = useState('')

  // UI state
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [consent,  setConsent]  = useState(false)

  // ── Form helpers ────────────────────────────────────────────────────────────
  function onChange(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }
  function onAmenityToggle(a: string) {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter(x => x !== a)
        : [...f.amenities, a],
    }))
  }

  // ── Validation for step 1 ──────────────────────────────────────────────────
  function validateStep1(): string | null {
    if (!form.title_th.trim()) return 'กรุณากรอกชื่อประกาศ (ภาษาไทย)'
    if (['apartment', 'office', 'coworking'].includes(form.property_type) && form.apartment_units.length === 0)
      return 'กรุณาเพิ่มอย่างน้อย 1 ประเภทห้อง / พื้นที่'
    if (['condo', 'house'].includes(form.property_type) && !form.condo_rental.price_12mo && !form.condo_rental.price_1mo)
      return 'กรุณากรอกราคาเช่า'
    if (!form.province) return 'กรุณาเลือกจังหวัด'
    if (form.images.length === 0) return 'กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป'
    return null
  }

  // ── Promo code ─────────────────────────────────────────────────────────────
  async function applyPromo() {
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    setPromoStatus('checking'); setPromoError(''); setPromoData(null)
    try {
      const res  = await fetch('/api/stripe/validate-promo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const json = await res.json()
      if (json.valid) {
        setPromoStatus('valid')
        setPromoData({ promotionCodeId: json.promotionCodeId, discountTHB: json.discountTHB, percentOff: json.percentOff })
      } else {
        setPromoStatus('invalid'); setPromoError(json.error || 'โค้ดไม่ถูกต้อง')
      }
    } catch {
      setPromoStatus('invalid'); setPromoError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
  }

  // ── Submit to Stripe ───────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!contactName.trim() || !contactPhone.trim()) {
      setError('กรุณากรอกชื่อและเบอร์โทรติดต่อ'); return
    }
    if (!consent) { setError('กรุณายอมรับเงื่อนไขการให้บริการก่อนดำเนินการ'); return }
    setError(null); setLoading(true)
    try {
      const { data: { session: authSess } } = await createBrowserClient().auth.getSession()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (authSess?.access_token) headers['Authorization'] = `Bearer ${authSess.access_token}`

      const extra = prepareSubmitData(form) // { price_from, price_to, room_types, floor, area_sqm }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          // Rich listing fields (new)
          title_th:       form.title_th,
          title_en:       form.title_en,
          property_type:  form.property_type,
          rental_term:    form.rental_term,
          description_th: form.description_th,
          description_en: form.description_en,
          amenities:      form.amenities,
          images:         form.images,
          video_url:      form.video_url || null,
          address_th:     form.address_th,
          district:       form.district,
          sub_district:   form.sub_district,
          province:       form.province,
          postcode:       form.postcode,
          lat:            form.lat ? parseFloat(form.lat) : null,
          lng:            form.lng ? parseFloat(form.lng) : null,
          bedrooms:       parseInt(form.bedrooms)  || null,
          bathrooms:      parseInt(form.bathrooms) || null,
          ...extra,
          // Contact
          contactName,
          contactPhone,
          contactEmail,
          // Package + promo
          packageId:       form.package_type,
          promotionCodeId: promoData?.promotionCodeId ?? '',
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Server error')
      if (json.url) {
        trackEvent('listing_checkout', { package_id: form.package_type, property_type: form.property_type })
        window.location.href = json.url
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
      setLoading(false)
    }
  }

  // ── Selected package helper ────────────────────────────────────────────────
  const selectedPkg = PACKAGES.find(p => p.id === form.package_type) ?? PACKAGES[0]

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 80 }}>

      {/* ── Top bar ── */}
      <div style={{ background: '#02402e', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ color: '#d97f11', fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px' }}>SpacesMate</span>
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>ลงประกาศอสังหาฯ</span>
      </div>

      {/* ── Step indicator ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eef0ef', padding: '12px 20px', display: 'flex', gap: 0, alignItems: 'center', justifyContent: 'center', overflowX: 'auto' }}>
        {[
          { num: 1, label: 'เลือกแพ็กเกจ', s: 0 },
          { num: 2, label: 'ข้อมูลประกาศ', s: 1 },
          { num: 3, label: 'ข้อมูลติดต่อ & ชำระเงิน', s: 2 },
        ].map((item, idx) => {
          const done    = step > item.s
          const current = step === item.s
          return (
            <div key={item.num} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {idx > 0 && <div style={{ width: 28, height: 2, background: done ? '#048c73' : '#eef0ef', flexShrink: 0 }} />}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 6px' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? '#048c73' : current ? '#02402e' : '#eef0ef',
                  color: done || current ? '#fff' : '#94a3b8',
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>
                  {done ? <span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 500, 'FILL' 1" }}>check</span> : item.num}
                </div>
                <span style={{ fontSize: 12, fontWeight: current ? 700 : 400, color: current ? '#02402e' : done ? '#048c73' : '#94a3b8', whiteSpace: 'nowrap' }}>{item.label}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 16px 0' }}>

        {/* ═══════════════════════════════════════════════════
            STEP 0 — Package Selection
        ═══════════════════════════════════════════════════ */}
        {step === 0 && (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#02402e', margin: '0 0 6px', textAlign: 'center' }}>เลือกแพ็กเกจที่ต้องการ</h1>
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14, margin: '0 0 28px' }}>ประกาศจะเผยแพร่บน spacesmate.com ทันทีหลังชำระเงิน</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {PACKAGES.map(pkg => (
                <div
                  key={pkg.id}
                  onClick={() => setForm(f => ({ ...f, package_type: pkg.id }))}
                  style={{
                    background: '#fff',
                    border: `2px solid ${form.package_type === pkg.id ? '#02402e' : '#eef0ef'}`,
                    borderRadius: 14,
                    padding: '18px 20px',
                    cursor: 'pointer',
                    transition: 'border-color .15s, box-shadow .15s',
                    boxShadow: form.package_type === pkg.id ? '0 4px 16px rgba(2,64,46,0.12)' : 'none',
                    position: 'relative',
                  }}
                >
                  {pkg.badge && (
                    <span style={{ position: 'absolute', top: -10, right: 18, background: '#d97f11', color: '#fff', padding: '2px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>{pkg.badge}</span>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: '#02402e', marginBottom: 2 }}>{pkg.name}</div>
                      <div style={{ fontSize: 12.5, color: '#64748b' }}>แสดงผล {pkg.durationLabel} · รูปภาพ {pkg.maxImages} รูป{pkg.allowVideo ? ' · วิดีโอ' : ''}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: 22, fontWeight: 700, color: '#02402e' }}>{pkg.priceLabel}</span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>/เดือน</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {pkg.features.map(f => (
                      <span key={f} style={{ fontSize: 11.5, color: '#475569', background: '#f1f5f9', padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span className="msym" style={{ fontSize: 12, color: '#048c73', fontVariationSettings: "'wght' 500, 'FILL' 1" }}>check</span>{f}
                      </span>
                    ))}
                  </div>
                  {form.package_type === pkg.id && (
                    <div style={{ position: 'absolute', top: 16, right: 16, width: 22, height: 22, borderRadius: '50%', background: '#02402e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="msym" style={{ fontSize: 14, color: '#fff', fontVariationSettings: "'wght' 500, 'FILL' 1" }}>check</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ width: '100%', marginTop: 24, padding: '15px', borderRadius: 12, border: 'none', background: '#02402e', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              ถัดไป — กรอกข้อมูลประกาศ
              <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>arrow_forward</span>
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', margin: '10px 0 0' }}>ราคาแสดงเป็น THB · ต่ออายุอัตโนมัติ ยกเลิกได้ทุกเมื่อ</p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            STEP 1 — Full Listing Form
        ═══════════════════════════════════════════════════ */}
        {step === 1 && (
          <div>
            {/* Package badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 700, background: '#02402e', color: '#fff', padding: '4px 12px', borderRadius: 20 }}>
                {selectedPkg.name} · {selectedPkg.priceLabel}/เดือน
              </span>
              <button type="button" onClick={() => setStep(0)} style={{ fontSize: 12, color: '#048c73', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>เปลี่ยนแพ็กเกจ</button>
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 20px' }}>ข้อมูลประกาศ</h2>

            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #eef0ef', padding: '20px 20px 24px' }}>
              <ListingFormFields
                form={form}
                onChange={onChange}
                onAmenityToggle={onAmenityToggle}
                onImagesChange={imgs => setForm(f => ({ ...f, images: imgs }))}
                isPublicUpload={true}
              />
            </div>

            {error && (
              <div style={{ marginTop: 14, padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#b91c1c', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>warning</span>{error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button type="button" onClick={() => { setError(null); setStep(0) }}
                style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                ย้อนกลับ
              </button>
              <button type="button"
                onClick={() => {
                  const err = validateStep1()
                  if (err) { setError(err); return }
                  setError(null); setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', background: '#02402e', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                ถัดไป — ข้อมูลติดต่อ & ชำระเงิน
                <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            STEP 2 — Contact + Promo + Payment
        ═══════════════════════════════════════════════════ */}
        {step === 2 && (
          <div>
            {/* Summary card */}
            <div style={{ background: '#02402e', color: '#fff', borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginBottom: 4 }}>ประกาศที่จะเผยแพร่</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{form.title_th || '(ไม่มีชื่อ)'}</div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,.75)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>photo_library</span>{form.images.length} รูป
                </span>
                <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,.75)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>package_2</span>{selectedPkg.name} · {selectedPkg.priceLabel}/เดือน
                </span>
                {form.province && (
                  <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,.75)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>location_on</span>{form.province}
                  </span>
                )}
              </div>
            </div>

            {/* Contact info */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #eef0ef', padding: '20px', marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#02402e', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>person</span>ข้อมูลติดต่อ
              </h2>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>ชื่อผู้ติดต่อ *</label>
                <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="ชื่อ-นามสกุล หรือชื่อบริษัท" style={SINP} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>เบอร์โทรศัพท์ *</label>
                  <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="08x-xxx-xxxx" type="tel" style={SINP} />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>อีเมล (ถ้ามี)</label>
                  <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="email@example.com" type="email" style={SINP} />
                </div>
              </div>
              <p style={{ fontSize: 11.5, color: '#94a3b8', margin: 0 }}>ข้อมูลติดต่อจะแสดงบนประกาศของคุณเพื่อให้ผู้เช่าติดต่อได้โดยตรง</p>
            </div>

            {/* Promo code */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #eef0ef', padding: '20px', marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#02402e', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>local_activity</span>โค้ดส่วนลด (ถ้ามี)
              </h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={promoInput}
                  onChange={e => { setPromoInput(e.target.value); setPromoStatus('idle'); setPromoError(''); setPromoData(null) }}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyPromo() } }}
                  placeholder="กรอกโค้ดส่วนลด"
                  disabled={promoStatus === 'valid'}
                  style={{ ...SINP, flex: 1, background: promoStatus === 'valid' ? '#f0fbf8' : '#fff', borderColor: promoStatus === 'valid' ? '#048c73' : promoStatus === 'invalid' ? '#fca5a5' : '#e2e8f0' }}
                />
                <button type="button" onClick={applyPromo} disabled={promoStatus === 'checking' || promoStatus === 'valid'}
                  style={{ padding: '11px 16px', borderRadius: 10, border: 'none', background: promoStatus === 'valid' ? '#048c73' : '#02402e', color: '#fff', fontWeight: 600, fontSize: 13.5, cursor: promoStatus === 'valid' ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5, opacity: promoStatus === 'checking' ? 0.7 : 1 }}>
                  {promoStatus === 'valid'    ? <><span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 500, 'FILL' 1" }}>check</span>ใช้แล้ว</> :
                   promoStatus === 'checking' ? 'ตรวจสอบ...' : 'ใช้โค้ด'}
                </button>
              </div>
              {promoStatus === 'valid' && promoData && (
                <div style={{ marginTop: 8, padding: '8px 12px', background: '#f0fbf8', borderRadius: 8, fontSize: 12.5, color: '#048c73', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 500, 'FILL' 1" }}>check_circle</span>
                  ส่วนลด{promoData.percentOff ? ` ${promoData.percentOff}%` : promoData.discountTHB ? ` ฿${promoData.discountTHB.toLocaleString()}` : ''} ถูกนำไปใช้แล้ว
                </div>
              )}
              {promoStatus === 'invalid' && <p style={{ margin: '6px 0 0', fontSize: 12.5, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 4 }}><span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>warning</span>{promoError}</p>}
            </div>

            {/* Order summary */}
            <div style={{ background: '#fafffe', borderRadius: 14, border: '1px solid #b2d8c9', padding: '18px 20px', marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#02402e', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>receipt_long</span>สรุปคำสั่งซื้อ
              </h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eef0ef' }}>
                <span style={{ fontSize: 13.5, color: '#475569' }}>SpacesMate {selectedPkg.name} — {selectedPkg.durationLabel}</span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: '#231f20' }}>{selectedPkg.priceLabel}/เดือน</span>
              </div>
              {promoStatus === 'valid' && promoData && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eef0ef' }}>
                  <span style={{ fontSize: 13, color: '#048c73' }}>ส่วนลดโค้ด</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#048c73' }}>
                    -{promoData.percentOff ? `${promoData.percentOff}%` : promoData.discountTHB ? `฿${promoData.discountTHB.toLocaleString()}` : ''}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0 0' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#02402e' }}>ยอดรวม (ต่อเดือน)</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#02402e' }}>
                  {promoData?.discountTHB
                    ? `฿${(selectedPkg.price - promoData.discountTHB).toLocaleString()}/เดือน`
                    : selectedPkg.priceLabel + '/เดือน'}
                </span>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 11.5, color: '#94a3b8' }}>ราคา VAT ยังไม่รวม · บิลออกเดือนละครั้ง · ยกเลิกได้ทุกเมื่อ</p>
            </div>

            {/* Consent */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '14px', background: '#fff', border: '1.5px solid ' + (consent ? '#048c73' : '#eef0ef'), borderRadius: 12, marginBottom: 16, transition: 'border-color .15s' }}>
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#048c73', marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                ฉันยืนยันว่าข้อมูลประกาศเป็นความจริง และยอมรับ{' '}
                <Link href="/terms" style={{ color: '#048c73', fontWeight: 600 }}>เงื่อนไขการให้บริการ</Link>
                {' '}และ{' '}
                <Link href="/privacy" style={{ color: '#048c73', fontWeight: 600 }}>นโยบายความเป็นส่วนตัว</Link>
                {' '}ของ SpacesMate
              </span>
            </label>

            {error && (
              <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#b91c1c', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>warning</span>{error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => { setError(null); setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                ย้อนกลับ
              </button>
              <button type="button" onClick={handleSubmit} disabled={loading}
                style={{ flex: 2, padding: '14px', borderRadius: 12, border: 'none', background: loading ? '#94a3b8' : '#02402e', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background .15s' }}>
                {loading
                  ? <><span style={{ width: 17, height: 17, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />กำลังดำเนินการ...</>
                  : <><span className="msym" style={{ fontSize: 20, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>payment</span>ชำระเงินผ่าน Stripe</>
                }
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              <span className="msym" style={{ fontSize: 16, color: '#94a3b8', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>lock</span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>ชำระเงินอย่างปลอดภัยผ่าน Stripe · SpacesMate ไม่เก็บข้อมูลบัตรเครดิต</span>
            </div>
          </div>
        )}

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// ── Root Export ───────────────────────────────────────────────────────────────
export default function SubmitNewPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #eef0ef', borderTopColor: '#048c73', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ margin: 0, fontSize: 14 }}>กำลังโหลด...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    }>
      <SubmitNewForm />
    </Suspense>
  )
}
