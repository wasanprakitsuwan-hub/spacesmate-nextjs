/**
 * English root layout. Everything real is in RootShell — see the note there for
 * why there are two of these and why they must not grow bodies of their own.
 *
 * This group holds only /en/*. The group name is invisible in the URL, so the
 * routes underneath are still /en/about, /en/pricing and so on.
 */
import type { Metadata } from 'next'
import '../globals.css'
import RootShell from '@/components/layout/RootShell'
import { rootMetadata } from '@/lib/root-metadata'

export const metadata: Metadata = rootMetadata('en')

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="en">{children}</RootShell>
}
