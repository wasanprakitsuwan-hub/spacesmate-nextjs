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
import { globSync } from 'node:fs'

const SUFFIX = '| SpacesMate'
/**
 * app/ AND lib/ — the first version scanned only app/, and missed all 14
 * metaTitle entries in the dictionaries, which is where most page titles
 * actually come from. Four routes stayed broken after a fix that reported
 * clean, because page metadata overrides layout metadata and the page was
 * reading lib/.
 */
const files = [...globSync('app/**/*.tsx'), ...globSync('lib/*.ts')]
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
     * Three shapes, all of which end up as the page title:
     *
     *   title:      '…'    on a page or layout
     *   metaTitle:  '…'    in a dictionary — where most page titles live
     *   const title = `…`  built into a variable, then returned
     *
     * The first pass caught only the first shape and reported clean while four
     * routes were still broken. The second missed the area pages, which build
     * theirs into a variable. A detector that is narrower than the thing it
     * detects is worse than none, because it is believed.
     */
    const m =
      line.match(/(?:^|[\s{])(?:meta)?[Tt]itle:\s*['"`]([^'"`]*)['"`]/) ??
      line.match(/\b(?:const|let)\s+\w*[Tt]itle\w*\s*=\s*[^'"`]*['"`]([^'"`]*)['"`]/)
    if (m && m[1].includes(SUFFIX)) {
      hits.push({ file, line: i + 1, title: m[1] })
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
