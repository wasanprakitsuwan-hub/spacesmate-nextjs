import type { Metadata } from 'next'
import { withPageSeo } from '@/lib/page-seo'

// Picks up title and description edits from /dashboard/pages.
export const revalidate = 300
import SubmitBody from '@/components/marketing/SubmitBody'
import { SUBMIT_T } from '@/lib/pages-i18n'

const t = SUBMIT_T.th

const baseMetadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  alternates: {
    canonical: 'https://spacesmate.com/list-your-property',
    languages: { en: 'https://spacesmate.com/en/list-your-property' },
  },
}

export default function Page() {
  return <SubmitBody locale="th" />
}

/** Title, description and indexing from /dashboard/pages override the defaults above. */
export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo('/list-your-property', 'th', baseMetadata)
}
