/**
 * Find Thai strings an English reader can actually reach.
 *
 * WHY THIS EXISTS
 *   /en/pricing was translated in Stage E2 — except BuySlotsCta, the component
 *   that takes the money. The page read English right up to the button, which
 *   said จ่ายครั้งเดียว · ฿299. Nobody noticed for days, and the Founder found
 *   it, not the tooling.
 *
 *   The reason it hid is that coverage is a property of the *import graph*, not
 *   of any one file. PricingBody was fully translated; the gap was one level
 *   down. Grepping a page tells you nothing about what it renders.
 *
 * WHAT IT DOES
 *   Starts at every app/en/**\/page.tsx, follows local imports (@/… and ./…)
 *   transitively, and reports Thai string literals and JSX text in anything
 *   reachable. Comments are stripped first, so the long Thai explanations in
 *   code comments do not drown the signal.
 *
 *   It cannot know whether a given string is a *label* (should translate) or a
 *   *stored value* (must not) — district names, amenity name_th, 'คอนโด' in the
 *   manage form. So known value-carrying modules are listed in ALLOWED below,
 *   each with the reason. Anything else that appears is either a real gap or a
 *   new entry for that list, and both deserve a human look.
 *
 *     node scripts/check-en-coverage.mjs
 *
 *   Exits non-zero when it finds something unaccounted for, so it can go in CI.
 */
import { readFileSync, existsSync } from 'node:fs'
import { findFiles } from './lib/walk.mjs'
import path from 'node:path'

const THAI = /[฀-๿]/

/**
 * Modules whose Thai is deliberate, with the reason. These hold values that are
 * written to the database or submitted to an API, where translating would
 * fragment the stored data across two languages — the bug that cost three
 * migrations already.
 */
const ALLOWED = new Map([
  ['lib/amenities.ts',        'name_th IS the stored value in properties.amenities'],
  ['lib/thai-districts.generated.ts', 'district and province names as stored'],
  ['lib/geo-i18n.ts',         'maps stored Thai names to English for display'],
  ['lib/room-types.ts',       'legacy display strings, resolved to keys'],
  ['lib/property-i18n.ts',    'legacy amenity spellings, aliased for display'],
  ['lib/manage-i18n.ts',      'PROPERTY_TYPE_VALUES / CHANNEL_VALUES go to the lead Sheet'],
  ['lib/wizard-i18n.ts',      'the th half of the dictionary'],
  ['lib/submit-new-i18n.ts',  'the th half of the dictionary'],
  ['lib/site-i18n.ts',        'the th half of the dictionary'],
  ['lib/pages-i18n.ts',       'the th half of the dictionary'],
  ['lib/pricing-i18n.ts',     'the th half of the dictionary'],
  ['lib/legal-i18n.ts',       'the th half of the dictionary'],
  ['lib/auth-i18n.ts',        'the th half of the dictionary'],
  ['lib/dashboard-i18n.ts',   'the th half of the dictionary'],
  ['lib/faq-data.ts',         'the th half of the dictionary'],
  ['lib/constants.ts',        'area keywords and Thai place names'],
  ['components/listing/SharedListingForm.tsx', 'FACING / OTHER_CHARGES / TYPE_LABEL values + Thai-only dashboard exports'],
  ['components/layout/LanguageToggle.tsx', 'the Thai label on the toggle itself'],

  // ── Bilingual dictionaries: the script sees the th half ──
  ['lib/marketing-i18n.ts',   'th half of the about/services/submit dictionary'],
  ['lib/faq-i18n.ts',         'th half of the FAQ dictionary'],
  ['lib/area-content.ts',     'th half of the hand-written area guides'],
  ['components/RichEditor.tsx', 'both halves of the toolbar tooltip map'],

  // ── Locale-gated: the Thai is behind `locale === 'th'` ──
  ['components/area/AreaPageBody.tsx',          'fallback copy, gated on locale'],
  ['components/property/PropertyGallery.tsx',   'alt/aria text, gated on locale'],
  ['components/property/PropertyVideo.tsx',     'heading and aria text, gated on locale'],
  ['components/listing/BuildingAutocomplete.tsx', 'status lines, gated on locale'],
  ['components/property/DescriptionBody.tsx',   'sentinel strings + the bilingual tab label'],
  ['components/ui/FloatingChat.tsx',            'deliberately bilingual aria-label'],

  // ── Thai that is matched against, not displayed ──
  ['lib/area-shared.ts',                 'search terms matched against listing text'],
  ['lib/areas.ts',                       'district values as stored in the DB'],
  ['components/sections/AreaLinks.tsx',  'search terms matched against listing text'],
  ['lib/slug.ts',                        'the Thai unicode range in a regex'],
  ['lib/types.ts',                       'trailing comments on field declarations'],
  ['components/marketing/ContactBody.tsx', 'interest values submitted with the form'],
  ['components/marketing/ManageBody.tsx',  'icon map keyed by the stored channel value'],
  ['components/dashboard/OwnerDashboardBody.tsx', 'the default province, as stored in properties.province'],

  // ── Correct in both languages ──
  ['components/marketing/AboutBody.tsx', 'the Thai legal entity name, shown as such'],

  // ── Admin-only UI, Thai by design ──
  ['lib/packages.ts',  'ADMIN_PACKAGES labels — only rendered for admins'],

  // ── Flagged, not fixed. See the note under WHAT IT DOES. ──
  ['components/seo/JsonLd.tsx',
   'FLAG: the Organization description and address stay Thai on English pages'],
  ['app/layout.tsx',
   'FLAG: default title/description/keywords are Thai; /en pages override title and description but not keywords'],
  ['lib/property-data.ts',
   'FLAG: legacy hardcoded seed listings. Listings come from Supabase now; this is only still imported for PRICE_RANGES and a getPropertyBySlug fallback'],
])

