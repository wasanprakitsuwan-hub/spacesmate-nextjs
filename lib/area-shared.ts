/**
 * Shared data and strings for the area landing pages.
 *
 * The Thai page (`/area/[slug]`) and the English page (`/en/area/[slug]`) were
 * two near-identical 300+ line files. They had already drifted, and a schema fix
 * on 10 October had to be applied twice by hand — once in each copy. This module
 * plus `components/area/AreaPageBody` is the single implementation they now share.
 *
 * Both locales now serve both kinds of area page: the 16 hand-written ones and
 * the data-driven ones (one per district × property type with live inventory).
 * The English side used to serve the hand-written 16 only and 404 for the rest,
 * which left the larger half of the SEO surface — the pages that actually
 * compete for area queries — reachable in Thai alone.
 */
import { AREA_KEYWORDS } from '@/lib/constants'
import type { AreaKeyword } from '@/lib/types'
import { getGeneratedArea, getGeneratedAreas } from '@/lib/areas'
import { AREA_CONTENT, type AreaContent } from '@/lib/area-content'
import { createServerClient } from '@/lib/supabase'

export type Locale = 'th' | 'en'

export const SITE = 'https://spacesmate.com'

/** Area slug → terms matched against a listing's district and address text. */
export const AREA_MATCH: Record<string, { type: string; terms: string[] }> = {
  'condo-rent-bts-asok':            { type: 'Condo',      terms: ['asok','อโศก','sukhumvit 21','สุขุมวิท 21'] },
  'apartment-rent-sukhumvit':       { type: 'Apartment',  terms: ['sukhumvit','สุขุมวิท'] },
  'condo-rent-bts-ekkamai':         { type: 'Condo',      terms: ['ekkamai','เอกมัย'] },
  'house-rent-lat-phrao':           { type: 'Apartment',  terms: ['lat phrao','ลาดพร้าว'] },
  'condo-rent-bts-thonglor':        { type: 'Condo',      terms: ['thonglor','ทองหล่อ','thong lor'] },
  'office-rent-silom':              { type: 'Office',     terms: ['silom','สีลม'] },
  'condo-rent-bts-on-nut':          { type: 'Condo',      terms: ['on nut','อ่อนนุช','on-nut'] },
  'apartment-rent-ratchada':        { type: 'Apartment',  terms: ['ratchada','รัชดา','ratchadaphisek'] },
  'house-rent-rama-9':              { type: 'Apartment',  terms: ['rama 9','พระราม 9','rama9'] },
  'condo-rent-mrt-lat-phrao':       { type: 'Condo',      terms: ['lat phrao','ลาดพร้าว'] },
  'coworking-rent-sukhumvit':       { type: 'Co-Working', terms: ['sukhumvit','สุขุมวิท'] },
  'condo-rent-bts-saphan-kwai':     { type: 'Condo',      terms: ['saphan kwai','สะพานควาย'] },
  'condo-rent-bts-ari':             { type: 'Condo',      terms: ['ari','อารีย์','aree'] },
  'apartment-rent-bang-na':         { type: 'Apartment',  terms: ['bang na','บางนา','bangna'] },
  'condo-rent-mrt-phahon-yothin':   { type: 'Condo',      terms: ['phahon','พหลโยธิน','phahonyothin'] },
  'office-rent-sathorn':            { type: 'Office',     terms: ['sathorn','สาทร'] },
}

/** Card gradients, keyed by the lowercase property_type stored in Supabase. */
export const GRADS: Record<string, string> = {
  apartment: 'linear-gradient(135deg,#02402e,#036b56)',
  condo:     'linear-gradient(135deg,#036b56,#048c73)',
  office:    'linear-gradient(135deg,#4a1d1d,#8b3a3a)',
  coworking: 'linear-gradient(135deg,#02402e,#048c73)',
  house:     'linear-gradient(135deg,#02402e,#036b56)',
  default:   'linear-gradient(135deg,#02402e,#048c73)',
}

/** AREA_MATCH type labels → Supabase property_type enum values. */
export const MATCH_TYPE_TO_DB: Record<string, string> = {
  Apartment: 'apartment', Condo: 'condo', Office: 'office', 'Co-Working': 'coworking', House: 'house',
}

