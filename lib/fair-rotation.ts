/**
 * Fair Rotation: one shuffled order per visitor per day.
 *
 * Each visitor gets their own order of every live listing, which holds all day
 * and turns over at Bangkok midnight. Across all visitors every listing gets
 * the same share of the top spots, which is what owners pay for; a visitor who
 * comes back the same afternoon finds things where they left them.
 *
 * Browser-only (it reads localStorage). Used by the homepage's latest listings
 * and by the "แนะนำ" sort on /search.
 */

const VISITOR_KEY = 'sm_rotation_id'

/**
 * A random id for this browser, used only to seed the order. It never leaves
 * the browser. Where storage is blocked (private mode, cleared data) every
 * visit simply gets a fresh order.
 */
function visitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36)
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return Math.random().toString(36).slice(2)
  }
}

/** Today in Bangkok, so the order turns over at local midnight, not UTC's. */
function bangkokDay(): string {
  return new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10)
}

// FNV-1a, then mulberry32: small, fast, and the same sequence for the same seed.
function seedFrom(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) }
  return h >>> 0
}
function rng(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * This visitor's order for today. Sorting by key first makes the result depend
 * only on which listings are live, not on the order they arrived in.
 */
export function dailyShuffle<T>(items: T[], key: (item: T) => string): T[] {
  const rand = rng(seedFrom(`${visitorId()}:${bangkokDay()}`))
  const a = [...items].sort((x, y) => (key(x) < key(y) ? -1 : key(x) > key(y) ? 1 : 0))
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
