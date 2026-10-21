'use client'

import { useState } from 'react'
// Link here is LocaleLink: it keeps the reader in the language they are already
// reading, so an href written as a Thai path resolves to its English
// counterpart on /en/* pages. An href with no English page passes through
// unchanged. The list of which is in lib/routes-i18n, deliberately not
// repeated here — it was copied into 16 files and went stale in all of them
// the moment /manage and /blog got English pages. See
// components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import { faqCategories, type FAQ } from '@/lib/faq-data'
import { FAQ_T, type Locale } from '@/lib/faq-i18n'



// ─── Single accordion item ─────────────────────────────────────────────────────
function FAQItem({ faq, isOpen, onToggle }: { faq: FAQ; isOpen: boolean; onToggle: () => void }) {
  return (
    <div style={{ borderBottom: '1px solid #eef0ef' }}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: '100%', textAlign: 'left', background: 'none', border: 'none',
          padding: '18px 24px', cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: '#231f20', lineHeight: 1.5, flex: 1 }}>
          {faq.q}
        </span>
        <span style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 1,
          background: isOpen ? '#02402e' : '#f0f7f4',
          color: isOpen ? '#fff' : '#02402e',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, lineHeight: 1, transition: 'all .2s',
        }}>
          {isOpen ? '−' : '+'}
        </span>
      </button>
      {isOpen && (
        <div style={{ padding: '0 60px 20px 24px' }}>
          <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.85, margin: 0, fontWeight: 300, whiteSpace: 'pre-line' }}>
            {faq.a}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Main client component ─────────────────────────────────────────────────────
export default function FAQAccordion({ locale = 'th' }: { locale?: Locale }) {
  const t = FAQ_T[locale]
  const CATEGORIES = faqCategories(locale)

  const [openMap, setOpenMap] = useState<Record<string, boolean>>({})
  function toggle(key: string) {
    setOpenMap(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#02402e,#048c73)', padding: '56px 24px 64px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{t.breadcrumbHome}</Link>
            <span>/</span>
            <span style={{ color: '#fff' }}>{t.breadcrumbHere}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 700, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.4px', lineHeight: 1.15 }}>
            {t.heading}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 16, margin: '0 0 32px', fontWeight: 300, lineHeight: 1.75 }}>
            {t.subA}
            {' '}{t.subB}
          </p>
          {/* Category jump links */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {CATEGORIES.map(c => (
              <a key={c.id} href={`#${c.id}`} style={{
                background: 'rgba(255,255,255,0.13)', color: '#fff',
                fontSize: 13, fontWeight: 500, padding: '8px 18px', borderRadius: 20,
                textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)',
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
                <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{c.icon}</span>{c.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ content */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '56px 24px 80px' }}>
        {CATEGORIES.map((cat, ci) => (
          <div key={cat.id} id={cat.id} style={{ marginBottom: ci < CATEGORIES.length - 1 ? 52 : 0, scrollMarginTop: 80 }}>

            {/* Category heading */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <span style={{
                width: 46, height: 46, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(140deg,#02402e,#048c73)', flexShrink: 0,
              }}>
                <span className="msym" style={{ fontSize: 22, color: '#fff', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{cat.icon}</span>
              </span>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#02402e', margin: '0 0 2px', letterSpacing: '-0.2px' }}>
                  {cat.title}
                </h2>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, fontWeight: 300 }}>{cat.subtitle}</p>
              </div>
            </div>

            {/* Accordion */}
            <div style={{
              background: '#fff', border: '1px solid #eef0ef', borderRadius: 18,
              overflow: 'hidden', boxShadow: '0 4px 18px -8px rgba(2,64,46,0.07)',
            }}>
              {cat.faqs.map((faq, i) => {
                const key = `${cat.id}-${i}`
                return (
                  <FAQItem key={key} faq={faq} isOpen={!!openMap[key]} onToggle={() => toggle(key)} />
                )
              })}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div style={{
          marginTop: 64,
          background: 'linear-gradient(135deg,#02402e,#048c73)',
          borderRadius: 24, padding: '40px 36px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 24, flexWrap: 'wrap',
        }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.2px' }}>
              {t.moreHeading}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.68)', fontSize: 14, margin: 0, fontWeight: 300 }}>
              {t.moreBody}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/contact" style={{
              background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 14,
              padding: '13px 26px', borderRadius: 24, textDecoration: 'none',
              whiteSpace: 'nowrap', boxShadow: '0 6px 18px -6px rgba(217,127,17,0.55)',
            }}>
              {t.moreCta1}
            </Link>
            <Link href="/manage" style={{
              background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 600, fontSize: 14,
              padding: '13px 26px', borderRadius: 24, textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.25)', whiteSpace: 'nowrap',
            }}>
              {t.moreCta2}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