export const TYPE_LABELS: Record<Locale, Record<string, string>> = {
  th: { apartment: 'อพาร์ทเม้นท์', condo: 'คอนโดมิเนียม', office: 'ออฟฟิศ', coworking: 'โคเวิร์กกิ้ง', house: 'บ้าน' },
  en: { apartment: 'Apartment', condo: 'Condominium', office: 'Office Space', coworking: 'Co-Working Space', house: 'House' },
}

/**
 * Every string the template renders, per locale.
 *
 * Kept here rather than inline so the two pages cannot drift apart again, and
 * so a third locale would be a data change rather than a third copy.
 */
export const AREA_T = {
  th: {
    home: 'หน้าแรก',
    homeHref: '/',
    homeUrl: `${SITE}/`,
    search: 'ค้นหาที่พัก',
    searchNav: 'ค้นหาที่พัก',
    searchUrl: `${SITE}/search`,
    areaPath: '/area',
    subtitleSuffix: 'กรุงเทพมหานคร ประเทศไทย',
    popularArea: 'ทำเลยอดนิยม',
    listingsCount: (n: number) => `${n} ประกาศ`,
    listingsHeading: (label: string) => `ประกาศในทำเล${label}`,
    perPrice: (n: number) => `฿${n.toLocaleString()}/เดือน`,
    viewDetails: 'ดูรายละเอียด →',
    noListingsTitle: 'ยังไม่มีประกาศในทำเลนี้',
    noListingsBody: (label: string) => `ทำเล${label}กำลังเพิ่มจำนวนประกาศ ลองค้นหาทำเลใกล้เคียง`,
    browseAll: 'ดูประกาศทั้งหมด',
    whyRent: 'ทำไมถึงนิยมเช่าในย่านนี้?',
    whyRentFallback: (_label: string) => 'ทำไมถึงนิยมเช่าในย่านนี้?',
    aboutArea: 'ข้อมูลเพิ่มเติมเกี่ยวกับทำเลนี้',
    faqHeading: 'คำถามที่พบบ่อย',
    ownerTitle: 'มีทรัพย์สินในย่านนี้?',
    ownerBody: 'ลงประกาศหรือฝากบริหารกับ SpacesMate เข้าถึงผู้เช่าหลายพันคน',
    listCta: 'ลงประกาศ ฿299',
    manageCta: 'ฝากบริหาร A–Z',
    pricingLabel: 'ราคาเช่าในย่านนี้',
    relatedHeading: 'ทำเลใกล้เคียงที่น่าสนใจ',
  },
  en: {
    home: 'Home',
    /**
     * The visible link goes through LocaleLink, which turns '/' into '/en' on
     * an English page — so it has always been right. `homeUrl` does not: it is
     * a raw string in the BreadcrumbList JSON-LD, and it said `${SITE}/`, so
     * the structured data on every English area page claimed its parent was
     * the Thai home page. The comment here said "/en does not exist", which
     * stopped being true when /en shipped.
     */
    homeHref: '/',
    homeUrl: `${SITE}/en`,
    // The visible link and the breadcrumb schema deliberately differ here, as
    // they always have: the nav reads 'Search Rentals', the structured data
    // says 'Search'. Collapsing them changes the rendered page.
    search: 'Search',
    searchNav: 'Search Rentals',
    searchUrl: `${SITE}/en/search`,
    areaPath: '/en/area',
    subtitleSuffix: 'Bangkok, Thailand',
    popularArea: 'Popular Area',
    listingsCount: (n: number) => `${n} listings`,
    listingsHeading: (label: string) => `Listings in ${label}`,
    perPrice: (n: number) => `฿${n.toLocaleString()}/mo`,
    viewDetails: 'View details →',
    noListingsTitle: 'No listings yet in this area',
    noListingsBody: (label: string) => `${label} is growing — explore nearby areas in the meantime.`,
    browseAll: 'Browse all listings',
    whyRent: 'Why rent in this area?',
    whyRentFallback: (label: string) => `Why rent in ${label}?`,
    aboutArea: 'About this area',
    faqHeading: 'Frequently Asked Questions',
    ownerTitle: 'Own a property here?',
    ownerBody: 'List or manage your property with SpacesMate — reach thousands of renters.',
    listCta: 'List your property ฿299',
    manageCta: 'Full management A–Z',
    pricingLabel: 'Rental pricing here',
    relatedHeading: 'Explore nearby areas',
  },
} as const

