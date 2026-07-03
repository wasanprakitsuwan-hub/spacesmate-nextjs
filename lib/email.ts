// SpacesMate · Email Notifications via Resend
// ─────────────────────────────────────────────────────────────────────────────
// Env vars required:
//   RESEND_API_KEY  — get from resend.com/api-keys
//   RESEND_FROM     — optional override; defaults to sandbox sender
//                     Set to 'SpacesMate <noreply@spacesmate.com>' once
//                     spacesmate.com is verified in the Resend dashboard.
//
// Trigger points:
//   1. /api/stripe/webhook  → checkout.session.completed (public submit + payment)
//   2. /api/owner/listings  → POST (owner dashboard create listing)
//   3. /api/submit-listing  → POST (legacy direct-submit route)

const RESEND_URL    = 'https://api.resend.com/emails'
const FOUNDER_EMAIL = 'wasan.prakitsuwan@gmail.com'

function fromAddress() {
  return process.env.RESEND_FROM ?? 'SpacesMate <onboarding@resend.dev>'
}

async function sendEmail(to: string[], subject: string, html: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('[email] RESEND_API_KEY not set — skipping notification')
    return
  }
  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: fromAddress(), to, subject, html }),
    })
    if (!res.ok) {
      const detail = await res.text()
      console.error('[email] Resend error:', res.status, detail)
    }
  } catch (err) {
    console.error('[email] fetch error:', err)
  }
}

// ── Shared data shape ─────────────────────────────────────────────────────────

