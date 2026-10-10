/**
 * Structured data (JSON-LD)
 *
 * The site previously had none. That matters more for answer engines than for
 * classic search: ChatGPT, Gemini and AI Overviews lean on entity markup to
 * decide who a company is and whether a page can be quoted. Without it we are a
 * wall of text competing with RentHub, who are the default answer by volume.
 *
 * Rendered as a plain <script> rather than next/script because search crawlers
 * read the initial HTML, and next/script may defer past that point.
 */

const SITE = 'https://spacesmate.com'

function Ld({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Content is our own, built from typed values — not user input echoed raw.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

/** Site-wide identity. Render once, in the root layout. */
export function OrganizationLd() {
  return (
    <Ld
      data={{
        '@context': 'https://schema.org',
        '@type': 'RealEstateAgent',
        '@id': `${SITE}/#organization`,
        name: 'SpacesMate',
        legalName: 'Space Works Co., Ltd.',
        url: SITE,
        logo: `${SITE}/logo.png`,
        image: `${SITE}/logo.png`,
        description:
          'แพลตฟอร์มเช่าอสังหาริมทรัพย์และบริการรับบริหารอาคารในกรุงเทพฯ ' +
          'ลงประกาศห้องเช่า คอนโด อพาร์ทเม้นท์ บ้าน และออฟฟิศ',
        areaServed: { '@type': 'City', name: 'Bangkok', alternateName: 'กรุงเทพมหานคร' },
        address: {
          '@type': 'PostalAddress',
          streetAddress: '4004/856 ถนนพระรามที่ 4 แขวงพระโขนง',
          addressLocality: 'เขตคลองเตย',
          addressRegion: 'กรุงเทพมหานคร',
          addressCountry: 'TH',
        },
        sameAs: [
          'https://www.facebook.com/spacesmateTH',
          'https://www.instagram.com/spacesmate/',
          'https://www.tiktok.com/@spacesmate',
          'https://line.me/R/ti/p/@spacesmate',
        ],
        knowsLanguage: ['th', 'en'],
      }}
    />
  )
}

/** Site-wide search action — lets engines surface the search box directly. */
export function WebSiteLd() {
  return (
    <Ld
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: SITE,
        name: 'SpacesMate',
        inLanguage: 'th-TH',
        publisher: { '@id': `${SITE}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${SITE}/search?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  )
}

export type ListingLdProps = {
  name: string
  description?: string
  url: string
  images?: string[]
  price?: number
  district?: string | null
  address?: string | null
  bedrooms?: number | null
  bathrooms?: number | null
  areaSqm?: number | null
  propertyType?: string
  lat?: string | number | null
  lng?: string | number | null
  amenities?: string[]
  listingType?: string
  datePosted?: string
  dateModified?: string
}

/** schema.org has no Condo type; a condo unit is an Apartment. */
const ACCOM_TYPE: Record<string, string> = {
  Condo: 'Apartment',
  Apartment: 'Apartment',
  House: 'House',
}

/**
 * A single property.
 *
 * Emitted as a RealEstateListing page whose mainEntity is the unit, so an
 * answer engine reads two separate facts: this page is a rental listing, and
 * this is the thing being let.
 *
 * The rent carries a UnitPriceSpecification with an explicit period. A bare
 * `price: 4800` is ambiguous — it reads as the price of the apartment rather
 * than the monthly rent, and that is exactly the number that gets quoted back.
 */
export function ListingLd(p: ListingLdProps) {
  const lat = p.lat !== null && p.lat !== undefined && p.lat !== '' ? Number(p.lat) : NaN
  const lng = p.lng !== null && p.lng !== undefined && p.lng !== '' ? Number(p.lng) : NaN
  const hasGeo = Number.isFinite(lat) && Number.isFinite(lng)
  const daily = p.listingType === 'Daily'

  const unit: Record<string, unknown> = {
    '@type': (p.propertyType && ACCOM_TYPE[p.propertyType]) || 'Accommodation',
    '@id': `${p.url}#unit`,
    name: p.name,
    url: p.url,
    inLanguage: 'th-TH',
    ...(p.description ? { description: p.description.slice(0, 500) } : {}),
    ...(p.images?.length ? { image: p.images.slice(0, 6) } : {}),
    ...(p.bedrooms   ? { numberOfBedroomsTotal: p.bedrooms, numberOfRooms: p.bedrooms } : {}),
    ...(p.bathrooms  ? { numberOfBathroomsTotal: p.bathrooms } : {}),
    ...(p.areaSqm    ? { floorSize: { '@type': 'QuantitativeValue', value: p.areaSqm, unitCode: 'MTK' } } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(p.address  ? { streetAddress: p.address } : {}),
      ...(p.district ? { addressLocality: p.district } : {}),
      addressRegion: 'กรุงเทพมหานคร',
      addressCountry: 'TH',
    },
    ...(hasGeo ? { geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lng } } : {}),
    ...(p.amenities?.length
      ? {
          amenityFeature: p.amenities.slice(0, 20).map(a => ({
            '@type': 'LocationFeatureSpecification',
            name: a,
            value: true,
          })),
        }
      : {}),
    ...(p.price
      ? {
          offers: {
            '@type': 'Offer',
            price: p.price,
            priceCurrency: 'THB',
            availability: 'https://schema.org/InStock',
            businessFunction: 'https://schema.org/LeaseOut',
            url: p.url,
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: p.price,
              priceCurrency: 'THB',
              unitCode: daily ? 'DAY' : 'MON',
              unitText: daily ? 'DAY' : 'MONTH',
            },
          },
        }
      : {}),
    provider: { '@id': `${SITE}/#organization` },
  }

  return (
    <Ld
      data={{
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        url: p.url,
        name: p.name,
        inLanguage: 'th-TH',
        ...(p.datePosted ? { datePosted: p.datePosted } : {}),
        ...(p.dateModified ? { dateModified: p.dateModified } : {}),
        ...(p.description ? { description: p.description.slice(0, 500) } : {}),
        mainEntity: unit,
        provider: { '@id': `${SITE}/#organization` },
      }}
    />
  )
}

/** Area pages: a list of listings, so the page can be summarised as one. */
export function ItemListLd({ items, name }: { items: { url: string; name: string }[]; name: string }) {
  return (
    <Ld
      data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name,
        numberOfItems: items.length,
        itemListElement: items.slice(0, 50).map((it, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: it.url,
          name: it.name,
        })),
      }}
    />
  )
}

export function BreadcrumbLd({ trail }: { trail: { name: string; url: string }[] }) {
  return (
    <Ld
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: t.name,
          item: t.url,
        })),
      }}
    />
  )
}

/** FAQ markup is directly answer-engine eligible — the cheapest AEO win here. */
export function FaqLd({ qa }: { qa: { q: string; a: string }[] }) {
  return (
    <Ld
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: qa.map(x => ({
          '@type': 'Question',
          name: x.q,
          acceptedAnswer: { '@type': 'Answer', text: x.a },
        })),
      }}
    />
  )
}
