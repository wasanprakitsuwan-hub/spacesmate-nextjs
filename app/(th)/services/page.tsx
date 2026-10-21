import type { Metadata } from 'next'
import ServicesBody from '@/components/marketing/ServicesBody'
import { SERVICES_T } from '@/lib/marketing-i18n'

const t = SERVICES_T.th

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  openGraph: {
    title: t.ogTitle,
    description: t.ogDesc,
    type: 'website',
    url: 'https://spacesmate.com/services',
  },
  alternates: {
    canonical: 'https://spacesmate.com/services',
    languages: { en: 'https://spacesmate.com/en/services' },
  },
}

export default function Page() {
  return <ServicesBody locale="th" />
}
