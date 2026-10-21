import type { Metadata } from 'next'
import BlogIndexBody from '@/components/blog/BlogIndexBody'
import { BLOG_T } from '@/lib/blog-i18n'

const t = BLOG_T.th

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  openGraph: {
    title: t.ogTitle,
    description: t.metaDesc,
    type: 'website',
    url: 'https://spacesmate.com/blog',
  },
  alternates: {
    canonical: 'https://spacesmate.com/blog',
    languages: { en: 'https://spacesmate.com/en/blog' },
  },
}

export default function Page() {
  return <BlogIndexBody locale="th" />
}
