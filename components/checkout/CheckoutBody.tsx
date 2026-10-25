'use client'

/**
 * /checkout — the one page every purchase goes through.
 *
 *   /checkout?pkg=standard&qty=2    buy slots (from the pricing page)
 *   /checkout?listing=<id>          buy a slot for this listing; the webhook
 *                                   publishes it as soon as payment succeeds
 *   /checkout?extend=<id>           add a term to a live listing's slot
 *
 * Laid out as the approved mockup: 1 package, 2 discount, 3 payment method,
 * with the order summary and pay button beside them (below them on a phone).
 *
 * Payment itself still happens on Stripe: PromptPay or card for a one-time
 * term (/api/stripe/buy-slots-once, told which method was picked here), card
 * only for auto-renew (/api/stripe/buy-slots). A promo code is typed here,
 * checked against Stripe by /api/stripe/promo-check, and its id is passed on
 * so the Stripe session carries the discount. Which code to advertise comes
 * from Settings › การชำระเงิน (lib/promo); the code itself is made in Stripe.
 */
import { buildPlans, PRICING_T } from '@/lib/pricing-i18n'
import OwnerHelpLinks from '@/components/owner/OwnerHelpLinks'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { trackEvent } from '@/lib/analytics'
import { PACKAGE_PRICE_THB, PACKAGE_IMAGE_LIMITS, PACKAGE_ALLOWS_VIDEO, pricePerMonth } from '@/lib/packages'
import { CHECKOUT_T, type Locale } from '@/lib/checkout-i18n'
import { localeHref } from '@/lib/routes-i18n'
import { PROPERTY_TYPE_LABELS } from '@/lib/constants'
import { normalisePromo, type CheckoutPromo } from '@/lib/promo'
import { C, RADIUS, btnStyle } from '@/lib/ui'

const PACKAGES = [
  { id: 'basic',    label: 'Basic',    days: 30 },
  { id: 'standard', label: 'Standard', days: 90 },
  { id: 'premium',  label: 'Premium',  days: 365 },
] as const

