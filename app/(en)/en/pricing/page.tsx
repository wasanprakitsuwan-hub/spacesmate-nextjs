import type { Metadata } from 'next'
import { withPageSeo } from '@/lib/page-seo'

// Picks up title and description edits from /dashboard/pages.
export const revalidate = 300
import PricingBody from '@/components/marketing/PricingBody'
import { PRICING_T } from '@/lib/pricing-i18n'

const t = PRICING_T.en

const baseMetadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  openGraph: {
    title: t.ogTitle,
    description: t.ogDesc,
    type: 'website',
    url: 'https://spacesmate.com/en/pricing',
  },
  alternates: {
    canonical: 'https://spacesmate.com/en/pricing',
    languages: { th: 'https://spacesmate.com/pricing' },
  },
}

export default function Page() {
  return <PricingBody locale="en" />
}

/** Title, description and indexing from /dashboard/pages override the defaults above. */
export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo('/pricing', 'en', baseMetadata)
}