/**
 * The visible Search link. It goes through LocaleLink, so '/search' resolves to
 * '/en/search' for an English reader — one constant is correct for both.
 *
 * The breadcrumb *schema* URL is not a link and gets no such treatment, so it
 * lives in AREA_T per locale as `searchUrl`. It used to be a shared constant
 * pointing at the Thai page, which meant the structured data and the visible
 * breadcrumb on every English area page disagreed about where "Search" goes.
 */
export const SEARCH_HREF = '/search'

export type AreaProp = {
  slug: string
  property_type: string
  title_th: string
  district: string | null
  address_th: string | null
  images: string[]
  price_from: number
}

export type RelatedArea = { slug: string; label_th: string; label_en: string }

export type AreaView = {
  area: Pick<AreaKeyword, 'slug' | 'label_th' | 'label_en' | 'property_type' | 'station' | 'district'>
  /**
   * The bare place name in the reader's language — 'Bang Na', 'บางนา'.
   *
   * Headings used to interpolate the full label, which produced "Listings in
   * Condo for Rent in Bang Na" and "Condo for Rent in Bang Na is growing".
   * The label is an SEO phrase and belongs in the h1 and the <title>; a
   * sentence needs the place. Resolved here rather than in the component so
   * there is one rule, not one per heading.
   */
  placeLabel: string
  content: AreaContent | undefined
  areaProps: AreaProp[]
  related: RelatedArea[]
  /** True when this is a data-driven page with no hand-written content. */
  isGenerated: boolean
}

const LISTING_COLUMNS = 'slug, property_type, title_th, district, address_th, images, price_from'

/**
 * Resolve everything an area page renders. Returns null when the slug is
 * unknown, which the route turns into notFound().
 *
 * Both locales resolve data-driven areas. The `locale` parameter no longer
 * gates which slugs exist — it only selects labels — so a slug 404s in both
 * languages or in neither. lib/routes-i18n depends on that symmetry: it
 * prefixes /area/* unconditionally, which is only safe while the two sides
 * agree on which slugs are real.
 */
export async function loadArea(slug: string, locale: Locale): Promise<AreaView | null> {
  const hardcoded = AREA_KEYWORDS.find(a => a.slug === slug)
  const generated = hardcoded ? null : await getGeneratedArea(slug)
  if (!hardcoded && !generated) return null

  const area = hardcoded ?? {
    slug: generated!.slug,
    label_th: generated!.labelTh,
    label_en: generated!.labelEn,
    property_type: generated!.propertyType as AreaKeyword['property_type'],
    /**
     * `district` is rendered straight into prose in BOTH locales —
     * "ย่าน{district} มีสิ่งอำนวยความสะดวก" and "the {district} district has
     * everything you need" — so it has to follow the reader. Hence the switch.
     *
     * Note the trap: `district` on an AreaKeyword is already romanised
     * ('Sukhumvit'), while GeneratedArea.district is the exact Thai DB value
     * ('เขตบางนา') kept for matching. Same field name, opposite contents.
     * Neither raw value is right here — Thai wants districtLabel, English
     * wants districtLabelEn.
     */
    district: locale === 'en' ? generated!.districtLabelEn : generated!.districtLabel,
  }

  /**
   * The bare place name for prose. Hand-written areas carry it explicitly;
   * data-driven ones already have it as the district label, which is what the
   * place IS for those pages.
   */
  const placeLabel = hardcoded
    ? (locale === 'en' ? hardcoded.place_en : hardcoded.place_th)
    : (locale === 'en' ? generated!.districtLabelEn : generated!.districtLabel)

  const content = AREA_CONTENT[slug]
  const match = AREA_MATCH[slug]
  let areaProps: AreaProp[] = []

  if (generated) {
    // Exact field match — no substring guessing. This is the whole point of
    // generating from data: a listing cannot be missed because its address text
    // happened not to contain the area name.
    const supabase = createServerClient()
    const { data } = await supabase
      .from('properties')
      .select(LISTING_COLUMNS)
      .eq('listing_status', 'active')
      .eq('property_type', generated.propertyType)
      .eq('district', generated.district)
    areaProps = (data ?? []) as AreaProp[]
  } else if (match) {
    const supabase = createServerClient()
    const dbType = MATCH_TYPE_TO_DB[match.type] ?? match.type.toLowerCase()
    const { data } = await supabase
      .from('properties')
      .select(LISTING_COLUMNS)
      .eq('listing_status', 'active')
      .eq('property_type', dbType)
    if (data) {
      areaProps = (data as AreaProp[]).filter(p => {
        const haystack = [p.district, p.address_th].join(' ').toLowerCase()
        return match.terms.some(t => haystack.includes(t.toLowerCase()))
      })
    }
  }

  let related: RelatedArea[] = AREA_KEYWORDS
    .filter(a => a.slug !== slug && a.property_type === area.property_type)
    .slice(0, 4)
    .map(a => ({ slug: a.slug, label_th: a.label_th, label_en: a.label_en }))

  if (generated) {
    const all = await getGeneratedAreas()
    related = all
      .filter(a => a.slug !== generated.slug && a.propertyType === generated.propertyType)
      .slice(0, 4)
      .map(a => ({ slug: a.slug, label_th: a.labelTh, label_en: a.labelEn }))
  }

  return { area, placeLabel, content, areaProps, related, isGenerated: Boolean(generated) }
}

