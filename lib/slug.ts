/**
 * SpacesMate — URL slug generation
 *
 * WHY THIS EXISTS
 *   Slugs were previously generated in five separate places with three different
 *   character rules. Four of them used /[^\w\s-]/ — and \w is [A-Za-z0-9_], which
 *   strips every Thai character. Since the listing form only requires title_th,
 *   a Thai title such as "คอนโดให้เช่า ใกล้ BTS อ่อนนุช" collapsed to "bts-mdx3k9",
 *   and a fully Thai title collapsed to nothing at all.
 *
 *   For a Thai-first site that discards the one ranking signal we fully control.
 *   RentHub — the market leader for exactly these queries — serves Thai URLs.
 *
 * WHAT CHANGED
 *   The Thai Unicode block (฀–๿) is preserved. Underscores are dropped:
 *   \w allowed them, but hyphens are the conventional word separator in URLs and
 *   search engines treat underscores as joiners rather than separators.
 *
 * NOTE ON THE SLASH
 *   Condo and house listings intentionally use a two-segment slug —
 *   "building-name/condo-abc123" — which is why the property route is a catch-all.
 *   That is a deliberate hierarchy, not a bug. buildListingSlug() preserves it.
 */

/** Characters kept in a slug: Thai block, lowercase Latin, digits, space, hyphen. */
const KEEP = /[^฀-๿a-z0-9\s-]/g

/**
 * Convert arbitrary text into a URL slug segment.
 * Thai is preserved as-is; Next.js and every modern browser handle Unicode paths,
 * and Google displays them decoded in results.
 */
export function slugify(input: string, maxLen = 60): string {
  return String(input ?? '')
    .toLowerCase()          // no-op for Thai, matters for Latin
    .replace(KEEP, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLen)       // Thai is BMP, so slicing by code unit is safe here
    .replace(/-+$/g, '')    // slice may have left a trailing hyphen
}

/** Short, collision-resistant, sortable-ish suffix. */
export function shortId(): string {
  return Date.now().toString(36)
}

/**
 * Full listing slug.
 *
 * Condo and house keep the two-segment shape used across the existing site:
 *   the-sky-sukhumvit/condo-wxbl0
 * Everything else is a single segment:
 *   pasuk-palace-apartment-2dl15
 *
 * Falls back to 'listing' when the title yields nothing sluggable, so a slug is
 * never empty — an empty base previously produced URLs like "-mdx3k9".
 */
export function buildListingSlug(title: string, propertyType?: string): string {
  const id   = shortId()
  const base = slugify(title, 55) || 'listing'
  const type = (propertyType || '').toLowerCase()

  return ['condo', 'house'].includes(type)
    ? `${base}/${type}-${id}`
    : `${base}-${id}`
}
