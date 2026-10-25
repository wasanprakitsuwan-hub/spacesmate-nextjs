import LocaleLink from '@/components/ui/LocaleLink'
import { FaqLd } from '@/components/seo/JsonLd'
import { GUIDE_UI, type Guide, type GuideLocale } from '@/lib/guide-content'
import { C, RADIUS, WRAP, btnStyle, h2Style } from '@/lib/ui'

/**
 * /guide and /en/guide. Server-rendered so the steps and the FAQ are in the
 * HTML search and answer engines fetch. A step's screenshot shows only once one
 * is uploaded from the dashboard; there are no public placeholders.
 */
export default function GuideBody({ guide, locale }: { guide: Guide; locale: GuideLocale }) {
  const t = GUIDE_UI[locale]
  return (
    <div style={{ background: C.paper, padding: '28px 16px 72px' }}>
      <FaqLd qa={guide.faq} />
      <style>{`
        .sm-gd-grid { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 40px; align-items: start; }
        .sm-gd-toc { position: sticky; top: 88px; }
        .sm-gd-toc a:hover { color: ${C.teal}; }
        @media (max-width: 900px) { .sm-gd-grid { grid-template-columns: minmax(0, 1fr); } .sm-gd-toc { display: none; } }
      `}</style>
      <div style={{ maxWidth: WRAP, margin: '0 auto' }}>
        <nav aria-label="breadcrumb" style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>
          <LocaleLink href="/" style={{ color: C.teal, textDecoration: 'none' }}>{t.home}</LocaleLink>
          <span style={{ margin: '0 6px', color: C.faint }}>/</span>{t.crumb}
        </nav>

        <div className="sm-gd-grid">
          <aside className="sm-gd-toc">
            <p style={{ fontSize: 13, fontWeight: 600, color: C.muted, margin: '0 0 10px' }}>{t.toc}</p>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 2 }}>
              {guide.steps.map((s, i) => (
                <li key={i}><a href={`#step-${i + 1}`} style={{ display: 'block', padding: '6px 0', fontSize: 14, color: C.ink, textDecoration: 'none', lineHeight: 1.45 }}>{i + 1}. {s.title}</a></li>
              ))}
              {guide.faq.length > 0 && <li><a href="#faq" style={{ display: 'block', padding: '6px 0', fontSize: 14, color: C.ink, textDecoration: 'none' }}>{t.faqLink}</a></li>}
            </ol>
            <div style={{ marginTop: 20, padding: 16, background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS }}>
              <p style={{ margin: '0 0 10px', fontSize: 13.5, color: C.ink, lineHeight: 1.55 }}>{t.ctaBody}</p>
              <LocaleLink href="/list-your-property/new" className="sm-btn-primary" style={{ ...btnStyle('primary'), width: '100%', boxSizing: 'border-box', fontSize: 14 }}>{t.cta}</LocaleLink>
            </div>
          </aside>

          <main style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 'clamp(26px, 3.4vw, 34px)', fontWeight: 600, color: C.green, margin: '0 0 8px', lineHeight: 1.3 }}>{guide.title}</h1>
            <p style={{ fontSize: 16, color: C.muted, margin: '0 0 28px' }}>{guide.intro}</p>

            {guide.steps.map((s, i) => (
              <section key={i} id={`step-${i + 1}`} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS, padding: '22px 24px', marginBottom: 16, scrollMarginTop: 88 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: C.teal }}>{t.step(i + 1)}</p>
                <h2 style={{ ...h2Style(21), margin: '2px 0 14px' }}>{s.title}</h2>
                <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
                  {s.items.map((it, j) => (
                    <li key={j} style={{ display: 'flex', gap: 12 }}>
                      <span style={{ flexShrink: 0, minWidth: 30, fontSize: 13.5, fontWeight: 600, color: C.green, paddingTop: 1 }}>{i + 1}.{j + 1}</span>
                      <span>
                        <span style={{ display: 'block', fontSize: 15.5, color: C.ink, lineHeight: 1.6 }}>{it.text}</span>
                        {it.note && <span style={{ display: 'block', fontSize: 13.5, color: C.muted, marginTop: 2, lineHeight: 1.55 }}>{it.note}</span>}
                      </span>
                    </li>
                  ))}
                </ol>
                {s.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image} alt={s.title} loading="lazy" style={{ display: 'block', width: '100%', marginTop: 18, borderRadius: RADIUS, border: `1px solid ${C.line}` }} />
                )}
              </section>
            ))}

            {guide.faq.length > 0 && (
              <section id="faq" style={{ marginTop: 32, scrollMarginTop: 88 }}>
                <h2 style={{ ...h2Style(22), margin: '0 0 12px' }}>{t.faqTitle}</h2>
                <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS }}>
                  {guide.faq.map((f, i) => (
                    <details key={i} style={{ borderTop: i ? `1px solid ${C.line2}` : 'none', padding: '14px 18px' }}>
                      <summary style={{ cursor: 'pointer', fontSize: 15.5, fontWeight: 500, color: C.green }}>{f.q}</summary>
                      <p style={{ margin: '8px 0 0', fontSize: 15, color: C.ink, lineHeight: 1.65 }}>{f.a}</p>
                    </details>
                  ))}
                </div>
                <LocaleLink href="/faq" style={{ display: 'inline-block', marginTop: 12, fontSize: 14.5, color: C.teal, textDecoration: 'none' }}>{t.allFaq}</LocaleLink>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
