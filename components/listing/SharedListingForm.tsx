'use client'

import { roomTypeOptions, type Locale } from '@/lib/room-types'
import { WIZARD_T, type WizardStrings } from '@/lib/wizard-i18n'
import { districtLabel, provinceLabel } from '@/lib/geo-i18n'

import { useEffect, useRef, useState } from 'react'
import { ADMIN_PACKAGES, computeExpiry, MAX_IMAGES_ANY_PACKAGE, visibleImageCount } from '@/lib/packages'
import { AMENITY_SECTIONS, DEFAULT_AMENITIES, bySection, fetchAmenities, type Amenity } from '@/lib/amenities'
import BuildingAutocomplete from '@/components/listing/BuildingAutocomplete'
import { createBrowserClient } from '@/lib/supabase'
import RichEditor from '@/components/RichEditor'

// ── Types ──────────────────────────────────────────────────────────────────────
export interface RoomTypeRow {
  id: string; room_type: string; price_from: string; price_to: string
}

export interface ApartmentUnitRow {
  id: string
  room_type: string
  size_sqm: string
  /**
   * Contract length, all paid monthly — matching CondoRentalDetail.
   *   price_12mo  headline rate, 12-month contract
   *   price_1mo   1-month contract
   *   price_3mo   3-month contract
   *   price_6mo   6-month contract
   *
   * The main input used to write price_1mo, so the "1 เดือน" tick had nothing of
   * its own to edit and simply echoed the headline rate back.
   */
  price_12mo: string
  price_1mo: string
  price_daily: string
  available_1mo: boolean
  available_3mo: boolean; price_3mo: string
  available_6mo: boolean; price_6mo: string
}

export interface CondoRentalDetail {
  unit_number: string; floor: string; facing: string; size_sqm: string
  // property_name is the text the owner sees; property_name_id is the reference
  // that actually links this listing to a building page. The text is kept so the
  // form can display something before a match is chosen.
  property_name: string
  property_name_id: string
  price_12mo: string; price_6mo: string; price_3mo: string; price_1mo: string
}

// 'gov' = ตามเรทรัฐ. Stored as an enum, never as a copied number — MEA and MWA
// tariffs change, and a hardcoded figure would go stale silently.
export type RateType = 'fixed' | 'min_rate' | 'gov' | 'ask'
export interface RentalCharges {
  water_type: RateType; water_fixed: string; water_min_rate: string
  electricity_type: RateType; electricity_fixed: string; electricity_min_rate: string
  security_deposit: string; advance_deposit: string
  key_deposit: string           // fixed baht amount, optional — rendered as ค่ากุญแจ
  other_charges: string[]; other_charges_fees: Record<string, string>
}

export interface FormState {
  title_th: string; title_en: string; slug: string
  property_type: string; rental_term: string; package_type: string
  price_from: string; price_to: string
  room_types: RoomTypeRow[]
  apartment_units: ApartmentUnitRow[]
  condo_rental: CondoRentalDetail
  rental_charges: RentalCharges
  bedrooms: string; bathrooms: string; floor: string; area_sqm: string
  address_th: string; district: string; sub_district: string
  province: string; postcode: string
  lat: string; lng: string
  description_th: string
  description_en: string
  amenities: string[]
  images: string[]
  video_url: string
  // Contact fields
  contact_name: string
  contact_phone: string
  contact_email: string
  contact_line: string
}

// ── Constants ──────────────────────────────────────────────────────────────────
export const BLANK_CONDO: CondoRentalDetail = {
  unit_number: '', floor: '', facing: '', size_sqm: '',
  property_name: '', property_name_id: '', price_12mo: '', price_6mo: '', price_3mo: '', price_1mo: '',
}
export const BLANK_CHARGES: RentalCharges = {
  water_type: 'ask', water_fixed: '', water_min_rate: '',
  electricity_type: 'ask', electricity_fixed: '', electricity_min_rate: '',
  security_deposit: '2', advance_deposit: '1', key_deposit: '',
  other_charges: [], other_charges_fees: {},
}
export const BLANK: FormState = {
  title_th: '', title_en: '', slug: '',
  property_type: 'condo', rental_term: '1_month', package_type: 'basic',
  price_from: '', price_to: '',
  room_types: [], apartment_units: [],
  condo_rental: { ...BLANK_CONDO },
  rental_charges: { ...BLANK_CHARGES },
  bedrooms: '1', bathrooms: '1', floor: '', area_sqm: '',
  address_th: '', district: '', sub_district: '',
  province: 'กรุงเทพมหานคร', postcode: '',
  lat: '', lng: '',
  description_th: '', description_en: '', amenities: [], images: [], video_url: '',
  contact_name: '', contact_phone: '', contact_email: '', contact_line: '',
}

export const FACING_OPTIONS = [
  { value: 'N',  label: 'ทิศเหนือ (N)' },
  { value: 'S',  label: 'ทิศใต้ (S)' },
  { value: 'E',  label: 'ทิศตะวันออก (E)' },
  { value: 'W',  label: 'ทิศตะวันตก (W)' },
  { value: 'NE', label: 'ทิศตะวันออกเฉียงเหนือ (NE)' },
  { value: 'NW', label: 'ทิศตะวันตกเฉียงเหนือ (NW)' },
  { value: 'SE', label: 'ทิศตะวันออกเฉียงใต้ (SE)' },
  { value: 'SW', label: 'ทิศตะวันตกเฉียงใต้ (SW)' },
]
export const OTHER_CHARGES_OPTIONS = [
  // Amount is captured per selected charge in other_charges_fees.
  { value: 'common_fee', label: 'ค่าส่วนกลาง' },
  { value: 'parking',   label: 'ค่าจอดรถ' },
  { value: 'internet',  label: 'ค่าอินเทอร์เน็ต' },
  { value: 'fridge',    label: 'ค่าเช่าตู้เย็น' },
  { value: 'tv',        label: 'ค่าเช่าโทรทัศน์' },
  { value: 'microwave', label: 'ค่าเช่าไมโครเวฟ' },
]
export const TYPE_LABEL: Record<string, string> = {
  condo: 'คอนโด', apartment: 'อพาร์ทเม้นท์', house: 'บ้าน', office: 'ออฟฟิศ', coworking: 'โคเวิร์ก',
}
export const PKG_LABEL: Record<string, string> = {
  basic: 'Basic (30 วัน)', standard: 'Standard (90 วัน)', premium: 'Premium (365 วัน)', admin: 'Admin',
}

/**
 * The three constants above stay Thai because they are imported by the Thai-only
 * owner dashboard and admin screens. The locale-aware builders below are what the
 * form itself uses.
 *
 * In every case the `value` is unchanged between locales — it is what gets stored.
 * Only the label follows the reader. See the header of lib/wizard-i18n.
 */
export function facingOptions(t: WizardStrings) {
  return [
    { value: 'N',  label: t.facingN },
    { value: 'S',  label: t.facingS },
    { value: 'E',  label: t.facingE },
    { value: 'W',  label: t.facingW },
    { value: 'NE', label: t.facingNE },
    { value: 'NW', label: t.facingNW },
    { value: 'SE', label: t.facingSE },
    { value: 'SW', label: t.facingSW },
  ]
}
/**
 * Package and property-type labels for the reader.
 *
 * These were written, removed as unused, and are back because the owner
 * dashboard needs them: it renders PKG_LABEL and TYPE_LABEL in its listing
 * table, and those two consts are Thai-only by design (the admin screens use
 * them). The `id` is what is stored; only the label follows the reader.
 */
export function typeLabelFor(propertyType: string, locale: Locale): string {
  const t = WIZARD_T[locale]
  return ({
    condo: t.typeCondo, apartment: t.typeApartment, house: t.typeHouse,
    office: t.typeOffice, coworking: 'Co-Working',
  } as Record<string, string>)[propertyType] ?? propertyType
}

export function pkgLabelFor(packageId: string, locale: Locale): string {
  if (locale !== 'en') return PKG_LABEL[packageId] ?? packageId
  return ({
    basic: 'Basic (30 days)', standard: 'Standard (90 days)',
    premium: 'Premium (365 days)', admin: 'Admin',
  } as Record<string, string>)[packageId] ?? packageId
}

export function otherChargesOptions(t: WizardStrings) {
  return [
    { value: 'common_fee', label: t.commonFee },
    { value: 'parking',    label: t.parking },
    { value: 'internet',   label: t.internet },
    { value: 'fridge',     label: t.fridge },
    { value: 'tv',         label: t.tv },
    { value: 'microwave',  label: t.microwave },
  ]
}

