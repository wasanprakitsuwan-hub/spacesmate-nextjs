import type { Metadata } from 'next'
import SearchBody from '@/components/marketing/SearchBody'
import { SEARCH_T } from '@/lib/pages-i18n'

const t = SEARCH_T.en

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  alternates: {
    canonical: 'https://spacesmate.com/en/search',
    languages: { th: 'https://spacesmate.com/search' },
  },
}

export default function Page() {
  return <SearchBody locale="en" />
}
