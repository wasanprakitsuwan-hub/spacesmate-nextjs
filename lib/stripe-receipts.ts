/**
 * Footer printed on every Stripe invoice/receipt PDF for a one-time payment.
 *
 * Stripe's own invoice settings (Dashboard → Settings → Invoices / Public
 * details) supply the seller name, address and logo. This only adds the legal
 * entity, so the PDF names the company that actually received the money.
 *
 * This is a payment receipt, not a ใบกำกับภาษี (tax invoice). Once Space Works
 * is VAT-registered, the planned SpacesMate Thai receipt should replace these
 * PDFs; Stripe's layout cannot carry the Thai tax-invoice fields.
 */
export const RECEIPT_FOOTER =
  'บริษัท เสปซเวิร์คส จำกัด (Space Works Co., Ltd.) · ทะเบียนนิติบุคคลเลขที่ 0105569001611 · spacesmate.com'
