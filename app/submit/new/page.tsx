'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { trackEvent } from '@/lib/analytics'
import { MAX_IMAGES_ANY_PACKAGE } from '@/lib/packages'
import { createBrowserClient } from '@/lib/supabase'
import {
  FormState, BLANK, prepareSubmitData, ListingFormFields,
} from '@/components/listing/SharedListingForm'

// The PACKAGES table lived here and was removed on 3 Sep 2026.
//
// It existed so this page could charge, and later so it could set an image
// allowance. It does neither now: packages are a display entitlement decided by
// the slot the owner buys, and this page only writes the listing. Prices live
// in lib/packages and are shown on /pricing.

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
  const initialPkg   = ['basic','standard','premium'].includes(urlPkg) ? urlPkg : 'basic'

  // Two steps: the listing, then contact details and save. There is no package
  // step any more — see the note where PACKAGES used to be.
  const [step, setStep] = useState(1) // 1=listing, 2=contact+save

  // Denominator for the funnel. Without this we can see who finishes but not who
  // arrived, which is exactly the gap in the Facebook-ads question.
  useEffect(() => {
    trackEvent('listing_start', { package_id: initialPkg, referrer: typeof document !== 'undefined' ? document.referrer : '' })
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  const [form, setForm] = useState<FormState>({ ...BLANK, package_type: initialPkg })

  // Restore a form abandoned at the login wall.
  //
  // Saving a draft needs an account, so someone who fills the whole form while
  // logged out gets bounced to /login. Without this they come back to an empty
  // form and have to type everything again — including re-uploading photos,
  // which is where they would give up. The stash is written just before that
  // redirect; this reads it back and clears it so it cannot resurface later.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('spacesmate_pending_listing')
      if (!saved) return
      sessionStorage.removeItem('spacesmate_pending_listing')
      const parsed = JSON.parse(saved) as Partial<FormState>
      if (parsed && typeof parsed === 'object' && parsed.title_th) {
        setForm(f => ({ ...f, ...parsed }))
        setStep(1)   // back to the listing step
      }
    } catch {
      // A malformed stash is not worth blocking the form for.
      sessionStorage.removeItem('spacesmate_pending_listing')
    }
  }, [])

  // Contact info (separate from listing FormState)

  // Promo state was removed with the promo box — this page no longer charges,
  // so there is nothing for a code to discount. Codes are entered at slot
  // checkout, which has Stripe's own promo field.

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

  // ── Save the listing as a draft ────────────────────────────────────────────
  async function handleSubmit() {
    if (!form.contact_name.trim() || !form.contact_phone.trim()) {
      trackEvent('listing_validation_error', { step: 2, reason: 'missing_contact' })
      setError('กรุณากรอกชื่อและเบอร์โทรติดต่อ'); return
    }
    if (!consent) {
      trackEvent('listing_validation_error', { step: 2, reason: 'no_consent' })
      setError('กรุณายอมรับเงื่อนไขการให้บริการก่อนดำเนินการ'); return
    }
    setError(null); setLoading(true)

    // Record the consent tick. Until now it gated the form in the browser and
    // was never sent anywhere — so nothing could be produced if a data subject
    // or the PDPC asked whether consent had been given. Section 19 requires the
    // controller to be able to demonstrate it; a tick nobody stored is not
    // evidence of anything.
    //
    // Fire-and-forget, before the checkout call: if the logging fails, the
    // person still gets to submit their listing. Their consent stands either
    // way; it is our record-keeping that is deficient, not their decision.
    void fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        kind: 'listing_submission',
        action: 'granted',
        notice_version: 1,
        granted: { terms: true, privacy: true },
      }),
    }).catch(() => {})

    // ── Save the listing as a draft. No payment here. ────────────────────────
    //
    // Writing a listing and paying to publish it are two different decisions,
    // and this route used to weld them together: it created a submission with
    // status 'pending_payment' and went straight to Stripe, so the only way to
    // get a listing into the system was to buy at the same moment.
    //
    // That contradicted the product. A slot is capacity, not a listing — you
    // can hold several, swap which listing occupies one, and buy before you
    // have written anything. The pricing FAQ says exactly that.
    //
    // POST /api/owner/listings already does the right thing: it creates the
    // property as a draft and separately decides whether to publish it, based
    // on whether a slot is free. This route just was not using it.
    try {
      const { data: { session: authSess } } = await createBrowserClient().auth.getSession()

      // Drafts belong to an account. There is nowhere to put an anonymous one —
      // it would not appear on any dashboard and nobody could publish it later.
      if (!authSess?.access_token) {
        trackEvent('listing_draft_needs_account', { package_id: form.package_type })
        sessionStorage.setItem('spacesmate_pending_listing', JSON.stringify(form))
        window.location.href = `/login?redirect=${encodeURIComponent('/submit/new')}`
        return
      }

      const extra = prepareSubmitData(form) // { price_from, price_to, room_types, floor, area_sqm }

      const res = await fetch('/api/owner/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authSess.access_token}`,
        },
        body: JSON.stringify({
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
          contact_name:  form.contact_name,
          contact_phone: form.contact_phone,
          contact_line:  form.contact_line,
          // Which package this listing is intended for. It does not buy
          // anything here — it preselects the package on the slot purchase.
          package_type:  form.package_type,
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Server error')

      trackEvent('listing_draft_saved', {
        package_id:    form.package_type,
        property_type: form.property_type,
        published:     json.published === true,
      })

      // If a slot was already free, the API published it — nothing left to buy.
      if (json.published === true) {
        window.location.href = '/owner-dashboard?published=1'
        return
      }

      // Otherwise the draft is saved and waiting for capacity. Send them
      // straight at the slot purchase with the package they picked, rather
      // than leaving them to find the pricing page themselves.
      window.location.href = `/pricing?draft=1&package=${encodeURIComponent(form.package_type)}`
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
      setLoading(false)
    }
  }

  // ── Selected package helper ────────────────────────────────────────────────

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
          // Package selection is no longer a step. It used to be step 1 because
          // this page charged, so the package had to be settled before payment.
          // It does not charge any more: the package belongs to the slot, which
          // is bought afterwards. Opening with a price list ahead of a form the
          // visitor has not filled in asks them to choose before they have any
          // reason to care. Step 0 still exists and is reachable from the
          // listing step, for changing the intended package and with it the
          // image allowance — it is just not the front door.
          { num: 1, label: 'ข้อมูลประกาศ', s: 1 },
          { num: 2, label: 'ข้อมูลติดต่อ & บันทึก', s: 2 },
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

        {/* The package-selection step was removed on 3 Sep 2026.
            Packages became a display entitlement rather than an input
            restriction: everyone may upload the largest allowance and add a
            video, and the slot the owner buys decides how much of that the
            public sees. So there is nothing to pick here, and asking would
            only put a price list in front of someone who came to write a
            listing. Pricing lives on /pricing. */}

        {/* ═══════════════════════════════════════════════════
            STEP 1 — Full Listing Form
        ═══════════════════════════════════════════════════ */}
        {step === 1 && (
          <div>
            {/* No package badge any more.
                Packages decide what the public sees, not what may be entered,
                so there is nothing to choose here and nothing this form needs
                to know. Pricing lives on /pricing; this page is only about
                writing the listing. */}

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

            {/* No "back" from here any more — this is the first step now, and a
                back button that lands on a package picker the visitor never saw
                would be disorienting. Changing the package is the link above. */}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button type="button"
                onClick={() => {
                  const err = validateStep1()
                  if (err) {
                    // The single most useful signal we can collect: which field
                    // stops people. Photo upload is the prime suspect.
                    trackEvent('listing_validation_error', {
                      step: 1,
                      reason: err,
                      property_type: form.property_type,
                      has_images: form.images.length > 0,
                      image_count: form.images.length,
                    })
                  }
                  if (err) { setError(err); return }
                  trackEvent('listing_step', { step: 2, from: 1, property_type: form.property_type, image_count: form.images.length })
                  setError(null); setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', background: '#02402e', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                ถัดไป — ข้อมูลติดต่อ
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
                {form.video_url && (
                  <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,.75)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>videocam</span>วิดีโอ 1 รายการ
                  </span>
                )}
                {form.province && (
                  <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,.75)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>location_on</span>{form.province}
                  </span>
                )}
              </div>
            </div>

            {/* Contact info is collected once, in the listing form itself
                (section 10). It used to be asked again here, so a landlord filled
                the same three fields twice. */}
            {/* The promo box and order summary lived here and were removed when
                this page stopped charging. Both would now lie: a discount code
                validated here applies to nothing, and an order summary implies
                a purchase that does not happen on this page. The code belongs
                at slot checkout, where Stripe's own promo field already sits. */}

            {/* What happens next */}
            <div style={{ background: '#fafffe', borderRadius: 14, border: '1px solid #b2d8c9', padding: '18px 20px', marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#02402e', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>save</span>ขั้นตอนถัดไป
              </h2>
              <p style={{ margin: 0, fontSize: 13.5, color: '#475569', lineHeight: 1.65 }}>
                กดบันทึกแล้วประกาศจะถูกเก็บเป็น <strong style={{ color: '#02402e' }}>ฉบับร่าง</strong> ในบัญชีของคุณ —
                ยังไม่มีการเรียกเก็บเงิน และยังไม่แสดงบนเว็บไซต์
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 13.5, color: '#475569', lineHeight: 1.65 }}>
                หากคุณมีสล็อตว่างอยู่แล้ว ระบบจะเผยแพร่ให้ทันที ถ้ายังไม่มี เราจะพาไปเลือกซื้อสล็อต —
                เลือกแพ็กเกจตอนนั้นได้เลย ไม่ต้องตัดสินใจตอนนี้
              </p>
              <p style={{ margin: '10px 0 0', fontSize: 12.5, color: '#8a6234', background: '#fffaf2', border: '1px solid #f0d5ad', borderRadius: 8, padding: '9px 11px', lineHeight: 1.6 }}>
                <strong>กรอกได้เต็มที่</strong> — ใส่รูปได้ถึง {MAX_IMAGES_ANY_PACKAGE} รูปและใส่วิดีโอได้ทุกแพ็กเกจ
                แพ็กเกจมีผลกับ<strong>จำนวนที่แสดงบนเว็บไซต์</strong>เท่านั้น ไม่ได้จำกัดสิ่งที่คุณกรอก
                อัปเกรดเมื่อไหร่ รูปและวิดีโอที่เหลือจะแสดงทันทีโดยไม่ต้องอัปโหลดใหม่
              </p>
              <p style={{ margin: '10px 0 0', fontSize: 11.5, color: '#94a3b8' }}>
                ประกาศฉบับร่างเก็บไว้ได้ตลอด ไม่มีวันหมดอายุ · แก้ไขได้ทุกเมื่อจากแดชบอร์ด
              </p>
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
              <button type="button" onClick={() => { trackEvent('listing_step_back', { from: 2, to: 1 }); setError(null); setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                ย้อนกลับ
              </button>
              <button type="button" onClick={handleSubmit} disabled={loading}
                style={{ flex: 2, padding: '14px', borderRadius: 12, border: 'none', background: loading ? '#94a3b8' : '#02402e', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background .15s' }}>
                {loading
                  ? <><span style={{ width: 17, height: 17, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />กำลังบันทึก...</>
                  : <><span className="msym" style={{ fontSize: 20, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>save</span>บันทึกประกาศ</>
                }
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              <span className="msym" style={{ fontSize: 16, color: '#94a3b8', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>lock</span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>บันทึกเป็นฉบับร่างก่อน — ยังไม่มีการเรียกเก็บเงิน ขั้นตอนถัดไปคือซื้อสล็อตเพื่อเผยแพร่</span>
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
