'use client'

import { useState } from 'react'
import { CONTACT_T, type Locale } from '@/lib/pages-i18n'
import { trackEvent } from '@/lib/analytics'
import Link from '@/components/ui/LocaleLink'
import { C, RADIUS, WRAP, btnStyle, h2Style } from '@/lib/ui'
import { useCompany } from '@/components/layout/SiteInfoContext'
import { lineUrl, telHref, companyAddress } from '@/lib/site-config'


export default function ContactBody({ locale = 'th' }: { locale?: Locale }) {
  const t = CONTACT_T[locale]
  // LINE, email, phone and address from Dashboard › ตั้งค่า › ข้อมูลบริษัท.
  const company = useCompany()

  // `value` is what gets submitted and what trackEvent records, so it stays the
  // Thai literal in both locales. Translating it would file English enquiries
  // under a different interest than Thai ones and split the analytics.
  const INTENTS = [
    { value: 'นักลงทุน',        label: t.interestInvestor },
    { value: 'พันธมิตรธุรกิจ', label: t.interestPartner },
  ]

  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [sendFailed, setSendFailed] = useState(false)
  const [form,      setForm]      = useState({ name: '', phone: '', email: '', intent: '', message: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    if (name === 'phone') {
      setForm(prev => ({ ...prev, phone: value.replace(/\D/g, '').slice(0, 10) }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
    if (error) setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSendFailed(false)

    // Validate phone
    const digits = form.phone.replace(/\D/g, '')
    if (!digits)              { setError(t.errPhoneRequired); return }
    if (digits.length !== 10) { setError(t.errPhoneLength); return }
    if (!/^0[2-9]/.test(digits)) { setError(t.errPhoneFormat); return }

    setLoading(true)
    try {
      const res = await fetch('/api/contact-lead', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, phone: digits }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        if (json.error === 'email_failed') {
          setSendFailed(true)
          throw new Error(t.errSendFailed)
        }
        throw new Error(json.error || `HTTP ${res.status}`)
      }
      trackEvent('contact_form_submit', { intent: form.intent })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errGeneric)
    } finally {
      setLoading(false)
    }
  }

  const input: React.CSSProperties = {
    width: '100%', border: `1px solid ${C.border}`, borderRadius: RADIUS, padding: '11px 12px', fontSize: 15,
    fontFamily: 'inherit', background: C.white, color: C.ink, boxSizing: 'border-box',
  }
  const label: React.CSSProperties = { fontSize: 14, fontWeight: 500, color: C.ink, display: 'block', marginBottom: 6 }
  const card: React.CSSProperties = { background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS, padding: 22 }
  const channels: Array<{ k: string; v: React.ReactNode; note?: string }> = [
    { k: 'LINE', v: <a href={lineUrl(company)} target="_blank" rel="noopener noreferrer" style={{ color: C.teal, textDecoration: 'none' }}>{company.line_oa}</a>, note: t.lineNote },
    { k: t.email, v: <a href={`mailto:${company.email}`} style={{ color: C.teal, textDecoration: 'none' }}>{company.email}</a> },
    { k: t.phone, v: <a href={telHref(company)} style={{ color: C.teal, textDecoration: 'none' }}>{company.phone}</a> },
    { k: t.office, v: companyAddress(company, locale) },
    { k: t.hours, v: t.hoursValue, note: t.hoursClosed },
  ]

  return (
    <div style={{ background: C.paper, padding: '40px 16px 72px' }}>
      <div style={{ maxWidth: WRAP, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(26px, 3.4vw, 34px)', fontWeight: 600, color: C.green, margin: '0 0 6px' }}>{t.pageTitle}</h1>
        <p style={{ fontSize: 16, color: C.muted, margin: '0 0 24px' }}>{t.pageSub}</p>

        <div className="sm-ct-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          {t.routes.map(r => (
            <div key={r.title} style={card}>
              <h2 style={{ ...h2Style(18), margin: '0 0 6px' }}>{r.title}</h2>
              <p style={{ fontSize: 14.5, color: C.ink, lineHeight: 1.65, margin: '0 0 12px' }}>{r.desc}</p>
              {r.href.startsWith('http')
                ? <a href={r.href} target="_blank" rel="noopener noreferrer" style={{ color: C.teal, fontSize: 15, textDecoration: 'none' }}>{r.cta}</a>
                : <Link href={r.href} style={{ color: C.teal, fontSize: 15, textDecoration: 'none' }}>{r.cta}</Link>}
            </div>
          ))}
        </div>

        <div className="sm-ct-2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: 24, alignItems: 'start' }}>
          <div style={card}>
            <h2 style={{ ...h2Style(18), margin: '0 0 12px' }}>{t.channels}</h2>
            <dl style={{ margin: 0 }}>
              {channels.map((c, i) => (
                <div key={c.k} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 12, padding: '11px 0', borderTop: i ? `1px solid ${C.line2}` : 'none', fontSize: 15 }}>
                  <dt style={{ color: C.muted }}>{c.k}</dt>
                  <dd style={{ margin: 0, color: C.ink, lineHeight: 1.6 }}>
                    {c.v}
                    {c.note && <span style={{ display: 'block', fontSize: 13.5, color: C.muted }}>{c.note}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div style={card}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '28px 0' }}>
                <p style={{ fontSize: 30, color: C.teal, margin: '0 0 6px' }}>✓</p>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: C.green, margin: '0 0 6px' }}>{t.sentTitle}</h3>
                <p style={{ color: C.muted, fontSize: 15, margin: 0 }}>{t.sentBody}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
                <div>
                  <h2 style={{ ...h2Style(18), margin: '0 0 4px' }}>{t.investorTitle}</h2>
                  <p style={{ fontSize: 14.5, color: C.muted, margin: 0 }}>{t.investorSub}</p>
                </div>
                <div>
                  <label htmlFor="ct-name" style={label}>{t.fullName} *</label>
                  <input id="ct-name" name="name" value={form.name} onChange={handleChange} required placeholder={t.namePlaceholder} style={input} />
                </div>
                <div className="sm-ct-f2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label htmlFor="ct-phone" style={label}>{t.phoneLabel} *</label>
                    <input id="ct-phone" name="phone" value={form.phone} onChange={handleChange} required inputMode="numeric" placeholder="0XXXXXXXXX" style={input} />
                  </div>
                  <div>
                    <label htmlFor="ct-email" style={label}>{t.email}</label>
                    <input id="ct-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" style={input} />
                  </div>
                </div>
                <div>
                  <span style={label}>{t.interest}</span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {INTENTS.map(opt => {
                      const active = form.intent === opt.value
                      return (
                        <button key={opt.value} type="button" aria-pressed={active}
                          onClick={() => setForm(prev => ({ ...prev, intent: active ? '' : opt.value }))}
                          style={{ padding: '9px 16px', borderRadius: RADIUS, fontSize: 14.5, cursor: 'pointer', fontFamily: 'inherit',
                            border: `1px solid ${active ? C.teal : C.border}`, background: active ? C.tint : C.white, color: active ? C.green : C.ink, fontWeight: active ? 600 : 400 }}>
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <label htmlFor="ct-msg" style={label}>{t.details}</label>
                  <textarea id="ct-msg" name="message" value={form.message} onChange={handleChange} rows={4} placeholder={t.detailsPlaceholder} style={{ ...input, resize: 'vertical' }} />
                </div>
                {error && (
                  <p role="alert" style={{ fontSize: 13.5, color: '#b42318', margin: 0 }}>{error}{sendFailed && (
                    <>{' '}<a href={lineUrl(company)} target="_blank" rel="noopener noreferrer" style={{ color: C.teal, fontWeight: 600 }}>{company.line_oa}</a></>
                  )}</p>
                )}
                <button type="submit" disabled={loading} className="sm-btn-primary" style={{ ...btnStyle('primary'), width: '100%', opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}>
                  {loading ? t.sending : t.send}
                </button>
                <p style={{ fontSize: 13, color: C.muted, textAlign: 'center', margin: 0 }}>{t.privacyNote}</p>
              </form>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) { .sm-ct-3 { grid-template-columns: 1fr !important; } .sm-ct-2 { grid-template-columns: 1fr !important; } }
        @media (max-width: 520px) { .sm-ct-f2 { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
