'use client'

import { useEffect, useState } from 'react'
import { CONSENT_T } from '@/lib/pages-i18n'
import { useLocale } from '@/lib/use-locale'
// Link here is LocaleLink: it keeps the reader in the language they are already
// reading, so an href written as a Thai path resolves to its English
// counterpart on /en/* pages. An href with no English page passes through
// unchanged. The list of which is in lib/routes-i18n, deliberately not
// repeated here — it was copied into 16 files and went stale in all of them
// the moment /manage and /blog got English pages. See
// components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import { readConsent, writeConsent, onConsentChange, type Consent } from '@/lib/consent'
import { usePathname } from 'next/navigation'
import { thPath } from '@/lib/routes-i18n'
import { isFunnelPath } from '@/lib/funnel'

/**
 * Cookie consent banner.
 *
 * DESIGN RULES THIS FOLLOWS
 *
 *   Accept and Reject carry equal weight. A refuse button hidden in a submenu,
 *   or styled as a faint link beside a large coloured Accept, is not a free
 *   choice — and consent that was not freely given is not consent.
 *
 *   Rejecting is one click, exactly like accepting. No "manage preferences"
 *   maze in between.
 *
 *   Nothing is stored before a decision. (GA4 loads under Consent Mode with
 *   every signal denied; see ConsentDefaults.) The banner does not pre-tick the optional
 *   categories, because a pre-ticked box is the site deciding, not the visitor.
 *
 *   Necessary cookies are stated, not offered. Presenting a toggle nobody can
 *   meaningfully switch off would be decoration.
 *
 *   Thai first — this is a Bangkok product — with English underneath, matching
 *   how the rest of the site addresses its dual audience.
 */

export default function ConsentBanner() {
  const t = CONSENT_T[useLocale()]
  // On the owner funnel (Facebook ad traffic) a one-line bar that sits above
  // the sticky call to action instead of covering the hero. Same two equal
  // choices; per-category settings stay in the footer's cookie settings link.
  const compact = isFunnelPath(thPath(usePathname() ?? ''))

  const [decided, setDecided] = useState<Consent | null | undefined>(undefined)
  const [detail,  setDetail]  = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    setDecided(readConsent())
    return onConsentChange(setDecided)
  }, [])

  // undefined = not yet read from storage. Rendering nothing avoids the banner
  // flashing on every page load for visitors who decided months ago.
  if (decided === undefined || decided !== null) return null

  const acceptAll = () => writeConsent({ analytics: true,  marketing: true })
  const rejectAll = () => writeConsent({ analytics: false, marketing: false })
  const saveChoice = () => writeConsent({ analytics, marketing })

  if (compact) {
    const b: React.CSSProperties = { height: 36, padding: '0 14px', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', flexShrink: 0 }
    return (
      <div role="dialog" aria-modal="false" aria-label={t.dialogLabel}
        style={{
          position: 'fixed', left: 10, right: 10, zIndex: 9999,
          bottom: 'calc(84px + env(safe-area-inset-bottom, 0px))',
          maxWidth: 560, margin: '0 auto',
          background: '#fff', border: '1px solid #dcd8ce', borderRadius: 10,
          boxShadow: '0 6px 20px -10px rgba(2,64,46,0.25)',
          padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8,
        }}>
        <p style={{ margin: 0, flex: 1, fontSize: 12, lineHeight: 1.45, color: '#231f20' }}>
          {t.compactText}{' '}
          <Link href="/privacy" style={{ color: '#037a64', textDecoration: 'underline' }}>{t.privacyLink}</Link>
        </p>
        <button type="button" onClick={rejectAll} style={{ ...b, background: '#fff', border: '1px solid #dcd8ce', color: '#231f20' }}>{t.compactReject}</button>
        <button type="button" onClick={acceptAll} style={{ ...b, background: '#037a64', border: '1px solid #037a64', color: '#fff' }}>{t.compactAccept}</button>
      </div>
    )
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={t.dialogLabel}
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 9999,
        background: '#fff', borderTop: '1.5px solid #eef0ef',
        boxShadow: '0 -8px 30px -12px rgba(2,64,46,0.18)',
        padding: '18px 20px calc(18px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>

        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#231f20' }}>
          <strong style={{ color: '#02402e' }}>{t.weUseCookies}</strong>{' '}
          {t.intro}{' '}
          <Link href="/privacy" style={{ color: '#048c73', textDecoration: 'underline' }}>
            {t.privacyLink}
          </Link>
        </p>

        <p style={{ margin: '6px 0 0', fontSize: 12.5, lineHeight: 1.55, color: '#64748b' }}>
          {t.introAlt}
        </p>

        {detail && (
          <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
            <Row
              on={true} disabled
              title={t.necessary}
              desc={t.necessaryDesc}
            />
            <Row
              on={analytics} onToggle={() => setAnalytics(v => !v)}
              title={t.analytics}
              desc={t.analyticsDesc}
            />
            <Row
              on={marketing} onToggle={() => setMarketing(v => !v)}
              title={t.marketing}
              desc={t.marketingDesc}
            />
          </div>
        )}

        {/* Accept and reject are the same size, same shape, same prominence.
            The only visual difference is fill versus outline, which reads as
            "primary action" rather than "correct answer". */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
          {detail ? (
            <button onClick={saveChoice} style={btnFilled}>{t.save}</button>
          ) : (
            <button onClick={acceptAll} style={btnFilled}>{t.acceptAll}</button>
          )}

          <button onClick={rejectAll} style={btnOutline}>{t.rejectAll}</button>

          {!detail && (
            <button onClick={() => setDetail(true)} style={btnQuiet}>
              {t.customise}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ on, onToggle, disabled, title, desc }: {
  on: boolean; onToggle?: () => void; disabled?: boolean; title: string; desc: string
}) {
  return (
    <label style={{
      display: 'flex', gap: 11, alignItems: 'flex-start', cursor: disabled ? 'default' : 'pointer',
      background: '#f8fafc', borderRadius: 12, padding: '11px 13px',
    }}>
      <input
        type="checkbox" checked={on} disabled={disabled} onChange={onToggle}
        style={{ width: 17, height: 17, accentColor: '#048c73', marginTop: 2, flexShrink: 0 }}
      />
      <span>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#02402e' }}>{title}</span>
        <span style={{ display: 'block', fontSize: 12, color: '#64748b', marginTop: 2, lineHeight: 1.5 }}>
          {desc}
        </span>
      </span>
    </label>
  )
}

const btnBase: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
  padding: '12px 22px', borderRadius: 24, cursor: 'pointer',
  minHeight: 44,   // thumb target on a phone
}
const btnFilled: React.CSSProperties = {
  ...btnBase, background: '#02402e', color: '#fff', border: '1.5px solid #02402e',
}
const btnOutline: React.CSSProperties = {
  ...btnBase, background: '#fff', color: '#02402e', border: '1.5px solid #02402e',
}
const btnQuiet: React.CSSProperties = {
  ...btnBase, background: 'transparent', color: '#64748b', border: '1.5px solid transparent',
}
