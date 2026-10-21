import type { Metadata } from 'next'

/**
 * Without this the route falls through to the root layout's Thai default, so
 * an English owner resetting a password sees a Thai browser tab at the end of
 * an English journey. Same gap /en/login had.
 */
export const metadata: Metadata = {
  title: 'Set a new password',
  robots: { index: false, follow: false },
}

export default function EnResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
