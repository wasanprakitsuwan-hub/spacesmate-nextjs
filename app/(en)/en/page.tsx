import type { Metadata } from 'next'
import { Suspense } from 'react'
import SectionPlaceholder from '@/components/sections/SectionPlaceholder'
import { withPageSeo } from '@/lib/page-seo'

// Cached and rebuilt in the background every 60 seconds, the same as the Thai
// home. See the note at the top of app/(th)/page.tsx for why it is force-static.
export const revalidate = 60
export const dynamic = 'force-static'
import HeroSection from '@/components/sections/HeroSection'
import CategorySection from '@/components/sections/CategorySection'
import FeaturedListings from '@/components/sections/FeaturedListings'
import WhySpacesMate from '@/components/sections/WhySpacesMate'
import ManagementCTA from '@/components/sections/ManagementCTA'
import BlogSection from '@/components/sections/BlogSection'
import AreaLinks from '@/components/sections/AreaLinks'
import UniversityLinks from '@/components/sections/UniversityLinks'
import { hreflang } from '@/lib/hreflang'

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
 *   - owner-supplied listing titles where no English was given
 *
 * AreaLinks and UniversityLinks link to /rent pages, which have English twins,
 * so LocaleLink sends English readers to /en/rent/....
 */

const SITE = 'https://spacesmate.com'

const baseMetadata: Metadata = {
  title: 'Rent an Apartment, Condo or Office in Bangkok',
  description:
    'Find apartments, condos, houses, offices and co-working space to rent across Bangkok. Verified listings, contact the owner directly, no agent fee for tenants.',
  openGraph: {
    title: 'Rent in Bangkok | SpacesMate',
    description:
      'Apartments, condos, houses, offices and co-working to rent across Bangkok — search by BTS or MRT station.',
    type: 'website',
    url: `${SITE}/en`,
  },
  alternates: hreflang('/', 'en'),
}

export default function EnglishHome() {
  return (
    <>
      <HeroSection locale="en" />
      <CategorySection locale="en" />
      <Suspense fallback={<SectionPlaceholder />}><FeaturedListings locale="en" /></Suspense>
      <WhySpacesMate locale="en" />
      <ManagementCTA locale="en" />
      <Suspense fallback={<SectionPlaceholder />}><BlogSection locale="en" /></Suspense>
      <AreaLinks locale="en" />
      <Suspense fallback={<SectionPlaceholder />}><UniversityLinks locale="en" /></Suspense>
    </>
  )
}

/** Title, description and indexing from /dashboard/pages override the defaults above. */
export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo('/', 'en', baseMetadata)
}
