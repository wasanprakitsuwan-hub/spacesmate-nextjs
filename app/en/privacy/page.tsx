import type { Metadata } from 'next'
import PrivacyBody from '@/components/marketing/PrivacyBody'
import { LEGAL_T } from '@/lib/legal-i18n'

export const metadata: Metadata = {
  title: LEGAL_T.en.privacyMetaTitle,
  alternates: {
    canonical: 'https://spacesmate.com/en/privacy',
    languages: { th: 'https://spacesmate.com/privacy' },
  },
}

export default function Page() {
  return <PrivacyBody locale="en" />
}
