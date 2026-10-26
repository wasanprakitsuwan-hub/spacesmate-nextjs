import type { Metadata } from 'next'
import { DEFAULT_OG_IMAGE } from '@/lib/root-metadata'
import { withPageSeo } from '@/lib/page-seo'

// Picks up title and description edits from /dashboard/pages.
export const revalidate = 300
import BlogIndexBody from '@/components/blog/BlogIndexBody'
import { BLOG_T } from '@/lib/blog-i18n'
import { hreflang } from '@/lib/hreflang'
import { hasEnglishPosts } from '@/lib/blog-links'

const t = BLOG_T.en

const baseMetadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  openGraph: {
    title: t.ogTitle,
    description: t.metaDesc,
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
    url: 'https://spacesmate.com/en/blog',
  },
  alternates: hreflang('/blog', 'en'),
}

export default function Page() {
  return <BlogIndexBody locale="en" />
}

/**
 * Title, description and indexing from /dashboard/pages override the defaults above.
 * With no English article published the page is an empty shell, so it stays
 * out of Google (and out of the sitemap and /blog's hreflang) until there is one.
 */
export async function generateMetadata(): Promise<Metadata> {
  const meta = await withPageSeo('/blog', 'en', baseMetadata)
  return (await hasEnglishPosts()) ? meta : { ...meta, robots: { index: false, follow: true } }
}
