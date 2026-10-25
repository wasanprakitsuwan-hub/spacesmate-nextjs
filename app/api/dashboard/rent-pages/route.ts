import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin, isErr } from '@/lib/auth-guard'
import { listRentPages, loadRentPlaces, mergeTemplate, rentPlaceKey, rentSlug, RENT_TYPES, TEMPLATE_KEY } from '@/lib/rent-pages'

// GET   /api/dashboard/rent-pages — the template and every page with its count
// PATCH /api/dashboard/rent-pages — { template } saves the template
// PUT   /api/dashboard/rent-pages — { slug, ...fields } saves one page's override

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
    const [{ data: setting }, pages] = await Promise.all([
      supabase.from('site_settings').select('value').eq('key', TEMPLATE_KEY).maybeSingle(),
      listRentPages(),
    ])
    return NextResponse.json({ template: mergeTemplate(setting?.value), stored: setting?.value ?? null, pages })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth
  try {
    const { template } = await req.json()
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
      .upsert({ key: TEMPLATE_KEY, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) throw error
    revalidatePath('/rent/[slug]', 'page')
    revalidatePath('/en/rent/[slug]', 'page')
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err) }, { status: 500 })
  }
}

const OVERRIDE_FIELDS = ['title_th', 'title_en', 'meta_description', 'meta_description_en', 'intro_th', 'intro_en'] as const

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth
  try {
    const body = await req.json()
    const slug = String(body.slug ?? '')

    // Only slugs the site actually serves, so a typo cannot create a stray row.
    const places = await loadRentPlaces()
    const place = places.find(p => [null, ...RENT_TYPES].some(t => rentSlug(p, t) === slug))
    if (!place) return NextResponse.json({ error: 'Unknown page' }, { status: 400 })

    const row: Record<string, unknown> = {
      slug,
      place_key: rentPlaceKey(place),
      area_type: await areaTypeFor(rentPlaceKey(place)),
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
      // 42703 = undefined column: the 20261025a migration has not been run.
      if (error.code === '42703' || /column .* does not exist/i.test(error.message)) {
        return NextResponse.json({ error: 'Run supabase/migrations/20261025a_rent_pages.sql (WEBSITE database) first.' }, { status: 409 })
      }
      throw error
    }
    revalidatePath(`/rent/${slug}`)
    revalidatePath(`/en/rent/${slug}`)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err) }, { status: 500 })
  }
}
