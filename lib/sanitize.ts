/**
 * HTML sanitiser for user-written content.
 *
 * WHY
 *   Listing descriptions are written by landlords and rendered with
 *   dangerouslySetInnerHTML in components/property/DescriptionBody.tsx. Any
 *   registered account could therefore inject script into a public page.
 *
 * HONEST LIMITATION — READ THIS
 *   This is a regex-based allowlist, not a real HTML parser. A dedicated library
 *   (sanitize-html, DOMPurify) parses the document and is meaningfully harder to
 *   defeat. This was written because the package registry was unavailable, and it
 *   is deliberately aggressive: anything not explicitly permitted is removed.
 *
 *   REPLACE IT when you can install a dependency:
 *
 *     npm install sanitize-html @types/sanitize-html
 *
 *   then swap the body of sanitizeHtml() for a sanitize-html call with the same
 *   allowlist. Nothing else in the codebase needs to change — this is the only
 *   entry point.
 *
 * WHERE IT RUNS
 *   At render, in DescriptionBody, so it also covers rows already in the database.
 *   Sanitising only on write would leave existing content dirty.
 */

/** Tags the RichEditor can produce, plus what blog content legitimately uses. */
const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote',
  'a', 'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'span', 'div',
])

/** Attributes permitted, per tag. Everything else is dropped. */
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a:   new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'title', 'width', 'height', 'loading']),
  '*': new Set(['style']),   // style is filtered separately, see SAFE_STYLE
}

/** Only these style declarations survive — no expression(), no url(), no position. */
const SAFE_STYLE = /^(text-align|font-weight|font-style|text-decoration|color|background-color)\s*:\s*[#\w\s(),.%-]+$/i

/** Elements removed together with their contents. */
const STRIP_WITH_CONTENT = /<(script|style|iframe|object|embed|form|noscript|template|svg|math|link|meta|base)\b[\s\S]*?<\/\1\s*>/gi

/** Same elements when self-closing or unterminated. */
const STRIP_SELF = /<(script|style|iframe|object|embed|form|noscript|template|svg|math|link|meta|base)\b[^>]*\/?>/gi

const DANGEROUS_URI = /^\s*(javascript|vbscript|data|file|about)\s*:/i

function safeUri(value: string): boolean {
  const v = value.trim()
  // data: is blocked except for inline images, which the editor may legitimately produce
  if (/^data:image\/(png|jpe?g|gif|webp);base64,/i.test(v)) return true
  return !DANGEROUS_URI.test(v)
}

function cleanAttributes(tag: string, attrString: string): string {
  const allowed = ALLOWED_ATTRS[tag] ?? new Set<string>()
  const global  = ALLOWED_ATTRS['*']
  const out: string[] = []

  // name="value" | name='value' | name=value
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g
  let m: RegExpExecArray | null

  while ((m = re.exec(attrString)) !== null) {
    const name  = m[1].toLowerCase()
    const value = m[3] ?? m[4] ?? m[5] ?? ''

    // every event handler, in one rule
    if (name.startsWith('on')) continue
    if (!allowed.has(name) && !global.has(name)) continue

    if ((name === 'href' || name === 'src') && !safeUri(value)) continue

    if (name === 'style') {
      const decls = value.split(';').map(d => d.trim()).filter(Boolean).filter(d => SAFE_STYLE.test(d))
      if (!decls.length) continue
      out.push(`style="${decls.join('; ').replace(/"/g, '')}"`)
      continue
    }

    out.push(`${name}="${String(value).replace(/"/g, '&quot;')}"`)
  }

  // Anything opening a new tab must not get window.opener access.
  if (tag === 'a' && out.some(a => /^target=/.test(a)) && !out.some(a => /^rel=/.test(a))) {
    out.push('rel="noopener noreferrer"')
  }

  return out.length ? ' ' + out.join(' ') : ''
}

export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return ''

  let html = String(dirty)

  // 1. remove dangerous elements outright
  html = html.replace(STRIP_WITH_CONTENT, '')
  html = html.replace(STRIP_SELF, '')

  // 2. drop HTML comments — conditional comments have been an execution vector
  html = html.replace(/<!--[\s\S]*?-->/g, '')

  // 3. walk remaining tags: keep allowlisted ones with filtered attributes,
  //    unwrap the rest (keeping their text, discarding the element)
  html = html.replace(/<\/?([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/g, (full, rawTag: string, attrs: string) => {
    const tag = rawTag.toLowerCase()
    if (!ALLOWED_TAGS.has(tag)) return ''
    if (full.startsWith('</')) return `</${tag}>`
    const selfClosing = /\/\s*$/.test(attrs) || tag === 'br' || tag === 'img'
    return `<${tag}${cleanAttributes(tag, attrs)}${selfClosing && (tag === 'br' || tag === 'img') ? ' /' : ''}>`
  })

  return html
}
