import Link from 'next/link'
import { BreadcrumbLd, FaqLd } from '@/components/seo/JsonLd'
import RentSnapshot from '@/components/guide/RentSnapshot'
import { OWNER_GUIDE_UI as t, OWNER_GUIDES, ownerGuidePath, thaiDate, type OwnerGuide } from '@/lib/owner-guides'
import { C, RADIUS, WRAP, btnStyle, h2Style } from '@/lib/ui'

const SITE = 'https://spacesmate.com'

/**
 * One owner guide at /guide/<slug>. Server-rendered so the summary, sections and
 * FAQ are in the HTML answer engines fetch, with Article, HowTo (for step
 * guides), FAQPage and BreadcrumbList markup. Content: lib/owner-guides.
 */
export default function OwnerGuideBody({ guide }: { guide: OwnerGuide }) {
  const url = `${SITE}${encodeURI(ownerGuidePath(guide))}`
  const related = OWNER_GUIDES.filter(g => g.slug !== guide.slug).slice(0, 3)

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.metaTitle,
    description: guide.metaDesc,
    inLanguage: 'th',
    dateModified: guide.reviewed,
    author: { '@type': 'Organization', name: 'SpacesMate', url: SITE },
    publisher: { '@type': 'Organization', name: 'SpacesMate', url: SITE, logo: { '@type': 'ImageObject', url: `${SITE}/logo.png` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: [`${SITE}/og-image.jpg`],
  }
  const howTo = guide.isHowTo ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: guide.title,
    description: guide.summary,
    inLanguage: 'th',
    step: guide.sections.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.answer,
      url: `${url}#${s.id}`,
    })),
  } : null

  return (
    <div style={{ background: C.paper, padding: '28px 16px 72px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article).replace(/</g, '\\u003c') }} />
      {howTo && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo).replace(/</g, '\\u003c') }} />}
      <FaqLd qa={guide.faq.map(f => ({ q: f.q, a: f.a }))} />
      <BreadcrumbLd trail={[
        { name: 'SpacesMate', url: `${SITE}/` },
        { name: t.hub, url: `${SITE}/guide` },
        { name: guide.cardTitle, url },
      ]} />
      <style>{`
        .sm-og-grid { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 40px; align-items: start; }
        .sm-og-toc { position: sticky; top: 88px; }
        .sm-og-toc a:hover { color: ${C.teal}; }
        .sm-og-facts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        .sm-og-related { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        @media (max-width: 900px) {
          .sm-og-grid { grid-template-columns: minmax(0, 1fr); }
          .sm-og-toc { display: none; }
          .sm-og-facts, .sm-og-related { grid-template-columns: minmax(0, 1fr); }
        }
      `}</style>
      <div style={{ maxWidth: WRAP, margin: '0 auto' }}>
        <nav aria-label="breadcrumb" style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
          <Link href="/" style={{ color: C.teal, textDecoration: 'none' }}>{t.home}</Link>
          <span style={{ margin: '0 6px', color: C.faint }}>/</span>
          <Link href="/guide" style={{ color: C.teal, textDecoration: 'none' }}>{t.hub}</Link>
          <span style={{ margin: '0 6px', color: C.faint }}>/</span>{guide.cardTitle}
        </nav>

        <div className="sm-og-grid">
          <aside className="sm-og-toc">
            <p style={{ fontSize: 13, fontWeight: 600, color: C.muted, margin: '0 0 10px' }}>{t.toc}</p>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 2 }}>
              <li><a href="#summary" style={tocLink}>{t.summary}</a></li>
              {guide.sections.map((s, i) => (
                <li key={s.id}><a href={`#${s.id}`} style={tocLink}>{guide.isHowTo ? `${i + 1}. ` : ''}{s.title}</a></li>
              ))}
              <li><a href="#faq" style={tocLink}>{t.faqTitle}</a></li>
            </ol>
            <div style={{ marginTop: 20, padding: 16, background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS }}>
              <p style={{ margin: '0 0 10px', fontSize: 13.5, color: C.ink, lineHeight: 1.55 }}>{t.sideCtaBody}</p>
              <Link href="/list-your-property" className="sm-btn-primary" style={{ ...btnStyle('primary'), width: '100%', boxSizing: 'border-box', fontSize: 14 }}>{t.ctaList}</Link>
            </div>
          </aside>

          <article style={{ minWidth: 0 }}>
            <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 500, color: C.teal }}>{t.kicker}</p>
            <h1 style={{ fontSize: 'clamp(26px, 3.4vw, 34px)', fontWeight: 600, color: C.green, margin: '0 0 10px', lineHeight: 1.3 }}>{guide.title}</h1>
            <p style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', fontSize: 13.5, color: C.muted, margin: '0 0 24px' }}>
              <span>{t.byline}</span>
              <span>{t.reviewed(thaiDate(guide.reviewed))}</span>
              <span>{t.readTime(guide.readMinutes)}</span>
            </p>

            <section id="summary" aria-label={t.summary} style={{ background: C.tint, border: '1px solid #cfe5dc', borderRadius: RADIUS, padding: '20px 22px', marginBottom: 16, scrollMarginTop: 88 }}>
              <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 600, color: C.green }}>{t.summary}</p>
              <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.75, color: C.ink }}>{guide.summary}</p>
            </section>

            {guide.keyFacts && guide.keyFacts.length > 0 && (
              <section style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS, padding: '18px 22px', marginBottom: 32 }}>
                {guide.keyFactsNote && <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: C.muted }}>{guide.keyFactsNote}</p>}
                <div className="sm-og-facts">
                  {guide.keyFacts.map(f => (
                    <div key={f.value}>
                      <p style={{ margin: 0, fontSize: 28, fontWeight: 600, color: C.green }}>{f.value}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 14, color: C.muted, lineHeight: 1.5 }}>{f.label}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {guide.sections.map((s, i) => (
              <section key={s.id} id={s.id} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS, padding: '22px 24px', marginBottom: 16, scrollMarginTop: 88 }}>
                {guide.isHowTo && <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: C.teal }}>{t.step(i + 1)}</p>}
                <h2 style={{ ...h2Style(21), margin: '2px 0 10px' }}>{s.title}</h2>
                <p style={{ margin: '0 0 14px', fontSize: 16, lineHeight: 1.75, color: C.ink }}>{s.answer}</p>
                {s.items && s.items.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: 22, display: 'grid', gap: 8, fontSize: 15.5, lineHeight: 1.65, color: C.ink }}>
                    {s.items.map(it => <li key={it}>{it}</li>)}
                  </ul>
                )}
                {s.widget === 'rent-snapshot' && <RentSnapshot />}
                {s.links && s.links.length > 0 && (
                  <p style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', margin: '14px 0 0', fontSize: 14.5 }}>
                    {s.links.map(l => <Link key={l.href} href={l.href} style={{ color: C.teal, textDecoration: 'none' }}>{l.label} →</Link>)}
                  </p>
                )}
              </section>
            ))}

            <section style={{ background: C.green, color: C.white, borderRadius: RADIUS, padding: '26px 28px', margin: '32px 0' }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 600, lineHeight: 1.35, color: C.white }}>{t.ctaTitle}</h2>
              <p style={{ margin: '0 0 18px', fontSize: 15.5, lineHeight: 1.7, color: '#d7e6df' }}>{t.ctaBody}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <Link href="/list-your-property" style={btnStyle('light')}>{t.ctaList}</Link>
                <Link href="/manage" style={{ ...btnStyle('ghost'), background: 'transparent', color: C.white, borderColor: '#8fb5a7' }}>{t.ctaManage}</Link>
              </div>
            </section>

            <section id="faq" style={{ marginBottom: 32, scrollMarginTop: 88 }}>
              <h2 style={{ ...h2Style(22), margin: '0 0 12px' }}>{t.faqTitle}</h2>
              <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS }}>
                {guide.faq.map((f, i) => (
                  <details key={f.q} open={i === 0} style={{ borderTop: i ? `1px solid ${C.line2}` : 'none', padding: '14px 18px' }}>
                    <summary style={{ cursor: 'pointer', fontSize: 15.5, fontWeight: 500, color: C.green }}>{f.q}</summary>
                    <p style={{ margin: '8px 0 0', fontSize: 15, color: C.ink, lineHeight: 1.7 }}>{f.a}</p>
                    {f.link && <Link href={f.link.href} style={{ display: 'inline-block', marginTop: 6, fontSize: 14, color: C.teal, textDecoration: 'none' }}>{f.link.label} →</Link>}
                  </details>
                ))}
              </div>
              <Link href="/faq" style={{ display: 'inline-block', marginTop: 12, fontSize: 14.5, color: C.teal, textDecoration: 'none' }}>{t.faqMore} →</Link>
            </section>

            {guide.sources && guide.sources.length > 0 && (
              <section style={{ marginBottom: 32 }}>
                <h2 style={{ ...h2Style(17), margin: '0 0 8px' }}>{t.sources}</h2>
                <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 6, fontSize: 14, lineHeight: 1.6, color: C.muted }}>
                  {guide.sources.map(s => (
                    <li key={s.href}><a href={s.href} target="_blank" rel="noopener noreferrer" style={{ color: C.teal, textDecoration: 'none' }}>{s.label}</a></li>
                  ))}
                </ul>
              </section>
            )}

            {related.length > 0 && (
              <section>
                <h2 style={{ ...h2Style(19), margin: '0 0 12px' }}>{t.hub}</h2>
                <div className="sm-og-related">
                  {related.map(g => (
                    <Link key={g.slug} href={ownerGuidePath(g)} style={{ display: 'block', background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS, padding: 16, color: C.ink, textDecoration: 'none' }}>
                      <span style={{ display: 'block', fontSize: 12.5, color: C.teal, marginBottom: 4 }}>{g.topic}</span>
                      <span style={{ fontWeight: 500, lineHeight: 1.5 }}>{g.cardTitle}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      </div>
    </div>
  )
}

const tocLink: React.CSSProperties = { display: 'block', padding: '6px 0', fontSize: 14, color: C.ink, textDecoration: 'none', lineHeight: 1.45 }
