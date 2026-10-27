'use client'

// Link here is LocaleLink: it keeps the reader in the language they are already
// reading, so an href written as a Thai path resolves to its English
// counterpart on /en/* pages. An href with no English page passes through
// unchanged. The list of which is in lib/routes-i18n, deliberately not
// repeated here — it was copied into 16 files and went stale in all of them
// the moment /manage and /blog got English pages. See
// components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import Image from 'next/image'
import CookieSettingsLink from '@/components/consent/CookieSettingsLink'
import { SITE_T } from '@/lib/site-i18n'
import { localeHref } from '@/lib/routes-i18n'
import { useLocale } from '@/lib/use-locale'
import { rentPath, rentPlaceLabel, type RentPlace } from '@/lib/rent-slugs'
import { STATIONS } from '@/lib/stations'
import { LANDMARKS } from '@/lib/landmarks'
import { C, WRAP } from '@/lib/ui'
import { useCompany } from '@/components/layout/SiteInfoContext'
import { lineUrl, companyAddress } from '@/lib/site-config'

const MUTED = '#cfe3d9'   // footer text on green, 9.6:1

// A crawlable link to a handful of the busiest rent-near pages on every page of
// the site. Fixed rather than counted: the footer is a client component, and
// the homepage AreaLinks already ranks pages by live stock.
const FOOTER_PLACES: RentPlace[] = [
  ...['E4', 'E6', 'N5', 'E9', 'S2', 'BL20', 'BL15', 'CEN'].map(id => {
    const station = STATIONS.find(s => s.id === id)!
    return { kind: 'station' as const, id, station }
  }),
  ...['chula', 'kasetsart'].map(id => {
    const landmark = LANDMARKS.find(l => l.id === id)!
    return { kind: 'landmark' as const, id, landmark }
  }),
]

export default function Footer() {
  const locale = useLocale()
  const t = SITE_T[locale]
  // Links and address come from Dashboard › ตั้งค่า › ข้อมูลบริษัท.
  const company = useCompany()
  const SOCIALS = [
    { label: `LINE ${company.line_oa}`, href: lineUrl(company) },
    { label: 'Facebook', href: company.facebook },
    { label: 'Instagram', href: company.instagram },
    { label: 'TikTok', href: company.tiktok },
  ]
  const href = (p: string) => localeHref(p, locale)
  const col = (heading: string, items: { label: string; href: string }[], extra?: React.ReactNode) => (
    <nav style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: 6 }} aria-label={heading}>
      <span style={{ color: C.white, fontWeight: 500, marginBottom: 4 }}>{heading}</span>
      {items.map(i => <Link key={i.label} href={i.href} style={{ color: MUTED }}>{i.label}</Link>)}
      {extra}
    </nav>
  )
  return (
    <footer className="sm-footer" style={{ background: C.green, color: MUTED, fontSize: 14, lineHeight: 1.7 }}>
      <div style={{ maxWidth: WRAP, margin: '0 auto', padding: '56px 24px 28px', display: 'flex', flexWrap: 'wrap', gap: '40px 56px' }}>
        <div style={{ flex: '2 1 260px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Image src="/logo-white.png" unoptimized alt="SpacesMate" width={91} height={40} style={{ height: 40, width: 'auto', alignSelf: 'flex-start' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
          <p style={{ margin: 0, maxWidth: 300 }}>{t.footerTagline}</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ color: C.white }}>{s.label}</a>
            ))}
          </div>
        </div>
        {col(t.footerTenants, [
          { label: t.navSearch, href: href('/search') },
          { label: t.navBlog, href: '/blog' },
        ])}
        {col(t.footerOwners, [
          { label: t.footerListCta, href: href('/list-your-property') },
          { label: t.footerPricing, href: href('/list-your-property') + '#packages' },
          { label: t.footerGuide, href: href('/guide') },
          { label: t.footerManage, href: '/manage' },
          { label: t.footerOwnerLogin, href: href('/login') },
        ])}
        {col('SpacesMate', [
          { label: t.footerAbout, href: href('/about') },
          { label: t.footerContact, href: href('/contact') },
          { label: t.footerFaq, href: href('/faq') },
        ])}
      </div>

      {/* Popular rent-near pages: a crawlable link to the busiest areas from every page. */}
      <div style={{ maxWidth: WRAP, margin: '0 auto', padding: '0 24px 28px' }}>
        <span style={{ color: C.white, fontWeight: 500 }}>{t.footerPopularAreas}</span>
        <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', listStyle: 'none', margin: '8px 0 0', padding: 0 }}>
          {FOOTER_PLACES.map(p => (
            <li key={p.id}>
              <Link href={rentPath(p)} style={{ color: MUTED }}>{t.footerRentNear(rentPlaceLabel(p, locale))}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ maxWidth: WRAP, margin: '0 auto', padding: '0 24px 28px', fontSize: 13 }}>
        {/* Legal links and cookie settings sit on the bottom line, as most sites
            do (Founder, 25 Oct 2026). The cookie link stays on every page:
            withdrawing consent must be as easy as giving it (PDPA s.19). */}
        <div style={{ paddingTop: 18, borderTop: '1px solid rgba(207,227,217,0.2)', display: 'flex', flexWrap: 'wrap', gap: '10px 24px', justifyContent: 'space-between' }}>
          <span>{t.footerRights} · {companyAddress(company, locale)}</span>
          <span style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            <Link href={href('/privacy')} style={{ color: MUTED }}>{t.footerPrivacy}</Link>
            <Link href={href('/terms')} style={{ color: MUTED }}>{t.footerTerms}</Link>
            <CookieSettingsLink className="text-left text-[#cfe3d9] hover:text-white" style={{ fontSize: 13, background: 'none', border: 0, padding: 0, cursor: 'pointer', fontFamily: 'inherit' }} />
          </span>
        </div>
      </div>
    </footer>
  )
}
