import type { Locale } from '@/lib/routes-i18n'

/**
 * The pure text helpers behind blog articles: no Supabase, no React, so they
 * can be tested on their own and imported anywhere. lib/blog-links supplies the
 * place list from the database and calls applyLinks.
 */

const MAX_LINKS = 5

export type PlaceTerm = { term: string; path: string; label: string; count: number }

export type LinkTarget = { path: string; label: string; count: number }

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const BLOCKING = /^(a|h[1-6]|script|style|code|pre|figcaption)$/i

export type LinkedArticle = { html: string; mentioned: LinkTarget[] }

/** The pure half of linkPlaces, given the place terms. */
export function applyLinks(html: string, terms: PlaceTerm[], locale: Locale): LinkedArticle {
  if (!terms.length) return { html, mentioned: [] }

  const byTerm = new Map<string, PlaceTerm>()
  for (const t of terms) if (!byTerm.has(t.term.toLowerCase())) byTerm.set(t.term.toLowerCase(), t)
  const alt = terms.map(t => escapeRe(t.term)).join('|')
  const re = locale === 'en' ? new RegExp(`\\b(${alt})\\b`, 'gi') : new RegExp(`(${alt})`, 'g')

  const prefix = locale === 'en' ? '/en' : ''
  // Paths the author already linked count as linked.
  const linked = new Set<string>()
  for (const m of Array.from(html.matchAll(/href="([^"]*)"/g))) {
    try { linked.add(decodeURI(m[1]).replace(/^https?:\/\/(www\.)?spacesmate\.com/, '').replace(/^\/en(?=\/)/, '')) } catch { /* malformed href */ }
  }
  const mentioned = new Map<string, LinkTarget>()
  let added = 0
  let blockDepth = 0

  const out = html.split(/(<[^>]+>)/).map(part => {
    if (part.startsWith('<')) {
      const m = part.match(/^<\s*(\/)?\s*([a-z0-9]+)/i)
      if (m && BLOCKING.test(m[2]) && !/\/\s*>$/.test(part)) blockDepth = Math.max(0, blockDepth + (m[1] ? -1 : 1))
      return part
    }
    if (!part.trim()) return part
    return part.replace(re, (match: string) => {
      const t = byTerm.get(match.toLowerCase())
      if (!t) return match
      if (!mentioned.has(t.path)) mentioned.set(t.path, { path: t.path, label: t.label, count: t.count })
      if (blockDepth > 0 || added >= MAX_LINKS || linked.has(t.path)) return match
      linked.add(t.path)
      added++
      return `<a href="${encodeURI(prefix + t.path)}">${match}</a>`
    })
  }).join('')

  return {
    html: out,
    mentioned: Array.from(mentioned.values()).sort((a, b) => b.count - a.count).slice(0, 6),
  }
}

/**
 * Links written before the 24 Oct 2026 renames still point at /submit and
 * /pricing, or at www.spacesmate.com. They work through redirects, but each is
 * an extra hop for crawlers. Rewritten at render so old rows need no editing.
 */
export function rewriteLegacyLinks(html: string): string {
  return html.replace(/href="([^"]*)"/g, (whole, href: string) => {
    let h = href.replace(/^https?:\/\/(www\.)?spacesmate\.com(?=\/|$)/i, '') || '/'
    if (h === href && !h.startsWith('/')) return whole
    h = h.replace(/^(\/en)?\/submit(?=[/?#]|$)/, '$1/list-your-property')
      .replace(/^(\/en)?\/pricing(?=[?#]|$)/, '$1/list-your-property#packages')
    return `href="${h}"`
  })
}

/** A brand suffix typed into a post title ("…, pipe, SpacesMate"): kept out of headings and cards. */
export function cleanPostTitle(title: string): string {
  return title.replace(/\s*[|\-–—]\s*SpacesMate\s*$/i, '').trim() || title
}

/**
 * Meta description with a floor: a hand-written one under MIN_DESC characters
 * is topped up from the article text, so a search result never shows a
 * half-sentence. Over-long ones are left to the editor's counter.
 */
const MIN_DESC = 110
const MAX_DESC = 155

export function postDescription(metaDesc: string | null | undefined, contentHtml: string, fallback: string): string {
  const text = contentHtml.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
  const own = (metaDesc ?? '').trim()
  const base = own.length >= MIN_DESC ? own : [own, text].filter(Boolean).join(own ? ' ' : '')
  if (!base) return fallback
  if (base.length <= MAX_DESC) return base
  const cut = base.slice(0, MAX_DESC)
  const space = cut.lastIndexOf(' ')
  return (space > MIN_DESC ? cut.slice(0, space) : cut).trim() + '…'
}
