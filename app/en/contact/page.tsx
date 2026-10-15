import type { Metadata } from 'next'
import ContactBody from '@/components/marketing/ContactBody'
import { CONTACT_T } from '@/lib/pages-i18n'

const t = CONTACT_T.en

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  alternates: {
    canonical: 'https://spacesmate.com/en/contact',
    languages: { th: 'https://spacesmate.com/contact' },
  },
}

export default function Page() {
  return <ContactBody locale="en" />
}
