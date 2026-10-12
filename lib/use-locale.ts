'use client'

import { usePathname } from 'next/navigation'
import type { Locale } from '@/lib/site-i18n'

/**
 * The locale of the current route, for chrome that renders on every page.
 *
 * The navbar and footer live in the root layout, which cannot read the pathname
 * on the server, so they derive the locale here instead of taking a prop. This
 * is safe for SEO: Next renders client components on the server too, and
 * usePathname is available during that render, so the English strings are in
 * the initial HTML rather than appearing after hydration.
 *
 * Page-level components take an explicit `locale` prop instead — the route
 * already knows which one it is, and a prop is cheaper than a hook.
 */
export function useLocale(): Locale {
  const pathname = usePathname() || '/'
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'th'
}
