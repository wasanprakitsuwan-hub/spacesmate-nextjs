// Link here is LocaleLink: it keeps the reader in the language they are already
// reading. See components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import { SITE_T, type Locale } from '@/lib/site-i18n'
import { C, WRAP, btnStyle } from '@/lib/ui'

/** Full-width green band inviting owners to ask for a building-management callback (Stream 2). */
export default function ManagementCTA({ locale = 'th' }: { locale?: Locale }) {
  const t = SITE_T[locale]
  return (
    <section style={{ background: C.green, color: C.white }}>
      <div style={{ maxWidth: WRAP, margin: '0 auto', padding: '80px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <span style={{ fontSize: 14, color: '#cfe3d9' }}>{t.mgmtKicker}</span>
        <h2 style={{ margin: 0, fontSize: 34, lineHeight: 1.4, fontWeight: 600, maxWidth: 820 }} className="sm-mgmt-h2">
          {t.mgmtHeading}<br />{t.mgmtHeading2}
        </h2>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.75, color: '#cfe3d9', maxWidth: 640 }}>{t.mgmtBody}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px 24px' }}>
          <Link href="/manage#enquiry" style={btnStyle('light')}>{t.mgmtCta}</Link>
          <Link href="/manage" style={{ color: C.white, borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: 2, textDecoration: 'none' }}>{t.mgmtMore}</Link>
        </div>
      </div>
      <style>{`@media (max-width: 640px) { .sm-mgmt-h2 { font-size: 26px !important; } }`}</style>
    </section>
  )
}
