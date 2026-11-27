import LocaleLink from '@/components/ui/LocaleLink'
import { BreadcrumbLd, ItemListLd } from '@/components/seo/JsonLd'
import { C, RADIUS, WRAP, btnStyle, h2Style } from '@/lib/ui'

export type HubCard = { href: string; topic?: string; title: string; desc: string }

export type GuideHubProps = {
  homeLabel: string
  crumb: string
  title: string
  intro: string
  /** The pillar guide, shown wide above the grid. */
  featured?: HubCard
  cards: HubCard[]
  subhead: string
  /** Listing manual and FAQ. */
  extra: HubCard[]
  note?: string
  /** A plain link after the note, kept out of locale rewriting (e.g. the Thai hub from /en/guide). */
  noteLink?: { href: string; label: string }
  cta: { title: string; body: string; list: string; manage: string }
  /** Absolute URL of this hub, for the breadcrumb markup. */
  url: string
  homeUrl: string
}

/**
 * /guide and /en/guide: the owner guide hub. Strings come from the page
 * (lib/owner-guides for Thai, GUIDE_UI for English) so this file holds no copy.
 */
export default function GuideHub(p: GuideHubProps) {
  const all = [...(p.featured ? [p.featured] : []), ...p.cards, ...p.extra]
  const abs = (href: string) => (href.startsWith('http') ? href : `https://spacesmate.com${encodeURI(href)}`)
  return (
    <div style={{ background: C.paper, padding: '28px 16px 72px' }}>
      <BreadcrumbLd trail={[{ name: 'SpacesMate', url: p.homeUrl }, { name: p.crumb, url: p.url }]} />
      <ItemListLd name={p.title} items={all.map(c => ({ url: abs(c.href), name: c.title }))} />
      <style>{`
        .sm-hub-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
        .sm-hub-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
        .sm-hub-card:hover { border-color: ${C.teal} !important; }
        @media (max-width: 900px) { .sm-hub-cards, .sm-hub-two { grid-template-columns: minmax(0, 1fr); } }
      `}</style>
      <div style={{ maxWidth: WRAP, margin: '0 auto' }}>
        <nav aria-label="breadcrumb" style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
          <LocaleLink href="/" style={{ color: C.teal, textDecoration: 'none' }}>{p.homeLabel}</LocaleLink>
          <span style={{ margin: '0 6px', color: C.faint }}>/</span>{p.crumb}
        </nav>
        <h1 style={{ margin: '0 0 10px', fontSize: 'clamp(28px, 3.6vw, 36px)', lineHeight: 1.3, fontWeight: 600, color: C.green }}>{p.title}</h1>
        <p style={{ margin: '0 0 32px', fontSize: 17, lineHeight: 1.7, color: C.muted, maxWidth: 760 }}>{p.intro}</p>

        {p.featured && (
          <LocaleLink href={p.featured.href} className="sm-hub-card" style={{ display: 'block', background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS, padding: '26px 28px', marginBottom: 14, color: C.ink, textDecoration: 'none' }}>
            {p.featured.topic && <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.teal, marginBottom: 6 }}>{p.featured.topic}</span>}
            <span style={{ display: 'block', fontSize: 24, fontWeight: 600, color: C.green, lineHeight: 1.35, marginBottom: 6 }}>{p.featured.title}</span>
            <span style={{ display: 'block', fontSize: 15.5, color: C.muted, lineHeight: 1.6 }}>{p.featured.desc}</span>
          </LocaleLink>
        )}

        {p.cards.length > 0 && (
          <div className="sm-hub-cards" style={{ marginBottom: 40 }}>
            {p.cards.map(c => <Card key={c.href} c={c} />)}
          </div>
        )}
        {p.note && (
          <p style={{ margin: '0 0 32px', fontSize: 15, color: C.muted, lineHeight: 1.6 }}>
            {p.note}
            {p.noteLink && <> <a href={p.noteLink.href} hrefLang="th" style={{ color: C.teal, textDecoration: 'none' }}>{p.noteLink.label} →</a></>}
          </p>
        )}

        <h2 style={{ ...h2Style(20), margin: p.cards.length || p.featured ? '8px 0 12px' : '0 0 12px' }}>{p.subhead}</h2>
        <div className="sm-hub-two" style={{ marginBottom: 40 }}>
          {p.extra.map(c => <Card key={c.href} c={c} />)}
        </div>

        <section style={{ background: C.green, color: C.white, borderRadius: RADIUS, padding: '26px 28px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 18 }}>
          <div style={{ maxWidth: 640 }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 600, color: C.white }}>{p.cta.title}</h2>
            <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.7, color: '#d7e6df' }}>{p.cta.body}</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <LocaleLink href="/list-your-property" style={btnStyle('light')}>{p.cta.list}</LocaleLink>
            <LocaleLink href="/manage" style={{ ...btnStyle('ghost'), background: 'transparent', color: C.white, borderColor: '#8fb5a7' }}>{p.cta.manage}</LocaleLink>
          </div>
        </section>
      </div>
    </div>
  )
}

function Card({ c }: { c: HubCard }) {
  return (
    <LocaleLink href={c.href} className="sm-hub-card" style={{ display: 'block', background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS, padding: 20, color: C.ink, textDecoration: 'none' }}>
      {c.topic && <span style={{ display: 'block', fontSize: 12.5, color: C.teal, marginBottom: 6 }}>{c.topic}</span>}
      <span style={{ display: 'block', fontSize: 17, fontWeight: 600, color: C.green, lineHeight: 1.45, marginBottom: 6 }}>{c.title}</span>
      <span style={{ fontSize: 14, color: C.muted, lineHeight: 1.55 }}>{c.desc}</span>
    </LocaleLink>
  )
}
