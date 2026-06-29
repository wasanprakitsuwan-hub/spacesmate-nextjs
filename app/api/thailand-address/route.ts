import { NextRequest, NextResponse } from 'next/server'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Province { id: number; name_th: string }
interface Amphure  { id: number; name_th: string; province_id: number }
interface Tambon   { id: number; name_th: string; amphure_id: number; zip_code: number }

// ── Module-level cache — survives multiple requests in the same process ────────
let _cache: { provinces: Province[]; amphures: Amphure[]; tambons: Tambon[] } | null = null

const RAW = 'https://raw.githubusercontent.com/kongvut/thai-province-data/master'

async function loadAll() {
  if (_cache) return _cache
  const [provinces, amphures, tambons] = await Promise.all([
    fetch(`${RAW}/api_province.json`).then(r => r.json()),
    fetch(`${RAW}/api_amphure.json`).then(r => r.json()),
    fetch(`${RAW}/api_tambon.json`).then(r => r.json()),
  ])
  _cache = { provinces, amphures, tambons }
  return _cache
}

// ── GET /api/thailand-address ─────────────────────────────────────────────────
// ?level=provinces
// ?level=amphures&parent=<province_id>
// ?level=tambons&parent=<amphure_id>
export async function GET(req: NextRequest) {
  try {
    const level  = req.nextUrl.searchParams.get('level')
    const parent = req.nextUrl.searchParams.get('parent')

    const { provinces, amphures, tambons } = await loadAll()

    if (level === 'provinces') {
      return NextResponse.json(
        provinces.map(p => ({ id: p.id, name: p.name_th })),
        { headers: { 'Cache-Control': 'public, max-age=86400' } }
      )
    }

    if (level === 'amphures' && parent) {
      const pid = parseInt(parent)
      return NextResponse.json(
        amphures.filter(a => a.province_id === pid).map(a => ({ id: a.id, name: a.name_th })),
        { headers: { 'Cache-Control': 'public, max-age=86400' } }
      )
    }

    if (level === 'tambons' && parent) {
      const aid = parseInt(parent)
      return NextResponse.json(
        tambons
          .filter(t => t.amphure_id === aid)
          .map(t => ({ id: t.id, name: t.name_th, zip: String(t.zip_code) })),
        { headers: { 'Cache-Control': 'public, max-age=86400' } }
      )
    }

    return NextResponse.json({ error: 'Invalid parameters. Use ?level=provinces|amphures|tambons' }, { status: 400 })
  } catch (err: any) {
    console.error('thailand-address route error:', err)
    // Clear cache so next request retries the fetch
    _cache = null
    return NextResponse.json({ error: 'Failed to load address data', detail: err.message }, { status: 500 })
  }
}
