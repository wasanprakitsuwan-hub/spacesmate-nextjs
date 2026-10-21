/**
 * The real /not-found URL.
 *
 * middleware.ts rewrites every unpublished path here with status 404:
 *
 *     url.pathname = '/not-found'
 *     return NextResponse.rewrite(url, { status: 404 })
 *
 * Before the root layout was split there was no route at this path, so the
 * rewrite fell through to Next's built-in 404, which borrowed the single root
 * layout and therefore looked like part of the site. With two root layouts
 * there is no single layout to borrow, so this is an explicit page instead of
 * a happy accident.
 */
import type { Metadata } from 'next'
import NotFoundBody from '@/components/layout/NotFoundBody'

export const metadata: Metadata = {
  title: 'Page not found · ไม่พบหน้านี้',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <NotFoundBody />
}
