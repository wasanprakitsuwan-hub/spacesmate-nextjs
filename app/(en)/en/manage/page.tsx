import type { Metadata } from 'next'
import { withPageSeo } from '@/lib/page-seo'

// Picks up title and description edits from /dashboard/pages.
export const revalidate = 300
import ManageBody from '@/components/marketing/ManageBody'
import { hreflang } from '@/lib/hreflang'

/**
 * The English Stream 2 pitch. Reachable from the navbar's "For owners" menu,
 * which until now sent English readers to the Thai page.
 *
 * No percentage is quoted on this page or in its description: the apartment and
 * condominium management rates differ, and /en/pricing is where numbers belong.
 * "Nothing upfront" is accurate — the fee is a share of rent collected, so an
 * empty building earns no fee.
 */
const baseMetadata: Metadata = {
  title: 'Property management in Bangkok',
  description:
    'Let SpacesMate manage your Bangkok apartment building or condominium end to end — finding tenants, rent collection, maintenance and monthly reporting. Performance-based fee, nothing upfront.',
  keywords: [
    'property management Bangkok', 'condo management Bangkok',
    'apartment management Thailand', 'rental management Bangkok', 'SpacesMate',
  ],
  openGraph: {
    title: 'Property management in Bangkok | SpacesMate',
    description: 'End-to-end management for your Bangkok apartment or condominium. Performance-based fee, nothing upfront.',
    type: 'website',
    url: 'https://spacesmate.com/en/manage',
    locale: 'en_US',
  },
  alternates: hreflang('/manage', 'en'),
}

export default function EnManagePage() {
  return <ManageBody locale="en" />
}

/** Title, description and indexing from /dashboard/pages override the defaults above. */
export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo('/manage', 'en', baseMetadata)
}
