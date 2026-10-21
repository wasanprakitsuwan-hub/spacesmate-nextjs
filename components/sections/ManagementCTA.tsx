// Link here is LocaleLink: it keeps the reader in the language they are already
// reading, so an href written as a Thai path resolves to its English
// counterpart on /en/* pages. An href with no English page passes through
// unchanged. The list of which is in lib/routes-i18n, deliberately not
// repeated here — it was copied into 16 files and went stale in all of them
// the moment /manage and /blog got English pages. See
// components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import { SITE_T, type Locale } from '@/lib/site-i18n'

export default function ManagementCTA({ locale = 'th' }: { locale?: Locale }) {
  const t = SITE_T[locale]
  return (
    <section style={{ padding: '56px 24px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', background: 'radial-gradient(120% 160% at 85% 10%,#055c43,#02402e 60%)', borderRadius: 24, padding: '52px 46px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap', overflow: 'hidden', position: 'relative' }}>
        {/* Amber glow */}
        <div style={{ position: 'absolute', bottom: -90, left: -40, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(217,127,17,0.16),transparent 70%)', pointerEvents: 'none' }} />
        {/* Text */}
        <div style={{ position: 'relative', maxWidth: 580 }}>
          <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 600, margin: '0 0 12px', lineHeight: 1.25, letterSpacing: '-0.4px' }}>{t.mgmtHeading}</h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 15.5, fontWeight: 300, margin: 0, lineHeight: 1.6 }}>{t.mgmtBody}</p>
        </div>
        {/* CTA */}
        <div style={{ position: 'relative', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Link href="/manage" style={{ background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 15, padding: '13px 28px', borderRadius: 24, cursor: 'pointer', transition: 'all .2s', boxShadow: '0 8px 22px -6px rgba(217,127,17,0.6)', textDecoration: 'none' }}>
            {t.mgmtCta}
          </Link>
        </div>
      </div>
    </section>
  )
}
