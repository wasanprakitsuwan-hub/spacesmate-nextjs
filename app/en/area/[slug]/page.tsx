import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AREA_KEYWORDS } from '@/lib/constants'
import { loadArea, buildAreaMetadata } from '@/lib/area-shared'
import AreaPageBody from '@/components/area/AreaPageBody'

interface Props { params: { slug: string } }

// English covers the hand-written areas only. The data-driven area pages are
// Thai-only, as they always have been — loadArea('…', 'en') returns null for
// them, which becomes a 404 here.
export async function generateStaticParams() {
  return AREA_KEYWORDS.map(a => ({ slug: a.slug }))
}
export const dynamicParams = true

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildAreaMetadata(params.slug, 'en')
}

export default async function AreaPageEn({ params }: Props) {
  const view = await loadArea(params.slug, 'en')
  if (!view) notFound()
  return <AreaPageBody view={view} locale="en" slug={params.slug} />
}
