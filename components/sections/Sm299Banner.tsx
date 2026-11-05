import Link from '@/components/ui/LocaleLink'
import { getCheckoutPromo } from '@/lib/promo-server'
import { C, RADIUS, WRAP } from '@/lib/ui'
import { SITE_T, type Locale } from '@/lib/site-i18n'

/**
 * The SM299 owner banner (Founder, 5 Nov 2026): photo left, green panel right
 * with the headline, the code and one text-only button. Every word is real
 * text so it reads in both languages and to search engines; the photo is only
 * a background.
 *
 * Two placements:
 *   - 'page': top of /list-your-property, in place of the old promo pill.
 *     Button goes straight to the listing form.
 *   - 'home': homepage owner section, between the owner pitch and the
 *     management band. Button goes to /list-your-property.
 *
 * Shown only while Settings › การชำระเงิน has the checkout promo switched on,
 * the same switch as the checkout and the packages banner, so the code is
 * never advertised when Stripe would reject it.
 */

const ON_GREEN = '#cfe3da'

export default async function Sm299Banner({ locale = 'th', placement }: { locale?: Locale; placement: 'page' | 'home' }) {
  const promo = await getCheckoutPromo()
  if (!promo.enabled) return null
  const t = SITE_T[locale]
  const offer = locale === 'en' ? promo.title_en : promo.title_th
  const href = placement === 'page' ? '/list-your-property/new' : '/list-your-property'

  const card = (
    <div className="sm299-banner" style={{ display: 'flex', flexWrap: 'wrap', background: C.green, color: C.white, borderRadius: RADIUS * 2, overflow: 'hidden' }}>
      <div
        role="img"
        aria-label={t.sm299PhotoAlt}
        style={{ flex: '1 1 380px', minHeight: 260, backgroundImage: 'url(/promo/sm299-owner.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 55%' }}
      />
      <div style={{ flex: '1 1 380px', minWidth: 0, padding: 'clamp(28px, 4vw, 48px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
        <span style={{ fontSize: 14, color: ON_GREEN, paddingBottom: 12, borderBottom: '1px solid rgba(207,227,218,0.35)' }}>{t.sm299Eyebrow}</span>
        <h2 style={{ margin: 0, fontSize: 'clamp(26px, 3.2vw, 38px)', lineHeight: 1.3, fontWeight: 600, color: C.white }}>{t.sm299Title}</h2>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: ON_GREEN }}>{t.sm299Sub}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
          <span style={{ background: '#f2b25c', color: '#2b1800', borderRadius: RADIUS, padding: '8px 16px', fontSize: 18, fontWeight: 600 }}>
            {t.sm299UseCode} <span style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: 1.5 }}>{promo.code}</span>
          </span>
          <span style={{ fontSize: 15, color: C.white }}>{offer}</span>
        </div>
        <div style={{ marginTop: 8 }}>
          <Link href={href} style={{ display: 'inline-block', background: C.white, color: C.green, padding: '12px 28px', borderRadius: RADIUS, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
            {t.sm299Cta}
          </Link>
        </div>
      </div>
    </div>
  )

  if (placement === 'page') {
    return (
      <section style={{ background: C.paper }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px', boxSizing: 'border-box' }}>{card}</div>
      </section>
    )
  }
  return (
    <section style={{ background: C.white }}>
      <div style={{ maxWidth: WRAP, margin: '0 auto', padding: '0 24px 72px', boxSizing: 'border-box' }}>{card}</div>
    </section>
  )
}
