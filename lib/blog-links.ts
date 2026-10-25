import { cache } from 'react'
import { createServerClient } from '@/lib/supabase'
import { listRentPages, loadRentPlaces } from '@/lib/rent-pages'
import { listDistrictPages } from '@/lib/district-pages'
import { rentPlaceKey } from '@/lib/rent-slugs'
import type { Locale } from '@/lib/routes-i18n'
import { applyLinks, type LinkedArticle, type LinkTarget, type PlaceTerm } from '@/lib/blog-text'

export { cleanPostTitle, postDescription, rewriteLegacyLinks } from '@/lib/blog-text'

/**
 * Server-side helpers for blog articles.
 *
 * AUTO-LINKING
 *   Articles mention stations, universities and districts in passing ("ย่าน
 *   เตาปูน", "ใกล้จุฬาฯ") and used to leave them as plain text, so the blog sent
 *   no link equity to the pages that hold listings. linkPlaces() turns the first
 *   mention of each place that has a page with listings into a link to it, at
 *   render, so every existing and future article is covered without anyone
 *   editing it. Links the author wrote are left alone, and nothing is linked
 *   inside a heading or an existing <a>.
 *
 *   Capped at MAX_LINKS (lib/blog-text) per article: a paragraph where every second word is a
 *   link reads as spam to people and to Google alike.
 *
 * MATCHING
 *   Thai has no spaces between words, so a bare name can sit inside a longer
 *   one. The alternation is ordered longest first, which lets "BTS อโศก" and
 *   "เขตบางนา" win over the bare "อโศก" and "บางนา", and bare names shorter
 *   than MIN_BARE characters are not matched at all.
 */

const MIN_BARE = 4

/** Landmark aliases that are also everyday words. */
const ALIAS_STOP = new Set(['เกษตร', 'ศิลปากร'])

/**
 * Station names that are mostly used for the road, not the station: "ถนน
 * สุขุมวิท" is not a mention of MRT Sukhumvit. Their "MRT …" form still links.
 */
const BARE_STOP = new Set(['สุขุมวิท', 'เพชรบุรี', 'พหลโยธิน', 'รัชดาภิเษก', 'Sukhumvit', 'Phetchaburi', 'Phahon Yothin', 'Ratchadaphisek'])

const loadTerms = cache(async (locale: Locale): Promise<PlaceTerm[]> => {
  const [rentPages, districtPages, places] = await Promise.all([
    listRentPages(), listDistrictPages(), loadRentPlaces(),
  ])
  const byKey = new Map(places.map(p => [rentPlaceKey(p), p]))
  const terms: PlaceTerm[] = []
  const add = (term: string, t: LinkTarget) => {
    const s = term.trim()
    if (s) terms.push({ term: s, ...t })
  }
  const bare = (s: string) => (locale === 'en' ? s.length >= MIN_BARE : Array.from(s).length >= MIN_BARE)

  // Districts first: where a bare name is both a district and a station
  // (บางนา, ลาดพร้าว), the district page is the better target for the area.
  for (const d of districtPages) {
    if (d.type !== null || d.count === 0) continue
    const t = { path: d.path, label: locale === 'en' ? d.placeEn : d.placeTh, count: d.count }
    if (locale === 'en') {
      add(`${d.placeEn} district`, t)
      if (bare(d.placeEn)) add(d.placeEn, t)
    } else {
      const name = d.placeTh.replace(/^เขต/, '')
      add(`เขต${name}`, t)
      if (bare(name)) add(name, t)
    }
  }
  for (const p of rentPages) {
    if (p.type !== null || p.count === 0) continue
    const place = byKey.get(p.placeKey)
    if (!place) continue
    const t = { path: p.path, label: locale === 'en' ? p.placeEn : p.placeTh, count: p.count }
    if (place.kind === 'station') {
      const name = locale === 'en' ? place.station.en : place.station.th
      for (const sys of place.station.systems) add(`${sys} ${name}`, t)
      if (bare(name) && !BARE_STOP.has(name)) add(name, t)
    } else {
      add(locale === 'en' ? place.landmark.en : place.landmark.th, t)
      if (locale === 'th') {
        for (const a of place.landmark.aliases ?? []) {
          if (/[฀-๿]/.test(a) && bare(a) && !ALIAS_STOP.has(a)) add(a, t)
        }
      }
    }
  }
  // Longest first, so the alternation prefers the most specific name.
  return terms.sort((a, b) => b.term.length - a.term.length)
})

/**
 * Link the first mention of each place in sanitised article HTML, and report
 * every place mentioned (for the "rentals in this area" box), most listings first.
 */
export async function linkPlaces(html: string, locale: Locale): Promise<LinkedArticle> {
  let terms: PlaceTerm[]
  try {
    terms = await loadTerms(locale)
  } catch (err) {
    console.error('[blog-links]', err instanceof Error ? err.message : String(err))
    return { html, mentioned: [] }
  }
  return applyLinks(html, terms, locale)
}

/** Whether any English article is published, so an empty /en/blog stays out of Google. */
export const hasEnglishPosts = cache(async (): Promise<boolean> => {
  try {
    const { count, error } = await createServerClient()
      .from('blog_posts').select('slug', { count: 'exact', head: true })
      .eq('status', 'published').eq('language', 'en')
    if (error) throw error
    return (count ?? 0) > 0
  } catch {
    // Unknown: keep the page indexable, as it was before this check existed.
    return true
  }
})
