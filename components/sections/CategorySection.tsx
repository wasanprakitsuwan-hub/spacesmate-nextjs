// Link here is LocaleLink: it keeps the reader in the language they are already
// reading, so an href written as a Thai path resolves to its English
// counterpart on /en/* pages. An href with no English page passes through
// unchanged. The list of which is in lib/routes-i18n, deliberately not
// repeated here — it was copied into 16 files and went stale in all of them
// the moment /manage and /blog got English pages. See
// components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import { SITE_T, type Locale } from '@/lib/site-i18n'

export default function CategorySection({ locale = 'th' }: { locale?: Locale }) {
  const t = SITE_T[locale]
  const CATEGORIES = [
    { type: 'Apartment', label: t.apartment, icon: 'apartment' },
    { type: 'Condo',     label: t.condo,     icon: 'location_city' },
    { type: 'Office',    label: t.office,    icon: 'business_center' },
  ]
  return (
    <section className="sm-home-categories" style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 24px 8px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="sm-cats">
        {CATEGORIES.map(cat => (
          <Link
            key={cat.type}
            href={`/search?type=${cat.type}`}
            style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11, cursor: 'pointer', transition: 'all .2s', textDecoration: 'none' }}
            className="sm-cat-card"
          >
            <span style={{ width: 58, height: 58, borderRadius: '50%', background: 'linear-gradient(140deg,#06a487,#02402e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 9px 18px -8px rgba(2,64,46,0.55)', flexShrink: 0 }}>
              <span className="msym" style={{ fontSize: 28, color: '#fff' }}>{cat.icon}</span>
            </span>
            <span style={{ fontSize: 14.5, fontWeight: 500, color: '#231f20', textAlign: 'center', lineHeight: 1.3 }}>{cat.label}</span>
            <span className="mono" style={{ fontSize: 10.5, color: '#9aa' }}>{t.categorySearch}</span>
          </Link>
        ))}
      </div>
      <style>{`
        .sm-cat-card:hover {
          border-color: #048c73 !important;
          box-shadow: 0 12px 28px -12px rgba(2,64,46,0.16) !important;
          transform: translateY(-3px) !important;
        }
        @media (max-width: 900px) {
          .sm-home-categories { display: none !important; }
          .sm-cats { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </section>
  )
}
