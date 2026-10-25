'use client'

import { SEARCH_T, type Locale } from '@/lib/pages-i18n'
import { SEARCH_UI } from '@/lib/search-ui-i18n'

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
// Link here is LocaleLink: it keeps the reader in the language they are already
// reading. See components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import { localeHref } from '@/lib/routes-i18n'
import {
  haversineKm, nearestStation, stationLabel, distanceLabel,
  parseQuery, haystack, matchesTerms,
  suggestPlaces, placeFromParams, setPlaceList, stationById, placeKey, placeLabel, placePoint, placeIcon, inGreaterBangkok, type Place,
} from '@/lib/search-match'
import type { Station, RailSystem } from '@/lib/stations'
import { mergePlaces, type Building, type PlaceOverride } from '@/lib/search-places'
import { districtEn, districtLabel, stripDistrictPrefix } from '@/lib/geo-i18n'
import { DEFAULT_AMENITIES } from '@/lib/amenities'
import { localiseAmenity } from '@/lib/property-i18n'
import { TH_MONTHS, EN_MONTHS } from '@/lib/site-i18n'
import { dailyShuffle } from '@/lib/fair-rotation'
import { showsVideo } from '@/lib/packages'
import { C, RADIUS, WRAP } from '@/lib/ui'

/**
 * /search, redesigned 25 Oct 2026.
 *
 * Every filter lives in the URL, so a filtered page can be shared, bookmarked
 * and reached with Back:
 *   q, station / landmark / building / district / at+name, r (radius km)
 *   type   comma list of property_type values (condo,apartment,house,office,coworking)
 *   term   monthly | daily
 *   price_min, price_max
 *   beds   studio | 1 | 2 | 3 (3 means 3 or more)
 *   min    longest acceptable minimum contract (a rental_term value)
 *   am     comma list of amenity ids from lib/amenities
 *   video  1 = has a video
 *   sort   rec (default) | new | price_asc | price_desc | near
 *   page   1-based, PAGE_SIZE per page
 *
 * "แนะนำ" (rec) is the same per-visitor daily Fair Rotation as the homepage,
 * so nobody can buy the top of the list and every listing takes its turn there.
 */

const PAGE_SIZE = 20
const RADII = [1, 3, 5, 10]
const TYPES = ['condo', 'apartment', 'house', 'office', 'coworking'] as const
const TERM_ORDER = ['daily', '1_month', '3_months', '6_months', '12_months']
// The amenity filters offered, by id in lib/amenities. Matched on the Thai
// name, which is what listings store.
const AMENITY_FILTER_IDS = ['4', '5', '6', '7', 'keycard', '11', '3', '1783608191258', '2']
const SORTS = ['rec', 'new', 'price_asc', 'price_desc', 'near'] as const

// Before the redesign, links carried the search page's own type keys.
const LEGACY_TYPES: Record<string, string> = { Apartment: 'apartment', Condo: 'condo', Office: 'office', 'Co-Working': 'coworking', cowork: 'coworking' }

// Shown as chips when there are not yet enough listings to rank stations by.
const POPULAR_STATION_IDS = ['E4', 'E6', 'E5', 'N5', 'E9', 'BL20', 'S2', 'BL15']

/** A listing as the search page needs it: what a row shows plus what it is matched on. */
type Row = {
  slug: string
  title: string
  type: string            // property_type as stored
  priceFrom: number
  priceTo: number
  term: string            // rental_term: also the minimum contract
  beds: number
  size: string
  floor: string
  district: string        // as stored, prefix stripped — what district search matches
  districtShown: string
  lat: number
  lng: number
  amenities: string[]
  image: string
  hasVideo: boolean
  updated: string
  created: string
  hay: string
  nearest: { station: Station; km: number } | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRow(l: any, locale: Locale): Row {
  const imgs: string[] = Array.isArray(l.images) ? l.images : []
  const nearest = nearestStation(parseFloat(l.lat), parseFloat(l.lng))
  return {
    slug: l.slug,
    title: (locale === 'en' ? (l.title_en || l.title_th) : (l.title_th || l.title_en)) || SEARCH_T[locale].untitled,
    type: l.property_type || 'condo',
    priceFrom: Number(l.price_from) || 0,
    priceTo: Number(l.price_to) || 0,
    term: l.rental_term || '1_month',
    beds: Number(l.bedrooms) || 0,
    size: l.area_sqm ? String(l.area_sqm) : '',
    floor: l.floor ? String(l.floor) : '',
    district: stripDistrictPrefix(l.district || ''),
    districtShown: districtLabel(l.district, l.province, locale) || '',
    lat: parseFloat(l.lat), lng: parseFloat(l.lng),
    amenities: Array.isArray(l.amenities) ? l.amenities : [],
    image: imgs.find(i => i.startsWith('https://')) ?? imgs.find(i => i.startsWith('/')) ?? '',
    // Same gate as the listing page: only packages that include video show one.
    hasVideo: Boolean(l.video_url) && showsVideo(l.package_type),
    updated: l.updated_at || l.created_at || '',
    created: l.created_at || '',
    nearest,
    hay: haystack({
      title: l.title_th || '', titleEn: l.title_en || '', excerpt: l.description_th || '',
      address: l.address_th || '', district: l.district || '',
      districtEn: districtEn(l.district, l.province), amenities: l.amenities || [], nearest,
    }),
  }
}

function lineColor(system: RailSystem): string {
  return system === 'BTS' ? C.bts : system === 'MRT' ? C.mrt : '#C8102E'
}

function shortDate(iso: string, locale: Locale): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return `${d.getDate()} ${(locale === 'en' ? EN_MONTHS : TH_MONTHS)[d.getMonth()]}`
}

