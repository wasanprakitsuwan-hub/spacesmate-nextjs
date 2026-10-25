import type { Metadata } from 'next'
import { withPageSeo } from '@/lib/page-seo'

// Picks up title and description edits from /dashboard/pages.
export const revalidate = 300
import ServicesBody from '@/components/marketing/ServicesBody'
import { SERVICES_T } from '@/lib/marketing-i18n'
import { hreflang } from '@/lib/hreflang'

const t = SERVICES_T.en

const baseMetadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  openGraph: {
    title: t.ogTitle,
    description: t.ogDesc,
    type: 'website',
    url: 'https://spacesmate.com/en/services',
  },
  alternates: hreflang('/services', 'en'),
}

export default function Page() {
  return <ServicesBody locale="en" />
}

/** Title, description and indexing from /dashboard/pages override the defaults above. */
export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo('/services', 'en', baseMetadata)
}
