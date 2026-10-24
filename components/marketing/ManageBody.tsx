'use client'

import { useState, useCallback } from 'react'
import { trackEvent } from '@/lib/analytics'
import {
  MANAGE_T, PROPERTY_TYPE_VALUES, CHANNEL_VALUES,
  propertyTypeLabel, channelLabel,
  type Locale, type ChannelValue,
} from '@/lib/manage-i18n'

/**
 * The WHY / SERVICES / STEPS arrays that used to sit here are in lib/manage-i18n
 * now, one copy per locale. They were data, not markup, so they translate like
 * every other string on the page.
 */

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * Rendered by both /manage (Thai) and /en/manage (English). Thai is the default
 * so the existing route is unchanged.
 */
export default function ManageBody({ locale = 'th' }: { locale?: Locale }) {
  const t = MANAGE_T[locale]
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [sendFailed, setSendFailed] = useState(false)

  const [name,     setName]     = useState('')
  const [phone,    setPhone]    = useState('')
  // Submitted to /api/manage-lead, which writes them to a Google Sheet and the
  // founder's notification email. Thai in both locales — see lib/manage-i18n.
  const [type,     setType]     = useState<string>(PROPERTY_TYPE_VALUES[0])
  const [location, setLocation] = useState('')
  const [channel,  setChannel]  = useState<ChannelValue>(CHANNEL_VALUES[0])

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) { setError(t.needName); return }
    const digits = phone.replace(/\D/g, '')
    if (!digits)                   { setError(t.needPhone); return }
    if (digits.length !== 10)      { setError(t.phoneLength); return }
    if (!/^0[2-9]/.test(digits))   { setError(t.phoneFormat); return }

    setError('')
    setSendFailed(false)
    setLoading(true)
    try {
      const res = await fetch('/api/manage-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone: digits, type, location, channel }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        if (j.error === 'email_failed') {
          setSendFailed(true)
          throw new Error(t.sendFailed)
        }
        throw new Error(j.error || t.genericError)
      }
      trackEvent('management_form_submit', { property_type: type, preferred_channel: channel })
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError)
    } finally {
      setLoading(false)
    }
  }, [name, phone, type, location, channel, t])

  return (
    <div>

      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#02402e', padding: '52px 24px 56px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#d97f11', margin: '0 0 14px' }}>
            {t.eyebrow}
          </p>
          <h1 style={{ fontSize: 'clamp(28px,3.8vw,42px)', fontWeight: 700, color: '#fff', margin: '0 0 14px', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
            {t.heroLine1}<br />{t.heroLine2}
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.78)', fontWeight: 300, lineHeight: 1.65, margin: 0 }}>
            {t.heroSub}
          </p>
        </div>
      </section>

      {/* ── 2. WHY ───────────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(20px,2.8vw,28px)', fontWeight: 700, color: '#1a1a1a', textAlign: 'center', margin: '0 0 8px' }}>
            {t.whyTitle}
          </h2>
          <p style={{ fontSize: 15, color: '#6b7280', textAlign: 'center', fontWeight: 300, margin: '0 0 40px' }}>
            {t.whySub}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }} className="sm-why4">
            {t.why.map(w => (
              <div key={w.icon} style={{ border: '1px solid #e8edeb', borderRadius: 16, padding: '26px 20px', background: '#fff' }}>
                {/* teal solid circle icon */}
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#048c73', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <span className="msym" style={{ fontSize: 26, color: '#fff', lineHeight: 1 }}>{w.icon}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px' }}>{w.title}</h3>
                <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.6, margin: 0, fontWeight: 300 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. SERVICES ──────────────────────────────────────────────────── */}
      <section style={{ background: '#f5f8f6', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(20px,2.8vw,28px)', fontWeight: 700, color: '#1a1a1a', textAlign: 'center', margin: '0 0 8px' }}>
            {t.servicesTitle}
          </h2>
          <p style={{ fontSize: 15, color: '#6b7280', textAlign: 'center', fontWeight: 300, margin: '0 0 40px' }}>
            {t.servicesSub}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="sm-svc3">
            {t.services.map(s => (
              <div key={s.icon} style={{ background: '#fff', border: '1px solid #e8edeb', borderRadius: 14, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                {/* teal light-bg rounded square */}
                <div style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 10, background: '#e6f4ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="msym" style={{ fontSize: 22, color: '#048c73', lineHeight: 1 }}>{s.icon}</span>
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>{s.title}</p>
                  <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.55, margin: 0, fontWeight: 300 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. STEPS + FORM ──────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '60px 24px 72px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 52, alignItems: 'start' }} className="sm-2col">

          {/* LEFT — Steps */}
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: '0 0 28px' }}>{t.stepsTitle}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {t.steps.map(s => (
                <div key={s.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {/* dark green rounded-square number */}
                  <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 10, background: '#048c73', color: '#fff', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {s.n}
                  </div>
                  <div style={{ paddingTop: 7 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>{s.title}</p>
                    <p style={{ fontSize: 14, color: '#6b7280', fontWeight: 300, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* speech-bubble note */}
            <div style={{ marginTop: 30, background: '#f5f8f6', border: '1px solid #e8edeb', borderRadius: 14, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span className="msym" style={{ fontSize: 22, flexShrink: 0, marginTop: 1, color: '#048c73', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>chat_bubble</span>
              <p style={{ fontSize: 13.5, color: '#6b7280', margin: 0, fontWeight: 300, lineHeight: 1.65 }}>
                {t.socialNote}
              </p>
            </div>
          </div>

          {/* RIGHT — Lead form */}
          <div style={{ background: '#fff', border: '1px solid #e8edeb', borderRadius: 20, padding: '28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
            {!sent ? (
              <>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>{t.formTitle}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', fontWeight: 300, margin: '0 0 22px', lineHeight: 1.55 }}>
                  {t.formSub}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                  {/* Name */}
                  <div>
                    <label style={{ fontSize: 13.5, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>{t.name}</label>
                    <input
                      value={name}
                      onChange={e => { setName(e.target.value); setError('') }}
                      placeholder={t.namePlaceholder}
                      style={{ width: '100%', border: '1px solid #dde3e0', borderRadius: 10, padding: '11px 14px', fontSize: 15, outline: 'none', fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box' as const }}
                      onFocus={e => { e.target.style.borderColor = '#048c73'; e.target.style.boxShadow = '0 0 0 3px rgba(4,140,115,0.1)' }}
                      onBlur={e => { e.target.style.borderColor = '#dde3e0'; e.target.style.boxShadow = 'none' }} />
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={{ fontSize: 13.5, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>{t.phone}</label>
                    <input
                      value={phone}
                      onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError('') }}
                      placeholder="0XXXXXXXXX"
                      inputMode="numeric"
                      style={{ width: '100%', border: '1px solid #dde3e0', borderRadius: 10, padding: '11px 14px', fontSize: 15, outline: 'none', fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box' as const }}
                      onFocus={e => { e.target.style.borderColor = '#048c73'; e.target.style.boxShadow = '0 0 0 3px rgba(4,140,115,0.1)' }}
                      onBlur={e => { e.target.style.borderColor = '#dde3e0'; e.target.style.boxShadow = 'none' }} />
                  </div>

                  {/* Type + Location */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 13.5, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>{t.propertyType}</label>
                      <select
                        value={type}
                        onChange={e => setType(e.target.value)}
                        style={{ width: '100%', border: '1px solid #dde3e0', borderRadius: 10, padding: '11px 12px', fontSize: 15, outline: 'none', fontFamily: 'inherit', background: '#fff', cursor: 'pointer', boxSizing: 'border-box' as const }}
                        onFocus={e => { e.target.style.borderColor = '#048c73' }}
                        onBlur={e => { e.target.style.borderColor = '#dde3e0' }}>
                        {PROPERTY_TYPE_VALUES.map(v => <option key={v} value={v}>{propertyTypeLabel(v, locale)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 13.5, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>{t.location}</label>
                      <input
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder={t.locationPlaceholder}
                        style={{ width: '100%', border: '1px solid #dde3e0', borderRadius: 10, padding: '11px 14px', fontSize: 15, outline: 'none', fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box' as const }}
                        onFocus={e => { e.target.style.borderColor = '#048c73'; e.target.style.boxShadow = '0 0 0 3px rgba(4,140,115,0.1)' }}
                        onBlur={e => { e.target.style.borderColor = '#dde3e0'; e.target.style.boxShadow = 'none' }} />
                    </div>
                  </div>

                  {/* Channel */}
                  <div>
                    <label style={{ fontSize: 13.5, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 8 }}>{t.channel}</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {CHANNEL_VALUES.map((ch) => {
                        const icons: Record<string, string> = { โทร: 'call', LINE: 'chat' }
                        const active = channel === ch
                        return (
                          <button key={ch} onClick={() => setChannel(ch)} type="button"
                            style={{ flex: 1, padding: '10px 6px', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all .15s', border: `1.5px solid ${active ? '#02402e' : '#dde3e0'}`, background: active ? '#02402e' : '#fff', color: active ? '#fff' : '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                            <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{icons[ch]}</span>{channelLabel(ch, locale)}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <p style={{ marginTop: 14, marginBottom: 0, fontSize: 13.5, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontWeight: 400 }}>
                    {error}{sendFailed && (
                    <>
                      {' '}
                      <a href="https://line.me/R/ti/p/@spacesmate" target="_blank" rel="noopener noreferrer"
                        style={{ color: '#06C755', fontWeight: 700, textDecoration: 'underline' }}>@spacesmate</a>
                    </>
                  )}
                  </p>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ width: '100%', marginTop: 18, background: loading ? '#b5c9c3' : '#d97f11', color: '#fff', fontWeight: 700, fontSize: 15.5, border: 'none', borderRadius: 28, padding: '14px 0', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {loading && (
                    <span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                  )}
                  {loading ? t.submitting : t.submit}
                </button>
                <p style={{ textAlign: 'center', fontSize: 12.5, color: '#9ca3af', margin: '10px 0 0', fontWeight: 300 }}>
                  {t.confidential}
                </p>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e6f4ee', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <span className="msym" style={{ fontSize: 32, color: '#048c73' }}>check_circle</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#02402e', margin: '0 0 10px' }}>{t.sentTitle}</h3>
                <p style={{ fontSize: 14.5, color: '#6b7280', margin: '0 0 22px', fontWeight: 300, lineHeight: 1.65 }}>
                  {t.sentBodyA}<br /><strong style={{ color: '#02402e' }}>{t.sentBodyB}</strong>
                </p>
                <button onClick={() => { setSent(false); setName(''); setPhone(''); setType(PROPERTY_TYPE_VALUES[0]); setLocation(''); setChannel(CHANNEL_VALUES[0]) }}
                  style={{ background: '#fff', color: '#374151', fontWeight: 600, fontSize: 14, border: '1px solid #dde3e0', borderRadius: 24, padding: '11px 24px', cursor: 'pointer' }}>
                  {t.sendAnother}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 960px) {
          .sm-why4  { grid-template-columns: repeat(2,1fr) !important; }
          .sm-svc3  { grid-template-columns: repeat(2,1fr) !important; }
          .sm-2col  { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 580px) {
          .sm-why4  { grid-template-columns: 1fr !important; }
          .sm-svc3  { grid-template-columns: 1fr !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
