import type { Metadata } from 'next'
import NewListingBody from '@/components/submit/NewListingBody'

/**
 * noindex, like its Thai counterpart: this is a logged-in authoring tool, not a
 * page anyone should arrive at from search. It is linked from /en/submit and
 * /en/pricing.
 *
 * No "| SpacesMate" in the title — the root layout's template appends it.
 */
export const metadata: Metadata = {
  title: 'List your property',
  description: 'Fill in the details and upload photos to save your listing as a draft — nothing is charged. It publishes when a slot is free.',
  robots: { index: false, follow: false },
}

export default function EnSubmitNewPage() {
  return <NewListingBody locale="en" />
}
