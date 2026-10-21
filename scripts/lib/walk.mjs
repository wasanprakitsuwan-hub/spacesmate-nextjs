/**
 * Find files by extension under a directory.
 *
 * WHY NOT fs.globSync
 *   All three check scripts used it. It landed in Node 22, and the Founder's
 *   machine runs Node 20.19 — so none of these scripts had ever actually run
 *   there. They passed in my sandbox, which is Node 22, and I reported them
 *   green without once checking what they would do on the machine that has to
 *   run them.
 *
 *   Pinning CI to Node 22 would have hidden it further: CI green, local
 *   "globSync is not a function", which reads as a broken tool rather than a
 *   broken site — exactly the failure mode these scripts exist to prevent.
 *
 *   readdirSync with withFileTypes is in every Node these scripts will meet.
 */
import { readdirSync } from 'node:fs'
import path from 'node:path'

const SKIP = new Set(['node_modules', '.next', '.git', 'dist', 'build'])

/**
 * @param dir   directory to search, relative to the repo root
 * @param exts  extensions to match, e.g. ['.tsx'] or ['.ts', '.tsx']
 * @returns     paths with forward slashes, relative to the repo root, sorted
 */
export function findFiles(dir, exts) {
  const out = []
  const stack = [dir]
  while (stack.length) {
    const current = stack.pop()
    let entries
    try { entries = readdirSync(current, { withFileTypes: true }) }
    catch { continue }                      // directory may not exist; not an error here
    for (const e of entries) {
      if (SKIP.has(e.name)) continue
      const full = path.join(current, e.name)
      if (e.isDirectory()) stack.push(full)
      else if (exts.some(x => e.name.endsWith(x))) out.push(full.split(path.sep).join('/'))
    }
  }
  return out.sort()
}
