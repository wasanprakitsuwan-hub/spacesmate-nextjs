/**
 * The site-wide values an admin edits in Dashboard › ตั้งค่า, and their defaults.
 *
 * Until 27 Oct 2026 four of the six Settings tabs saved to site_settings and
 * nothing on the site read what they saved: changing the company phone, an
 * email subject, a property type or the default share image changed nothing.
 * This file is the one model for those values. The Settings screen edits it,
 * lib/site-settings.ts reads it on the server, and each consumer falls back to
 * the defaults here when nothing is stored or the read fails.
 *
 * Client-safe: no server imports. Readers on the server use lib/site-settings.
 */
import type { PropertyType } from '@/lib/types'

/** Cache tag for every value below. The settings PATCH route revalidates it. */
export const SITE_SETTINGS_TAG = 'site-settings'

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

// ── Company info (key: company_info) ─────────────────────────────────────────

export interface CompanyInfo {
  name_th: string
  name_en: string
  reg_no: string
  address: string      // Thai office address, shown on Thai pages
  address_en: string   // English office address, shown on /en pages
  email: string
  phone: string
  line_oa: string
  facebook: string
  instagram: string
  tiktok: string
}

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name_th:    'บริษัท เสปซเวิร์คส จำกัด',
  name_en:    'Space Works Co., Ltd.',
  reg_no:     '0105569001611',
  address:    'Summer Hill (unit 3026), 1106 ถนนสุขุมวิท แขวงพระโขนง เขตคลองเตย กรุงเทพฯ 10110',
  address_en: 'Summer Hill (unit 3026), 1106 Sukhumvit Road, Phra Khanong, Khlong Toei, Bangkok 10110',
  email:      'support@spacesmate.com',
  phone:      '02-012-5190',   // the number the contact page has always shown
  line_oa:    '@spacesmate',
  facebook:   'https://www.facebook.com/spacesmateTH',
  instagram:  'https://www.instagram.com/spacesmate/',
  tiktok:     'https://www.tiktok.com/@spacesmate',
}

/** Stored value → complete CompanyInfo. An empty field keeps its default. */
export function normaliseCompany(v: unknown): CompanyInfo {
  const o = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>
  const out = { ...DEFAULT_COMPANY_INFO }
  for (const k of Object.keys(out) as (keyof CompanyInfo)[]) {
    const s = str(o[k])
    if (s) out[k] = s
  }
  // A social link that is not a URL would render as a relative link.
  for (const k of ['facebook', 'instagram', 'tiktok'] as const) {
    if (!/^https:\/\//.test(out[k])) out[k] = DEFAULT_COMPANY_INFO[k]
  }
  if (!out.line_oa.startsWith('@')) out.line_oa = `@${out.line_oa}`
  return out
}

export function lineUrl(c: CompanyInfo) {
  return `https://line.me/R/ti/p/${c.line_oa}`
}

export function telHref(c: CompanyInfo) {
  return `tel:${c.phone.replace(/[^\d+]/g, '')}`
}

export function companyAddress(c: CompanyInfo, locale: 'th' | 'en') {
  return locale === 'en' ? c.address_en : c.address
}

// ── Owner emails (key: email_templates) ──────────────────────────────────────

export type EmailKey = 'listing_live' | 'payment_success' | 'expiring_7d' | 'expired'

export interface EmailTemplate {
  id: EmailKey
  subject: string
  enabled: boolean
}

/**
 * The emails the site actually sends to owners. The old list also had email
 * verification (sent by Supabase Auth, not by this code), "approved" and
 * "rejected" (listings auto-publish, so neither is ever sent) and a welcome
 * email nothing called. Those are gone rather than left as switches that do
 * nothing.
 */
export const EMAIL_TEMPLATE_INFO: Record<EmailKey, { name: string; trigger: string; vars: string }> = {
  listing_live:    { name: 'ประกาศเผยแพร่แล้ว',        trigger: 'เมื่อประกาศขึ้นเว็บหลังชำระเงิน', vars: '{title} = ชื่อประกาศ' },
  payment_success: { name: 'ชำระเงินสำเร็จ',           trigger: 'เมื่อต่ออายุหรือชำระแพ็กเกจสำเร็จ', vars: '{package} = ชื่อแพ็กเกจ' },
  expiring_7d:     { name: 'แพ็กเกจใกล้หมดอายุ (7 วัน)', trigger: '7 วันก่อนแพ็กเกจหมด',            vars: '' },
  expired:         { name: 'แพ็กเกจหมดอายุ',            trigger: 'วันที่แพ็กเกจหมดอายุ',            vars: '' },
}

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  { id: 'listing_live',    subject: 'ประกาศของคุณเผยแพร่แล้ว — {title}',            enabled: true },
  { id: 'payment_success', subject: 'ชำระเงินสำเร็จ — SpacesMate {package}',        enabled: true },
  { id: 'expiring_7d',     subject: 'แพ็กเกจของคุณจะหมดอายุใน 7 วัน — SpacesMate',  enabled: true },
  { id: 'expired',         subject: 'แพ็กเกจหมดอายุแล้ว — ประกาศของคุณถูกซ่อนชั่วคราว', enabled: true },
]

