import type { Metadata } from 'next'
import GuideBody from '@/components/guide/GuideBody'
import { GUIDE_UI, loadGuide } from '@/lib/guide-content'
import { withPageSeo } from '@/lib/page-seo'
import { hreflang } from '@/lib/hreflang'

// Picks up guide edits from the dashboard (tagged revalidation) and SEO edits from /dashboard/pages.
export const revalidate = 300

const t = GUIDE_UI.en

const baseMetadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  openGraph: { title: t.metaTitle, description: t.metaDesc, type: 'article', url: 'https://spacesmate.com/en/guide' },
  alternates: hreflang('/guide', 'en'),
}

export default async function Page() {
  return <GuideBody guide={await loadGuide('en')} locale="en" />
}

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo('/guide', 'en', baseMetadata)
}
