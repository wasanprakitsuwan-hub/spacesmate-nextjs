'use client'

import { SEARCH_T, type Locale, type SearchStrings } from '@/lib/pages-i18n'

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
// Link here is LocaleLink: it keeps the reader in the language they are already
// reading, so an href written as a Thai path resolves to its English
// counterpart on /en/* pages. An href with no English page passes through
// unchanged. The list of which is in lib/routes-i18n, deliberately not
// repeated here — it was copied into 16 files and went stale in all of them
// the moment /manage and /blog got English pages. See
// components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import { localeHref } from '@/lib/routes-i18n'
import { PRICE_RANGES, priceRangeLabel, type Property } from '@/lib/property-data'
import {
  haversineKm, nearestStation, stationLabel, distanceLabel,
  parseQuery, haystack, matchesTerms,
  suggestPlaces, placeFromParams, setPlaceList, stationById, placeKey, placeLabel, placePoint, placeIcon, inGreaterBangkok, type Place,
} from '@/lib/search-match'
import type { Station } from '@/lib/stations'
import { mergePlaces, type Building, type PlaceOverride } from '@/lib/search-places'
import { districtEn, stripDistrictPrefix } from '@/lib/geo-i18n'

/** A listing as the search page needs it: the card's view plus what it is matched on. */
type Row = {
  p: Property
  hay: string
  district: string
  nearest: { station: Station; km: number } | null
}

// Shown as chips when there are not yet enough listings to rank stations by.
// Station codes, not names, so the list cannot drift from lib/stations.
const POPULAR_STATION_IDS = ['E4', 'E6', 'E5', 'N5', 'E9', 'BL20', 'S2', 'BL15']

// Built per locale. The `key` values are the filter's own identifiers and are
// never translated — they are compared against Property['propertyType'].
const radiusOptions = (t: SearchStrings) => [
  { km: 1,  label: t.within1 },
  { km: 2,  label: t.within2 },
  { km: 5,  label: t.within5 },
  { km: 10, label: t.within10 },
]

// Distances offered around a chosen station; 1 km is the default walk.
const STATION_RADII = [1, 2, 5]

const typeFilters = (t: SearchStrings) => [
  { key: '',          label: t.allTypes },
  { key: 'Apartment', label: t.apartment },
  { key: 'Condo',     label: t.condo },
  { key: 'Office',    label: t.office },
]

const GRADS: Record<string, string> = {
  Apartment: 'linear-gradient(135deg,#02402e,#036b56)',
  Condo:     'linear-gradient(135deg,#036b56,#048c73)',
  Office:    'linear-gradient(135deg,#4a1d1d,#8b3a3a)',
  default:   'linear-gradient(135deg,#02402e,#048c73)',
}

const typeLabels = (t: SearchStrings): Record<string, string> => ({
  Apartment: t.apartment, Condo: t.condoShort, Office: t.office,
})

