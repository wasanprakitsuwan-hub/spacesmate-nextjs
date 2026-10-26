// Link here is LocaleLink: it keeps the reader in the language they are already
// reading. See components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import Icon, { type IconName } from '@/components/ui/Icon'
import { C, h2Style } from '@/lib/ui'
import type { LegalSection } from '@/lib/legal-i18n'

/**
 * The shared frame for /privacy and /terms (round 6 mockup, approved 26 Oct
 * 2026): a quiet title band with tabs between the two documents, the dates
 * with icons, optional summary cards, then a table of contents beside the
 * text. The text itself comes unchanged from lib/legal-i18n.
 */
const LEGAL_WRAP = 1100

export default function LegalLayout({ doc, docsNav, privacyLabel, termsLabel, heading, effective, summary, tocLabel, intro, sections, after }: {
  doc: 'privacy' | 'terms'
  docsNav: string
  privacyLabel: string
  termsLabel: string
  heading: string
  /** "In effect … | last updated …" — split at the bar into two dated lines. */
  effective: string
  summary?: { icon: IconName; title: string; desc: string }[]
  tocLabel: string
  intro: React.ReactNode
  sections: LegalSection[]
  /** Boxes after the last section: cookie settings, contact. */
  after: React.ReactNode
}) {
  const [inEffect, updated] = effective.split('|').map(x => x.trim())
  const tab = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 6, padding: active ? '9px 14px' : '8px 14px', fontSize: 14, textDecoration: 'none',
    background: active ? C.green : C.white, color: active ? C.white : C.green, border: active ? 'none' : `1px solid ${C.border}`, fontWeight: active ? 500 : 400,
  })
  return (
    <div style={{ background: C.paper, color: C.ink, minHeight: '100vh' }}>
      <section style={{ borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: LEGAL_WRAP, margin: '0 auto', padding: '48px 16px 36px', boxSizing: 'border-box' }}>
          <nav aria-label={docsNav} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            <Link href="/privacy" aria-current={doc === 'privacy' ? 'page' : undefined} style={tab(doc === 'privacy')}>
              <Icon name="shield" size={18} color={doc === 'privacy' ? C.white : C.green} />{privacyLabel}
            </Link>
            <Link href="/terms" aria-current={doc === 'terms' ? 'page' : undefined} style={tab(doc === 'terms')}>
              <Icon name="contract" size={18} color={doc === 'terms' ? C.white : C.green} />{termsLabel}
            </Link>
          </nav>
          <h1 style={{ margin: '0 0 18px', fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 600, color: C.green, lineHeight: 1.3 }}>{heading}</h1>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 14, color: C.muted }}>
            {inEffect && <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Icon name="calendar" size={16} color={C.muted} />{inEffect}</span>}
            {updated && <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Icon name="refresh" size={16} color={C.muted} />{updated}</span>}
          </div>
        </div>
      </section>

      {summary && (
        <section style={{ maxWidth: LEGAL_WRAP, margin: '0 auto', padding: '36px 16px 0', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {summary.map(c => (
              <div key={c.title} style={{ flex: '1 1 230px', background: C.white, border: `1px solid ${C.line}`, borderRadius: 8, padding: 18, display: 'flex', gap: 12 }}>
                <Icon name={c.icon} size={24} color={C.teal} />
                <span>
                  <span style={{ display: 'block', fontWeight: 600, color: C.green }}>{c.title}</span>
                  <span style={{ display: 'block', fontSize: 14, color: C.muted }}>{c.desc}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{ maxWidth: LEGAL_WRAP, margin: '0 auto', padding: '36px 16px 64px', boxSizing: 'border-box', display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <nav aria-label={tocLabel} className="sm-legal-toc" style={{ flex: '0 1 260px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2, fontSize: 14, position: 'sticky', top: 88 }}>
          <span style={{ fontWeight: 600, color: C.green, marginBottom: 6, display: 'flex', gap: 8, alignItems: 'center' }}><Icon name="list" size={16} color={C.green} />{tocLabel}</span>
          {sections.map((s, i) => (
            <a key={s.title} href={`#s${i + 1}`} style={{ padding: '6px 10px', borderLeft: `2px solid ${C.line}`, color: C.muted, textDecoration: 'none' }}>{s.title}</a>
          ))}
        </nav>

        <article style={{ flex: '1 1 560px', minWidth: 0, background: C.white, border: `1px solid ${C.line}`, borderRadius: 8, padding: 'clamp(20px, 4vw, 32px)', display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ fontSize: 15.5, lineHeight: 1.85 }}>{intro}</div>
          {sections.map((s, i) => (
            <div key={s.title} id={`s${i + 1}`} style={{ scrollMarginTop: 88 }}>
              <h2 style={{ ...h2Style(19), margin: '0 0 8px' }}>{s.title}</h2>
              <div style={{ color: '#4a4642', lineHeight: 1.85, fontSize: 15, whiteSpace: 'pre-line' }}>{s.content}</div>
            </div>
          ))}
          {after}
        </article>
      </section>

      <style>{`
        @media (max-width: 900px) { .sm-legal-toc { position: static !important; flex-basis: 100% !important; } }
      `}</style>
    </div>
  )
}
