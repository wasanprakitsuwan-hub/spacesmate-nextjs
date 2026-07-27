import { createServerClient } from '@/lib/supabase'

/**
 * Building pages.
 *
 * WHY THEY MATTER
 *   Renters search by building name — "ลุมพินี วิลล์ อ่อนนุช ให้เช่า" is a far more
 *   common query than any generic phrase. Until now the building name lived inside
 *   the room_types JSONB as free text, so listings in one building could not be
 *   grouped and there was nothing to land those searches on.
 *
 *   properties.property_name_id now references property_names, which already held
 *   135 registered buildings and was used by nothing.
 *
 * ONLY BUILDINGS WITH LIVE INVENTORY GET A PAGE. A building page with no listings
 * is a dead end for a visitor and a thin page to a crawler.
 */

export type Building = {
  id: string
  slug: string
  nameTh: string
  nameEn: string | null
  count: number
}

export type BuildingListing = {
  slug: string
  title_th: string
  property_type: string
  district: string | null
  address_th: string | null
  images: string[]
  price_from: number
  bedrooms: number | null
  area_sqm: number | null
}

/** Every building with at least one active listing, most inventory first. */
export async function getBuildingsWithListings(): Promise<Building[]> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('properties')
      .select('property_name_id, property_names!inner(id, slug, name_th, name_en)')
      .eq('listing_status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .not('property_name_id', 'is', null)
      .limit(5000)

    if (error) {
      console.error('buildings: query failed —', error.message)
      return []
    }

    const tally = new Map<string, Building>()

    for (const row of (data ?? []) as unknown as Array<{
      property_name_id: string
      property_names: { id: string; slug: string | null; name_th: string; name_en: string | null }
    }>) {
      const n = row.property_names
      if (!n?.slug) continue          // no slug means it cannot be addressed
      const existing = tally.get(n.slug)
      if (existing) { existing.count += 1; continue }
      tally.set(n.slug, {
        id: n.id,
        slug: n.slug,
        nameTh: n.name_th,
        nameEn: n.name_en,
        count: 1,
      })
    }

    return Array.from(tally.values()).sort((a, b) => b.count - a.count)
  } catch (err) {
    console.error('buildings: unavailable —', err)
    return []
  }
}

/** One building plus its active listings. Null when unknown or empty. */
export async function getBuilding(slug: string): Promise<{ building: Building; listings: BuildingListing[] } | null> {
  try {
    const decoded = decodeURIComponent(slug)
    const supabase = createServerClient()

    const { data: nameRow } = await supabase
      .from('property_names')
      .select('id, slug, name_th, name_en')
      .eq('slug', decoded)
      .maybeSingle()

    if (!nameRow) return null

    const { data: listings } = await supabase
      .from('properties')
      .select('slug, title_th, property_type, district, address_th, images, price_from, bedrooms, area_sqm')
      .eq('listing_status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .eq('property_name_id', nameRow.id)
      .order('price_from', { ascending: true })

    const rows = (listings ?? []) as BuildingListing[]
    if (!rows.length) return null    // no live inventory — no page

    return {
      building: {
        id: nameRow.id,
        slug: nameRow.slug as string,
        nameTh: nameRow.name_th,
        nameEn: nameRow.name_en,
        count: rows.length,
      },
      listings: rows,
    }
  } catch (err) {
    console.error('building: unavailable —', err)
    return null
  }
}
