'use client'

import { useCallback, useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import PhonePrompt from '@/components/auth/PhonePrompt'
import { trackEvent } from '@/lib/analytics'
import { PACKAGE_PRICE_THB, PACKAGE_IMAGE_LIMITS } from '@/lib/packages'
import {
  FormState, ApartmentUnitRow, CondoRentalDetail, RentalCharges,
  BLANK, BLANK_CONDO, BLANK_CHARGES, pkgLabelFor, typeLabelFor,
  prepareSubmitData, ListingFormFields,
} from '@/components/listing/SharedListingForm'
import { DASH_T, type DashStrings, type Locale } from '@/lib/dashboard-i18n'
import { localeHref } from '@/lib/routes-i18n'
import ListingStatsModal from '@/components/dashboard/ListingStatsModal'
import { C, RADIUS } from '@/lib/ui'
import { normalisePromo, type CheckoutPromo } from '@/lib/promo'

// ── Types ─────────────────────────────────────────────────────────────────────
interface SubscriptionItem {
  submission_id: string | null
  listing_title: string | null
  stripe_subscription_id: string
  stripe_status: string
  package_type: string
  expires_at: string | null
  cancel_at_period_end: boolean
  next_billing_date: string | null
  slot_count?: number
  slots_used?: number
  listing_titles?: string[]
  listing_ids?: string[]
}

interface OwnerListing {
  id: string
  slug: string
  property_name_id?: string | null
  title_th: string
  title_en: string | null
  property_type: string
  price_from: number
  price_to: number | null
  district: string | null
  sub_district: string | null
  address_th: string | null
  province: string | null
  postcode: string | null
  images: string[] | null
  listing_status: string
  /** Holds a live slot: a draft taken down mid-term goes back up without paying. */
  holds_slot?: boolean
  /** Visitors over the last 30 days; null when stats failed to load. */
  views_30d?: number | null
  package_type: string | null
  expires_at: string | null
  created_at: string
  bedrooms: number
  bathrooms: number
  floor: number | null
  area_sqm: number | null
  rental_term: string | null
  verified: boolean
  description_th: string | null
  description_en: string | null
  amenities: string[] | null
  room_types: any[] | null
  lat: number | null
  lng: number | null
  video_url: string | null
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  contact_line: string | null
}

/**
 * Status chip colours and labels. A builder rather than a const because the
 * label follows the reader; the keys are the stored listing_status values.
 */
function statusStyle(t: DashStrings): Record<string, { bg: string; color: string; label: string }> {
  return {
  active:   { bg: '#dcfce7', color: '#15803d', label: t.statusPublished },
  inactive: { bg: '#f1f5f9', color: '#64748b', label: t.statusDisabled },
  pending:  { bg: '#fef3c7', color: '#92400e', label: t.statusPending },
  expired:  { bg: '#fee2e2', color: '#b91c1c', label: t.expires },
  // Written but not paid for. Invisible to the public, fully editable by the
  // owner, one click from live once a slot is free.
    draft:    { bg: '#e0e7ff', color: '#4338ca', label: t.statusDraft },
  }
}
function daysLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000))
}
function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}


/**
 * The drawer is full-width on a phone, so the form's two-column grids have to
 * collapse. Neither owner form passed isMobile, so they stayed side by side and
 * overflowed on small screens.
 */
function useIsNarrow(breakpoint = 780) {
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const check = () => setNarrow(window.innerWidth < breakpoint)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [breakpoint])
  return narrow
}

// ── Drawer Wrapper ────────────────────────────────────────────────────────────
function Drawer({ title, subtitle, closeLabel, onClose, children }: { title: string; subtitle?: string; closeLabel: string; onClose: () => void; children: React.ReactNode }) {
  const isNarrow = useIsNarrow()
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }} onClick={onClose}>
      <div style={{ flex: 1, background: 'rgba(2,64,46,0.3)', backdropFilter: 'blur(2px)' }} />
      {/* 620px was too narrow for the room-type grid, which has six columns — on a
          wide desktop the form used half the screen while its own table was
          cramped. On a phone it must stay full width: capping at 82vw would leave
          a useless strip of backdrop on a 390px screen. */}
      <div style={{ width: '100%', maxWidth: isNarrow ? '100%' : 'min(1040px, 82vw)', background: '#fff', boxShadow: '-8px 0 40px rgba(2,64,46,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100vh' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: isNarrow ? '18px 16px 14px' : '22px 28px 18px', borderBottom: '1px solid #eef0ef', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#02402e' }}>{title}</h2>
            {subtitle && <p style={{ margin: '3px 0 0', fontSize: 13, color: '#94a3b8' }}>{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} style={{ background: '#fff', border: '1px solid #dcd8ce', borderRadius: 6, fontSize: 13.5, cursor: 'pointer', color: '#231f20', padding: '6px 14px', fontFamily: 'inherit' }}>{closeLabel}</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: isNarrow ? '18px 16px 32px' : '24px 28px', minWidth: 0 }}>{children}</div>
      </div>
    </div>
  )
}

