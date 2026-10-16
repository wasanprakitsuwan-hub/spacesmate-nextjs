import type { Metadata } from 'next'
import ManageBody from '@/components/marketing/ManageBody'

/**
 * The English Stream 2 pitch. Reachable from the navbar's "For owners" menu,
 * which until now sent English readers to the Thai page.
 *
 * No percentage is quoted on this page or in its description: the apartment and
 * condominium management rates differ, and /en/pricing is where numbers belong.
 * "Nothing upfront" is accurate — the fee is a share of rent collected, so an
 * empty building earns no fee.
 */
export const metadata: Metadata = {
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
  alternates: {
    canonical: 'https://spacesmate.com/en/manage',
    languages: {
      'th-TH': 'https://spacesmate.com/manage',
      'en-US': 'https://spacesmate.com/en/manage',
    },
  },
}

export default function EnManagePage() {
  return <ManageBody locale="en" />
}
