import { createServerClient } from '@/lib/supabase'
import { DEFAULT_AMENITIES, dedupeByName, normaliseAmenity, type Amenity } from '@/lib/amenities'

/**
 * The editable amenity list (Dashboard › Settings), read on the server for the
 * property page, which now shows every amenity — ticked ones and the ones a
 * listing does not have. Same fallback rule as fetchAmenities(): any failure
 * reads as DEFAULT_AMENITIES, so the page never renders an empty list.
 */
export async function getAmenitiesServer(): Promise<Amenity[]> {
  try {
    const { data, error } = await createServerClient()
      .from('site_settings')
      .select('value')
      .eq('key', 'amenities')
      .maybeSingle()
    if (error || !data || !Array.isArray(data.value) || !data.value.length) return DEFAULT_AMENITIES
    const list = (data.value as Record<string, unknown>[])
      .map((r, i) => normaliseAmenity(r, i))
      .filter((a): a is Amenity => a !== null)
    return list.length ? dedupeByName(list) : DEFAULT_AMENITIES
  } catch {
    return DEFAULT_AMENITIES
  }
}
