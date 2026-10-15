import type { Metadata } from 'next'
import PricingBody from '@/components/marketing/PricingBody'
import { PRICING_T } from '@/lib/pricing-i18n'

const t = PRICING_T.en

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  openGraph: {
    title: t.ogTitle,
    description: t.ogDesc,
    type: 'website',
    url: 'https://spacesmate.com/en/pricing',
  },
  alternates: {
    canonical: 'https://spacesmate.com/en/pricing',
    languages: { th: 'https://spacesmate.com/pricing' },
  },
}

export default function Page() {
  return <PricingBody locale="en" />
}
