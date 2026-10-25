import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin, isErr } from '@/lib/auth-guard'
import { listRentPages, loadRentPlaces, mergeTemplate, rentPlaceKey, rentSlug, RENT_TYPES, TEMPLATE_KEY } from '@/lib/rent-pages'
import { DEFAULT_DISTRICT_TEMPLATE } from '@/lib/rent-slugs'
import { DISTRICT_TEMPLATE_KEY, districtSlug, listDistrictPages, loadDistricts } from '@/lib/district-pages'

// GET   /api/dashboard/rent-pages — both templates and every page with its count
// PATCH /api/dashboard/rent-pages — { template, kind } saves the station/place ('rent') or district template
// PUT   /api/dashboard/rent-pages — { slug, ...fields } saves one page's override (/rent or /area)

/** seo_pages.area_type for a place key. */
async function areaTypeFor(placeKey: string): Promise<string> {
  const place = (await loadRentPlaces()).find(p => rentPlaceKey(p) === placeKey)
  if (!place) return 'place'
  if (place.kind === 'station') return place.station.systems[0].toLowerCase()
  return place.landmark.kind
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth
  try {
    const supabase = createServerClient()
    const [{ data: setting }, { data: districtSetting }, rentPages, districtPages] = await Promise.all([
      supabase.from('site_settings').select('value').eq('key', TEMPLATE_KEY).maybeSingle(),
      supabase.from('site_settings').select('value').eq('key', DISTRICT_TEMPLATE_KEY).maybeSingle(),
      listRentPages(),
      listDistrictPages(),
    ])
    return NextResponse.json({
      template: mergeTemplate(setting?.value),
      stored: setting?.value ?? null,
      districtTemplate: mergeTemplate(districtSetting?.value, DEFAULT_DISTRICT_TEMPLATE),
      districtStored: districtSetting?.value ?? null,
      pages: [...rentPages, ...districtPages],
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth
  try {
    const { template, kind } = await req.json()
    const isDistrict = kind === 'district'
    // Stored as typed; empty fields fall back to the code defaults at render.
    const value = mergeTemplate(null)
    for (const locale of ['th', 'en'] as const) {
      for (const key of Object.keys(value[locale]) as (keyof typeof value.th)[]) {
        const v = template?.[locale]?.[key]
        value[locale][key] = typeof v === 'string' ? v.trim() : ''
      }
    }
    const { error } = await createServerClient()
      .from('site_settings')
      .upsert({ key: isDistrict ? DISTRICT_TEMPLATE_KEY : TEMPLATE_KEY, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) throw error
    const base = isDistrict ? 'area' : 'rent'
    revalidatePath(`/${base}/[slug]`, 'page')
    revalidatePath(`/en/${base}/[slug]`, 'page')
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err) }, { status: 500 })
  }
}

const OVERRIDE_FIELDS = [
  'title_th', 'title_en', 'meta_description', 'meta_description_en', 'intro_th', 'intro_en',
  'highlights_th', 'highlights_en', 'body_th', 'body_en',
] as const

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth
  try {
    const body = await req.json()
    const slug = String(body.slug ?? '')

    // Only slugs the site actually serves, so a typo cannot create a stray row.
    let base: 'rent' | 'area'
    let placeKey: string
    let areaType: string
    const place = (await loadRentPlaces()).find(p => [null, ...RENT_TYPES].some(t => rentSlug(p, t) === slug))
    if (place) {
      base = 'rent'
      placeKey = rentPlaceKey(place)
      areaType = await areaTypeFor(placeKey)
    } else {
      const district = (await loadDistricts()).find(d => [null, ...RENT_TYPES].some(t => districtSlug(d, t) === slug))
      if (!district) return NextResponse.json({ error: 'Unknown page' }, { status: 400 })
      base = 'area'
      placeKey = `district:${district.key}`
      areaType = 'district'
    }

    const row: Record<string, unknown> = {
      slug,
      place_key: placeKey,
      area_type: areaType,
      noindex: body.noindex === true,
      status: 'published',
      has_content: true,
      updated_at: new Date().toISOString(),
    }
    for (const f of OVERRIDE_FIELDS) {
      const v = body[f]
      row[f] = typeof v === 'string' && v.trim() ? v.trim() : null
    }

    const { error } = await createServerClient().from('seo_pages').upsert(row, { onConflict: 'slug' })
    if (error) {
      // 42703 = undefined column: a rent-page migration has not been run.
      if (error.code === '42703' || /column .* does not exist/i.test(error.message)) {
        return NextResponse.json({ error: 'Run supabase/migrations/20261025a_rent_pages.sql and 20261025b_rent_page_writeups.sql (WEBSITE database) first.' }, { status: 409 })
      }
      throw error
    }
    revalidatePath(`/${base}/${slug}`)
    revalidatePath(`/en/${base}/${slug}`)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err) }, { status: 500 })
  }
}
