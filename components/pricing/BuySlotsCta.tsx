'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { trackEvent } from '@/lib/analytics'
import { PACKAGE_PRICE_THB } from '@/lib/packages'
import { SLOT_CTA_T } from '@/lib/pricing-i18n'
import { localeHref, type Locale } from '@/lib/routes-i18n'

/**
 * Buy publishing slots from the pricing page.
 *
 * What a package sells is capacity, not a listing: N slots, each holding one
 * listing publicly until it expires. So this button needs no listing, no draft
 * and no context — which is exactly why the old CTA (a link into the listing
 * form) was wrong for anyone who had already written one.
 *
 * Logged out, we send them to register first and come straight back. Buying is
 * meaningless without an account to attach the slots to.
 */
export default function BuySlotsCta({
  pkg,
  className,
  locale = 'th',
}: {
  pkg: string
  className: string
  locale?: Locale
}) {
  const t = SLOT_CTA_T[locale]
  const router = useRouter()
  const [qty,     setQty]     = useState(1)

  // What they will actually be charged.
  //
  // The buttons used to read "ซื้อสล็อต ฿699 × 3", which is the unit price and
  // a multiplication sign — leaving the buyer to work out ฿2,097 in their head
  // at the exact moment they decide whether to commit. Show the total instead.
  const total = (PACKAGE_PRICE_THB[pkg] ?? 0) * qty
  // Which button is working, so only the one that was pressed shows a spinner.
  const [loading, setLoading] = useState<false | 'once' | 'subscription'>(false)
  const [error,   setError]   = useState('')

  /**
   * @param method What the buyer is choosing is a BILLING MODEL, not a payment
   *   method — 'once' buys a term that expires, 'subscription' buys one that
   *   renews on a card. The payment instrument is picked afterwards, at Stripe:
   *   'once' offers PromptPay and card, 'subscription' can only offer card
   *   because PromptPay cannot do recurring.
   *
   *   This used to read 'card' | 'promptpay', which framed the choice as a
   *   payment method and quietly buried PromptPay — the method most Thai owners
   *   reach for — on the secondary button.
   */
  async function buy(method: 'once' | 'subscription') {
    setLoading(method)
    setError('')
    try {
      trackEvent('slot_checkout_start', {
        package_id:     pkg,
        quantity:       qty,
        value:          (PACKAGE_PRICE_THB[pkg] ?? 0) * qty,
        currency:       'THB',
        payment_method: method,
      })

      const { data: { session } } = await createBrowserClient().auth.getSession()
      if (!session) {
        // Not a lost sale — a detour. Tracked separately so the gap between
        // intent and purchase is not silently blamed on price.
        trackEvent('slot_checkout_needs_account', { package_id: pkg, quantity: qty, payment_method: method })
        // Back to the pricing page they were reading, not the Thai one.
        router.push(`${localeHref('/login', locale)}?redirect=${encodeURIComponent(localeHref('/pricing', locale))}`)
        return
      }

      const endpoint = method === 'once'
        ? '/api/stripe/buy-slots-once'
        : '/api/stripe/buy-slots'

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ package_id: pkg, quantity: qty }),
      })
      const json = await res.json()
      if (!res.ok || !json.url) throw new Error(json.error || t.checkoutFailed)
      window.location.href = json.url
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError)
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2">
        <span className="text-xs text-gray-500">{t.quantity}</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQty(q => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label={t.decrease}
            className="h-7 w-7 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40"
          >−</button>
          <span className="w-6 text-center text-sm font-semibold text-spacemate-brandDark">{qty}</span>
          <button
            type="button"
            onClick={() => setQty(q => Math.min(50, q + 1))}
            aria-label={t.increase}
            className="h-7 w-7 rounded-lg border border-gray-200 text-gray-600"
          >+</button>
        </div>
      </div>

      {/* Two buttons, split by billing model rather than payment method.
          The renewal behaviour is on the button itself and not in a footnote:
          a landlord who assumes his payment renews and finds the listing gone
          after 30 days is a support case and a churn event.

          One-time leads because it takes PromptPay, which is how most Thai
          owners actually pay. The previous order made them press the secondary,
          outlined button to reach it. */}
      <button type="button" onClick={() => buy('once')} disabled={loading !== false} className={className}>
        {loading === 'once' ? t.loading : t.payOnce(total.toLocaleString())}
      </button>
      <p className="mt-1 text-center text-[11px] text-gray-400">
        {t.payOnceNote}
      </p>

      <button
        type="button"
        onClick={() => buy('subscription')}
        disabled={loading !== false}
        className="mt-3 w-full block text-center py-3 px-6 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 border border-spacemate-brandTeal text-spacemate-brandTeal hover:bg-spacemate-brandTeal hover:text-white"
      >
        {loading === 'subscription' ? t.loading : t.subscribe(total.toLocaleString())}
      </button>
      <p className="mt-1 text-center text-[11px] text-gray-400">
        {t.subscribeNote}
      </p>

      <p className="mt-3 text-center text-xs text-gray-500">
        {t.slotExplainer}
      </p>

      {error && <p className="mt-2 text-center text-xs text-red-600">{error}</p>}
    </div>
  )
}
