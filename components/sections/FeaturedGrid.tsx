'use client'

import { useEffect, useState } from 'react'
import Link from '@/components/ui/LocaleLink'
import Image from 'next/image'
import type { Property } from '@/lib/property-data'
import { SITE_T, type Locale } from '@/lib/site-i18n'

export type FeaturedCard = Pick<Property,
  'slug' | 'title' | 'priceDisplay' | 'bedrooms' | 'bathrooms' | 'size' |
  'neighborhood' | 'image' | 'propertyType'>

const SHOW = 6
const VISITOR_KEY = 'sm_rotation_id'

const TYPE_KEYS: Record<string, 'apartment' | 'condoShort' | 'office' | 'coSpace'> = {
  Apartment: 'apartment', Condo: 'condoShort', Office: 'office', 'Co-Working': 'coSpace',
}
const GRADS: Record<string, string> = {
  Apartment: 'linear-gradient(135deg,#02402e,#036b56)',
  Condo:     'linear-gradient(135deg,#036b56,#048c73)',
  Office:    'linear-gradient(135deg,#4a1d1d,#8b3a3a)',
  default:   'linear-gradient(135deg,#02402e,#048c73)',
}

/**
 * A random id for this browser, used only to seed the rotation below. It never
 * leaves the browser: nothing reads it but this file. Where storage is blocked
 * (private mode, cleared data) every visit simply gets a fresh order.
 */
function visitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36)
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return Math.random().toString(36).slice(2)
  }
}

/** Today in Bangkok, so the order turns over at local midnight, not UTC's. */
function bangkokDay(): string {
  return new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10)
}

// FNV-1a, then mulberry32: small, fast, and the same sequence for the same seed.
function seedFrom(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) }
  return h >>> 0
}
function rng(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function dailyPick(pool: FeaturedCard[]): FeaturedCard[] {
  const rand = rng(seedFrom(`${visitorId()}:${bangkokDay()}`))
  const a = [...pool]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, SHOW)
}

/**
 * Fair Rotation, per visitor per day.
 *
 * Each visitor gets their own order of every live listing, which holds all day
 * and turns over the next. Across all visitors every listing gets the same
 * share of the six slots, which is what owners pay for; a visitor who comes
 * back the same afternoon finds the cards where they left them.
 *
 * The server's HTML carries the six newest (crawlers follow those links). They
 * are hidden behind card-shaped placeholders until this has picked the
 * visitor's six, so the swap does not show as cards jumping.
 */
export default function FeaturedGrid({ pool, locale }: { pool: FeaturedCard[]; locale: Locale }) {
  const t = SITE_T[locale]
  const [picked, setPicked] = useState<FeaturedCard[] | null>(null)

  useEffect(() => { setPicked(dailyPick(pool)) }, [pool])

  const displayed = picked ?? pool.slice(0, SHOW)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}
      className={picked ? 'sm-feat-grid' : 'sm-feat-grid sm-feat-pending'}>
      {displayed.map((p) => {
        const bedroomLabel = p.bedrooms === 0 ? t.studio : t.bedroomsValue(p.bedrooms)
        const grad = GRADS[p.propertyType] || GRADS.default
        return (
          <Link key={p.slug} href={locale === 'en' ? `/en/property/${p.slug}` : `/property/${p.slug}`} className="sm-feat-card"
            style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', display: 'block', textDecoration: 'none', transition: 'all .25s', boxShadow: '0 6px 20px -10px rgba(2,64,46,0.10)' }}>
            {/* Image */}
            <div style={{ height: 185, background: grad, position: 'relative', overflow: 'hidden' }}>
              {p.image && (
                <Image src={p.image} alt={p.title} fill
                  sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                  className="sm-feat-img"
                  style={{ objectFit: 'cover', transition: 'transform .3s' }} />
              )}
              <span style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.9)', background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(4px)', padding: '3px 9px', borderRadius: 6 }}>
                {t[TYPE_KEYS[p.propertyType]] ?? p.propertyType}
              </span>
            </div>
            {/* Content */}
            <div style={{ padding: 16 }}>
              <p style={{ color: '#048c73', fontSize: 12, margin: '0 0 4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
                <span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>location_on</span>{p.neighborhood}
              </p>
              <h3 style={{ fontSize: 14.5, fontWeight: 600, margin: '0 0 10px', lineHeight: 1.35, color: '#231f20', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} className="sm-feat-title">
                {p.title}
              </h3>
              <div style={{ display: 'flex', gap: 10, borderTop: '1px solid #f3f5f4', paddingTop: 10, marginBottom: 10, fontSize: 11, color: '#7a8a85' }}>
                <span>{bedroomLabel}</span>
                {p.bathrooms > 0 && <span>{t.bathroomsValue(p.bathrooms)}</span>}
                {p.size && <span>{t.sqm(p.size)}</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#d97f11' }}>{p.priceDisplay}</span>
                <span style={{ color: '#048c73', fontSize: 12.5, fontWeight: 600 }}>{t.viewDetail}</span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