// ── Shared styles ──────────────────────────────────────────────────────────────
export const SINP: React.CSSProperties = {
  width: '100%', padding: '9px 13px', borderRadius: 10,
  border: '1px solid #eef0ef', fontSize: 13.5, outline: 'none',
  boxSizing: 'border-box' as const, background: '#fff',
}
export const SLBL: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 5, display: 'block',
}

// ── Helpers ────────────────────────────────────────────────────────────────────
/**
 * Room-type options for a property type, as {value, label}.
 *
 * This used to return bare strings, which the form then stored verbatim — so
 * the database held whatever language the owner happened to be using, and the
 * public property page rendered it raw to everyone. See lib/room-types.
 */
export function getRoomTypeOptions(propType: string, locale: Locale = 'th') {
  return roomTypeOptions(propType, locale)
}

export function prepareSubmitData(form: FormState) {
  let price_from = parseInt(form.price_from) || 0
  let price_to: number | null = form.price_to ? parseInt(form.price_to) : null
  let room_types: any[] = form.room_types
  let floor: number | null = form.floor ? parseInt(form.floor) : null
  let area_sqm: number | null = form.area_sqm ? parseFloat(form.area_sqm) : null
  let property_name_id: string | null = null

  if (['apartment', 'office', 'coworking'].includes(form.property_type)) {
    // Every contract length counts — the headline range should reflect the
    // cheapest and dearest a tenant could actually pay, not just one term.
    const prices = form.apartment_units
      .flatMap(u => [u.price_12mo, u.price_1mo, u.price_3mo, u.price_6mo])
      .map(v => parseFloat(v) || 0)
      .filter(n => n > 0)
    price_from = prices.length > 0 ? Math.min(...prices) : 0
    price_to   = prices.length > 1 ? Math.max(...prices) : (prices[0] ?? null)
    // Charges are persisted for every type. This previously applied to apartments
    // only, so deposits entered for office and co-working were silently discarded.
    room_types = [
      { _type: 'charges', ...form.rental_charges },
      ...form.apartment_units.map(({ id: _id, ...u }) => ({ _type: 'apt_unit', ...u })),
    ]
  } else if (['condo', 'house'].includes(form.property_type)) {
    const r = form.condo_rental
    price_from = parseFloat(r.price_12mo || r.price_1mo || '0') || 0
    price_to   = r.price_1mo ? parseFloat(r.price_1mo) : null
    room_types = [
      { _type: 'charges', ...form.rental_charges },
      { _type: 'rental_detail', ...r },
    ]
    floor      = r.floor ? parseInt(r.floor) : null
    area_sqm   = r.size_sqm ? parseFloat(r.size_sqm) : null
    property_name_id = r.property_name_id || null
  }

  return {
    price_from, price_to, room_types, floor, area_sqm, property_name_id,
    contact_name:  form.contact_name  || null,
    contact_phone: form.contact_phone || null,
    contact_email: form.contact_email || null,
    contact_line:  form.contact_line  || null,
  }
}

// ── Section Header ─────────────────────────────────────────────────────────────
export function SectionHead({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#048c73', letterSpacing: 1.2, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{text}</span>
      <div style={{ flex: 1, height: 1, background: '#eef0ef' }} />
    </div>
  )
}

