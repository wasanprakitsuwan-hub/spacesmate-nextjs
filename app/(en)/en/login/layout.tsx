import type { Metadata } from 'next'
import { hreflang } from '@/lib/hreflang'

/**
 * Without this, /en/login fell through to the root layout's Thai default title
 * — so an English owner signing in saw a Thai browser tab, and anything that
 * reads the title (a shared link, a bookmark) read Thai.
 */
export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in or create a SpacesMate account to manage your listings and see how your properties are performing.',
  robots: { index: false, follow: false },
  alternates: hreflang('/login', 'en'),
}

export default function EnLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
