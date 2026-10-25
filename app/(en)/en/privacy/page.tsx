import type { Metadata } from 'next'
import { withPageSeo } from '@/lib/page-seo'

// Picks up title and description edits from /dashboard/pages.
export const revalidate = 300
import PrivacyBody from '@/components/marketing/PrivacyBody'
import { LEGAL_T } from '@/lib/legal-i18n'
import { hreflang } from '@/lib/hreflang'

const baseMetadata: Metadata = {
  title: LEGAL_T.en.privacyMetaTitle,
  alternates: hreflang('/privacy', 'en'),
}

export default function Page() {
  return <PrivacyBody locale="en" />
}

/** Title, description and indexing from /dashboard/pages override the defaults above. */
export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo('/privacy', 'en', baseMetadata)
}
