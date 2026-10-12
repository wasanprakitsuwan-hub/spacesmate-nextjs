import type { Metadata } from 'next'
import HeroSection from '@/components/sections/HeroSection'
import CategorySection from '@/components/sections/CategorySection'
import FeaturedListings from '@/components/sections/FeaturedListings'
import WhySpacesMate from '@/components/sections/WhySpacesMate'
import ManagementCTA from '@/components/sections/ManagementCTA'
import BlogSection from '@/components/sections/BlogSection'
import AreaLinks from '@/components/sections/AreaLinks'
import GeneratedAreaLinks from '@/components/sections/GeneratedAreaLinks'

/**
 * English home page — the same sections as the Thai home, with locale="en".
 *
 * This replaces the hand-written landing page that previously lived here. That
 * page existed for one reason: /en used to 404, so the navbar language toggle
 * had nowhere to go. It listed the 16 area guides and carried a note admitting
 * the rest of the site was Thai. Now that the chrome and the home sections are
 * translated, a parallel page would only drift from the Thai one.
 *
 * Still Thai on this page, by design rather than oversight:
 *   - blog post titles and bodies (Stage F)
 *   - the data-driven district links in GeneratedAreaLinks (Stage G)
 *   - owner-supplied listing titles where no English was given
 *
 * The 16 hand-written area guides do have English pages, so AreaLinks points at
 * /en/area/... when locale is 'en'.
 */

const SITE = 'https://spacesmate.com'

export const metadata: Metadata = {
  title: 'Rent an Apartment, Condo or Office in Bangkok | SpacesMate',
  description:
    'Find apartments, condos, houses, offices and co-working space to rent across Bangkok. Verified listings, contact the owner directly, no agent fee for tenants.',
  openGraph: {
    title: 'Rent in Bangkok | SpacesMate',
    description:
      'Apartments, condos, houses, offices and co-working to rent across Bangkok — search by BTS or MRT station.',
    type: 'website',
    url: `${SITE}/en`,
  },
  alternates: { canonical: '/en', languages: { th: '/' } },
}

export default function EnglishHome() {
  return (
    <>
      <HeroSection locale="en" />
      <CategorySection locale="en" />
      <FeaturedListings locale="en" />
      <WhySpacesMate locale="en" />
      <ManagementCTA locale="en" />
      <BlogSection locale="en" />
      <AreaLinks locale="en" />
      <GeneratedAreaLinks locale="en" />
    </>
  )
}
