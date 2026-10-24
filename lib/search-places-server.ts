import { createServerClient } from '@/lib/supabase'
import type { Building, PlaceOverride } from '@/lib/search-places'

/**
 * What an admin changed in the search place list, read with the service role.
 *
 * Returns empty lists on any error: search then runs on the built-in lists,
 * which is the right failure — a missing table must not take search down.
 */
export async function loadPlaceOverrides(): Promise<{ overrides: PlaceOverride[]; buildings: Building[] }> {
  try {
    const supabase = createServerClient()
    const [o, b] = await Promise.all([
      supabase.from('search_places').select('kind, id, th, en, lat, lng, systems, landmark_kind, aliases, hidden'),
      supabase.from('property_names').select('id, name_th, name_en, lat, lng, aliases')
        .eq('hidden', false).not('lat', 'is', null).not('lng', 'is', null),
    ])
    if (o.error) console.error('[search-places] overrides —', o.error.message)
    if (b.error) console.error('[search-places] buildings —', b.error.message)
    return {
      overrides: (o.data ?? []) as PlaceOverride[],
      buildings: (b.data ?? []).map(r => ({
        id: r.id as string, th: r.name_th as string, en: (r.name_en as string) || '',
        lat: Number(r.lat), lng: Number(r.lng), aliases: (r.aliases as string[] | null) ?? undefined,
      })),
    }
  } catch (err) {
    console.error('[search-places]', err instanceof Error ? err.message : String(err))
    return { overrides: [], buildings: [] }
  }
}
