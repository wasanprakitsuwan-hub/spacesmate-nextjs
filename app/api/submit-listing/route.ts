import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendNewListingAlert, sendListingConfirmation } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // ── Package → auto-approve logic ───────────────────────────────────────
    const packageId = body.packageId || 'basic'
    const PACKAGE_DAYS: Record<string, number> = {
      basic:    30,   // ฿299 / 1 เดือน
      standard: 90,   // ฿699 / 3 เดือน
      premium:  365,  // ฿2,499 / 12 เดือน
    }
    const isPaid = true // both packages are paid — status = approved immediately
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
        // All paid packages go active immediately — no admin approval needed
        status:        'approved',
      }])
      .select('id')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'บันทึกข้อมูลไม่สำเร็จ' }, { status: 500 })
    }

    // ── Email notifications via shared lib/email.ts ─────────────────────────
    try {
      const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL || 'https://spacesmate.com'
      const emailData = {
        id:           String(data?.id ?? ''),
        title:        body.title ?? null,
        type:         body.type ?? null,
        price:        body.price ? parseInt(body.price) : null,
        rentSuffix:   body.rentType === 'day' ? '/วัน' : '/เดือน',
        sizeSqm:      body.size ?? null,
        bedrooms:     body.bedrooms ? parseInt(body.bedrooms) : null,
        bathrooms:    body.bathrooms ? parseInt(body.bathrooms) : null,
        address:      body.address ?? null,
        district:     body.district ?? null,
        province:     body.province ?? null,
        contactName:  body.contactName ?? null,
        contactPhone: body.contactPhone ?? null,
        contactEmail: body.contactEmail ?? null,
        packageType:  packageId,
        listingUrl:   `${siteUrl}/search`,
        source:       'public_submit' as const,
      }
      await Promise.all([
        sendNewListingAlert(emailData),
        sendListingConfirmation(emailData),
      ])
    } catch (emailErr) {
      console.error('[email] notification error (non-fatal):', emailErr)
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    console.error('submit-listing error:', err)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 })
  }
}
