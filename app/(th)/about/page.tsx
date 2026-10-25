import type { Metadata } from 'next'
import { withPageSeo } from '@/lib/page-seo'

// Picks up title and description edits from /dashboard/pages.
export const revalidate = 300
import AboutBody from '@/components/marketing/AboutBody'
import { ABOUT_T } from '@/lib/marketing-i18n'
import { hreflang } from '@/lib/hreflang'

const t = ABOUT_T.th

const baseMetadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  openGraph: {
    title: t.ogTitle,
    description: t.ogDesc,
    type: 'website',
    url: 'https://spacesmate.com/about',
  },
  alternates: hreflang('/about', 'th'),
}

export default function Page() {
  return <AboutBody locale="th" />
}

/** Title, description and indexing from /dashboard/pages override the defaults above. */
export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo('/about', 'th', baseMetadata)
}
