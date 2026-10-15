import type { Metadata } from 'next'
import SearchBody from '@/components/marketing/SearchBody'
import { SEARCH_T } from '@/lib/pages-i18n'

const t = SEARCH_T.th

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  alternates: {
    canonical: 'https://spacesmate.com/search',
    languages: { en: 'https://spacesmate.com/en/search' },
  },
}

export default function Page() {
  return <SearchBody locale="th" />
}
