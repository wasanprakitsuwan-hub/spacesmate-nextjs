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
import { C, RADIUS, WRAP, btnStyle, h2Style } from '@/lib/ui'



// ─── Single accordion item ─────────────────────────────────────────────────────
function FAQItem({ faq, isOpen, onToggle, first }: { faq: FAQ; isOpen: boolean; onToggle: () => void; first: boolean }) {
  return (
    <div style={{ borderTop: first ? 'none' : `1px solid ${C.line2}` }}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: '100%', textAlign: 'left', background: 'none', border: 'none',
          padding: '16px 20px', cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
        }}
      >
        <span style={{ fontSize: 15.5, fontWeight: 500, color: C.green, lineHeight: 1.5, flex: 1 }}>{faq.q}</span>
        <span aria-hidden style={{ fontSize: 20, lineHeight: 1.1, color: C.muted, flexShrink: 0 }}>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <p style={{ fontSize: 15, color: C.ink, lineHeight: 1.75, margin: 0, padding: '0 48px 18px 20px', whiteSpace: 'pre-line' }}>{faq.a}</p>
      )}
    </div>
  )
}

// ─── Main client component ─────────────────────────────────────────────────────
export default function FAQAccordion({ locale = 'th' }: { locale?: Locale }) {
  const t = FAQ_T[locale]
  const CATEGORIES = faqCategories(locale)

  // The first answer of each topic starts open, as in the approved mockup.
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(
    () => Object.fromEntries(CATEGORIES.map(c => [`${c.id}-0`, true])),
  )
  function toggle(key: string) {
    setOpenMap(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div style={{ background: C.paper, padding: '28px 16px 72px' }}>
      <style>{`
        .sm-faq-grid { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 40px; align-items: start; }
        .sm-faq-nav { position: sticky; top: 88px; }
        .sm-faq-nav a:hover { color: ${C.teal}; }
        @media (max-width: 900px) { .sm-faq-grid { grid-template-columns: minmax(0, 1fr); gap: 20px; } .sm-faq-nav { position: static; } .sm-faq-nav ol { display: flex !important; flex-wrap: wrap; gap: 6px 14px !important; } }
      `}</style>
      <div style={{ maxWidth: WRAP, margin: '0 auto' }}>
        <nav aria-label="breadcrumb" style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>
          <Link href="/" style={{ color: C.teal, textDecoration: 'none' }}>{t.breadcrumbHome}</Link>
          <span style={{ margin: '0 6px', color: C.faint }}>/</span>{t.breadcrumbHere}
        </nav>
        <h1 style={{ fontSize: 'clamp(26px, 3.4vw, 34px)', fontWeight: 600, color: C.green, margin: '0 0 8px' }}>{t.heading}</h1>
        <p style={{ fontSize: 16, color: C.muted, margin: '0 0 28px', lineHeight: 1.65 }}>
          {t.subA} {t.subB} · <Link href="/guide" style={{ color: C.teal, textDecoration: 'none' }}>{t.guideLink}</Link>
        </p>

        <div className="sm-faq-grid">
          <aside className="sm-faq-nav">
            <p style={{ fontSize: 13, fontWeight: 600, color: C.muted, margin: '0 0 8px' }}>{t.categories}</p>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 2 }}>
              {CATEGORIES.map(c => (
                <li key={c.id}>
                  <a href={`#${c.id}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '6px 0', fontSize: 14.5, color: C.ink, textDecoration: 'none' }}>
                    <span>{c.title}</span><span style={{ color: C.faint }}>{c.faqs.length}</span>
                  </a>
                </li>
              ))}
            </ol>
          </aside>

          <div style={{ minWidth: 0 }}>
            {CATEGORIES.map(cat => (
              <section key={cat.id} id={cat.id} style={{ marginBottom: 32, scrollMarginTop: 88 }}>
                <h2 style={{ ...h2Style(20), margin: '0 0 4px' }}>{cat.title}</h2>
                {cat.subtitle && <p style={{ fontSize: 14, color: C.muted, margin: '0 0 12px' }}>{cat.subtitle}</p>}
                <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS }}>
                  {cat.faqs.map((faq, i) => {
                    const key = `${cat.id}-${i}`
                    return <FAQItem key={key} faq={faq} first={i === 0} isOpen={!!openMap[key]} onToggle={() => toggle(key)} />
                  })}
                </div>
              </section>
            ))}

            <div style={{ marginTop: 40, background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS, padding: '24px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: C.green, margin: '0 0 4px' }}>{t.moreHeading}</h3>
                <p style={{ color: C.muted, fontSize: 14.5, margin: 0 }}>{t.moreBody}</p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href="/contact" className="sm-btn-primary" style={btnStyle('primary')}>{t.moreCta1}</Link>
                <Link href="/manage" className="sm-btn-ghost" style={btnStyle('ghost')}>{t.moreCta2}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
