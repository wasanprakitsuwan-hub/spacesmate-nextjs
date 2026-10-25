import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadRentPage, buildRentMetadata } from '@/lib/rent-pages'
import RentPageBody from '@/components/rent/RentPageBody'

interface Props { params: { slug: string } }

// Listings within the radius change a few times a day; an hour is fresh enough.
export const revalidate = 3600
export const dynamicParams = true

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildRentMetadata(params.slug, 'en')
}

export default async function RentPageEn({ params }: Props) {
  const view = await loadRentPage(params.slug, 'en')
  if (!view) notFound()
  return <RentPageBody view={view} locale="en" />
}
