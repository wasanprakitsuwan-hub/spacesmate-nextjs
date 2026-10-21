import type { Metadata } from 'next'
import PricingBody from '@/components/marketing/PricingBody'
import { PRICING_T } from '@/lib/pricing-i18n'

const t = PRICING_T.th

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  openGraph: {
    title: t.ogTitle,
    description: t.ogDesc,
    type: 'website',
    url: 'https://spacesmate.com/pricing',
  },
  alternates: {
    canonical: 'https://spacesmate.com/pricing',
    languages: { en: 'https://spacesmate.com/en/pricing' },
  },
}

export default function Page() {
  return <PricingBody locale="th" />
}