// DB adapter helpers
const TERM_SUFFIX: Record<string, string> = {
  daily: '/วัน', '1_month': '/เดือน', '3_months': '/เดือน',
  '6_months': '/เดือน', '12_months': '/เดือน',
}
const TERM_SUFFIX_EN: Record<string, string> = {
  daily: '/day', '1_month': '/month', '3_months': '/month',
  '6_months': '/month', '12_months': '/month',
}
const DB_TYPE_MAP: Record<string, Property['propertyType']> = {
  condo: 'Condo', apartment: 'Apartment', house: 'Apartment',
  office: 'Office', coworking: 'Co-Working',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptDbListing(l: any, locale: Locale): Property {
  const t = SEARCH_T[locale]
  const suffix = locale === 'en'
    ? (TERM_SUFFIX_EN[l.rental_term] ?? '/month')
    : (TERM_SUFFIX[l.rental_term] ?? '/เดือน')
  return {
    id: 0, slug: l.slug,
    title: l.title_th || l.title_en || t.untitled,
    excerpt: l.description_th || '',
    priceMin: l.price_from || 0,
    priceDisplay: l.price_from
      ? `฿${Number(l.price_from).toLocaleString('en-US')}${suffix}`
      : t.askForPrice,
    bedrooms: l.bedrooms || 0, bathrooms: l.bathrooms || 0,
    size: l.area_sqm ? String(l.area_sqm) : '',
    address: l.address_th || '',
    neighborhood: l.district || l.province || t.defaultProvince,
    lat: l.lat ? String(l.lat) : '', lng: l.lng ? String(l.lng) : '',
    image: (() => { const imgs = Array.isArray(l.images) ? l.images : []; return imgs.find((i: string) => i.startsWith('https://')) ?? imgs.find((i: string) => i.startsWith('/')) ?? ''; })(),
    images: Array.isArray(l.images) ? l.images.filter((img: string) => img.startsWith('https://') || img.startsWith('/')) : [],
    propertyType: DB_TYPE_MAP[l.property_type] ?? 'Condo',
    listingType: 'Rent', amenities: l.amenities || [],
    featured: false, date: l.created_at || '',
  }
}

function SearchContent({ locale }: { locale: Locale }) {
  const t = SEARCH_T[locale]
  const RADIUS_OPTIONS = radiusOptions(t)
  const TYPE_FILTERS = typeFilters(t)
  const TYPE_LABELS = typeLabels(t)
  const sp = useSearchParams()
  const router = useRouter()
  const [activeType, setActiveType] = useState(sp.get('type') || '')
  const [keyword, setKeyword] = useState(sp.get('q') || '')
  const [priceRangeIdx, setPriceRangeIdx] = useState(0)
  const [sortBy, setSortBy] = useState('recent')
  const [filterOpen, setFilterOpen] = useState(false)
  const [rows, setRows] = useState<Row[]>([])
  const dbListings = useMemo(() => rows.map(r => r.p), [rows])

  // A chosen place — a station or a district — from a suggestion, a chip or the URL.
  const [place, setPlace] = useState<Place | null>(() => placeFromParams(sp.get('station'), sp.get('district'), sp.get('landmark'), sp.get('at'), sp.get('name'), sp.get('building')))
  const [placeRadiusKm, setPlaceRadiusKm] = useState(() => {
    const r = Number(sp.get('r'))
    return STATION_RADII.includes(r) ? r : 1
  })
  const [suggestOpen, setSuggestOpen] = useState(false)
  // Bumped when the admin-edited place list arrives, so suggestions use it.
  const [placesVersion, setPlacesVersion] = useState(0)
  const suggestions = useMemo(() => (place ? [] : suggestPlaces(keyword)), [keyword, place, placesVersion])
  // Map lookup for a place we have no list entry for. Run on request only
  // (Enter or the "find on map" row), never per keystroke: the free map
  // service does not allow autocomplete traffic.
  const [mapLookup, setMapLookup] = useState<'idle' | 'loading' | 'notfound'>('idle')
  const canMapLookup = !place && keyword.trim().length >= 2

  // ── Geolocation state ─────────────────────────────────────────────────────
  const [userLatLng, setUserLatLng]     = useState<{ lat: number; lng: number } | null>(null)
  const [radiusKm, setRadiusKm]         = useState<number | null>(null)
  const [geoLoading, setGeoLoading]     = useState(false)
  const [geoError, setGeoError]         = useState<string | null>(null)

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

  // Fetch DB listings and merge with static on mount
  useEffect(() => {
    fetch('/api/listings/public')
      .then(r => r.json())
      .then((d: { listings?: unknown[] }) => {
        setRows((d.listings ?? []).map((l: any): Row => {
          const p = adaptDbListing(l, locale)
          const nearest = nearestStation(parseFloat(l.lat), parseFloat(l.lng))
          return {
            p,
            nearest,
            district: stripDistrictPrefix(l.district || ''),
            hay: haystack({
              title: l.title_th || '', titleEn: l.title_en || '', excerpt: l.description_th || '',
              address: l.address_th || '', district: l.district || '',
              districtEn: districtEn(l.district, l.province), amenities: l.amenities || [], nearest,
            }),
          }
        }))
      })
      .catch(() => {})
  }, [])

  // ── Geolocation handler ───────────────────────────────────────────────────
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError(t.geoUnsupported)
      return
    }
    setGeoLoading(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLatLng({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        if (!radiusKm) setRadiusKm(2)  // default 2 km
        setGeoLoading(false)
      },
      () => {
        setGeoError(t.geoDenied)
        setGeoLoading(false)
      },
      { timeout: 8000 },
    )
  }, [radiusKm])

  function clearGeo() {
    setUserLatLng(null)
    setRadiusKm(null)
    setGeoError(null)
  }

  const label = activeType ? (TYPE_LABELS[activeType] || activeType) : t.allListings

  // Dynamic counts including DB listings
  const typeCounts = useMemo(() => {
    const all = [...dbListings]
    const counts: Record<string, number> = { '': all.length }
    all.forEach(p => { counts[p.propertyType] = (counts[p.propertyType] || 0) + 1 })
    return counts
  }, [dbListings])

  const results = useMemo(() => {
    // What was typed: a type word, a price, a bedroom count, and whatever is
    // left over, which has to appear in the listing (see lib/search-match).
    const q = parseQuery(place ? '' : keyword)
    let matched = rows
    if (q.terms.length) matched = matched.filter(r => matchesTerms(r.hay, q.terms))
    if (place?.kind === 'district') matched = matched.filter(r => r.district === place.th)
    let list = matched.map(r => r.p)
    if (activeType) list = list.filter(p => p.propertyType === activeType)
    else if (q.types.length) list = list.filter(p => q.types.includes(p.propertyType))
    if (q.beds !== undefined) list = list.filter(p => p.bedrooms === q.beds)
    if (q.priceMin !== undefined) list = list.filter(p => p.priceMin >= q.priceMin!)
    if (q.priceMax !== undefined) list = list.filter(p => p.priceMin > 0 && p.priceMin <= q.priceMax!)
    const range = PRICE_RANGES[priceRangeIdx]
    if (range.min > 0 || range.max !== Infinity) {
      list = list.filter(p => p.priceMin >= range.min && p.priceMin <= range.max)
    }
    // ── Place filter: within the chosen distance of a station, landmark or map point
    const st = place ? placePoint(place) : null
    if (st) {
      list = list
        .filter(p => {
          const pLat = parseFloat(p.lat || ''), pLng = parseFloat(p.lng || '')
          return !isNaN(pLat) && !isNaN(pLng) && haversineKm(st.lat, st.lng, pLat, pLng) <= placeRadiusKm
        })
        .sort((a, b) => haversineKm(st.lat, st.lng, +a.lat, +a.lng) - haversineKm(st.lat, st.lng, +b.lat, +b.lng))
      return list
    }
    // ── Radius filter ───────────────────────────────────────────────────────
    if (userLatLng && radiusKm) {
      list = list.filter(p => {
        const pLat = parseFloat(p.lat || '')
        const pLng = parseFloat(p.lng || '')
        if (isNaN(pLat) || isNaN(pLng)) return false
        return haversineKm(userLatLng.lat, userLatLng.lng, pLat, pLng) <= radiusKm
      })
    }
    if (sortBy === 'priceLow') list.sort((a, b) => a.priceMin - b.priceMin)
    else if (sortBy === 'priceHigh') list.sort((a, b) => b.priceMin - a.priceMin)
    else if (sortBy === 'nearest' && userLatLng) {
      list.sort((a, b) => {
        const dA = haversineKm(userLatLng.lat, userLatLng.lng, parseFloat(a.lat || '0'), parseFloat(a.lng || '0'))
        const dB = haversineKm(userLatLng.lat, userLatLng.lng, parseFloat(b.lat || '0'), parseFloat(b.lng || '0'))
        return dA - dB
      })
    } else list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return list
  }, [activeType, keyword, priceRangeIdx, sortBy, rows, userLatLng, radiusKm, place, placeRadiusKm])

  function selectType(t: string) {
    setActiveType(t)
    const p = new URLSearchParams(sp.toString())
    if (t) { p.set('type', t) } else { p.delete('type') }
    router.replace(`${localeHref('/search', locale)}?${p.toString()}`)
  }

  function chooseStationRadius(km: number) {
    setPlaceRadiusKm(km)
    const p = new URLSearchParams(sp.toString())
    if (km === 1) p.delete('r'); else p.set('r', String(km))
    router.replace(`${localeHref('/search', locale)}${p.toString() ? `?${p.toString()}` : ''}`)
  }

  function choosePlace(next: Place | null) {
    setPlace(next)
    setSuggestOpen(false)
    if (next) setKeyword('')
    const p = new URLSearchParams(sp.toString())
    for (const k of ['station', 'district', 'landmark', 'building', 'at', 'name', 'q']) p.delete(k)
    if (next?.kind === 'station') p.set('station', next.station.id)
    if (next?.kind === 'landmark') p.set('landmark', next.landmark.id)
    if (next?.kind === 'building') p.set('building', next.building.id)
    if (next?.kind === 'district') p.set('district', next.th)
    if (next?.kind === 'point') { p.set('at', `${next.lat.toFixed(5)},${next.lng.toFixed(5)}`); p.set('name', next.name) }
    router.replace(`${localeHref('/search', locale)}${p.toString() ? `?${p.toString()}` : ''}`)
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

  // Chips: stations that actually have listings within a kilometre come first,
  // so the presets point somewhere useful; the fixed list fills the rest.
  const popularPlaces = useMemo<Place[]>(() => {
    const counts = new Map<string, number>()
    for (const r of rows) if (r.nearest && r.nearest.km <= 1) counts.set(r.nearest.station.id, (counts.get(r.nearest.station.id) ?? 0) + 1)
    const ids = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([id]) => id)
    for (const id of POPULAR_STATION_IDS) if (!ids.includes(id)) ids.push(id)
    return ids.slice(0, 8).flatMap(id => { const st = stationById(id); return st ? [{ kind: 'station' as const, station: st }] : [] })
  }, [rows, placesVersion])

  // Nothing within the chosen distance: show the closest few instead of a dead end.
  const closest = useMemo(() => {
    const st = place ? placePoint(place) : null
    if (!st || results.length) return []
    return dbListings
      .filter(p => p.lat && p.lng)
      .map(p => ({ p, km: haversineKm(st.lat, st.lng, +p.lat, +p.lng) }))
      .sort((a, b) => a.km - b.km)
      .slice(0, 4)
      .map(x => x.p)
  }, [place, results, dbListings])

  const nearestBySlug = useMemo(() => new Map(rows.map(r => [r.p.slug, r.nearest])), [rows])

  // Each card says how far it is from the place searched around.
  function fromPlace(p: Property) {
    const pt = place ? placePoint(place) : null
    const lat = parseFloat(p.lat || ''), lng = parseFloat(p.lng || '')
    if (!place || !pt || isNaN(lat) || isNaN(lng)) return null
    return { label: placeLabel(place, locale), icon: placeIcon(place), km: haversineKm(pt.lat, pt.lng, lat, lng) }
  }

  function resetFilters() {
    setActiveType('')
    setPriceRangeIdx(0)
    setSortBy('recent')
    clearGeo()
    setPlace(null)
    setPlaceRadiusKm(1)
    setKeyword('')
    router.replace(localeHref('/search', locale))
  }

  return (
    <div>
      {/* Search hero */}
      <div style={{ background: 'linear-gradient(135deg,#02402e,#048c73)', padding: '32px 24px 36px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '0 0 8px' }}>
            <Link href={localeHref('/', locale)} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{t.home}</Link> › {t.searchRentals}
          </p>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 600, margin: '0 0 18px' }}>{label}{t.inBangkok}</h1>
          {/* Keyword search bar */}
          <div style={{ position: 'relative', maxWidth: 560 }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 20, color: '#94a3b8', pointerEvents: 'none' }} className="msym">search</span>
            <input
              type="text"
              value={keyword}
              onChange={e => { setKeyword(e.target.value); setSuggestOpen(true); setMapLookup('idle'); if (place) choosePlace(null) }}
              onFocus={() => setSuggestOpen(true)}
              onBlur={() => setTimeout(() => setSuggestOpen(false), 150)}
              onKeyDown={e => {
                if (e.key !== 'Enter') return
                if (suggestions.length && suggestOpen) { e.preventDefault(); choosePlace(suggestions[0]) }
                else if (canMapLookup) { e.preventDefault(); findOnMap() }
              }}
              placeholder={place ? placeLabel(place, locale) : t.searchPlaceholder}
              aria-autocomplete="list" 
              style={{ width: '100%', paddingLeft: 48, paddingRight: keyword ? 44 : 16, paddingTop: 14, paddingBottom: 14, fontSize: 15, borderRadius: 28, border: 'none', outline: 'none', background: '#fff', color: '#231f20', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', boxSizing: 'border-box' }}
            />
            {keyword && (
              <button onClick={() => setKeyword('')}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8', padding: 4, display: 'flex', alignItems: 'center' }}>
                <span className="msym">close</span>
              </button>
            )}
            {suggestOpen && (suggestions.length > 0 || canMapLookup) && (
              <ul role="listbox" style={{ position: 'absolute', zIndex: 20, top: 'calc(100% + 6px)', left: 0, right: 0, margin: 0, padding: 6, listStyle: 'none', background: '#fff', borderRadius: 16, boxShadow: '0 12px 32px rgba(0,0,0,0.18)' }}>
                {suggestions.map(sg => (
                  <li key={placeKey(sg)} role="option" aria-selected={false}>
                    <button type="button" onMouseDown={e => { e.preventDefault(); choosePlace(sg) }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: 'none', background: 'none', borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontSize: 14, color: '#231f20' }}>
                      <span className="msym" style={{ fontSize: 18, color: '#048c73' }}>{placeIcon(sg)}</span>
                      <span style={{ flex: 1 }}>{placeLabel(sg, locale)}</span>
                      <span style={{ fontSize: 11.5, color: '#94a3b8' }}>{sg.kind === 'station' ? t.suggestStations : sg.kind === 'landmark' ? t.suggestLandmarks : t.suggestDistricts}</span>
                    </button>
                  </li>
                ))}
                {canMapLookup && (
                  <li role="option" aria-selected={false}>
                    <button type="button" onMouseDown={e => { e.preventDefault(); findOnMap() }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: 'none', borderTop: suggestions.length ? '1px solid #eef0ef' : 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14, color: '#02402e' }}>
                      <span className="msym" style={{ fontSize: 18, color: '#048c73' }}>map</span>
                      <span style={{ flex: 1 }}>{t.findOnMap.replace('{q}', keyword.trim())}</span>
                    </button>
                  </li>
                )}
              </ul>
            )}
          </div>

          {mapLookup !== 'idle' && (
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, margin: '10px 0 0' }}>
              {mapLookup === 'loading' ? t.mapLoading : t.mapNotFound}
            </p>
          )}

          {/* Chosen place, or the presets to choose one from */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 14, maxWidth: 820 }}>
            {place ? (
              <>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', color: '#02402e', borderRadius: 20, padding: '6px 8px 6px 12px', fontSize: 13.5, fontWeight: 600 }}>
                  <span className="msym" style={{ fontSize: 16, color: '#048c73' }}>{placeIcon(place)}</span>
                  {t.nearPrefix} {placeLabel(place, locale)}
                  <button onClick={() => choosePlace(null)} aria-label={t.clearFilters}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
                    <span className="msym" style={{ fontSize: 16 }}>close</span>
                  </button>
                </span>
              </>
            ) : (
              <>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12.5 }}>{t.popularPlaces}:</span>
                {popularPlaces.map(pl => (
                  <button key={placeKey(pl)} onClick={() => choosePlace(pl)}
                    style={{ borderRadius: 20, padding: '6px 12px', fontSize: 12.5, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.08)', color: '#fff' }}>
                    {placeLabel(pl, locale)}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 24px 60px' }}>
        {/* Mobile toggle */}
        <button className="sm-filter-toggle" onClick={() => setFilterOpen(!filterOpen)}
          style={{ alignItems: 'center', justifyContent: 'space-between', gap: 8, background: '#fff', border: '1px solid #eef0ef', borderRadius: 14, padding: '13px 16px', fontSize: 15, fontWeight: 600, color: '#02402e', cursor: 'pointer', width: '100%', marginBottom: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span className="msym" style={{ fontSize: 20, color: '#048c73' }}>tune</span>{t.filters}
          </span>
          <span className="msym" style={{ fontSize: 22, color: '#94a3b8' }}>{filterOpen ? 'expand_less' : 'expand_more'}</span>
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '278px 1fr', gap: 28 }} className="sm-searchlayout">

          {/* Sidebar */}
          <aside className={`sm-filter-aside${filterOpen ? ' filter-open' : ''}`}
            style={{ alignSelf: 'start', position: 'sticky', top: 86, background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 22, boxShadow: '0 6px 20px -12px rgba(2,64,46,0.08)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 18px' }}>{t.filters}</h3>

            {/* Distance from the chosen station */}
            <div style={{ marginBottom: 22 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#475569', margin: '0 0 11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{t.distanceFromStation}</p>
              {place && placePoint(place) ? (
                <>
                  <p style={{ fontSize: 13, color: '#02402e', fontWeight: 600, margin: '0 0 9px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="msym" style={{ fontSize: 16, color: '#048c73' }}>{placeIcon(place)}</span>{placeLabel(place, locale)}
                  </p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {RADIUS_OPTIONS.filter(opt => STATION_RADII.includes(opt.km)).map(opt => {
                      const on = placeRadiusKm === opt.km
                      return (
                        <button key={opt.km} onClick={() => chooseStationRadius(opt.km)}
                          style={{ flex: 1, padding: '8px 4px', borderRadius: 9, fontSize: 13, cursor: 'pointer', transition: 'all .2s', border: `1px solid ${on ? '#048c73' : '#eef0ef'}`, background: on ? '#eaf6f1' : '#fff', color: on ? '#02402e' : '#475569', fontWeight: on ? 600 : 400 }}>
                          {opt.km} {locale === 'en' ? 'km' : 'กม.'}
                        </button>
                      )
                    })}
                  </div>
                </>
              ) : (
                <p style={{ fontSize: 12.5, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>{t.pickStationFirst}</p>
              )}
            </div>

            <div style={{ height: 1, background: '#eef0ef', margin: '0 0 20px' }} />

            {/* Type filter */}
            <div style={{ marginBottom: 22 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#475569', margin: '0 0 11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{t.propertyType}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {TYPE_FILTERS.map(t => {
                  const on = activeType === t.key
                  return (
                    <button key={t.key} onClick={() => selectType(t.key)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', borderRadius: 10, fontSize: 14, cursor: 'pointer', transition: 'all .2s', border: `1px solid ${on ? '#048c73' : '#eef0ef'}`, background: on ? '#eaf6f1' : '#fff', color: on ? '#02402e' : '#475569', fontWeight: on ? 600 : 400 }}>
                      <span>{t.label}</span>
                      <span className="mono" style={{ fontSize: 10.5, opacity: .7 }}>{typeCounts[t.key] ?? 0}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ height: 1, background: '#eef0ef', margin: '0 0 20px' }} />

            {/* Price range */}
            <div style={{ marginBottom: 22 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#475569', margin: '0 0 11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{t.priceRange}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {PRICE_RANGES.map((r, i) => {
                  const on = priceRangeIdx === i
                  return (
                    <button key={i} onClick={() => setPriceRangeIdx(i)}
                      style={{ textAlign: 'left', padding: '9px 12px', borderRadius: 10, fontSize: 14, cursor: 'pointer', transition: 'all .2s', border: `1px solid ${on ? '#048c73' : '#eef0ef'}`, background: on ? '#eaf6f1' : '#fff', color: on ? '#02402e' : '#475569', fontWeight: on ? 600 : 400 }}>
                      {priceRangeLabel(r, locale)}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ height: 1, background: '#eef0ef', margin: '0 0 20px' }} />

            {/* Geolocation filter */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#475569', margin: '0 0 11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{t.myLocation}</p>

              {!userLatLng ? (
                <button
                  onClick={requestLocation}
                  disabled={geoLoading}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 0', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: geoLoading ? 'wait' : 'pointer', border: '1.5px solid #048c73', background: '#eaf6f1', color: '#02402e', transition: 'all .2s' }}
                >
                  <span className="msym" style={{ fontSize: 18, fontVariationSettings: geoLoading ? "'wght' 300, 'FILL' 0" : "'wght' 400, 'FILL' 1", color: '#048c73', animation: geoLoading ? 'spin 1s linear infinite' : 'none' }}>
                    {geoLoading ? 'autorenew' : 'near_me'}
                  </span>
                  {geoLoading ? t.locating : t.searchNearMe}
                </button>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: '#eaf6f1', borderRadius: 9, marginBottom: 8, fontSize: 13, color: '#02402e', fontWeight: 600 }}>
                    <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1", color: '#048c73' }}>location_on</span>
                    {t.yourLocation}
                    <button onClick={clearGeo} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex', alignItems: 'center' }}>
                      <span className="msym" style={{ fontSize: 16 }}>close</span>
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {RADIUS_OPTIONS.map(opt => {
                      const on = radiusKm === opt.km
                      return (
                        <button key={opt.km} onClick={() => setRadiusKm(opt.km)}
                          style={{ textAlign: 'left', padding: '8px 12px', borderRadius: 9, fontSize: 13.5, cursor: 'pointer', transition: 'all .2s', border: `1px solid ${on ? '#048c73' : '#eef0ef'}`, background: on ? '#eaf6f1' : '#fff', color: on ? '#02402e' : '#475569', fontWeight: on ? 600 : 400 }}>
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {geoError && (
                <p style={{ fontSize: 12, color: '#dc2626', margin: '8px 0 0', lineHeight: 1.5 }}>{geoError}</p>
              )}
            </div>

            <button onClick={resetFilters}
              style={{ width: '100%', marginTop: 6, background: '#f4f6f5', color: '#475569', fontWeight: 500, fontSize: 13.5, border: 'none', borderRadius: 11, padding: '11px 0', cursor: 'pointer', transition: 'all .2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#e9edeb'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#f4f6f5'}>
              {t.clearFilters}
            </button>
          </aside>

          {/* Results */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <p style={{ fontSize: 14.5, color: '#475569', margin: 0 }}>
                  {t.foundPrefix} <strong className="mono" style={{ color: '#231f20' }}>{results.length}</strong> {t.foundSuffix}
                </p>
                {userLatLng && radiusKm && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#eaf6f1', border: '1px solid #a7f3d0', borderRadius: 20, padding: '4px 10px', fontSize: 12.5, color: '#02402e', fontWeight: 600 }}>
                    <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1", color: '#048c73' }}>near_me</span>
                    {t.withinPrefix} {radiusKm} {t.km}
                    <button onClick={clearGeo} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex', alignItems: 'center', marginLeft: 2 }}>
                      <span className="msym" style={{ fontSize: 13 }}>close</span>
                    </button>
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13.5, color: '#64748b' }}>{t.sortBy}:</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  style={{ border: '1px solid #eef0ef', background: '#fff', borderRadius: 11, padding: '8px 13px', fontSize: 13.5, fontWeight: 500, color: '#231f20', outline: 'none', cursor: 'pointer' }}>
                  <option value="recent">{t.sortNewest}</option>
                  <option value="priceLow">{t.sortPriceAsc}</option>
                  <option value="priceHigh">{t.sortPriceDesc}</option>
                  {userLatLng && <option value="nearest">{t.sortNearest}</option>}
                </select>
              </div>
            </div>

            {/* Results grid */}
            {results.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }} className="sm-grid2">
                {results.map(p => (
                  <PropertyCard key={p.slug} property={p} locale={locale} nearest={nearestBySlug.get(p.slug) ?? null} from={fromPlace(p)} />
                ))}
              </div>
            )}

            {/* Nothing near the chosen station: the closest few rather than a dead end */}
            {results.length === 0 && closest.length > 0 && place && (
              <div>
                <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 6px' }}>{t.noneNearPlace}</p>
                <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 16px', color: '#02402e' }}>{t.closestTo} {placeLabel(place, locale)}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }} className="sm-grid2">
                  {closest.map(p => (
                    <PropertyCard key={p.slug} property={p} locale={locale} nearest={nearestBySlug.get(p.slug) ?? null} from={fromPlace(p)} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {results.length === 0 && closest.length === 0 && (
              <div style={{ background: '#fff', border: '1px dashed #d5ddd9', borderRadius: 18, padding: '60px 24px', textAlign: 'center' }}>
                <div style={{ marginBottom: 12 }}><span className="msym" style={{ fontSize: 36, color: '#94a3b8', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>search</span></div>
                <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 6px' }}>{t.noResults}</p>
                <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 18px', fontWeight: 300 }}>{t.noResultsHint}</p>
                <button onClick={resetFilters}
                  style={{ background: '#048c73', color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', borderRadius: 22, padding: '11px 24px', cursor: 'pointer' }}>{t.clearFilters}</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .sm-filter-toggle { display: none !important; }
        @media (max-width: 900px) {
          .sm-searchlayout { grid-template-columns: 1fr !important; }
          .sm-filter-toggle { display: flex !important; }
          .sm-filter-aside { display: none !important; position: static !important; }
          .sm-filter-aside.filter-open { display: block !important; margin-bottom: 20px; }
          .sm-grid2 { grid-template-columns: 1fr !important; }
        }
        .sm-prop-card:hover {
          box-shadow: 0 16px 34px -12px rgba(2,64,46,0.18) !important;
          transform: translateY(-4px) !important;
        }
        .sm-prop-card:hover .sm-prop-img { transform: scale(1.05); }
      `}</style>
    </div>
  )
}

function PropertyCard({ property: p, locale, nearest, from }: {
  property: Property
  locale: Locale
  nearest: { station: Station; km: number } | null
  /** Distance from the place the visitor searched around, when there is one. */
  from?: { label: string; icon: string; km: number } | null
}) {
  const t = SEARCH_T[locale]
  const TYPE_LABELS = typeLabels(t)
  const bedroomLabel = p.bedrooms === 0 ? t.studio : `${p.bedrooms} ${t.bedrooms}`
  const grad = GRADS[p.propertyType] || GRADS.default

  return (
    <Link href={`/property/${p.slug}`} className="sm-prop-card"
      style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', transition: 'all .25s', boxShadow: '0 6px 20px -10px rgba(2,64,46,0.10)', display: 'block', textDecoration: 'none' }}>
      <div style={{ height: 168, background: grad, position: 'relative', overflow: 'hidden' }}>
        {p.image && (
          <img src={p.image} alt={p.title} className="sm-prop-img"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' }} />
        )}
        {p.featured && (
          <span style={{ position: 'absolute', top: 12, left: 12, background: '#d97f11', color: '#fff', fontSize: 11.5, fontWeight: 600, padding: '5px 11px', borderRadius: 8 }}>{t.featured}</span>
        )}
        {p.listingType === 'Daily' && (
          <span style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(217,127,17,0.92)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 7 }}>{t.daily}</span>
        )}
        <span style={{ position: 'absolute', bottom: 12, right: 12, fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.9)', background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: 7 }}>
          {TYPE_LABELS[p.propertyType] || p.propertyType}
        </span>
      </div>
      <div style={{ padding: 17 }}>
        <p style={{ color: '#048c73', fontSize: 12.5, margin: '0 0 4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}><span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>location_on</span>{p.neighborhood}</p>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 10px', lineHeight: 1.35, color: '#231f20' }}>{p.title}</h3>
        {from && (
          <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: '#02402e', fontWeight: 600, margin: '-4px 0 6px' }}>
            <span className="msym" style={{ fontSize: 14, color: '#048c73' }}>{from.icon}</span>
            {t.fromPlace.replace('{d}', distanceLabel(from.km, locale)).replace('{p}', from.label)}
          </p>
        )}
        {nearest && !(from && from.icon === 'train') && (
          <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: '#475569', margin: '-4px 0 10px' }}>
            <span className="msym" style={{ fontSize: 14, color: '#048c73' }}>train</span>
            {stationLabel(nearest.station, locale)} · {distanceLabel(nearest.km, locale)}
          </p>
        )}
        <div className="mono" style={{ display: 'flex', gap: 12, padding: '10px 0', borderTop: '1px solid #f3f5f4', borderBottom: '1px solid #f3f5f4', marginBottom: 12, fontSize: 11, color: '#7a8a85' }}>
          <span>{bedroomLabel}</span>
          {p.bathrooms > 0 && <span>{p.bathrooms} {t.bathrooms}</span>}
          {p.size && <span>{p.size} {t.sqm}</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="mono" style={{ fontSize: 17, fontWeight: 600, color: '#d97f11' }}>{p.priceDisplay}</span>
          <span style={{ color: '#048c73', fontSize: 13, fontWeight: 600 }}>{t.viewDetail}</span>
        </div>
      </div>
    </Link>
  )
}

export default function SearchBody({ locale = 'th' }: { locale?: Locale }) {
  const t = SEARCH_T[locale]
  return (
    <Suspense fallback={<div style={{ maxWidth: 1240, margin: '0 auto', padding: '80px 24px', textAlign: 'center', color: '#94a3b8' }}>{t.loading}</div>}>
      <SearchContent locale={locale} />
    </Suspense>
  )
}
