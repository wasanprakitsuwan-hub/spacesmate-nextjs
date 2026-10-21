import type { Metadata } from 'next'
import BlogIndexBody from '@/components/blog/BlogIndexBody'
import { BLOG_T } from '@/lib/blog-i18n'

const t = BLOG_T.en

export const metadata: Metadata = {
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
