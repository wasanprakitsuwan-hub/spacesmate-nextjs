import type { Metadata } from 'next'
import { DEFAULT_OG_IMAGE } from '@/lib/root-metadata'
import GuideBody from '@/components/guide/GuideBody'
import { GUIDE_UI, loadGuide } from '@/lib/guide-content'
import { withPageSeo } from '@/lib/page-seo'
import { hreflang } from '@/lib/hreflang'

// Picks up guide edits from the dashboard (tagged revalidation) and SEO edits from /dashboard/pages.
export const revalidate = 300

const t = GUIDE_UI.th

const baseMetadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  openGraph: { title: t.metaTitle, description: t.metaDesc, type: 'article', images: [DEFAULT_OG_IMAGE], url: 'https://spacesmate.com/guide' },
  alternates: hreflang('/guide', 'th'),
}

export default async function Page() {
  return <GuideBody guide={await loadGuide('th')} locale="th" />
}

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo('/guide', 'th', baseMetadata)
}
