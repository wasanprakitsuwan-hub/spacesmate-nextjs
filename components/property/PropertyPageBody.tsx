/**
 * The property detail page, rendered for either locale.
 *
 * Both `app/property/[...slug]` and `app/en/property/[...slug]` are thin
 * wrappers over this. Every string the page owns comes from PROPERTY_T in
 * lib/property-i18n; everything the owner supplied — title, description,
 * room type names — falls back to Thai when no English was written, and the
 * structured data marks which language the description is actually in.
 */
// Link here is LocaleLink: it keeps the reader in the language they are already
// reading, so an href written as a Thai path resolves to its English
// counterpart on /en/* pages. An href with no English page passes through
// unchanged. The list of which is in lib/routes-i18n, deliberately not
// repeated here — it was copied into 16 files and went stale in all of them
// the moment /manage and /blog got English pages. See
// components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import { notFound } from 'next/navigation'
import { AMENITY_SECTIONS, groupSelected } from '@/lib/amenities'
import { ListingLd, BreadcrumbLd } from '@/components/seo/JsonLd'
import { createServerClient as buildingClient } from '@/lib/supabase'
import { properties, getPropertyBySlug, fetchPropertyContent, type Property } from '@/lib/property-data'
import PropertyGallery from '@/components/property/PropertyGallery'
import PropertyVideo from '@/components/property/PropertyVideo'
import DescriptionBody from '@/components/property/DescriptionBody'
import { getDbPropertyRaw, normalizeDbListing, plainText, getRelatedDbListings } from '@/lib/property-page'
import { provinceLabel } from '@/lib/geo-i18n'
import { roomTypeLabel } from '@/lib/room-types'
import { nearbyStations, nearbyLandmarks, stationLabel, distanceLabel } from '@/lib/search-match'
import { LANDMARK_ICON, type LandmarkKind } from '@/lib/landmarks'
import { localeHref } from '@/lib/routes-i18n'
import { mergePlaces } from '@/lib/search-places'
import ListingStatBeacon from '@/components/property/ListingStatBeacon'
import { loadPlaceOverrides } from '@/lib/search-places-server'
import {
  PROPERTY_T, TYPE_LABELS, OTHER_CHARGE_LABELS,
  localiseAmenity, amenitySectionLabel, type Locale,
} from '@/lib/property-i18n'

