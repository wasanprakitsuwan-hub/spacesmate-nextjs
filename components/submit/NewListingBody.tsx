'use client'

import { useState, useEffect, Suspense } from 'react'
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

  // One page: the listing, contact and consent, then save. Payment is the next
  // page (/checkout), so the form never asks for a package (Founder, 25 Oct 2026).

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
      }
    } catch {
      // A malformed stash is not worth blocking the form for.
      sessionStorage.removeItem('spacesmate_pending_listing')
    }
  }, [])

  // Listing needs an account. A logged-out owner registers first and comes
  // back here, rather than filling the whole form and meeting the login wall at
  // the end (Founder, 24 Oct 2026). The stash above still covers anyone whose
  // session expires mid-form.
  useEffect(() => {
    createBrowserClient().auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.replace(`${lp('/login')}?tab=signup&redirect=${encodeURIComponent(lp('/list-your-property/new'))}`)
      }
    }).catch(() => {})
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

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
    if (!form.title_th.trim()) return t.needTitleTh
    if (['apartment', 'office', 'coworking'].includes(form.property_type) && form.apartment_units.length === 0)
      return t.needRoomType
    if (['condo', 'house'].includes(form.property_type) && !form.condo_rental.price_12mo && !form.condo_rental.price_1mo)
      return t.needPrice
    if (!form.province) return t.needProvince
    if (!form.lat || !form.lng) return t.needPin
    if (form.images.length === 0) return t.needImage
    return null
  }

  // ── Save the listing ───────────────────────────────────────────────────────
  // 'pay' validates everything and goes on to /checkout (or publishes straight
  // away into a free slot). 'draft' needs only a title, keeps it a draft even
  // when a slot is free, and goes to the dashboard.
  async function handleSubmit(mode: 'pay' | 'draft') {
    const err = mode === 'draft'
      ? (form.title_th.trim() ? null : t.needTitleTh)
      : validateStep1() ?? (!form.contact_name.trim() || !form.contact_phone.trim() ? t.needContact : null)
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
      trackEvent('listing_validation_error', { mode, reason: 'no_consent' })
      setError(t.needConsent); return
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
        window.location.href = `${lp('/login')}?redirect=${encodeURIComponent(lp('/list-your-property/new'))}`
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
          draft_only:    mode === 'draft',
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Server error')

      trackEvent('listing_draft_saved', {
        package_id:    form.package_type,
        property_type: form.property_type,
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

      // Otherwise the draft is saved and waiting for a slot. Checkout opens
      // with this listing and the package they picked already selected; it
      // links back to the dashboard for anyone who wants to pay later.
      const draftId = json.listing?.id as string | undefined
      window.location.href = draftId
        ? `${lp('/checkout')}?listing=${encodeURIComponent(draftId)}&pkg=${encodeURIComponent(form.package_type)}`
        : '/owner-dashboard'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.genericError)
      setLoading(false)
    }
  }

  // ── Card preview and completeness, from what is typed so far ──────────────
  const price = prepareSubmitData(form).price_from
  const typeLabel = PROPERTY_TYPE_LABELS[form.property_type as keyof typeof PROPERTY_TYPE_LABELS]?.[locale] ?? ''
  const fmt = (n: number) => n.toLocaleString(locale === 'en' ? 'en-GB' : 'th-TH')
  const checks: Array<[boolean, string]> = [
    [!!form.title_th.trim(), t.itemTitle],
    [!!price, t.itemPrice],
    [!!(form.lat && form.lng), t.itemPin],
    [form.images.length > 0, t.itemPhotos],
    [!!(form.contact_name.trim() && form.contact_phone.trim()), t.itemContact],
    [!!form.title_en?.trim(), t.itemTitleEn],
    [!!form.description_en?.trim(), t.itemDescEn],
  ]
  const done = checks.filter(c => c[0]).length
  const missing = checks.filter(c => !c[0]).map(c => c[1])

  const card: React.CSSProperties = { background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS, padding: 20, marginBottom: 14 }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.paper, padding: '24px 16px 80px' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .sm-nl-grid { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 24px; align-items: start; }
        .sm-nl-aside { position: sticky; top: 88px; }
        @media (max-width: 960px) { .sm-nl-grid { grid-template-columns: minmax(0, 1fr); } .sm-nl-aside { position: static; order: -1; } .sm-nl-hide-m { display: none; } }
      `}</style>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <p style={{ fontSize: 13, color: C.muted, margin: '0 0 8px' }}>
          <Link href="/owner-dashboard" style={{ color: C.teal, textDecoration: 'none' }}>{t.crumbMine}</Link>
          <span style={{ margin: '0 6px', color: C.faint }}>/</span>{t.crumbNew}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: C.green, margin: 0 }}>{t.pageTitle}</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
            <span style={{ color: C.green, fontWeight: 600 }}>1 {t.stepFill}</span>
            <span style={{ margin: '0 8px', color: C.faint }}>/</span>
            <span>2 {t.stepPay}</span>
          </p>
        </div>

        <div className="sm-nl-grid">
          <div style={{ minWidth: 0 }}>
            <div style={{ ...card, padding: '20px 20px 24px' }}>
              <ListingFormFields
                form={form}
                onChange={onChange}
                onAmenityToggle={onAmenityToggle}
                onImagesChange={imgs => setForm(f => ({ ...f, images: imgs }))}
                isPublicUpload={true}
                locale={locale}
              />
            </div>

            {/* Consent */}
            <label style={{ ...card, display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', borderColor: consent ? C.teal : C.line }}>
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ width: 18, height: 18, accentColor: C.teal, marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: C.ink, lineHeight: 1.6 }}>
                {t.consentLead}{' '}
                <Link href={lp('/terms')} style={{ color: C.teal }}>{t.terms}</Link>
                {' '}{t.and}{' '}
                <Link href={lp('/privacy')} style={{ color: C.teal }}>{t.privacy}</Link>
                {' '}{t.consentTail}
              </span>
            </label>

            {error && (
              <div role="alert" style={{ padding: '12px 14px', background: '#fef3f2', border: '1px solid #fecdca', borderRadius: RADIUS, color: '#b42318', fontSize: 13.5, marginBottom: 14 }}>{error}</div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => handleSubmit('draft')} disabled={loading} className="sm-btn-ghost" style={{ ...btnStyle('ghost'), opacity: loading ? 0.6 : 1 }}>
                {t.saveDraft}
              </button>
              <button type="button" onClick={() => handleSubmit('pay')} disabled={loading} className="sm-btn-primary"
                style={{ ...btnStyle('primary'), minWidth: 240, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}>
                {loading
                  ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />{t.saving}</>
                  : t.saveAndPay}
              </button>
            </div>

            <OwnerHelpLinks locale={locale} />
          </div>

          <aside className="sm-nl-aside">
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

            <div style={card} className="sm-nl-hide-m">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                <span style={{ fontWeight: 600, color: C.green }}>{t.completeness}</span>
                <span style={{ color: C.muted }}>{done}/{checks.length}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: C.line2, overflow: 'hidden' }}>
                <div style={{ width: `${(done / checks.length) * 100}%`, height: '100%', background: C.teal }} />
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: C.muted, lineHeight: 1.55 }}>
                {missing.length ? t.missing + missing.join(', ') : t.complete}
              </p>
            </div>

            <div style={card} className="sm-nl-hide-m">
              <p style={{ fontSize: 14, fontWeight: 600, color: C.green, margin: '0 0 8px' }}>{t.nextHeading}</p>
              {[t.next1, t.next2, t.next3].map(x => (
                <p key={x} style={{ margin: '0 0 6px', fontSize: 13, color: C.ink, lineHeight: 1.6 }}>{x}</p>
              ))}
              <p style={{ margin: '10px 0 0', fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>
                <strong style={{ color: C.ink, fontWeight: 600 }}>{t.fillFreely}</strong>{t.fillFreelyBody(MAX_IMAGES_ANY_PACKAGE)}
              </p>
              <Link href="/guide" style={{ display: 'inline-block', marginTop: 10, fontSize: 13.5, color: C.teal, textDecoration: 'none' }}>{t.guideLink}</Link>
            </div>
          </aside>
        </div>
      </div>
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
