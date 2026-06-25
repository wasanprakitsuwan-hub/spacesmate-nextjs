import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // ── Package → auto-approve logic ───────────────────────────────────────
    const packageId = body.packageId || 'free_trial'
    const PACKAGE_DAYS: Record<string, number> = {
      free_trial: 30,
      basic:      30,
      standard:   90,
      premium:    365,
    }
    const isPaid = packageId !== 'free_trial'
    const durationDays = PACKAGE_DAYS[packageId] ?? 30
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + durationDays)

    // ── Save to Supabase ────────────────────────────────────────────────────
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('submissions')
      .insert([{
        title:         body.title        || null,
        type:          body.type         || null,
        rent_type:     body.rentType     || 'month',
        rental_term:   body.rentalTerm   || 'monthly',
        price:         body.price        ? parseInt(body.price)    : null,
        size:          body.size         || null,
        bedrooms:      body.bedrooms     ? parseInt(body.bedrooms) : null,
        bathrooms:     body.bathrooms    ? parseInt(body.bathrooms): null,
        floor:         body.floor        || null,
        description:   body.description  || null,
        amenities:     body.amenities    || [],
        address:       body.address      || null,
        province:      body.province     || null,
        district:      body.district     || null,
        subdistrict:   body.subdistrict  || null,
        postcode:      body.postcode     || null,
        contact_name:  body.contactName  || null,
        contact_phone: body.contactPhone || null,
        contact_email: body.contactEmail || null,
        package_type:  packageId,
        expires_at:    expiresAt.toISOString(),
        // Paid packages go active immediately; free trial needs admin approval
        status:        isPaid ? 'approved' : 'pending',
      }])
      .select('id')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'บันทึกข้อมูลไม่สำเร็จ' }, { status: 500 })
    }

    // ── Email notification via Resend ───────────────────────────────────────
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const amenitiesText = (body.amenities || []).join(', ') || '—'
      const priceLabel = body.price
        ? `฿${parseInt(body.price).toLocaleString()}/${body.rentType === 'day' ? 'วัน' : 'เดือน'}`
        : '—'

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'SpacesMate <onboarding@resend.dev>',
          to: ['wasan.prakitsuwan@gmail.com'],
          subject: `🏠 ประกาศใหม่รอตรวจสอบ: ${body.title || 'ไม่ระบุชื่อ'}`,
          html: `
<!DOCTYPE html>
<html lang="th">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f9f8;font-family:'Prompt',Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(2,64,46,0.08)">

    <!-- Header -->
    <div style="background:#02402e;padding:28px 32px">
      <p style="color:#d97f11;font-size:13px;font-weight:600;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px">SpacesMate</p>
      <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0">ประกาศใหม่รอตรวจสอบ</h1>
    </div>

    <!-- Body -->
    <div style="padding:32px">
      <table style="width:100%;border-collapse:collapse;font-size:14.5px">
        <tr><td style="padding:10px 0;border-bottom:1px solid #eef0ef;color:#94a3b8;width:130px">ชื่อประกาศ</td>
            <td style="padding:10px 0;border-bottom:1px solid #eef0ef;font-weight:600;color:#02402e">${body.title || '—'}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eef0ef;color:#94a3b8">ประเภท</td>
            <td style="padding:10px 0;border-bottom:1px solid #eef0ef">${body.type || '—'}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eef0ef;color:#94a3b8">ราคาเช่า</td>
            <td style="padding:10px 0;border-bottom:1px solid #eef0ef;color:#d97f11;font-weight:700">${priceLabel}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eef0ef;color:#94a3b8">ขนาด</td>
            <td style="padding:10px 0;border-bottom:1px solid #eef0ef">${body.size ? body.size + ' ตร.ม.' : '—'}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eef0ef;color:#94a3b8">ห้องนอน / ห้องน้ำ</td>
            <td style="padding:10px 0;border-bottom:1px solid #eef0ef">${body.bedrooms || '—'} นอน · ${body.bathrooms || '—'} น้ำ</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eef0ef;color:#94a3b8">ที่อยู่</td>
            <td style="padding:10px 0;border-bottom:1px solid #eef0ef">${[body.address, body.district, body.province].filter(Boolean).join(' · ') || '—'}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eef0ef;color:#94a3b8">สิ่งอำนวยฯ</td>
            <td style="padding:10px 0;border-bottom:1px solid #eef0ef">${amenitiesText}</td></tr>
      </table>

      <!-- Contact -->
      <div style="margin-top:24px;padding:20px;background:#f7f9f8;border-radius:12px;border:1px solid #eef0ef">
        <p style="font-size:13px;font-weight:700;color:#02402e;margin:0 0 12px;text-transform:uppercase;letter-spacing:.5px">ข้อมูลผู้ติดต่อ</p>
        <p style="margin:0 0 6px;font-size:14.5px"><strong>${body.contactName || '—'}</strong></p>
        <p style="margin:0 0 4px;font-size:14px;color:#475569">📞 ${body.contactPhone || '—'}</p>
        <p style="margin:0;font-size:14px;color:#475569">✉️ ${body.contactEmail || '—'}</p>
      </div>

      ${body.description ? `
      <div style="margin-top:20px">
        <p style="font-size:13px;font-weight:600;color:#475569;margin:0 0 8px">รายละเอียด</p>
        <p style="font-size:14px;color:#64748b;line-height:1.65;margin:0">${body.description}</p>
      </div>` : ''}
    </div>

    <!-- Footer -->
    <div style="background:#f7f9f8;border-top:1px solid #eef0ef;padding:20px 32px;text-align:center">
      <p style="font-size:13px;color:#94a3b8;margin:0">Submission ID: ${data?.id || '—'} · SpacesMate Admin</p>
    </div>
  </div>
</body>
</html>`,
        }),
      }).catch(err => console.error('Resend error:', err))
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    console.error('submit-listing error:', err)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 })
  }
}