const list = (v: string | null) => (v ? v.split(',').filter(Boolean) : [])

function SearchContent({ locale }: { locale: Locale }) {
  const t = SEARCH_T[locale]
  const u = SEARCH_UI[locale]
  const sp = useSearchParams()
  const router = useRouter()
  const base = localeHref('/search', locale)

  // ── Filters, read from the URL ────────────────────────────────────────────
  const types = list(sp.get('type')).map(x => LEGACY_TYPES[x] ?? x).filter(x => (TYPES as readonly string[]).includes(x))
  const term = sp.get('term') === 'daily' ? 'daily' : sp.get('term') === 'monthly' ? 'monthly' : ''
  const priceMin = Number(sp.get('price_min')) || 0
  const priceMax = Number(sp.get('price_max')) || 0
  const beds = sp.get('beds') || ''
  const minTerm = TERM_ORDER.includes(sp.get('min') || '') ? sp.get('min')! : ''
  const amenityIds = list(sp.get('am'))
  const video = sp.get('video') === '1'
  const sortParam = (SORTS as readonly string[]).includes(sp.get('sort') || '') ? sp.get('sort')! : 'rec'
  const pageParam = Math.max(1, Math.floor(Number(sp.get('page')) || 1))

  /** Change some params and drop back to page 1. */
  const setParams = useCallback((changes: Record<string, string | null>, keepPage = false) => {
    const p = new URLSearchParams(sp.toString())
    for (const [k, v] of Object.entries(changes)) { if (v) p.set(k, v); else p.delete(k) }
    if (!keepPage) p.delete('page')
    const qs = p.toString()
    router.replace(`${base}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [sp, router, base])

  const [keyword, setKeyword] = useState(sp.get('q') || '')
  const [rows, setRows] = useState<Row[]>([])
  const [loaded, setLoaded] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(() => Boolean(minTerm || amenityIds.length || video))
  // Price boxes are typed into, then applied on blur or Enter.
  const [minDraft, setMinDraft] = useState(priceMin ? String(priceMin) : '')
  const [maxDraft, setMaxDraft] = useState(priceMax ? String(priceMax) : '')
  useEffect(() => { setMinDraft(priceMin ? String(priceMin) : ''); setMaxDraft(priceMax ? String(priceMax) : '') }, [priceMin, priceMax])

  // A chosen place — a station, landmark, building, district or map point.
  const [place, setPlace] = useState<Place | null>(() => placeFromParams(sp.get('station'), sp.get('district'), sp.get('landmark'), sp.get('at'), sp.get('name'), sp.get('building')))
  const radiusParam = Number(sp.get('r'))
  const placeRadiusKm = RADII.includes(radiusParam) ? radiusParam : 1
  const [suggestOpen, setSuggestOpen] = useState(false)
  // Bumped when the admin-edited place list arrives, so suggestions use it.
  const [placesVersion, setPlacesVersion] = useState(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const suggestions = useMemo(() => (place ? [] : suggestPlaces(keyword)), [keyword, place, placesVersion])
  // Map lookup for a place we have no list entry for. Run on request only
  // (Enter or the "find on map" row), never per keystroke: the free map
  // service does not allow autocomplete traffic.
  const [mapLookup, setMapLookup] = useState<'idle' | 'loading' | 'notfound'>('idle')
  const canMapLookup = !place && keyword.trim().length >= 2

  // ── Geolocation ───────────────────────────────────────────────────────────
  const [userLatLng, setUserLatLng] = useState<{ lat: number; lng: number } | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  // The place list as the admin left it. Until it answers (or if it fails),
  // search runs on the built-in stations and landmarks.
  useEffect(() => {
    fetch('/api/search-places')
      .then(r => r.json())
      .then((d: { overrides?: PlaceOverride[]; buildings?: Building[] }) => {
        setPlaceList(mergePlaces(d.overrides ?? [], d.buildings ?? []))
        setPlacesVersion(v => v + 1)
        // A link to a place only the admin list knows (a property name, a new
        // station) could not be resolved on first render.
        setPlace(cur => cur ?? placeFromParams(sp.get('station'), null, sp.get('landmark'), null, null, sp.get('building')))
      })
      .catch(() => { /* built-in lists stay in use */ })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetch('/api/listings/public')
      .then(r => r.json())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((d: { listings?: any[] }) => setRows((d.listings ?? []).map(l => toRow(l, locale))))
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [locale])

  // Fair Rotation needs localStorage, so it is worked out after mount.
  const [rotation, setRotation] = useState<Map<string, number> | null>(null)
  useEffect(() => {
    if (rows.length) setRotation(new Map(dailyShuffle(rows, r => r.slug).map((r, i) => [r.slug, i])))
  }, [rows])

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) { setGeoError(t.geoUnsupported); return }
    setGeoLoading(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLatLng({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGeoLoading(false)
        if (!sp.get('sort')) setParams({ sort: 'near' })
      },
      () => { setGeoError(t.geoDenied); setGeoLoading(false) },
      { timeout: 8000 },
    )
  }, [t, sp, setParams])

  function clearGeo() {
    setUserLatLng(null)
    setGeoError(null)
    if (sortParam === 'near' && !place) setParams({ sort: null })
  }

  // The point distances are measured from: the chosen place, else the visitor.
  const origin = (place ? placePoint(place) : null) ?? userLatLng
  const distFrom = useCallback((r: Row) => origin && isFinite(r.lat) && isFinite(r.lng) ? haversineKm(origin.lat, origin.lng, r.lat, r.lng) : Infinity, [origin])

  // Everything but the type filter, so the type counts answer "how many if I tick this".
  const baseFiltered = useMemo(() => {
    // What was typed: a type word, a price, a bedroom count, and whatever is
    // left over, which has to appear in the listing (see lib/search-match).
    const q = parseQuery(place ? '' : keyword)
    let out = rows
    if (q.terms.length) out = out.filter(r => matchesTerms(r.hay, q.terms))
    if (place?.kind === 'district') out = out.filter(r => r.district === place.th)
    if (q.beds !== undefined) out = out.filter(r => r.beds === q.beds)
    const lo = priceMin || q.priceMin || 0
    const hi = priceMax || q.priceMax || 0
    // A listing priced as a range matches when the range overlaps the filter.
    if (lo) out = out.filter(r => r.priceFrom > 0 && Math.max(r.priceFrom, r.priceTo) >= lo)
    if (hi) out = out.filter(r => r.priceFrom > 0 && r.priceFrom <= hi)
    if (term === 'daily') out = out.filter(r => r.term === 'daily')
    if (term === 'monthly') out = out.filter(r => r.term !== 'daily')
    if (beds === 'studio') out = out.filter(r => r.beds === 0)
    else if (beds === '3') out = out.filter(r => r.beds >= 3)
    else if (beds) out = out.filter(r => r.beds === Number(beds))
    if (minTerm) out = out.filter(r => TERM_ORDER.indexOf(r.term) <= TERM_ORDER.indexOf(minTerm))
    for (const id of amenityIds) {
      const name = DEFAULT_AMENITIES.find(a => a.id === id)?.name_th
      if (name) out = out.filter(r => r.amenities.includes(name))
    }
    if (video) out = out.filter(r => r.hasVideo)
    // Radius: around the chosen place always; around the visitor once they pick one.
    if (place && placePoint(place)) out = out.filter(r => distFrom(r) <= placeRadiusKm)
    else if (userLatLng && sp.get('r')) out = out.filter(r => distFrom(r) <= placeRadiusKm)
    // q.types (a type word typed into the box) narrows when no box is ticked
    if (!types.length && q.types.length) {
      const want = new Set(q.types.map(x => LEGACY_TYPES[x] ?? x.toLowerCase()))
      out = out.filter(r => want.has(r.type))
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, keyword, place, priceMin, priceMax, term, beds, minTerm, sp.get('am'), video, placeRadiusKm, userLatLng, distFrom, sp.get('r')])

  const typeCounts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const r of baseFiltered) c[r.type] = (c[r.type] ?? 0) + 1
    return c
  }, [baseFiltered])

  const sort = sortParam === 'near' && !origin ? 'rec' : sortParam
  const results = useMemo(() => {
    const out = types.length ? baseFiltered.filter(r => types.includes(r.type)) : [...baseFiltered]
    if (sort === 'new') out.sort((a, b) => b.updated.localeCompare(a.updated))
    else if (sort === 'price_asc') out.sort((a, b) => (a.priceFrom || Infinity) - (b.priceFrom || Infinity))
    else if (sort === 'price_desc') out.sort((a, b) => b.priceFrom - a.priceFrom)
    else if (sort === 'near') out.sort((a, b) => distFrom(a) - distFrom(b))
    else if (rotation) out.sort((a, b) => (rotation.get(a.slug) ?? 0) - (rotation.get(b.slug) ?? 0))
    else out.sort((a, b) => b.created.localeCompare(a.created))
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseFiltered, sp.get('type'), sort, rotation, distFrom])

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const page = Math.min(pageParam, totalPages)
  const shown = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Nothing within the chosen distance: show the closest few instead of a dead end.
  const closest = useMemo(() => {
    const st = place ? placePoint(place) : null
    if (!st || results.length) return []
    return rows.filter(r => isFinite(r.lat)).map(r => ({ r, km: haversineKm(st.lat, st.lng, r.lat, r.lng) }))
      .sort((a, b) => a.km - b.km).slice(0, 4).map(x => x.r)
  }, [place, results, rows])

  // Chips: stations that actually have listings within a kilometre come first.
  const popularPlaces = useMemo<Place[]>(() => {
    const counts = new Map<string, number>()
    for (const r of rows) if (r.nearest && r.nearest.km <= 1) counts.set(r.nearest.station.id, (counts.get(r.nearest.station.id) ?? 0) + 1)
    const ids = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([id]) => id)
    for (const id of POPULAR_STATION_IDS) if (!ids.includes(id)) ids.push(id)
    return ids.slice(0, 6).flatMap(id => { const st = stationById(id); return st ? [{ kind: 'station' as const, station: st }] : [] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, placesVersion])

  function choosePlace(next: Place | null) {
    setPlace(next)
    setSuggestOpen(false)
    if (next) setKeyword('')
    const ch: Record<string, string | null> = { station: null, district: null, landmark: null, building: null, at: null, name: null, q: null }
    if (next?.kind === 'station') ch.station = next.station.id
    if (next?.kind === 'landmark') ch.landmark = next.landmark.id
    if (next?.kind === 'building') ch.building = next.building.id
    if (next?.kind === 'district') ch.district = next.th
    if (next?.kind === 'point') { ch.at = `${next.lat.toFixed(5)},${next.lng.toFixed(5)}`; ch.name = next.name }
    if (!next && sortParam === 'near' && !userLatLng) ch.sort = null
    setParams(ch)
  }

  async function findOnMap() {
    const q = keyword.trim()
    if (q.length < 2) return
    setSuggestOpen(false)
    setMapLookup('loading')
    try {
      const r = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`)
      const data = r.ok ? await r.json() : { results: [] }
      const hit = (data.results ?? [])
        .map((x: { lat: string; lon: string }) => ({ lat: Number(x.lat), lng: Number(x.lon) }))
        .find((x: { lat: number; lng: number }) => isFinite(x.lat) && isFinite(x.lng) && inGreaterBangkok(x.lat, x.lng))
      if (!hit) { setMapLookup('notfound'); return }
      setMapLookup('idle')
      choosePlace({ kind: 'point', name: q, lat: hit.lat, lng: hit.lng })
    } catch {
      setMapLookup('notfound')
    }
  }

  function submitSearch() {
    if (suggestions.length && suggestOpen) { choosePlace(suggestions[0]); return }
    setSuggestOpen(false)
    setParams({ q: keyword.trim() || null })
  }

  function resetFilters() {
    clearGeo()
    setPlace(null)
    setKeyword('')
    router.replace(base, { scroll: false })
  }

  function toggleIn(key: 'type' | 'am', current: string[], value: string) {
    const next = current.includes(value) ? current.filter(x => x !== value) : [...current, value]
    setParams({ [key]: next.length ? next.join(',') : null })
  }

  function applyPrice() {
    const lo = Number(minDraft.replace(/[^\d]/g, '')) || 0
    const hi = Number(maxDraft.replace(/[^\d]/g, '')) || 0
    setParams({ price_min: lo ? String(lo) : null, price_max: hi ? String(hi) : null })
  }

  function pageHref(n: number) {
    const p = new URLSearchParams(sp.toString())
    if (n <= 1) p.delete('page'); else p.set('page', String(n))
    const qs = p.toString()
    return `${base}${qs ? `?${qs}` : ''}`
  }

  const placeName = place ? placeLabel(place, locale) : ''
  const radiusUsable = Boolean((place && placePoint(place)) || userLatLng)

  // ── Small pieces ───────────────────────────────────────────────────────────
  const sectionTitle: React.CSSProperties = { fontWeight: 600, color: C.green, fontSize: 15 }
  const rule = <div style={{ borderTop: `1px solid ${C.line}` }} />
  const chip = (on: boolean): React.CSSProperties => ({
    border: on ? `1.5px solid ${C.green}` : `1px solid ${C.border}`, background: on ? C.tint : C.white,
    color: on ? C.green : C.ink, borderRadius: RADIUS, padding: '5px 11px', fontSize: 13,
    whiteSpace: 'nowrap', cursor: 'pointer', font: 'inherit', lineHeight: 1.5,
  })
  const seg = (on: boolean, disabled = false): React.CSSProperties => ({
    flex: 1, textAlign: 'center', borderRadius: 4, padding: '6px 8px', fontSize: 13, border: 0,
    background: on ? C.green : 'transparent', color: on ? C.white : disabled ? C.faint : C.ink,
    cursor: disabled ? 'default' : 'pointer', font: 'inherit', whiteSpace: 'nowrap',
  })
  const segWrap: React.CSSProperties = { display: 'flex', gap: 2, border: `1px solid ${C.border}`, borderRadius: RADIUS, padding: 2, background: C.white }
  const check = (on: boolean, label: string, onChange: () => void, count?: number) => (
    <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
      <input type="checkbox" checked={on} onChange={onChange} style={{ accentColor: C.teal, width: 16, height: 16 }} />
      <span style={{ flexGrow: 1 }}>{label}</span>
      {count !== undefined && <span style={{ color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{count}</span>}
    </label>
  )

  return (
    <div>
      {/* Search bar */}
      <div style={{ borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: WRAP, margin: '0 auto', padding: '14px 24px' }}>
          <form onSubmit={e => { e.preventDefault(); submitSearch() }} role="search" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 480px', maxWidth: 620 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '0 14px', height: 46 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
                <input type="text" value={keyword}
                  onChange={e => { setKeyword(e.target.value); setSuggestOpen(true); setMapLookup('idle'); if (place) choosePlace(null) }}
                  onFocus={() => setSuggestOpen(true)}
                  onBlur={() => setTimeout(() => setSuggestOpen(false), 150)}
                  onKeyDown={e => {
                    if (e.key !== 'Enter') return
                    if (!(suggestions.length && suggestOpen) && canMapLookup && !rows.some(r => matchesTerms(r.hay, parseQuery(keyword).terms))) { e.preventDefault(); findOnMap() }
                  }}
                  placeholder={place ? placeName : t.searchPlaceholder} aria-label={t.searchPlaceholder} aria-autocomplete="list"
                  style={{ border: 0, outline: 'none', font: 'inherit', fontSize: 15, width: '100%', background: 'transparent', color: C.ink }} />
                {keyword && (
                  <button type="button" onClick={() => { setKeyword(''); setParams({ q: null }) }} aria-label={u.clear}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 4, display: 'flex' }}>
                    <span className="msym" style={{ fontSize: 18 }}>close</span>
                  </button>
                )}
              </label>
              {suggestOpen && (suggestions.length > 0 || canMapLookup) && (
                <ul role="listbox" style={{ position: 'absolute', zIndex: 20, top: 'calc(100% + 6px)', left: 0, right: 0, margin: 0, padding: 6, listStyle: 'none', background: C.white, border: `1px solid ${C.line}`, borderRadius: 10, boxShadow: '0 8px 24px rgba(35,31,32,0.10)' }}>
                  {suggestions.map(sg => (
                    <li key={placeKey(sg)} role="option" aria-selected={false}>
                      <button type="button" onMouseDown={e => { e.preventDefault(); choosePlace(sg) }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', border: 'none', background: 'none', borderRadius: RADIUS, cursor: 'pointer', textAlign: 'left', fontSize: 14, color: C.ink, font: 'inherit' }}>
                        <span className="msym" style={{ fontSize: 18, color: C.teal }}>{placeIcon(sg)}</span>
                        <span style={{ flex: 1 }}>{placeLabel(sg, locale)}</span>
                        <span style={{ fontSize: 12, color: C.muted }}>{sg.kind === 'station' ? t.suggestStations : sg.kind === 'landmark' ? t.suggestLandmarks : t.suggestDistricts}</span>
                      </button>
                    </li>
                  ))}
                  {canMapLookup && (
                    <li role="option" aria-selected={false}>
                      <button type="button" onMouseDown={e => { e.preventDefault(); findOnMap() }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', border: 'none', borderTop: suggestions.length ? `1px solid ${C.line2}` : 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14, color: C.green, font: 'inherit' }}>
                        <span className="msym" style={{ fontSize: 18, color: C.teal }}>map</span>
                        <span style={{ flex: 1 }}>{t.findOnMap.replace('{q}', keyword.trim())}</span>
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </div>
            <button type="submit" className="sm-btn-primary"
              style={{ background: C.teal, color: C.white, border: `1px solid ${C.teal}`, padding: '11px 18px', borderRadius: RADIUS, fontWeight: 500, font: 'inherit', cursor: 'pointer', flexShrink: 0 }}>
              {u.search}
            </button>
          </form>
          {mapLookup !== 'idle' && (
            <p style={{ color: C.muted, fontSize: 13, margin: '8px 0 0' }}>{mapLookup === 'loading' ? t.mapLoading : t.mapNotFound}</p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 13 }}>
            {place ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.tint, color: C.green, borderRadius: RADIUS, padding: '4px 6px 4px 10px', fontWeight: 500 }}>
                <span className="msym" style={{ fontSize: 15, color: C.teal }}>{placeIcon(place)}</span>
                {u.near(placeName)}
                <button type="button" onClick={() => choosePlace(null)} aria-label={u.clear}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 0, display: 'flex' }}>
                  <span className="msym" style={{ fontSize: 15 }}>close</span>
                </button>
              </span>
            ) : (
              <>
                <span style={{ color: C.muted }}>{t.popularPlaces}</span>
                {popularPlaces.map(pl => (
                  <button key={placeKey(pl)} type="button" onClick={() => choosePlace(pl)} style={chip(false)}>{placeLabel(pl, locale)}</button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: WRAP, margin: '0 auto', padding: '24px 24px 72px' }}>
        <button type="button" className="sm-filter-toggle" onClick={() => setFilterOpen(o => !o)} aria-expanded={filterOpen}
          style={{ alignItems: 'center', justifyContent: 'space-between', gap: 8, background: C.white, border: `1px solid ${C.border}`, borderRadius: RADIUS, padding: '11px 14px', fontSize: 15, fontWeight: 500, color: C.green, cursor: 'pointer', width: '100%', marginBottom: 16, font: 'inherit' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="msym" style={{ fontSize: 20, color: C.teal }}>tune</span>{u.filters}</span>
          <span className="msym" style={{ fontSize: 22, color: C.muted }}>{filterOpen ? 'expand_less' : 'expand_more'}</span>
        </button>

        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }} className="sm-searchlayout">
          {/* Filters */}
          <aside className={`sm-filter-aside${filterOpen ? ' filter-open' : ''}`}
            style={{ flex: '0 0 250px', display: 'flex', flexDirection: 'column', gap: 22, fontSize: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={sectionTitle}>{u.termTitle}</span>
              <div style={segWrap} role="group" aria-label={u.termTitle}>
                {([['', u.termAll], ['monthly', u.termMonthly], ['daily', u.termDaily]] as const).map(([k, label]) => (
                  <button key={k} type="button" aria-pressed={term === k} onClick={() => setParams({ term: k || null })} style={seg(term === k)}>{label}</button>
                ))}
              </div>
            </div>
            {rule}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={sectionTitle}>{u.typeTitle}</span>
              {check(types.length === 0, t.allTypes, () => setParams({ type: null }), baseFiltered.length)}
              {TYPES.map(k => check(types.includes(k), u.types[k], () => toggleIn('type', types, k), typeCounts[k] ?? 0))}
            </div>
            {rule}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={sectionTitle}>{term === 'daily' ? u.priceTitleDay : u.priceTitleMonth}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {([[u.priceMin, minDraft, setMinDraft, '฿0'], [u.priceMax, maxDraft, setMaxDraft, u.noLimit]] as const).map(([label, val, setVal, ph]) => (
                  <label key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, border: `1px solid ${C.border}`, background: C.white, borderRadius: RADIUS, padding: '6px 10px', minWidth: 0 }}>
                    <span style={{ fontSize: 12, color: C.muted }}>{label}</span>
                    <input inputMode="numeric" value={val} placeholder={ph}
                      onChange={e => setVal(e.target.value.replace(/[^\d]/g, ''))}
                      onBlur={applyPrice} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyPrice() } }}
                      aria-label={label}
                      style={{ border: 0, outline: 'none', font: 'inherit', fontSize: 14, width: '100%', background: 'transparent', padding: 0, fontVariantNumeric: 'tabular-nums' }} />
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {u.pricePresets.map(pr => {
                  const on = String(priceMin || '') === pr.min && String(priceMax || '') === pr.max
                  return <button key={pr.label} type="button" aria-pressed={on} onClick={() => setParams(on ? { price_min: null, price_max: null } : { price_min: pr.min || null, price_max: pr.max || null })} style={chip(on)}>{pr.label}</button>
                })}
              </div>
            </div>
            {rule}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={sectionTitle}>{u.bedsTitle}</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {([['', u.bedsAll], ['studio', u.studio], ['1', '1'], ['2', '2'], ['3', '3+']] as const).map(([k, label]) => (
                  <button key={k} type="button" aria-pressed={beds === k} onClick={() => setParams({ beds: k || null })} style={chip(beds === k)}>{label}</button>
                ))}
              </div>
            </div>
            {rule}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={sectionTitle}>{u.distTitle}</span>
              <div style={{ ...segWrap, background: radiusUsable ? C.white : '#f1efe9', borderColor: radiusUsable ? C.border : C.line }} role="group" aria-label={u.distTitle}>
                {RADII.map(km => {
                  const on = radiusUsable && placeRadiusKm === km && (Boolean(place) || Boolean(sp.get('r')))
                  return (
                    <button key={km} type="button" disabled={!radiusUsable} aria-pressed={on}
                      onClick={() => setParams({ r: km === 1 && place ? null : String(km) })} style={seg(on, !radiusUsable)}>
                      {km} {t.km}
                    </button>
                  )
                })}
              </div>
              {!radiusUsable && <span style={{ fontSize: 12, color: C.muted }}>{u.distHint}</span>}
              {!place && (userLatLng ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.green }}>
                  <span className="msym" style={{ fontSize: 16, color: C.teal }}>near_me</span>{u.nearMeOn}
                  <button type="button" onClick={clearGeo} aria-label={u.clear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 0, display: 'flex' }}>
                    <span className="msym" style={{ fontSize: 15 }}>close</span>
                  </button>
                </span>
              ) : (
                <button type="button" onClick={requestLocation} disabled={geoLoading}
                  style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 0, padding: 0, color: C.teal, fontSize: 13, cursor: geoLoading ? 'wait' : 'pointer', font: 'inherit' }}>
                  <span className="msym" style={{ fontSize: 16 }}>near_me</span>{geoLoading ? t.locating : u.nearMe}
                </button>
              ))}
              {geoError && <span style={{ fontSize: 12, color: '#b91c1c' }}>{geoError}</span>}
            </div>
            {rule}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button type="button" onClick={() => setMoreOpen(o => !o)} aria-expanded={moreOpen}
                style={{ ...sectionTitle, display: 'flex', justifyContent: 'space-between', background: 'none', border: 0, padding: 0, cursor: 'pointer', font: 'inherit', fontWeight: 600 }}>
                {u.moreTitle} <span aria-hidden="true" style={{ color: C.muted, fontWeight: 400 }}>{moreOpen ? '−' : '+'}</span>
              </button>
              {moreOpen && (
                <>
                  <span style={{ fontSize: 13, color: C.muted }}>{u.minTermTitle}</span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {TERM_ORDER.map(k => (
                      <button key={k} type="button" aria-pressed={minTerm === k} onClick={() => setParams({ min: minTerm === k ? null : k })} style={chip(minTerm === k)}>{u.minTerms[k]}</button>
                    ))}
                  </div>
                  <span style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{u.amenitiesTitle}</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 10px' }}>
                    {AMENITY_FILTER_IDS.map(id => {
                      const a = DEFAULT_AMENITIES.find(x => x.id === id)
                      return a ? check(amenityIds.includes(id), localiseAmenity(a.name_th, locale), () => toggleIn('am', amenityIds, id)) : null
                    })}
                  </div>
                  <span style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{u.otherTitle}</span>
                  {check(video, u.hasVideo, () => setParams({ video: video ? null : '1' }))}
                </>
              )}
            </div>
            <button type="button" onClick={resetFilters} className="sm-btn-ghost"
              style={{ background: C.white, color: C.ink, border: `1px solid ${C.border}`, padding: 9, borderRadius: RADIUS, fontWeight: 500, fontSize: 14, cursor: 'pointer', font: 'inherit' }}>
              {u.clear}
            </button>
          </aside>

          {/* Results */}
          <main style={{ flex: 1, minWidth: 0 }}>
            <nav style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>
              <Link href="/" style={{ color: C.muted }}>{t.home}</Link> / {t.searchRentals}
            </nav>
            <h1 style={{ margin: '0 0 16px', fontSize: 26, lineHeight: 1.35, fontWeight: 600, color: C.green }}>
              {place ? u.headingNear(placeName) : u.heading}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 12, borderBottom: `1px solid ${C.ink}`, fontSize: 14, flexWrap: 'wrap' }}>
              <span><strong style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{u.count(results.length)}</strong> · {u.sortBy}</span>
              <span style={{ ...segWrap, flexWrap: 'wrap' }} role="group" aria-label={u.sortBy}>
                {SORTS.map(k => {
                  const disabled = k === 'near' && !origin
                  return <button key={k} type="button" disabled={disabled} aria-pressed={sort === k} onClick={() => setParams({ sort: k === 'rec' ? null : k })} style={{ ...seg(sort === k, disabled), flex: 'none', padding: '4px 10px' }}>{u.sorts[k]}</button>
                })}
              </span>
            </div>

            {!loaded && <p style={{ color: C.muted, padding: '40px 0' }}>{t.loading}</p>}

            {shown.map(r => <ResultRow key={r.slug} r={r} locale={locale} from={place ? distFrom(r) : null} placeName={placeName} />)}

            {loaded && results.length === 0 && closest.length > 0 && place && (
              <div style={{ paddingTop: 20 }}>
                <p style={{ fontSize: 14, color: C.muted, margin: '0 0 4px' }}>{t.noneNearPlace}</p>
                <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 4px', color: C.green }}>{t.closestTo} {placeName}</h2>
                {closest.map(r => <ResultRow key={r.slug} r={r} locale={locale} from={distFrom(r)} placeName={placeName} />)}
              </div>
            )}

            {loaded && results.length === 0 && closest.length === 0 && (
              <div style={{ padding: '56px 0', textAlign: 'center' }}>
                <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 6px', color: C.green }}>{t.noResults}</p>
                <p style={{ fontSize: 14, color: C.muted, margin: '0 0 18px' }}>{t.noResultsHint}</p>
                <button type="button" onClick={resetFilters} className="sm-btn-primary"
                  style={{ background: C.teal, color: C.white, border: 0, borderRadius: RADIUS, padding: '10px 20px', fontWeight: 500, cursor: 'pointer', font: 'inherit' }}>{u.clear}</button>
              </div>
            )}

            {results.length > PAGE_SIZE && (
              <nav aria-label={u.pages} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, paddingTop: 24, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, color: C.muted }}>{u.showing((page - 1) * PAGE_SIZE + 1, Math.min(page * PAGE_SIZE, results.length), results.length)}</span>
                <span style={{ display: 'flex', gap: 6, fontSize: 14, flexWrap: 'wrap' }}>
                  {page > 1
                    ? <Link href={pageHref(page - 1)} rel="prev" style={pageStyle(false)}>{u.prev}</Link>
                    : <span style={{ ...pageStyle(false), color: C.faint, borderColor: C.line }}>{u.prev}</span>}
                  {pageNumbers(page, totalPages).map((n, i) => n === 0
                    ? <span key={`gap${i}`} style={{ padding: '7px 4px', color: C.muted }}>…</span>
                    : <Link key={n} href={pageHref(n)} aria-current={n === page ? 'page' : undefined} style={pageStyle(n === page)}>{n}</Link>)}
                  {page < totalPages
                    ? <Link href={pageHref(page + 1)} rel="next" style={pageStyle(false)}>{u.next}</Link>
                    : <span style={{ ...pageStyle(false), color: C.faint, borderColor: C.line }}>{u.next}</span>}
                </span>
              </nav>
            )}
          </main>
        </div>
      </div>

      <style>{`
        .sm-filter-toggle { display: none !important; }
        .sm-result:hover .sm-card-title { text-decoration: underline; text-underline-offset: 3px; }
        @media (max-width: 900px) {
          .sm-searchlayout { flex-direction: column; gap: 0 !important; }
          .sm-filter-toggle { display: flex !important; }
          .sm-filter-aside { display: none !important; flex: none !important; width: 100%; }
          .sm-filter-aside.filter-open { display: flex !important; margin-bottom: 24px; }
        }
        @media (max-width: 640px) {
          .sm-result { flex-wrap: wrap; gap: 12px !important; }
          .sm-result-img { width: 100% !important; height: auto !important; aspect-ratio: 4 / 3; }
          .sm-result-price { width: 100% !important; flex-direction: row !important; align-items: baseline !important; text-align: left !important; }
        }
      `}</style>
    </div>
  )
}

