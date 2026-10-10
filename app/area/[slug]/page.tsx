import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AREA_KEYWORDS } from '@/lib/constants'
import { getGeneratedAreas } from '@/lib/areas'
import { loadArea, buildAreaMetadata } from '@/lib/area-shared'
import AreaPageBody from '@/components/area/AreaPageBody'

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  // Hand-written slugs plus every (district, type) pair with live inventory.
  const generated = await getGeneratedAreas()
  return [
    ...AREA_KEYWORDS.map(a => ({ slug: a.slug })),
    ...generated.map(a => ({ slug: a.slug })),
  ]
}
export const dynamicParams = true

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildAreaMetadata(params.slug, 'th')
}

export default async function AreaPage({ params }: Props) {
  const view = await loadArea(params.slug, 'th')
  if (!view) notFound()
  return <AreaPageBody view={view} locale="th" />
}