/** Metadata for both locales. Mirrors exactly what each page produced before. */
export async function buildAreaMetadata(slug: string, locale: Locale) {
  const area = AREA_KEYWORDS.find(a => a.slug === slug)

  if (!area) {
    const gen = await getGeneratedArea(slug)
    if (!gen) return { title: locale === 'en' ? 'Page not found' : 'ไม่พบหน้า' }

    /**
     * Data-driven area pages, both locales.
     *
     * The English half of this used to be a single line returning
     * { title: 'Page not found' } for any slug not in AREA_KEYWORDS — which was
     * honest while /en/area 404'd for those slugs, and became a lie the moment
     * it stopped. A metadata function that says "Page not found" about a page
     * that renders fine is the worst of both: the page is indexed, with that
     * as its title.
     *
     * Both now declare each other as hreflang alternates. encodeURI matters on
     * the Thai side — these slugs are Thai text, so the raw string is not a
     * valid URL.
     */
    const thUrl = `/area/${encodeURI(gen.slug)}`
    const enUrl = `/en/area/${encodeURI(gen.slug)}`
    const languages = { th: thUrl, en: enUrl }

    if (locale === 'en') {
      const title = `${gen.labelEn} — ${gen.count} listing${gen.count === 1 ? '' : 's'}`
      const description =
        `${gen.labelEn} — ${gen.count} rental listing${gen.count === 1 ? '' : 's'} in Bangkok. ` +
        `Compare prices and photos, and contact owners directly on SpacesMate.`
      return {
        title,
        description,
        openGraph: { title, description, type: 'website' as const },
        alternates: { canonical: enUrl, languages },
      }
    }

    const title = `${gen.labelTh} — ${gen.count} ประกาศ`
    const description =
      `${gen.labelTh} ในกรุงเทพฯ รวม ${gen.count} ประกาศให้เช่า ` +
      `ดูราคา รูปภาพ และติดต่อเจ้าของโดยตรงที่ SpacesMate`
    return {
      title,
      description,
      openGraph: { title, description, type: 'website' as const },
      alternates: { canonical: thUrl, languages },
    }
  }

  const content = AREA_CONTENT[slug]

  if (locale === 'en') {
    const title = content ? content.headline_en : area.label_en
    const description = content
      ? content.body_en[0].slice(0, 155)
      : `${area.label_en} in Bangkok — browse verified rentals and pricing on SpacesMate`
    return {
      title,
      description,
      openGraph: { title, description, type: 'website' as const },
      alternates: { canonical: `/en/area/${slug}`, languages: { th: `/area/${slug}` } },
    }
  }

  const description = content
    ? content.body_th[0].slice(0, 155)
    : `${area.label_th} ในกรุงเทพมหานคร — ดูรายการที่พักและราคาที่ SpacesMate`
  const title = content ? content.headline_th : area.label_en
  return {
    title,
    description,
    openGraph: { title, description, type: 'website' as const },
    alternates: { canonical: `/area/${slug}`, languages: { en: `/en/area/${slug}` } },
  }
}
