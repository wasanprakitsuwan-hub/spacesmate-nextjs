'use client'

import { useCallback, useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import PhonePrompt from '@/components/auth/PhonePrompt'
import { trackEvent } from '@/lib/analytics'
import { PACKAGE_PRICE_THB, PACKAGE_IMAGE_LIMITS } from '@/lib/packages'
import {
  FormState, ApartmentUnitRow, CondoRentalDetail, RentalCharges,
  BLANK, BLANK_CONDO, BLANK_CHARGES, PKG_LABEL, TYPE_LABEL,
  prepareSubmitData, ListingFormFields,
} from '@/components/listing/SharedListingForm'

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

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  active:   { bg: '#dcfce7', color: '#15803d', label: 'เผยแพร่แล้ว' },
  inactive: { bg: '#f1f5f9', color: '#64748b', label: 'ปิดใช้งาน' },
  pending:  { bg: '#fef3c7', color: '#92400e', label: 'รอตรวจสอบ' },
  expired:  { bg: '#fee2e2', color: '#b91c1c', label: 'หมดอายุ' },
  // Written but not paid for. Invisible to the public, fully editable by the
  // owner, one click from live once a slot is free.
  draft:    { bg: '#e0e7ff', color: '#4338ca', label: 'ฉบับร่าง' },
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
function Drawer({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
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
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94a3b8', lineHeight: 1, padding: '2px 4px' }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: isNarrow ? '18px 16px 32px' : '24px 28px', minWidth: 0 }}>{children}</div>
      </div>
    </div>
  )
}

// ── Create Drawer ─────────────────────────────────────────────────────────────
function CreateDrawer({ userId, userEmail, onClose, onCreated }: { userId: string; userEmail: string; onClose: () => void; onCreated: () => void }) {
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
      validErr = 'กรุณากรอกชื่อประกาศ'
    } else if (['apartment', 'office', 'coworking'].includes(form.property_type)) {
      if (form.apartment_units.length === 0) validErr = 'กรุณาเพิ่มอย่างน้อย 1 ประเภท'
    } else if (['condo', 'house'].includes(form.property_type)) {
      if (!form.condo_rental.price_1mo && !form.condo_rental.price_12mo) validErr = 'กรุณากรอกราคาเช่า'
    } else {
      if (!form.price_from) validErr = 'กรุณากรอกราคาเริ่มต้น'
    }
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
      if (!res.ok) throw new Error(d.error || 'ไม่สำเร็จ')
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
        alert('บันทึกเป็นฉบับร่างแล้ว ✓\n\nประกาศถูกเก็บไว้ครบถ้วน แต่ยังไม่แสดงบนเว็บไซต์ เนื่องจากยังไม่มีสล็อตว่าง\n1 สล็อต = เผยแพร่ได้ 1 ประกาศ — ซื้อสล็อตแล้วกด “เผยแพร่” ได้ทันที ไม่ต้องกรอกใหม่')
      }
      onCreated(); onClose()
    } catch (err: any) { setError(err.message || 'เกิดข้อผิดพลาด') }
    finally { setSaving(false) }
  }

  return (
    <Drawer title="เพิ่มประกาศใหม่" subtitle="ประกาศจะเผยแพร่บนเว็บไซต์ทันที" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ListingFormFields isMobile={isNarrow} form={form} onChange={onChange} onAmenityToggle={onAmenityToggle} onImagesChange={imgs => setForm(f => ({ ...f, images: imgs }))} />
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', color: '#b91c1c', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}><span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>warning</span>{error}</div>}
        <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>ยกเลิก</button>
          <button type="submit" disabled={saving} style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', background: saving ? '#94a3b8' : '#02402e', color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {saving ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />กำลังบันทึก...</> : <><span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>publish</span>เผยแพร่ประกาศ</>}
          </button>
        </div>
      </form>
    </Drawer>
  )
}

