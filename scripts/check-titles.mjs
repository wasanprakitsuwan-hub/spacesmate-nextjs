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
const files = globSync('app/**/*.tsx')
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
    const m = line.match(/title:\s*['"`]([^'"`]*)['"`]/)
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
