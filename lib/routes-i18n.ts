/**
 * Which routes have an English counterpart, and how to get from one to the other.
 *
 * ONE TABLE, TWO CONSUMERS
 *   The language toggle needs to know "does this page have a counterpart, and
 *   where". Every internal link needs to know "should this href be prefixed".
 *   Those are the same question, and until now they were answered by two
 *   separate pieces of knowledge: EN_ROUTES in lib/site-i18n and a set of
 *   regexes in components/layout/LanguageToggle. Adding an English page meant
 *   remembering to update both, and nothing failed if you didn't — the toggle
 *   would keep place while the links silently dropped to Thai, or the reverse.
 *
 *   So the table lives here, and both read it.
 *
 * THE RULE
 *   Thai lives at the root, English under /en. A link is prefixed only when the
 *   English page actually exists; otherwise it stays Thai, because a prefixed
 *   link to a page that was never built is a 404 and a Thai page is merely a
 *   Thai page. The toggle remains on screen either way.
 *
 * WHEN YOU ADD AN ENGLISH PAGE
 *   Add it to EN_STATIC (or a prefix below) and both the toggle and every link
 *   to it start working. There is nowhere else to change. The test at the bottom
 *   of this file's companion script checks the table against the filesystem.
 */
import { AREA_KEYWORDS } from '@/lib/constants'

export type Locale = 'th' | 'en'

/**
 * Static Thai routes with an English page at the same path under /en.
 * Verified against `find app/en -name page.tsx` on 16 Oct 2026.
 */
const EN_STATIC = new Set([
  '/about',
  '/blog',
  '/services',
  '/pricing',
  '/faq',
  '/contact',
  '/search',
  '/submit',
  '/submit/new',
  '/manage',
  '/login',
  '/reset-password',
  '/owner-dashboard',
  '/owner-dashboard/profile',
  '/privacy',
  '/terms',
])

/**
 * Dynamic families where every Thai page has an English one at the same slug.
 *
 * /property is the only one. The English listing page falls back to the owner's
 * Thai text where no English description was written, so it always exists —
 * it is never a 404, at worst it is partly Thai content under an English frame.
 */
const EN_DYNAMIC_PREFIXES = ['/property/']

/**
 * /area is the awkward one: the 16 hand-written area pages have English
 * versions, the data-driven ones do not. So the slug decides.
 */
const EN_AREA_SLUGS = new Set(AREA_KEYWORDS.map(a => a.slug))

/**
 * Thai-only, deliberately, and worth naming so nobody wonders:
 *   /blog/[slug]         see below — NOT a missing page
 *   /building/[slug]     no English version yet
 *   /submit/success      post-checkout, reached from Stripe
 *   /submit/cancel       likewise
 *   /dashboard/*         admin surfaces, Thai-only by design
 *
 * WHY /blog/[slug] IS ABSENT WHILE /blog IS LISTED
 *   Every article lives at /blog/<slug> whatever language it is written in, and
 *   there is no /en/blog/<slug>. That is on purpose, not an oversight.
 *
 *   Adding '/blog/' to EN_DYNAMIC_PREFIXES would claim that every Thai article
 *   has an English counterpart at the same slug. It does not — blog_posts holds
 *   zero English rows today — so every article link rendered on an /en page
 *   (BlogSection on the English home page, for one) would resolve to
 *   /en/blog/<thai-slug> and 404. The drop-back to Thai is the correct
 *   behaviour here: a Thai article is merely a Thai article, a 404 is a dead
 *   end.
 *
 *   When English articles exist, /blog/[slug] becomes slug-conditional in
 *   exactly the way /area already is — the slug decides, because a given
 *   article may be written in one language and not the other. Build
 *   app/en/blog/[slug] and gate it on the post's `language`, the way
 *   EN_AREA_SLUGS gates /area. Do not add a blanket prefix.
 */

/** Split a href into its path and whatever follows (?query, #hash). */
function splitHref(href: string): [string, string] {
  const i = href.search(/[?#]/)
  return i === -1 ? [href, ''] : [href.slice(0, i), href.slice(i)]
}

/** Trailing slash removed, except for the root. */
function normalise(path: string): string {
  return path.length > 1 && path.endsWith('/') ? path.replace(/\/+$/, '') : path
}

/** Does this Thai path have an English counterpart? */
export function hasEnglish(thaiPath: string): boolean {
  const path = normalise(thaiPath)
  if (path === '/') return true                       // → /en
  if (EN_STATIC.has(path)) return true
  if (EN_DYNAMIC_PREFIXES.some(p => path.startsWith(p))) return true

  const area = path.match(/^\/area\/(.+)$/)
  if (area) {
    const raw = area[1]
    let decoded = raw
    try { decoded = decodeURIComponent(raw) } catch { /* malformed escape — compare raw */ }
    return EN_AREA_SLUGS.has(decoded) || EN_AREA_SLUGS.has(raw)
  }

  return false
}

/** The English path for a Thai one, or null when there is no English page. */
export function enPath(thaiPath: string): string | null {
  const [path, suffix] = splitHref(thaiPath)
  if (!hasEnglish(path)) return null
  const p = normalise(path)
  return (p === '/' ? '/en' : `/en${p}`) + suffix
}

/** The Thai path for an English one. Every English page has a Thai original. */
export function thPath(englishPath: string): string {
  const [path, suffix] = splitHref(englishPath)
  const p = normalise(path)
  if (p === '/en') return '/' + suffix
  return (p.startsWith('/en/') ? p.slice(3) : p) + suffix
}

/** Is this an English path? */
export function isEnglishPath(path: string): boolean {
  const [p] = splitHref(path)
  return p === '/en' || p.startsWith('/en/')
}

/**
 * Resolve an href for the locale the reader is in.
 *
 * Pass the Thai path — it is the canonical form every component writes — and
 * this returns it unchanged for Thai readers, or its English counterpart when
 * one exists. An href with no English counterpart comes back as Thai, which is
 * the deliberate drop-back described at the top of this file.
 *
 * Already-English hrefs pass through, so this is safe to apply twice.
 */
export function localeHref(path: string, locale: Locale): string {
  if (locale !== 'en') return path
  if (isEnglishPath(path)) return path
  return enPath(path) ?? path
}