type Method = 'promptpay' | 'card' | 'subscription'
type OwnerListing = {
  id: string; title_th: string; title_en?: string | null; listing_status: string; expires_at: string | null
  property_type?: string | null; price_from?: number | null; images?: unknown[] | null
}
type AppliedPromo = { code: string; id: string; discount: number; firstTimeOnly: boolean }

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
  const [method, setMethod]   = useState<Method>('promptpay')
  const [token, setToken]     = useState<string | null>(null)
  const [target, setTarget]   = useState<OwnerListing | null>(null)
  const [targetMissing, setTargetMissing] = useState(false)
  const [freeSlots, setFreeSlots] = useState(0)
  const [busy, setBusy]       = useState(false)
  const [error, setError]     = useState('')

  const [promoCfg, setPromoCfg]   = useState<CheckoutPromo | null>(null)
  const [codeInput, setCodeInput] = useState('')
  const [applied, setApplied]     = useState<AppliedPromo | null>(null)
  const [codeMsg, setCodeMsg]     = useState('')
  const [checking, setChecking]   = useState(false)

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

  // The advertised offer. Absent or switched off, the discount box still takes a code.
  useEffect(() => {
    fetch('/api/settings/public?key=checkout_promo')
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j?.data) setPromoCfg(normalisePromo(j.data)) })
      .catch(() => {})
  }, [])

  // Extending adds days to one slot; a subscription cannot do that.
  const effectiveMethod: Method = mode === 'extend' && method === 'subscription' ? 'card' : method
  const chosen   = PACKAGES.find(p => p.id === pkg)!
  const plan     = buildPlans(locale).find(p => p.id === pkg)
  const subtotal = (PACKAGE_PRICE_THB[pkg] ?? 0) * qty
  const discount = applied ? Math.min(applied.discount, subtotal) : 0
  const total    = subtotal - discount
  const fmt      = (n: number) => n.toLocaleString(locale === 'en' ? 'en-GB' : 'th-TH')

  const checkCode = useCallback(async (raw: string) => {
    const code = raw.trim().toUpperCase()
    if (!code || !token) return
    setChecking(true); setCodeMsg('')
    try {
      const r = await fetch('/api/stripe/promo-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code, package_id: pkg, quantity: qty }),
      })
      const d = await r.json().catch(() => ({}))
      if (d.ok) {
        setApplied({ code: d.code, id: d.promotion_code_id, discount: Number(d.discount_thb) || 0, firstTimeOnly: !!d.first_time_only })
        trackEvent('promo_applied', { code: d.code, package_id: pkg })
      } else {
        setApplied(null)
        setCodeMsg(d.reason === 'minimum' ? t.codeMinimum : d.reason === 'invalid' ? t.codeInvalid : t.codeError)
      }
    } catch {
      setCodeMsg(t.codeError)
    }
    setChecking(false)
  }, [pkg, qty, token, t])

  // The discount depends on the package and quantity, so re-check on a change.
  const appliedCode = applied?.code
  useEffect(() => {
    if (appliedCode) checkCode(appliedCode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkg, qty])

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
      const billing = effectiveMethod === 'subscription' ? 'subscription' : 'once'
      trackEvent('slot_checkout_start', {
        package_id: pkg, quantity: qty, value: total, currency: 'THB',
        payment_method: billing, checkout_mode: mode,
      })
      const endpoint = billing === 'once' ? '/api/stripe/buy-slots-once' : '/api/stripe/buy-slots'
      const body: Record<string, unknown> = { package_id: pkg, quantity: qty }
      if (billing === 'once') body.method = effectiveMethod
      if (applied) body.promotion_code_id = applied.id
      if (mode === 'publish' && target) body.publish_property_id = target.id
      if (mode === 'extend' && target)  body.extend_property_id  = target.id
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok || !json.url) throw new Error(json.error === 'promo_inactive' ? t.promoInactive : json.error || t.checkoutFailed)
      window.location.href = json.url
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError)
      setBusy(false)
    }
  }

  const heading = mode === 'extend' ? t.headingExtend : mode === 'publish' ? t.headingPublish : t.heading
  const targetTitle = target ? (locale === 'en' && target.title_en ? target.title_en : target.title_th) : ''
  const afterPay = mode === 'extend' ? t.afterPayExtend(chosen.days) : mode === 'publish' ? t.afterPayPublishDays(chosen.days) : t.afterPaySlots
  const payLabel = mode === 'publish' && total === 0 ? t.payFree
    : mode === 'publish' ? t.payPublish(fmt(total))
    : mode === 'extend' ? t.payExtend(fmt(total))
    : t.pay(fmt(total))
  const methodLabel = effectiveMethod === 'promptpay' ? t.promptpay : effectiveMethod === 'card' ? t.cardOnce : t.cardSub

  const card: React.CSSProperties = { background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS, padding: 22, marginBottom: 16 }
  const check = (on: boolean) => (
    <span aria-hidden style={{ width: 16, flexShrink: 0, color: on ? C.teal : C.faint, fontWeight: 600 }}>{on ? '✓' : '–'}</span>
  )

  return (
    <div style={{ background: C.paper, minHeight: '70vh', padding: '28px 16px 64px' }}>
      <style>{`
        .sm-co-grid { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 24px; align-items: start; }
        .sm-co-aside { position: sticky; top: 88px; }
        @media (max-width: 900px) { .sm-co-grid { grid-template-columns: minmax(0, 1fr); } .sm-co-aside { position: static; } }
      `}</style>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        {mode === 'publish' && (
          <p style={{ fontSize: 13, color: C.muted, margin: '0 0 10px' }}>
            <span>1 {t.stepFill}</span>
            <span style={{ margin: '0 8px', color: C.faint }}>/</span>
            <span style={{ color: C.green, fontWeight: 600 }}>2 {t.stepPay}</span>
          </p>
        )}
        <h1 style={{ fontSize: 26, fontWeight: 600, color: C.green, margin: '0 0 20px' }}>{heading}</h1>

        <div className="sm-co-grid">
          <div style={{ minWidth: 0 }}>
            {targetId && (
              <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0, flex: '1 1 260px' }}>
                  <p style={{ fontSize: 12.5, color: C.muted, margin: '0 0 2px' }}>{mode === 'extend' ? t.listingCardExtend : t.listingCard}</p>
                  <p style={{ fontSize: 15.5, fontWeight: 600, color: C.ink, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {target ? targetTitle : targetMissing ? t.listingNotFound : t.loading}
                  </p>
                  {target && (
                    <p style={{ fontSize: 13, color: C.muted, margin: '3px 0 0' }}>
                      {[
                        target.property_type && PROPERTY_TYPE_LABELS[target.property_type as keyof typeof PROPERTY_TYPE_LABELS]?.[locale],
                        target.price_from ? `฿${fmt(target.price_from)} ${t.perMonthUnit}` : null,
                        Array.isArray(target.images) ? t.photoCount(target.images.length) : null,
                      ].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                {target && mode === 'publish' && (
                  <a href={`${localeHref('/owner-dashboard', locale)}?edit=${target.id}`} className="sm-btn-ghost" style={{ ...btnStyle('ghost'), padding: '8px 14px', fontSize: 14 }}>{t.editListing}</a>
                )}
              </div>
            )}

            {/* A free slot already in the account: no payment needed to publish. */}
            {mode === 'publish' && target && freeSlots > 0 && (
              <div style={{ ...card, background: C.tint, borderColor: '#cfe4dc' }}>
                <p style={{ fontSize: 14.5, color: C.green, margin: '0 0 12px' }}>{t.haveFreeSlot(freeSlots)}</p>
                <button onClick={publishWithFreeSlot} disabled={busy} className="sm-btn-primary" style={{ ...btnStyle('primary'), opacity: busy ? 0.6 : 1 }}>
                  {t.publishFree}
                </button>
              </div>
            )}

            {/* 1 · Package */}
            <section style={card}>
              <SectionHead n={1} title={t.choosePackage} note={t.pricePerListing} />
              <div style={{ border: `1px solid ${C.line}`, borderRadius: RADIUS }}>
                {PACKAGES.map((p, i) => {
                  const on = pkg === p.id
                  const video = !!PACKAGE_ALLOWS_VIDEO[p.id]
                  return (
                    <label key={p.id} style={{
                      display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px 16px', cursor: 'pointer',
                      borderTop: i ? `1px solid ${C.line2}` : 'none',
                      background: on ? C.tint : C.white,
                      boxShadow: on ? `inset 3px 0 0 ${C.teal}` : 'none',
                      borderRadius: i === 0 ? `${RADIUS}px ${RADIUS}px 0 0` : i === PACKAGES.length - 1 ? `0 0 ${RADIUS}px ${RADIUS}px` : 0,
                    }}>
                      <input type="radio" name="pkg" checked={on} onChange={() => setPkg(p.id)} style={{ marginTop: 4, accentColor: C.teal }} />
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 16, fontWeight: 600, color: C.green }}>{p.label}</span>
                          {p.id === 'standard' && <Tag>{t.popular}</Tag>}
                          {p.id === 'premium' && <Tag>{t.bestValue}</Tag>}
                        </span>
                        <span style={{ display: 'grid', gap: 3, marginTop: 6, fontSize: 13.5, color: C.ink }}>
                          <span style={{ display: 'flex', gap: 6 }}>{check(true)}{t.showFor(p.days)}</span>
                          <span style={{ display: 'flex', gap: 6 }}>{check(true)}{t.photosUpTo(PACKAGE_IMAGE_LIMITS[p.id])}</span>
                          <span style={{ display: 'flex', gap: 6, color: video ? C.ink : C.muted }}>{check(video)}{video ? t.videoYes : t.videoNo}</span>
                        </span>
                      </span>
                      <span style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ display: 'block', fontSize: 17, fontWeight: 600, color: C.amber }}>฿{fmt(PACKAGE_PRICE_THB[p.id])}</span>
                        {p.days > 30 && <span style={{ display: 'block', fontSize: 12.5, color: C.muted, marginTop: 2 }}>{t.perMonth(fmt(pricePerMonth(p.id)))}</span>}
                      </span>
                    </label>
                  )
                })}
              </div>

              {mode === 'slots' && (
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${C.line}`, borderRadius: RADIUS, padding: '8px 12px' }}>
                  <span style={{ fontSize: 14, color: C.ink }}>{t.quantity}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1} aria-label={t.decrease}
                      style={{ width: 30, height: 30, borderRadius: RADIUS, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', opacity: qty <= 1 ? 0.4 : 1 }}>−</button>
                    <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 600, color: C.green }}>{qty}</span>
                    <button type="button" onClick={() => setQty(q => Math.min(50, q + 1))} aria-label={t.increase}
                      style={{ width: 30, height: 30, borderRadius: RADIUS, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer' }}>+</button>
                  </span>
                </div>
              )}
              {mode === 'slots' && <p style={{ fontSize: 13, color: C.muted, margin: '10px 0 0', lineHeight: 1.55 }}>{t.slotExplainer}</p>}
              {plan && <p style={{ fontSize: 13, color: C.muted, margin: '12px 0 0', lineHeight: 1.55 }}>{plan.description}</p>}

              {/* Shared by all three packages, so it sits outside the choices. */}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.line2}` }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.green, margin: '0 0 8px' }}>{PRICING_T[locale].includesTitle}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '4px 18px' }}>
                  {PRICING_T[locale].includes.map(f => (
                    <span key={f} style={{ display: 'flex', gap: 6, fontSize: 13, color: C.ink, lineHeight: 1.55 }}>{check(true)}{f}</span>
                  ))}
                </div>
              </div>
            </section>

            {/* 2 · Discount */}
            <section style={card}>
              <SectionHead n={2} title={t.discount} />
              {promoCfg?.enabled && promoCfg.code && (
                <div style={{ background: C.amberTint, border: '1px solid #f1dcbc', borderRadius: RADIUS, padding: '12px 14px', marginBottom: 12 }}>
                  <p style={{ margin: 0, fontSize: 14.5, color: C.ink }}>
                    <strong style={{ fontWeight: 600 }}>{locale === 'en' ? promoCfg.title_en : promoCfg.title_th}</strong>
                    {' '}{t.useCode}{' '}
                    <code style={{ fontFamily: 'inherit', fontWeight: 600, color: C.amber, letterSpacing: '0.5px' }}>{promoCfg.code}</code>
                  </p>
                  <p style={{ margin: '3px 0 0', fontSize: 13, color: C.muted }}>{locale === 'en' ? promoCfg.note_en : promoCfg.note_th}</p>
                </div>
              )}
              {applied ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14.5, color: C.teal, fontWeight: 500 }}>{t.codeApplied(applied.code, fmt(discount))}</p>
                    {applied.firstTimeOnly && <p style={{ margin: '2px 0 0', fontSize: 12.5, color: C.muted }}>{t.codeFirstTime}</p>}
                  </div>
                  <button type="button" onClick={() => { setApplied(null); setCodeInput('') }}
                    style={{ background: 'none', border: 'none', color: C.muted, fontSize: 13.5, textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit' }}>{t.removeCode}</button>
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); checkCode(codeInput) }} style={{ display: 'flex', gap: 8 }}>
                  <input value={codeInput} onChange={e => setCodeInput(e.target.value.toUpperCase())} placeholder={t.codePlaceholder} aria-label={t.codePlaceholder}
                    style={{ flex: 1, minWidth: 0, padding: '10px 12px', borderRadius: RADIUS, border: `1px solid ${C.border}`, fontSize: 15, fontFamily: 'inherit', letterSpacing: '0.5px' }} />
                  <button type="submit" disabled={checking || !codeInput.trim() || !token} className="sm-btn-ghost"
                    style={{ ...btnStyle('ghost'), padding: '10px 16px', opacity: checking || !codeInput.trim() ? 0.6 : 1 }}>
                    {checking ? '…' : t.applyCode}
                  </button>
                </form>
              )}
              {codeMsg && <p role="alert" style={{ margin: '8px 0 0', fontSize: 13, color: '#b42318' }}>{codeMsg}</p>}
            </section>

            {/* 3 · Payment method */}
            <section style={card}>
              <SectionHead n={3} title={t.howToPay} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
                {([
                  { id: 'promptpay' as const,    label: t.promptpay, note: t.promptpayNote },
                  { id: 'card' as const,         label: t.cardOnce,  note: t.cardOnceNote },
                  { id: 'subscription' as const, label: t.cardSub,   note: mode === 'extend' ? t.subscribeNotForExtend : t.cardSubNote },
                ]).map(o => {
                  const disabled = o.id === 'subscription' && mode === 'extend'
                  const on = effectiveMethod === o.id
                  return (
                    <label key={o.id} style={{
                      display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: RADIUS,
                      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
                      border: `1px solid ${on ? C.teal : C.border}`, background: on ? C.tint : C.white,
                      boxShadow: on ? `inset 0 0 0 1px ${C.teal}` : 'none',
                    }}>
                      <input type="radio" name="method" checked={on} disabled={disabled} onChange={() => setMethod(o.id)} style={{ marginTop: 4, accentColor: C.teal }} />
                      <span>
                        <span style={{ display: 'block', fontSize: 14.5, fontWeight: 600, color: C.green }}>{o.label}</span>
                        <span style={{ display: 'block', fontSize: 12.5, color: C.muted, marginTop: 2, lineHeight: 1.45 }}>{o.note}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </section>
          </div>

          {/* Summary + pay */}
          <aside className="sm-co-aside">
            <div style={{ ...card, marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: C.green, margin: '0 0 14px' }}>{t.summary}</h2>
              <Row label={`${chosen.label} · ${t.perTerm(chosen.days)}${qty > 1 ? ` × ${qty}` : ''}`} value={`฿${fmt(subtotal)}`} />
              {applied && discount > 0 && <Row label={t.codeLine(applied.code)} value={`−฿${fmt(discount)}`} accent />}
              <Row label={t.paidWith} value={methodLabel} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: `1px solid ${C.line2}`, paddingTop: 12, marginTop: 6 }}>
                <span style={{ fontSize: 14.5, color: C.ink, fontWeight: 500 }}>{t.total}</span>
                <span style={{ fontSize: 24, fontWeight: 600, color: C.amber }}>฿{fmt(total)}</span>
              </div>
              {error && (
                <div role="alert" style={{ background: '#fef3f2', border: '1px solid #fecdca', borderRadius: RADIUS, padding: '10px 12px', color: '#b42318', fontSize: 13, margin: '14px 0 0' }}>{error}</div>
              )}
              <button onClick={pay} disabled={busy || !token || (!!targetId && !target && !targetMissing)} className="sm-btn-primary"
                style={{ ...btnStyle('primary'), width: '100%', marginTop: 16, padding: '13px 16px', fontSize: 15.5, opacity: busy ? 0.7 : 1, cursor: busy ? 'wait' : 'pointer' }}>
                {busy ? t.loading : payLabel}
              </button>
              <p style={{ fontSize: 12.5, color: C.muted, margin: '12px 0 0', lineHeight: 1.55 }}>{afterPay}</p>
              <p style={{ fontSize: 12.5, color: C.muted, margin: '6px 0 0' }}>{t.stripeNote}</p>
            </div>
            <a href={localeHref('/owner-dashboard', locale)} style={{ fontSize: 13.5, color: C.teal, textDecoration: 'none' }}>← {t.backToDashboard}</a>
          </aside>
        </div>

        <div style={{ marginTop: 28 }}>
          <OwnerHelpLinks locale={locale} />
        </div>
      </div>
    </div>
  )
}

function SectionHead({ n, title, note }: { n: number; title: string; note?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
      <span aria-hidden style={{
        width: 24, height: 24, borderRadius: '50%', background: C.green, color: C.white, fontSize: 13, fontWeight: 600,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'center',
      }}>{n}</span>
      <h2 style={{ fontSize: 17, fontWeight: 600, color: C.green, margin: 0 }}>{title}</h2>
      {note && <span style={{ fontSize: 12.5, color: C.muted }}>{note}</span>}
    </div>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 12, fontWeight: 500, color: C.teal, background: C.tint, borderRadius: 4, padding: '1px 7px' }}>{children}</span>
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14, padding: '5px 0' }}>
      <span style={{ color: C.muted }}>{label}</span>
      <span style={{ color: accent ? C.teal : C.ink, fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  )
}
