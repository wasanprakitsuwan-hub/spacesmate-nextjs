import { STATIONS, type Station, type RailSystem } from '@/lib/stations'
import { LANDMARKS, type Landmark, type LandmarkKind } from '@/lib/landmarks'

/**
 * The search place list as the admin left it.
 *
 * lib/stations.ts and lib/landmarks.ts are the built-in lists. The
 * search_places table holds only what an admin changed (see the 20261024a
 * migration): a row replaces the built-in entry with the same id, a new id adds
 * one, hidden removes one. mergePlaces() applies those rows; with none it
 * returns the built-in lists unchanged, which is also the fallback whenever the
 * table cannot be read.
 */

export type PlaceOverride = {
  kind: 'station' | 'landmark'
  id: string
  th: string
  en: string
  lat: number
  lng: number
  systems: RailSystem[] | null
  landmark_kind: LandmarkKind | null
  aliases: string[] | null
  hidden: boolean
  updated_at?: string
}

/** A property name with coordinates — searchable as a place. */
export type Building = {
  id: string
  th: string
  en: string
  lat: number
  lng: number
  aliases?: string[]
}

export type PlaceList = {
  stations: Station[]
  landmarks: Landmark[]
  buildings: Building[]
}

export const RAIL_SYSTEMS: RailSystem[] = ['BTS', 'MRT', 'ARL', 'SRT']
export const LANDMARK_KINDS: LandmarkKind[] = ['university', 'mall', 'hospital', 'transport', 'place']

export function mergePlaces(overrides: PlaceOverride[], buildings: Building[] = []): PlaceList {
  const st = new Map(STATIONS.map(s => [s.id, s]))
  const lm = new Map(LANDMARKS.map(l => [l.id, l]))

  for (const o of overrides) {
    if (o.kind === 'station') {
      if (o.hidden) { st.delete(o.id); continue }
      st.set(o.id, {
        id: o.id, th: o.th, en: o.en, lat: o.lat, lng: o.lng,
        systems: o.systems?.length ? o.systems : (st.get(o.id)?.systems ?? ['BTS']),
      })
    } else {
      if (o.hidden) { lm.delete(o.id); continue }
      lm.set(o.id, {
        id: o.id, th: o.th, en: o.en, lat: o.lat, lng: o.lng,
        kind: o.landmark_kind ?? lm.get(o.id)?.kind ?? 'place',
        aliases: o.aliases ?? undefined,
      })
    }
  }

  return { stations: Array.from(st.values()), landmarks: Array.from(lm.values()), buildings }
}

/** Coordinates anywhere in Thailand — the same bounds the table enforces. */
export function inThailand(lat: number, lng: number): boolean {
  return lat >= 5 && lat <= 21 && lng >= 97 && lng <= 106
}

/**
 * Coordinates from what an admin pastes: "13.7563, 100.5018", or a full Google
 * Maps URL (…/@13.7563,100.5018,17z, …!3d13.7563!4d100.5018, ?q=13.7,100.5).
 *
 * Short share links (maps.app.goo.gl/…) carry no coordinates until opened, so
 * they return null and the form says to open the link and copy the full URL.
 */
export function parseCoords(text: string): { lat: number; lng: number } | null {
  const s = text.trim()
  const patterns = [
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,       // the pin itself — most precise
    /[?&](?:q|query|ll|center|destination)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,            // the map's centre
    /^(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)$/,  // plain "lat, lng"
  ]
  for (const re of patterns) {
    const m = s.match(re)
    if (!m) continue
    const lat = Number(m[1]), lng = Number(m[2])
    if (isFinite(lat) && isFinite(lng) && inThailand(lat, lng)) return { lat, lng }
  }
  return null
}