/**
 * Blank out comments and imports, PRESERVING line count.
 *
 * A first version replaced block comments with '' — which collapsed a 20-line
 * comment to nothing and shifted every line number after it. The reported
 * locations were then wrong in exactly the files most worth reading, since the
 * heavily-commented ones are the ones that drift. Keep the newlines.
 */
function strip(src) {
  const keepLines = m => m.replace(/[^\n]/g, ' ')
  return src
    .replace(/\/\*[\s\S]*?\*\//g, keepLines)
    .replace(/^\s*\/\/.*$/gm, keepLines)
    .replace(/^\s*import\s[\s\S]*?from\s+'[^']+'\s*$/gm, keepLines)
}

function resolve(spec, fromFile) {
  let base
  if (spec.startsWith('@/')) base = spec.slice(2)
  else if (spec.startsWith('.')) base = path.join(path.dirname(fromFile), spec)
  else return null
  for (const ext of ['.tsx', '.ts', '/index.tsx', '/index.ts']) {
    if (existsSync(base + ext)) return path.normalize(base + ext)
  }
  return existsSync(base) ? path.normalize(base) : null
}

const seen = new Set()
const findings = []

function walk(file) {
  if (seen.has(file) || !existsSync(file)) return
  seen.add(file)
  const raw = readFileSync(file, 'utf8')

  for (const m of raw.matchAll(/from\s+'([^']+)'/g)) {
    const r = resolve(m[1], file)
    if (r) walk(r)
  }

  if (ALLOWED.has(file)) return

  const code = strip(raw)
  code.split('\n').forEach((line, i) => {
    if (!THAI.test(line)) return
    // ฿ alone is currency, not copy.
    const withoutBaht = line.replace(/฿/g, '')
    if (!THAI.test(withoutBaht)) return
    findings.push({ file, line: i + 1, text: line.trim().slice(0, 110) })
  })
}

const entries = findFiles('app/en', ['page.tsx'])
entries.forEach(e => walk(path.normalize(e)))
// The chrome every page renders, which no page imports directly.
;['app/layout.tsx', 'components/layout/Navbar.tsx', 'components/layout/Footer.tsx']
  .forEach(f => existsSync(f) && walk(path.normalize(f)))

console.log(`Walked ${seen.size} modules reachable from ${entries.length} English routes.\n`)

if (findings.length === 0) {
  console.log('No unaccounted Thai reachable from an English page.')
  process.exit(0)
}

const byFile = new Map()
for (const f of findings) {
  if (!byFile.has(f.file)) byFile.set(f.file, [])
  byFile.get(f.file).push(f)
}
for (const [file, hits] of [...byFile].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`${file}  (${hits.length})`)
  for (const h of hits.slice(0, 6)) console.log(`   ${String(h.line).padStart(4)}: ${h.text}`)
  if (hits.length > 6) console.log(`   … ${hits.length - 6} more`)
  console.log()
}
console.log(`${findings.length} line(s) in ${byFile.size} file(s) need a decision: translate, or add to ALLOWED with the reason.`)
process.exit(1)
