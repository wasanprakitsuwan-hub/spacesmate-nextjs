import type { Metadata } from 'next'
import SubmitBody from '@/components/marketing/SubmitBody'
import { SUBMIT_T } from '@/lib/pages-i18n'

const t = SUBMIT_T.en

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  alternates: {
    canonical: 'https://spacesmate.com/en/submit',
    languages: { th: 'https://spacesmate.com/submit' },
  },
}

export default function Page() {
  return <SubmitBody locale="en" />
}
