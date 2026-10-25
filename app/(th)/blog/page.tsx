import type { Metadata } from 'next'
import { withPageSeo } from '@/lib/page-seo'

// Picks up title and description edits from /dashboard/pages.
export const revalidate = 300
import BlogIndexBody from '@/components/blog/BlogIndexBody'
import { BLOG_T } from '@/lib/blog-i18n'
import { hreflang } from '@/lib/hreflang'

const t = BLOG_T.th

const baseMetadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  openGraph: {
    title: t.ogTitle,
    description: t.metaDesc,
    type: 'website',
    url: 'https://spacesmate.com/blog',
  },
  alternates: hreflang('/blog', 'th'),
}

export default function Page() {
  return <BlogIndexBody locale="th" />
}

/** Title, description and indexing from /dashboard/pages override the defaults above. */
export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo('/blog', 'th', baseMetadata)
}