export interface ListingEmailData {
  id?:           string
  title?:        string | null
  type?:         string | null
  price?:        string | number | null
  rentSuffix?:   string           // '/วัน' | '/เดือน' | '/3 เดือน' etc.
  sizeSqm?:      string | number | null
  bedrooms?:     string | number | null
  bathrooms?:    string | number | null
  address?:      string | null
  district?:     string | null
  province?:     string | null
  contactName?:  string | null
  contactPhone?: string | null
  contactEmail?: string | null
  packageType?:  string | null
  listingUrl?:   string | null    // full URL if known, e.g. spacesmate.com/property/slug
  source?:       'public_submit' | 'owner_dashboard' | 'admin'
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PACKAGE_LABEL: Record<string, string> = {
  basic:    'Basic — 1 เดือน (฿299)',
  standard: 'Standard — 3 เดือน (฿699)',
  premium:  'Premium — 12 เดือน (฿2,499)',
  admin:    'Admin (ไม่หมดอายุ)',
}

const SOURCE_LABEL: Record<string, string> = {
  public_submit:   'แบบฟอร์มสาธารณะ + ชำระผ่าน Stripe',
  owner_dashboard: 'Owner Dashboard',
  admin:           'Admin Dashboard',
}

function priceStr(data: ListingEmailData): string {
  if (!data.price) return '—'
  return `฿${Number(data.price).toLocaleString()}${data.rentSuffix ?? '/เดือน'}`
}

function locationStr(data: ListingEmailData): string {
  return [data.address, data.district, data.province].filter(Boolean).join(' · ') || '—'
}

function tableRow(label: string, value: string, valueStyle = ''): string {
  if (!value || value === '—') return ''
  return `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#94a3b8;width:130px;font-size:13.5px;vertical-align:top">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#1e293b;font-size:13.5px${valueStyle ? ';' + valueStyle : ''}">${value}</td>
  </tr>`
}

function layout(body: string, footerContent?: string): string {
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>body{margin:0;padding:0;background:#f0f5f3;font-family:'Prompt',Arial,sans-serif}*{box-sizing:border-box}</style>
</head>
<body>
  <div style="max-width:600px;margin:32px auto 48px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(2,64,46,0.10)">
    ${body}
    <div style="background:#f7f9f8;border-top:1px solid #eef0ef;padding:18px 32px;text-align:center">
      ${footerContent ?? '<p style="font-size:12px;color:#94a3b8;margin:0">SpacesMate · <a href="https://spacesmate.com" style="color:#048c73;text-decoration:none">spacesmate.com</a></p>'}
    </div>
  </div>
</body>
</html>`
}

// ── 1. Founder alert — new listing entered the system ────────────────────────

export async function sendNewListingAlert(data: ListingEmailData): Promise<void> {
  const roomStr = [
    data.bedrooms  ? `${data.bedrooms} นอน`  : '',
    data.bathrooms ? `${data.bathrooms} น้ำ` : '',
  ].filter(Boolean).join(' · ') || '—'

  const html = layout(`
  <!-- Header -->
  <div style="background:#02402e;padding:28px 32px 22px">
    <p style="color:#d97f11;font-size:11px;font-weight:700;margin:0 0 8px;text-transform:uppercase;letter-spacing:1.5px">SpacesMate · Admin Alert</p>
    <h1 style="color:#fff;font-size:21px;font-weight:700;margin:0 0 8px;line-height:1.3">ประกาศใหม่เข้าระบบ</h1>
    ${data.packageType
      ? `<span style="display:inline-block;background:#d97f11;color:#fff;font-size:11px;font-weight:700;padding:3px 11px;border-radius:20px">${PACKAGE_LABEL[data.packageType] ?? data.packageType}</span>`
      : ''}
  </div>

  <!-- Listing table -->
  <div style="padding:28px 32px 0">
    <table style="width:100%;border-collapse:collapse">
      ${tableRow('ชื่อประกาศ', `<strong style="color:#02402e">${data.title || '—'}</strong>`)}
      ${tableRow('ประเภท', data.type || '—')}
      ${tableRow('ราคา', `<strong style="color:#d97f11;font-size:15px">${priceStr(data)}</strong>`)}
      ${tableRow('ขนาด', data.sizeSqm ? `${data.sizeSqm} ตร.ม.` : '—')}
      ${tableRow('ห้อง', roomStr)}
      ${tableRow('ที่ตั้ง', locationStr(data))}
    </table>
  </div>

  <!-- Contact box -->
  <div style="margin:20px 32px 0;padding:18px 20px;background:#f0faf6;border-radius:12px;border:1px solid #c9eedd">
    <p style="font-size:11px;font-weight:700;color:#02402e;margin:0 0 10px;text-transform:uppercase;letter-spacing:.8px">ข้อมูลผู้ติดต่อ</p>
    <p style="margin:0 0 5px;font-size:15px;font-weight:600;color:#1e293b">${data.contactName || '—'}</p>
    ${data.contactPhone ? `<p style="margin:0 0 4px;font-size:13.5px;color:#475569">โทร: ${data.contactPhone}</p>` : ''}
    ${data.contactEmail ? `<p style="margin:0;font-size:13.5px;color:#475569">อีเมล: ${data.contactEmail}</p>` : ''}
  </div>

  <!-- Meta -->
  <div style="padding:16px 32px 0">
    ${data.source ? `<p style="font-size:12px;color:#94a3b8;margin:0 0 4px">แหล่งที่มา: ${SOURCE_LABEL[data.source] ?? data.source}</p>` : ''}
    ${data.id ? `<p style="font-size:12px;color:#cbd5e1;margin:0">ID: ${data.id}</p>` : ''}
  </div>

  <!-- CTA -->
  <div style="padding:24px 32px 28px;text-align:center">
    <a href="https://spacesmate.com/dashboard/listings"
       style="display:inline-block;background:#02402e;color:#fff;font-size:14px;font-weight:700;padding:13px 30px;border-radius:10px;text-decoration:none">
      เปิด Admin Dashboard
    </a>
  </div>`,
  `<p style="font-size:12px;color:#94a3b8;margin:0">Listing ID: ${data.id || '—'} · SpacesMate Admin</p>`)

  await sendEmail(
    [FOUNDER_EMAIL],
    `ประกาศใหม่: ${data.title || 'ไม่ระบุชื่อ'}`,
    html
  )
}

// ── 2. Submitter confirmation — listing is now live ───────────────────────────

export async function sendListingConfirmation(data: ListingEmailData): Promise<void> {
  if (!data.contactEmail) return

  const html = layout(`
  <!-- Header -->
  <div style="background:#02402e;padding:30px 32px 26px">
    <p style="color:#d97f11;font-size:11px;font-weight:700;margin:0 0 10px;text-transform:uppercase;letter-spacing:1.5px">SpacesMate</p>
    <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 6px;line-height:1.3">ประกาศของคุณเผยแพร่แล้ว!</h1>
    <p style="color:rgba(255,255,255,0.72);font-size:14px;margin:0">ขอบคุณที่ไว้วางใจ SpacesMate ในการลงประกาศ</p>
  </div>

  <!-- Check mark banner -->
  <div style="background:#eaf6f1;padding:14px 32px;border-bottom:1px solid #c9eedd">
    <p style="font-size:13.5px;color:#02402e;font-weight:600;margin:0">
      ประกาศของคุณกำลังแสดงอยู่บน spacesmate.com และพร้อมให้ผู้เช่าค้นหาแล้ว
    </p>
  </div>

  <!-- Listing card -->
  <div style="margin:24px 32px 0;border:1.5px solid #e2e8f0;border-radius:12px;padding:20px 22px">
    <p style="font-size:11px;font-weight:700;color:#94a3b8;margin:0 0 6px;text-transform:uppercase;letter-spacing:.5px">ประกาศของคุณ</p>
    <p style="font-size:17px;font-weight:700;color:#02402e;margin:0 0 8px;line-height:1.35">${data.title || 'ประกาศของคุณ'}</p>
    ${priceStr(data) !== '—' ? `<p style="font-size:19px;font-weight:700;color:#d97f11;margin:0 0 6px">${priceStr(data)}</p>` : ''}
    ${(data.district || data.province)
      ? `<p style="font-size:13.5px;color:#64748b;margin:0">${[data.district, data.province].filter(Boolean).join(', ')}</p>`
      : ''}
  </div>

  <!-- Package info row -->
  ${data.packageType && data.packageType !== 'admin' ? `
  <div style="margin:12px 32px 0;padding:13px 18px;background:#f8fafc;border-radius:10px;display:flex;justify-content:space-between;align-items:center">
    <p style="font-size:13px;color:#64748b;margin:0">แพ็กเกจที่ใช้งาน</p>
    <p style="font-size:13px;font-weight:700;color:#02402e;margin:0">${PACKAGE_LABEL[data.packageType] ?? data.packageType}</p>
  </div>` : ''}

  <!-- Tips -->
  <div style="margin:20px 32px 0;padding:18px 20px;background:#fffbf5;border-radius:12px;border:1px solid #f5ddb3">
    <p style="font-size:12px;font-weight:700;color:#d97f11;margin:0 0 10px;text-transform:uppercase;letter-spacing:.5px">เคล็ดลับเพื่อผลลัพธ์ที่ดีกว่า</p>
    <p style="font-size:13.5px;color:#78350f;margin:0;line-height:1.7">
      เพิ่มรูปภาพทรัพย์สินให้ครบ · ระบุที่อยู่ใกล้สถานี BTS/MRT · ตอบกลับผู้สนใจภายใน 24 ชั่วโมงเพื่อเพิ่มโอกาสปล่อยเช่า
    </p>
  </div>

  <!-- CTA -->
  <div style="padding:22px 32px 0;text-align:center">
    <a href="${data.listingUrl ?? 'https://spacesmate.com/search'}"
       style="display:inline-block;background:#048c73;color:#fff;font-size:14px;font-weight:700;padding:13px 30px;border-radius:10px;text-decoration:none">
      ${data.listingUrl ? 'ดูประกาศของฉัน' : 'ดูประกาศทั้งหมดบนเว็บ'}
    </a>
  </div>

  <!-- Support -->
  <div style="margin:22px 32px 28px;padding-top:20px;border-top:1px solid #f1f5f9">
    <p style="font-size:13px;color:#94a3b8;margin:0;line-height:1.75">
      ต้องการแก้ไขประกาศหรือต้องการความช่วยเหลือ?<br>
      <a href="mailto:info@spacesmate.com" style="color:#048c73;text-decoration:none">info@spacesmate.com</a>
      &nbsp;·&nbsp; LINE: <strong style="color:#334155">@spacesmate</strong>
    </p>
  </div>`)

  await sendEmail(
    [data.contactEmail],
    `ประกาศของคุณเผยแพร่แล้ว — ${data.title || 'SpacesMate'}`,
    html
  )
}

// ── 3. Payment confirmation — subscription renewed ────────────────────────────

export interface PaymentEmailData {
  contactEmail:  string
  contactName?:  string | null
  packageType?:  string | null
  amount?:       number | null   // in THB
  expiresAt?:    string | null   // ISO date string
  listingTitle?: string | null
}

export async function sendPaymentConfirmation(data: PaymentEmailData): Promise<void> {
  if (!data.contactEmail) return

  const pkgLabel   = data.packageType ? (PACKAGE_LABEL[data.packageType] ?? data.packageType) : '—'
  const amountStr  = data.amount ? `฿${data.amount.toLocaleString()}` : '—'
  const expiryStr  = data.expiresAt
    ? new Date(data.expiresAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  const html = layout(`
  <!-- Header -->
  <div style="background:#02402e;padding:30px 32px 26px">
    <p style="color:#d97f11;font-size:11px;font-weight:700;margin:0 0 10px;text-transform:uppercase;letter-spacing:1.5px">SpacesMate</p>
    <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 6px;line-height:1.3">ชำระเงินสำเร็จ</h1>
    <p style="color:rgba(255,255,255,0.72);font-size:14px;margin:0">ขอบคุณ${data.contactName ? ' คุณ' + data.contactName : ''} ที่ใช้บริการ SpacesMate</p>
  </div>

  <!-- Success badge -->
  <div style="background:#eaf6f1;padding:14px 32px;border-bottom:1px solid #c9eedd">
    <p style="font-size:13.5px;color:#02402e;font-weight:600;margin:0">
      การชำระเงินของคุณเสร็จสมบูรณ์ และแพ็กเกจพร้อมใช้งานแล้ว
    </p>
  </div>

  <!-- Payment summary card -->
  <div style="margin:24px 32px 0;border:1.5px solid #e2e8f0;border-radius:12px;overflow:hidden">
    <div style="background:#f8fafc;padding:12px 20px;border-bottom:1px solid #e2e8f0">
      <p style="font-size:11px;font-weight:700;color:#94a3b8;margin:0;text-transform:uppercase;letter-spacing:.5px">สรุปการชำระเงิน</p>
    </div>
    <table style="width:100%;border-collapse:collapse;padding:0">
      ${data.listingTitle ? `
      <tr>
        <td style="padding:12px 20px;border-bottom:1px solid #f1f5f9;color:#94a3b8;font-size:13px;width:130px">ประกาศ</td>
        <td style="padding:12px 20px;border-bottom:1px solid #f1f5f9;color:#1e293b;font-size:13.5px;font-weight:600">${data.listingTitle}</td>
      </tr>` : ''}
      <tr>
        <td style="padding:12px 20px;border-bottom:1px solid #f1f5f9;color:#94a3b8;font-size:13px">แพ็กเกจ</td>
        <td style="padding:12px 20px;border-bottom:1px solid #f1f5f9;color:#1e293b;font-size:13.5px">${pkgLabel}</td>
      </tr>
      <tr>
        <td style="padding:12px 20px;border-bottom:1px solid #f1f5f9;color:#94a3b8;font-size:13px">ยอดชำระ</td>
        <td style="padding:12px 20px;border-bottom:1px solid #f1f5f9;font-size:16px;font-weight:700;color:#d97f11">${amountStr}</td>
      </tr>
      <tr>
        <td style="padding:12px 20px;color:#94a3b8;font-size:13px">ใช้งานถึง</td>
        <td style="padding:12px 20px;color:#02402e;font-size:13.5px;font-weight:600">${expiryStr}</td>
      </tr>
    </table>
  </div>

  <!-- Body text -->
  <div style="padding:20px 32px 0">
    <p style="font-size:14px;color:#334155;line-height:1.75;margin:0">
      ประกาศของคุณจะแสดงบน spacesmate.com จนถึงวันที่ ${expiryStr} ระบบจะแจ้งเตือนคุณก่อนหมดอายุ และจะต่ออายุอัตโนมัติหากคุณยังคงสมัครสมาชิกอยู่
    </p>
  </div>

  <!-- CTA -->
  <div style="padding:22px 32px 0;text-align:center">
    <a href="https://spacesmate.com/owner-dashboard"
       style="display:inline-block;background:#02402e;color:#fff;font-size:14px;font-weight:700;padding:13px 30px;border-radius:10px;text-decoration:none">
      เข้าสู่ Owner Dashboard
    </a>
  </div>

  <!-- Support -->
  <div style="margin:22px 32px 28px;padding-top:20px;border-top:1px solid #f1f5f9">
    <p style="font-size:13px;color:#94a3b8;margin:0;line-height:1.75">
      หากมีคำถามเกี่ยวกับการชำระเงิน ติดต่อเราได้ที่<br>
      <a href="mailto:info@spacesmate.com" style="color:#048c73;text-decoration:none">info@spacesmate.com</a>
      &nbsp;·&nbsp; LINE: <strong style="color:#334155">@spacesmate</strong>
    </p>
  </div>`)

  await sendEmail(
    [data.contactEmail],
    `ชำระเงินสำเร็จ — SpacesMate ${pkgLabel}`,
    html
  )
}
