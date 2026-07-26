import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Resolve a building reference from the free-text name held in room_types.
 *
 * WHY THIS IS NEEDED
 *   Public submissions travel: form → submissions row → Stripe → webhook creates
 *   the property. `submissions` has no property_name_id column, so the reference
 *   chosen in the form would be lost in transit.
 *
 *   Rather than migrate submissions, we resolve by name at creation. The
 *   autocomplete writes the exact registry name_th, so the match is reliable when
 *   a building was picked, and still works when someone typed a name that happens
 *   to be registered.
 *
 * Returns null when nothing matches — the listing is created without a building
 * link rather than guessed at. A wrong building is worse than none.
 */
export async function resolveBuildingId(
  supabase: SupabaseClient,
  roomTypes: unknown,
): Promise<string | null> {
  try {
    if (!Array.isArray(roomTypes)) return null

    const detail = roomTypes.find(
      (r: unknown) => typeof r === 'object' && r !== null && (r as Record<string, unknown>)._type === 'rental_detail',
    ) as Record<string, unknown> | undefined

    // If the form already carried the id through, trust it.
    const direct = detail?.property_name_id
    if (typeof direct === 'string' && direct.trim()) return direct.trim()

    const raw = String(detail?.property_name ?? '').trim()
    if (!raw) return null

    // Match on the full string and on the part before any bracket, so
    // "Aguston Sukhumvit 22 (ออกัสตัน สุขุมวิท 22)" resolves too.
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '')
    const keys = new Set([norm(raw), norm(raw.split('(')[0])].filter(Boolean))

    const { data } = await supabase
      .from('property_names')
      .select('id, name_th, name_en')
      .limit(2000)

    for (const n of data ?? []) {
      if (keys.has(norm(String(n.name_th ?? ''))) || keys.has(norm(String(n.name_en ?? '')))) {
        return n.id as string
      }
    }
    return null
  } catch {
    // A building link is a bonus, never a reason to fail creating a listing.
    return null
  }
}
