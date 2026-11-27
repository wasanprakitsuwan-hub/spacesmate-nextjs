'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
// Link here is LocaleLink: it keeps the reader in the language they are already
// reading, so an href written as a Thai path resolves to its English
// counterpart on /en/* pages. An href with no English page passes through
// unchanged. The list of which is in lib/routes-i18n, deliberately not
// repeated here — it was copied into 16 files and went stale in all of them
// the moment /manage and /blog got English pages. See
// components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import { useSearchParams } from 'next/navigation'
import { trackEvent } from '@/lib/analytics'
import { MAX_IMAGES_ANY_PACKAGE } from '@/lib/packages'
import { PROPERTY_TYPE_LABELS } from '@/lib/constants'
import { C, RADIUS, btnStyle } from '@/lib/ui'
import { createBrowserClient } from '@/lib/supabase'
import { SUBMIT_NEW_T, type Locale } from '@/lib/submit-new-i18n'
import OwnerHelpLinks from '@/components/owner/OwnerHelpLinks'
import AccountSheet from '@/components/owner/AccountSheet'
import EmailCodePanel from '@/components/owner/EmailCodePanel'
import { normalisePromo, type CheckoutPromo } from '@/lib/promo'
import { saveLocalDraft, readLocalDraft, clearLocalDraft, readAttribution } from '@/lib/funnel'
import {
  FormState, BLANK, prepareSubmitData, ListingFormFields,
} from '@/components/listing/SharedListingForm'

// The PACKAGES table lived here and was removed on 3 Sep 2026.
//
// It existed so this page could charge, and later so it could set an image
// allowance. It does neither now: packages are a display entitlement decided by
// the slot the owner buys, and this page only writes the listing. Prices live
// in lib/packages and are shown on /list-your-property and at /checkout.

// ── Inner Form ────────────────────────────────────────────────────────────────
//
// FOUR STEPS, NO LOGIN WALL (Founder, 27 Nov 2026, Facebook ad funnel)
//
//   1 ข้อมูลห้อง · 2 รูปภาพ · 3 ราคาและช่องทางติดต่อ · 4 เผยแพร่
//
// The fields are the same ListingFormFields the owner dashboard uses, shown a
// step at a time (its `step` prop). A gauge at the top fills as required
// fields are completed, a quarter per step.
//
// Logged-out owners fill the whole form. Every change is written to
// localStorage (lib/funnel), so switching apps or losing signal costs nothing.
// An account is asked for only when they save: AccountSheet opens over the
// form, and once it signs them in the save carries on by itself.
//
// Until 27 Nov a logged-out visitor was sent to /login before seeing a single
// field, and email sign-up then blocked on a confirmation link that opens in
// another browser — fatal inside Facebook's in-app browser.

type Mode = 'pay' | 'draft'
type Step = 1 | 2 | 3 | 4

