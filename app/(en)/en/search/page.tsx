import type { Metadata } from 'next'
import { withPageSeo } from '@/lib/page-seo'

// Picks up title and description edits from /dashboard/pages.
export const revalidate = 300
import SearchBody from '@/components/marketing/SearchBody'
import { SEARCH_T } from '@/lib/pages-i18n'
import { hreflang } from '@/lib/hreflang'

const t = SEARCH_T.en

const baseMetadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  alternates: hreflang('/search', 'en'),
}

export default function Page() {
  return <SearchBody locale="en" />
}

/** Title, description and indexing from /dashboard/pages override the defaults above. */
export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo('/search', 'en', baseMetadata)
}