/**
 * Stored value → one entry per email, in a fixed order. Rows from the old
 * list (ids '1'–'6') are ignored, so the emails keep sending exactly as they
 * did before this screen was wired up, until someone saves it.
 */
export function normaliseEmailTemplates(v: unknown): EmailTemplate[] {
  const rows = Array.isArray(v) ? (v as Record<string, unknown>[]) : []
  return DEFAULT_EMAIL_TEMPLATES.map(d => {
    const r = rows.find(x => x && x.id === d.id)
    if (!r) return d
    return { id: d.id, subject: str(r.subject) || d.subject, enabled: r.enabled !== false }
  })
}

export function fillSubject(subject: string, vars: Record<string, string>) {
  return subject.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m))
}

// ── Property types (key: property_types) ─────────────────────────────────────

export interface SiteType {
  value: PropertyType
  name_th: string
  name_en: string
  active: boolean
}

/**
 * The five types the database, search, filters and rent pages understand.
 * Settings can rename them in the listing form and turn them off there; it
 * cannot add a new one, because a new type would need search filters, landing
 * pages and labels across the site, not one more button.
 */
export const DEFAULT_PROPERTY_TYPES: SiteType[] = [
  { value: 'condo',     name_th: 'คอนโด',         name_en: 'Condo',      active: true },
  { value: 'apartment', name_th: 'อพาร์ทเม้นท์',   name_en: 'Apartment',  active: true },
  { value: 'house',     name_th: 'บ้าน',          name_en: 'House',      active: true },
  { value: 'office',    name_th: 'ออฟฟิศ',        name_en: 'Office',     active: true },
  { value: 'coworking', name_th: 'Co-Working',    name_en: 'Co-Working', active: true },
]

// The old list identified a type only by its English name.
const OLD_NAME: Record<string, PropertyType> = {
  apartment: 'apartment', condo: 'condo', house: 'house', office: 'office', 'co-working': 'coworking', coworking: 'coworking',
}

export function normalisePropertyTypes(v: unknown): SiteType[] {
  const rows = Array.isArray(v) ? (v as Record<string, unknown>[]) : []
  const list = DEFAULT_PROPERTY_TYPES.map(d => {
    const r = rows.find(x => x && (x.value === d.value || OLD_NAME[str(x.name_en).toLowerCase()] === d.value))
    if (!r) return d
    return {
      value: d.value,
      // Only a row saved by the new screen renames; the old list's Thai names
      // were longer than the form's buttons and were never shown anywhere.
      name_th: r.value === d.value ? str(r.name_th) || d.name_th : d.name_th,
      name_en: r.value === d.value ? str(r.name_en) || d.name_en : d.name_en,
      active: r.active !== false,
    }
  })
  // A form with no types cannot be submitted.
  return list.some(t => t.active) ? list : DEFAULT_PROPERTY_TYPES
}

/** Browser read for the listing form, through the public settings route. Never throws. */
export async function fetchPropertyTypes(): Promise<SiteType[]> {
  try {
    const res = await fetch('/api/settings/public?key=property_types')
    if (!res.ok) return DEFAULT_PROPERTY_TYPES
    return normalisePropertyTypes((await res.json())?.data)
  } catch {
    return DEFAULT_PROPERTY_TYPES
  }
}
