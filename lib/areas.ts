import { createServerClient } from '@/lib/supabase'
import { slugify } from '@/lib/slug'

/**
 * Data-driven area pages.
 *
 * WHY
 *   /area/[slug] previously served 16 hand-written slugs, and matched listings to
 *   them by substring-searching district and address_th for terms like 'บางนา'.
 *   That capped the SEO surface at 16 pages — RentHub covers the same market with
 *   thousands — and matched unreliably, since a listing whose address happened not
 *   to contain the term simply never appeared.
 *
 *   Every listing already carries a clean structured `district` (เขตบางนา, เขตวัฒนา
 *   …) and `property_type`. So the pages can be generated from real inventory and
 *   matched exactly, with no hand-maintained list and no substring guessing.
 *
 * SLUG SHAPE
 *   Thai, matching how people actually search and how RentHub ranks:
 *     /area/เช่าคอนโด-บางนา
 *     /area/เช่าอพาร์ทเม้นท์-วัฒนา
 *
 * THIN-PAGE GUARD
 *   A combination only becomes a page once it has MIN_LISTINGS. A page showing
 *   zero or one property is worse than no page — it reads as thin content and
 *   gives a visitor nothing.
 */

const MIN_LISTINGS = 1

export const TYPE_TH: Record<string, string> = {
  condo:     'คอนโด',
  apartment: 'อพาร์ทเม้นท์',
  house:     'บ้าน',
  office:    'ออฟฟิศ',
  coworking: 'โคเวิร์กกิ้งสเปซ',
}

export const TYPE_EN: Record<string, string> = {
  condo:     'Condo',
  apartment: 'Apartment',
  house:     'House',
  office:    'Office',
  coworking: 'Co-working Space',
}

export type GeneratedArea = {
  slug: string
  district: string        // exact DB value, e.g. 'เขตบางนา' — used for matching
  districtLabel: string   // display, e.g. 'บางนา'
  propertyType: string
  labelTh: string
  labelEn: string
  count: number
}

/** 'เขตบางนา' → 'บางนา'. The เขต prefix is official but nobody searches with it. */
export function stripDistrictPrefix(d: string): string {
  return String(d || '').replace(/^เขต\s*/, '').trim()
}

export function areaSlug(district: string, propertyType: string): string {
  const t = TYPE_TH[propertyType] ?? propertyType
  return slugify(`เช่า${t}-${stripDistrictPrefix(district)}`, 80)
}

/**
 * Every (district, property_type) pair with enough live inventory to deserve a
 * page. Returns [] rather than throwing — a failure here must not break the build.
 */
export async function getGeneratedAreas(): Promise<GeneratedArea[]> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('properties')
      .select('district, property_type')
      .eq('listing_status', 'active')
      .not('district', 'is', null)
      .limit(5000)

    if (error) {
      console.error('areas: query failed —', error.message)
      return []
    }

    const tally = new Map<string, GeneratedArea>()

    for (const row of data ?? []) {
      const district = String(row.district ?? '').trim()
      const type     = String(row.property_type ?? '').trim().toLowerCase()
      if (!district || !type) continue

      const slug = areaSlug(district, type)
      if (!slug) continue

      const existing = tally.get(slug)
      if (existing) {
        existing.count += 1
        continue
      }

      const label = stripDistrictPrefix(district)
      tally.set(slug, {
        slug,
        district,
        districtLabel: label,
        propertyType: type,
        labelTh: `เช่า${TYPE_TH[type] ?? type} ${label}`,
        labelEn: `${TYPE_EN[type] ?? type} for Rent in ${label}`,
        count: 1,
      })
    }

    return Array.from(tally.values())
      .filter(a => a.count >= MIN_LISTINGS)
      .sort((a, b) => b.count - a.count)
  } catch (err) {
    console.error('areas: unavailable —', err)
    return []
  }
}

/** Resolve one generated area by slug. */
export async function getGeneratedArea(slug: string): Promise<GeneratedArea | null> {
  const all = await getGeneratedAreas()
  return all.find(a => a.slug === decodeURIComponent(slug)) ?? null
}