function SubmitNewForm({ locale }: { locale: Locale }) {
  const t = SUBMIT_NEW_T[locale]
  /**
   * Where this flow sends the owner. The draft lands in the same place either
   * way; only the pages they pass through differ, and sending an English owner
   * to a Thai pricing page or login redirect is how a translated funnel leaks.
   * The owner dashboard has no English build, so it is deliberately not here.
   */
  const lp = (path: string) => (locale === 'en' ? `/en${path}` : path)
  const searchParams = useSearchParams()
  const urlPkg       = searchParams.get('package') || 'basic'
  const initialPkg   = ['basic','standard','premium'].includes(urlPkg) ? urlPkg : 'basic'

  // Denominator for the funnel. Without this we can see who finishes but not who
  // arrived, which is exactly the gap in the Facebook-ads question.
  useEffect(() => {
    trackEvent('listing_start', { package_id: initialPkg, referrer: typeof document !== 'undefined' ? document.referrer : '' })
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  const [form, setForm] = useState<FormState>({ ...BLANK, package_type: initialPkg })
  const [step, setStep] = useState<Step>(1)
  const [restored, setRestored] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const hydrated = useRef(false)

  // Restore what was typed before (a closed tab, a trip to the mail app, the
  // Google sign-in round trip). Also picks up the old sessionStorage stash.
  useEffect(() => {
    const d = readLocalDraft<Partial<FormState>>()
    if (d?.form && typeof d.form === 'object') {
      setForm(f => ({ ...f, ...d.form }))
      const st = Number(d.step)
      if (st >= 1 && st <= 4) setStep(st as Step)
      if (d.form.title_th || (d.form.images?.length ?? 0) > 0) setRestored(true)
      setSavedAt(d.savedAt)
    }
    hydrated.current = true
  }, [])

  // Write as they type, half a second after the last change.
  useEffect(() => {
    if (!hydrated.current) return
    const id = setTimeout(() => {
      saveLocalDraft(form, step)
      setSavedAt(new Date().toISOString())
    }, 500)
    return () => clearTimeout(id)
  }, [form, step])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const on = () => setIsMobile(mq.matches)
    on(); mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [])

  // The advertised promo code, for the line on step 4. Off = no line.
  const [promo, setPromo] = useState<CheckoutPromo | null>(null)
  useEffect(() => {
    fetch('/api/settings/public?key=checkout_promo')
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j?.data) setPromo(normalisePromo(j.data)) })
      .catch(() => {})
  }, [])

  // UI state
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [consent,  setConsent]  = useState(false)
  const [sheetFor, setSheetFor] = useState<Mode | null>(null)
  const [codeFor,  setCodeFor]  = useState<string | null>(null)   // saved draft id awaiting the email code
  const topRef = useRef<HTMLDivElement>(null)

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

  // ── What each step needs ───────────────────────────────────────────────────
  const multiUnit = ['apartment', 'office', 'coworking'].includes(form.property_type)
  const hasPrice = multiUnit
    ? form.apartment_units.length > 0
    : !!(form.condo_rental.price_12mo || form.condo_rental.price_1mo)

  const required: Record<1 | 2 | 3, Array<[boolean, string]>> = {
    1: [
      [!!form.title_th.trim(), t.needTitleTh],
      [!!form.province, t.needProvince],
      [!!(form.lat && form.lng), t.needPin],
    ],
    2: [[form.images.length > 0, t.needImage]],
    3: [
      [hasPrice, multiUnit ? t.needRoomType : t.needPrice],
      [!!(form.contact_name.trim() && form.contact_phone.trim()), t.needContact],
    ],
  }
  const stepFill = (n: 1 | 2 | 3) => required[n].filter(c => c[0]).length / required[n].length
  const step4Fill = consent ? 0.6 : 0   // the last 40% is the save itself
  const pct = Math.round(((stepFill(1) + stepFill(2) + stepFill(3) + step4Fill) / 4) * 100)
  const fills = [stepFill(1), stepFill(2), stepFill(3), step4Fill]
  const firstMissing = (n: 1 | 2 | 3) => required[n].find(c => !c[0])?.[1] ?? null

  function go(n: Step) {
    setError(null)
    setStep(n)
    trackEvent('listing_step', { step: n })
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  function next() {
    if (step < 4) {
      const miss = firstMissing(step as 1 | 2 | 3)
      if (miss) {
        trackEvent('listing_validation_error', { mode: 'step', step, reason: miss })
        setError(miss); return
      }
      go((step + 1) as Step)
    }
  }

  // ── Save the listing ───────────────────────────────────────────────────────
  // 'pay' validates everything and goes on to /checkout (or publishes straight
  // away into a free slot). 'draft' needs only a title, keeps it a draft even
  // when a slot is free, and goes to the dashboard.
  async function handleSubmit(mode: Mode) {
    let err: string | null = null
    if (mode === 'draft') {
      err = form.title_th.trim() ? null : t.needTitleTh
    } else {
      for (const n of [1, 2, 3] as const) {
        const miss = firstMissing(n)
        if (miss) { err = miss; if (step !== n) go(n); break }
      }
    }
    if (err) {
      // The single most useful signal we can collect: which field stops
      // people. Photo upload is the prime suspect.
      trackEvent('listing_validation_error', {
        mode, reason: err, property_type: form.property_type,
        has_images: form.images.length > 0, image_count: form.images.length,
      })
      setError(err); return
    }
    if (!consent) {
      if (step !== 4) go(4)
      trackEvent('listing_validation_error', { mode, reason: 'no_consent' })
      setError(t.needConsent); return
    }
    setError(null)

    // Drafts belong to an account. Ask for one now, not before the form:
    // the sheet signs them in and calls this again.
    const { data: { session: authSess } } = await createBrowserClient().auth.getSession()
    if (!authSess?.access_token) {
      trackEvent('listing_draft_needs_account', { package_id: form.package_type, mode })
      saveLocalDraft(form, step)
      setSheetFor(mode)
      return
    }

    setLoading(true)

    // Record the consent tick. Section 19 PDPA requires the controller to be
    // able to demonstrate consent; a tick nobody stored is not evidence.
    // Fire-and-forget: if logging fails the owner still gets to save.
    void fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authSess.access_token}` },
      keepalive: true,
      body: JSON.stringify({
        kind: 'listing_submission',
        action: 'granted',
        notice_version: 1,
        granted: { terms: true, privacy: true },
      }),
    }).catch(() => {})

    // ── Save the listing as a draft. No payment here. ────────────────────────
    // The listing is written first and free; the package is then bought for
    // that listing at /checkout and stays with it for its term (Founder,
    // 26 Oct 2026). POST /api/owner/listings creates the draft and publishes
    // it only if a slot is already free.
    try {
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
          draft_only:    mode === 'draft',
          // Which ad brought them (first-party, lib/funnel).
          attribution:   readAttribution(),
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Server error')

      // Saved on the server: the browser copy has done its job.
      clearLocalDraft()

      // Fires only after the API saved the listing. Meta gets it as a Lead.
      trackEvent('listing_submit', {
        listing_id:    json.listing?.id,
        property_type: form.property_type,
        package:       form.package_type,
        published:     json.published === true,
        mode,
      })

      if (mode === 'draft') {
        window.location.href = '/owner-dashboard'
        return
      }

      // If a slot was already free, the API published it — nothing left to buy.
      if (json.published === true) {
        window.location.href = '/owner-dashboard?published=1'
        return
      }

      const draftId = json.listing?.id as string | undefined
      if (!draftId) { window.location.href = '/owner-dashboard'; return }

      // Email proven? If not, the code panel takes over step 4, and checkout
      // follows the moment it is confirmed (lib/email-verify).
      const v = await fetch('/api/auth/email-code', { headers: { Authorization: `Bearer ${authSess.access_token}` } })
        .then(r => r.ok ? r.json() : { verified: true }).catch(() => ({ verified: true }))
      if (!v.verified) {
        setCodeFor(draftId)
        setLoading(false)
        go(4)
        return
      }
      toCheckout(draftId)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.genericError)
      setLoading(false)
    }
  }

  function toCheckout(draftId: string) {
    window.location.href = `${lp('/checkout')}?listing=${encodeURIComponent(draftId)}&pkg=${encodeURIComponent(form.package_type)}`
  }

  function startOver() {
    clearLocalDraft()
    setForm({ ...BLANK, package_type: initialPkg })
    setRestored(false)
    setConsent(false)
    go(1)
  }

  // ── Card preview, from what is typed so far ────────────────────────────────
  const price = prepareSubmitData(form).price_from
  const typeLabel = PROPERTY_TYPE_LABELS[form.property_type as keyof typeof PROPERTY_TYPE_LABELS]?.[locale] ?? ''
  const fmt = (n: number) => n.toLocaleString(locale === 'en' ? 'en-GB' : 'th-TH')
  const savedLabel = savedAt
    ? `${t.savedLocally} · ${new Date(savedAt).toLocaleTimeString(locale === 'en' ? 'en-GB' : 'th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })}`
    : ''

  const card: React.CSSProperties = { background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS, padding: 20, marginBottom: 14 }

  const preview = (
    <div style={card}>
      <p style={{ fontSize: 13, color: C.muted, margin: '0 0 10px' }}>{t.previewTitle}</p>
      <div style={{ border: `1px solid ${C.line}`, borderRadius: RADIUS, overflow: 'hidden' }}>
        <div style={{ aspectRatio: '4 / 3', background: C.line2 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {form.images[0] && <img src={form.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
        </div>
        <div style={{ padding: '10px 12px 12px' }}>
          <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: form.title_th ? C.ink : C.faint, lineHeight: 1.4 }}>{form.title_th || t.previewUntitled}</p>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>{[typeLabel, form.district].filter(Boolean).join(' · ')}</p>
          {price > 0 && (
            <p style={{ margin: '6px 0 0', fontSize: 16, fontWeight: 600, color: C.amber }}>฿{fmt(price)}<span style={{ fontSize: 12.5, color: C.muted, fontWeight: 400 }}> {t.perMonth}</span></p>
          )}
        </div>
      </div>
    </div>
  )

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.paper }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes smStepIn { from { opacity: 0; transform: translateX(14px) } to { opacity: 1; transform: none } }
        .sm-step { animation: smStepIn .28s ease-out; }
        .sm-gauge-fill { transition: width .45s cubic-bezier(.2,.8,.2,1); }
        .sm-nl-grid { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 24px; align-items: start; }
        .sm-nl-aside { position: sticky; top: 150px; }
        .sm-nl-bar { position: sticky; bottom: 0; z-index: 20; }
        @media (min-width: 961px) { .sm-nl-actions { justify-content: flex-end; } .sm-nl-actions .sm-btn-primary { flex: 0 0 320px !important; } }
        @media (max-width: 960px) { .sm-nl-grid { grid-template-columns: minmax(0, 1fr); } .sm-nl-aside { display: none; } }
        @media (prefers-reduced-motion: reduce) { .sm-step { animation: none; } .sm-gauge-fill { transition: none; } }
      `}</style>

      {/* Gauge: sticky under the funnel header */}
      <div ref={topRef} style={{ position: 'sticky', top: 56, zIndex: 30, background: C.white, borderBottom: `1px solid ${C.line}`, scrollMarginTop: 56 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '12px 16px 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.green }}>
              {t.stepOf(step)} · {t.stepNames[step - 1]}
            </p>
            <p aria-live="polite" style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.teal }}>{pct}%</p>
          </div>
          <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}
            style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 4 }}>
            {fills.map((f, i) => (
              <div key={i} style={{ height: 6, borderRadius: 3, background: C.line, overflow: 'hidden' }}>
                <div className="sm-gauge-fill" style={{ height: 6, width: `${Math.round(f * 100)}%`, background: C.teal }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 4 }}>
            {t.stepShort.map((label, i) => {
              const n = (i + 1) as Step
              const reachable = n <= step || (n > 1 && [1, 2, 3].slice(0, n - 1).every(k => stepFill(k as 1 | 2 | 3) === 1))
              return (
                <button key={label} type="button" disabled={!reachable} onClick={() => go(n)}
                  style={{ background: 'none', border: 0, padding: '2px 0', textAlign: 'left', fontFamily: 'inherit', fontSize: 11.5,
                    color: n === step ? C.green : C.muted, fontWeight: n === step ? 600 : 400, cursor: reachable ? 'pointer' : 'default' }}>
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '18px 16px 0' }}>
        {step === 1 && !restored && (
          <p style={{ margin: '0 0 14px', padding: '10px 12px', background: C.tint, borderRadius: RADIUS, fontSize: 13, lineHeight: 1.55, color: C.green }}>{t.noAccountYet}</p>
        )}
        {restored && (
          <p style={{ margin: '0 0 14px', padding: '10px 12px', background: C.tint, borderRadius: RADIUS, fontSize: 13, lineHeight: 1.55, color: C.green, display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <span>{t.restored}</span>
            <button type="button" onClick={startOver} style={{ background: 'none', border: 0, padding: 0, color: C.teal, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>{t.startOver}</button>
          </p>
        )}

        <div className="sm-nl-grid">
          <div style={{ minWidth: 0 }}>
            <div key={step} className="sm-step">
              {step <= 3 && (
                <div style={{ ...card, padding: '20px 20px 24px' }}>
                  <ListingFormFields
                    form={form}
                    onChange={onChange}
                    onAmenityToggle={onAmenityToggle}
                    onImagesChange={imgs => setForm(f => ({ ...f, images: imgs }))}
                    isPublicUpload={true}
                    isMobile={isMobile}
                    locale={locale}
                    step={step as 1 | 2 | 3}
                  />
                </div>
              )}

              {step === 3 && isMobile && preview}

              {step === 4 && (codeFor ? (
                <div style={{ marginBottom: 14 }}>
                  <EmailCodePanel locale={locale} onVerified={() => toCheckout(codeFor)} />
                </div>
              ) : (
                <>
                  <div style={card}>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: C.green }}>{t.publishHeading}</h2>
                    <p style={{ margin: '6px 0 0', fontSize: 14.5, lineHeight: 1.65, color: C.ink }}>{t.publishBody}</p>
                    {promo?.enabled && promo.code && (
                      <p style={{ margin: '10px 0 0', padding: '10px 12px', background: C.amberTint, borderRadius: RADIUS, fontSize: 13.5, color: C.ink }}>{t.promoHint(promo.code)}</p>
                    )}
                  </div>
                  {isMobile && preview}
                  <label style={{ ...card, display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', borderColor: consent ? C.teal : C.line }}>
                    <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ width: 18, height: 18, accentColor: C.teal, marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: C.ink, lineHeight: 1.6 }}>
                      {t.consentLead}{' '}
                      <Link href={lp('/terms')} target="_blank" style={{ color: C.teal }}>{t.terms}</Link>
                      {' '}{t.and}{' '}
                      <Link href={lp('/privacy')} target="_blank" style={{ color: C.teal }}>{t.privacy}</Link>
                      {' '}{t.consentTail}
                    </span>
                  </label>
                </>
              ))}
            </div>

            {error && (
              <div role="alert" style={{ padding: '12px 14px', background: '#fef3f2', border: '1px solid #fecdca', borderRadius: RADIUS, color: '#b42318', fontSize: 13.5, marginBottom: 14 }}>{error}</div>
            )}

            {savedLabel && <p style={{ margin: '0 0 12px', fontSize: 12.5, color: C.muted }}>{savedLabel}</p>}

            {step === 4 && !codeFor && <OwnerHelpLinks locale={locale} />}
            <div style={{ height: 16 }} />
          </div>

          <aside className="sm-nl-aside">
            {preview}
            <div style={card}>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.green, margin: '0 0 8px' }}>{t.nextHeading}</p>
              {[t.next1, t.next2, t.next3].map(x => (
                <p key={x} style={{ margin: '0 0 6px', fontSize: 13, color: C.ink, lineHeight: 1.6 }}>{x}</p>
              ))}
              <p style={{ margin: '10px 0 0', fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>
                <strong style={{ color: C.ink, fontWeight: 600 }}>{t.fillFreely}</strong>{t.fillFreelyBody(MAX_IMAGES_ANY_PACKAGE)}
              </p>
              <Link href="/guide" target="_blank" style={{ display: 'inline-block', marginTop: 10, fontSize: 13.5, color: C.teal, textDecoration: 'none' }}>{t.guideLink}</Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Actions: pinned to the bottom of the screen on phones */}
      {!codeFor && (
        <div className="sm-nl-bar" style={{ background: C.white, borderTop: `1px solid ${C.line}` }}>
          <div style={{ maxWidth: 1120, margin: '0 auto', padding: '10px 16px calc(12px + env(safe-area-inset-bottom, 0px))', display: 'flex', gap: 10, alignItems: 'center' }} className="sm-nl-actions">
            {step > 1
              ? <button type="button" onClick={() => go((step - 1) as Step)} disabled={loading} className="sm-btn-ghost" style={{ ...btnStyle('ghost'), height: 50 }}>{t.back}</button>
              : <button type="button" onClick={() => handleSubmit('draft')} disabled={loading} className="sm-btn-ghost" style={{ ...btnStyle('ghost'), height: 50 }}>{t.saveDraftShort}</button>}
            {step === 4 && (
              <button type="button" onClick={() => handleSubmit('draft')} disabled={loading} className="sm-btn-ghost" style={{ ...btnStyle('ghost'), height: 50 }}>{t.saveDraftShort}</button>
            )}
            <button type="button" onClick={() => (step < 4 ? next() : handleSubmit('pay'))} disabled={loading} className="sm-btn-primary"
              style={{ ...btnStyle('primary'), flex: 1, height: 50, fontSize: 16, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}>
              {loading
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />{t.saving}</>
                : step < 4 ? `${t.next} · ${t.stepNames[step as 1 | 2 | 3]}` : t.saveAndPay}
            </button>
          </div>
        </div>
      )}

      {sheetFor && (
        <AccountSheet
          locale={locale}
          redirectTo={lp('/list-your-property/new')}
          onClose={() => setSheetFor(null)}
          onDone={() => { const m = sheetFor; setSheetFor(null); void handleSubmit(m) }}
        />
      )}
    </div>
  )
}

// ── Shared body ───────────────────────────────────────────────────────────────
/**
 * Rendered by both /list-your-property/new (Thai) and /en/submit/new (English). Thai is the
 * default so the existing route is unchanged.
 */
export default function NewListingBody({ locale = 'th' }: { locale?: Locale }) {
  const t = SUBMIT_NEW_T[locale]
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #eef0ef', borderTopColor: '#048c73', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ margin: 0, fontSize: 14 }}>{t.loading}</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    }>
      <SubmitNewForm locale={locale} />
    </Suspense>
  )
}
