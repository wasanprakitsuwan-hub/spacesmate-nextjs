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
    <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 6px;line-height:1.3">ประกาศของคุณใช้งานได้แล้ว</h1>
    <p style="color:rgba(255,255,255,0.70);font-size:14px;margin:0">ขอบคุณที่ฝากประกาศไว้กับ SpacesMate</p>
  </div>

  <!-- Listing card -->
  <div style="margin:28px 32px 0;border:1.5px solid #e2e8f0;border-radius:12px;padding:20px 22px">
    <p style="font-size:11px;font-weight:700;color:#94a3b8;margin:0 0 6px;text-transform:uppercase;letter-spacing:.5px">ประกาศของคุณ</p>
    <p style="font-size:17px;font-weight:700;color:#02402e;margin:0 0 8px;line-height:1.35">${data.title || 'ประกาศของคุณ'}</p>
    ${priceStr(data) !== '—' ? `<p style="font-size:18px;font-weight:700;color:#d97f11;margin:0 0 6px">${priceStr(data)}</p>` : ''}
    ${(data.district || data.province)
      ? `<p style="font-size:13.5px;color:#64748b;margin:0">${[data.district, data.province].filter(Boolean).join(', ')}</p>`
      : ''}
  </div>

  <!-- Package badge -->
  ${data.packageType && data.packageType !== 'admin' ? `
  <div style="margin:14px 32px 0;padding:12px 16px;background:#f8fafc;border-radius:10px">
    <p style="font-size:13px;color:#64748b;margin:0">แพ็กเกจ: <strong style="color:#02402e">${PACKAGE_LABEL[data.packageType] ?? data.packageType}</strong></p>
  </div>` : ''}

  <!-- Body text -->
  <div style="padding:22px 32px 0">
    <p style="font-size:14.5px;color:#334155;line-height:1.75;margin:0 0 8px">
      ประกาศของคุณกำลังแสดงอยู่บน <strong>spacesmate.com</strong> แล้ว ผู้สนใจเช่าจะสามารถค้นหาและติดต่อคุณได้ผ่านข้อมูลที่ระบุ
    </p>
  </div>

  <!-- CTA -->
  <div style="padding:20px 32px 0;text-align:center">
    <a href="${data.listingUrl ?? 'https://spacesmate.com/search'}"
       style="display:inline-block;background:#048c73;color:#fff;font-size:14px;font-weight:700;padding:13px 30px;border-radius:10px;text-decoration:none">
      ${data.listingUrl ? 'ดูประกาศของฉัน' : 'ดูประกาศทั้งหมด'}
    </a>
  </div>

  <!-- Support -->
  <div style="margin:24px 32px 28px;padding-top:20px;border-top:1px solid #f1f5f9">
    <p style="font-size:13px;color:#94a3b8;margin:0;line-height:1.7">
      หากต้องการแก้ไขประกาศหรือมีคำถาม ติดต่อเราได้ที่<br>
      <a href="mailto:info@spacesmate.com" style="color:#048c73;text-decoration:none">info@spacesmate.com</a>
      &nbsp;|&nbsp; LINE: <strong style="color:#334155">@spacesmate</strong>
    </p>
  </div>`)

  await sendEmail(
    [data.contactEmail],
    `ประกาศของคุณใช้งานได้แล้ว — ${data.title || 'SpacesMate'}`,
    html
  )
}
