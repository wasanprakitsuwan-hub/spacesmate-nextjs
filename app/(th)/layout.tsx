/**
 * Thai root layout. Everything real is in RootShell — see the note there for
 * why there are two of these and why they must not grow bodies of their own.
 */
import type { Metadata } from 'next'
import '../globals.css'
import RootShell from '@/components/layout/RootShell'
import { rootMetadata } from '@/lib/root-metadata'

export const metadata: Metadata = rootMetadata('th')

export default function ThaiRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="th">{children}</RootShell>
}
