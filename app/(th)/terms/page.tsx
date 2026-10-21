import type { Metadata } from 'next'
import TermsBody from '@/components/marketing/TermsBody'
import { LEGAL_T } from '@/lib/legal-i18n'

export const metadata: Metadata = {
  title: LEGAL_T.th.termsMetaTitle,
  alternates: {
    canonical: 'https://spacesmate.com/terms',
    languages: { en: 'https://spacesmate.com/en/terms' },
  },
}

export default function Page() {
  return <TermsBody locale="th" />
}