// ── Edit Drawer ───────────────────────────────────────────────────────────────
function EditDrawer({ listing, userId, onClose, onSaved }: { listing: OwnerListing; userId: string; onClose: () => void; onSaved: () => void }) {
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
      validErr = 'กรุณากรอกชื่อประกาศ'
    } else if (['apartment', 'office', 'coworking'].includes(form.property_type)) {
      if (form.apartment_units.length === 0) validErr = 'กรุณาเพิ่มอย่างน้อย 1 ประเภท'
    } else if (['condo', 'house'].includes(form.property_type)) {
      if (!form.condo_rental.price_1mo && !form.condo_rental.price_12mo) validErr = 'กรุณากรอกราคาเช่า'
    }
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
      if (!res.ok) throw new Error(d.error || 'ไม่สำเร็จ')
      onSaved(); onClose()
    } catch (err: any) { setError(err.message || 'เกิดข้อผิดพลาด') }
    finally { setSaving(false) }
  }

  return (
    <Drawer title="แก้ไขประกาศ" subtitle={listing.title_th} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ListingFormFields isMobile={isNarrow} form={form} onChange={onChange} onAmenityToggle={onAmenityToggle} onImagesChange={imgs => setForm(f => ({ ...f, images: imgs }))} />
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', color: '#b91c1c', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}><span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>warning</span>{error}</div>}
        <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>ยกเลิก</button>
          <button type="submit" disabled={saving} style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', background: saving ? '#94a3b8' : '#02402e', color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {saving ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />กำลังบันทึก...</> : <><span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>save</span>บันทึกการเปลี่ยนแปลง</>}
          </button>
        </div>
      </form>
    </Drawer>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OwnerDashboardPage() {
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
  const [confirmCancelListingPkgId, setConfirmCancelListingPkgId] = useState<string | null>(null)
  const [cancellingListingPkgId,    setCancellingListingPkgId]    = useState<string | null>(null)
  const [cancelListingPkgError,     setCancelListingPkgError]     = useState('')
  const [renewTarget,        setRenewTarget]        = useState<OwnerListing | null>(null)
  const [renewPkg,           setRenewPkg]           = useState<string>('')
  const [renewing,           setRenewing]           = useState(false)
  const [renewError,         setRenewError]         = useState('')
  const [showCreate,         setShowCreate]         = useState(false)
  const [editTarget,         setEditTarget]         = useState<OwnerListing | null>(null)
  const [deleting,           setDeleting]           = useState<string | null>(null)
  const [freeSlots,          setFreeSlots]          = useState(0)
  const [publishing,         setPublishing]         = useState<string | null>(null)
  const [publishError,       setPublishError]       = useState('')

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
      if (!r.ok) throw new Error(d.error ?? 'ยกเลิกไม่สำเร็จ')
      // Update only that specific subscription in state — no reload needed
      setSubscriptions(prev => prev.map(s =>
        s.stripe_subscription_id === subscriptionId
          ? { ...s, cancel_at_period_end: true }
          : s
      ))
      setConfirmCancelSubId(null)
    } catch (err: any) {
      setCancelError(err.message ?? 'เกิดข้อผิดพลาด')
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
      if (!r.ok) throw new Error(d.error ?? 'อัปเกรดไม่สำเร็จ')
      setSubscriptions(prev => prev.map(s =>
        s.stripe_subscription_id === subscriptionId
          ? { ...s, package_type: newPackageId }
          : s
      ))
      setConfirmUpgradeSubId(null)
      setSelectedUpgradePkg('')
    } catch (err: any) {
      setUpgradeError(err.message ?? 'เกิดข้อผิดพลาด')
    } finally {
      setUpgradingSubId(null)
    }
  }

  /**
   * "Renew" is not a separate concept any more — it is buying a slot and putting
   * this listing back into it. Same purchase, same entitlement, same reusable
   * term as any other slot.
   *
   * publish_property_id tells the webhook to publish this listing automatically
   * once the slot exists, so the owner does not come back from Stripe to a
   * listing that is still down.
   */
  async function renewListing(listingId: string, packageId: string) {
    setRenewing(true)
    setRenewError('')
    try {
      const { data: { session } } = await createBrowserClient().auth.getSession()
      const r = await fetch('/api/stripe/buy-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ package_id: packageId, quantity: 1, publish_property_id: listingId }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error ?? 'เกิดข้อผิดพลาด')
      // Redirect to Stripe checkout
      window.location.href = d.url
    } catch (err: any) {
      setRenewError(err.message ?? 'เกิดข้อผิดพลาด')
      setRenewing(false)
    }
  }

  async function cancelListingPackage(listingId: string) {
    setCancellingListingPkgId(listingId)
    setCancelListingPkgError('')
    try {
      const { data: { session } } = await createBrowserClient().auth.getSession()
      const r = await fetch('/api/owner/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ id: listingId, cancel_package: true }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error ?? 'ยกเลิกไม่สำเร็จ')
      // Update listing state immediately — mark as expired, clear package
      setListings(prev => prev.map(l =>
        l.id === listingId ? { ...l, package_type: null, expires_at: null, listing_status: 'expired' } : l
      ))
      setConfirmCancelListingPkgId(null)
    } catch (err: any) {
      setCancelListingPkgError(err.message ?? 'เกิดข้อผิดพลาด')
    } finally {
      setCancellingListingPkgId(null)
    }
  }

  async function deleteListing(id: string) {
    if (!confirm('ลบประกาศนี้?')) return
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
      setPublishError(json?.message || 'เผยแพร่ไม่สำเร็จ')
      setPublishing(null)
      return
    }
    trackEvent('listing_published', { source: 'draft_publish' })
    await load()
    setPublishing(null)
  }

  async function unpublishListing(id: string) {
    if (!confirm('นำประกาศนี้ลงจากเว็บไซต์?\n\nประกาศจะกลับไปเป็นฉบับร่าง และสล็อตจะว่างพร้อมวันที่เหลือ — ใช้กับประกาศอื่นได้ทันที')) return
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
  const expiring = listings.filter(l => { const d = daysLeft(l.expires_at); return d !== null && d > 0 && d <= 7 }).length

  return (
    // minWidth:0 stops a wide child (the listings table) forcing the whole
    // document wider than the viewport, which is what caused the sideways scroll
    // and the clipped header on mobile.
    <div style={{ minWidth: 0, maxWidth: '100%', overflowX: 'hidden' }}>
      {showCreate && userId && (
        <CreateDrawer userId={userId} userEmail={userEmail} onClose={() => setShowCreate(false)} onCreated={() => load()} />
      )}
      {editTarget && userId && (
        <EditDrawer listing={editTarget} userId={userId} onClose={() => setEditTarget(null)} onSaved={() => load()} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#02402e', margin: '0 0 4px', letterSpacing: '-0.3px' }}>ประกาศของฉัน</h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>{userEmail}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          {/* Always enabled.
              Blocking the button here meant someone who came from an ad hit a
              dead end before ever seeing the form, and we could not tell whether
              they left because of the form or because of the price. Now the
              listing is always writable; only publishing needs a slot. */}
          <button
            onClick={() => setShowCreate(true)}
            style={{
              background: '#02402e', color: '#fff',
              border: 'none', borderRadius: 24, padding: '12px 22px',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7,
              transition: 'all .2s',
            }}
          >
            + เพิ่มประกาศใหม่
          </button>
          {!canPublishMore && (
            <p style={{ fontSize: 12, color: '#d97f11', margin: 0, textAlign: 'right', maxWidth: 260 }}>
              <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 4, verticalAlign: 'middle' }}>info</span>
              {/* Slots, not packages: the wall is capacity, and the listing is
                  never lost — it waits as a draft until one is free. */}
              <>สล็อตใช้งานครบแล้ว — เขียนประกาศเก็บเป็นฉบับร่างได้{' '}
              <a href="/pricing" style={{ color: '#d97f11', fontWeight: 700, textDecoration: 'underline' }}>ซื้อสล็อตเพิ่ม</a>{' '}เพื่อเผยแพร่</>
            </p>
          )}
        </div>
      </div>

      {/* Google-registered owners have no phone number; ask once, here. */}
      <PhonePrompt />

      {publishError && (
        <div style={{ background: '#fdf3e3', border: '1px solid #f3d9ae', color: '#8a5a10', borderRadius: 12, padding: '12px 16px', marginBottom: 18, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="msym" style={{ fontSize: 18, color: '#d97f11', fontVariationSettings: "'wght' 400, 'FILL' 1" }}>info</span>
          <span style={{ flex: 1, minWidth: 0 }}>{publishError}</span>
          <a href="/pricing" style={{ background: '#d97f11', color: '#fff', borderRadius: 8, padding: '7px 14px', fontSize: 12.5, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>ดูแพ็กเกจ</a>
          <button onClick={() => setPublishError('')} style={{ border: 'none', background: 'transparent', color: '#8a5a10', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(108px, 1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'ประกาศทั้งหมด',       value: listings.length, color: '#02402e', bg: '#f0f7f4' },
          { label: 'เผยแพร่อยู่',           value: active,          color: '#048c73', bg: '#eaf6f1' },
          { label: 'ใกล้หมดอายุ (7 วัน)', value: expiring,        color: '#d97f11', bg: '#fdf3e3' },
          ...(drafts > 0 ? [{ label: 'ฉบับร่าง', value: drafts, color: '#4338ca', bg: '#e0e7ff' }] : []),
          { label: 'สล็อตว่าง', value: freeSlots, color: freeSlots > 0 ? '#048c73' : '#94a3b8', bg: '#eaf6f1' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 12px -6px rgba(2,64,46,0.08)' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, letterSpacing: '-1px' }}>{s.value}</div>
            <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* แพ็กเกจของฉัน — always visible */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 16, overflow: 'hidden', marginBottom: 24, boxShadow: '0 2px 12px -6px rgba(2,64,46,0.08)' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #eef0ef', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="msym" style={{ fontSize: 18, color: '#02402e', fontVariationSettings: "'wght' 400, 'FILL' 1" }}>workspace_premium</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#02402e' }}>แพ็กเกจของฉัน</span>
          {subscriptions.length > 0 && (
            <span style={{ fontSize: 12, color: '#94a3b8', background: '#f1f5f9', borderRadius: 10, padding: '2px 8px', marginLeft: 2 }}>
              {subscriptions.filter(s => s.stripe_status === 'active' || s.stripe_status === 'trialing').length} active
            </span>
          )}
        </div>

        {/* State 1: Has Stripe subscriptions */}
        {subscriptions.length > 0 ? subscriptions.map((sub, i) => {
          const pkgLabel  = sub.package_type === 'basic' ? 'Basic' : sub.package_type === 'standard' ? 'Standard' : sub.package_type === 'premium' ? 'Premium' : sub.package_type
          const isActive  = sub.stripe_status === 'active' || sub.stripe_status === 'trialing'
          const isCancelled = sub.cancel_at_period_end
          return (
            <div key={sub.stripe_subscription_id} style={{
              padding: '16px 20px',
              borderBottom: i < subscriptions.length - 1 ? '1px solid #f1f5f4' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 12,
              background: i % 2 === 0 ? '#fff' : '#fafffe',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: isActive ? '#eaf6f1' : '#f1f5f9', borderRadius: 8, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="msym" style={{ fontSize: 18, color: isActive ? '#048c73' : '#94a3b8', fontVariationSettings: "'wght' 400, 'FILL' 1" }}>receipt_long</span>
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#02402e', display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                    แพ็กเกจ {pkgLabel}
                    {isCancelled && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#d97f11', background: '#fdf3e3', borderRadius: 6, padding: '2px 7px' }}>ยกเลิกแล้ว — ใช้งานถึงวันหมดอายุ</span>
                    )}
                    {!isActive && !isCancelled && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#b91c1c', background: '#fee2e2', borderRadius: 6, padding: '2px 7px' }}>{sub.stripe_status}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {/* What this package is actually paying for. A subscription
                        buys N slots; each may or may not hold a listing today. */}
                    {(() => {
                      const total  = sub.slot_count ?? 0
                      const used   = sub.slots_used ?? 0
                      const titles = sub.listing_titles ?? []
                      const icon = (
                        <span className="msym" style={{ fontSize: 13, color: '#94a3b8', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>home</span>
                      )

                      // No slot rows — an older submission-era subscription.
                      if (total === 0) {
                        return sub.listing_title
                          ? <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>{icon}{sub.listing_title}</span>
                          : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>ไม่ระบุประกาศ</span>
                      }

                      // Paid for, nothing published into it yet — actionable, so
                      // say it in amber rather than grey.
                      if (used === 0) {
                        return (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#d97f11' }}>
                            {icon}{total === 1 ? 'ยังไม่ได้ใช้สล็อต' : `ยังไม่ได้ใช้ ${total} สล็อต`}
                          </span>
                        )
                      }

                      return (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          {icon}
                          {titles.join(', ')}
                          {total > 1 && (
                            <span style={{ color: '#94a3b8' }}>&nbsp;— ใช้ {used} จาก {total} สล็อต</span>
                          )}
                        </span>
                      )
                    })()}
                    {sub.expires_at && <span style={{ color: '#94a3b8' }}>·</span>}
                    {sub.expires_at && (
                      <span>{isCancelled ? 'หมดอายุ' : 'ต่ออายุ'}: {new Date(sub.expires_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    )}
                  </div>
                </div>
              </div>
              {isActive && !isCancelled && (
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                  {sub.package_type !== 'premium' && (
                    <button onClick={() => { setUpgradeError(''); setSelectedUpgradePkg(''); setConfirmUpgradeSubId(sub.stripe_subscription_id) }}
                      style={{ background: '#02402e', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>upgrade</span>อัปเกรด
                    </button>
                  )}
                  <button onClick={() => { setCancelError(''); setConfirmCancelSubId(sub.stripe_subscription_id) }}
                    style={{ background: '#fff', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: 10, padding: '8px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 0" }}>cancel</span>ยกเลิก
                  </button>
                </div>
              )}
            </div>
          )
        }) : hasActiveListing ? (
          /* State 2: No Stripe sub but has active listing with package */
          <div style={{ padding: '8px 0' }}>
            {listings.filter(l => l.expires_at && new Date(l.expires_at) > new Date() && l.listing_status !== 'expired').map((l, i, arr) => {
              const days = daysLeft(l.expires_at)
              const soonExp = days !== null && days <= 7 && days > 0
              return (
                <div key={l.id} style={{
                  padding: '16px 20px',
                  borderBottom: i < arr.length - 1 ? '1px solid #f1f5f4' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ background: '#eaf6f1', borderRadius: 8, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="msym" style={{ fontSize: 18, color: '#048c73', fontVariationSettings: "'wght' 400, 'FILL' 1" }}>verified</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: '#02402e', display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                        แพ็กเกจ {PKG_LABEL[l.package_type ?? 'basic'] ?? l.package_type}
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#15803d', background: '#dcfce7', borderRadius: 6, padding: '2px 7px' }}>ใช้งานอยู่</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <span className="msym" style={{ fontSize: 13, color: '#94a3b8', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>home</span>{l.title_th}
                        </span>
                        {l.expires_at && <span style={{ color: '#94a3b8' }}>·</span>}
                        {l.expires_at && (
                          <span style={{ color: soonExp ? '#d97f11' : '#64748b', fontWeight: soonExp ? 700 : 400 }}>
                            หมดอายุ: {fmtDate(l.expires_at)}{soonExp ? ` (เหลือ ${days} วัน)` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                    <a href="/pricing" style={{ background: '#02402e', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
                      <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>upgrade</span>อัปเกรด
                    </a>
                    <button
                      onClick={() => { setCancelListingPkgError(''); setConfirmCancelListingPkgId(l.id) }}
                      style={{ background: '#fff', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: 10, padding: '8px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 0" }}>cancel</span>ยกเลิก
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* State 3: No package at all */
          <div style={{ padding: '32px 20px', textAlign: 'center' }}>
            <span className="msym" style={{ fontSize: 40, color: '#c7d2d0', display: 'block', marginBottom: 10, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>workspace_premium</span>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#475569', margin: '0 0 6px' }}>ยังไม่มีแพ็กเกจที่ใช้งานอยู่</p>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 18px' }}>ซื้อแพ็กเกจเพื่อเริ่มลงประกาศทรัพย์สินของคุณ</p>
            <a href="/pricing" style={{ background: '#d97f11', color: '#fff', borderRadius: 20, padding: '10px 22px', fontSize: 13.5, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>shopping_cart</span>ดูแพ็กเกจ
            </a>
          </div>
        )}
      </div>

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
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>ยืนยันการยกเลิก?</h3>
              </div>

              {targetSub && (
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', marginBottom: 14, fontSize: 13, color: '#334155' }}>
                  <div style={{ fontWeight: 600 }}>แพ็กเกจ {pkgLabel}</div>
                  {/* Cancelling voids every slot on this subscription, so name
                      them all — not just the first. Cancelling a 3-slot package
                      while three listings are live should not read as one. */}
                  {(targetSub.listing_titles?.length ?? 0) > 0
                    ? (
                      <div style={{ color: '#64748b', marginTop: 2 }}>
                        ประกาศที่ได้รับผลกระทบ ({targetSub.listing_titles!.length}): {targetSub.listing_titles!.join(', ')}
                      </div>
                    )
                    : targetSub.listing_title && (
                      <div style={{ color: '#64748b', marginTop: 2 }}>ประกาศ: {targetSub.listing_title}</div>
                    )
                  }
                  {targetSub.expires_at && (
                    <div style={{ color: '#64748b', marginTop: 2 }}>
                      หมดอายุ: <strong style={{ color: '#d97f11' }}>{new Date(targetSub.expires_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                    </div>
                  )}
                </div>
              )}

              <p style={{ fontSize: 13.5, color: '#475569', margin: '0 0 20px', lineHeight: 1.6 }}>
                ประกาศจะยังเผยแพร่ได้จนถึงวันหมดอายุ — ระบบจะไม่เรียกเก็บเงินรอบถัดไป
              </p>

              {cancelError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px', color: '#b91c1c', fontSize: 13, marginBottom: 16 }}>{cancelError}</div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setConfirmCancelSubId(null); setCancelError('') }} disabled={isCancelling}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  กลับ
                </button>
                <button onClick={() => cancelSubscription(confirmCancelSubId)} disabled={isCancelling}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: isCancelling ? '#94a3b8' : '#dc2626', color: '#fff', fontSize: 14, fontWeight: 700, cursor: isCancelling ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {isCancelling
                    ? <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />กำลังยกเลิก...</>
                    : 'ยืนยันยกเลิก'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Renewal modal — package picker for expired listings */}
      {renewTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '28px 28px 24px', maxWidth: 440, width: '100%', boxShadow: '0 20px 60px -10px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ background: '#fdf3e3', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="msym" style={{ fontSize: 20, color: '#d97f11', fontVariationSettings: "'wght' 400, 'FILL' 1" }}>autorenew</span>
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>ซื้อสล็อตเพื่อเผยแพร่อีกครั้ง</h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>{renewTarget.title_th}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {[
                // Image counts come from PACKAGE_IMAGE_LIMITS. These were hardcoded
                // as 5/10/20 and were simply wrong — the system allowed 20 on every
                // tier — so this screen under-sold the product at the moment of purchase.
                { id: 'basic',    label: 'Basic',    price: '฿299',   period: '/ 30 วัน',  desc: `เผยแพร่ได้ 1 เดือน · อัปโหลดรูปสูงสุด ${PACKAGE_IMAGE_LIMITS.basic} ภาพ` },
                { id: 'standard', label: 'Standard', price: '฿699',   period: '/ 3 เดือน', desc: `เผยแพร่ได้ 3 เดือน · อัปโหลดรูปสูงสุด ${PACKAGE_IMAGE_LIMITS.standard} ภาพ · ประหยัด 22%` },
                { id: 'premium',  label: 'Premium',  price: '฿2,499', period: '/ ปี',      desc: `เผยแพร่ได้ 12 เดือน · อัปโหลดรูปสูงสุด ${PACKAGE_IMAGE_LIMITS.premium} ภาพ + วิดีโอ · ประหยัด 30%` },
              ].map(opt => (
                <button key={opt.id} onClick={() => setRenewPkg(opt.id)}
                  style={{ textAlign: 'left', background: renewPkg === opt.id ? '#eaf6f1' : '#f8fafc', border: renewPkg === opt.id ? '2px solid #048c73' : '2px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#02402e' }}>{opt.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#02402e' }}>{opt.price}<span style={{ fontSize: 11, fontWeight: 400, color: '#64748b', marginLeft: 2 }}>{opt.period}</span></span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{opt.desc}</div>
                </button>
              ))}
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: 12.5, color: '#92400e', lineHeight: 1.5 }}>
              ประกาศเดิมจะกลับมาเผยแพร่ทันทีหลังชำระเงิน — ข้อมูลทรัพย์สินทั้งหมดยังอยู่ครบ
            </div>

            {renewError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px', color: '#b91c1c', fontSize: 13, marginBottom: 14 }}>{renewError}</div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setRenewTarget(null); setRenewPkg(''); setRenewError('') }} disabled={renewing}
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                กลับ
              </button>
              <button onClick={() => renewTarget && renewPkg && renewListing(renewTarget.id, renewPkg)} disabled={!renewPkg || renewing}
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: !renewPkg || renewing ? '#94a3b8' : '#d97f11', color: '#fff', fontSize: 14, fontWeight: 700, cursor: !renewPkg || renewing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {renewing
                  ? <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />กำลังโหลด...</>
                  : <><span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>credit_card</span>ไปชำระเงิน</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Listing package cancel confirm modal (State 2 — non-Stripe packages) */}
      {confirmCancelListingPkgId && (() => {
        const targetListing = listings.find(l => l.id === confirmCancelListingPkgId)
        const isCancelling  = cancellingListingPkgId === confirmCancelListingPkgId
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: '28px 28px 24px', maxWidth: 420, width: '100%', boxShadow: '0 20px 60px -10px rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ background: '#fef2f2', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="msym" style={{ fontSize: 20, color: '#dc2626', fontVariationSettings: "'wght' 400, 'FILL' 1" }}>warning</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>ยืนยันการยกเลิกแพ็กเกจ?</h3>
              </div>
              {targetListing && (
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', marginBottom: 14, fontSize: 13, color: '#334155' }}>
                  <div style={{ fontWeight: 600 }}>แพ็กเกจ {PKG_LABEL[targetListing.package_type ?? 'basic'] ?? targetListing.package_type}</div>
                  <div style={{ color: '#64748b', marginTop: 2 }}>ประกาศ: {targetListing.title_th}</div>
                </div>
              )}
              <p style={{ fontSize: 13.5, color: '#475569', margin: '0 0 20px', lineHeight: 1.6 }}>
                ประกาศจะหยุดการเผยแพร่ทันที และแพ็กเกจจะถูกยกเลิก การดำเนินการนี้ไม่สามารถยกเลิกได้
              </p>
              {cancelListingPkgError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px', color: '#b91c1c', fontSize: 13, marginBottom: 16 }}>{cancelListingPkgError}</div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setConfirmCancelListingPkgId(null); setCancelListingPkgError('') }} disabled={isCancelling}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  กลับ
                </button>
                <button onClick={() => cancelListingPackage(confirmCancelListingPkgId)} disabled={isCancelling}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: isCancelling ? '#94a3b8' : '#dc2626', color: '#fff', fontSize: 14, fontWeight: 700, cursor: isCancelling ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {isCancelling
                    ? <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />กำลังยกเลิก...</>
                    : 'ยืนยันยกเลิก'}
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
          { id: 'standard', label: 'Standard', price: '฿699', period: '/ 3 เดือน', desc: `อัปโหลดรูปสูงสุด ${PACKAGE_IMAGE_LIMITS.standard} ภาพ · ประหยัด 22%` },
          { id: 'premium',  label: 'Premium',  price: '฿2,499', period: '/ ปี',   desc: `อัปโหลดรูปสูงสุด ${PACKAGE_IMAGE_LIMITS.premium} ภาพ + วิดีโอ · ประหยัด 30%` },
        ].filter(o => PKG_ORDER.indexOf(o.id) > currentIdx)
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: '28px 28px 24px', maxWidth: 440, width: '100%', boxShadow: '0 20px 60px -10px rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{ background: '#eaf6f1', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="msym" style={{ fontSize: 20, color: '#02402e', fontVariationSettings: "'wght' 400, 'FILL' 1" }}>upgrade</span>
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>อัปเกรดแพ็กเกจ</h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0, marginTop: 2 }}>ปัจจุบัน: <strong>{currentPkg.charAt(0).toUpperCase() + currentPkg.slice(1)}</strong></p>
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
                Stripe จะคิดค่าใช้จ่ายเฉพาะส่วนต่างของวันที่เหลืออยู่ในรอบปัจจุบัน (Proration) ทันทีที่ยืนยัน
              </div>

              {upgradeError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px', color: '#b91c1c', fontSize: 13, marginBottom: 14 }}>{upgradeError}</div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setConfirmUpgradeSubId(null); setSelectedUpgradePkg(''); setUpgradeError('') }} disabled={isUpgrading}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  กลับ
                </button>
                <button onClick={() => selectedUpgradePkg && upgradeSubscription(confirmUpgradeSubId, selectedUpgradePkg)} disabled={!selectedUpgradePkg || isUpgrading}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: !selectedUpgradePkg || isUpgrading ? '#94a3b8' : '#02402e', color: '#fff', fontSize: 14, fontWeight: 700, cursor: !selectedUpgradePkg || isUpgrading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {isUpgrading
                    ? <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />กำลังอัปเกรด...</>
                    : 'ยืนยันอัปเกรด'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Listings table */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 20px -10px rgba(2,64,46,0.08)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #eef0ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#02402e' }}>รายการประกาศ</span>
          {loading && <span style={{ fontSize: 12, color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 4 }}><span className="msym" style={{ fontSize: 13, animation: 'spin .8s linear infinite', display: 'inline-block' }}>sync</span>กำลังโหลด...</span>}
        </div>

        {loading ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ width: 30, height: 30, border: '3px solid #048c73', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: '#94a3b8', fontSize: 14 }}>กำลังโหลด...</p>
          </div>
        ) : listings.length === 0 ? (
          <div style={{ padding: '72px 24px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 12px' }}><span className="msym" style={{ fontSize: 44, color: '#c7d2d0', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>home</span></p>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 8px' }}>ยังไม่มีประกาศ</h3>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px' }}>เริ่มต้นลงประกาศทรัพย์สินแรกของคุณวันนี้</p>
            {/* Always creatable. Writing a listing and buying a slot are two
                separate steps now — gating creation on a package sent a first-time
                owner to the pricing page before they had seen the product, which
                is the same dead end the header button used to have. With no free
                slot the listing simply saves as a draft. */}
            <button onClick={() => setShowCreate(true)} style={{ background: '#02402e', color: '#fff', border: 'none', borderRadius: 24, padding: '13px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              + เพิ่มประกาศใหม่
            </button>
            {!canPublishMore && (
              <p style={{ fontSize: 13, color: '#64748b', margin: '14px 0 0' }}>
                ยังไม่มีสล็อตว่าง — ประกาศจะถูกบันทึกเป็นฉบับร่าง{' '}
                <a href="/pricing" style={{ color: '#d97f11', fontWeight: 700, textDecoration: 'underline' }}>ซื้อสล็อต</a>{' '}เมื่อพร้อมเผยแพร่
              </p>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto', minWidth: 0, maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse', fontSize: 13.5, tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ background: '#f8faf9', borderBottom: '1px solid #eef0ef' }}>
                  {['ทรัพย์สิน', 'ประเภท', 'ราคา', 'แพ็กเกจ', 'หมดอายุ', 'สถานะ', ''].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listings.map((l, i) => {
                  const days    = daysLeft(l.expires_at)
                  const soonExp = days !== null && days <= 7 && days > 0
                  const ss      = STATUS_STYLE[l.listing_status] ?? STATUS_STYLE.pending
                  return (
                    <tr key={l.id} style={{ borderBottom: i < listings.length - 1 ? '1px solid #f1f5f4' : 'none', background: i % 2 === 0 ? '#fff' : '#fafffe' }}>
                      <td style={{ padding: '14px 16px', minWidth: 220 }}>
                        {/* minWidth:0 lets the text shrink; without it a flex item
                            refuses to go below its content width and spills into
                            the next column. */}
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
                          {(l.images ?? [])[0]
                            ? <img src={l.images![0]} alt="" style={{ width: 42, height: 34, objectFit: 'cover', borderRadius: 7, flexShrink: 0 }} />
                            : <div style={{ width: 42, height: 34, borderRadius: 7, background: '#eaf6f1', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="msym" style={{ fontSize: 18, color: '#048c73', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>home</span></div>
                          }
                          <div style={{ minWidth: 0, flex: 1 }}>
                            {/* was maxWidth:200 — wider than the space left after the
                                42px thumbnail and gap, so it overflowed rather than
                                truncating. Now it fits whatever the column allows. */}
                            <div style={{ fontWeight: 600, color: '#02402e', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title_th}</div>
                            {l.district && <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.district}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: 12.5 }}>{TYPE_LABEL[l.property_type] ?? l.property_type}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#02402e' }}>
                        ฿{l.price_from.toLocaleString()}
                        {l.price_to ? `–${l.price_to.toLocaleString()}` : ''}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748b' }}>{PKG_LABEL[l.package_type ?? 'basic'] ?? l.package_type}</td>
                      <td style={{ padding: '14px 16px', fontSize: 12 }}>
                        {l.expires_at ? (
                          <span style={{ color: soonExp ? '#d97f11' : days === 0 ? '#b91c1c' : '#334155', fontWeight: soonExp || days === 0 ? 700 : 400 }}>
                            {fmtDate(l.expires_at)}
                            {soonExp && <span style={{ display: 'block', fontSize: 10, color: '#d97f11' }}>เหลือ {days} วัน</span>}
                            {days === 0 && <span style={{ display: 'block', fontSize: 10, color: '#b91c1c' }}>หมดอายุแล้ว</span>}
                          </span>
                        ) : <span style={{ color: '#94a3b8' }}>ไม่จำกัด</span>}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: ss.bg, color: ss.color, fontWeight: 600 }}>{ss.label}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {l.listing_status === 'draft' ? (
                            <button
                              onClick={() => {
                                // A slot is capacity, not a purchase of this
                                // listing — with none free the answer is to buy
                                // capacity, not to check out against this row.
                                if (canPublishMore) { publishListing(l.id); return }
                                // The clearest churn signal there is: the
                                // listing is written and the only thing left is
                                // to pay.
                                trackEvent('listing_publish_blocked', { reason: 'no_slot', source: 'draft_row' })
                                window.location.href = '/pricing'
                              }}
                              disabled={publishing === l.id}
                              style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: canPublishMore ? '#048c73' : '#d97f11', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, opacity: publishing === l.id ? 0.5 : 1 }}
                              title={canPublishMore ? 'เผยแพร่ประกาศนี้ทันที' : 'ไม่มีสล็อตว่าง — ซื้อสล็อตเพื่อเผยแพร่'}
                            >
                              <span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>{canPublishMore ? 'publish' : 'shopping_cart'}</span>
                              {publishing === l.id ? '…' : canPublishMore ? 'เผยแพร่' : 'ซื้อสล็อต'}
                            </button>
                          ) : l.listing_status === 'expired' ? (
                            // Expired: show Renew button prominently
                            <button
                              onClick={() => { setRenewError(''); setRenewPkg('basic'); setRenewTarget(l) }}
                              style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: '#d97f11', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>autorenew</span>ต่ออายุ
                            </button>
                          ) : (
                            <a href={`/property/${l.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: '5px 9px', borderRadius: 7, background: '#e8f5f0', color: '#048c73', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>↗</a>
                          )}
                          <button onClick={() => setEditTarget(l)} style={{ padding: '5px 9px', borderRadius: 7, border: '1px solid #c7d2d0', background: '#fff', color: '#334155', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}><span className="msym" style={{ fontSize: 14 }}>edit</span></button>
                          {l.listing_status === 'active' && (
                            <button onClick={() => unpublishListing(l.id)} disabled={publishing === l.id}
                              title="นำประกาศลง — สล็อตจะว่างและใช้กับประกาศอื่นได้ตามวันที่เหลือ"
                              style={{ padding: '5px 9px', borderRadius: 7, border: '1px solid #c7d2d0', background: '#fff', color: '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                              <span className="msym" style={{ fontSize: 14 }}>visibility_off</span>
                            </button>
                          )}
                          <button onClick={() => deleteListing(l.id)} disabled={deleting === l.id} style={{ padding: '5px 9px', borderRadius: 7, border: '1px solid #fca5a5', background: '#fff', color: '#b91c1c', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: deleting === l.id ? 0.5 : 1 }}>
                            {deleting === l.id ? '…' : 'ลบ'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
