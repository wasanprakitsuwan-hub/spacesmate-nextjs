'use client'

import { useCallback, useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
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
}

interface OwnerListing {
  id: string
  slug: string
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
  amenities: string[] | null
  room_types: any[] | null
  lat: number | null
  lng: number | null
  video_url: string | null
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  active:   { bg: '#dcfce7', color: '#15803d', label: 'เผยแพร่แล้ว' },
  inactive: { bg: '#f1f5f9', color: '#64748b', label: 'ปิดใช้งาน' },
  pending:  { bg: '#fef3c7', color: '#92400e', label: 'รอตรวจสอบ' },
  expired:  { bg: '#fee2e2', color: '#b91c1c', label: 'หมดอายุ' },
}
function daysLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000))
}
function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}


// ── Drawer Wrapper ────────────────────────────────────────────────────────────
function Drawer({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }} onClick={onClose}>
      <div style={{ flex: 1, background: 'rgba(2,64,46,0.3)', backdropFilter: 'blur(2px)' }} />
      <div style={{ width: '100%', maxWidth: 620, background: '#fff', boxShadow: '-8px 0 40px rgba(2,64,46,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100vh' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '22px 28px 18px', borderBottom: '1px solid #eef0ef', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#02402e' }}>{title}</h2>
            {subtitle && <p style={{ margin: '3px 0 0', fontSize: 13, color: '#94a3b8' }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94a3b8', lineHeight: 1, padding: '2px 4px' }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>{children}</div>
      </div>
    </div>
  )
}

// ── Create Drawer ─────────────────────────────────────────────────────────────
function CreateDrawer({ userId, userEmail, onClose, onCreated }: { userId: string; userEmail: string; onClose: () => void; onCreated: () => void }) {
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
      onCreated(); onClose()
    } catch (err: any) { setError(err.message || 'เกิดข้อผิดพลาด') }
    finally { setSaving(false) }
  }

  return (
    <Drawer title="เพิ่มประกาศใหม่" subtitle="ประกาศจะเผยแพร่บนเว็บไซต์ทันที" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ListingFormFields form={form} onChange={onChange} onAmenityToggle={onAmenityToggle} onImagesChange={imgs => setForm(f => ({ ...f, images: imgs }))} />
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
          price_1mo: String(r.price_1mo ?? r.price_from ?? ''),
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
    description_en: (listing as any).description_en ?? '',
    amenities:     listing.amenities  ?? [],
    images:        listing.images     ?? [],
    video_url:     listing.video_url  ?? '',
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
        <ListingFormFields form={form} onChange={onChange} onAmenityToggle={onAmenityToggle} onImagesChange={imgs => setForm(f => ({ ...f, images: imgs }))} />
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
  const [showCreate,         setShowCreate]         = useState(false)
  const [editTarget,         setEditTarget]         = useState<OwnerListing | null>(null)
  const [deleting,           setDeleting]           = useState<string | null>(null)

  // Derived: user has a valid active package
  const hasPackage =
    subscriptions.some(s => s.stripe_status === 'active' || s.stripe_status === 'trialing') ||
    (activePackage !== null && (packageExpiresAt === null || new Date(packageExpiresAt) > new Date()))

  const load = useCallback(async (_uid?: string) => {
    setLoading(true)
    const { data: { session: lSess } } = await createBrowserClient().auth.getSession()
    const r = await fetch('/api/owner/listings', {
      headers: { Authorization: `Bearer ${lSess?.access_token}` },
    })
    const d = await r.json()
    setListings(d.listings ?? [])
    setLoading(false)
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

  async function deleteListing(id: string) {
    if (!confirm('ลบประกาศนี้?')) return
    setDeleting(id)
    const { data: { session: dSess } } = await createBrowserClient().auth.getSession()
    await fetch('/api/owner/listings', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${dSess?.access_token}` }, body: JSON.stringify({ id }) })
    await load()
    setDeleting(null)
  }

  const active   = listings.filter(l => l.listing_status === 'active').length
  const expiring = listings.filter(l => { const d = daysLeft(l.expires_at); return d !== null && d > 0 && d <= 7 }).length

  return (
    <div>
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
          <button
            onClick={() => hasPackage && setShowCreate(true)}
            style={{
              background: hasPackage ? '#02402e' : '#e2e8f0',
              color: hasPackage ? '#fff' : '#94a3b8',
              border: 'none', borderRadius: 24, padding: '12px 22px',
              fontSize: 14, fontWeight: 700,
              cursor: hasPackage ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7,
              transition: 'all .2s',
            }}
            title={!hasPackage ? 'กรุณาซื้อแพ็กเกจก่อนเพื่อลงประกาศ' : undefined}
          >
            + เพิ่มประกาศใหม่
          </button>
          {!hasPackage && (
            <p style={{ fontSize: 12, color: '#d97f11', margin: 0, textAlign: 'right' }}>
              <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 4, verticalAlign: 'middle' }}>warning</span>กรุณา{' '}
              <a href="/pricing" style={{ color: '#d97f11', fontWeight: 700, textDecoration: 'underline' }}>ซื้อแพ็กเกจ</a>
              {' '}ก่อนเพื่อลงประกาศ
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'ประกาศทั้งหมด',       value: listings.length, color: '#02402e', bg: '#f0f7f4' },
          { label: 'เผยแพร่อยู่',           value: active,          color: '#048c73', bg: '#eaf6f1' },
          { label: 'ใกล้หมดอายุ (7 วัน)', value: expiring,        color: '#d97f11', bg: '#fdf3e3' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 12px -6px rgba(2,64,46,0.08)' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, letterSpacing: '-1px' }}>{s.value}</div>
            <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Subscriptions section — one row per subscription */}
      {subscriptions.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 16, overflow: 'hidden', marginBottom: 24, boxShadow: '0 2px 12px -6px rgba(2,64,46,0.08)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #eef0ef', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="msym" style={{ fontSize: 18, color: '#02402e', fontVariationSettings: "'wght' 400, 'FILL' 1" }}>workspace_premium</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#02402e' }}>Subscriptions ของฉัน</span>
            <span style={{ fontSize: 12, color: '#94a3b8', background: '#f1f5f9', borderRadius: 10, padding: '2px 8px', marginLeft: 2 }}>
              {subscriptions.filter(s => s.stripe_status === 'active' || s.stripe_status === 'trialing').length} active
            </span>
          </div>

          {subscriptions.map((sub, i) => {
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
                      {sub.listing_title
                        ? <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span className="msym" style={{ fontSize: 13, color: '#94a3b8', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>home</span>{sub.listing_title}</span>
                        : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>ไม่ระบุประกาศ</span>
                      }
                      {sub.expires_at && (
                        <span style={{ color: '#94a3b8' }}>·</span>
                      )}
                      {sub.expires_at && (
                        <span>{isCancelled ? 'หมดอายุ' : 'ต่ออายุ'}: {new Date(sub.expires_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      )}
                    </div>
                  </div>
                </div>

                {isActive && !isCancelled && (
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                    {sub.package_type !== 'premium' && (
                      <button
                        onClick={() => { setUpgradeError(''); setSelectedUpgradePkg(''); setConfirmUpgradeSubId(sub.stripe_subscription_id) }}
                        style={{ background: '#02402e', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}
                      >
                        <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>upgrade</span>
                        อัปเกรด
                      </button>
                    )}
                    <button
                      onClick={() => { setCancelError(''); setConfirmCancelSubId(sub.stripe_subscription_id) }}
                      style={{ background: '#fff', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: 10, padding: '8px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                      <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 0" }}>cancel</span>
                      ยกเลิก
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

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
                  {targetSub.listing_title && <div style={{ color: '#64748b', marginTop: 2 }}>ประกาศ: {targetSub.listing_title}</div>}
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

      {/* Upgrade plan modal */}
      {confirmUpgradeSubId && (() => {
        const targetSub  = subscriptions.find(s => s.stripe_subscription_id === confirmUpgradeSubId)
        const isUpgrading = upgradingSubId === confirmUpgradeSubId
        const currentPkg = targetSub?.package_type ?? 'basic'
        const PKG_ORDER  = ['basic', 'standard', 'premium']
        const currentIdx = PKG_ORDER.indexOf(currentPkg)
        const upgradeOptions = [
          { id: 'standard', label: 'Standard', price: '฿699', period: '/ 3 เดือน', desc: 'อัปโหลดรูปสูงสุด 10 ภาพ · ประหยัด 22%' },
          { id: 'premium',  label: 'Premium',  price: '฿2,499', period: '/ ปี',   desc: 'อัปโหลดรูปสูงสุด 20 ภาพ + วิดีโอ · ประหยัด 30%' },
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
            {hasPackage ? (
              <button onClick={() => setShowCreate(true)} style={{ background: '#02402e', color: '#fff', border: 'none', borderRadius: 24, padding: '13px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                + เพิ่มประกาศใหม่
              </button>
            ) : (
              <div>
                <p style={{ fontSize: 13.5, color: '#d97f11', margin: '0 0 14px', fontWeight: 500 }}>คุณยังไม่มีแพ็กเกจที่ใช้งานอยู่</p>
                <a href="/pricing" style={{ background: '#d97f11', color: '#fff', border: 'none', borderRadius: 24, padding: '13px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>shopping_cart</span>ดูแพ็กเกจ
                </a>
              </div>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
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
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          {(l.images ?? [])[0]
                            ? <img src={l.images![0]} alt="" style={{ width: 42, height: 34, objectFit: 'cover', borderRadius: 7, flexShrink: 0 }} />
                            : <div style={{ width: 42, height: 34, borderRadius: 7, background: '#eaf6f1', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="msym" style={{ fontSize: 18, color: '#048c73', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>home</span></div>
                          }
                          <div>
                            <div style={{ fontWeight: 600, color: '#02402e', fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title_th}</div>
                            {l.district && <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 1 }}>{l.district}</div>}
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
                        <div style={{ display: 'flex', gap: 5 }}>
                          <a href={`/property/${l.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: '5px 9px', borderRadius: 7, background: '#e8f5f0', color: '#048c73', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>↗</a>
                          <button onClick={() => setEditTarget(l)} style={{ padding: '5px 9px', borderRadius: 7, border: '1px solid #c7d2d0', background: '#fff', color: '#334155', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}><span className="msym" style={{ fontSize: 14 }}>edit</span></button>
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
