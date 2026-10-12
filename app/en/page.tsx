import Link from 'next/link'
import type { Metadata } from 'next'
import { AREA_KEYWORDS } from '@/lib/constants'
import { AREA_CONTENT } from '@/lib/area-content'
import { BreadcrumbLd, ItemListLd } from '@/components/seo/JsonLd'

/**
 * English entry point.
 *
 * Exists so the navbar language toggle always has somewhere valid to go. Before
 * this page, `/en` returned 404 while 16 `/en/area/...` pages were live — the
 * English side of the site had published pages but no front door.
 *
 * Deliberately honest about its own limits: the area guides below are fully
 * translated, the listings themselves are not yet. Saying so is better than
 * sending an English reader into Thai pages with no warning.
 */

const SITE = 'https://spacesmate.com'

export const metadata: Metadata = {
  title: 'Rent an Apartment, Condo or Office in Bangkok | SpacesMate',
  description:
    'Area guides in English for renting in Bangkok — condos, apartments, houses, offices and co-working, by BTS and MRT station. Verified listings, direct contact, no agent fee.',
  openGraph: {
    title: 'Rent in Bangkok | SpacesMate',
    description: 'English area guides for renting in Bangkok — by BTS and MRT station.',
    type: 'website',
    url: `${SITE}/en`,
  },
  alternates: { canonical: '/en', languages: { th: '/' } },
}

export default function EnglishHome() {
  const areas = AREA_KEYWORDS.map(a => ({
    ...a,
    content: AREA_CONTENT[a.slug],
  }))

  return (
    <div className="bg-white min-h-screen">

      <ItemListLd
        name="Bangkok rental area guides"
        items={areas.map(a => ({ url: `${SITE}/en/area/${a.slug}`, name: a.label_en }))}
      />
      <BreadcrumbLd
        trail={[
          { name: 'Home', url: `${SITE}/` },
          { name: 'English', url: `${SITE}/en` },
        ]}
      />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#02402e,#048c73)', padding: '56px 24px 64px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(24px,3.4vw,42px)', fontWeight: 700, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.3px' }}>
            Renting in Bangkok, in English
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, margin: '0 0 24px', fontWeight: 300, maxWidth: 640, lineHeight: 1.6 }}>
            Neighbourhood guides by BTS and MRT station — what each area is like,
            what it costs, and what is available now. Rent is quoted per month in
            Thai baht, and you contact the owner directly.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <Link href="/search" style={{ background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 14, padding: '12px 24px', borderRadius: 24, textDecoration: 'none' }}>
              Browse all listings
            </Link>
            <Link href="/submit" style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: 14, padding: '12px 24px', borderRadius: 24, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}>
              List your property
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 72px' }}>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#02402e', margin: '0 0 6px' }}>
          Area guides
        </h2>
        <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px', fontWeight: 300 }}>
          {areas.length} Bangkok neighbourhoods, written in English.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 48 }} className="sm-en-grid">
          {areas.map(a => (
            <Link key={a.slug} href={`/en/area/${a.slug}`}
              style={{ padding: '18px 20px', background: '#f7f9f8', border: '1px solid #eef0ef', borderRadius: 16, textDecoration: 'none', display: 'block', transition: 'all .2s' }}
              className="sm-en-card">
              <p style={{ fontSize: 15, fontWeight: 600, color: '#02402e', margin: '0 0 4px' }}>{a.label_en}</p>
              <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 8px' }}>{a.label_th}</p>
              {a.content && (
                <p style={{ fontSize: 13, fontWeight: 600, color: '#d97f11', margin: 0 }}>{a.content.price_from_en}</p>
              )}
            </Link>
          ))}
        </div>

        {/* Honest note about coverage */}
        <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 20, padding: '24px 28px' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#02402e', margin: '0 0 10px' }}>
            A note on language
          </h2>
          <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.8, margin: '0 0 10px', fontWeight: 300 }}>
            The area guides above are written in English. Individual listing pages and
            search are still in Thai while we translate them — the prices, photos,
            room sizes and contact details are all readable, and listing titles are
            given in English where the owner supplied one.
          </p>
          <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.8, margin: 0, fontWeight: 300 }}>
            If you need help with a specific property, message us on LINE at{' '}
            <a href="https://line.me/R/ti/p/@spacesmate" style={{ color: '#048c73', fontWeight: 500 }}>@spacesmate</a>
            {' '}— we reply in English.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .sm-en-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 600px) { .sm-en-grid { grid-template-columns: 1fr !important; } }
        .sm-en-card:hover { border-color: #048c73 !important; background: #eaf6f1 !important; }
      `}</style>
    </div>
  )
}
