import type { Metadata } from 'next'
import { withPageSeo } from '@/lib/page-seo'

// Picks up title and description edits from /dashboard/pages.
export const revalidate = 300
import ContactBody from '@/components/marketing/ContactBody'
import { CONTACT_T } from '@/lib/pages-i18n'
import { hreflang } from '@/lib/hreflang'

const t = CONTACT_T.th

const baseMetadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  alternates: hreflang('/contact', 'th'),
}

export default function Page() {
  return <ContactBody locale="th" />
}

/** Title, description and indexing from /dashboard/pages override the defaults above. */
export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo('/contact', 'th', baseMetadata)
}
