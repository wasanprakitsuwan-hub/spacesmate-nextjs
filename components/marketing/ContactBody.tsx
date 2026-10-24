'use client'

import { useState } from 'react'
import { CONTACT_T, type Locale } from '@/lib/pages-i18n'
import { trackEvent } from '@/lib/analytics'


export default function ContactBody({ locale = 'th' }: { locale?: Locale }) {
  const t = CONTACT_T[locale]

  // `value` is what gets submitted and what trackEvent records, so it stays the
  // Thai literal in both locales. Translating it would file English enquiries
  // under a different interest than Thai ones and split the analytics.
  const INTENTS = [
    { value: 'นักลงทุน',        label: t.interestInvestor, icon: 'finance'   },
    { value: 'พันธมิตรธุรกิจ', label: t.interestPartner,  icon: 'handshake' },
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

  return (
    <div className="bg-white min-h-screen">

      {/* Header */}
      <div className="bg-spacemate-brandDark py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">{t.heroTitle} SpacesMate</h1>
          <p className="text-white/70 text-base font-light">{t.heroSub}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Info */}
          <div>
            <h2 className="text-xl font-semibold text-spacemate-brandDark mb-6">{t.channels}</h2>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-spacemate-bgLight flex items-center justify-center flex-shrink-0 text-spacemate-brandTeal">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-spacemate-textCharcoal">{t.email}</p>
                  <a href="mailto:support@spacesmate.com" className="text-sm text-gray-500 hover:text-spacemate-brandTeal">support@spacesmate.com</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-spacemate-bgLight flex items-center justify-center flex-shrink-0 text-spacemate-brandTeal">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-spacemate-textCharcoal">{t.phone}</p>
                  <a href="tel:020125190" className="text-sm text-gray-500 hover:text-spacemate-brandTeal">02-012-5190</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-spacemate-bgLight flex items-center justify-center flex-shrink-0 text-spacemate-brandTeal">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-spacemate-textCharcoal">LINE@</p>
                  <a href="https://line.me/R/ti/p/@spacesmate" className="text-sm text-spacemate-brandTeal hover:underline">@spacesmate</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-spacemate-bgLight flex items-center justify-center flex-shrink-0 text-spacemate-brandTeal">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-spacemate-textCharcoal">{t.office}</p>
                  <p className="text-sm text-gray-500">{t.officeLine0}<br />{t.officeLine1}<br />{t.officeLine2}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-5 rounded-2xl bg-spacemate-bgLight border border-spacemate-borderLight">
              <p className="text-xs text-gray-500 font-medium mb-2">{t.hours}</p>
              <p className="text-sm text-spacemate-textCharcoal">{t.hoursValue}</p>
              <p className="text-sm text-gray-400 mt-1">{t.hoursClosed}</p>
            </div>
          </div>

          {/* Form */}
          <div>
            {submitted ? (
              <div className="text-center py-16">
                <div className="mb-4">
                  <span className="msym" style={{ fontSize: 44, color: '#048c73', fontVariationSettings: "'wght' 400, 'FILL' 1" }}>check_circle</span>
                </div>
                <h3 className="text-xl font-semibold text-spacemate-brandDark mb-2">{t.sentTitle}</h3>
                <p className="text-gray-500 text-sm">{t.sentBody}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-xl font-semibold text-spacemate-brandDark mb-6">{t.formTitle}</h2>

                {/* Name */}
                <div>
                  <label className="label block mb-1.5">{t.fullName} *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder={t.namePlaceholder}
                    className="input-field w-full"
                  />
                </div>

                {/* Phone + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label block mb-1.5">{t.phoneLabel} *</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      inputMode="numeric"
                      placeholder="0XXXXXXXXX"
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="label block mb-1.5">{t.email}</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      className="input-field w-full"
                    />
                  </div>
                </div>

                {/* Intent pills */}
                <div>
                  <label className="label block mb-2">{t.interest}</label>
                  <div className="flex gap-3 flex-wrap">
                    {INTENTS.map(opt => {
                      const active = form.intent === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, intent: active ? '' : opt.value }))}
                          style={{
                            display:       'flex',
                            alignItems:    'center',
                            gap:           8,
                            padding:       '10px 20px',
                            borderRadius:  100,
                            border:        active ? '2px solid #02402e' : '1.5px solid #e2e8f0',
                            background:    active ? '#02402e' : '#fff',
                            color:         active ? '#fff' : '#475569',
                            fontWeight:    active ? 600 : 400,
                            fontSize:      14,
                            cursor:        'pointer',
                            transition:    'all .15s',
                          }}
                        >
                          <span className="msym" style={{ fontSize: 18, fontVariationSettings: active ? "'wght' 400, 'FILL' 1" : "'wght' 300, 'FILL' 0" }}>
                            {opt.icon}
                          </span>
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="label block mb-1.5">{t.details}</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder={t.detailsPlaceholder}
                    className="input-field w-full resize-none"
                  />
                </div>

                {/* Error */}
                {error && (
                  <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}{sendFailed && (
                    <>
                      {' '}
                      <a href="https://line.me/R/ti/p/@spacesmate" target="_blank" rel="noopener noreferrer"
                        style={{ color: '#06C755', fontWeight: 700, textDecoration: 'underline' }}>@spacesmate</a>
                    </>
                  )}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                  style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? (
                    <><span className="msym" style={{ fontSize: 16, animation: 'spin 1s linear infinite', marginRight: 6, verticalAlign: 'middle' }}>autorenew</span>{t.sending}</>
                  ) : (
                    <>{t.send}<span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 300, 'FILL' 0", marginLeft: 6, verticalAlign: 'middle' }}>arrow_forward</span></>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  {t.privacyNote}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
