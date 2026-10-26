import type { Metadata } from 'next'
import { DEFAULT_OG_IMAGE } from '@/lib/root-metadata'
import { withPageSeo } from '@/lib/page-seo'

// Picks up title and description edits from /dashboard/pages.
export const revalidate = 300
import AboutBody from '@/components/marketing/AboutBody'
import { ABOUT_T } from '@/lib/marketing-i18n'
import { hreflang } from '@/lib/hreflang'

const t = ABOUT_T.en

const baseMetadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  openGraph: {
    title: t.ogTitle,
    description: t.ogDesc,
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
    url: 'https://spacesmate.com/en/about',
  },
  alternates: hreflang('/about', 'en'),
}

export default function Page() {
  return <AboutBody locale="en" />
}

/** Title, description and indexing from /dashboard/pages override the defaults above. */
export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo('/about', 'en', baseMetadata)
}
