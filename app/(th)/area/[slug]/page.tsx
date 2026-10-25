import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadDistrictPage, buildDistrictMetadata } from '@/lib/district-pages'
import RentPageBody from '@/components/rent/RentPageBody'

interface Props { params: { slug: string } }

// District pages share the /rent engine and layout (lib/district-pages). The 16
// hand-written /area slugs were folded into /rent and redirect in next.config.js,
// so every slug here is a district slug. Both locales must accept the same set,
// because lib/routes-i18n prefixes /area/* unconditionally.
export const revalidate = 3600
export const dynamicParams = true

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildDistrictMetadata(params.slug, 'th')
}

export default async function AreaPage({ params }: Props) {
  const view = await loadDistrictPage(params.slug, 'th')
  if (!view) notFound()
  return <RentPageBody view={view} locale="th" />
}
