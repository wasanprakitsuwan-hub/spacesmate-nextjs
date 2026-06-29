import { NextRequest, NextResponse } from 'next/server'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Province { id: number; name_th: string }
interface District { id: number; name_th: string; province_id: number }
interface SubDistrict { id: number; name_th: string; district_id: number; zip_code: number }

// ── Module-level cache — survives multiple requests in the same process ────────
let _cache: { provinces: Province[]; districts: District[]; subDistricts: SubDistrict[] } | null = null

// ── Updated paths (repo restructured from api_province.json → api/latest/) ───
const RAW = 'https://raw.githubusercontent.com/kongvut/thai-province-data/master/api/latest'

async function loadAll() {
  if (_cache) return _cache
  const [provinces, districts, subDistricts] = await Promise.all([
    fetch(`${RAW}/province.json`).then(r => r.json()),
    fetch(`${RAW}/district.json`).then(r => r.json()),
    fetch(`${RAW}/sub_district.json`).then(r => r.json()),
  ])
  _cache = { provinces, districts, subDistricts }
  return _cache
}

// ── GET /api/thailand-address ─────────────────────────────────────────────────
// ?level=provinces
// ?level=amphures&parent=<province_id>   (districts)
// ?level=tambons&parent=<district_id>    (sub-districts)
export async function GET(req: NextRequest) {
  try {
    const level  = req.nextUrl.searchParams.get('level')
    const parent = req.nextUrl.searchParams.get('parent')

    const { provinces, districts, subDistricts } = await loadAll()

    if (level === 'provinces') {
      return NextResponse.json(
        provinces.map(p => ({ id: p.id, name: p.name_th })),
        { headers: { 'Cache-Control': 'public, max-age=86400' } }
      )
    }

    if (level === 'amphures' && parent) {
      const pid = parseInt(parent)
      return NextResponse.json(
        districts.filter(d => d.province_id === pid).map(d => ({ id: d.id, name: d.name_th })),
        { headers: { 'Cache-Control': 'public, max-age=86400' } }
      )
    }

    if (level === 'tambons' && parent) {
      const did = parseInt(parent)
      return NextResponse.json(
        subDistricts
          .filter(s => s.district_id === did)
          .map(s => ({ id: s.id, name: s.name_th, zip: String(s.zip_code) })),
        { headers: { 'Cache-Control': 'public, max-age=86400' } }
      )
    }

    return NextResponse.json({ error: 'Invalid parameters. Use ?level=provinces|amphures|tambons' }, { status: 400 })
  } catch (err: any) {
    console.error('thailand-address route error:', err)
    _cache = null
    return NextResponse.json({ error: 'Failed to load address data', detail: err.message }, { status: 500 })
  }
}
