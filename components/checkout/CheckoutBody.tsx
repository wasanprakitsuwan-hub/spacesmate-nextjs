'use client'

/**
 * /checkout — the one page every purchase goes through.
 *
 *   /checkout?pkg=standard&qty=2    buy slots (from the pricing page)
 *   /checkout?listing=<id>          buy a slot for this listing; the webhook
 *                                   publishes it as soon as payment succeeds
 *   /checkout?extend=<id>           add a term to a live listing's slot
 *
 * It replaces three separate entry points — the two buttons on each pricing
 * card, the dashboard's old card-only renew modal and the retired /api/stripe/renew
 * route — so package, quantity and billing model are chosen in one place.
 *
 * Payment itself still happens on Stripe: PromptPay and card for a one-time
 * term (/api/stripe/buy-slots-once), card only for auto-renew
 * (/api/stripe/buy-slots). Promo codes are entered on Stripe's page; both
 * routes set allow_promotion_codes.
 */
import { buildPlans, PRICING_T } from '@/lib/pricing-i18n'
import OwnerHelpLinks from '@/components/owner/OwnerHelpLinks'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { trackEvent } from '@/lib/analytics'
import { PACKAGE_PRICE_THB, PACKAGE_IMAGE_LIMITS, pricePerMonth } from '@/lib/packages'
import { CHECKOUT_T, type Locale } from '@/lib/checkout-i18n'
import { localeHref } from '@/lib/routes-i18n'

const PACKAGES = [
  { id: 'basic',    label: 'Basic',    days: 30 },
  { id: 'standard', label: 'Standard', days: 90 },
  { id: 'premium',  label: 'Premium',  days: 365 },
] as const

type Billing = 'once' | 'subscription'
type OwnerListing = { id: string; title_th: string; title_en?: string | null; listing_status: string; expires_at: string | null }

export default function CheckoutBody({ locale = 'th' }: { locale?: Locale }) {
  return (
    <Suspense fallback={null}>
      <Checkout locale={locale} />
    </Suspense>
  )
}

