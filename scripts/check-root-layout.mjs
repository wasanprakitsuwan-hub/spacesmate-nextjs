/**
 * Every page must sit under a root layout.
 *
 * WHY THIS EXISTS
 *   Splitting app/layout.tsx into app/(th)/ and app/(en)/ route groups meant
 *   there was no longer a layout at app/ root. A new app/not-found.tsx was
 *   added alongside the groups rather than inside one, which looked right —
 *   a URL matching no route belongs to neither locale — and the file even
 *   rendered its own <html> to compensate.
 *
 *   Next.js rejects that, but only at build time:
 *
 *     × not-found.tsx doesn't have a root layout.
 *
 *   tsc passed. All three other checks passed. The failure needed a full
 *   `next build`, which takes twelve minutes on Vercel and does not run at all
 *   in some environments — so the round trip to discover it was expensive and
 *   entirely avoidable, because the rule is purely structural.
 *
 * THE RULE, AS NEXT APPLIES IT
 *   A root layout is app/layout.tsx, or app/<segment>/layout.tsx where
 *   <segment> is a top-level route group. If app/layout.tsx exists it covers
 *   everything. If it does not, every page file must live under a top-level
 *   directory that has its own layout.tsx.
 *
 *   Route handlers (route.ts) and metadata files (sitemap.ts, robots.ts) are
 *   not pages and need no layout.
 *
 *     node scripts/check-root-layout.mjs
 *
 * Exits non-zero on an uncovered page, so it can go in CI and the prebuild gate.
 */
import { existsSync } from 'node:fs'
import { findFiles } from './lib/walk.mjs'

// The file types Next treats as pages, all of which need a root layout.
const PAGE_FILES = ['page.tsx', 'page.ts', 'not-found.tsx', 'error.tsx', 'global-error.tsx']

const pages = findFiles('app', ['.tsx', '.ts'])
  .filter(f => PAGE_FILES.includes(f.split('/').pop()))
  // global-error.tsx is the documented exception: it replaces the root layout
  // entirely when the root layout itself throws, so it supplies its own <html>.
  .filter(f => !f.endsWith('global-error.tsx'))

if (pages.length === 0) {
  console.error('Found no page files under app/. That cannot be right — refusing to report success.')
  process.exit(1)
}

const hasAppRootLayout = existsSync('app/layout.tsx')

const uncovered = []
for (const page of pages) {
  if (hasAppRootLayout) break               // one root layout covers everything
  const segments = page.split('/')          // ['app', '<top>', ...]
  if (segments.length < 3) {
    // Directly under app/ with no app/layout.tsx — nothing can wrap it.
    uncovered.push({ page, why: 'sits directly under app/ and there is no app/layout.tsx' })
    continue
  }
  const top = segments[1]
  if (!existsSync(`app/${top}/layout.tsx`)) {
    uncovered.push({ page, why: `app/${top}/layout.tsx does not exist` })
  }
}

const roots = hasAppRootLayout
  ? ['app/layout.tsx']
  : findFiles('app', ['layout.tsx']).filter(f => f.split('/').length === 3)

if (uncovered.length === 0) {
  console.log(
    `Checked ${pages.length} page file(s) against ${roots.length} root layout(s): ` +
    `${roots.join(', ')}. Every page has one.`
  )
  process.exit(0)
}

console.log(`${uncovered.length} page file(s) have no root layout — \`next build\` will fail on these:\n`)
for (const u of uncovered) {
  console.log(`  ${u.page}`)
  console.log(`    ${u.why}`)
  console.log(`    fix: move it inside a top-level group that has a layout.tsx, one of ${roots.map(r => r.split('/')[1]).join(', ') || '(none)'}\n`)
}
process.exit(1)
