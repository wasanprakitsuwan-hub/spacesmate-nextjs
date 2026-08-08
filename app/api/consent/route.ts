import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * Records a consent decision.
 *
 * Section 19 of the PDPA requires consent to be demonstrable. Until now the
 * cookie banner's answer lived only in the visitor's own localStorage, and the
 * listing form's tick was never sent anywhere at all — so nothing could be
 * produced if anyone asked.
 *
 * PUBLIC AND UNAUTHENTICATED, ON PURPOSE
 *   The people whose consent most needs recording are anonymous visitors. There
 *   is nobody to authenticate.
 *
 *   That makes this endpoint writable by anyone, so it is deliberately narrow:
 *   it accepts two known `kind` values, stores a small fixed shape, and returns
 *   nothing useful. It has no read route — a consent log readable from the
 *   browser would be a list of who visited the site.
 *
 *   Worst case someone writes junk rows into an append-only table. Annoying;
 *   not a disclosure.
 *
 * WHAT IS NOT RECORDED
 *   No IP address, no user agent. The instinct is to log everything "to prove
 *   it was really them", which builds a tracking database in order to comply
 *   with a privacy law. What must be shown is what was agreed, to which version
 *   of the notice, and when.
 */

const KINDS = new Set(['cookies', 'listing_submission'])

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const kind = String(body.kind ?? '')
    if (!KINDS.has(kind)) {
      return NextResponse.json({ error: 'unknown kind' }, { status: 400 })
    }

    const action = body.action === 'withdrawn' ? 'withdrawn' : 'granted'
    const noticeVersion = Number.isFinite(Number(body.notice_version))
      ? Number(body.notice_version)
      : 1

    // Cap the stored payload. This is a public endpoint; without a bound it is
    // an invitation to write arbitrary JSON into the database.
    const granted = body.granted && typeof body.granted === 'object'
      ? JSON.parse(JSON.stringify(body.granted).slice(0, 500))
      : {}

    const subjectRef = body.subject_ref
      ? String(body.subject_ref).slice(0, 64)
      : null

    const supabase = createServerClient()
    const { error } = await supabase.from('consent_records').insert({
      kind,
      subject_ref:    subjectRef,
      user_id:        body.user_id || null,
      notice_version: noticeVersion,
      granted,
      action,
    })

    // Fail loudly in the log, quietly to the caller. A failure here must never
    // block the visitor's actual choice from taking effect in their browser —
    // but it must not pass silently either, because a consent log that has been
    // failing since March is worse than no log, having created the impression
    // that evidence exists.
    if (error) {
      console.error('[consent] insert failed —', error.message)
      return NextResponse.json({ recorded: false }, { status: 500 })
    }

    return NextResponse.json({ recorded: true }, { status: 201 })
  } catch (err) {
    console.error('[consent]', err instanceof Error ? err.message : String(err))
    return NextResponse.json({ recorded: false }, { status: 500 })
  }
}
