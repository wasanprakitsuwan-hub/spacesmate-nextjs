import type { Metadata } from 'next'
import { DEFAULT_OG_IMAGE } from '@/lib/root-metadata'
import { withPageSeo } from '@/lib/page-seo'

// Picks up title and description edits from /dashboard/pages.
export const revalidate = 300
import BlogIndexBody from '@/components/blog/BlogIndexBody'
import { BLOG_T } from '@/lib/blog-i18n'
import { hreflang } from '@/lib/hreflang'
import { hasEnglishPosts } from '@/lib/blog-links'

const t = BLOG_T.th

const baseMetadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  openGraph: {
    title: t.ogTitle,
    description: t.metaDesc,
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
    url: 'https://spacesmate.com/blog',
  },
  alternates: hreflang('/blog', 'th'),
}

export default function Page() {
  return <BlogIndexBody locale="th" />
}

/**
 * Title, description and indexing from /dashboard/pages override the defaults above.
 * The English twin is declared only once it has an article: until then
 * /en/blog is noindex, and an hreflang pointing at a noindex page is ignored
 * at best.
 */
export async function generateMetadata(): Promise<Metadata> {
  const meta = await withPageSeo('/blog', 'th', baseMetadata)
  if (await hasEnglishPosts()) return meta
  return { ...meta, alternates: { canonical: '/blog' } }
}
