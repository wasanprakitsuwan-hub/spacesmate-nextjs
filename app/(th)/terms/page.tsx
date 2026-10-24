import type { Metadata } from 'next'
import { withPageSeo } from '@/lib/page-seo'

// Picks up title and description edits from /dashboard/pages.
export const revalidate = 300
import TermsBody from '@/components/marketing/TermsBody'
import { LEGAL_T } from '@/lib/legal-i18n'

const baseMetadata: Metadata = {
  title: LEGAL_T.th.termsMetaTitle,
  alternates: {
    canonical: 'https://spacesmate.com/terms',
    languages: { en: 'https://spacesmate.com/en/terms' },
  },
}

export default function Page() {
  return <TermsBody locale="th" />
}

/** Title, description and indexing from /dashboard/pages override the defaults above. */
export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo('/terms', 'th', baseMetadata)
}