export default async function PropertyPageBody({ slug, locale }: { slug: string; locale: Locale }) {
  const t = PROPERTY_T[locale]
  const types = TYPE_LABELS[locale]

  // Database first — see generateMetadata above for why.

  let p: Property
  let content: string | null = null
  let contentEn: string | null = null

  // Contact info from DB (null for static listings — shows SpacesMate defaults)
  let dbContact: { name: string | null; phone: string | null; line: string | null } | null = null
  // Raw room_types JSONB from DB (for apartment units, charges, etc.)
  let rawRoomTypes: any[] = []

  const raw = await getDbPropertyRaw(slug)
  const staticP = raw ? null : getPropertyBySlug(slug)

  if (staticP) {
    p = staticP
    // Legacy WordPress content, fetched at runtime and cached by Next.js
    content = await fetchPropertyContent(p.id)
  } else {
    if (!raw) notFound()
    p = normalizeDbListing(raw, locale)
    content = raw.description_th || null
    contentEn = (raw as any).description_en || null
    dbContact = {
      name:  raw.contact_name  || null,
      phone: raw.contact_phone || null,
      line:  raw.contact_line  || null,
    }
    rawRoomTypes = Array.isArray(raw.room_types) ? raw.room_types : []
  }

  const hasContent = (content && !content.includes('เนื้อหาไม่พร้อม') && !content.includes('ไม่พบเนื้อหา')) || !!contentEn
  // On the English page prefer the owner's English body, falling back to Thai.
  const schemaBody = locale === 'en' ? (contentEn || content) : content
  const schemaBodyIsEnglish = locale === 'en' && !!contentEn

  // Related properties — same type, exclude current, up to 3.
  // A database listing gets database neighbours, localised like the rest of the
  // page. The legacy static pages keep the static array, which is the only data
  // they have.
  const related = raw
    ? await getRelatedDbListings(raw, locale, 3)
    : properties.filter((r) => r.slug !== p.slug && r.propertyType === p.propertyType).slice(0, 3)

  const bedroomLabel = p.bedrooms === 0 ? t.studio : t.bedroomsValue(p.bedrooms)
  const typeLabel = types[p.propertyType] || p.propertyType

  // ── Structured data from room_types JSONB ─────────────────────────────────
  const aptUnits = rawRoomTypes.filter((r: any) => r._type === 'apt_unit')
  const chargesRow: any = rawRoomTypes.find((r: any) => r._type === 'charges') ?? null

  // Build flat list of charge rows for display
  type ChargeDisplayRow = { label: string; value: string }
  const chargesDisplay: ChargeDisplayRow[] = []
  if (chargesRow) {
    const rateLabel = (type: string, fixed: string, minRate: string): string => {
      if (type === 'fixed') return fixed ? t.perUnit(fixed) : t.asBilled
      if (type === 'min_rate') return minRate ? t.minimum(minRate) : t.asBilled
      // 'gov' carries no number by design — the authority's tariff applies, and
      // copying a figure here would go stale when MEA/MWA change it.
      if (type === 'gov') return t.govRate
      return t.asBilled
    }
    if (chargesRow.security_deposit)
      chargesDisplay.push({ label: t.securityDeposit, value: t.months(chargesRow.security_deposit) })
    if (chargesRow.advance_deposit)
      chargesDisplay.push({ label: t.advanceDeposit, value: t.months(chargesRow.advance_deposit) })
    if (chargesRow.key_deposit)
      chargesDisplay.push({ label: t.keyDeposit, value: `฿${chargesRow.key_deposit}` })
    if (chargesRow.water_type)
      chargesDisplay.push({ label: t.water, value: rateLabel(chargesRow.water_type, chargesRow.water_fixed ?? '', chargesRow.water_min_rate ?? '') })
    if (chargesRow.electricity_type)
      chargesDisplay.push({ label: t.electricity, value: rateLabel(chargesRow.electricity_type, chargesRow.electricity_fixed ?? '', chargesRow.electricity_min_rate ?? '') })
    const OTHER_LABELS = OTHER_CHARGE_LABELS[locale]
    for (const k of (chargesRow.other_charges ?? [])) {
      const fee = chargesRow.other_charges_fees?.[k]
      chargesDisplay.push({ label: OTHER_LABELS[k] ?? k, value: fee ? t.perMonthAmount(Number(fee).toLocaleString()) : t.asBilled })
    }
  }

  const canonicalUrl = locale === 'en'
    ? `https://spacesmate.com/en/property/${p.slug}`
    : `https://spacesmate.com/property/${p.slug}`

  // Link the listing to its building. Building pages carry the highest-intent
  // queries on the site, and a page nothing links to is a page Google discounts.
  let building: { slug: string; name: string } | null = null
  if (raw?.property_name_id) {
    try {
      const { data: b } = await buildingClient()
        .from('property_names')
        .select('slug, name_th')
        .eq('id', raw.property_name_id)
        .maybeSingle()
      if (b?.slug) building = { slug: b.slug as string, name: b.name_th as string }
    } catch { /* a missing building link must not break the listing page */ }
  }

  // Place lists as the admin left them (renames, new places, hidden ones).
  const hasPin = !!(p.lat && p.lng)
  const places = hasPin ? mergePlaces((await loadPlaceOverrides()).overrides) : null
  const pinLat = parseFloat(p.lat), pinLng = parseFloat(p.lng)
  const stations = places ? nearbyStations(pinLat, pinLng, 2, 3, places.stations) : []

  // "What's nearby": up to three of each kind within 3 km, transport first
  // (stations, then airports and the like), the order renters ask about.
  type NearbyItem = { key: string; name: string; km: number; icon: string; href: string }
  const nearbyGroups: { kind: LandmarkKind; items: NearbyItem[] }[] = []
  if (places) {
    const landmarks = nearbyLandmarks(pinLat, pinLng, 3, places.landmarks)
    const searchHref = localeHref('/search', locale)
    for (const kind of ['transport', 'university', 'hospital', 'mall', 'place'] as LandmarkKind[]) {
      const items: NearbyItem[] = kind === 'transport'
        ? stations.map(({ station, km }) => ({ key: `s:${station.id}`, name: stationLabel(station, locale), km, icon: 'train', href: `${searchHref}?station=${station.id}` }))
        : []
      for (const { landmark, km } of landmarks.filter(x => x.landmark.kind === kind)) {
        items.push({ key: `l:${landmark.id}`, name: locale === 'en' ? landmark.en : landmark.th, km, icon: LANDMARK_ICON[kind], href: `${searchHref}?landmark=${encodeURIComponent(landmark.id)}` })
      }
      items.sort((a, b) => a.km - b.km)
      if (items.length) nearbyGroups.push({ kind, items: items.slice(0, 3) })
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Owner statistics — database listings only; static ones have no owner. */}
      {raw?.id && <ListingStatBeacon propertyId={String(raw.id)} />}

      <ListingLd
        name={p.title}
        url={canonicalUrl}
        images={p.images}
        price={p.priceMin || undefined}
        district={p.neighborhood}
        region={provinceLabel(raw?.province, locale) || undefined}
        address={p.address}
        bedrooms={p.bedrooms}
        bathrooms={p.bathrooms}
        areaSqm={p.size ? Number(p.size) : undefined}
        propertyType={p.propertyType}
        description={plainText(schemaBody, 400) || undefined}
        descriptionLang={schemaBodyIsEnglish ? 'en-GB' : 'th-TH'}
        pageLang={locale === 'en' ? 'en-GB' : 'th-TH'}
        lat={p.lat}
        lng={p.lng}
        amenities={p.amenities.map(a => localiseAmenity(a, locale))}
        listingType={p.listingType}
        datePosted={p.date}
        dateModified={raw?.updated_at || undefined}
      />
      <BreadcrumbLd
        trail={[
          { name: t.home, url: 'https://spacesmate.com/' },
          { name: t.search, url: 'https://spacesmate.com/search' },
          ...(building ? [{ name: building.name, url: `https://spacesmate.com/building/${encodeURI(building.slug)}` }] : []),
          { name: p.title, url: canonicalUrl },
        ]}
      />

      {/* Photo gallery — single image falls back to hero-only view */}
      <PropertyGallery
        images={p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : [])}
        title={p.title}
        priceDisplay={p.priceDisplay}
        typeLabel={typeLabel}
        featured={p.featured}
        locale={locale}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }} className="sm-detaillayout">

          {/* Main content column */}
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
              <Link href="/search" className="hover:text-spacemate-brandDark transition-colors">{t.search}</Link>
              <span>/</span>
              <span className="text-spacemate-brandDark font-medium line-clamp-1">{p.title}</span>
            </div>

            {/* Type + Daily badge */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="inline-block text-xs font-semibold text-spacemate-brandTeal bg-spacemate-bgLight px-3 py-1.5 rounded-full">
                {typeLabel}
              </span>
              {p.listingType === 'Daily' && (
                <span className="inline-block text-xs font-semibold text-white px-3 py-1.5 rounded-full"
                  style={{ background: '#d97f11' }}>{t.dailyBadge}</span>
              )}
            </div>

            {/* Title */}
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.3px', color: '#02402e', lineHeight: 1.3 }}>
              {p.title}
            </h1>

            {/* Location */}
            <div className="flex items-center gap-2 mb-7" style={{ color: '#048c73', fontSize: 14, fontWeight: 500 }}>
              <span className="msym" style={{ fontSize: 16 }}>location_on</span>
              <span>{p.neighborhood}</span>
              {p.address && <span style={{ color: '#94a3b8', fontWeight: 400 }}>— {p.address}</span>}
            </div>

            {/* Nearby stations, worked out from the map pin. Each links to a
                search around that station, so a renter can compare. */}
            {stations.length > 0 && (
              <div aria-label={t.nearbyStations} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '-14px 0 24px' }}>
                {stations.map(({ station, km }) => (
                  <Link key={station.id} href={`/search?station=${station.id}`} title={t.searchNearStation(stationLabel(station, locale))}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20,
                      border: '1px solid #d6e6e0', background: '#fff', color: '#02402e', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                    <span className="msym" style={{ fontSize: 15, color: '#048c73' }}>train</span>
                    {stationLabel(station, locale)}
                    <span style={{ color: '#64748b', fontWeight: 400 }}>· {distanceLabel(km, locale)}</span>
                  </Link>
                ))}
              </div>
            )}

            {building && (
              <div style={{ marginBottom: 24 }}>
                <a href={`/building/${encodeURI(building.slug)}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 15px', borderRadius: 22,
                    border: '1px solid #d6e6e0', background: '#f2f9f6', color: '#02402e',
                    fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}>
                  <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 0" }}>apartment</span>
                  {t.otherRoomsIn(building.name)}
                </a>
              </div>
            )}

            {/* Key specs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12, marginBottom: 28, padding: 16, borderRadius: 16, border: '1px solid #eef0ef', background: '#f7f9f8' }}>
              <div style={{ textAlign: 'center' }}>
                <span className="msym" style={{ fontSize: 24, color: '#048c73', display: 'block', marginBottom: 4 }}>bed</span>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 2px' }}>{t.bedrooms}</p>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#231f20' }}>{bedroomLabel}</p>
              </div>
              {p.bathrooms > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <span className="msym" style={{ fontSize: 24, color: '#048c73', display: 'block', marginBottom: 4 }}>shower</span>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 2px' }}>{t.bathrooms}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#231f20' }}>{t.bathroomsValue(p.bathrooms)}</p>
                </div>
              )}
              {p.size && (
                <div style={{ textAlign: 'center' }}>
                  <span className="msym" style={{ fontSize: 24, color: '#048c73', display: 'block', marginBottom: 4 }}>straighten</span>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 2px' }}>{t.size}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#231f20' }}>{t.sizeValue(p.size)}</p>
                </div>
              )}
              <div style={{ textAlign: 'center' }}>
                <span className="msym" style={{ fontSize: 24, color: '#048c73', display: 'block', marginBottom: 4 }}>apartment</span>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 2px' }}>{t.type}</p>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#231f20' }}>{typeLabel}</p>
              </div>
            </div>

            {/* Excerpt */}
            {p.excerpt && (
              <p style={{ color: '#475569', fontSize: 15, lineHeight: 1.75, margin: '0 0 24px', paddingBottom: 24, borderBottom: '1px solid #eef0ef', fontWeight: 300 }}>
                {p.excerpt}
              </p>
            )}

            {/* Full description — TH/EN toggle when English body is available */}
            {hasContent && (
              <DescriptionBody contentTh={content} contentEn={contentEn} defaultLang={locale} />
            )}

            {/* Video — Premium only. p.videoUrl is already empty for packages
                that do not include it, so the gate lives in one place rather
                than being re-decided here. */}
            <PropertyVideo url={p.videoUrl ?? ''} title={p.title} locale={locale} />

            {/* Apartment Unit Pricing Table
                3- and 6-month prices were collected on the form and stored, but
                this table only ever rendered 1-month and daily — so a landlord
                filled them in and they appeared nowhere. Columns are now added
                only when at least one unit actually has that term, to avoid a
                table of empty dashes. */}
            {aptUnits.length > 0 && (() => {
              // All prices are per month; the columns are contract lengths.
              // Legacy rows kept the headline rate in price_1mo, so fall back to
              // it when price_12mo is absent.
              const rate12 = (u: any) => u.price_12mo || u.price_1mo
              const has1 = aptUnits.some((u: any) => u.price_12mo && u.price_1mo)
              const has3 = aptUnits.some((u: any) => u.price_3mo)
              const has6 = aptUnits.some((u: any) => u.price_6mo)
              const hasDaily = aptUnits.some((u: any) => u.price_daily)
              const cols = ['1.4fr', '0.8fr', '1fr',
                ...(has6 ? ['1fr'] : []), ...(has3 ? ['1fr'] : []), ...(has1 ? ['1fr'] : []),
                ...(hasDaily ? ['1fr'] : [])].join(' ')
              const money = (v: any) => v ? `฿${Number(v).toLocaleString()}` : '—'
              return (
                <div style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 14px' }}>{t.unitPricingHeading}</h2>
                  <div style={{ borderRadius: 14, border: '1px solid #eef0ef', overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '9px 16px', background: '#f7f9f8', fontSize: 11, fontWeight: 600, color: '#94a3b8', gap: 8 }}>
                      <span>{t.colRoomType}</span>
                      <span>{t.colSize}</span>
                      <span>{t.col12}</span>
                      {has6 && <span>{t.col6}</span>}
                      {has3 && <span>{t.col3}</span>}
                      {has1 && <span>{t.col1}</span>}
                      {hasDaily && <span>{t.colDaily}</span>}
                    </div>
                    {aptUnits.map((u: any, i: number) => (
                      <div key={u.id ?? i} style={{ display: 'grid', gridTemplateColumns: cols, padding: '12px 16px', fontSize: 14, borderTop: '1px solid #f0f4f3', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: '#231f20' }}>{roomTypeLabel(u.room_type, locale) || '—'}</span>
                        <span style={{ color: '#94a3b8', fontSize: 13 }}>{u.size_sqm ? t.sizeValue(u.size_sqm) : '—'}</span>
                        <span style={{ fontWeight: 700, color: '#d97f11' }}>{money(rate12(u))}</span>
                        {has6 && <span style={{ color: u.price_6mo ? '#02402e' : '#94a3b8', fontWeight: u.price_6mo ? 600 : 400 }}>{money(u.price_6mo)}</span>}
                        {has3 && <span style={{ color: u.price_3mo ? '#02402e' : '#94a3b8', fontWeight: u.price_3mo ? 600 : 400 }}>{money(u.price_3mo)}</span>}
                        {has1 && <span style={{ color: u.price_1mo ? '#02402e' : '#94a3b8', fontWeight: u.price_1mo ? 600 : 400 }}>{money(u.price_1mo)}</span>}
                        {hasDaily && <span style={{ color: u.price_daily ? '#d97f11' : '#94a3b8', fontWeight: u.price_daily ? 600 : 400 }}>{money(u.price_daily)}</span>}
                      </div>
                    ))}
                  </div>
                  {(has1 || has3 || has6) && (
                    <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '8px 0 0' }}>
                      {t.pricingNote}
                    </p>
                  )}
                </div>
              )
            })()}

            {/* Rental Charges & Conditions */}
            {chargesDisplay.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 14px' }}>{t.chargesHeading}</h2>
                <div style={{ borderRadius: 14, border: '1px solid #eef0ef', overflow: 'hidden' }}>
                  {chargesDisplay.map((row, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: i < chargesDisplay.length - 1 ? '1px solid #f0f4f3' : 'none', fontSize: 14 }}>
                      <span style={{ color: '#475569' }}>{row.label}</span>
                      <span style={{ fontWeight: 600, color: '#231f20' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities — split into what is in the unit and what the building
                provides. A flat list made a tenant work out which was which. */}
            {p.amenities.length > 0 && (() => {
              const grouped = groupSelected(p.amenities)
              return (
                <div style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 14px' }}>{t.amenitiesHeading}</h2>
                  {AMENITY_SECTIONS.map(sec => {
                    const items = grouped[sec.key]
                    if (!items.length) return null
                    return (
                      <div key={sec.key} style={{ marginBottom: 16 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{sec.icon}</span>
                          {amenitySectionLabel(sec, locale)}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {items.map(a => (
                            <span key={a} style={{ fontSize: 13, padding: '8px 14px', borderRadius: 20, fontWeight: 500,
                              background: sec.key === 'unit' ? '#eaf6f1' : '#f2f9f6',
                              color: '#02402e', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>check</span>{localiseAmenity(a, locale)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}

            {/* Map */}
            {p.lat && p.lng && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 14px' }}>{t.locationHeading}</h2>
                <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #eef0ef', boxShadow: '0 4px 16px -8px rgba(2,64,46,0.10)' }}>
                  <iframe
                    title={t.mapTitle}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${(parseFloat(p.lng) - 0.009).toFixed(6)},${(parseFloat(p.lat) - 0.006).toFixed(6)},${(parseFloat(p.lng) + 0.009).toFixed(6)},${(parseFloat(p.lat) + 0.006).toFixed(6)}&layer=mapnik&marker=${p.lat},${p.lng}`}
                    width="100%"
                    height="240"
                    style={{ border: 'none', display: 'block' }}
                    loading="lazy"
                  />
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10, fontSize: 13, color: '#048c73', fontWeight: 500, textDecoration: 'none' }}
                >
                  <span className="msym" style={{ fontSize: 16 }}>open_in_new</span>
                  {t.openInMaps}
                </a>
              </div>
            )}

            {/* What's nearby — from the same place list the search box uses, so
                every name here is one a renter can search by. */}
            {nearbyGroups.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 14px' }}>{t.nearbyHeading}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px 28px' }}>
                  {nearbyGroups.map(g => (
                    <div key={g.kind}>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{t.nearbyGroups[g.kind]}</p>
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {g.items.map(item => (
                          <li key={item.key} style={{ borderTop: '1px solid #f1f5f4' }}>
                            <Link href={item.href} title={t.searchNearPlace(item.name)}
                              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', color: '#231f20', textDecoration: 'none', fontSize: 14 }}>
                              <span className="msym" style={{ fontSize: 18, color: '#048c73', flexShrink: 0 }}>{item.icon}</span>
                              <span style={{ flex: 1, minWidth: 0 }}>{item.name}</span>
                              <span style={{ color: '#64748b', fontSize: 13, whiteSpace: 'nowrap' }}>{distanceLabel(item.km, locale)}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '12px 0 0' }}>{t.nearbyNote}</p>
              </div>
            )}
          </div>

          {/* Sticky sidebar */}
          <aside style={{ position: 'sticky', top: 86 }}>
            <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 20, padding: 22, boxShadow: '0 14px 34px -14px rgba(2,64,46,0.14)' }}>
              <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, margin: '0 0 4px' }}>{t.priceLabel}</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: '#d97f11', margin: '0 0 16px', lineHeight: 1.1 }}>{p.priceDisplay}</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0', borderTop: '1px solid #f3f5f4', borderBottom: '1px solid #f3f5f4', marginBottom: 16 }}>
                <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#02402e,#048c73)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>S</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>SpacesMate</p>
                  <p style={{ fontSize: 12, color: '#048c73', fontWeight: 500, margin: 0, display: 'flex', alignItems: 'center', gap: 3 }}>{t.verified}<span className="msym" style={{ fontSize: 12, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>check</span></p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {/* LINE button — listing-specific or SpacesMate default */}
                {dbContact?.line ? (
                  <a data-stat="line" href={`https://line.me/R/ti/p/${dbContact.line}`} target="_blank" rel="noopener noreferrer"
                    style={{ background: '#06C755', color: '#fff', fontWeight: 600, fontSize: 14, padding: '13px 0', borderRadius: 24, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
                    <span className="msym" style={{ fontSize: 18 }}>chat</span>{t.askOnLine}
                  </a>
                ) : (
                  <a data-stat="line" href="https://line.me/R/ti/p/@spacesmate" target="_blank" rel="noopener noreferrer"
                    style={{ background: '#06C755', color: '#fff', fontWeight: 600, fontSize: 14, padding: '13px 0', borderRadius: 24, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
                    <span className="msym" style={{ fontSize: 18 }}>chat</span>{t.askOnLine}
                  </a>
                )}
                {/* Phone button — listing-specific or SpacesMate default */}
                {dbContact?.phone ? (
                  <a data-stat="phone" href={`tel:${dbContact.phone.replace(/\D/g, '')}`}
                    style={{ background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 14, padding: '13px 0', borderRadius: 24, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
                    <span className="msym" style={{ fontSize: 18 }}>call</span>{t.call(dbContact.phone)}
                  </a>
                ) : (
                  <a data-stat="phone" href="tel:+66621524526"
                    style={{ background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 14, padding: '13px 0', borderRadius: 24, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
                    <span className="msym" style={{ fontSize: 18 }}>call</span>{t.call('062-152-4526')}
                  </a>
                )}
              </div>

              <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', margin: '14px 0 0' }}>
                {t.noCommission}
              </p>
            </div>

            <Link href="/search"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 14, color: '#048c73', fontSize: 13.5, fontWeight: 500, textDecoration: 'none' }}>
              <span className="msym" style={{ fontSize: 15 }}>arrow_back</span>
              {t.browseAll}
            </Link>
          </aside>
        </div>

        {/* Related properties */}
        {related.length > 0 && (
          <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid #eef0ef' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 20px' }}>{t.relatedHeading}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }} className="sm-relatedgrid">
              {related.map((r) => (
                <Link key={r.slug} href={`${locale === 'en' ? '/en' : ''}/property/${r.slug}`} className="sm-prop-card"
                  style={{ borderRadius: 18, border: '1px solid #eef0ef', overflow: 'hidden', display: 'block', textDecoration: 'none', background: '#fff', transition: 'all .25s', boxShadow: '0 4px 16px -8px rgba(2,64,46,0.10)' }}>
                  <div style={{ height: 140, background: 'linear-gradient(135deg,#02402e,#048c73)', overflow: 'hidden' }}>
                    {r.image && (
                      <img src={r.image} alt={r.title} className="sm-prop-img"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' }} />
                    )}
                  </div>
                  <div style={{ padding: 14 }}>
                    <p style={{ fontSize: 12, color: '#048c73', fontWeight: 500, margin: '0 0 4px' }}>{r.neighborhood}</p>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: '#231f20', margin: '0 0 8px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.title}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#d97f11', margin: 0 }}>{r.priceDisplay}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Owner CTA block */}
        <div style={{ marginTop: 48, padding: 28, borderRadius: 20, color: '#fff', background: 'radial-gradient(120% 160% at 85% 10%, #055c43, #02402e 60%)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
            <span className="msym" style={{ fontSize: 40, color: '#048c73', flexShrink: 0 }}>home_work</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 6px' }}>{t.ownerHeading}</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: '0 0 16px', fontWeight: 300 }}>
                {t.ownerBody}
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href="/services"
                  style={{ background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 13.5, padding: '10px 20px', borderRadius: 22, textDecoration: 'none', display: 'inline-block' }}>
                  {t.ownerServicesCta}
                </Link>
                <Link href="/submit"
                  style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, fontSize: 13.5, padding: '10px 20px', borderRadius: 22, textDecoration: 'none', display: 'inline-block', border: '1px solid rgba(255,255,255,0.2)' }}>
                  {t.ownerListCta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .sm-detaillayout { grid-template-columns: 1fr !important; }
          .sm-relatedgrid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .sm-relatedgrid { grid-template-columns: 1fr !important; }
        }
        .sm-prop-card:hover {
          box-shadow: 0 16px 34px -12px rgba(2,64,46,0.18) !important;
          transform: translateY(-4px) !important;
        }
        .sm-prop-card:hover .sm-prop-img { transform: scale(1.06) !important; }
        .property-content p { margin-bottom: 1.15rem; }
        .property-content h2 { font-size: 1.2rem; font-weight: 700; color: #02402e; margin: 1.75rem 0 0.7rem; }
        .property-content h3 { font-size: 1rem; font-weight: 600; color: #231f20; margin: 1.4rem 0 0.5rem; }
        .property-content ul, .property-content ol { padding-left: 1.4rem; margin-bottom: 1.15rem; }
        .property-content li { margin-bottom: 0.4rem; }
        .property-content strong, .property-content b { color: #231f20; font-weight: 600; }
        .property-content a { color: #048c73; text-decoration: underline; }
        .property-content img { border-radius: 12px; margin: 1.25rem 0; max-width: 100%; }
        .property-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem; }
        .property-content th { background: #02402e; color: #fff; padding: 10px 14px; text-align: left; }
        .property-content td { padding: 9px 14px; border-bottom: 1px solid #eef0ef; }
        .property-content tr:nth-child(even) td { background: #f7f9f8; }
      `}</style>
    </div>
  )
}
