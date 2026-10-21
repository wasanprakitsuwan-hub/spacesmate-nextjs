import type { Metadata } from 'next'
import FAQAccordion from '@/components/faq/FAQAccordion'
import { faqQa } from '@/lib/faq-data'
import { FAQ_T } from '@/lib/faq-i18n'
import { FaqLd } from '@/components/seo/JsonLd'

const t = FAQ_T.th

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  openGraph: {
    title: t.ogTitle,
    description: t.ogDesc,
    type: 'website',
    url: 'https://spacesmate.com/faq',
  },
  alternates: {
    canonical: 'https://spacesmate.com/faq',
    languages: { en: 'https://spacesmate.com/en/faq' },
  },
}

export default function Page() {
  return (
    <div className="bg-white min-h-screen">
      {/* Server-rendered, so it is in the HTML an answer engine actually fetches. */}
      <FaqLd qa={faqQa('th')} />
      <FAQAccordion locale="th" />
    </div>
  )
}
