'use client'

import { useState, useCallback } from 'react'
import { trackEvent } from '@/lib/analytics'
import { C, RADIUS, WRAP, btnStyle, h2Style } from '@/lib/ui'
import {
  MANAGE_T, PROPERTY_TYPE_VALUES, CHANNEL_VALUES,
  propertyTypeLabel, channelLabel,
  type Locale, type ChannelValue,
} from '@/lib/manage-i18n'

/**
 * The page copy lives in lib/manage-i18n, one copy per locale.
 *
 * Order (approved mockup, 25 Oct 2026): pitch, why owners choose us, how the
 * fee works (no percentage shown), services, steps, then the enquiry form at
 * #enquiry, which the home page's management band links to.
 */

/** Loose check only: catches typos like a missing @ or domain, not deliverability. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [phone,    setPhone]    = useState('')
  const [email,    setEmail]    = useState('')
  // Submitted to /api/manage-lead, which writes them to a Google Sheet and the
  // founder's notification email. Thai in both locales — see lib/manage-i18n.
  const [type,     setType]     = useState<string>(PROPERTY_TYPE_VALUES[0])
  const [location, setLocation] = useState('')
  const [building, setBuilding] = useState('')
  const [rooms,    setRooms]    = useState('')
  const [channel,  setChannel]  = useState<ChannelValue>(CHANNEL_VALUES[0])

  const handleSubmit = useCallback(async () => {
    if (!firstName.trim()) { setError(t.needFirstName); return }
    if (!lastName.trim())  { setError(t.needLastName); return }
    const digits = phone.replace(/\D/g, '')
    if (!digits)                   { setError(t.needPhone); return }
    if (digits.length !== 10)      { setError(t.phoneLength); return }
    if (!/^0[2-9]/.test(digits))   { setError(t.phoneFormat); return }
    if (!email.trim())             { setError(t.needEmail); return }
    if (!EMAIL_RE.test(email.trim())) { setError(t.emailFormat); return }

    setError('')
    setSendFailed(false)
    setLoading(true)
    try {
      const res = await fetch('/api/manage-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone: digits, email: email.trim(), type, location, channel, building, rooms }),
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
  }, [firstName, lastName, phone, email, type, location, channel, building, rooms, t])

  const input: React.CSSProperties = {
    width: '100%', border: `1px solid ${C.border}`, borderRadius: RADIUS, padding: '11px 12px', fontSize: 15,
    fontFamily: 'inherit', background: C.white, color: C.ink, boxSizing: 'border-box',
  }
  const label: React.CSSProperties = { fontSize: 14, fontWeight: 500, color: C.ink, display: 'block', marginBottom: 6 }
  const section = (bg: string): React.CSSProperties => ({ background: bg, padding: '56px 16px', borderTop: `1px solid ${C.line}` })
  const wrap: React.CSSProperties = { maxWidth: WRAP, margin: '0 auto' }

  return (
    <div style={{ background: C.paper }}>

      {/* ── 1. Pitch ── */}
      <section style={{ padding: '56px 16px 48px' }}>
        <div style={wrap}>
          <p style={{ fontSize: 14, fontWeight: 500, color: C.teal, margin: '0 0 12px' }}>{t.eyebrow}</p>
          <h1 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 600, color: C.green, margin: '0 0 16px', lineHeight: 1.25, maxWidth: 760 }}>{t.heroTitle}</h1>
          <p style={{ fontSize: 17, color: C.ink, lineHeight: 1.7, margin: '0 0 26px', maxWidth: 680 }}>{t.heroSub}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href="#enquiry" className="sm-btn-primary" style={btnStyle('primary')}>{t.heroCta}</a>
            <a href="https://line.me/R/ti/p/@spacesmate" target="_blank" rel="noopener noreferrer" className="sm-btn-ghost" style={btnStyle('ghost')}>{t.heroLine}</a>
          </div>
          <div className="sm-mg-facts" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 40, borderTop: `1px solid ${C.line}` }}>
            {t.facts.map((f, i) => (
              <div key={f.title} style={{ padding: '18px 20px 0 0', paddingLeft: i ? 20 : 0, borderLeft: i ? `1px solid ${C.line}` : 'none' }}>
                <p style={{ margin: 0, fontSize: 15.5, fontWeight: 600, color: C.green }}>{f.title}</p>
                <p style={{ margin: '3px 0 0', fontSize: 14, color: C.muted }}>{f.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Why ── */}
      <section style={section(C.white)}>
        <div style={wrap}>
          <h2 style={{ ...h2Style(26), margin: '0 0 28px' }}>{t.whyTitle}</h2>
          <div className="sm-mg-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 28 }}>
            {t.why.map((w, i) => (
              <div key={w.title} style={{ borderTop: `2px solid ${i === 0 ? C.green : C.line}`, paddingTop: 14 }}>
                <h3 style={{ fontSize: 16.5, fontWeight: 600, color: C.green, margin: '0 0 8px', lineHeight: 1.4 }}>{w.title}</h3>
                <p style={{ fontSize: 14.5, color: C.ink, lineHeight: 1.7, margin: 0 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. How the fee works. No percentage: the rate follows the assessment. ── */}
      <section style={section(C.paper)}>
        <div style={wrap}>
          <h2 style={{ ...h2Style(26), margin: '0 0 6px' }}>{t.feeTitle}</h2>
          <p style={{ fontSize: 15.5, color: C.muted, margin: '0 0 24px' }}>{t.feeSub}</p>
          <div className="sm-mg-fee" style={{ display: 'flex', alignItems: 'stretch', gap: 10 }}>
            {t.fee.map((f, i) => (
              <div key={f.title} style={{ display: 'contents' }}>
                {i > 0 && <span aria-hidden className="sm-mg-op" style={{ alignSelf: 'center', fontSize: 22, color: C.muted, flexShrink: 0 }}>{['−', '=', '→'][i - 1]}</span>}
                <div style={{
                  flex: 1, minWidth: 0, borderRadius: RADIUS, padding: '16px 16px',
                  background: i === 3 ? C.green : C.white, border: `1px solid ${i === 3 ? C.green : i === 2 ? C.teal : C.line}`,
                }}>
                  <p style={{ margin: 0, fontSize: 15.5, fontWeight: 600, color: i === 3 ? C.white : C.green }}>{f.title}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13.5, color: i === 3 ? 'rgba(255,255,255,.75)' : C.muted }}>{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 14, color: C.muted, margin: '16px 0 0', lineHeight: 1.65, maxWidth: 760 }}>{t.feeNote}</p>
        </div>
      </section>

      {/* ── 4. Services ── */}
      <section style={section(C.white)}>
        <div style={wrap}>
          <h2 style={{ ...h2Style(26), margin: '0 0 22px' }}>{t.servicesTitle}</h2>
          <div className="sm-mg-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: `1px solid ${C.line}` }}>
            {t.services.map(sv => (
              <div key={sv.title} style={{ padding: '16px 20px 16px 0', borderBottom: `1px solid ${C.line2}` }}>
                <p style={{ margin: 0, fontSize: 15.5, fontWeight: 600, color: C.green }}>{sv.title}</p>
                <p style={{ margin: '3px 0 0', fontSize: 14, color: C.muted, lineHeight: 1.6 }}>{sv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Steps ── */}
      <section style={section(C.paper)}>
        <div style={wrap}>
          <h2 style={{ ...h2Style(26), margin: '0 0 22px' }}>{t.stepsTitle}</h2>
          <ol className="sm-mg-5" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
            {t.steps.map(st => (
              <li key={st.n}>
                <span style={{ display: 'inline-flex', width: 28, height: 28, borderRadius: '50%', background: C.green, color: C.white, fontSize: 14, fontWeight: 600, alignItems: 'center', justifyContent: 'center' }}>{st.n}</span>
                <p style={{ margin: '10px 0 0', fontSize: 15.5, fontWeight: 600, color: C.green }}>{st.title}</p>
                <p style={{ margin: '3px 0 0', fontSize: 14, color: C.muted, lineHeight: 1.55 }}>{st.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 6. Enquiry form ── */}
      <section id="enquiry" style={{ ...section(C.white), scrollMarginTop: 72, paddingBottom: 72 }}>
        <div className="sm-mg-form" style={{ ...wrap, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 520px)', gap: 48, alignItems: 'start' }}>
          <div>
            <h2 style={{ ...h2Style(28), margin: '0 0 12px' }}>{t.formTitle}</h2>
            <p style={{ fontSize: 16, color: C.ink, lineHeight: 1.7, margin: '0 0 18px', maxWidth: 520 }}>{t.formSub}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
              {t.formPoints.map(pt => (
                <li key={pt} style={{ fontSize: 14.5, color: C.ink, display: 'flex', gap: 8 }}><span style={{ color: C.teal }}>✓</span>{pt}</li>
              ))}
            </ul>
          </div>

          <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: RADIUS, padding: 24 }}>
            {!sent ? (
              <>
                <div style={{ display: 'grid', gap: 14 }}>
                  <div className="sm-mg-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label htmlFor="mg-first-name" style={label}>{t.firstName}</label>
                      <input id="mg-first-name" value={firstName} onChange={e => { setFirstName(e.target.value); setError('') }} placeholder={t.firstNamePlaceholder} autoComplete="given-name" style={input} />
                    </div>
                    <div>
                      <label htmlFor="mg-last-name" style={label}>{t.lastName}</label>
                      <input id="mg-last-name" value={lastName} onChange={e => { setLastName(e.target.value); setError('') }} placeholder={t.lastNamePlaceholder} autoComplete="family-name" style={input} />
                    </div>
                  </div>
                  <div className="sm-mg-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label htmlFor="mg-phone" style={label}>{t.phone}</label>
                      <input id="mg-phone" value={phone} onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError('') }} placeholder="0XXXXXXXXX" inputMode="numeric" autoComplete="tel" style={input} />
                    </div>
                    <div>
                      <label htmlFor="mg-email" style={label}>{t.email}</label>
                      <input id="mg-email" type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }} placeholder="email@example.com" autoComplete="email" style={input} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="mg-building" style={label}>{t.building}</label>
                    <input id="mg-building" value={building} onChange={e => setBuilding(e.target.value)} placeholder={t.buildingPlaceholder} style={input} />
                  </div>
                  <div className="sm-mg-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label htmlFor="mg-type" style={label}>{t.propertyType}</label>
                      <select id="mg-type" value={type} onChange={e => setType(e.target.value)} style={{ ...input, cursor: 'pointer' }}>
                        {PROPERTY_TYPE_VALUES.map(v => <option key={v} value={v}>{propertyTypeLabel(v, locale)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="mg-rooms" style={label}>{t.rooms}</label>
                      <input id="mg-rooms" value={rooms} onChange={e => setRooms(e.target.value.replace(/\D/g, '').slice(0, 5))} placeholder={t.roomsPlaceholder} inputMode="numeric" style={input} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="mg-location" style={label}>{t.location}</label>
                    <input id="mg-location" value={location} onChange={e => setLocation(e.target.value)} placeholder={t.locationPlaceholder} style={input} />
                  </div>
                  <div>
                    <span style={label}>{t.channel}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {CHANNEL_VALUES.map(ch => {
                        const active = channel === ch
                        return (
                          <button key={ch} onClick={() => setChannel(ch)} type="button" aria-pressed={active}
                            style={{ flex: 1, padding: '10px 6px', borderRadius: RADIUS, fontSize: 14.5, cursor: 'pointer', fontFamily: 'inherit',
                              border: `1px solid ${active ? C.teal : C.border}`, background: active ? C.tint : C.white, color: active ? C.green : C.ink, fontWeight: active ? 600 : 400 }}>
                            {channelLabel(ch, locale)}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {error && (
                  <p role="alert" style={{ margin: '14px 0 0', fontSize: 13.5, color: '#b42318', background: '#fef3f2', border: '1px solid #fecdca', borderRadius: RADIUS, padding: '10px 12px' }}>
                    {error}{sendFailed && (
                      <>{' '}<a href="https://line.me/R/ti/p/@spacesmate" target="_blank" rel="noopener noreferrer" style={{ color: C.teal, fontWeight: 600 }}>@spacesmate</a></>
                    )}
                  </p>
                )}

                <button onClick={handleSubmit} disabled={loading} className="sm-btn-primary"
                  style={{ ...btnStyle('primary'), width: '100%', marginTop: 18, padding: '13px 16px', opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}>
                  {loading && <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />}
                  {loading ? t.submitting : t.submit}
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ fontSize: 30, color: C.teal, margin: '0 0 8px' }}>✓</p>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: C.green, margin: '0 0 8px' }}>{t.sentTitle}</h3>
                <p style={{ fontSize: 15, color: C.ink, margin: '0 0 20px', lineHeight: 1.65 }}>
                  {t.sentBodyA} <strong style={{ color: C.green }}>{t.sentBodyB}</strong>
                </p>
                <button onClick={() => { setSent(false); setFirstName(''); setLastName(''); setPhone(''); setEmail(''); setBuilding(''); setRooms(''); setType(PROPERTY_TYPE_VALUES[0]); setLocation(''); setChannel(CHANNEL_VALUES[0]) }}
                  className="sm-btn-ghost" style={btnStyle('ghost')}>
                  {t.sendAnother}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 960px) {
          .sm-mg-4 { grid-template-columns: repeat(2, 1fr) !important; }
          .sm-mg-3 { grid-template-columns: repeat(2, 1fr) !important; }
          .sm-mg-5 { grid-template-columns: repeat(3, 1fr) !important; }
          .sm-mg-form { grid-template-columns: 1fr !important; gap: 24px !important; }
          .sm-mg-fee { flex-direction: column; }
        }
        @media (max-width: 580px) {
          .sm-mg-facts, .sm-mg-4, .sm-mg-3, .sm-mg-2 { grid-template-columns: 1fr !important; }
          .sm-mg-facts > div { border-left: none !important; padding-left: 0 !important; }
          .sm-mg-5 { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
