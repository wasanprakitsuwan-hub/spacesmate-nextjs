import type { Metadata } from 'next'
import AboutBody from '@/components/marketing/AboutBody'
import { ABOUT_T } from '@/lib/marketing-i18n'

const t = ABOUT_T.en

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  openGraph: {
    title: t.ogTitle,
    description: t.ogDesc,
    type: 'website',
    url: 'https://spacesmate.com/en/about',
  },
  alternates: {
    canonical: 'https://spacesmate.com/en/about',
    languages: { th: 'https://spacesmate.com/about' },
  },
}

export default function Page() {
  return <AboutBody locale="en" />
}
