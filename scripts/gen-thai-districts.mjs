#!/usr/bin/env node
/**
 * Regenerates lib/thai-districts.generated.ts from the public Thai address data.
 *
 * Run it when the source data changes (new districts are rare but do happen):
 *
 *     node scripts/gen-thai-districts.mjs
 *
 * Why a generated file rather than a runtime fetch: /api/thailand-address already
 * pulls this data from GitHub at request time, which is fine for a form the user
 * is actively filling in. A property page is not — rendering a listing must not
 * depend on GitHub being reachable, and the data changes perhaps once a year.
 *
 * Why generated rather than hand-written: 930 districts and 77 provinces. A typed
 * table would be wrong within a week and nobody would know which row.
 */
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const RAW = 'https://raw.githubusercontent.com/kongvut/thai-province-data/master/api/latest'
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'thai-districts.generated.ts')

const [provinces, districts] = await Promise.all([
  fetch(`${RAW}/province.json`).then(r => r.json()),
  fetch(`${RAW}/district.json`).then(r => r.json()),
])

if (!Array.isArray(provinces) || !Array.isArray(districts) || !districts.length) {
  throw new Error('Unexpected payload from the address dataset — refusing to write')
}

const provById = Object.fromEntries(provinces.map(p => [p.id, p.name]))

// A district name alone is ambiguous for a couple of names that exist in several
// provinces, so the key is "<province th>|<district th>". lib/geo-i18n derives a
// bare-name fallback from these keys for listings that have no province.
const byPair = {}
const nameCount = {}
for (const d of districts) nameCount[d.name.th] = (nameCount[d.name.th] ?? 0) + 1

for (const d of districts) {
  const prov = provById[d.province_id]
  if (!prov) continue
  byPair[`${prov.th}|${d.name.th}`] = d.name.en
}

const provMap = Object.fromEntries(provinces.map(p => [p.name.th, p.name.en]))

const lit = o => '{\n' + Object.entries(o)
  .sort(([a], [b]) => a.localeCompare(b, 'th'))
  .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
  .join('\n') + '\n}'

const ambiguous = Object.entries(nameCount).filter(([, n]) => n > 1).map(([k]) => k)

await writeFile(OUT, `/**
 * GENERATED FILE — do not edit by hand.
 * Run: node scripts/gen-thai-districts.mjs
 *
 * Source: github.com/kongvut/thai-province-data (api/latest)
 * Generated: ${new Date().toISOString().slice(0, 10)}
 * ${provinces.length} provinces, ${districts.length} districts.
 *
 * District names are stored without their เขต / อำเภอ prefix, which is how the
 * source models them — the prefix is a separate field there. Callers strip it
 * before looking a value up, which is also what makes "ประเวศ" and "เขตประเวศ"
 * resolve to the same district.
 *
 * ${ambiguous.length} district name(s) occur in more than one province, so a bare
 * district name cannot resolve them: ${ambiguous.join(', ') || '(none)'}
 * lib/geo-i18n derives the unambiguous by-name lookup from these keys, rather
 * than this file carrying the same data in two shapes.
 */

/** "<province th>|<district th>" → English district name. */
export const DISTRICT_EN_BY_PAIR: Record<string, string> = ${lit(byPair)}

/** "<province th>" → English province name. */
export const PROVINCE_EN: Record<string, string> = ${lit(provMap)}
`, 'utf8')

console.log(`wrote ${OUT}`)
console.log(`  ${Object.keys(byPair).length} province-qualified districts`)
console.log(`  ${Object.keys(provMap).length} provinces`)
console.log(`  ambiguous: ${ambiguous.join(', ') || '(none)'}`)