function pageStyle(on: boolean): React.CSSProperties {
  return { border: `1px solid ${on ? C.green : C.border}`, background: on ? C.green : C.white, color: on ? C.white : C.ink, borderRadius: RADIUS, padding: '7px 13px', textDecoration: 'none' }
}

/** 1 … 4 5 6 … 12 — 0 marks a gap. */
function pageNumbers(page: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out: number[] = [1]
  const lo = Math.max(2, page - 1), hi = Math.min(total - 1, page + 1)
  if (lo > 2) out.push(0)
  for (let i = lo; i <= hi; i++) out.push(i)
  if (hi < total - 1) out.push(0)
  out.push(total)
  return out
}

function ResultRow({ r, locale, from, placeName }: { r: Row; locale: Locale; from: number | null; placeName: string }) {
  const u = SEARCH_UI[locale]
  const t = SEARCH_T[locale]
  const daily = r.term === 'daily'
  const hasBeds = ['condo', 'apartment', 'house'].includes(r.type)
  const meta = [
    u.types[r.type] ?? r.type,
    hasBeds ? (r.beds === 0 ? u.studio : u.bedroomsN(r.beds)) : '',
    r.size ? u.sqm(r.size) : '',
    r.floor ? u.floor(r.floor) : '',
  ].filter(Boolean).join(' · ')
  const price = r.priceFrom
    ? `฿${r.priceFrom.toLocaleString('en-US')}${r.priceTo > r.priceFrom ? ` – ${r.priceTo.toLocaleString('en-US')}` : ''}`
    : t.askForPrice
  return (
    <Link href={locale === 'en' ? `/en/property/${r.slug}` : `/property/${r.slug}`} className="sm-result"
      style={{ display: 'flex', gap: 20, padding: '18px 0', borderBottom: `1px solid ${C.line}`, color: C.ink, alignItems: 'stretch', textDecoration: 'none' }}>
      <div className="sm-result-img" style={{ width: 200, height: 150, borderRadius: RADIUS, overflow: 'hidden', flexShrink: 0, background: C.line }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {r.image && <img src={r.image} alt={r.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
      </div>
      <div style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 2 }}>
        <div className="sm-card-title" style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.45 }}>{r.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, flexWrap: 'wrap' }}>
          {from !== null && isFinite(from) ? (
            <>
              <span className="msym" aria-hidden="true" style={{ fontSize: 15, color: C.teal }}>place</span>
              <span>{t.fromPlace.replace('{d}', distanceLabel(from, locale)).replace('{p}', placeName)}</span>
            </>
          ) : r.nearest ? (
            <>
              <span aria-hidden="true" style={{ width: 14, height: 4, borderRadius: 2, background: lineColor(r.nearest.station.systems[0]), flexShrink: 0 }} />
              <span>{u.near(stationLabel(r.nearest.station, locale))}</span>
              <span style={{ color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{distanceLabel(r.nearest.km, locale)}</span>
            </>
          ) : null}
          {r.districtShown && <><span style={{ color: '#c9c4b8' }}>·</span><span style={{ color: C.muted }}>{r.districtShown}</span></>}
        </div>
        <div style={{ fontSize: 14, color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{meta}</div>
        {r.amenities.length > 0 && (
          <div style={{ marginTop: 'auto', fontSize: 13, color: C.muted }}>{r.amenities.slice(0, 3).map(a => localiseAmenity(a, locale)).join(' · ')}</div>
        )}
      </div>
      <div className="sm-result-price" style={{ flexShrink: 0, width: 190, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', textAlign: 'right', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: C.amber, fontVariantNumeric: 'tabular-nums', lineHeight: 1.3 }}>{price}</div>
          {r.priceFrom > 0 && <div style={{ fontSize: 13, color: C.muted }}>{daily ? u.perDay : u.perMonth}</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, fontSize: 12, color: C.muted }}>
          <span>{u.minTermRow[r.term] ?? ''}</span>
          {r.updated && <span>{u.updated(shortDate(r.updated, locale))}</span>}
        </div>
      </div>
    </Link>
  )
}

export default function SearchBody({ locale = 'th' }: { locale?: Locale }) {
  const t = SEARCH_T[locale]
  return (
    <Suspense fallback={<div style={{ maxWidth: WRAP, margin: '0 auto', padding: '80px 24px', textAlign: 'center', color: C.muted }}>{t.loading}</div>}>
      <SearchContent locale={locale} />
    </Suspense>
  )
}