function Checkout({ locale }: { locale: Locale }) {
  const t = CHECKOUT_T[locale]
  const sp = useSearchParams()
  const router = useRouter()

  const listingId = sp.get('listing')
  const extendId  = sp.get('extend')
  const targetId  = extendId || listingId
  const mode: 'slots' | 'publish' | 'extend' = extendId ? 'extend' : listingId ? 'publish' : 'slots'

  const initialPkg = PACKAGES.some(p => p.id === sp.get('pkg')) ? sp.get('pkg')! : 'basic'
  const [pkg, setPkg]         = useState<string>(initialPkg)
  const [qty, setQty]         = useState(() => mode === 'slots' ? Math.max(1, Math.min(50, Number(sp.get('qty')) || 1)) : 1)
  const [billing, setBilling] = useState<Billing>('once')
  const [token, setToken]     = useState<string | null>(null)
  const [target, setTarget]   = useState<OwnerListing | null>(null)
  const [targetMissing, setTargetMissing] = useState(false)
  const [freeSlots, setFreeSlots] = useState(0)
  const [busy, setBusy]       = useState(false)
  const [error, setError]     = useState('')

  // Signed in, or sent to log in and brought straight back here with the same choices.
  useEffect(() => {
    (async () => {
      const { data: { session } } = await createBrowserClient().auth.getSession()
      if (!session) {
        const back = `${localeHref('/checkout', locale)}?${sp.toString()}`
        router.replace(`${localeHref('/login', locale)}?redirect=${encodeURIComponent(back)}`)
        return
      }
      setToken(session.access_token)
      if (!targetId) return
      const r = await fetch('/api/owner/listings', { headers: { Authorization: `Bearer ${session.access_token}` } })
      const d = await r.json().catch(() => ({}))
      const found = (d.listings ?? []).find((l: OwnerListing) => l.id === targetId) ?? null
      setTarget(found)
      setTargetMissing(!found)
      setFreeSlots(d.free_slots ?? 0)
    })()
  }, [locale, router, sp, targetId])

  // Extending adds days to one slot; a subscription cannot do that.
  const effectiveBilling: Billing = mode === 'extend' ? 'once' : billing
  const chosen = PACKAGES.find(p => p.id === pkg)!
  const plan   = buildPlans(locale).find(p => p.id === pkg)
  const total  = (PACKAGE_PRICE_THB[pkg] ?? 0) * qty
  const fmt    = (n: number) => n.toLocaleString(locale === 'en' ? 'en-GB' : 'th-TH')

  async function publishWithFreeSlot() {
    if (!token || !target) return
    setBusy(true); setError('')
    const r = await fetch('/api/owner/listings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: target.id, publish: true }),
    })
    const d = await r.json().catch(() => ({}))
    if (!r.ok) { setError(d?.message || t.publishFailed); setBusy(false); return }
    trackEvent('listing_published', { source: 'checkout_free_slot' })
    router.push(localeHref('/owner-dashboard', locale))
  }

  async function pay() {
    if (!token) return
    setBusy(true); setError('')
    try {
      trackEvent('slot_checkout_start', {
        package_id: pkg, quantity: qty, value: total, currency: 'THB',
        payment_method: effectiveBilling, checkout_mode: mode,
      })
      const endpoint = effectiveBilling === 'once' ? '/api/stripe/buy-slots-once' : '/api/stripe/buy-slots'
      const body: Record<string, unknown> = { package_id: pkg, quantity: qty }
      if (mode === 'publish' && target) body.publish_property_id = target.id
      if (mode === 'extend' && target)  body.extend_property_id  = target.id
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok || !json.url) throw new Error(json.error || t.checkoutFailed)
      window.location.href = json.url
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError)
      setBusy(false)
    }
  }

  const heading = mode === 'extend' ? t.headingExtend : mode === 'publish' ? t.headingPublish : t.heading
  const targetTitle = target ? (locale === 'en' && target.title_en ? target.title_en : target.title_th) : ''
  const afterPay = mode === 'extend' ? t.afterPayExtend(chosen.days) : mode === 'publish' ? t.afterPayPublish : t.afterPaySlots

  const card: React.CSSProperties = { background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 22, marginBottom: 16 }
  const sectionTitle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.4px' }

  return (
    <div style={{ background: '#f7f9f8', minHeight: '70vh', padding: '36px 16px 60px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#02402e', margin: '0 0 18px' }}>{heading}</h1>

        {targetId && (
          <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="msym" style={{ fontSize: 22, color: '#048c73' }}>home_work</span>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{t.forListing}</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#231f20', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {target ? targetTitle : targetMissing ? t.listingNotFound : t.loading}
              </p>
            </div>
          </div>
        )}

        {/* A free slot already in the account: no payment needed to publish. */}
        {mode === 'publish' && target && freeSlots > 0 && (
          <div style={{ ...card, background: '#eaf6f1', borderColor: '#cfe9df' }}>
            <p style={{ fontSize: 14, color: '#02402e', margin: '0 0 12px' }}>{t.haveFreeSlot(freeSlots)}</p>
            <button onClick={publishWithFreeSlot} disabled={busy}
              style={{ padding: '10px 18px', borderRadius: 12, border: 'none', background: '#048c73', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>
              {t.publishFree}
            </button>
          </div>
        )}

        <div style={card}>
          <p style={sectionTitle}>{t.choosePackage}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PACKAGES.map(p => {
              const on = pkg === p.id
              return (
                <button key={p.id} onClick={() => setPkg(p.id)}
                  style={{ textAlign: 'left', padding: '14px 16px', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', border: `2px solid ${on ? '#048c73' : '#e2e8f0'}`, background: on ? '#eaf6f1' : '#fff' }}>
                  <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#02402e' }}>{p.label} · {t.perTerm(p.days)}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#02402e' }}>฿{fmt(PACKAGE_PRICE_THB[p.id])}</span>
                  </span>
                  <span style={{ display: 'block', fontSize: 12.5, color: '#64748b', marginTop: 3 }}>
                    {t.perMonth(fmt(pricePerMonth(p.id)))} · {t.photos(PACKAGE_IMAGE_LIMITS[p.id], p.id === 'premium')}
                  </span>
                  {/* The chosen package's full detail. /pricing used to carry
                      this; it now lives where the owner is choosing. */}
                  {on && plan && (
                    <span style={{ display: 'block', marginTop: 10, paddingTop: 10, borderTop: '1px solid #cfe9df' }}>
                      <span style={{ display: 'block', fontSize: 13, color: '#334155', marginBottom: 6 }}>{plan.description}</span>
                      {plan.features.map(f => (
                        <span key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                          <span className="msym" style={{ fontSize: 15, color: '#048c73', fontVariationSettings: "'wght' 400, 'FILL' 1", marginTop: 1 }}>check</span>{f}
                        </span>
                      ))}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {mode === 'slots' && (
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0', borderRadius: 12, padding: '8px 12px' }}>
              <span style={{ fontSize: 13.5, color: '#475569' }}>{t.quantity}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1} aria-label={t.decrease}
                  style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', opacity: qty <= 1 ? 0.4 : 1 }}>−</button>
                <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 600, color: '#02402e' }}>{qty}</span>
                <button type="button" onClick={() => setQty(q => Math.min(50, q + 1))} aria-label={t.increase}
                  style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>+</button>
              </span>
            </div>
          )}
          <p style={{ fontSize: 12.5, color: '#64748b', margin: '12px 0 0', lineHeight: 1.5 }}>{t.slotExplainer}</p>
          {/* Shared by all three packages, so it sits outside the choices. */}
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#02402e', margin: '0 0 6px' }}>{PRICING_T[locale].includesTitle}</p>
            {PRICING_T[locale].includes.map(f => (
              <span key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>
                <span className="msym" style={{ fontSize: 14, color: '#048c73', fontVariationSettings: "'wght' 400, 'FILL' 1", marginTop: 1 }}>check</span>{f}
              </span>
            ))}
          </div>
        </div>

        <div style={card}>
          <p style={sectionTitle}>{t.howToPay}</p>
          {([
            { id: 'once' as const,         label: t.payOnce,   note: t.payOnceNote },
            { id: 'subscription' as const, label: t.subscribe, note: mode === 'extend' ? t.subscribeNotForExtend : t.subscribeNote },
          ]).map(o => {
            const disabled = o.id === 'subscription' && mode === 'extend'
            const on = effectiveBilling === o.id
            return (
              <label key={o.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 12, marginBottom: 8, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, border: `2px solid ${on ? '#048c73' : '#e2e8f0'}`, background: on ? '#eaf6f1' : '#fff' }}>
                <input type="radio" name="billing" checked={on} disabled={disabled} onChange={() => setBilling(o.id)} style={{ marginTop: 3, accentColor: '#048c73' }} />
                <span>
                  <span style={{ display: 'block', fontSize: 14.5, fontWeight: 600, color: '#02402e' }}>{o.label}</span>
                  <span style={{ display: 'block', fontSize: 12.5, color: '#64748b', marginTop: 2 }}>{o.note}</span>
                </span>
              </label>
            )
          })}
          <p style={{ fontSize: 12.5, color: '#64748b', margin: '4px 0 0' }}>{t.promoNote}</p>
        </div>

        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span style={{ fontSize: 14, color: '#475569' }}>{t.total}</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#d97f11' }}>฿{fmt(total)}</span>
          </div>
          <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 14px', lineHeight: 1.5 }}>{afterPay}</p>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px', color: '#b91c1c', fontSize: 13, marginBottom: 12 }}>{error}</div>
          )}
          <button onClick={pay} disabled={busy || !token || (!!targetId && !target && !targetMissing)}
            style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: busy ? '#94a3b8' : '#048c73', color: '#fff', fontSize: 15, fontWeight: 700, cursor: busy ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
            {busy ? t.loading : t.pay(fmt(total))}
          </button>
        </div>

        <a href={localeHref('/owner-dashboard', locale)} style={{ fontSize: 13.5, color: '#048c73', textDecoration: 'none' }}>← {t.backToDashboard}</a>
        <OwnerHelpLinks locale={locale} />
      </div>
    </div>
  )
}
