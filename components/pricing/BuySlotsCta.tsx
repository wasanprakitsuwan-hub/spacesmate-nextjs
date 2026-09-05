'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { trackEvent } from '@/lib/analytics'
import { PACKAGE_PRICE_THB } from '@/lib/packages'

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
  label,
  className,
}: {
  pkg: string
  label: string
  className: string
}) {
  const router = useRouter()
  const [qty,     setQty]     = useState(1)
  // Which button is working, so only the one that was pressed shows a spinner.
  const [loading, setLoading] = useState<false | 'card' | 'promptpay'>(false)
  const [error,   setError]   = useState('')

  /**
   * @param method 'card' buys a subscription that renews; 'promptpay' buys a
   *   one-time term that expires. Stripe's PromptPay cannot do recurring, so
   *   these are two routes rather than one route with two payment methods.
   */
  async function buy(method: 'card' | 'promptpay') {
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
        router.push(`/login?redirect=${encodeURIComponent('/pricing')}`)
        return
      }

      const endpoint = method === 'promptpay'
        ? '/api/stripe/buy-slots-promptpay'
        : '/api/stripe/buy-slots'

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ package_id: pkg, quantity: qty }),
      })
      const json = await res.json()
      if (!res.ok || !json.url) throw new Error(json.error || 'ไม่สามารถเริ่มการชำระเงินได้')
      window.location.href = json.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2">
        <span className="text-xs text-gray-500">จำนวนสล็อต</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQty(q => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="ลดจำนวน"
            className="h-7 w-7 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40"
          >−</button>
          <span className="w-6 text-center text-sm font-semibold text-spacemate-brandDark">{qty}</span>
          <button
            type="button"
            onClick={() => setQty(q => Math.min(50, q + 1))}
            aria-label="เพิ่มจำนวน"
            className="h-7 w-7 rounded-lg border border-gray-200 text-gray-600"
          >+</button>
        </div>
      </div>

      {/* Two buttons rather than a payment-method dropdown at checkout.
          The difference is not only how you pay: a card buys a subscription
          that renews, PromptPay buys a term that expires. A landlord who
          assumes PromptPay renews and finds their listing gone after 30 days
          is a support case and a churn event, so the renewal behaviour is on
          the button itself, not in a footnote. */}
      <button type="button" onClick={() => buy('card')} disabled={loading !== false} className={className}>
        {loading === 'card' ? 'กำลังโหลด…' : qty > 1 ? `${label} × ${qty}` : label}
      </button>
      <p className="mt-1 text-center text-[11px] text-gray-400">
        บัตรเครดิต/เดบิต · ต่ออายุอัตโนมัติ ยกเลิกได้ทุกเมื่อ
      </p>

      <button
        type="button"
        onClick={() => buy('promptpay')}
        disabled={loading !== false}
        className="mt-3 w-full block text-center py-3 px-6 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 border border-spacemate-brandTeal text-spacemate-brandTeal hover:bg-spacemate-brandTeal hover:text-white"
      >
        {loading === 'promptpay' ? 'กำลังโหลด…' : 'จ่ายด้วยพร้อมเพย์'}
      </button>
      <p className="mt-1 text-center text-[11px] text-gray-400">
        สแกน QR · จ่ายครั้งเดียว ไม่ต่ออัตโนมัติ
      </p>

      <p className="mt-3 text-center text-xs text-gray-500">
        1 สล็อต = เผยแพร่ได้ 1 ประกาศ · เปลี่ยนประกาศในสล็อตได้ตลอดอายุ
      </p>

      {error && <p className="mt-2 text-center text-xs text-red-600">{error}</p>}
    </div>
  )
}
