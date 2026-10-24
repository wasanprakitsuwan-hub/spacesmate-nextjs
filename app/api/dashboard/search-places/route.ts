import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin, isErr } from '@/lib/auth-guard'
import { inThailand, RAIL_SYSTEMS, LANDMARK_KINDS } from '@/lib/search-places'

// GET    /api/dashboard/search-places            — every admin change (admin+)
// PUT    /api/dashboard/search-places            — save one place: edit, add or hide (admin+)
// DELETE /api/dashboard/search-places?kind&id    — reset to the built-in version (admin+)

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  const { data, error } = await createServerClient()
    .from('search_places')
    .select('*')
  if (error) return NextResponse.json({ overrides: [], error: error.message }, { status: 500 })
  return NextResponse.json({ overrides: data ?? [] })
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  try {
    const b = await req.json()
    const kind = b.kind
    const id = String(b.id ?? '').trim()
    const th = String(b.th ?? '').trim()
    const en = String(b.en ?? '').trim()
    const lat = Number(b.lat), lng = Number(b.lng)

    if (kind !== 'station' && kind !== 'landmark') return NextResponse.json({ error: 'kind must be station or landmark' }, { status: 400 })
    // Ids appear in search URLs (?station=E4, ?landmark=chula).
    if (!/^[A-Za-z0-9-]{1,60}$/.test(id)) return NextResponse.json({ error: 'รหัสใช้ได้เฉพาะ a-z, 0-9 และ -' }, { status: 400 })
    if (!th || !en) return NextResponse.json({ error: 'กรุณากรอกชื่อทั้งภาษาไทยและอังกฤษ' }, { status: 400 })
    if (!isFinite(lat) || !isFinite(lng) || !inThailand(lat, lng)) return NextResponse.json({ error: 'พิกัดไม่ถูกต้อง' }, { status: 400 })

    const systems = Array.isArray(b.systems) ? b.systems.filter((s: string) => (RAIL_SYSTEMS as string[]).includes(s)) : null
    if (kind === 'station' && !systems?.length) return NextResponse.json({ error: 'เลือกระบบรถไฟอย่างน้อย 1 ระบบ' }, { status: 400 })
    const landmarkKind = (LANDMARK_KINDS as string[]).includes(b.landmark_kind) ? b.landmark_kind : null
    const aliases = Array.isArray(b.aliases)
      ? b.aliases.map((a: string) => String(a).trim()).filter(Boolean).slice(0, 20)
      : null

    const { data, error } = await createServerClient()
      .from('search_places')
      .upsert({
        kind, id, th, en, lat, lng,
        systems: kind === 'station' ? systems : null,
        landmark_kind: kind === 'landmark' ? (landmarkKind ?? 'place') : null,
        aliases: aliases?.length ? aliases : null,
        hidden: !!b.hidden,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ override: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  const sp = new URL(req.url).searchParams
  const kind = sp.get('kind'), id = sp.get('id')
  if (!kind || !id) return NextResponse.json({ error: 'kind and id required' }, { status: 400 })

  const { error } = await createServerClient().from('search_places').delete().eq('kind', kind).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
