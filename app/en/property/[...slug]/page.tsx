import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase'
import { buildPropertyMetadata, joinSlug } from '@/lib/property-page'
import PropertyPageBody from '@/components/property/PropertyPageBody'

interface Props { params: { slug: string[] } }

// Static slugs rendered at build time; all other slugs resolved at runtime
// slug is string[] because this is a catch-all route ([...slug])
// e.g. /property/lumpini-place/condo-abc → ['lumpini-place', 'condo-abc']
export async function generateStaticParams() {
  // Real listings only. This used to pre-render the hardcoded demo array from
  // lib/property-data.ts, generating pages for properties that do not exist.
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('properties')
      .select('slug')
      .eq('listing_status', 'active')
      .limit(5000)
    return (data ?? [])
      .filter(p => p.slug)
      .map(p => ({ slug: String(p.slug).split('/') }))
  } catch {
    return []
  }
}

// Allow runtime resolution of slugs not in generateStaticParams (e.g. DB listings)
export const dynamicParams = true

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildPropertyMetadata(joinSlug(params.slug), 'en')
}

export default async function PropertyDetailPageEn({ params }: Props) {
  return <PropertyPageBody slug={joinSlug(params.slug)} locale="en" />
}
