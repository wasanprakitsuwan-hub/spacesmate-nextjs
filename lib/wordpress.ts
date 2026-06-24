const WP_BASE = 'https://spacesmate.com/wp-json/wp/v2'

const FETCH_OPTS = {
  next: { revalidate: 300 }, // 5-min cache
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WPPost {
  id: number
  slug: string
  date: string
  title: { rendered: string }
  excerpt: { rendered: string }
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string; alt_text: string }>
    'wp:term'?: Array<Array<{ name: string }>>
  }
}

export interface WPProperty {
  id: number
  slug: string
  title: { rendered: string }
  property_meta: {
    fave_property_price?: string[]
    fave_property_bedrooms?: string[]
    fave_property_bathrooms?: string[]
    fave_property_size?: string[]
    fave_property_size_prefix?: string[]
    fave_property_address?: string[]
    fave_property_location?: string[]
    fave_property_map_address?: string[]
  }
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string; alt_text: string }>
    'wp:term'?: Array<Array<{ name: string; slug: string }>>
  }
}

// ─── Blog Posts ───────────────────────────────────────────────────────────────

export async function getWPPosts(count = 3): Promise<WPPost[]> {
  try {
    const res = await fetch(
      `${WP_BASE}/posts?per_page=${count}&_embed=1&status=publish`,
      FETCH_OPTS
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export function getPostImage(post: WPPost): string {
  return post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? ''
}

export function getPostCategory(post: WPPost): string {
  return post._embedded?.['wp:term']?.[0]?.[0]?.name ?? 'บทความ'
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

export function formatWPDate(dateStr: string): string {
  const d = new Date(dateStr)
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`
}

// ─── Property Listings ────────────────────────────────────────────────────────

export async function getWPProperties(count = 6): Promise<WPProperty[]> {
  try {
    const res = await fetch(
      `${WP_BASE}/property?per_page=${count}&_embed=1&status=publish`,
      FETCH_OPTS
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export function getPropertyImage(p: WPProperty): string {
  return p._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? ''
}

export function getPropertyType(p: WPProperty): string {
  const terms = p._embedded?.['wp:term'] ?? []
  for (const group of terms) {
    for (const t of group) {
      if (['apartment','condo','house','office','coworking'].includes(t.slug)) return t.slug
    }
  }
  return 'property'
}

export function getPropertyPrice(p: WPProperty): number {
  const raw = p.property_meta?.fave_property_price?.[0] ?? '0'
  return parseInt(raw.replace(/[^0-9]/g, ''), 10) || 0
}

export function getPropertyAddress(p: WPProperty): string {
  return (
    p.property_meta?.fave_property_map_address?.[0] ||
    p.property_meta?.fave_property_address?.[0] ||
    p.property_meta?.fave_property_location?.[0] ||
    'กรุงเทพมหานคร'
  )
}