// ── Apartment Unit Grid ────────────────────────────────────────────────────────
export function ApartmentUnitGrid({ rows, onChange, roomTypeOptions, locale = 'th' }: {
  rows: ApartmentUnitRow[]; onChange: (rows: ApartmentUnitRow[]) => void
  roomTypeOptions: { value: string; label: string }[]; locale?: Locale
}) {
  const t = WIZARD_T[locale]
  function addRow() {
    onChange([...rows, {
      id: `au-${Date.now()}`, room_type: roomTypeOptions[0]?.value ?? 'studio',
      size_sqm: '', price_12mo: '', price_1mo: '', price_daily: '',
      available_1mo: false, available_3mo: false, price_3mo: '',
      available_6mo: false, price_6mo: '',
    }])
  }
  function removeRow(id: string) { onChange(rows.filter(r => r.id !== id)) }
  function upd(id: string, field: keyof ApartmentUnitRow, val: any) {
    onChange(rows.map(r => r.id === id ? { ...r, [field]: val } : r))
  }

  return (
    <div>
      {rows.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.7fr 0.9fr 0.9fr 28px', gap: 6, marginBottom: 6, paddingLeft: 2 }}>
            {[t.colRoomType, t.colSize, t.col12m, t.colDaily, ''].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>{h}</div>
            ))}
          </div>
          {rows.map(row => (
            <div key={row.id} style={{ background: '#fafffe', border: '1px solid #eef0ef', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.7fr 0.9fr 0.9fr 28px', gap: 6, alignItems: 'center', marginBottom: 10 }}>
                <select value={row.room_type} onChange={e => upd(row.id, 'room_type', e.target.value)} style={{ ...SINP, padding: '7px 10px' }}>
                  {roomTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <input type="number" value={row.size_sqm} onChange={e => upd(row.id, 'size_sqm', e.target.value)} placeholder="28" style={{ ...SINP, padding: '7px 10px' }} />
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12.5, color: '#94a3b8', pointerEvents: 'none' }}>฿</span>
                  <input type="number" value={row.price_12mo} onChange={e => upd(row.id, 'price_12mo', e.target.value)} placeholder="7,000" style={{ ...SINP, padding: '7px 10px 7px 22px' }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12.5, color: '#94a3b8', pointerEvents: 'none' }}>฿</span>
                  <input type="number" value={row.price_daily} onChange={e => upd(row.id, 'price_daily', e.target.value)} placeholder="900" style={{ ...SINP, padding: '7px 10px 7px 22px' }} />
                </div>
                <button type="button" onClick={() => removeRow(row.id)} style={{ height: 28, padding: '0 10px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fff', color: '#b91c1c', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{t.remove}</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', paddingLeft: 2, borderTop: '1px dashed #eef0ef', paddingTop: 8 }}>
                <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0 }}>{t.shorterTerms}</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                  <input type="checkbox" checked={row.available_1mo} onChange={e => upd(row.id, 'available_1mo', e.target.checked)} style={{ width: 14, height: 14, accentColor: '#048c73' }} />
                  <span style={{ fontSize: 12, color: '#334155' }}>{t.monthN(1)}</span>
                </label>
                {row.available_1mo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>฿</span>
                    <input type="number" value={row.price_1mo} onChange={e => upd(row.id, 'price_1mo', e.target.value)}
                      placeholder="8,000" style={{ ...SINP, padding: '5px 8px', width: 90, fontSize: 12.5 }} />
                  </div>
                )}
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                  <input type="checkbox" checked={row.available_3mo} onChange={e => upd(row.id, 'available_3mo', e.target.checked)} style={{ width: 14, height: 14, accentColor: '#048c73' }} />
                  <span style={{ fontSize: 12, color: '#334155' }}>{t.monthN(3)}</span>
                </label>
                {row.available_3mo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>฿</span>
                    <input type="number" value={row.price_3mo} onChange={e => upd(row.id, 'price_3mo', e.target.value)} placeholder="7,500" style={{ ...SINP, padding: '5px 8px', width: 90, fontSize: 12.5 }} />
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{t.perMonth}</span>
                  </div>
                )}
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                  <input type="checkbox" checked={row.available_6mo} onChange={e => upd(row.id, 'available_6mo', e.target.checked)} style={{ width: 14, height: 14, accentColor: '#048c73' }} />
                  <span style={{ fontSize: 12, color: '#334155' }}>{t.monthN(6)}</span>
                </label>
                {row.available_6mo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>฿</span>
                    <input type="number" value={row.price_6mo} onChange={e => upd(row.id, 'price_6mo', e.target.value)} placeholder="7,200" style={{ ...SINP, padding: '5px 8px', width: 90, fontSize: 12.5 }} />
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{t.perMonth}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <button type="button" onClick={addRow} style={{ padding: '7px 14px', borderRadius: 9, border: '1.5px dashed #048c73', background: '#f0fbf8', color: '#048c73', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
        + {t.addRoomType}
      </button>
    </div>
  )
}

// ── Condo / House Rental Detail ────────────────────────────────────────────────
export function CondoHouseRentalDetail({ detail, propertyType, onChange, locale = 'th' }: {
  detail: CondoRentalDetail; propertyType: string
  onChange: (d: CondoRentalDetail) => void; locale?: Locale
}) {
  const t = WIZARD_T[locale]
  function u(k: keyof CondoRentalDetail, v: string) { onChange({ ...detail, [k]: v }) }
  const g2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }
  const isHouse = propertyType === 'house'

  return (
    <div>
      <BuildingAutocomplete
        label={isHouse ? t.projectName : t.condoName}
        labelStyle={SLBL}
        inputStyle={SINP}
        value={detail.property_name}
        valueId={detail.property_name_id}
        placeholder={isHouse ? t.projectPlaceholder : t.condoPlaceholder}
        onChange={(name, id) => { u('property_name', name); u('property_name_id', id) }}
        locale={locale}
      />
      <div style={{ ...g2, marginBottom: 12 }}>
        <div>
          <label style={SLBL}>{isHouse ? t.houseNo : t.unitNo}</label>
          <input value={detail.unit_number} onChange={e => u('unit_number', e.target.value)} placeholder={isHouse ? t.houseNoPlaceholder : '101'} style={SINP} />
        </div>
        <div>
          <label style={SLBL}>{isHouse ? t.floorsInHouse : t.floorNo}</label>
          <input type="number" value={detail.floor} onChange={e => u('floor', e.target.value)} placeholder={isHouse ? '2' : '5'} style={SINP} />
        </div>
      </div>
      <div style={{ ...g2, marginBottom: 12 }}>
        <div>
          <label style={SLBL}>{isHouse ? t.facingHouse : t.facingRoom}</label>
          <select value={detail.facing} onChange={e => u('facing', e.target.value)} style={{ ...SINP, cursor: 'pointer' }}>
            <option value="">{t.chooseFacing}</option>
            {facingOptions(t).map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        <div>
          <label style={SLBL}>{t.usableArea} *</label>
          <input type="number" value={detail.size_sqm} onChange={e => u('size_sqm', e.target.value)} placeholder={isHouse ? '120' : '35'} style={SINP} />
        </div>
      </div>
      <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 14px 16px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#02402e', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 5 }}><span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>payments</span>{t.rentByTerm}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
          {([
            { key: 'price_12mo', label: t.monthN(12), ph: '15,000' },
            { key: 'price_6mo',  label: t.monthN(6),  ph: '16,000' },
            { key: 'price_3mo',  label: t.monthN(3),  ph: '17,000' },
            { key: 'price_1mo',  label: t.monthN(1),  ph: '18,000' },
          ] as const).map(({ key, label, ph }) => (
            <div key={key}>
              <label style={{ ...SLBL, fontSize: 11.5 }}>{label}</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#94a3b8', pointerEvents: 'none' }}>฿</span>
                <input type="number" value={detail[key]} onChange={e => u(key, e.target.value)} placeholder={ph}
                  style={{ ...SINP, padding: '7px 8px 7px 20px', fontSize: 13 }} />
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: '#94a3b8', margin: '8px 0 0' }}>{t.searchUses12m}</p>
      </div>
    </div>
  )
}

// ── Rental Charges Section (Apartment) ────────────────────────────────────────
/**
 * Deposits only — for condo, house, office and co-working.
 *
 * The admin screen has always shown this for non-apartment types; this form did
 * not, and prepareSubmitData dropped rental_charges for those types entirely. So
 * a landlord listing a condo could not record a deposit, and the charges table on
 * the public page came up empty. Added here so both forms behave the same.
 */
export function DepositSection({ charges, onChange, locale = 'th' }: {
  charges: RentalCharges
  onChange: (c: RentalCharges) => void
  locale?: Locale
}) {
  const t = WIZARD_T[locale]
  function u(k: keyof RentalCharges, v: any) { onChange({ ...charges, [k]: v }) }
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={SLBL}>{t.securityDeposit}</label>
          <input type="number" value={charges.security_deposit} onChange={e => u('security_deposit', e.target.value)} placeholder="2" style={SINP} />
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>{t.typically2}</p>
        </div>
        <div>
          <label style={SLBL}>{t.advanceRent}</label>
          <input type="number" value={charges.advance_deposit} onChange={e => u('advance_deposit', e.target.value)} placeholder="1" style={SINP} />
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>{t.typically1}</p>
        </div>
      </div>
      <div>
        <label style={SLBL}>{t.keyDepositBaht}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="number" value={charges.key_deposit} onChange={e => u('key_deposit', e.target.value)}
            placeholder={t.eg500} style={{ ...SINP, maxWidth: 180 }} />
          <span style={{ fontSize: 12.5, color: '#64748b' }}>{t.baht}</span>
        </div>
        <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>{t.blankHidesRow}</p>
      </div>
    </div>
  )
}

export function RentalChargesSection({ charges, onChange, locale = 'th' }: {
  charges: RentalCharges; onChange: (c: RentalCharges) => void; locale?: Locale
}) {
  const t = WIZARD_T[locale]
  function u(k: keyof RentalCharges, v: any) { onChange({ ...charges, [k]: v }) }

  function toggleOther(val: string) {
    const arr = charges.other_charges
    const next = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
    const fees = { ...charges.other_charges_fees }
    if (arr.includes(val)) delete fees[val]
    onChange({ ...charges, other_charges: next, other_charges_fees: fees })
  }

  function setOtherFee(key: string, fee: string) {
    onChange({ ...charges, other_charges_fees: { ...charges.other_charges_fees, [key]: fee } })
  }

  const rateOpts: { value: RateType; label: string }[] = [
    { value: 'fixed',    label: t.rateFixed },
    { value: 'min_rate', label: t.rateMin },
    { value: 'gov',      label: t.rateGov },
    { value: 'ask',      label: t.rateAsk },
  ]

  function RateRow({ label, type, fixed, minRate, onType, onFixed, onMinRate }: {
    label: string; type: RateType; fixed: string; minRate: string
    onType: (t: RateType) => void; onFixed: (v: string) => void; onMinRate: (v: string) => void
  }) {
    return (
      <div style={{ marginBottom: 16 }}>
        <label style={SLBL}>{label}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: (type === 'fixed' || type === 'min_rate') ? 8 : 0 }}>
          {rateOpts.map(o => (
            <button key={o.value} type="button" onClick={() => onType(o.value)}
              style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                border: `1.5px solid ${type === o.value ? '#048c73' : '#eef0ef'}`,
                background: type === o.value ? '#eaf6f1' : '#fff',
                color: type === o.value ? '#02402e' : '#64748b',
                fontWeight: type === o.value ? 600 : 400 }}>
              {o.label}
            </button>
          ))}
        </div>
        {type === 'gov' && (
          <p style={{ fontSize: 11.5, color: '#64748b', margin: '2px 0 0' }}>
            <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 300, 'FILL' 0", marginRight: 4, verticalAlign: 'middle' }}>info</span>
            {t.govRateNote}
          </p>
        )}
        {type === 'fixed' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="text" inputMode="decimal" value={fixed} onChange={e => onFixed(e.target.value)} placeholder="6.50" style={{ ...SINP, width: 130 }} />
            <span style={{ fontSize: 12.5, color: '#64748b' }}>{t.bahtPerUnit}</span>
          </div>
        )}
        {type === 'min_rate' && (
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div>
                  <label style={{ ...SLBL, fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{t.pricePerUnit}</label>
                  <input type="text" inputMode="decimal" value={fixed} onChange={e => onFixed(e.target.value)} placeholder="3.50" style={{ ...SINP, width: 120 }} />
                </div>
                <span style={{ fontSize: 18, color: '#c7d2d0', paddingBottom: 4 }}>×</span>
                <span style={{ fontSize: 12.5, color: '#64748b', paddingBottom: 4 }}>{t.unit}</span>
              </div>
              <div>
                <label style={{ ...SLBL, fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{t.minPerMonth}</label>
                <input type="text" inputMode="decimal" value={minRate} onChange={e => onMinRate(e.target.value)} placeholder="200" style={{ ...SINP, width: 130 }} />
              </div>
            </div>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '5px 0 0' }}>
              <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 300, 'FILL' 0", flexShrink: 0, marginRight: 4 }}>tips_and_updates</span>{t.whicheverHigher}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <RateRow label={t.water}
        type={charges.water_type} fixed={charges.water_fixed} minRate={charges.water_min_rate}
        onType={v => u('water_type', v)} onFixed={v => u('water_fixed', v)} onMinRate={v => u('water_min_rate', v)} />
      <RateRow label={t.electricity}
        type={charges.electricity_type} fixed={charges.electricity_fixed} minRate={charges.electricity_min_rate}
        onType={v => u('electricity_type', v)} onFixed={v => u('electricity_fixed', v)} onMinRate={v => u('electricity_min_rate', v)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={SLBL}>{t.depositMonths}</label>
          <input type="number" value={charges.security_deposit} onChange={e => u('security_deposit', e.target.value)} placeholder="2" style={SINP} />
        </div>
        <div>
          <label style={SLBL}>{t.advanceRent}</label>
          <input type="number" value={charges.advance_deposit} onChange={e => u('advance_deposit', e.target.value)} placeholder="1" style={SINP} />
        </div>
      </div>
      <div>
        <label style={SLBL}>{t.otherCharges}</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {otherChargesOptions(t).map(o => {
            const on = charges.other_charges.includes(o.value)
            return (
              <div key={o.value} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <button type="button" onClick={() => toggleOther(o.value)}
                  style={{ padding: '6px 13px', borderRadius: 20, fontSize: 12.5, cursor: 'pointer', flexShrink: 0,
                    border: on ? 'none' : '1px solid #eef0ef',
                    background: on ? '#02402e' : '#f8fafc',
                    color: on ? '#fff' : '#64748b',
                    fontWeight: on ? 600 : 400 }}>
                  {o.label}
                </button>
                {on && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>฿</span>
                    <input type="number" value={charges.other_charges_fees[o.value] ?? ''} onChange={e => setOtherFee(o.value, e.target.value)}
                      placeholder="500" style={{ ...SINP, width: 110, padding: '6px 10px', fontSize: 12.5 }} />
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{t.bahtPerMonth}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Map Picker ─────────────────────────────────────────────────────────────────
export function MapPicker({ lat, lng, onLatLng, locale = 'th' }: {
  lat: string; lng: string; onLatLng: (lat: string, lng: string) => void; locale?: Locale
}) {
  const t = WIZARD_T[locale]
  const [urlInput,   setUrlInput]   = useState('')
  const [urlParsing, setUrlParsing] = useState(false)
  const [urlError,   setUrlError]   = useState('')
  const [searchVal, setSearchVal] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<Array<{ lat: string; lon: string; display_name: string }>>([])
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapObjRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const onLatLngRef = useRef(onLatLng)
  onLatLngRef.current = onLatLng

  const defaultLat = lat ? parseFloat(lat) : 13.7563
  const defaultLng = lng ? parseFloat(lng) : 100.5018

  function initLeaflet(L: any) {
    if (mapObjRef.current || !mapContainerRef.current) return
    const map = L.map(mapContainerRef.current, { zoomControl: true }).setView([defaultLat, defaultLng], lat ? 15 : 12)
    mapObjRef.current = map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)
    const icon = L.divIcon({
      html: `<div style="width:28px;height:28px;background:#02402e;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(2,64,46,.45);position:relative;"><div style="position:absolute;inset:3px;background:#d97f11;border-radius:50%;transform:rotate(45deg);"></div></div>`,
      className: '', iconSize: [28, 28], iconAnchor: [14, 28],
    })
    const marker = L.marker([defaultLat, defaultLng], { draggable: true, icon }).addTo(map)
    markerRef.current = marker
    marker.bindPopup(`<b style="color:#02402e;font-size:12px">${t.propertyLocation}</b><br><small style="color:#64748b">${t.dragPin}</small>`).openPopup()
    marker.on('dragend', () => {
      const pos = markerRef.current.getLatLng()
      onLatLngRef.current(pos.lat.toFixed(6), pos.lng.toFixed(6))
    })
    map.on('click', (e: any) => {
      markerRef.current.setLatLng(e.latlng)
      onLatLngRef.current(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6))
    })
  }

  useEffect(() => {
    if ((window as any).L) { initLeaflet((window as any).L); return }
    if (!document.getElementById('leaflet-css')) {
      const css = document.createElement('link')
      css.id = 'leaflet-css'; css.rel = 'stylesheet'
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(css)
    }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => initLeaflet((window as any).L)
    document.head.appendChild(script)
    return () => { if (mapObjRef.current) { mapObjRef.current.remove(); mapObjRef.current = null } }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!mapObjRef.current || !markerRef.current) return
    const la = parseFloat(lat), ln = parseFloat(lng)
    if (isNaN(la) || isNaN(ln)) return
    markerRef.current.setLatLng([la, ln])
    mapObjRef.current.setView([la, ln], 15)
  }, [lat, lng])

  async function doSearch() {
    if (!searchVal.trim()) return
    setSearching(true); setResults([])
    try {
      const r = await fetch(`/api/geocode?q=${encodeURIComponent(searchVal)}`)
      const d = await r.json()
      setResults(d.results ?? [])
    } catch {}
    setSearching(false)
  }

  function selectResult(r: { lat: string; lon: string; display_name: string }) {
    onLatLng(r.lat, r.lon)
    setSearchVal(r.display_name.split(',')[0].trim())
    setResults([])
  }

  function parseGoogleMapsUrl(url: string): { lat: string; lng: string } | null {
    const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (atMatch) return { lat: atMatch[1], lng: atMatch[2] }
    const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (qMatch) return { lat: qMatch[1], lng: qMatch[2] }
    const embedMatch = url.match(/!3d(-?\d+\.?\d*).*?!4d(-?\d+\.?\d*)/)
    if (embedMatch) return { lat: embedMatch[1], lng: embedMatch[2] }
    return null
  }

  async function handleGoogleMapsUrl(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed) return
    setUrlError('')
    const direct = parseGoogleMapsUrl(trimmed)
    if (direct) { onLatLng(direct.lat, direct.lng); return }
    if (trimmed.includes('maps.app.goo.gl') || trimmed.includes('goo.gl')) {
      setUrlParsing(true)
      try {
        const r = await fetch(`/api/resolve-url?url=${encodeURIComponent(trimmed)}`)
        const d = await r.json()
        if (d.resolved) {
          const parsed = parseGoogleMapsUrl(d.resolved)
          if (parsed) { onLatLng(parsed.lat, parsed.lng); return }
        }
        setUrlError(t.cantReadCoords)
      } catch { setUrlError(t.cantExpandShort) }
      finally { setUrlParsing(false) }
      return
    }
    setUrlError(t.badLink)
  }

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: urlError ? '#dc2626' : '#048c73', pointerEvents: 'none' }}><span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>link</span></span>
            <input
              value={urlInput}
              onChange={e => { setUrlInput(e.target.value); setUrlError('') }}
              onPaste={e => {
                const pasted = e.clipboardData.getData('text')
                if (pasted.includes('google.com/maps') || pasted.includes('maps.app.goo.gl') || pasted.includes('goo.gl')) {
                  e.preventDefault(); setUrlInput(pasted); handleGoogleMapsUrl(pasted)
                }
              }}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleGoogleMapsUrl(urlInput) } }}
              placeholder={t.pasteLink}
              style={{ ...SINP, paddingLeft: 32, flex: 1, background: urlError ? '#fff5f5' : '#f0fbf8', border: `1.5px solid ${urlError ? '#fca5a5' : '#b2d8c9'}` }}
            />
          </div>
          <button type="button" onClick={() => handleGoogleMapsUrl(urlInput)}
            disabled={urlParsing || !urlInput.trim()}
            style={{ padding: '9px 14px', borderRadius: 10, border: 'none', background: '#048c73', color: '#fff', fontWeight: 600, fontSize: 13, cursor: urlParsing || !urlInput.trim() ? 'not-allowed' : 'pointer', opacity: urlParsing || !urlInput.trim() ? 0.6 : 1, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
            {urlParsing
              ? <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
              : <>{t.getCoords}</>}
          </button>
        </div>
        {urlError
          ? <p style={{ margin: '4px 0 0', fontSize: 11.5, color: '#dc2626' }}>{urlError}</p>
          : <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8' }}>{t.pasteHint}</p>
        }
      </div>

      <div style={{ position: 'relative', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={searchVal} onChange={e => setSearchVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); doSearch() } }}
            placeholder={t.searchNearby}
            style={{ ...SINP, flex: 1 }} />
          <button type="button" onClick={doSearch} disabled={searching}
            style={{ padding: '9px 14px', borderRadius: 10, border: 'none', background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 13, cursor: searching ? 'not-allowed' : 'pointer', opacity: searching ? 0.7 : 1, whiteSpace: 'nowrap' }}>
            {searching
              ? <>{t.search}</>
              : <>{t.search}</>}
          </button>
        </div>
        {results.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999, background: '#fff', border: '1px solid #eef0ef', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)', overflow: 'hidden', marginTop: 4 }}>
            {results.map((r, i) => (
              <button key={i} type="button" onClick={() => selectResult(r)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12.5, color: '#334155', borderBottom: i < results.length - 1 ? '1px solid #f1f5f4' : 'none' }}>
                {r.display_name.length > 85 ? r.display_name.slice(0, 85) + '…' : r.display_name}
              </button>
            ))}
            <button type="button" onClick={() => setResults([])} style={{ display: 'block', width: '100%', textAlign: 'center', padding: '6px', border: 'none', background: '#f8fafc', cursor: 'pointer', fontSize: 12, color: '#94a3b8' }}>{t.close}</button>
          </div>
        )}
      </div>
      <div ref={mapContainerRef} style={{ height: 280, borderRadius: 12, overflow: 'hidden', border: '1px solid #eef0ef', background: '#f0f4f2' }} />
      {lat && lng ? (
        <div style={{ marginTop: 8, padding: '7px 12px', background: '#f0fbf8', borderRadius: 8, fontSize: 12, color: '#048c73', fontWeight: 500, display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>check_circle</span>{parseFloat(lat).toFixed(5)}, {parseFloat(lng).toFixed(5)}</span>
          <span style={{ color: '#94a3b8', fontWeight: 400 }}>{t.dragToAdjust}</span>
        </div>
      ) : (
        <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '7px 0 0' }}>{t.clickMapHint}</p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
        <div>
          <label style={{ ...SLBL, fontSize: 11.5, color: '#94a3b8' }}>{t.latitude}</label>
          <input value={lat} onChange={e => onLatLng(e.target.value, lng)} placeholder="13.756300" style={{ ...SINP, fontSize: 12.5, padding: '7px 10px' }} />
        </div>
        <div>
          <label style={{ ...SLBL, fontSize: 11.5, color: '#94a3b8' }}>{t.longitude}</label>
          <input value={lng} onChange={e => onLatLng(lat, e.target.value)} placeholder="100.501800" style={{ ...SINP, fontSize: 12.5, padding: '7px 10px' }} />
        </div>
      </div>
    </div>
  )
}

// ── Thailand Cascading Address Select ─────────────────────────────────────────
type AddrItem = { id: number; name: string; zip?: string }

export function ThaiAddressSelect({ form, onChange, locale = 'th' }: {
  form: Pick<FormState, 'address_th' | 'district' | 'sub_district' | 'province' | 'postcode'>
  onChange: (k: string, v: string) => void
  locale?: Locale
}) {
  const t = WIZARD_T[locale]
  const [provinces, setProvinces] = useState<AddrItem[]>([])
  const [amphures,  setAmphures]  = useState<AddrItem[]>([])
  const [tambons,   setTambons]   = useState<AddrItem[]>([])
  const [provId, setProvId] = useState<number | null>(null)
  const [amphId, setAmphId] = useState<number | null>(null)
  const [loadA, setLoadA] = useState(false)
  const [loadT, setLoadT] = useState(false)

  useEffect(() => {
    fetch('/api/thailand-address?level=provinces')
      .then(r => r.json()).then((d: AddrItem[]) => { if (Array.isArray(d)) setProvinces(d) }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!provinces.length || !form.province || provId !== null) return
    const p = provinces.find(p => p.name === form.province)
    if (!p) return
    setProvId(p.id); setLoadA(true)
    fetch(`/api/thailand-address?level=amphures&parent=${p.id}`)
      .then(r => r.json()).then((d: AddrItem[]) => { if (Array.isArray(d)) setAmphures(d); setLoadA(false) }).catch(() => setLoadA(false))
  }, [provinces, form.province, provId])

  useEffect(() => {
    if (!amphures.length || !form.district || amphId !== null) return
    const a = amphures.find(a => a.name === form.district)
    if (!a) return
    setAmphId(a.id); setLoadT(true)
    fetch(`/api/thailand-address?level=tambons&parent=${a.id}`)
      .then(r => r.json()).then((d: AddrItem[]) => { if (Array.isArray(d)) setTambons(d); setLoadT(false) }).catch(() => setLoadT(false))
  }, [amphures, form.district, amphId])

  function selectProvince(id: number) {
    const p = provinces.find(p => p.id === id)
    if (!p) return
    onChange('province', p.name); onChange('district', ''); onChange('sub_district', ''); onChange('postcode', '')
    setProvId(id); setAmphId(null); setAmphures([]); setTambons([])
    setLoadA(true)
    fetch(`/api/thailand-address?level=amphures&parent=${id}`)
      .then(r => r.json()).then((d: AddrItem[]) => { if (Array.isArray(d)) setAmphures(d); setLoadA(false) }).catch(() => setLoadA(false))
  }

  function selectAmphure(id: number) {
    const a = amphures.find(a => a.id === id)
    if (!a) return
    onChange('district', a.name); onChange('sub_district', ''); onChange('postcode', '')
    setAmphId(id); setTambons([])
    setLoadT(true)
    fetch(`/api/thailand-address?level=tambons&parent=${id}`)
      .then(r => r.json()).then((d: AddrItem[]) => { if (Array.isArray(d)) setTambons(d); setLoadT(false) }).catch(() => setLoadT(false))
  }

  function selectTambon(name: string) {
    const tambon = tambons.find(x => x.name === name)
    if (!tambon) return
    onChange('sub_district', tambon.name); onChange('postcode', tambon.zip ?? '')
  }

  function selStyle(disabled: boolean): React.CSSProperties {
    return { ...SINP, background: disabled ? '#f8fafc' : '#fff', color: disabled ? '#94a3b8' : '#334155', cursor: disabled ? 'not-allowed' : 'pointer' }
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label style={SLBL}>{t.address}</label>
        <input value={form.address_th} onChange={e => onChange('address_th', e.target.value)} placeholder={t.addressPlaceholder} style={SINP} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={SLBL}>{t.province} *</label>
        <select value={provId ?? ''} onChange={e => { const id = parseInt(e.target.value as string); if (!isNaN(id)) selectProvince(id) }} style={{ ...SINP, cursor: 'pointer' }}>
          <option value="">{provinces.length === 0 ? t.loading : t.chooseProvince}</option>
          {provinces.map(p => <option key={p.id} value={p.id}>{provinceLabel(p.name, locale)}</option>)}
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={SLBL}>{t.district} {loadA && <span className="msym" style={{ fontSize: 13, color: '#94a3b8', animation: 'spin .8s linear infinite', display: 'inline-block' }}>sync</span>}</label>
          <select value={amphId ?? ''} onChange={e => { const id = parseInt(e.target.value as string); if (!isNaN(id)) selectAmphure(id) }} disabled={!provId || loadA} style={selStyle(!provId || loadA)}>
            <option value="">{!provId ? t.chooseProvinceFirst : loadA ? t.loading : t.chooseDistrict}</option>
            {amphures.map(a => <option key={a.id} value={a.id}>{districtLabel(a.name, form.province, locale)}</option>)}
          </select>
        </div>
        <div>
          <label style={SLBL}>{t.subDistrict} {loadT && <span className="msym" style={{ fontSize: 13, color: '#94a3b8', animation: 'spin .8s linear infinite', display: 'inline-block' }}>sync</span>}</label>
          <select value={form.sub_district || ''} onChange={e => selectTambon(e.target.value)} disabled={!amphId || loadT} style={selStyle(!amphId || loadT)}>
            <option value="">{!amphId ? t.chooseDistrictFirst : loadT ? t.loading : t.chooseSubDistrict}</option>
            {tambons.map(tb => <option key={tb.id} value={tb.name}>{tb.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label style={SLBL}>{t.postcode}</label>
        <input value={form.postcode} onChange={e => onChange('postcode', e.target.value)} placeholder="10110" style={{ ...SINP, width: 130 }} />
        {form.postcode && <span style={{ fontSize: 11.5, color: '#048c73', marginLeft: 8, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 3 }}><span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>check_circle</span>{form.postcode}</span>}
      </div>
    </div>
  )
}

// ── Image Upload Zone ──────────────────────────────────────────────────────────
export function ImageUploadZone({ images, onImagesChange, packageType = 'basic', isPublic = false, locale = 'th' }: {
  images: string[]
  onImagesChange: (imgs: string[]) => void
  packageType?: string
  /** When true, uses /api/public-upload (no auth required — for the public landlord submit form) */
  isPublic?: boolean
  locale?: Locale
}) {
  const t = WIZARD_T[locale]
  const [uploading,       setUploading]       = useState(false)
  const [uploadProgress,  setUploadProgress]  = useState(0)
  const [uploadStatus,    setUploadStatus]    = useState('')
  const [uploadError,     setUploadError]     = useState('')
  const [hoveredIdx,      setHoveredIdx]      = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Upload up to the largest allowance regardless of package. The package
  // decides how many of these the public sees, not how many may be added —
  // see MAX_IMAGES_ANY_PACKAGE in lib/packages.
  const imageLimit = MAX_IMAGES_ANY_PACKAGE
  const atLimit    = images.length >= imageLimit
  const remaining  = imageLimit - images.length

  // How many of them will actually appear on the listing, for this package.
  const shownCount  = visibleImageCount(packageType)
  const hiddenCount = Math.max(0, images.length - shownCount)

  // ── Auth upload (owner-dashboard) ──────────────────────────────────────────
  function uploadFileXHR(fd: globalThis.FormData, token: string, onProgress: (pct: number) => void): Promise<{ url?: string; error?: string }> {
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100)) }
      xhr.onload  = () => { try { resolve(JSON.parse(xhr.responseText)) } catch { resolve({ error: 'Parse error' }) } }
      xhr.onerror = () => resolve({ error: t.connectFailed })
      xhr.open('POST', '/api/dashboard/upload')
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.send(fd)
    })
  }

  async function handleFiles(files: FileList) {
    setUploading(true); setUploadError(''); setUploadProgress(0)
    const added: string[] = []
    let currentCount = images.length
    const fileArr = Array.from(files).filter(() => currentCount < imageLimit)
    if (Array.from(files).length > fileArr.length) setUploadError(t.maxImagesForPackage(imageLimit))
    const total = fileArr.length

    if (isPublic) {
      // ── Public upload path (no auth, /api/public-upload) ──────────────────
      for (let i = 0; i < total; i++) {
        setUploadStatus(`${i + 1}/${total}`)
        const fd = new globalThis.FormData()
        fd.append('file', fileArr[i])
        fd.append('packageId', packageType)
        fd.append('currentCount', String(currentCount))
        try {
          const r = await fetch('/api/public-upload', { method: 'POST', body: fd })
          const d = await r.json()
          if (d.url) { added.push(d.url); currentCount++ }
          else setUploadError(d.error || t.uploadFailed)
        } catch { setUploadError(t.connectFailed) }
        setUploadProgress(Math.round((i + 1) / total * 100))
      }
    } else {
      // ── Auth upload path (with session token, /api/dashboard/upload) ───────
      const { data: { session: upSess } } = await createBrowserClient().auth.getSession()
      const token = upSess?.access_token ?? ''
      for (let i = 0; i < total; i++) {
        setUploadStatus(`${i + 1}/${total}`)
        const fd = new globalThis.FormData()
        fd.append('file', fileArr[i])
        fd.append('type', 'image')
        fd.append('packageType', packageType)
        fd.append('currentCount', String(currentCount))
        const d = await uploadFileXHR(fd, token, pct => {
          setUploadProgress(Math.round((i * 100 + pct) / total))
        })
        if (d.url) { added.push(d.url); currentCount++ }
        else setUploadError(d.error || t.uploadFailed)
      }
    }

    if (added.length) onImagesChange([...images, ...added])
    setUploading(false); setUploadProgress(0); setUploadStatus('')
  }

  function setAsCover(idx: number) {
    if (idx === 0) return
    const next = [...images]
    const [picked] = next.splice(idx, 1)
    next.unshift(picked)
    onImagesChange(next)
  }

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={e => { if (e.target.files) handleFiles(e.target.files) }} />
      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading || atLimit}
        style={{ width: '100%', padding: '14px 0', borderRadius: 10, border: '1.5px dashed ' + (atLimit ? '#eef0ef' : '#c7d2d0'), background: uploading ? '#f8fafc' : '#fafffe', color: atLimit ? '#94a3b8' : '#048c73', fontWeight: 600, fontSize: 13, cursor: (uploading || atLimit) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {uploading
          ? <><span style={{ width: 16, height: 16, border: '2px solid #d1fae5', borderTopColor: '#048c73', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />{t.uploading}{uploadStatus ? ` ${uploadStatus}` : ''}…</>
          : atLimit
            ? <>{t.uploadedMax(imageLimit)}</>
            : <>{t.chooseImages} (JPG · PNG · WebP)</>
        }
      </button>
      {uploading && (
        <div style={{ marginTop: 6 }}>
          <div style={{ height: 5, borderRadius: 4, background: '#e8f5f0', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(to right, #048c73, #02402e)', width: `${uploadProgress}%`, transition: 'width .2s ease' }} />
          </div>
          <p style={{ fontSize: 11, color: '#048c73', margin: '3px 0 0', textAlign: 'right' }}>{uploadProgress}%</p>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
        <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
          {images.length} / {imageLimit} {t.photos}
          {!atLimit && remaining > 0 && <span style={{ color: '#048c73' }}> · {t.canAddMoreN(remaining)}</span>}
        </p>
        {atLimit && (
          <span style={{ fontSize: 11, color: '#94a3b8' }}>
            {t.reachedMax}
          </span>
        )}
      </div>

      {/* The package rule, said once and plainly.
          The owner is allowed to upload more than their package displays, so
          they must be told which ones will actually appear — otherwise the
          extras look like a bug, or worse, like lost photos. */}
      {hiddenCount > 0 && (
        <div style={{ marginTop: 8, padding: '10px 12px', background: '#fffaf2', border: '1px solid #f0d5ad', borderRadius: 10, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span className="msym" style={{ fontSize: 16, color: '#d97f11', flexShrink: 0, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>info</span>
          <p style={{ margin: 0, fontSize: 12, color: '#8a6234', lineHeight: 1.55 }}>
            {t.imgRuleBefore}<strong>{packageType}</strong>{t.imgRuleAfter(shownCount, hiddenCount)}
            <br />
            {t.imgRuleReorder}
          </p>
        </div>
      )}
      {uploadError && <p style={{ color: '#b91c1c', fontSize: 12, margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}><span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>warning</span>{uploadError}</p>}
      {images.length > 0 && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {images.map((url, i) => {
              // Beyond the package's allowance — stored, but not shown publicly.
              const isHidden = i >= shownCount
              return (
              <div key={url + i} style={{ position: 'relative', flexShrink: 0, cursor: i !== 0 ? 'pointer' : 'default' }}
                onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" style={{ width: 90, height: 68, objectFit: 'cover', borderRadius: 8, display: 'block', border: i === 0 ? '2.5px solid #02402e' : hoveredIdx === i ? '2px solid #048c73' : '1px solid #eef0ef', transition: 'border-color .15s, opacity .15s', opacity: isHidden ? 0.4 : 1, filter: isHidden ? 'grayscale(0.7)' : 'none' }} />
                {isHidden && hoveredIdx !== i && (
                  <span style={{ position: 'absolute', bottom: 4, left: 4, right: 4, fontSize: 8.5, background: 'rgba(217,127,17,.94)', color: '#fff', padding: '2px 4px', borderRadius: 4, fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, lineHeight: 1.2 }}>
                    <span className="msym" style={{ fontSize: 9, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>visibility_off</span>
                    {t.notShown}
                  </span>
                )}
                {i === 0 && <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 9, background: '#02402e', color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}><span className="msym" style={{ fontSize: 9, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>star</span>{t.cover}</span>}
                {i !== 0 && hoveredIdx === i && (
                  <button type="button" onClick={() => setAsCover(i)}
                    style={{ position: 'absolute', inset: 0, borderRadius: 8, border: 'none', background: 'rgba(2,64,46,.72)', color: '#fff', fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                    
                    <span>{t.setCover}</span>
                  </button>
                )}
                <button type="button" onClick={() => onImagesChange(images.filter((_, j) => j !== i))}
                  style={{ position: 'absolute', top: 4, right: 4, padding: '1px 7px', borderRadius: 4, background: 'rgba(255,255,255,.92)', border: '1px solid #f1c4bd', color: '#b42318', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1.6, zIndex: 2 }}>{t.remove}</button>
              </div>
              )
            })}
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '6px 0 0' }}>
            {t.clickToSetCover}
            {hiddenCount > 0 && <> • {t.fadedNotShown}</>}
          </p>
        </>
      )}
    </div>
  )
}

// ── Video Upload Zone ──────────────────────────────────────────────────────────
export function VideoUploadZone({ videoUrl, onVideoChange, packageType, locale = 'th' }: { videoUrl: string; onVideoChange: (url: string) => void; packageType: string; locale?: Locale }) {
  const t = WIZARD_T[locale]
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const isPremium = packageType === 'premium'

  async function handleFile(file: File) {
    setUploading(true); setUploadError('')
    const { data: { session: vidSess } } = await createBrowserClient().auth.getSession()
    const fd = new globalThis.FormData(); fd.append('file', file); fd.append('type', 'video')
    try {
      const r = await fetch('/api/dashboard/upload', { method: 'POST', headers: { Authorization: `Bearer ${vidSess?.access_token}` }, body: fd })
      const d = await r.json()
      if (d.url) onVideoChange(d.url)
      else setUploadError(d.error || t.uploadFailed)
    } catch { setUploadError(t.connectFailed) }
    setUploading(false)
  }

  // Non-Premium owners can still add a video — it is simply not shown publicly
  // until they hold a Premium slot. Blocking the field instead meant an owner
  // upgrading had to come back and paste the link again, and the video they had
  // already prepared was thrown away rather than held.
  return (
    <div>
      {!isPremium && (
        <div style={{ marginBottom: 10, padding: '10px 12px', background: '#fffaf2', border: '1px solid #f0d5ad', borderRadius: 10, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span className="msym" style={{ fontSize: 16, color: '#d97f11', flexShrink: 0, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>visibility_off</span>
          <p style={{ margin: 0, fontSize: 12, color: '#8a6234', lineHeight: 1.55 }}>
            {t.videoRuleBefore}<strong>Premium</strong>{t.videoRuleAfter}
            {t.videoKeptForUpgrade}
          </p>
        </div>
      )}
      <input ref={fileRef} type="file" accept="video/mp4,video/quicktime,video/webm" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
        style={{ width: '100%', padding: '12px 0', borderRadius: 10, border: '1.5px dashed #048c73', background: '#f0fbf8', color: '#048c73', fontWeight: 600, fontSize: 13, cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10 }}>
        {uploading
          ? <>{t.uploadingEllipsis}</>
          : <>{t.uploadVideo}</>}
      </button>
      <div>
        <label style={{ ...SLBL, fontSize: 12 }}>{t.orPasteVideoLink}</label>
        <input value={videoUrl.startsWith('http') && !videoUrl.includes('supabase') ? videoUrl : ''} onChange={e => onVideoChange(e.target.value)} placeholder="https://youtube.com/watch?v=… / https://www.tiktok.com/@…/video/…" style={SINP} />
      </div>
      {uploadError && <p style={{ color: '#b91c1c', fontSize: 12, margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}><span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>warning</span>{uploadError}</p>}
      {videoUrl && (
        <div style={{ marginTop: 8, padding: '8px 12px', background: '#f0fbf8', borderRadius: 8, fontSize: 12, color: '#048c73', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ flex: 1, wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: 4 }}><span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1", flexShrink: 0 }}>check_circle</span>{videoUrl.length > 60 ? videoUrl.slice(0, 60) + '…' : videoUrl}</span>
          <button type="button" onClick={() => onVideoChange('')} style={{ color: '#b91c1c', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{t.remove}</button>
        </div>
      )}
    </div>
  )
}

// ── Listing Form Fields (master form component) ────────────────────────────────
export function ListingFormFields({
  form, onChange, onAmenityToggle, onImagesChange,
  isPublicUpload = false, isAdmin = false, isMobile = false, locale = 'th',
}: {
  form: FormState
  onChange: (k: string, v: any) => void
  onAmenityToggle: (a: string) => void
  onImagesChange: (imgs: string[]) => void
  /** Public /list-your-property/new form — uses the unauthenticated upload endpoint */
  isPublicUpload?: boolean
  /** Admin screen — shows the package selector and the read-only slug */
  isAdmin?: boolean
  /** Single-column grids on narrow screens */
  isMobile?: boolean
  /**
   * Which language the owner reads. Thai by default, so the owner dashboard and
   * the admin screen are unaffected — only /en/list-your-property/new passes 'en'.
   *
   * This changes labels only. Every value the form writes — room type key,
   * amenity name, facing, district, charge key — is identical in both locales.
   */
  locale?: Locale
}) {
  const t = WIZARD_T[locale]
  const roomOpts = getRoomTypeOptions(form.property_type, locale)

  // Editable in Settings; defaults until it loads.
  const [amenityList, setAmenityList] = useState<Amenity[]>(DEFAULT_AMENITIES)
  useEffect(() => { fetchAmenities().then(setAmenityList) }, [])

  const g2: React.CSSProperties = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }

  // Admin picks the package directly; everyone else sees what was bought.
  const PackageSelector = isAdmin ? (
    <div style={{ marginBottom: 16 }}>
      <label style={SLBL}>{t.listingPackage} (Admin)</label>
      <select value={form.package_type} onChange={e => onChange('package_type', e.target.value)} style={SINP}>
        {ADMIN_PACKAGES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
      </select>
      <p style={{ fontSize: 11.5, margin: '4px 0 0', fontWeight: 500, color: form.package_type === 'admin' ? '#94a3b8' : '#048c73' }}>
        {form.package_type === 'admin'
          ? t.neverExpires
          : `⏱ ${t.expires} ${new Date(computeExpiry(form.package_type) ?? '').toLocaleDateString(locale === 'en' ? 'en-GB' : 'th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}`}
      </p>
    </div>
  ) : null

  const isApartment    = form.property_type === 'apartment'
  const isCondoOrHouse = ['condo', 'house'].includes(form.property_type)
  const isOfficeOrCo   = ['office', 'coworking'].includes(form.property_type)
  const showBedsBaths  = isCondoOrHouse
  // Apartments capture size per room type in ประเภทห้องและราคาห้อง — asking again
  // for a building average duplicates the input and lets the two disagree.
  const showAreaSqm    = isOfficeOrCo
  const showFloor      = isOfficeOrCo
  const [descTab, setDescTab] = useState<'th' | 'en'>('th')

  return (
    <>
      {/* ── 1 · ข้อมูลหลัก ── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text={`1 · ${t.mainInfo}`} />
        <div style={{ marginBottom: 14 }}>
          <label style={SLBL}>{t.propertyType} *</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              { value: 'condo',     icon: 'apartment',      label: t.typeCondo },
              { value: 'apartment', icon: 'domain',         label: t.typeApartment },
              { value: 'house',     icon: 'home',           label: t.typeHouse },
              { value: 'office',    icon: 'corporate_fare', label: t.typeOffice },
              { value: 'coworking', icon: 'hub',            label: 'Co-Working' },
            ].map(o => (
              <button key={o.value} type="button" onClick={() => onChange('property_type', o.value)}
                style={{ padding: '7px 14px', borderRadius: 20, fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
                  border: `1.5px solid ${form.property_type === o.value ? '#02402e' : '#eef0ef'}`,
                  background: form.property_type === o.value ? '#02402e' : '#fff',
                  color: form.property_type === o.value ? '#fff' : '#64748b', transition: 'all .15s',
                  display: 'flex', alignItems: 'center', gap: 5 }}>
                
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={SLBL}>{t.titleTh} *</label>
          <input value={form.title_th} onChange={e => onChange('title_th', e.target.value)} placeholder={t.titleThPlaceholder} required style={SINP} />
        </div>
        <div>
          <label style={SLBL}>{t.titleEn}</label>
          <input value={form.title_en} onChange={e => onChange('title_en', e.target.value)} placeholder="Condo for Rent near BTS Ekkamai" style={SINP} />
        </div>
      </div>

      {/* Slug is generated at creation and never edited — changing it breaks
          every existing link. Shown here for reference only. */}
      {isAdmin && form.slug && (
        <div style={{ marginBottom: 20, marginTop: -8 }}>
          <label style={SLBL}>URL {t.ofListing}</label>
          <p style={{ fontSize: 12.5, color: '#64748b', margin: 0, wordBreak: 'break-all' }}>
            spacesmate.com/property/{form.slug}
          </p>
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>
            {t.slugAuto}
          </p>
        </div>
      )}

      {/* ── 2 · ราคาและประเภทห้อง ── */}
      <div style={{ marginBottom: 24 }}>
        {/* Apartment */}
        {isApartment && (
          <>
            {PackageSelector}
            <SectionHead text={`2 · ${t.roomTypesAndPrices}`} />
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '-8px 0 12px' }}>
              {t.addEachRoomType}
            </p>
            <ApartmentUnitGrid rows={form.apartment_units} onChange={rows => onChange('apartment_units', rows)} roomTypeOptions={roomOpts} locale={locale} />
          </>
        )}

        {/* Condo / House */}
        {isCondoOrHouse && (
          <>
            {PackageSelector}
            <SectionHead text={`2 · ${t.rentalDetail}`} />
            <CondoHouseRentalDetail detail={form.condo_rental} propertyType={form.property_type} onChange={d => onChange('condo_rental', d)} locale={locale} />
          </>
        )}

        {/* Office / Coworking */}
        {isOfficeOrCo && (
          <>
            {PackageSelector}
            <SectionHead text={`2 · ${t.spaceTypesAndPrices}`} />
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '-8px 0 12px' }}>
              {t.addEachSpaceType}
            </p>
            <ApartmentUnitGrid rows={form.apartment_units} onChange={rows => onChange('apartment_units', rows)} roomTypeOptions={roomOpts} locale={locale} />
          </>
        )}
      </div>

      {/* ── 3 · ขนาดและลักษณะ ── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text={`3 · ${t.sizeAndLayout}`} />
        {showAreaSqm && (
          <div style={{ display: 'grid', gridTemplateColumns: showFloor ? '1fr 1fr' : '1fr', gap: 12, marginBottom: showBedsBaths ? 12 : 0 }}>
            <div>
              <label style={SLBL}>{t.usableArea}</label>
              <input type="number" value={form.area_sqm} onChange={e => onChange('area_sqm', e.target.value)} placeholder="28" style={SINP} />
            </div>
            {showFloor && (
              <div>
                <label style={SLBL}>{t.floorLocated}</label>
                <input type="number" value={form.floor} onChange={e => onChange('floor', e.target.value)} placeholder="7" style={SINP} />
              </div>
            )}
          </div>
        )}
        {showBedsBaths && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={SLBL}>{t.bedrooms}</label>
              <select value={form.bedrooms} onChange={e => onChange('bedrooms', e.target.value)} style={SINP}>
                {['0','1','2','3','4','5'].map(n => <option key={n} value={n}>{n === '0' ? 'Studio' : t.roomsN(Number(n))}</option>)}
              </select>
            </div>
            <div>
              <label style={SLBL}>{t.bathrooms}</label>
              <select value={form.bathrooms} onChange={e => onChange('bathrooms', e.target.value)} style={SINP}>
                {['1','2','3','4'].map(n => <option key={n} value={n}>{t.roomsN(Number(n))}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── 3B · รายละเอียดการเช่า ── */}
      {isApartment ? (
        <div style={{ marginBottom: 24 }}>
          <SectionHead text={`3B · ${t.rentalDetail}`} />
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '-8px 0 14px' }}>{t.utilitiesNote}</p>
          <RentalChargesSection charges={form.rental_charges} onChange={c => onChange('rental_charges', c)} locale={locale} />
        </div>
      ) : (
        <div style={{ marginBottom: 24 }}>
          <SectionHead text={`3B · ${t.rentalDetail}`} />
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '-8px 0 14px' }}>{t.depositsNote}</p>
          <DepositSection charges={form.rental_charges} onChange={c => onChange('rental_charges', c)} locale={locale} />
        </div>
      )}

      {/* ── 4 · ที่ตั้งและที่อยู่ ── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text={`4 · ${t.locationAndAddress}`} />
        <ThaiAddressSelect
          form={{ address_th: form.address_th, district: form.district, sub_district: form.sub_district, province: form.province, postcode: form.postcode }}
          onChange={onChange}
          locale={locale}
        />
      </div>

      {/* ── 5 · พิกัดบนแผนที่ ── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text={`5 · ${t.mapCoords}`} />
        <MapPicker lat={form.lat} lng={form.lng} onLatLng={(lat, lng) => { onChange('lat', lat); onChange('lng', lng) }} locale={locale} />
      </div>

      {/* ── 6 · รายละเอียดประกาศ (TH / EN) ── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text={`6 · ${t.listingDetail}`} />
        <div style={{ display: 'flex', gap: 0, marginBottom: 10, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', width: 'fit-content' }}>
          {(['th', 'en'] as const).map(lang => (
            <button
              key={lang}
              type="button"
              onClick={() => setDescTab(lang)}
              style={{
                padding: '6px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                background: descTab === lang ? '#02402e' : '#f8fafc',
                color:      descTab === lang ? '#fff'    : '#64748b',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {lang === 'th' ? `🇹🇭 ${t.thaiLanguage}` : '🇬🇧 English'}
            </button>
          ))}
        </div>
        {descTab === 'th' ? (
          <RichEditor
            key="desc-th"
            value={form.description_th}
            onChange={v => onChange('description_th', v)}
            placeholder={t.descPlaceholder}
            minHeight={220}
            locale={locale}
          />
        ) : (
          <RichEditor
            key="desc-en"
            value={form.description_en}
            onChange={v => onChange('description_en', v)}
            placeholder="Describe the room, location, facilities and highlights in English..."
            minHeight={220}
            locale={locale}
          />
        )}
      </div>

      {/* ── 7 · สิ่งอำนวยความสะดวก ──
          Always two sections, for every property type. The list is loaded from
          Settings so admins can add, edit and remove items; it falls back to
          lib/amenities defaults if that request fails, because a form showing no
          amenities looks broken and would publish listings with none selected. */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text={`7 · ${t.amenities}`} />
        {AMENITY_SECTIONS.map(sec => {
          const items = bySection(amenityList, sec.key)
          if (!items.length) return null
          return (
            <div key={sec.key} style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#334155', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{sec.icon}</span>
                {locale === 'en' ? (sec.label_en || sec.label_th) : sec.label_th}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {items.map(a => {
                  const on = form.amenities.includes(a.name_th)
                  return (
                    <button key={a.id} type="button" onClick={() => onAmenityToggle(a.name_th)}
                      title={(locale === 'en' ? a.name_th : a.name_en) || undefined}
                      style={{ padding: '6px 13px', borderRadius: 20, fontSize: 12.5, cursor: 'pointer', transition: 'all .15s',
                        border: on ? 'none' : '1px solid #eef0ef',
                        background: on ? (sec.key === 'unit' ? '#02402e' : '#048c73') : '#f8fafc',
                        color: on ? '#fff' : '#64748b', fontWeight: on ? 600 : 400 }}>
                      {locale === 'en' ? (a.name_en || a.name_th) : a.name_th}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── 8 · รูปภาพห้อง ── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text={`8 · ${t.roomImages}`} />
        <ImageUploadZone
          images={form.images}
          onImagesChange={onImagesChange}
          packageType={form.package_type}
          isPublic={isPublicUpload}
          locale={locale}
        />
        <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '7px 0 0' }}>{t.firstIsCover}</p>
      </div>

      {/* ── 9 · วิดีโอ (Premium) ── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text={`9 · ${t.listingVideo} (${t.premiumOnly})`} />
        <VideoUploadZone videoUrl={form.video_url} onVideoChange={v => onChange('video_url', v)} packageType={form.package_type} locale={locale} />
      </div>

      {/* ── 10 · ข้อมูลการติดต่อ ── */}
      <div style={{ marginBottom: 8 }}>
        <SectionHead text={`10 · ${t.contactInfo}`} />
        <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '-8px 0 14px' }}>{t.contactShownOnListing}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={SLBL}>{t.contactName}</label>
            <input value={form.contact_name} onChange={e => onChange('contact_name', e.target.value)}
              placeholder={t.contactNamePlaceholder} style={SINP} />
          </div>
          <div>
            <label style={SLBL}>{t.phone}</label>
            <input value={form.contact_phone} onChange={e => onChange('contact_phone', e.target.value)}
              placeholder="0812345678" style={SINP} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={SLBL}>LINE ID</label>
            <input value={form.contact_line} onChange={e => onChange('contact_line', e.target.value)}
              placeholder={`@yourid ${t.or} yourid`} style={SINP} />
          </div>
        </div>
        <div>
          <label style={SLBL}>{t.emailOptional}</label>
          <input type="email" value={form.contact_email} onChange={e => onChange('contact_email', e.target.value)}
            placeholder="email@example.com" style={SINP} />
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>
            {t.emailBlankNote}
          </p>
        </div>
      </div>
    </>
  )
}
