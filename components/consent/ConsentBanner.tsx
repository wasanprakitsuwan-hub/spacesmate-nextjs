'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { readConsent, writeConsent, onConsentChange, type Consent } from '@/lib/consent'

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
 *   Nothing loads before a decision. The banner does not pre-tick the optional
 *   categories, because a pre-ticked box is the site deciding, not the visitor.
 *
 *   Necessary cookies are stated, not offered. Presenting a toggle nobody can
 *   meaningfully switch off would be decoration.
 *
 *   Thai first — this is a Bangkok product — with English underneath, matching
 *   how the rest of the site addresses its dual audience.
 */

export default function ConsentBanner() {
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

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="การตั้งค่าคุกกี้ / Cookie settings"
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 9999,
        background: '#fff', borderTop: '1.5px solid #eef0ef',
        boxShadow: '0 -8px 30px -12px rgba(2,64,46,0.18)',
        padding: '18px 20px calc(18px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>

        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#231f20' }}>
          <strong style={{ color: '#02402e' }}>เราใช้คุกกี้</strong>{' '}
          คุกกี้ที่จำเป็นทำให้เว็บไซต์ทำงานได้ และเปิดใช้งานอยู่เสมอ
          ส่วนคุกกี้เพื่อการวิเคราะห์และการตลาดจะใช้ก็ต่อเมื่อคุณอนุญาตเท่านั้น{' '}
          <Link href="/privacy" style={{ color: '#048c73', textDecoration: 'underline' }}>
            นโยบายความเป็นส่วนตัว
          </Link>
        </p>

        <p style={{ margin: '6px 0 0', fontSize: 12.5, lineHeight: 1.55, color: '#64748b' }}>
          Essential cookies keep the site working and are always on. Analytics and
          marketing cookies are used only if you allow them.
        </p>

        {detail && (
          <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
            <Row
              on={true} disabled
              title="จำเป็น · Essential"
              desc="เข้าสู่ระบบ ความปลอดภัย และการทำงานพื้นฐาน — ปิดไม่ได้"
            />
            <Row
              on={analytics} onToggle={() => setAnalytics(v => !v)}
              title="การวิเคราะห์ · Analytics"
              desc="ช่วยให้เราเข้าใจว่าหน้าไหนมีคนใช้งาน (Google Analytics)"
            />
            <Row
              on={marketing} onToggle={() => setMarketing(v => !v)}
              title="การตลาด · Marketing"
              desc="ใช้วัดผลโฆษณาบน Facebook และ Instagram"
            />
          </div>
        )}

        {/* Accept and reject are the same size, same shape, same prominence.
            The only visual difference is fill versus outline, which reads as
            "primary action" rather than "correct answer". */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
          {detail ? (
            <button onClick={saveChoice} style={btnFilled}>บันทึกการตั้งค่า · Save</button>
          ) : (
            <button onClick={acceptAll} style={btnFilled}>ยอมรับทั้งหมด · Accept all</button>
          )}

          <button onClick={rejectAll} style={btnOutline}>ปฏิเสธทั้งหมด · Reject all</button>

          {!detail && (
            <button onClick={() => setDetail(true)} style={btnQuiet}>
              ตั้งค่า · Customise
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
