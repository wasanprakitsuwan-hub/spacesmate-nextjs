'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'

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
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function buy() {
    setLoading(true)
    setError('')
    try {
      const { data: { session } } = await createBrowserClient().auth.getSession()
      if (!session) {
        router.push(`/login?redirect=${encodeURIComponent('/pricing')}`)
        return
      }

      const res = await fetch('/api/stripe/buy-slots', {
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

      <button type="button" onClick={buy} disabled={loading} className={className}>
        {loading ? 'กำลังโหลด…' : qty > 1 ? `${label} × ${qty}` : label}
      </button>

      <p className="mt-2 text-center text-xs text-gray-500">
        1 สล็อต = เผยแพร่ได้ 1 ประกาศ · เปลี่ยนประกาศในสล็อตได้ตลอดอายุ
      </p>

      {error && <p className="mt-2 text-center text-xs text-red-600">{error}</p>}
    </div>
  )
}
