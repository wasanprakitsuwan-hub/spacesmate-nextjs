'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { usePathname } from 'next/navigation'
import { isEnglishPath, localeHref } from '@/lib/routes-i18n'

/**
 * next/link that keeps the reader in the language they are already reading.
 *
 * WHY THIS EXISTS
 *   The language toggle worked and was only ever one page deep. A visitor hit
 *   🇬🇧 on the home page, landed on /en, clicked "Search" in the navbar — and was
 *   back in Thai, because every link in the navbar was a hardcoded Thai path.
 *   There were 38 such links across 16 components, so fixing them one at a time
 *   would have fixed them until the next one was written.
 *
 *   Write the Thai path, as you would anyway, and this resolves it:
 *       <LocaleLink href="/search">   →  /search  or  /en/search
 *
 * WHERE THE LOCALE COMES FROM
 *   The URL, and only the URL — there is no cookie and no stored preference.
 *   A locale that lives anywhere other than the address bar is a second source
 *   of truth, and it means a pasted or indexed URL can render in a language it
 *   does not claim. So /en/* is English and everything else is Thai.
 *
 *   usePathname is a client hook, but Next renders client components on the
 *   server too, so the correct href is in the initial HTML. Crawlers see a
 *   fully-linked English site, not one that assembles itself after hydration.
 *
 * WHEN A PAGE HAS NO ENGLISH VERSION
 *   The href stays Thai. /manage, /blog and /building have no English page yet,
 *   and a prefixed link to a page that was never built is a 404 — worse than a
 *   Thai page with the toggle still sitting in the navbar. lib/routes-i18n has
 *   the list and is the only place to change it.
 *
 * WHAT NOT TO USE IT FOR
 *   External URLs, and the account surfaces that exist only in Thai
 *   (/login, /owner-dashboard, /dashboard). Pass those to next/link directly —
 *   routes-i18n would leave them alone anyway, but the plain Link says so.
 */
export default function LocaleLink({ href, ...rest }: ComponentProps<typeof Link> & { href: string }) {
  const pathname = usePathname() || '/'
  const locale = isEnglishPath(pathname) ? 'en' : 'th'
  return <Link href={localeHref(href, locale)} {...rest} />
}
