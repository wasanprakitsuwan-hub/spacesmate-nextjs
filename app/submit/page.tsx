import type { Metadata } from 'next'
import SubmitBody from '@/components/marketing/SubmitBody'
import { SUBMIT_T } from '@/lib/pages-i18n'

const t = SUBMIT_T.th

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  alternates: {
    canonical: 'https://spacesmate.com/submit',
    languages: { en: 'https://spacesmate.com/en/submit' },
  },
}

export default function Page() {
  return <SubmitBody locale="th" />
}
