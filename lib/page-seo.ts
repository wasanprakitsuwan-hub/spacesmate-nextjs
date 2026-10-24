import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { createServerClient } from '@/lib/supabase'

/**
 * Page titles, descriptions and indexing set in /dashboard/pages, applied to
 * the live page.
 *
 * Each page keeps its own metadata in code as the default. A value typed in the
 * dashboard replaces it; an empty field leaves the code's version alone. So the
 * site never depends on the table: if site_pages cannot be read, every page
 * renders exactly what it did before.
 *
 * The dashboard saves with revalidateTag(SITE_PAGES_TAG), so an edit shows on
 * the next request; the 5-minute revalidate is only the backstop.
 */

export const SITE_PAGES_TAG = 'site-pages'

type SeoRow = {
  path: string
  meta_title: string | null
  meta_desc: string | null
  meta_title_en: string | null
  meta_desc_en: string | null
  is_indexable: boolean | null
}

const loadSeoRows = unstable_cache(
  async (): Promise<SeoRow[]> => {
    const { data, error } = await createServerClient()
      .from('site_pages')
      .select('path, meta_title, meta_desc, meta_title_en, meta_desc_en, is_indexable')
      .neq('status', 'deleted')
    if (error) throw error
    return (data ?? []) as SeoRow[]
  },
  ['site-pages-seo'],
  { revalidate: 300, tags: [SITE_PAGES_TAG] },
)

/** The root layout's template adds the brand; one typed by hand would repeat it. */
function stripBrand(title: string): string {
  return title.replace(/\s*[|\-–—]\s*SpacesMate\s*$/i, '').trim()
}

export async function withPageSeo(path: string, locale: 'th' | 'en', base: Metadata): Promise<Metadata> {
  let row: SeoRow | undefined
  try {
    row = (await loadSeoRows()).find(r => r.path === path)
  } catch (err) {
    console.error('[page-seo]', err instanceof Error ? err.message : String(err))
    return base
  }
  if (!row) return base

  const rawTitle = (locale === 'en' ? row.meta_title_en : row.meta_title)?.trim()
  const desc = (locale === 'en' ? row.meta_desc_en : row.meta_desc)?.trim()
  const title = rawTitle ? stripBrand(rawTitle) : ''

  const out: Metadata = { ...base }
  if (title) out.title = title
  if (desc) out.description = desc
  if ((title || desc) && base.openGraph) {
    // Social cards show the title alone, so they carry the brand themselves.
    const ogTitle = title ? `${title} | SpacesMate` : null
    out.openGraph = {
      ...base.openGraph,
      ...(ogTitle ? { title: ogTitle } : {}),
      ...(desc ? { description: desc } : {}),
    }
  }
  if (row.is_indexable === false) out.robots = { index: false, follow: true }
  return out
}
