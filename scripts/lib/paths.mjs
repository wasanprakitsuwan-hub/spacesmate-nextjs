/**
 * Where the English routes live, resolved rather than hardcoded.
 *
 * WHY NOT JUST WRITE THE PATH
 *   It was 'app/en'. Then the root layout was split into app/(th)/ and
 *   app/(en)/ route groups so English pages could carry lang="en", and it
 *   became 'app/(en)/en'. Two of the three check scripts had the old string
 *   baked in.
 *
 *   The dangerous part is not that they break — a script that throws gets
 *   fixed. It is that they DON'T break: findFiles on a missing directory
 *   returns [], so check-route-i18n would have reported "0 English routes,
 *   table agrees with the filesystem" and exited 0. A green check over an
 *   empty set is worse than a red one, and this suite exists precisely because
 *   that class of silent pass shipped three bugs to production in October.
 *
 *   So: find the directory, and refuse to continue if it holds nothing.
 */
import { existsSync, readdirSync } from 'node:fs'

/** Candidate locations, newest layout first. */
function findEnRoot() {
  const direct = 'app/en'
  if (existsSync(direct)) return direct

  // app/(group)/en — the route-group layout. The group name is arbitrary, so
  // look for any top-level app/* directory containing an `en` folder.
  for (const entry of readdirSync('app', { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const candidate = `app/${entry.name}/en`
    if (existsSync(candidate)) return candidate
  }
  return null
}

export const EN_ROOT = findEnRoot()

if (!EN_ROOT) {
  console.error(
    'Could not find the English route root. Looked for app/en and app/*/en.\n' +
    'If the app structure moved, update scripts/lib/paths.mjs — do not let the\n' +
    'checks run over an empty directory and report success.'
  )
  process.exit(1)
}

/**
 * Both root layouts. These render the chrome every page inherits and no page
 * imports directly, so the coverage walk has to be pointed at them by hand.
 */
export const ROOT_LAYOUTS = ['app/(th)/layout.tsx', 'app/(en)/layout.tsx', 'app/layout.tsx']
  .filter(f => existsSync(f))

/** Turn an absolute-ish page path under EN_ROOT into its URL path. */
export function enPageToRoute(file) {
  const rel = file.replace(new RegExp(`^${EN_ROOT.replace(/[().*+?^$|[\\]\\\\]/g, '\\\\$&')}/?`), '')
  const p = '/' + rel.replace(/\/?page\.tsx$/, '')
  return p === '/' ? '/' : p.replace(/\/$/, '')
}
