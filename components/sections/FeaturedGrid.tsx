'use client'

import { useEffect, useState } from 'react'
import Link from '@/components/ui/LocaleLink'
import Image from 'next/image'
import type { Property } from '@/lib/property-data'
import { SITE_T, type Locale } from '@/lib/site-i18n'
import { C, RADIUS } from '@/lib/ui'
import { dailyShuffle } from '@/lib/fair-rotation'

export type FeaturedCard = Pick<Property, 'slug' | 'title' | 'image' | 'propertyType'> & {
  /** "฿6,000 – 9,700", or "ask for price". */
  price: string
  /** "/เดือน", or empty when there is no price. */
  priceSuffix: string
  /** "ใกล้ BTS อุดมสุข 600 ม.", or the district when no station is near. */
  place: string
  lineColor: string
}

const SHOW = 8
const TYPE_KEYS: Record<string, 'apartment' | 'condoShort' | 'office' | 'coSpace'> = {
  Apartment: 'apartment', Condo: 'condoShort', Office: 'office', 'Co-Working': 'coSpace',
}

function dailyPick(pool: FeaturedCard[]): FeaturedCard[] {
  return dailyShuffle(pool, c => c.slug).slice(0, SHOW)
}

/**
 * Fair Rotation, per visitor per day.
 *
 * Each visitor gets their own order of every live listing, which holds all day
 * and turns over the next. Across all visitors every listing gets the same
 * share of the eight slots, which is what owners pay for; a visitor who comes
 * back the same afternoon finds the cards where they left them.
 *
 * The server's HTML carries the eight newest (crawlers follow those links). They
 * are hidden behind card-shaped placeholders until this has picked the
 * visitor's eight, so the swap does not show as cards jumping.
 */
export default function FeaturedGrid({ pool, locale }: { pool: FeaturedCard[]; locale: Locale }) {
  const t = SITE_T[locale]
  const [picked, setPicked] = useState<FeaturedCard[] | null>(null)

  useEffect(() => { setPicked(dailyPick(pool)) }, [pool])

  const displayed = picked ?? pool.slice(0, SHOW)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '40px 24px' }}
      className={picked ? undefined : 'sm-feat-pending'}>
      {displayed.map(p => (
        <Link key={p.slug} href={locale === 'en' ? `/en/property/${p.slug}` : `/property/${p.slug}`} className="sm-card"
          style={{ display: 'flex', flexDirection: 'column', gap: 12, color: C.ink, textDecoration: 'none' }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', borderRadius: RADIUS, overflow: 'hidden', background: C.line }}>
            {p.image && (
              <Image src={p.image} alt={p.title} fill
                sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw"
                style={{ objectFit: 'cover' }} />
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.muted }}>
              <span aria-hidden="true" style={{ width: 14, height: 4, borderRadius: 2, background: p.lineColor, flexShrink: 0 }} />
              <span>{p.place}</span>
            </div>
            <div className="sm-card-title" style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.45 }}>{p.title}</div>
            <div style={{ fontSize: 13, color: C.muted }}>{t[TYPE_KEYS[p.propertyType]] ?? p.propertyType}</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: C.amber, fontVariantNumeric: 'tabular-nums' }}>
              {p.price}<span style={{ fontSize: 13, fontWeight: 400, color: C.muted }}>{p.priceSuffix ? ` ${p.priceSuffix}` : ''}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
