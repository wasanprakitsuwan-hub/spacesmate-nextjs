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
import { getDbPropertyRaw, normalizeDbListing, plainText, getNearbyDbListings, getSameBuildingListings } from '@/lib/property-page'
import { provinceLabel } from '@/lib/geo-i18n'
import { TH_MONTHS, EN_MONTHS } from '@/lib/site-i18n'
import { C, RADIUS, WRAP } from '@/lib/ui'
import { roomTypeLabel } from '@/lib/room-types'
import { nearbyStations, nearbyLandmarks, stationLabel, distanceLabel } from '@/lib/search-match'
import { LANDMARK_ICON, type LandmarkKind } from '@/lib/landmarks'
import { rentPath } from '@/lib/rent-slugs'
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
  const nearbyListings = raw
    ? await getNearbyDbListings(raw, locale, 3)
    : properties.filter((r) => r.slug !== p.slug && r.propertyType === p.propertyType).slice(0, 3).map(r => ({ p: r, km: null }))
  const sameBuilding = raw ? await getSameBuildingListings(raw, locale, 4) : []

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
    for (const kind of ['transport', 'university', 'hospital', 'mall', 'place'] as LandmarkKind[]) {
      const items: NearbyItem[] = kind === 'transport'
        ? stations.map(({ station, km }) => ({ key: `s:${station.id}`, name: stationLabel(station, locale), km, icon: 'train', href: rentPath({ kind: 'station', id: station.id, station }) }))
        : []
      for (const { landmark, km } of landmarks.filter(x => x.landmark.kind === kind)) {
        items.push({ key: `l:${landmark.id}`, name: locale === 'en' ? landmark.en : landmark.th, km, icon: LANDMARK_ICON[kind], href: rentPath({ kind: 'landmark', id: landmark.id, landmark }) })
      }
      items.sort((a, b) => a.km - b.km)
      if (items.length) nearbyGroups.push({ kind, items: items.slice(0, 3) })
    }
  }

  const daily = raw?.rental_term === 'daily' || p.listingType === 'Daily'
  const priceFrom = Number(raw?.price_from ?? p.priceMin) || 0
  const priceTo = Number(raw?.price_to) || 0
  const priceText = priceFrom
    ? `฿${priceFrom.toLocaleString('en-US')}${priceTo > priceFrom ? ` – ${priceTo.toLocaleString('en-US')}` : ''}`
    : t.askForPrice
  const fullDate = (iso?: string | null) => {
    const d = iso ? new Date(iso) : null
    if (!d || isNaN(d.getTime())) return ''
    return locale === 'en'
      ? `${d.getDate()} ${EN_MONTHS[d.getMonth()]} ${d.getFullYear()}`
      : `${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`
  }
  const nearest = stations[0]
  const lineColor = (sys: string) => sys === 'BTS' ? C.bts : sys === 'MRT' ? C.mrt : '#C8102E'
  const h2: React.CSSProperties = { fontSize: 20, fontWeight: 600, color: C.green, margin: '0 0 14px', lineHeight: 1.4 }
  const section: React.CSSProperties = { padding: '28px 0', borderTop: `1px solid ${C.line}` }
  const lineBtn = { href: dbContact?.line ? `https://line.me/R/ti/p/${dbContact.line}` : 'https://line.me/R/ti/p/@spacesmate' }
  const phone = dbContact?.phone ? { href: `tel:${dbContact.phone.replace(/\D/g, '')}`, label: dbContact.phone } : { href: 'tel:+66621524526', label: '062-152-4526' }
  const specs = [
    { k: t.bedrooms, v: bedroomLabel },
    ...(p.bathrooms > 0 ? [{ k: t.bathrooms, v: String(p.bathrooms) }] : []),
    ...(p.size ? [{ k: t.size, v: t.sizeValue(p.size) }] : []),
    ...(raw?.floor ? [{ k: t.floor, v: String(raw.floor) }] : []),
  ]

  return (
    <div style={{ background: C.paper, minHeight: '100vh' }} className="sm-detail-page">
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
          // English pages point at the English home and search, not the Thai ones.
          { name: t.home, url: locale === 'en' ? 'https://spacesmate.com/en' : 'https://spacesmate.com/' },
          { name: t.search, url: locale === 'en' ? 'https://spacesmate.com/en/search' : 'https://spacesmate.com/search' },
          ...(building ? [{ name: building.name, url: `https://spacesmate.com/building/${encodeURI(building.slug)}` }] : []),
          { name: p.title, url: canonicalUrl },
        ]}
      />

      <div style={{ maxWidth: WRAP, margin: '0 auto', padding: '20px 24px 0' }}>
        <nav style={{ fontSize: 13, color: C.muted, marginBottom: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Link href="/" style={{ color: C.muted }}>{t.home}</Link> / <Link href="/search" style={{ color: C.muted }}>{t.search}</Link>
          {building && <> / <a href={`/building/${encodeURI(building.slug)}`} style={{ color: C.muted }}>{building.name}</a></>} / {p.title}
        </nav>
        <PropertyGallery images={p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : [])} title={p.title} locale={locale} />
      </div>

      <div style={{ maxWidth: WRAP, margin: '0 auto', padding: '28px 24px 0', display: 'flex', gap: 48, alignItems: 'flex-start' }} className="sm-detaillayout">
        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 24 }}>
            <span style={{ fontSize: 14, color: C.muted }}>
              {typeLabel}{p.neighborhood ? ` · ${p.neighborhood}` : ''}{daily ? ` · ${t.dailyBadge}` : ''}
            </span>
            <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.35, fontWeight: 600, color: C.green }} className="sm-detail-h1">{p.title}</h1>
            {nearest && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}>
                <span aria-hidden="true" style={{ width: 14, height: 4, borderRadius: 2, background: lineColor(nearest.station.systems[0]) }} />
                <Link href={`/search?station=${nearest.station.id}`} title={t.searchNearStation(stationLabel(nearest.station, locale))} style={{ color: C.ink }}>
                  {stationLabel(nearest.station, locale)}
                </Link>
                <span style={{ color: C.muted }}>{distanceLabel(nearest.km, locale)}</span>
              </div>
            )}
          </div>

          <dl style={{ display: 'grid', gridTemplateColumns: `repeat(${specs.length}, 1fr)`, border: `1px solid ${C.line}`, borderRadius: RADIUS, background: C.white, margin: '0 0 8px' }} className="sm-specs">
            {specs.map((sp, i) => (
              <div key={sp.k} style={{ padding: '14px 18px', borderLeft: i ? `1px solid ${C.line}` : 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <dt style={{ fontSize: 13, color: C.muted }}>{sp.k}</dt>
                <dd style={{ margin: 0, fontSize: 17, fontWeight: 500 }}>{sp.v}</dd>
              </div>
            ))}
          </dl>

          {(hasContent || p.excerpt) && (
            <section style={{ ...section, borderTop: 'none' }}>
              <h2 style={h2}>{t.detailsHeading}</h2>
              {p.excerpt && <p style={{ color: C.ink, fontSize: 16, lineHeight: 1.8, margin: '0 0 16px' }}>{p.excerpt}</p>}
              {hasContent && <DescriptionBody contentTh={content} contentEn={contentEn} defaultLang={locale} />}
            </section>
          )}

          {/* Video — Premium only. p.videoUrl is already empty for packages
              that do not include it, so the gate lives in one place. */}
          {p.videoUrl && (
            <section style={section}>
              <PropertyVideo url={p.videoUrl} title={p.title} locale={locale} />
            </section>
          )}

          {/* Apartment unit prices. A column appears only when at least one unit
              has that contract length, to avoid a table of empty dashes. */}
          {aptUnits.length > 0 && (() => {
            // All prices are per month; the columns are contract lengths.
            // Legacy rows kept the headline rate in price_1mo, so fall back to
            // it when price_12mo is absent.
            const rate12 = (u: any) => u.price_12mo || u.price_1mo
            const has1 = aptUnits.some((u: any) => u.price_12mo && u.price_1mo)
            const has3 = aptUnits.some((u: any) => u.price_3mo)
            const has6 = aptUnits.some((u: any) => u.price_6mo)
            const hasDaily = aptUnits.some((u: any) => u.price_daily)
            const money = (v: any) => v ? `฿${Number(v).toLocaleString('en-US')}` : '—'
            const th: React.CSSProperties = { textAlign: 'left', fontWeight: 500, color: C.muted, fontSize: 13, padding: '10px 14px', whiteSpace: 'nowrap' }
            const td: React.CSSProperties = { padding: '12px 14px', borderTop: `1px solid ${C.line2}`, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
            return (
              <section style={section}>
                <h2 style={h2}>{t.unitPricingHeading}</h2>
                <div style={{ overflowX: 'auto', border: `1px solid ${C.line}`, borderRadius: RADIUS, background: C.white }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead><tr>
                      <th style={th}>{t.colRoomType}</th><th style={th}>{t.colSize}</th><th style={th}>{t.col12}</th>
                      {has6 && <th style={th}>{t.col6}</th>}{has3 && <th style={th}>{t.col3}</th>}{has1 && <th style={th}>{t.col1}</th>}{hasDaily && <th style={th}>{t.colDaily}</th>}
                    </tr></thead>
                    <tbody>
                      {aptUnits.map((u: any, i: number) => (
                        <tr key={u.id ?? i}>
                          <td style={{ ...td, fontWeight: 500 }}>{roomTypeLabel(u.room_type, locale) || '—'}</td>
                          <td style={{ ...td, color: C.muted }}>{u.size_sqm ? t.sizeValue(u.size_sqm) : '—'}</td>
                          <td style={{ ...td, fontWeight: 600, color: C.amber }}>{money(rate12(u))}</td>
                          {has6 && <td style={td}>{money(u.price_6mo)}</td>}
                          {has3 && <td style={td}>{money(u.price_3mo)}</td>}
                          {has1 && <td style={td}>{money(u.price_1mo)}</td>}
                          {hasDaily && <td style={{ ...td, color: C.amber }}>{money(u.price_daily)}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(has1 || has3 || has6) && <p style={{ fontSize: 13, color: C.muted, margin: '8px 0 0' }}>{t.pricingNote}</p>}
              </section>
            )
          })()}

          {chargesDisplay.length > 0 && (
            <section style={section}>
              <h2 style={h2}>{t.chargesHeading}</h2>
              <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '10px 32px', margin: 0, fontSize: 15 }}>
                {chargesDisplay.map((row, i) => (
                  <div key={i} style={{ display: 'contents' }}>
                    <dt style={{ color: C.muted }}>{row.label}</dt>
                    <dd style={{ margin: 0, fontWeight: 500 }}>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Amenities — what is in the unit, then what the building provides. */}
          {p.amenities.length > 0 && (() => {
            const grouped = groupSelected(p.amenities)
            return (
              <section style={section}>
                <h2 style={h2}>{t.amenitiesHeading}</h2>
                {AMENITY_SECTIONS.map(sec => {
                  const items = grouped[sec.key]
                  if (!items.length) return null
                  return (
                    <div key={sec.key} style={{ marginBottom: 18 }}>
                      <p style={{ fontSize: 13, color: C.muted, margin: '0 0 8px' }}>{amenitySectionLabel(sec, locale)}</p>
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px 24px', fontSize: 15 }}>
                        {items.map(a => (
                          <li key={a} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
                            {localiseAmenity(a, locale)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </section>
            )
          })()}

          <section style={section}>
            <h2 style={h2}>{t.infoHeading}</h2>
            <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '10px 32px', margin: 0, fontSize: 15 }}>
              {(p.address || p.neighborhood) && <><dt style={{ color: C.muted }}>{t.infoLocation}</dt><dd style={{ margin: 0 }}>{[p.address, p.neighborhood].filter(Boolean).join(' · ')}</dd></>}
              {raw?.rental_term && t.minTerms[raw.rental_term] && <><dt style={{ color: C.muted }}>{t.infoMinTerm}</dt><dd style={{ margin: 0 }}>{t.minTerms[raw.rental_term]}</dd></>}
              {fullDate(p.date) && <><dt style={{ color: C.muted }}>{t.infoPosted}</dt><dd style={{ margin: 0 }}>{fullDate(p.date)}</dd></>}
              {fullDate(raw?.updated_at) && <><dt style={{ color: C.muted }}>{t.infoUpdated}</dt><dd style={{ margin: 0 }}>{fullDate(raw?.updated_at)}</dd></>}
            </dl>
          </section>

          {(hasPin || nearbyGroups.length > 0) && (
            <section style={section}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
                <h2 style={{ ...h2, margin: 0 }}>{t.locationNearbyHeading}</h2>
                {hasPin && <a href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: C.teal }}>{t.openInMaps} →</a>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28 }}>
                {hasPin && (
                  <iframe
                    title={t.mapTitle}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${(pinLng - 0.009).toFixed(6)},${(pinLat - 0.006).toFixed(6)},${(pinLng + 0.009).toFixed(6)},${(pinLat + 0.006).toFixed(6)}&layer=mapnik&marker=${p.lat},${p.lng}`}
                    loading="lazy"
                    style={{ flex: '1 1 320px', minWidth: 0, height: 280, border: `1px solid ${C.line}`, borderRadius: RADIUS, display: 'block', background: C.line }}
                  />
                )}
                {nearbyGroups.length > 0 && (
                  <div style={{ flex: '1 1 260px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {nearbyGroups.map(g => (
                      <div key={g.kind}>
                        <p style={{ fontSize: 13, color: C.muted, margin: '0 0 4px' }}>{t.nearbyGroups[g.kind]}</p>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                          {g.items.map(item => (
                            <li key={item.key} style={{ borderBottom: `1px solid ${C.line2}` }}>
                              <Link href={item.href} title={t.searchNearPlace(item.name)} className="sm-row-link"
                                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', color: C.ink, fontSize: 14 }}>
                                {item.key.startsWith('s:') && (() => {
                                  const st = stations.find(s => `s:${s.station.id}` === item.key)
                                  return st ? <span aria-hidden="true" style={{ width: 14, height: 4, borderRadius: 2, background: lineColor(st.station.systems[0]), flexShrink: 0 }} /> : null
                                })()}
                                <span style={{ flex: 1, minWidth: 0 }}>{item.name}</span>
                                <span style={{ color: C.muted, fontSize: 13, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{distanceLabel(item.km, locale)}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{t.nearbyNote}</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>

        <aside style={{ flex: '0 0 320px', position: 'sticky', top: 92 }} className="sm-detail-aside">
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS, padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 600, color: C.amber, lineHeight: 1.25, fontVariantNumeric: 'tabular-nums' }}>{priceText}</div>
              {priceFrom > 0 && <div style={{ fontSize: 14, color: C.muted }}>{daily ? t.perDayWord : t.perMonthWord}</div>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a data-stat="line" href={lineBtn.href} target="_blank" rel="noopener noreferrer"
                style={{ background: '#06C755', color: C.white, fontWeight: 500, fontSize: 15, padding: '12px 0', borderRadius: RADIUS, textAlign: 'center', textDecoration: 'none' }}>
                {t.askOnLine}
              </a>
              <a data-stat="phone" href={phone.href} className="sm-btn-ghost"
                style={{ background: C.white, color: C.ink, border: `1px solid ${C.border}`, fontWeight: 500, fontSize: 15, padding: '11px 0', borderRadius: RADIUS, textAlign: 'center', textDecoration: 'none' }}>
                {t.call(phone.label)}
              </a>
            </div>
            <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.6 }}>{t.noCommission}</p>
          </div>
        </aside>
      </div>

      <div style={{ maxWidth: WRAP, margin: '0 auto', padding: '24px 24px 72px' }}>
        {sameBuilding.length > 0 && building && (
          <section style={section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, flexWrap: 'wrap', marginBottom: 6 }}>
              <h2 style={{ ...h2, margin: 0 }}>{t.sameBuildingHeading}</h2>
              <a href={`/building/${encodeURI(building.slug)}`} style={{ fontSize: 14, color: C.teal }}>{t.sameBuildingAll(building.name)}</a>
            </div>
            {sameBuilding.map(r => (
              <Link key={r.slug} href={`${locale === 'en' ? '/en' : ''}/property/${r.slug}`} className="sm-card"
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: `1px solid ${C.line}`, color: C.ink }}>
                <div style={{ width: 96, height: 72, borderRadius: RADIUS, overflow: 'hidden', background: C.line, flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {r.image && <img src={r.image} alt={r.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span className="sm-card-title" style={{ fontSize: 15, fontWeight: 500 }}>{r.title}</span>
                  <span style={{ fontSize: 13, color: C.muted }}>
                    {[r.bedrooms === 0 ? t.studio : t.bedroomsValue(r.bedrooms), r.size ? t.sizeValue(r.size) : ''].filter(Boolean).join(' · ')}
                  </span>
                </div>
                <span style={{ fontWeight: 600, color: C.amber, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{r.priceDisplay}</span>
              </Link>
            ))}
          </section>
        )}

        {nearbyListings.length > 0 && (
          <section style={section}>
            <h2 style={{ ...h2, marginBottom: 20 }}>{nearbyListings.some(x => x.km !== null) ? t.nearbyListingsHeading : t.relatedHeading}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '32px 24px' }}>
              {nearbyListings.map(({ p: r, km }) => (
                <Link key={r.slug} href={`${locale === 'en' ? '/en' : ''}/property/${r.slug}`} className="sm-card"
                  style={{ display: 'flex', flexDirection: 'column', gap: 10, color: C.ink }}>
                  <div style={{ width: '100%', aspectRatio: '4 / 3', borderRadius: RADIUS, overflow: 'hidden', background: C.line }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {r.image && <img src={r.image} alt={r.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                  </div>
                  <span style={{ fontSize: 13, color: C.muted }}>
                    {[km !== null ? t.awayFromHere(distanceLabel(km, locale)) : '', r.neighborhood].filter(Boolean).join(' · ')}
                  </span>
                  <span className="sm-card-title" style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.45 }}>{r.title}</span>
                  <span style={{ fontSize: 17, fontWeight: 600, color: C.amber, fontVariantNumeric: 'tabular-nums' }}>{r.priceDisplay}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* On a phone the contact card sits below the details, so price and LINE stay pinned to the bottom. */}
      <div className="sm-mobile-contact"
        style={{ display: 'none', position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40, background: C.white, borderTop: `1px solid ${C.line}`, padding: '10px 16px', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: C.amber, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{priceText}</div>
          {priceFrom > 0 && <div style={{ fontSize: 12, color: C.muted }}>{daily ? t.perDayWord : t.perMonthWord}</div>}
        </div>
        <a data-stat="line" href={lineBtn.href} target="_blank" rel="noopener noreferrer"
          style={{ background: '#06C755', color: C.white, fontWeight: 500, fontSize: 15, padding: '10px 18px', borderRadius: RADIUS, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          {t.askOnLine}
        </a>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .sm-detaillayout { flex-direction: column; gap: 0 !important; }
          .sm-detail-aside { position: static !important; flex: none !important; width: 100%; margin-top: 8px; }
          .sm-mobile-contact { display: flex !important; }
          .sm-detail-page { padding-bottom: 76px; }
        }
        @media (max-width: 600px) {
          .sm-detail-h1 { font-size: 24px !important; }
          .sm-specs { grid-template-columns: repeat(2, 1fr) !important; }
          .sm-specs > div:nth-child(3) { border-left: none !important; }
          .sm-specs > div:nth-child(n+3) { border-top: 1px solid ${C.line}; }
        }
        .property-content { font-size: 16px; line-height: 1.8; color: ${C.ink}; }
        .property-content p { margin-bottom: 1.1rem; }
        .property-content h2 { font-size: 1.15rem; font-weight: 600; color: ${C.green}; margin: 1.6rem 0 0.6rem; }
        .property-content h3 { font-size: 1rem; font-weight: 600; color: ${C.ink}; margin: 1.3rem 0 0.5rem; }
        .property-content ul, .property-content ol { padding-left: 1.4rem; margin-bottom: 1.1rem; }
        .property-content li { margin-bottom: 0.4rem; }
        .property-content strong, .property-content b { color: ${C.ink}; font-weight: 600; }
        .property-content a { color: ${C.teal}; text-decoration: underline; }
        .property-content img { border-radius: ${RADIUS}px; margin: 1.2rem 0; max-width: 100%; }
        .property-content table { width: 100%; border-collapse: collapse; margin: 1.4rem 0; font-size: 0.9rem; }
        .property-content th { background: ${C.green}; color: #fff; padding: 10px 14px; text-align: left; }
        .property-content td { padding: 9px 14px; border-bottom: 1px solid ${C.line}; }
      `}</style>
    </div>
  )
}
