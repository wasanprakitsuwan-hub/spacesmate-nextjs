/**
 * Check lib/routes-i18n against the filesystem.
 *
 * The table says which routes have an English page. If it claims one that does
 * not exist, every link to it becomes a 404 for English readers. If it misses
 * one that does exist, the page is live but unreachable by link — only by typing
 * the URL or by the toggle.
 *
 * Neither failure shows up in `tsc` or `next build`, and both are the kind of
 * thing that happens months later when someone adds a page and forgets the
 * table. So:
 *
 *     node scripts/check-route-i18n.mjs
 *
 * Exits non-zero on a mismatch, so it can go in CI.
 */
import { readFileSync } from 'node:fs'
import { globSync } from 'node:fs'

// ── what the table claims ─────────────────────────────────────────────────────
const src = readFileSync('lib/routes-i18n.ts', 'utf8')
const staticBlock = src.slice(src.indexOf('const EN_STATIC'), src.indexOf('*/', src.indexOf('const EN_STATIC')))
const claimed = new Set([...staticBlock.matchAll(/'(\/[^']*)'/g)].map(m => m[1]))
const prefixes = [...src.slice(src.indexOf('const EN_DYNAMIC_PREFIXES'), src.indexOf('\n', src.indexOf('const EN_DYNAMIC_PREFIXES')))
  .matchAll(/'(\/[^']*)'/g)].map(m => m[1])

if (claimed.size === 0) throw new Error('parsed no routes out of EN_STATIC — the regex is wrong')

// ── what exists ───────────────────────────────────────────────────────────────
const enPages = globSync('app/en/**/page.tsx')
  .map(f => '/' + f.replace(/^app\/en\/?/, '').replace(/\/?page\.tsx$/, ''))
  .map(p => (p === '/' ? '/' : p.replace(/\/$/, '')))

const dynamic = enPages.filter(p => p.includes('['))
const statics = enPages.filter(p => !p.includes('[') && p !== '/')

let bad = 0
const say = (sym, msg) => console.log(`${sym} ${msg}`)

for (const p of statics) {
  if (claimed.has(p)) say('ok  ', `${p} — page exists, table lists it`)
  else { say('MISS', `app/en${p}/page.tsx exists but EN_STATIC does not list it — live but unreachable by link`); bad++ }
}
for (const p of claimed) {
  if (!statics.includes(p)) { say('DEAD', `EN_STATIC lists ${p} but app/en${p}/page.tsx does not exist — links to it 404`); bad++ }
}
for (const d of dynamic) {
  const base = d.replace(/\/\[.*$/, '/')
  const covered = prefixes.includes(base) || base === '/area/'   // /area is slug-conditional, handled in the table
  if (covered) say('ok  ', `${d} — dynamic family covered`)
  else { say('MISS', `${d} exists but no EN_DYNAMIC_PREFIXES entry covers it`); bad++ }
}

/**
 * Every English route needs a title of its own.
 *
 * The root layout's metadata defaults to Thai, so an /en route that sets no
 * title inherits "SpacesMate — ค้นหาที่พักในกรุงเทพ…". The page renders in
 * English and the browser tab, the bookmark and any shared link read Thai.
 *
 * This is invisible to the other checks: check-titles looks for a DOUBLED
 * suffix, check-en-coverage reads page content and knows nothing about
 * <title>. It happened on /en/login, and again on /en/reset-password, and
 * both times only loading the page in a browser caught it.
 */
for (const page of enPages) {
  if (page === '/') continue          // app/en/page.tsx, checked by hand
  const dir = `app/en${page}`
  const hasOwn = ['page.tsx', 'layout.tsx'].some(f => {
    try { return /(?:^|\s)(?:title:|generateMetadata)/.test(readFileSync(`${dir}/${f}`, 'utf8')) }
    catch { return false }
  })
  if (hasOwn) say('ok  ', `/en${page} — has its own title`)
  else { say('THAI', `/en${page} sets no title — inherits the root layout's Thai default`); bad++ }
}

console.log(bad === 0
  ? `\n${statics.length + dynamic.length} English routes, table agrees with the filesystem, every one titled.`
  : `\n${bad} mismatch(es).`)
process.exit(bad === 0 ? 0 : 1)
