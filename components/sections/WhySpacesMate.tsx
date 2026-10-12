import { SITE_T, type Locale } from '@/lib/site-i18n'

export default function WhySpacesMate({ locale = 'th' }: { locale?: Locale }) {
  const t = SITE_T[locale]
  const WHY_BLOCKS = [
    { icon: 'update',              title: t.why1Title, desc: t.why1Desc },
    { icon: 'sell',                title: t.why2Title, desc: t.why2Desc },
    { icon: 'category',            title: t.why3Title, desc: t.why3Desc },
    { icon: 'dashboard_customize', title: t.why4Title, desc: t.why4Desc },
  ]
  return (
    <section style={{ background: 'linear-gradient(180deg,#eef5f1,#f4f9f6)', borderTop: '1px solid #e3ede8', borderBottom: '1px solid #e3ede8', padding: '60px 24px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, margin: '0 0 8px', textAlign: 'center', letterSpacing: '-0.4px', color: '#02402e' }}>{t.whyHeading}</h2>
        <p style={{ color: '#64748b', fontSize: 15, margin: '0 0 40px', textAlign: 'center', fontWeight: 300 }}>{t.whySub}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }} className="sm-cats">
          {WHY_BLOCKS.map(w => (
            <div key={w.title} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: '30px 26px' }}>
              <span style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(140deg,#06a487,#02402e)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 9px 18px -8px rgba(2,64,46,0.5)', flexShrink: 0 }}>
                <span className="msym" style={{ fontSize: 26, color: '#fff' }}>{w.icon}</span>
              </span>
              <h3 style={{ fontSize: 17.5, fontWeight: 600, margin: '0 0 8px', color: '#231f20' }}>{w.title}</h3>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, margin: 0, fontWeight: 300 }}>{w.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
