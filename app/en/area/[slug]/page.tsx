import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AREA_KEYWORDS } from '@/lib/constants'
import { getGeneratedAreas } from '@/lib/areas'
import { loadArea, buildAreaMetadata } from '@/lib/area-shared'
import AreaPageBody from '@/components/area/AreaPageBody'

interface Props { params: { slug: string } }

/**
 * The same slug set as the Thai route: the hand-written areas plus every
 * (district, type) pair with live inventory.
 *
 * English used to cover the hand-written 16 only, which left the larger half
 * of the area surface — the pages that actually compete for "เช่าคอนโด บางนา"
 * style queries, and their English equivalents — Thai-only. The two routes
 * must agree on which slugs exist, because lib/routes-i18n prefixes /area/*
 * unconditionally on the strength of that.
 */
export async function generateStaticParams() {
  const generated = await getGeneratedAreas()
  return [
    ...AREA_KEYWORDS.map(a => ({ slug: a.slug })),
    ...generated.map(a => ({ slug: a.slug })),
  ]
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
