const WP_BASE = 'https://spacesmate.com/wp-json/wp/v2'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WPProperty {
  id: number
  slug: string
  link: string
  title: { rendered: string }
  excerpt: { rendered: string }
  property_meta: Record<string, string[]>
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string
      media_details?: { sizes?: { large?: { source_url: string }; medium?: { source_url: string } } }
    }>
  }
}

export interface WPPost {
  id: number
  slug: string
  date: string
  link: string
  title: { rendered: string }
  excerpt: { rendered: string }
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>
    'wp:term'?: Array<Array<{ name: string; slug: string }>>
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&hellip;/g, '…').replace(/&amp;/g, '&').trim()
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#038;/g, '&')
}

export function formatThaiDate(iso: string): string {
  const d = new Date(iso)
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

// ─── API Fetchers ─────────────────────────────────────────────────────────────

export async function getWPProperties(count = 6): Promise<WPProperty[]> {
  try {
    const res = await fetch(
      `${WP_BASE}/property?per_page=${count}&status=publish&_embed=wp:featuredmedia`,
      { next: { revalidate: 300 } }  // ISR: 5 min cache
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function getWPPosts(count = 3): Promise<WPPost[]> {
  try {
    const res = await fetch(
      `${WP_BASE}/posts?per_page=${count}&status=publish&_embed=wp:featuredmedia,wp:term`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

// ─── Data Extractors ──────────────────────────────────────────────────────────

export function getPropMeta(p: WPProperty) {
  const m = p.property_meta || {}
  return {
    price:     m.fave_property_price?.[0]     || '',
    bedrooms:  m.fave_property_bedrooms?.[0]  || '',
    bathrooms: m.fave_property_bathrooms?.[0] || '',
    size:      m.fave_property_size?.[0]      || '',
    address:   m.fave_property_address?.[0]   || '',
    lat:       m.houzez_geolocation_lat?.[0]  || '',
    lng:       m.houzez_geolocation_long?.[0] || '',
  }
}

export function getPropImage(p: WPProperty): string {
  const media = p._embedded?.['wp:featuredmedia']?.[0]
  return (
    media?.media_details?.sizes?.large?.source_url ||
    media?.source_url ||
    ''
  )
}

export function getPropTitle(p: WPProperty): string {
  return decodeHtmlEntities(p.title.rendered)
}

export function getPostImage(p: WPPost): string {
  return p._embedded?.['wp:featuredmedia']?.[0]?.source_url || ''
}

export function getPostCategory(p: WPPost): string {
  return p._embedded?.['wp:term']?.[0]?.[0]?.name || 'บทความ'
}

export function getPostTitle(p: WPPost): string {
  return decodeHtmlEntities(p.title.rendered)
}

export function getPostExcerpt(p: WPPost): string {
  return stripHtml(p.excerpt.rendered).slice(0, 100) + '…'
}
