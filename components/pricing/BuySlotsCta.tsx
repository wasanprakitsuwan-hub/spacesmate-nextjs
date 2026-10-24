'use client'

import { useState } from 'react'
import { PACKAGE_PRICE_THB } from '@/lib/packages'
import { SLOT_CTA_T } from '@/lib/pricing-i18n'
import { localeHref, type Locale } from '@/lib/routes-i18n'

/**
 * Buy publishing slots from the pricing page.
 *
 * What a package sells is capacity, not a listing: N slots, each holding one
 * listing publicly until it expires. So this button needs no listing, no draft
 * and no context.
 *
 * It only picks the package and quantity. Billing model, payment method and
 * the login detour all happen on /checkout, the one page every purchase goes
 * through, so the pricing page and the dashboard cannot drift apart.
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
  const [qty, setQty] = useState(1)

  // What they will actually be charged, not a unit price and a "×".
  const total = (PACKAGE_PRICE_THB[pkg] ?? 0) * qty
  const href  = `${localeHref('/checkout', locale)}?pkg=${encodeURIComponent(pkg)}&qty=${qty}`

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

      <a href={href} className={className}>
        {t.choose(total.toLocaleString())}
      </a>
      <p className="mt-1 text-center text-[11px] text-gray-400">
        {t.payOptions}
      </p>

      <p className="mt-3 text-center text-xs text-gray-500">
        {t.slotExplainer}
      </p>

    </div>
  )
}
