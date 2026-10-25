'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from '@/components/ui/LocaleLink'
import { SITE_T, type Locale } from '@/lib/site-i18n'
import { localeHref } from '@/lib/routes-i18n'
import { C, RADIUS } from '@/lib/ui'

/**
 * The search composer: one wide input, then type chips, a price choice and the
 * button on a second row. Redesign approved 25 Oct 2026.
 *
 * Type keys are the database's property_type values, and prices go out as
 * price_min / price_max, which is what /search reads.
 */
export default function HeroSection({ locale = 'th' }: { locale?: Locale }) {
  const t = SITE_T[locale]
  const TYPES = [
    { key: '',          label: t.heroAllTypes },
    { key: 'condo',     label: t.condoShort },
    { key: 'apartment', label: t.apartment },
    { key: 'house',     label: t.house },
    { key: 'office',    label: t.office },
    { key: 'coworking', label: t.cowork },
  ]
  const PRICE_RANGES = [
    { label: t.anyPrice,    value: '' },
    { label: t.priceUnder,  value: '0-5000' },
    { label: t.price5to15,  value: '5000-15000' },
    { label: t.price15to30, value: '15000-30000' },
    { label: t.price30to60, value: '30000-60000' },
    { label: t.priceOver60, value: '60000-' },
  ]
  const router = useRouter()
  const [keyword, setKeyword] = useState('')
  const [type, setType] = useState('')
  const [priceRange, setPriceRange] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set('q', keyword.trim())
    if (type) params.set('type', type)
    if (priceRange) {
      const [min, max] = priceRange.split('-')
      if (min && min !== '0') params.set('price_min', min)
      if (max) params.set('price_max', max)
    }
    const qs = params.toString()
    router.push(localeHref('/search', locale) + (qs ? `?${qs}` : ''))
  }

  const chip = (on: boolean): React.CSSProperties => ({
    border: `1px solid ${on ? C.green : C.border}`, background: on ? C.green : C.white,
    color: on ? C.white : C.ink, borderRadius: RADIUS, padding: '6px 12px',
    font: 'inherit', fontSize: 14, cursor: 'pointer',
  })

  return (
    <section style={{ padding: '88px 24px 64px' }} className="sm-hero">
      <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.35, fontWeight: 600, color: C.green }} className="sm-hero-h1">
          {t.heroTitle}
        </h1>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.65, color: C.muted }}>
          {t.heroSub}<br className="sm-hide-mobile" />
          <span style={{ fontSize: 15 }}> {t.heroSubMeta}</span>
        </p>

        <form onSubmit={handleSearch} role="search"
          style={{ width: '100%', marginTop: 14, background: C.white, border: `1px solid ${C.border}`, borderRadius: 18, boxShadow: '0 2px 6px rgba(35,31,32,0.05)', textAlign: 'left' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 22px 14px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)}
              placeholder={t.heroAreaPlaceholder} aria-label={t.heroAreaPlaceholder}
              style={{ border: 0, outline: 'none', font: 'inherit', fontSize: 19, width: '100%', background: 'transparent', color: C.ink }} />
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, padding: '10px 12px 12px 18px', borderTop: '1px solid #f0ede6' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flex: '1 1 300px', minWidth: 0 }} role="group" aria-label={t.heroAllTypes}>
              {TYPES.map(o => (
                <button key={o.key} type="button" aria-pressed={type === o.key} onClick={() => setType(o.key)} style={chip(type === o.key)}>
                  {o.label}
                </button>
              ))}
            </div>
            <select value={priceRange} onChange={e => setPriceRange(e.target.value)} aria-label={t.heroPriceLabel}
              style={{ border: `1px solid ${C.border}`, background: C.white, font: 'inherit', fontSize: 14, color: C.ink, padding: '9px 12px', borderRadius: 10, cursor: 'pointer', width: 124, flex: '0 0 auto' }}>
              {PRICE_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <button type="submit" className="sm-btn-primary"
              style={{ background: C.teal, color: C.white, border: 0, borderRadius: 10, padding: '10px 24px', font: 'inherit', fontWeight: 500, fontSize: 15, cursor: 'pointer', flex: '0 0 auto' }}>
              {t.heroSearch}
            </button>
          </div>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 8, fontSize: 14 }}>
          <span style={{ color: C.muted }}>{t.heroTry}</span>
          {t.heroTryChips.map(c => (
            <Link key={c.label} href={c.href} className="sm-chip-link"
              style={{ border: `1px solid ${C.border}`, borderRadius: RADIUS, padding: '5px 12px', color: C.ink, background: C.white, textDecoration: 'none' }}>
              {c.label}
            </Link>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .sm-hero { padding: 48px 16px 40px !important; }
          .sm-hero-h1 { font-size: 30px !important; }
          .sm-hide-mobile { display: none; }
        }
      `}</style>
    </section>
  )
}
