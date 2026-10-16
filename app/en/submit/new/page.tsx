import type { Metadata } from 'next'
import NewListingBody from '@/components/submit/NewListingBody'

/**
 * noindex, like its Thai counterpart would be: this is a logged-in authoring
 * tool, not a page anyone should arrive at from search. It is linked from
 * /en/pricing and /en/submit.
 */
export const metadata: Metadata = {
  title: 'List your property | SpacesMate',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://www.spacesmate.com/en/submit/new' },
}

export default function EnSubmitNewPage() {
  return <NewListingBody locale="en" />
}
