/**
 * District and province names, in the reader's language.
 *
 * Owner-supplied free text everywhere else on a listing stays as the owner wrote
 * it. District and province are the exception: they are not free text in spirit —
 * they come from a fixed national list — so they can be translated without
 * putting words in the owner's mouth.
 *
 * This also papers over a data problem. The district column is free text, and
 * the same district arrives spelled several ways: "ประเวศ" and "เขตประเวศ" are
 * both in the live data and are the same place. Stripping the prefix before the
 * lookup collapses them, which fixes the English label and, more usefully, means
 * anything grouping by the *returned* label counts them once.
 *
 * It does not fix the stored data — two rows still disagree in the database, and
 * a query that groups on the raw column still sees two districts. That needs a
 * migration plus a picker on the listing form, which is a separate job.
 */
import { DISTRICT_EN_BY_PAIR, PROVINCE_EN } from '@/lib/thai-districts.generated'

/**
 * Bare district name → English, for names that exist in exactly one province.
 *
 * Derived from the province-qualified keys rather than generated alongside them,
 * so the data lives in one shape and the two can never disagree. Built once at
 * module load; the table is ~930 entries.
 */
const DISTRICT_EN_BY_NAME: Record<string, string> = (() => {
  const seen: Record<string, number> = {}
  const out: Record<string, string> = {}
  for (const key of Object.keys(DISTRICT_EN_BY_PAIR)) {
    const name = key.slice(key.indexOf('|') + 1)
    seen[name] = (seen[name] ?? 0) + 1
  }
  for (const [key, en] of Object.entries(DISTRICT_EN_BY_PAIR) as [string, string][]) {
    const name = key.slice(key.indexOf('|') + 1)
    if (seen[name] === 1) out[name] = en
  }
  return out
})()

export type Locale = 'th' | 'en'

/**
 * Thai district values arrive with or without their administrative prefix:
 * "เขต" in Bangkok, "อำเภอ" (or the abbreviation "อ.") elsewhere. The source
 * data stores the bare name with the prefix in its own field, so strip before
 * matching. Also tolerates a Latin "Khet"/"Amphoe" prefix, which turns up in
 * addresses typed from an English source.
 */
export function stripDistrictPrefix(value: string): string {
  return String(value ?? '')
    .trim()
    .replace(/^(เขต|อำเภอ|อ\.)\s*/, '')
    .replace(/^(khet|amphoe|amphur)\s+/i, '')
    .trim()
}

/**
 * English name for a Thai district, or null when it is not in the national list.
 *
 * Province-qualified first: a couple of district names exist in more than one
 * province, and guessing between them would put a listing in the wrong place.
 * Falls back to the bare name, which the generator only emits where it is unique.
 */
export function districtEn(district: string | null | undefined, province?: string | null): string | null {
  const bare = stripDistrictPrefix(district ?? '')
  if (!bare) return null
  if (province) {
    const pair = DISTRICT_EN_BY_PAIR[`${String(province).trim()}|${bare}`]
    if (pair) return pair
  }
  return DISTRICT_EN_BY_NAME[bare] ?? null
}

/** English name for a Thai province, or null when unknown. */
export function provinceEn(province: string | null | undefined): string | null {
  const key = String(province ?? '').trim()
  if (!key) return null
  return PROVINCE_EN[key] ?? null
}

/**
 * The label to render for a listing's location.
 *
 * Thai is returned untouched — including the owner's own prefix, because that is
 * how a Thai reader expects to see it. English falls back to the Thai string
 * when the value is not in the national list, which is better than an empty
 * slot: an unrecognised district is usually a typo or a neighbourhood name, and
 * showing it still tells the reader something.
 */
export function districtLabel(
  district: string | null | undefined,
  province: string | null | undefined,
  locale: Locale,
): string {
  const raw = String(district ?? '').trim()
  if (locale === 'th') return raw
  return districtEn(raw, province) ?? raw
}

/** Same rule for province. */
export function provinceLabel(province: string | null | undefined, locale: Locale): string {
  const raw = String(province ?? '').trim()
  if (locale === 'th') return raw
  return provinceEn(raw) ?? raw
}
