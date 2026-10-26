'use client'

import { useState, useCallback } from 'react'
import { trackEvent } from '@/lib/analytics'
import { C, RADIUS, WRAP, btnStyle, h2Style } from '@/lib/ui'
import Icon, { type IconName } from '@/components/ui/Icon'
import {
  MANAGE_T, PROPERTY_TYPE_VALUES, CHANNEL_VALUES,
  propertyTypeLabel, channelLabel,
  type Locale, type ChannelValue,
} from '@/lib/manage-i18n'

/**
 * The page copy lives in lib/manage-i18n, one copy per locale.
 *
 * Order (round 6 mockup, approved 26 Oct 2026): pitch with a building photo,
 * facts, why owners choose us (a 2×2 panel, never 3 + 1), services beside
 * photos, steps on a deep green band, then the enquiry form at #enquiry, which
 * the home page's management band links to. Section grounds alternate paper,
 * white, paper, green, white.
 */

/** Real listing photos from /public, so nothing here is stock. */
const PHOTOS = {
  building:  '/properties/metro-luxe-rama-4-unit-314-119-rent-bts-ekkamai.jpg',
  roomWhite: '/properties/bannai-ratchada-soi-5-mrt-soonwatthanatham.jpg',
  roomBed:   '/properties/p-apartment-charan-37-mrt-bang-khun-non.jpg',
  roomWood:  '/properties/domethong-apartment-bts-yaek-kor-por-or-sai-mai.jpg',
  kitchen:   '/properties/laidback-place-sukhumvit-71.jpg',
}

// Icons pair with the copy arrays in lib/manage-i18n by position.
const FACT_ICONS: IconName[]    = ['percent', 'trend', 'chart']
const WHY_ICONS: IconName[]     = ['home', 'coin', 'wrench', 'eye']
const SERVICE_ICONS: IconName[] = ['megaphone', 'userCheck', 'contract', 'card', 'wrench', 'team', 'trend']
const STEP_ICONS: IconName[]    = ['form', 'phone', 'search', 'sign', 'trend']
const POINT_ICONS: IconName[]   = ['clock', 'lock', 'pin']
/** Secondary text on the green steps band. */
const STEP_TEXT = '#cfe3d9'

