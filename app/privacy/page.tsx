import type { Metadata } from 'next'
import PrivacyBody from '@/components/marketing/PrivacyBody'
import { LEGAL_T } from '@/lib/legal-i18n'

export const metadata: Metadata = {
  title: LEGAL_T.th.privacyMetaTitle,
  alternates: {
    canonical: 'https://spacesmate.com/privacy',
    languages: { en: 'https://spacesmate.com/en/privacy' },
  },
}

export default function Page() {
  return <PrivacyBody locale="th" />
}
