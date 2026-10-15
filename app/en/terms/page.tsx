import type { Metadata } from 'next'
import TermsBody from '@/components/marketing/TermsBody'
import { LEGAL_T } from '@/lib/legal-i18n'

export const metadata: Metadata = {
  title: LEGAL_T.en.termsMetaTitle,
  alternates: {
    canonical: 'https://spacesmate.com/en/terms',
    languages: { th: 'https://spacesmate.com/terms' },
  },
}

export default function Page() {
  return <TermsBody locale="en" />
}
