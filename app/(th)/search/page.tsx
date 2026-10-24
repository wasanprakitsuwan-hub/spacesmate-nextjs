import type { Metadata } from 'next'
import { withPageSeo } from '@/lib/page-seo'

// Picks up title and description edits from /dashboard/pages.
export const revalidate = 300
import SearchBody from '@/components/marketing/SearchBody'
import { SEARCH_T } from '@/lib/pages-i18n'

const t = SEARCH_T.th

const baseMetadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  alternates: {
    canonical: 'https://spacesmate.com/search',
    languages: { en: 'https://spacesmate.com/en/search' },
  },
}

export default function Page() {
  return <SearchBody locale="th" />
}

/** Title, description and indexing from /dashboard/pages override the defaults above. */
export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo('/search', 'th', baseMetadata)
}
