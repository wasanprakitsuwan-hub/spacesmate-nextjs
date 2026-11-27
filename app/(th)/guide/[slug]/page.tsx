import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DEFAULT_OG_IMAGE } from '@/lib/root-metadata'
import OwnerGuideBody from '@/components/guide/OwnerGuideBody'
import { OWNER_GUIDES, findOwnerGuide, ownerGuidePath } from '@/lib/owner-guides'

// The guide text is static; the rent table inside it reads live listings.
export const revalidate = 3600

export function generateStaticParams() {
  return OWNER_GUIDES.map(g => ({ slug: g.slug }))
}

export default function Page({ params }: { params: { slug: string } }) {
  const guide = findOwnerGuide(params.slug)
  if (!guide) notFound()
  return <OwnerGuideBody guide={guide} />
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = findOwnerGuide(params.slug)
  if (!g) return {}
  const path = ownerGuidePath(g)
  return {
    title: g.metaTitle,
    description: g.metaDesc,
    // Thai only: no English alternate, so no hreflang set.
    alternates: { canonical: path },
    openGraph: { title: g.metaTitle, description: g.metaDesc, type: 'article', images: [DEFAULT_OG_IMAGE], url: encodeURI(`https://spacesmate.com${path}`), modifiedTime: g.reviewed },
  }
}
