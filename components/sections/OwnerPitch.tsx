// Link here is LocaleLink: it keeps the reader in the language they are already
// reading. See components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import { SITE_T, type Locale } from '@/lib/site-i18n'
import { C, WRAP, btnStyle } from '@/lib/ui'

/**
 * "Looking for tenants?" — the homepage invitation to list (Stream 1), with the
 * property types an owner can list. Replaced CategorySection and WhySpacesMate
 * in the 2026 redesign.
 */
export default function OwnerPitch({ locale = 'th' }: { locale?: Locale }) {
  const t = SITE_T[locale]
  return (
    <section style={{ borderTop: `1px solid ${C.line}`, background: C.white }}>
      <div style={{ maxWidth: WRAP, margin: '0 auto', padding: '72px 24px', display: 'flex', flexWrap: 'wrap', gap: '48px 72px' }}>
        <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <span style={{ fontSize: 14, color: C.muted }}>{t.ownerKicker}</span>
          <h2 style={{ margin: 0, fontSize: 32, lineHeight: 1.4, fontWeight: 600, color: C.green }}>
            {t.ownerHeading}<br />{t.ownerHeading2}
          </h2>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.75, color: C.muted, maxWidth: 440 }}>{t.ownerBody}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
            <Link href="/list-your-property" className="sm-btn-primary" style={btnStyle('primary')}>{t.ownerCta}</Link>
            <Link href="/list-your-property#packages" className="sm-btn-ghost" style={btnStyle('ghost')}>{t.ownerPricing}</Link>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: C.muted }}>
            <strong style={{ fontWeight: 600, color: C.green }}>{t.ownerFree}</strong> · {t.ownerFair}
          </p>
        </div>
        <ul style={{ flex: '1 1 520px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0 40px', alignContent: 'start', listStyle: 'none', margin: 0, padding: 0 }}>
          {t.ownerTypes.map(o => (
            <li key={o.name} style={{ padding: '18px 0', borderBottom: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 17, fontWeight: 500, color: C.ink }}>{o.name}</span>
              <span style={{ fontSize: 14, color: C.muted }}>{o.desc}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
