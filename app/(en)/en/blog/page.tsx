import type { Metadata } from 'next'
import { withPageSeo } from '@/lib/page-seo'

// Picks up title and description edits from /dashboard/pages.
export const revalidate = 300
import BlogIndexBody from '@/components/blog/BlogIndexBody'
import { BLOG_T } from '@/lib/blog-i18n'

const t = BLOG_T.en

const baseMetadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  openGraph: {
    title: t.ogTitle,
    description: t.metaDesc,
    type: 'website',
    url: 'https://spacesmate.com/en/blog',
  },
  alternates: {
    canonical: 'https://spacesmate.com/en/blog',
    languages: { th: 'https://spacesmate.com/blog' },
  },
}

export default function Page() {
  return <BlogIndexBody locale="en" />
}

/** Title, description and indexing from /dashboard/pages override the defaults above. */
export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo('/blog', 'en', baseMetadata)
}