// ── Create Drawer ─────────────────────────────────────────────────────────────
function CreateDrawer({ userId, userEmail, onClose, onCreated, locale }: { userId: string; userEmail: string; onClose: () => void; onCreated: () => void; locale: Locale }) {
  const t = DASH_T[locale]
  const isNarrow = useIsNarrow()
  const [form, setForm]     = useState<FormState>({ ...BLANK })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  function onChange(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }
  function onAmenityToggle(a: string) {
    setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    let validErr = ''
    if (!form.title_th.trim()) {
      validErr = t.needTitle
    } else if (['apartment', 'office', 'coworking'].includes(form.property_type)) {
      if (form.apartment_units.length === 0) validErr = t.needRoomType
    } else if (['condo', 'house'].includes(form.property_type)) {
      if (!form.condo_rental.price_1mo && !form.condo_rental.price_12mo) validErr = t.needPrice
    } else {
      if (!form.price_from) validErr = t.needStartPrice
    }
    if (!validErr && (!form.lat || !form.lng)) validErr = t.needPin
    if (validErr) { setError(validErr); return }

    setSaving(true); setError('')
    try {
      const { data: { session: cSess } } = await createBrowserClient().auth.getSession()
      const extra = prepareSubmitData(form)
      const res = await fetch('/api/owner/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cSess?.access_token}` },
        body: JSON.stringify({
          ...form,
          ...extra,
          slug: '',
          bedrooms:  parseInt(form.bedrooms)  || 1,
          bathrooms: parseInt(form.bathrooms) || 1,
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
        }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || t.failed)
      // Tell them plainly which of the two things just happened. Saving work and
      // silently not publishing it is the worst possible outcome here.
      // The two outcomes are counted separately. This is the whole point of
      // splitting drafts from slots: an abandonment before this event means the
      // FORM lost them; an abandonment after it means the PRICE did.
      trackEvent(d?.published ? 'listing_published' : 'listing_draft_saved', {
        property_type: form.property_type,
        image_count:   (form.images ?? []).length,
        source:        'owner_dashboard',
        had_free_slot: Boolean(d?.published),
      })

      if (d?.published === false || d?.listing?.listing_status === 'draft') {
        alert(t.savedAsDraft)
      }
      onCreated(); onClose()
    } catch (err: any) { setError(err.message || t.error) }
    finally { setSaving(false) }
  }

  return (
    <Drawer title={t.addListing} subtitle={t.publishNow} closeLabel={t.close} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ListingFormFields locale={locale} isMobile={isNarrow} form={form} onChange={onChange} onAmenityToggle={onAmenityToggle} onImagesChange={imgs => setForm(f => ({ ...f, images: imgs }))} />
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', color: '#b91c1c', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}><span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>warning</span>{error}</div>}
        <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{t.cancel}</button>
          <button type="submit" disabled={saving} style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', background: saving ? '#94a3b8' : '#02402e', color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {saving ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />{t.saving}</> : <>{t.publishListing}</>}
          </button>
        </div>
      </form>
    </Drawer>
  )
}

// ── Edit Drawer ───────────────────────────────────────────────────────────────
function EditDrawer({ listing, userId, onClose, onSaved, locale }: { listing: OwnerListing; userId: string; onClose: () => void; onSaved: () => void; locale: Locale }) {
  const t = DASH_T[locale]
  const isNarrow = useIsNarrow()
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  // Parse stored room_types JSONB back into form state
  const rawRts: any[] = listing.room_types ?? []

  const apartmentUnits: ApartmentUnitRow[] = ['apartment', 'office', 'coworking'].includes(listing.property_type)
    ? rawRts
        .filter(r => r._type === 'apt_unit' || (!r._type && r.room_type))
        .map((r, i) => ({
          id: `au-${i}`,
          room_type: r.room_type || 'Studio',
          size_sqm:  String(r.size_sqm ?? ''),
          // Legacy rows stored the headline rate in price_1mo, because the main
          // input wrote to that field. If price_12mo is absent the row predates
          // the change: move the value across and leave the real 1-month
          // contract price empty rather than claiming a rate nobody set.
          price_12mo: String(r.price_12mo ?? r.price_1mo ?? r.price_from ?? ''),
          price_1mo:  String(r.price_12mo ? (r.price_1mo ?? '') : ''),
          price_daily: String(r.price_daily ?? ''),
          available_1mo: r.available_1mo ?? false,
          available_3mo: r.available_3mo ?? false,
          price_3mo: String(r.price_3mo ?? ''),
          available_6mo: r.available_6mo ?? false,
          price_6mo: String(r.price_6mo ?? ''),
        }))
    : []

  const condoRaw = rawRts.find(r => r._type === 'rental_detail')
  const condoRental: CondoRentalDetail = condoRaw ? {
    unit_number:   condoRaw.unit_number  ?? '',
    floor:         String(condoRaw.floor ?? listing.floor ?? ''),
    facing:        condoRaw.facing       ?? '',
    size_sqm:      String(condoRaw.size_sqm ?? listing.area_sqm ?? ''),
    property_name: condoRaw.property_name ?? '',
    // stored on the row, not in the JSONB — see lib/buildings.ts
    property_name_id: String(listing.property_name_id ?? ''),
    price_12mo:    String(condoRaw.price_12mo ?? ''),
    price_6mo:     String(condoRaw.price_6mo  ?? ''),
    price_3mo:     String(condoRaw.price_3mo  ?? ''),
    price_1mo:     String(condoRaw.price_1mo  ?? ''),
  } : { ...BLANK_CONDO }

  const chargesRaw = rawRts.find(r => r._type === 'charges')
  const rentalCharges: RentalCharges = chargesRaw ? {
    water_type:           chargesRaw.water_type         ?? 'ask',
    water_fixed:          String(chargesRaw.water_fixed ?? ''),
    water_min_rate:       String(chargesRaw.water_min_rate ?? ''),
    electricity_type:     chargesRaw.electricity_type   ?? 'ask',
    electricity_fixed:    String(chargesRaw.electricity_fixed ?? ''),
    electricity_min_rate: String(chargesRaw.electricity_min_rate ?? ''),
    security_deposit:     String(chargesRaw.security_deposit ?? '2'),
    advance_deposit:      String(chargesRaw.advance_deposit  ?? '1'),
    key_deposit:          String(chargesRaw.key_deposit ?? ''),
    other_charges:        chargesRaw.other_charges      ?? [],
    other_charges_fees:   chargesRaw.other_charges_fees ?? {},
  } : { ...BLANK_CHARGES }

  const [form, setForm] = useState<FormState>({
    title_th:      listing.title_th,
    title_en:      listing.title_en  ?? '',
    slug:          listing.slug,
    property_type: listing.property_type,
    rental_term:   listing.rental_term   ?? '1_month',
    package_type:  listing.package_type  ?? 'basic',
    price_from:    String(listing.price_from ?? ''),
    price_to:      listing.price_to ? String(listing.price_to) : '',
    room_types:    [],
    apartment_units:  apartmentUnits,
    condo_rental:     condoRental,
    rental_charges:   rentalCharges,
    bedrooms:      String(listing.bedrooms  ?? 1),
    bathrooms:     String(listing.bathrooms ?? 1),
    floor:         listing.floor    ? String(listing.floor)    : '',
    area_sqm:      listing.area_sqm ? String(listing.area_sqm) : '',
    address_th:    listing.address_th    ?? '',
    district:      listing.district      ?? '',
    sub_district:  listing.sub_district  ?? '',
    province:      listing.province      ?? 'กรุงเทพมหานคร',
    postcode:      listing.postcode      ?? '',
    lat:           listing.lat  ? String(listing.lat)  : '',
    lng:           listing.lng  ? String(listing.lng)  : '',
    description_th: listing.description_th ?? '',
    description_en: listing.description_en ?? '',
    amenities:     listing.amenities  ?? [],
    images:        listing.images     ?? [],
    video_url:     listing.video_url  ?? '',
    contact_name:  listing.contact_name  ?? '',
    contact_phone: listing.contact_phone ?? '',
    contact_email: listing.contact_email ?? '',
    contact_line:  listing.contact_line  ?? '',
  })

  function onChange(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }
  function onAmenityToggle(a: string) {
    setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    let validErr = ''
    if (!form.title_th.trim()) {
      validErr = t.needTitle
    } else if (['apartment', 'office', 'coworking'].includes(form.property_type)) {
      if (form.apartment_units.length === 0) validErr = t.needRoomType
    } else if (['condo', 'house'].includes(form.property_type)) {
      if (!form.condo_rental.price_1mo && !form.condo_rental.price_12mo) validErr = t.needPrice
    }
    if (!validErr && (!form.lat || !form.lng)) validErr = t.needPin
    if (validErr) { setError(validErr); return }

    setSaving(true); setError('')
    try {
      const { data: { session: eSess } } = await createBrowserClient().auth.getSession()
      const extra = prepareSubmitData(form)
      const res = await fetch('/api/owner/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${eSess?.access_token}` },
        body: JSON.stringify({
          id: listing.id,
          ...form,
          ...extra,
          bedrooms:  parseInt(form.bedrooms)  || 1,
          bathrooms: parseInt(form.bathrooms) || 1,
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
        }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || t.failed)
      onSaved(); onClose()
    } catch (err: any) { setError(err.message || t.error) }
    finally { setSaving(false) }
  }

  return (
    <Drawer title={t.editListing} subtitle={listing.title_th} closeLabel={t.close} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ListingFormFields locale={locale} isMobile={isNarrow} form={form} onChange={onChange} onAmenityToggle={onAmenityToggle} onImagesChange={imgs => setForm(f => ({ ...f, images: imgs }))} />
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', color: '#b91c1c', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}><span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>warning</span>{error}</div>}
        <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{t.cancel}</button>
          <button type="submit" disabled={saving} style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', background: saving ? '#94a3b8' : '#02402e', color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {saving ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />{t.saving}</> : <>{t.saveChanges}</>}
          </button>
        </div>
      </form>
    </Drawer>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OwnerDashboardBody({ locale = 'th' }: { locale?: Locale }) {
  const t = DASH_T[locale]
  const [listings,           setListings]           = useState<OwnerListing[]>([])
  const [loading,            setLoading]            = useState(true)
  const [userId,             setUserId]             = useState('')
  const [userEmail,          setUserEmail]          = useState('')
  const [activePackage,      setActivePackage]      = useState<string | null>(null)
  const [packageExpiresAt,   setPackageExpiresAt]   = useState<string | null>(null)
  const [subscriptions,      setSubscriptions]      = useState<SubscriptionItem[]>([])
  const [confirmCancelSubId, setConfirmCancelSubId] = useState<string | null>(null)
  const [cancellingSubId,    setCancellingSubId]    = useState<string | null>(null)
  const [cancelError,        setCancelError]        = useState('')
  const [confirmUpgradeSubId, setConfirmUpgradeSubId] = useState<string | null>(null)
  const [selectedUpgradePkg,  setSelectedUpgradePkg]  = useState<string>('')
  const [upgradingSubId,      setUpgradingSubId]      = useState<string | null>(null)
  const [upgradeError,        setUpgradeError]        = useState('')
  const [showCreate,         setShowCreate]         = useState(false)
  const [editTarget,         setEditTarget]         = useState<OwnerListing | null>(null)
  const [statsTarget, setStatsTarget] = useState<OwnerListing | null>(null)
  const [deleting,           setDeleting]           = useState<string | null>(null)
  const [freeSlots,          setFreeSlots]          = useState(0)
  const [publishing,         setPublishing]         = useState<string | null>(null)
  const [publishError,       setPublishError]       = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'expired'>('all')
  const [promo, setPromo] = useState<CheckoutPromo | null>(null)

  // The suggested code card: only an enabled code with a value is offered.
  useEffect(() => {
    fetch('/api/settings/public?key=checkout_promo')
      .then(r => r.ok ? r.json() : null)
      .then(j => { const p = j?.data ? normalisePromo(j.data) : null; setPromo(p?.enabled && p.code ? p : null) })
      .catch(() => {})
  }, [])

  // Still used by the subscriptions panel to show a package held without a
  // Stripe subscription behind it.
  const hasActiveListing = listings.some(l =>
    l.expires_at && new Date(l.expires_at) > new Date() && l.listing_status !== 'expired'
  )

  // hasPackage removed 29 Jul 2026. It inferred entitlement from subscriptions
  // and live listings, which listing_slots now answers exactly. Its last use was
  // gating the empty state's create button — the very wall the slot model exists
  // to remove.

  // Slots are a real table now (listing_slots), counted server-side and returned
  // by /api/owner/listings. This used to be inferred as
  // `activeSubCount > activeListingCount`, which was only ever an approximation
  // — it could not see a slot bought ahead of time or one freed by taking a
  // listing down.
  const canPublishMore = freeSlots > 0

  const load = useCallback(async (_uid?: string) => {
    setLoading(true)
    const { data: { session: lSess } } = await createBrowserClient().auth.getSession()
    const [lr, sr] = await Promise.all([
      fetch('/api/owner/listings',     { headers: { Authorization: `Bearer ${lSess?.access_token}` } }),
      fetch('/api/owner/subscription', { headers: { Authorization: `Bearer ${lSess?.access_token}` } }),
    ])
    const [ld, sd] = await Promise.all([lr.json(), sr.json()])
    setListings(ld.listings ?? [])
    setFreeSlots(ld.free_slots ?? 0)
    setSubscriptions(sd.subscriptions ?? [])
    setLoading(false)
    // ?edit=<id> opens that listing's editor: the "edit listing" link on /checkout.
    const editId = new URLSearchParams(window.location.search).get('edit')
    const toEdit = editId ? (ld.listings ?? []).find((l: OwnerListing) => l.id === editId) : null
    if (toEdit) setEditTarget(toEdit)
  }, [])

  /**
   * Returning from Stripe.
   *
   * This is the conversion event, but it is NOT the source of truth — the
   * webhook is. Someone who pays and closes the tab is a real customer who
   * never fires this, so treat GA4 purchase counts as a floor and reconcile
   * against listing_slots when the numbers matter.
   *
   * transaction_id is the Stripe session id, so refreshing the page cannot
   * count as a second purchase.
   */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const slots = parseInt(q.get('slots') || '0', 10)
    if (!slots) return

    const pkg = q.get('pkg') || 'basic'
    trackEvent('slot_purchased', {
      transaction_id: q.get('sid') || undefined,
      package_id:     pkg,
      quantity:       slots,
      value:          (PACKAGE_PRICE_THB[pkg] ?? 0) * slots,
      currency:       'THB',
    })
    window.history.replaceState({}, '', '/owner-dashboard')
  }, [])

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      setUserId(session.user.id)
      setUserEmail(session.user.email ?? '')
      load()
      // Fetch package status via service-role API
      try {
        const r = await fetch('/api/auth/role', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        const d = await r.json()
        setActivePackage(d.active_package ?? null)
        setPackageExpiresAt(d.package_expires_at ?? null)
        // Fetch all Stripe subscriptions for this owner
        try {
          const sr = await fetch('/api/owner/subscription', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          })
          const sd = await sr.json()
          setSubscriptions(sd.subscriptions ?? [])
        } catch { /* no-op */ }
      } catch { /* no-op */ }
    })
  }, [load])

  async function cancelSubscription(subscriptionId: string) {
    setCancellingSubId(subscriptionId)
    setCancelError('')
    try {
      const { data: { session } } = await createBrowserClient().auth.getSession()
      const r = await fetch('/api/owner/subscription', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ subscription_id: subscriptionId }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error ?? t.cancelFailed)
      // Update only that specific subscription in state — no reload needed
      setSubscriptions(prev => prev.map(s =>
        s.stripe_subscription_id === subscriptionId
          ? { ...s, cancel_at_period_end: true }
          : s
      ))
      setConfirmCancelSubId(null)
    } catch (err: any) {
      setCancelError(err.message ?? t.error)
    } finally {
      setCancellingSubId(null)
    }
  }

  async function upgradeSubscription(subscriptionId: string, newPackageId: string) {
    setUpgradingSubId(subscriptionId)
    setUpgradeError('')
    try {
      const { data: { session } } = await createBrowserClient().auth.getSession()
      const r = await fetch('/api/owner/subscription', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ subscription_id: subscriptionId, new_package_id: newPackageId }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error ?? t.upgradeFailed)
      setSubscriptions(prev => prev.map(s =>
        s.stripe_subscription_id === subscriptionId
          ? { ...s, package_type: newPackageId }
          : s
      ))
      setConfirmUpgradeSubId(null)
      setSelectedUpgradePkg('')
    } catch (err: any) {
      setUpgradeError(err.message ?? t.error)
    } finally {
      setUpgradingSubId(null)
    }
  }

  /** Every purchase goes through /checkout; this builds its link for one listing. */
  function checkoutFor(mode: 'listing' | 'extend', id: string) {
    return `${localeHref('/checkout', locale)}?${mode}=${encodeURIComponent(id)}`
  }

  async function deleteListing(id: string) {
    if (!confirm(t.deleteConfirm)) return
    setDeleting(id)
    const { data: { session: dSess } } = await createBrowserClient().auth.getSession()
    await fetch('/api/owner/listings', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${dSess?.access_token}` }, body: JSON.stringify({ id }) })
    await load()
    setDeleting(null)
  }

  async function publishListing(id: string) {
    setPublishing(id)
    setPublishError('')
    const { data: { session: pSess } } = await createBrowserClient().auth.getSession()
    const res = await fetch('/api/owner/listings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pSess?.access_token}` },
      body: JSON.stringify({ id, publish: true }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      // 402 is the expected, non-exceptional case: the listing is ready and the
      // only thing missing is a slot.
      trackEvent('listing_publish_blocked', { reason: json?.error || 'unknown', source: 'publish_button' })
      setPublishError(json?.message || t.publishFailed)
      setPublishing(null)
      return
    }
    trackEvent('listing_published', { source: 'draft_publish' })
    await load()
    setPublishing(null)
  }

  async function unpublishListing(id: string) {
    if (!confirm(t.unpublishConfirm)) return
    setPublishing(id)
    const { data: { session: uSess } } = await createBrowserClient().auth.getSession()
    await fetch('/api/owner/listings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${uSess?.access_token}` },
      body: JSON.stringify({ id, unpublish: true }),
    })
    trackEvent('listing_unpublished', { source: 'owner_dashboard' })
    await load()
    setPublishing(null)
  }

  const drafts   = listings.filter(l => l.listing_status === 'draft').length
  const active   = listings.filter(l => l.listing_status === 'active').length
  const expired  = listings.filter(l => l.listing_status === 'expired').length
  const views30  = listings.some(l => typeof l.views_30d === 'number')
    ? listings.reduce((n, l) => n + (l.views_30d ?? 0), 0)
    : null
  const soonest  = listings
    .filter(l => l.listing_status === 'active')
    .map(l => ({ l, d: daysLeft(l.expires_at) }))
    .filter((x): x is { l: OwnerListing; d: number } => x.d !== null && x.d > 0 && x.d <= 7)
    .sort((a, b) => a.d - b.d)[0]
  const shown = listings.filter(l => filter === 'all' || l.listing_status === filter)
  /** The Stripe subscription paying for this listing, if there is one. */
  const subFor = (id: string) => subscriptions.find(s => s.listing_ids?.includes(id))

  const TABS: { key: typeof filter; label: string; n: number }[] = [
    { key: 'all', label: t.allListings, n: listings.length },
    { key: 'active', label: t.statusPublished, n: active },
    { key: 'draft', label: t.statusDraft, n: drafts },
    { key: 'expired', label: t.statusExpired, n: expired },
  ]

  return (
    // minWidth:0 stops the wide list forcing the document wider than the viewport.
    <div style={{ minWidth: 0, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {showCreate && userId && (
        <CreateDrawer locale={locale} userId={userId} userEmail={userEmail} onClose={() => setShowCreate(false)} onCreated={() => load()} />
      )}
      {statsTarget && (
        <ListingStatsModal listingId={statsTarget.id} title={statsTarget.title_th} t={t} onClose={() => setStatsTarget(null)} />
      )}
      {editTarget && userId && (
        <EditDrawer locale={locale} listing={editTarget} userId={userId} onClose={() => setEditTarget(null)} onSaved={() => load()} />
      )}

      <div>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: C.green, margin: 0 }}>{t.myListings}</h1>
        <span style={{ fontSize: 13, color: C.muted }}>{userEmail}</span>
      </div>

      {/* Google-registered owners have no phone number; ask once, here. */}
      <PhonePrompt locale={locale} />

      {publishError && (
        <div role="alert" style={{ background: C.amberTint, border: '1px solid #f0d9b5', borderRadius: RADIUS, padding: '12px 18px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ flex: 1, minWidth: 200 }}>{publishError}</span>
          <a href={localeHref('/checkout', locale)} style={PRIMARY_SM}>{t.viewPackages}</a>
          <button type="button" onClick={() => setPublishError('')} style={SECONDARY_SM}>{t.dismiss}</button>
        </div>
      )}

      {/* Numbers */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { label: t.statusPublished, value: active, sub: t.onWebsiteNow },
          { label: t.statusDraft, value: drafts, sub: t.waitingForPackage },
          { label: t.visitors30, value: views30, sub: t.allTogether },
          { label: t.expiringSoon.replace(/\s*\(.*\)$/, ''), value: listings.filter(l => { const d = daysLeft(l.expires_at); return l.listing_status === 'active' && d !== null && d > 0 && d <= 7 }).length, sub: t.within7 },
        ].map(c => (
          <div key={c.label} style={{ ...CARD, flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: 2, padding: '16px 20px' }}>
            <span style={{ fontSize: 13, color: C.muted }}>{c.label}</span>
            <span style={{ fontSize: 26, fontWeight: 600, fontVariantNumeric: 'tabular-nums', lineHeight: 1.3 }}>{c.value ?? '—'}</span>
            <span style={{ fontSize: 12, color: C.muted }}>{c.sub}</span>
          </div>
        ))}
      </div>

      {soonest && (
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: C.amberTint, border: '1px solid #f0d9b5', borderRadius: RADIUS, padding: '12px 18px', fontSize: 14, flexWrap: 'wrap' }}>
          <span style={{ flex: 1, minWidth: 200 }}>{t.expiringBanner(soonest.l.title_th, soonest.d)}</span>
          <a href={checkoutFor('extend', soonest.l.id)} style={PRIMARY_SM}>{t.renew}</a>
        </div>
      )}

      {/* Listings */}
      <section style={{ ...CARD, padding: '6px 22px 12px' }}>
        <div role="tablist" style={{ display: 'flex', gap: 24, borderBottom: `1px solid ${C.line}`, overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button key={tab.key} type="button" role="tab" aria-selected={filter === tab.key} onClick={() => setFilter(tab.key)} style={{
              padding: '12px 0', background: 'none', border: 'none', marginBottom: -1, whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
              borderBottom: `2px solid ${filter === tab.key ? C.green : 'transparent'}`,
              color: filter === tab.key ? C.green : C.muted, fontWeight: filter === tab.key ? 500 : 400,
            }}>
              {tab.label} {tab.n}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ padding: '48px 0', textAlign: 'center', color: C.muted, fontSize: 14, margin: 0 }}>{t.loading}</p>
        ) : listings.length === 0 ? (
          <div style={{ padding: '56px 16px', textAlign: 'center' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: C.green, margin: '0 0 6px' }}>{t.noListings}</h3>
            <p style={{ fontSize: 14, color: C.muted, margin: '0 0 20px' }}>{t.startFirst}</p>
            {/* Always creatable: with no free slot the listing saves as a draft. */}
            <button type="button" onClick={() => setShowCreate(true)} style={{ ...PRIMARY_SM, padding: '10px 20px', fontSize: 14 }}>{t.addListing}</button>
            {!canPublishMore && (
              <p style={{ fontSize: 13, color: C.muted, margin: '14px 0 0' }}>
                {t.noFreeSlotDraft}{' '}
                <a href={localeHref('/checkout', locale)} style={{ color: C.teal }}>{t.buySlots}</a>{' '}{t.whenReady}
              </p>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ minWidth: 860 }}>
              <div style={{ ...OWN_GRID, fontSize: 12, color: C.muted, padding: '12px 0 8px', borderBottom: `1px solid ${C.line}` }}>
                <span /><span>{t.colProperty}</span><span>{t.colStatus}</span><span>{t.colPackage}</span>
                <span style={{ textAlign: 'right' }}>{t.visitors}</span><span />
              </div>
              {shown.map(l => {
                const days    = daysLeft(l.expires_at)
                const soonExp = l.listing_status === 'active' && days !== null && days <= 7 && days > 0
                const sub     = subFor(l.id)
                const subLive = sub && (sub.stripe_status === 'active' || sub.stripe_status === 'trialing')
                const busy    = publishing === l.id
                const hasPkg  = !!l.expires_at && l.listing_status !== 'expired'
                return (
                  <div key={l.id} style={{ ...OWN_GRID, alignItems: 'center', padding: '14px 0', borderBottom: `1px solid ${C.line2}`, fontSize: 14 }}>
                    {(l.images ?? [])[0]
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={l.images![0]} alt="" style={{ width: 72, height: 54, objectFit: 'cover', borderRadius: 4, display: 'block' }} />
                      : <span style={{ width: 72, height: 54, borderRadius: 4, background: C.tint, display: 'block' }} />}
                    <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      {l.listing_status === 'active'
                        ? <a href={`/property/${l.slug}`} target="_blank" rel="noopener noreferrer" title={t.viewListing} style={{ fontWeight: 500, color: C.ink, textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title_th}</a>
                        : <span style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title_th}</span>}
                      <span style={{ fontSize: 13, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {typeLabelFor(l.property_type, locale) ?? l.property_type} · ฿{l.price_from.toLocaleString()}{l.price_to ? `–฿${l.price_to.toLocaleString()}` : ''}
                      </span>
                    </span>
                    <span><StatusChip status={l.listing_status} soon={soonExp} t={t} /></span>
                    <span style={{ display: 'flex', flexDirection: 'column', fontSize: 13, color: C.muted, lineHeight: 1.45, minWidth: 0 }}>
                      {hasPkg
                        ? <span>{t.pkgUntil(pkgLabelFor(l.package_type ?? 'basic', locale) ?? '', fmtDate(l.expires_at))}</span>
                        : l.listing_status === 'expired' && l.expires_at
                          ? <span>{t.pkgUntil(pkgLabelFor(l.package_type ?? 'basic', locale) ?? '', fmtDate(l.expires_at))}</span>
                          : <span>{t.noPackage}</span>}
                      {/* The package belongs to this listing, so its controls live here too. */}
                      {subLive && sub!.cancel_at_period_end && <span style={{ color: C.amber }}>{t.autoRenewOff}</span>}
                      {subLive && !sub!.cancel_at_period_end && (
                        <span style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          {sub!.package_type !== 'premium' && (
                            <button type="button" onClick={() => { setUpgradeError(''); setSelectedUpgradePkg(''); setConfirmUpgradeSubId(sub!.stripe_subscription_id) }} style={LINK_BTN}>{t.upgrade}</button>
                          )}
                          <button type="button" onClick={() => { setCancelError(''); setConfirmCancelSubId(sub!.stripe_subscription_id) }} style={LINK_BTN}>{t.stopAutoRenew}</button>
                        </span>
                      )}
                    </span>
                    <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{l.listing_status === 'draft' ? '—' : l.views_30d ?? '—'}</span>
                    <span style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {l.listing_status === 'draft' && (
                        <button type="button"
                          onClick={() => {
                            if (canPublishMore || l.holds_slot) { publishListing(l.id); return }
                            // The clearest churn signal there is: written, only payment left.
                            trackEvent('listing_publish_blocked', { reason: 'no_slot', source: 'draft_row' })
                            window.location.href = checkoutFor('listing', l.id)
                          }}
                          disabled={busy}
                          title={canPublishMore || l.holds_slot ? t.publishNow : t.noFreeSlot}
                          style={{ ...PRIMARY_SM, opacity: busy ? 0.6 : 1 }}>
                          {busy ? t.saving : canPublishMore || l.holds_slot ? t.publish : t.choosePackagePublish}
                        </button>
                      )}
                      {l.listing_status === 'expired' && (
                        // A free slot republishes it at once; otherwise checkout buys one.
                        <button type="button"
                          onClick={() => { if (canPublishMore) { publishListing(l.id); return } window.location.href = checkoutFor('listing', l.id) }}
                          disabled={busy} style={{ ...PRIMARY_SM, opacity: busy ? 0.6 : 1 }}>
                          {busy ? t.saving : canPublishMore ? t.publish : t.buySlots}
                        </button>
                      )}
                      {l.listing_status === 'active' && soonExp && <a href={checkoutFor('extend', l.id)} style={PRIMARY_SM}>{t.renew}</a>}
                      <button type="button" onClick={() => setEditTarget(l)} style={SECONDARY_SM}>{t.edit}</button>
                      {l.listing_status === 'active' && l.expires_at && !soonExp && <a href={checkoutFor('extend', l.id)} style={SECONDARY_SM}>{t.renew}</a>}
                      {l.listing_status !== 'draft' && (
                        <button type="button" onClick={() => setStatsTarget(l)} style={LINK_BTN}>{t.stats}</button>
                      )}
                      {l.listing_status === 'active' && (
                        <button type="button" onClick={() => unpublishListing(l.id)} disabled={busy} title={t.unpublish} style={LINK_BTN}>{t.takeDown}</button>
                      )}
                      <button type="button" onClick={() => deleteListing(l.id)} disabled={deleting === l.id} style={{ ...LINK_BTN, color: DANGER, opacity: deleting === l.id ? 0.5 : 1 }}>
                        {deleting === l.id ? t.saving : t.delete}
                      </button>
                    </span>
                  </div>
                )
              })}
              {shown.length === 0 && <p style={{ padding: '40px 0', textAlign: 'center', color: C.muted, fontSize: 14, margin: 0 }}>{t.noListings}</p>}
            </div>
          </div>
        )}
      </section>

      {promo && <SuggestedCode promo={promo} locale={locale} t={t} />}

      {/* Per-subscription cancel confirm modal */}
      {confirmCancelSubId && (() => {
        const targetSub   = subscriptions.find(s => s.stripe_subscription_id === confirmCancelSubId)
        const isCancelling = cancellingSubId === confirmCancelSubId
        const pkgLabel    = targetSub?.package_type === 'basic' ? 'Basic' : targetSub?.package_type === 'standard' ? 'Standard' : 'Premium'
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: '28px 28px 24px', maxWidth: 420, width: '100%', boxShadow: '0 20px 60px -10px rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ background: '#fef2f2', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="msym" style={{ fontSize: 20, color: '#dc2626', fontVariationSettings: "'wght' 400, 'FILL' 1" }}>warning</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>{t.confirmCancel}</h3>
              </div>

              {targetSub && (
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', marginBottom: 14, fontSize: 13, color: '#334155' }}>
                  <div style={{ fontWeight: 600 }}>{t.packageNamed(pkgLabel)}</div>
                  {/* Cancelling voids every slot on this subscription, so name
                      them all — not just the first. Cancelling a 3-slot package
                      while three listings are live should not read as one. */}
                  {(targetSub.listing_titles?.length ?? 0) > 0
                    ? (
                      <div style={{ color: '#64748b', marginTop: 2 }}>
                        {t.affectedN(targetSub.listing_titles!.length, targetSub.listing_titles!.join(', '))}
                      </div>
                    )
                    : targetSub.listing_title && (
                      <div style={{ color: '#64748b', marginTop: 2 }}>{t.listingNamed(targetSub.listing_title!)}</div>
                    )
                  }
                  {targetSub.expires_at && (
                    <div style={{ color: '#64748b', marginTop: 2 }}>
                      {t.expiresOn} <strong style={{ color: '#d97f11' }}>{new Date(targetSub.expires_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                    </div>
                  )}
                </div>
              )}

              <p style={{ fontSize: 13.5, color: '#475569', margin: '0 0 20px', lineHeight: 1.6 }}>
                {t.cancelAtPeriodEnd}
              </p>

              {cancelError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px', color: '#b91c1c', fontSize: 13, marginBottom: 16 }}>{cancelError}</div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setConfirmCancelSubId(null); setCancelError('') }} disabled={isCancelling}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {t.back}
                </button>
                <button onClick={() => cancelSubscription(confirmCancelSubId)} disabled={isCancelling}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: isCancelling ? '#94a3b8' : '#dc2626', color: '#fff', fontSize: 14, fontWeight: 700, cursor: isCancelling ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {isCancelling
                    ? <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />{t.cancelling}</>
                    : t.confirmCancelBtn}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Upgrade plan modal */}
      {confirmUpgradeSubId && (() => {
        const targetSub  = subscriptions.find(s => s.stripe_subscription_id === confirmUpgradeSubId)
        const isUpgrading = upgradingSubId === confirmUpgradeSubId
        const currentPkg = targetSub?.package_type ?? 'basic'
        const PKG_ORDER  = ['basic', 'standard', 'premium']
        const currentIdx = PKG_ORDER.indexOf(currentPkg)
        const upgradeOptions = [
          { id: 'standard', label: 'Standard', price: '฿699', period: t.perMonths(3), desc: `${t.uploadUpTo(PACKAGE_IMAGE_LIMITS.standard)} · 22%` },
          { id: 'premium',  label: 'Premium',  price: '฿2,499', period: t.perYear, desc: `${t.uploadUpTo(PACKAGE_IMAGE_LIMITS.premium)} + video · 30%` },
        ].filter(o => PKG_ORDER.indexOf(o.id) > currentIdx)
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: '28px 28px 24px', maxWidth: 440, width: '100%', boxShadow: '0 20px 60px -10px rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{ background: '#eaf6f1', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="msym" style={{ fontSize: 20, color: '#02402e', fontVariationSettings: "'wght' 400, 'FILL' 1" }}>upgrade</span>
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>{t.upgradePackage}</h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0, marginTop: 2 }}>{t.currentlyLabel} <strong>{currentPkg.charAt(0).toUpperCase() + currentPkg.slice(1)}</strong></p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {upgradeOptions.map(opt => (
                  <button key={opt.id} onClick={() => setSelectedUpgradePkg(opt.id)}
                    style={{ textAlign: 'left', background: selectedUpgradePkg === opt.id ? '#eaf6f1' : '#f8fafc', border: selectedUpgradePkg === opt.id ? '2px solid #048c73' : '2px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#02402e' }}>{opt.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#02402e' }}>{opt.price}<span style={{ fontSize: 11, fontWeight: 400, color: '#64748b', marginLeft: 2 }}>{opt.period}</span></span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: 12.5, color: '#92400e', lineHeight: 1.5 }}>
                {t.prorationStripe}
              </div>

              {upgradeError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px', color: '#b91c1c', fontSize: 13, marginBottom: 14 }}>{upgradeError}</div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setConfirmUpgradeSubId(null); setSelectedUpgradePkg(''); setUpgradeError('') }} disabled={isUpgrading}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {t.back}
                </button>
                <button onClick={() => selectedUpgradePkg && upgradeSubscription(confirmUpgradeSubId, selectedUpgradePkg)} disabled={!selectedUpgradePkg || isUpgrading}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: !selectedUpgradePkg || isUpgrading ? '#94a3b8' : '#02402e', color: '#fff', fontSize: 14, fontWeight: 700, cursor: !selectedUpgradePkg || isUpgrading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {isUpgrading
                    ? <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />{t.upgrading}</>
                    : t.confirmUpgrade}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

    </div>
  )
}

// ── Round 7 pieces ────────────────────────────────────────────────────────────
const OWN_GRID: React.CSSProperties = {
  display: 'grid', gap: 16,
  gridTemplateColumns: '72px minmax(0, 1fr) 110px minmax(0, 0.9fr) 80px 320px',
}
const CARD: React.CSSProperties = { background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS }
const DANGER = '#b42318'
const SECONDARY_SM: React.CSSProperties = {
  display: 'inline-block', background: C.white, color: C.ink, border: `1px solid ${C.border}`, padding: '5px 12px',
  borderRadius: RADIUS, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', whiteSpace: 'nowrap',
}
const PRIMARY_SM: React.CSSProperties = { ...SECONDARY_SM, background: C.teal, color: C.white, borderColor: C.teal }
const LINK_BTN: React.CSSProperties = {
  background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, color: C.teal, whiteSpace: 'nowrap', textAlign: 'left',
}

function StatusChip({ status, soon, t }: { status: string; soon: boolean; t: DashStrings }) {
  const [bg, color, label] =
    status === 'active' && soon ? [C.amberTint, C.amber, t.expiringSoon.replace(/\s*\(.*\)$/, '')]
    : status === 'active' ? ['#e6f2ec', C.green, t.statusPublished]
    : status === 'expired' ? ['#fbe9e7', DANGER, t.statusExpired]
    : status === 'pending' ? [C.amberTint, C.amber, t.statusPending]
    : status === 'draft' ? ['#f0eee8', C.muted, t.statusDraft]
    : ['#f0eee8', C.muted, t.statusDisabled]
  return <span style={{ background: bg, color, fontSize: 12, padding: '2px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>{label}</span>
}

/**
 * The promo code switched on in Dashboard › Settings › การชำระเงิน, offered to
 * the owner here. Hidden whenever no code is enabled, so it never advertises a
 * code Stripe would reject.
 */
function SuggestedCode({ promo, locale, t }: { promo: CheckoutPromo; locale: Locale; t: DashStrings }) {
  const [copied, setCopied] = useState(false)
  return (
    <section style={{ ...CARD, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.green }}>{t.suggestedCode}</h2>
      <div style={{ border: '1px dashed #d9b98a', background: '#fbf6ee', borderRadius: RADIUS, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 12, color: C.amber }}>{t.availableNow}</span>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 600, letterSpacing: 1, color: C.amber }}>{promo.code}</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{locale === 'en' ? promo.title_en : promo.title_th}</span>
        </span>
        <span style={{ fontSize: 13, color: C.muted }}>{locale === 'en' ? promo.note_en : promo.note_th}</span>
        <span style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
          <a href={`${localeHref('/checkout', locale)}?promo=${encodeURIComponent(promo.code)}`} style={PRIMARY_SM}>{t.useCodeToBuy}</a>
          <button type="button" aria-live="polite" style={SECONDARY_SM}
            onClick={() => {
              navigator.clipboard?.writeText(promo.code).then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }).catch(() => {})
            }}>
            {copied ? t.copied : t.copyCode}
          </button>
        </span>
      </div>
      <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{t.otherCodeNote}</span>
    </section>
  )
}
