'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'

/**
 * The pricing CTA, aware of what the visitor has already written.
 *
 * THE PROBLEM THIS SOLVES
 *   Every plan linked to /submit/new?package=X, because the original flow had a
 *   single path: fill the form, pay, go live. Once drafts existed that path
 *   became wrong for the exact person we most want to convert — someone who has
 *   already written a listing, hit the package wall, and come to pricing to pay.
 *   Sending them to a blank form asks them to type it all a second time.
 *
 * THE RULE
 *   Has drafts  → pay for one of those, on the dashboard.
 *   No drafts   → the form, as before.
 *   Logged out  → the form, as before. Registration happens on the way.
 *
 * Failure is not fatal: if the draft check errors or is slow, the link stays on
 * the original path. A visitor never gets a dead button while we wait.
 */
export default function PlanCta({
  pkg,
  label,
  className,
}: {
  pkg: string
  label: string
  className: string
}) {
  const [draftCount, setDraftCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data: { session } } = await createBrowserClient().auth.getSession()
        if (!session) return
        const res = await fetch('/api/owner/listings', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (!res.ok) return
        const json = await res.json()
        const n = (json?.listings ?? []).filter(
          (l: { listing_status?: string }) => l.listing_status === 'draft',
        ).length
        if (!cancelled) setDraftCount(n)
      } catch {
        // Leave the CTA on its default path.
      }
    })()
    return () => { cancelled = true }
  }, [])

  const hasDrafts = draftCount > 0
  const href = hasDrafts ? `/owner-dashboard?pay=${pkg}` : `/submit/new?package=${pkg}`

  return (
    <div>
      <Link href={href} className={className}>
        {hasDrafts ? 'ใช้กับประกาศฉบับร่าง' : label}
      </Link>
      {hasDrafts && (
        <p className="mt-2 text-center text-xs text-gray-500">
          คุณมีฉบับร่าง {draftCount} รายการ — ไม่ต้องกรอกใหม่
        </p>
      )}
    </div>
  )
}
