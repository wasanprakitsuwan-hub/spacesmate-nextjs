'use client'

import Link from 'next/link'
import { useState } from 'react'
import { BLOG_T, CATEGORY_VALUES, categoryLabel, formatBlogDate } from '@/lib/blog-i18n'
import { cleanPostTitle } from '@/lib/blog-text'
import type { Locale } from '@/lib/routes-i18n'
import { C, RADIUS } from '@/lib/ui'

export type BlogCard = {
  slug: string; title: string; category: string | null; thumbnail: string | null
  thumbnail_alt: string | null; meta_desc: string | null; published_at: string | null
}

/**
 * The blog index cards: 3 columns with images, the newest post wide on top,
 * and category chips that filter. Only categories that have posts get a chip.
 * Article links are plain /blog/<slug> (no English article route yet).
 */
export default function BlogGrid({ posts, locale }: { posts: BlogCard[]; locale: Locale }) {
  const t = BLOG_T[locale]
  const [cat, setCat] = useState('')
  const present = new Set(posts.map(p => p.category ?? ''))
  const known = CATEGORY_VALUES.filter(v => v && present.has(v)) as string[]
  const extra = Array.from(present).filter(v => v && !known.includes(v))
  const chips = ['', ...known, ...extra]
  const shown = cat ? posts.filter(p => p.category === cat) : posts
  const [first, ...rest] = shown

  const meta = (p: BlogCard) => [p.category ? categoryLabel(p.category, locale) : '', p.published_at ? formatBlogDate(p.published_at, locale) : ''].filter(Boolean).join(' · ')

  return (
    <>
      {chips.length > 2 && (
        <div role="toolbar" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
          {chips.map(v => {
            const on = cat === v
            return (
              <button key={v || 'all'} type="button" aria-pressed={on} onClick={() => setCat(v)} className="sm-chip-link"
                style={{ padding: '6px 14px', borderRadius: 999, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                  border: `1px solid ${on ? C.green : C.border}`, background: on ? C.green : C.white, color: on ? C.white : C.ink }}>
                {categoryLabel(v, locale)}
              </button>
            )
          })}
        </div>
      )}

      {first && (
        <Link href={`/blog/${first.slug}`} className="sm-card sm-bl-feat" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS, overflow: 'hidden', textDecoration: 'none', marginBottom: 24 }}>
          <div style={{ aspectRatio: '16 / 9', background: C.line2 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={first.thumbnail ?? '/blog/placeholder.jpg'} alt={first.thumbnail_alt ?? cleanPostTitle(first.title)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ margin: '0 0 8px', fontSize: 13.5, color: C.muted }}>{meta(first)}</p>
            <h2 className="sm-card-title" style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 600, color: C.green, lineHeight: 1.4 }}>{cleanPostTitle(first.title)}</h2>
            {first.meta_desc && <p style={{ margin: '0 0 14px', fontSize: 15, color: C.ink, lineHeight: 1.65 }}>{first.meta_desc}</p>}
            <span style={{ fontSize: 14.5, color: C.teal }}>{t.readMore}</span>
          </div>
        </Link>
      )}

      {rest.length > 0 && (
        <div className="sm-bl-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 24 }}>
          {rest.map(p => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="sm-card" style={{ display: 'block', background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS, overflow: 'hidden', textDecoration: 'none' }}>
              <div style={{ aspectRatio: '16 / 10', background: C.line2 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumbnail ?? '/blog/placeholder.jpg'} alt={p.thumbnail_alt ?? cleanPostTitle(p.title)} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ padding: '14px 16px 18px' }}>
                <p style={{ margin: '0 0 6px', fontSize: 13, color: C.muted }}>{meta(p)}</p>
                <h2 className="sm-card-title" style={{ margin: '0 0 6px', fontSize: 16.5, fontWeight: 600, color: C.green, lineHeight: 1.45 }}>{cleanPostTitle(p.title)}</h2>
                {p.meta_desc && <p style={{ margin: 0, fontSize: 14, color: C.muted, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.meta_desc}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 960px) { .sm-bl-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }
        @media (max-width: 640px) { .sm-bl-grid { grid-template-columns: minmax(0, 1fr) !important; } .sm-bl-feat { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  )
}