function iconWell(size: number, bg: string, radius: number | string): React.CSSProperties {
  return { width: size, height: size, borderRadius: radius, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
}

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
  const wrap: React.CSSProperties = { maxWidth: WRAP, margin: '0 auto', boxSizing: 'border-box' }

  return (
    <div style={{ background: C.paper }}>

      {/* ── 1. Pitch: text left, building photo right ── */}
      <section style={{ ...wrap, padding: '56px 16px 48px', display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 520px', minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: C.teal, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="building" size={18} color={C.teal} />{t.eyebrow}
          </p>
          <h1 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 600, color: C.green, margin: '0 0 16px', lineHeight: 1.3 }}>{t.heroTitle}</h1>
          <p style={{ fontSize: 17, color: C.ink, lineHeight: 1.75, margin: '0 0 24px', maxWidth: 600 }}>{t.heroSub}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href="#enquiry" className="sm-btn-primary" style={{ ...btnStyle('primary'), gap: 8 }}>{t.heroCta}<Icon name="arrowDown" size={16} color={C.white} strokeWidth={2} /></a>
            <a href="https://line.me/R/ti/p/@spacesmate" target="_blank" rel="noopener noreferrer" className="sm-btn-ghost" style={{ ...btnStyle('ghost'), color: C.green, gap: 8 }}><Icon name="chat" size={18} color={C.green} />{t.heroLine}</a>
          </div>
        </div>
        <figure style={{ flex: '1 1 420px', minWidth: 0, margin: 0, position: 'relative' }}>
          <img src={PHOTOS.building} alt={t.heroPhotoAlt} style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
          <figcaption style={{ position: 'absolute', left: 16, bottom: 16, right: 16, width: 'fit-content', background: C.white, borderRadius: RADIUS, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: C.ink }}>
            <Icon name="pin" color={C.teal} />{t.heroPhotoCaption}
          </figcaption>
        </figure>
      </section>

      {/* facts */}
      <section style={{ ...wrap, padding: '0 16px 56px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', borderTop: `1px solid ${C.line}` }}>
          {t.facts.map((f, i) => (
            <div key={f.title} style={{ flex: '1 1 260px', display: 'flex', gap: 14, alignItems: 'flex-start', padding: '20px 20px 0 0' }}>
              <span style={iconWell(44, C.tint, 8)}><Icon name={FACT_ICONS[i]} size={22} color={C.green} /></span>
              <span>
                <span style={{ display: 'block', fontWeight: 600, color: C.green, fontSize: 15.5 }}>{f.title}</span>
                <span style={{ display: 'block', fontSize: 14, color: C.muted }}>{f.sub}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 2. Why: one panel, 2×2 with hairline dividers ── */}
      <section style={section(C.white)}>
        <div style={wrap}>
          <h2 style={{ ...h2Style(28), margin: '0 0 24px' }}>{t.whyTitle}</h2>
          <div style={{ border: `1px solid ${C.line}`, borderRadius: 8, overflow: 'hidden', background: C.white }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -1px -1px 0' }}>
              {t.why.map((w, i) => (
                <div key={w.title} style={{ flex: '1 1 440px', minWidth: 0, display: 'flex', gap: 18, alignItems: 'flex-start', padding: 28, borderBottom: `1px solid ${C.line}`, borderRight: `1px solid ${C.line}`, boxSizing: 'border-box' }}>
                  <span style={iconWell(52, C.green, '50%')}><Icon name={WHY_ICONS[i]} size={24} color={C.white} /></span>
                  <span>
                    <h3 style={{ fontWeight: 600, fontSize: 18, color: C.green, margin: '0 0 4px', lineHeight: 1.4 }}>{w.title}</h3>
                    <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, margin: 0 }}>{w.desc}</p>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Services: photos left, icon rows right ── */}
      <section style={section(C.paper)}>
        <div style={{ ...wrap, display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'stretch' }}>
          <div style={{ flex: '1 1 380px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <img src={PHOTOS.roomWhite} alt={t.photoAlts[0]} loading="lazy" style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <img src={PHOTOS.kitchen} alt={t.photoAlts[1]} loading="lazy" style={{ flex: '1 1 0', minWidth: 0, height: 150, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
              <img src={PHOTOS.roomWood} alt={t.photoAlts[2]} loading="lazy" style={{ flex: '1 1 0', minWidth: 0, height: 150, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
            </div>
          </div>
          <div style={{ flex: '1.3 1 480px', minWidth: 0 }}>
            <h2 style={{ ...h2Style(26), margin: '0 0 8px' }}>{t.servicesTitle}</h2>
            <p style={{ margin: '0 0 20px', color: C.muted, fontSize: 15 }}>{t.servicesSub}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', borderTop: `1px solid ${C.line}` }}>
              {t.services.map((sv, i) => (
                <div key={sv.title} style={{ flex: '1 1 240px', display: 'flex', gap: 14, padding: '16px 16px 16px 0', borderBottom: `1px solid ${C.line2}` }}>
                  <span style={iconWell(40, C.tint, 8)}><Icon name={SERVICE_ICONS[i]} color={C.teal} /></span>
                  <span>
                    <span style={{ display: 'block', fontWeight: 600, color: C.green, fontSize: 15.5 }}>{sv.title}</span>
                    <span style={{ display: 'block', fontSize: 14, color: C.muted, lineHeight: 1.6 }}>{sv.desc}</span>
                  </span>
                </div>
              ))}
              {/* Keeps the last row two-up when the count is odd. */}
              {t.services.length % 2 === 1 && <div aria-hidden style={{ flex: '1 1 240px' }} />}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Steps: deep green band, the last step in white ── */}
      <section style={{ background: C.green, padding: '56px 16px' }}>
        <div style={wrap}>
          <h2 style={{ ...h2Style(26), color: C.white, margin: '0 0 24px' }}>{t.stepsTitle}</h2>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {t.steps.map((st, i) => {
              const last = i === t.steps.length - 1
              return (
                <li key={st.n} style={{ flex: '1 1 190px', display: 'flex', flexDirection: 'column', gap: 8, borderRadius: 8, padding: 18,
                  background: last ? C.white : 'rgba(255,255,255,0.08)', border: `1px solid ${last ? C.white : 'rgba(255,255,255,0.18)'}` }}>
                  <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Icon name={STEP_ICONS[i]} size={26} color={last ? C.teal : STEP_TEXT} />
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500, color: last ? C.muted : STEP_TEXT }}>{st.n.padStart(2, '0')}</span>
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 15.5, color: last ? C.green : C.white }}>{st.title}</span>
                  <span style={{ fontSize: 14, color: last ? C.muted : STEP_TEXT }}>{st.desc}</span>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* ── 5. Enquiry form ── */}
      <section id="enquiry" style={{ ...section(C.white), borderTop: 'none', scrollMarginTop: 72, padding: '64px 16px 80px' }}>
        <div style={{ ...wrap, display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 400px', minWidth: 0 }}>
            <h2 style={{ ...h2Style(28), margin: '0 0 12px' }}>{t.formTitle}</h2>
            <p style={{ fontSize: 16, color: C.ink, lineHeight: 1.8, margin: '0 0 18px', maxWidth: 520 }}>{t.formSub}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
              {t.formPoints.map((pt, i) => (
                <li key={pt} style={{ fontSize: 15, color: C.ink, display: 'flex', gap: 10, alignItems: 'center' }}><Icon name={POINT_ICONS[i]} color={C.teal} />{pt}</li>
              ))}
            </ul>
            <img src={PHOTOS.roomBed} alt={t.photoAlts[3]} loading="lazy" className="sm-mg-formphoto" style={{ width: '100%', maxWidth: 520, height: 260, objectFit: 'cover', borderRadius: 8, display: 'block', marginTop: 24 }} />
          </div>

          <div style={{ flex: '1 1 460px', minWidth: 0, maxWidth: 560, background: C.paper, border: `1px solid ${C.line}`, borderRadius: 8, padding: 26, boxSizing: 'border-box' }}>
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
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 44, padding: '10px 6px', borderRadius: RADIUS, fontSize: 14.5, cursor: 'pointer', fontFamily: 'inherit',
                              border: `1px solid ${active ? C.teal : C.border}`, background: active ? C.tint : C.white, color: active ? C.green : C.ink, fontWeight: active ? 600 : 400 }}>
                            <Icon name={ch === 'LINE' ? 'chat' : 'phone'} size={18} color={active ? C.green : C.ink} />{channelLabel(ch, locale)}
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
                  {!loading && <Icon name="send" size={18} color={C.white} strokeWidth={1.8} />}
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
        @media (max-width: 580px) {
          .sm-mg-2 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          .sm-mg-formphoto { display: none !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
