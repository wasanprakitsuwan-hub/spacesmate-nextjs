'use client'

import { useCallback, useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { DASH_T, type Locale } from '@/lib/dashboard-i18n'
import { C, RADIUS } from '@/lib/ui'
import type { PaymentRow } from '@/app/api/owner/payments/route'

const PKG_NAME: Record<string, string> = { basic: 'Basic', standard: 'Standard', premium: 'Premium' }

/**
 * /owner-dashboard/payments — every payment the owner made, newest first, each
 * with its Stripe receipt. Read live from Stripe through /api/owner/payments.
 *
 * Every control is a text button (Founder rule, round 7): no icons.
 */
export default function PaymentsBody({ locale = 'th' }: { locale?: Locale }) {
  const t = DASH_T[locale]
  const [rows, setRows] = useState<PaymentRow[] | null>(null)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setError(false); setRows(null)
    try {
      const { data: { session } } = await createBrowserClient().auth.getSession()
      if (!session) return
      const r = await fetch(`/api/owner/payments?locale=${locale}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!r.ok) throw new Error()
      const d = await r.json()
      setRows(d.payments ?? [])
    } catch {
      setError(true)
    }
  }, [locale])

  useEffect(() => { load() }, [load])

  const dateFmt = (iso: string) => new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'th-TH', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok',
  })
  const money = (n: number, cur: string) => cur === 'THB'
    ? `฿${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
    : `${n.toLocaleString('en-US')} ${cur}`
  const kind = (k: PaymentRow['kind']) => k === 'renewal' ? t.payKindRenewal : k === 'subscription' ? t.payKindSub : t.payKindOnce
  const method = (m: string | null) => m === 'card' ? t.payMethodCard : m === 'promptpay' ? t.payMethodPromptpay : (m ?? '—')
  const status = (s: PaymentRow['status']) => s === 'refunded' ? t.payStatusRefunded : s === 'partially_refunded' ? t.payStatusPartRefunded : t.payStatusPaid

  const card: React.CSSProperties = { background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS }
  const textBtn = (primary: boolean): React.CSSProperties => ({
    display: 'inline-block', padding: '6px 12px', borderRadius: RADIUS, fontSize: 13, fontWeight: 500,
    textDecoration: 'none', whiteSpace: 'nowrap', fontFamily: 'inherit', cursor: 'pointer',
    background: primary ? C.teal : C.white, color: primary ? C.white : C.ink,
    border: `1px solid ${primary ? C.teal : C.border}`,
  })
  const th: React.CSSProperties = { textAlign: 'left', fontSize: 12, fontWeight: 500, color: C.muted, padding: '10px 14px', borderBottom: `1px solid ${C.line}` }
  const td: React.CSSProperties = { fontSize: 14, padding: '12px 14px', borderBottom: `1px solid ${C.line2}`, verticalAlign: 'top' }

  return (
    <div style={{ maxWidth: 1000, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`
        @media (max-width: 720px) {
          .sm-pay thead { display: none; }
          .sm-pay tr { display: block; padding: 12px 14px; border-bottom: 1px solid ${C.line2}; }
          .sm-pay td { display: block; border: none !important; padding: 2px 0 !important; }
          .sm-pay td.sm-pay-act { padding-top: 10px !important; }
        }
      `}</style>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: C.green, margin: 0 }}>{t.paymentsTitle}</h1>
        <span style={{ fontSize: 13, color: C.muted }}>{t.paymentsSub}</span>
      </div>

      {error ? (
        <div role="alert" style={{ ...card, padding: '18px 20px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, color: '#b42318' }}>{t.paymentsLoadFailed}</span>
          <button type="button" onClick={load} style={textBtn(false)}>{t.retry}</button>
        </div>
      ) : rows === null ? (
        <div style={{ ...card, padding: '28px 20px', fontSize: 14, color: C.muted }}>{t.loadingData}</div>
      ) : rows.length === 0 ? (
        <div style={{ ...card, padding: '28px 20px', fontSize: 14, color: C.muted }}>{t.noPayments}</div>
      ) : (
        <div style={{ ...card, overflow: 'hidden' }}>
          <table className="sm-pay" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>{t.payDate}</th>
                <th style={th}>{t.payItem}</th>
                <th style={{ ...th, textAlign: 'right' }}>{t.payAmount}</th>
                <th style={th}>{t.payMethod}</th>
                <th style={th}>{t.payStatus}</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{dateFmt(r.created)}</td>
                  <td style={td}>
                    <div style={{ fontWeight: 500 }}>
                      {r.package_id ? `${PKG_NAME[r.package_id] ?? r.package_id} · ` : ''}{kind(r.kind)}
                    </div>
                    {r.listing_title && <div style={{ fontSize: 13, color: C.muted }}>{r.listing_title}</div>}
                    {r.invoice_number && <div style={{ fontSize: 12, color: C.faint }}>{r.invoice_number}</div>}
                  </td>
                  <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap', color: C.amber, fontWeight: 500 }}>{money(r.amount, r.currency)}</td>
                  <td style={td}>{method(r.method)}</td>
                  <td style={{ ...td, color: r.status === 'paid' ? C.green : '#b42318' }}>{status(r.status)}</td>
                  <td className="sm-pay-act" style={{ ...td, textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {r.receipt_url && (
                        <a href={r.receipt_url} target="_blank" rel="noopener noreferrer" style={textBtn(true)}>{t.viewReceipt}</a>
                      )}
                      {r.invoice_pdf && (
                        <a href={r.invoice_pdf} target="_blank" rel="noopener noreferrer" style={textBtn(false)}>{t.downloadInvoicePdf}</a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ fontSize: 12.5, color: C.muted, margin: 0, lineHeight: 1.6 }}>{t.receiptNote}</p>
    </div>
  )
}
