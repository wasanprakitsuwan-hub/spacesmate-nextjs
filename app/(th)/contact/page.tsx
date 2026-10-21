import type { Metadata } from 'next'
import ContactBody from '@/components/marketing/ContactBody'
import { CONTACT_T } from '@/lib/pages-i18n'

const t = CONTACT_T.th

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  alternates: {
    canonical: 'https://spacesmate.com/contact',
    languages: { en: 'https://spacesmate.com/en/contact' },
  },
}

export default function Page() {
  return <ContactBody locale="th" />
}
