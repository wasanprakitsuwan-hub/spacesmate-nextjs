import type { Metadata } from 'next'
import { DEFAULT_OG_IMAGE } from '@/lib/root-metadata'
import { withPageSeo } from '@/lib/page-seo'

// Picks up title and description edits from /dashboard/pages.
export const revalidate = 300
import FAQAccordion from '@/components/faq/FAQAccordion'
import { faqQa } from '@/lib/faq-data'
import { FAQ_T } from '@/lib/faq-i18n'
import { FaqLd } from '@/components/seo/JsonLd'
import { hreflang } from '@/lib/hreflang'

const t = FAQ_T.th

const baseMetadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  openGraph: {
    title: t.ogTitle,
    description: t.ogDesc,
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
    url: 'https://spacesmate.com/faq',
  },
  alternates: hreflang('/faq', 'th'),
}

export default function Page() {
  return (
    <div className="min-h-screen">
      {/* Server-rendered, so it is in the HTML an answer engine actually fetches. */}
      <FaqLd qa={faqQa('th')} />
      <FAQAccordion locale="th" />
    </div>
  )
}

/** Title, description and indexing from /dashboard/pages override the defaults above. */
export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo('/faq', 'th', baseMetadata)
}
