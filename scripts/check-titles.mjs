/**
 * Catch page titles that repeat the brand suffix.
 *
 * The root layout sets:
 *
 *     title: { default: '…', template: '%s | SpacesMate' }
 *
 * so Next appends "| SpacesMate" to every page-level `title`. A page that
 * includes the suffix itself renders it twice:
 *
 *     เข้าสู่ระบบ | SpacesMate | SpacesMate
 *
 * This kept coming back — /submit/new, /manage, /login, /en and five others,
 * each found by eye on a different day, because nothing fails when it happens.
 * It is not a type error, it does not break the build, and the page renders
 * perfectly. It only looks sloppy in a browser tab, a bookmark, a shared link
 * and a search result.
 *
 * WHAT IS NOT A BUG
 *   openGraph.title and twitter.title are standalone — Next does NOT apply the
 *   template to them. They SHOULD carry the brand, since they appear alone in
 *   a social card. This script skips anything inside those blocks.
 *
 *     node scripts/check-titles.mjs
 *
 * Exits non-zero on a repeat, so it can go in CI.
 */
import { readFileSync } from 'node:fs'
import { findFiles } from './lib/walk.mjs'

const SUFFIX = '| SpacesMate'
/**
 * app/ AND lib/ — the first version scanned only app/, and missed all 14
 * metaTitle entries in the dictionaries, which is where most page titles
 * actually come from. Four routes stayed broken after a fix that reported
 * clean, because page metadata overrides layout metadata and the page was
 * reading lib/.
 */
const files = [...findFiles('app', ['.tsx']), ...findFiles('lib', ['.ts'])]
const hits = []

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n')
  // Track whether we are inside an openGraph / twitter block, where the brand
  // belongs. Depth-counting rather than a flag: these blocks nest (images[],
  // for instance) and a naive flag closes on the first inner brace.
  let depth = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (depth === 0 && /\b(openGraph|twitter)\s*:\s*\{/.test(line)) {
      depth = 1
      continue
    }
    if (depth > 0) {
      depth += (line.match(/\{/g) ?? []).length
      depth -= (line.match(/\}/g) ?? []).length
      if (depth <= 0) depth = 0
      continue
    }
    /**
     * Enumerating shapes did not work. Four attempts, four misses:
     *
     *   title: '…'                          caught on pass 1
     *   metaTitle: '…'                      missed — key was not exactly "title"
     *   const title = `…`                   missed — not a property at all
     *   privacyMetaTitle: '…'               missed — prefixed key
     *   title: isEn ? '…' : '…'             missed — value is not the next token
     *
     * Each pass reported clean while production was still full of them. So stop
     * matching shapes: if a line mentions an identifier ending in "title" and
     * is not inside openGraph/twitter, check EVERY quoted string on it. Broad
     * and occasionally noisy beats narrow and trusted.
     */
    const key = line.match(/(\w*title\w*)\s*[:=]/i)
    if (!key) continue

    /**
     * Keys that SHOULD carry the brand, so not a finding:
     *
     *   ogTitle / twitterTitle   a dictionary entry fed to openGraph.title,
     *                            which Next does not template. It appears
     *                            alone in a social card and needs the brand.
     *   *template*               the admin SEO settings form stores the
     *                            template itself, which is literally
     *                            "%s | SpacesMate".
     *
     * These are matched on the KEY rather than by position, because the
     * openGraph-block depth tracking above cannot see a dictionary where the
     * key is og-ish but the object is not an openGraph block.
     */
    if (/^(og|twitter)/i.test(key[1]) || /template/i.test(key[1])) continue

    for (const q of line.matchAll(/['"`]([^'"`]*)['"`]/g)) {
      if (q[1].includes(SUFFIX)) {
        hits.push({ file, line: i + 1, title: q[1] })
      }
    }
  }
}

if (hits.length === 0) {
  console.log(`Checked ${files.length} files. No page title repeats "${SUFFIX}".`)
  process.exit(0)
}

console.log(`${hits.length} page title(s) repeat "${SUFFIX}" — the root template adds it already:\n`)
for (const h of hits) {
  console.log(`  ${h.file}:${h.line}`)
  console.log(`    title:   "${h.title}"`)
  console.log(`    renders: "${h.title} ${SUFFIX}"`)
  console.log(`    fix:     "${h.title.replace(` ${SUFFIX}`, '')}"\n`)
}
process.exit(1)
