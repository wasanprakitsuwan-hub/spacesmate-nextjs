import { NextRequest, NextResponse } from 'next/server'
import { ImageResponse } from 'next/og'
import sharp from 'sharp'
import { requireAuth, isErr } from '@/lib/auth-guard'

export const runtime = 'nodejs'
export const maxDuration = 60

// ── Brand ────────────────────────────────────────────────────────────────────
const BRAND_DARK = '#02402e'
const BRAND_GOLD = '#d97f11'

// ── Font ─────────────────────────────────────────────────────────────────────
// Prompt is the SpacesMate CI font and covers Thai + Latin. Satori needs a real
// font buffer — it cannot use a CSS font-family name. We fetch the TTF from
// Google once per warm lambda and keep it in module scope.
//
// The archaic User-Agent matters: modern UAs get woff2 back, which Satori
// cannot parse. An old UA makes Google serve truetype.
let fontCache: ArrayBuffer | null = null

async function getPromptBold(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache

  const cssRes = await fetch(
    'https://fonts.googleapis.com/css2?family=Prompt:wght@700&subset=thai,latin',
    { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64)' } },
  )
  const css = await cssRes.text()

  const match = css.match(/src:\s*url\((https:\/\/[^)]+)\)\s*format\('truetype'\)/)
  if (!match) throw new Error('Could not resolve a TTF url for Prompt from Google Fonts')

  const fontRes = await fetch(match[1])
  fontCache = await fontRes.arrayBuffer()
  return fontCache
}

// ── Sizes ────────────────────────────────────────────────────────────────────
const SIZES: Record<string, { w: number; h: number; font: number }> = {
  '9:16':  { w: 1024, h: 1536, font: 76 },
  '1:1':   { w: 1080, h: 1080, font: 68 },
  '4:5':   { w: 1080, h: 1350, font: 72 },
  '16:9':  { w: 1536, h: 1024, font: 64 },
}

/**
 * POST /api/dashboard/overlay
 *
 * multipart/form-data:
 *   file      the image, binary
 *   headline  text to burn in. Empty or missing → image returned untouched.
 *   format    9:16 | 1:1 | 4:5 | 16:9   (default 9:16)
 *   position  top | bottom               (default top)
 *
 * Returns: image/png
 *
 * Why two renderers: Satori draws the text layer only, on transparency, because
 * it is the one thing that can shape Thai correctly here. Sharp then composites
 * that layer over the photo. Pushing the whole photo through Satori as a data
 * URI works but is markedly slower and memory-hungry on a 1.5MB source.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isErr(auth)) return auth

  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 })

    const headline = String(form.get('headline') ?? '').trim()
    const format   = String(form.get('format') ?? '9:16')
    const position = String(form.get('position') ?? 'top')

    const src = Buffer.from(await file.arrayBuffer())

    // No headline is a legitimate case — FRAME sends every image through this
    // route and only carousel slides carry text. Pass the original straight back.
    if (!headline) {
      const png = await sharp(src).png().toBuffer()
      return new NextResponse(new Uint8Array(png), {
        headers: { 'Content-Type': 'image/png', 'X-Overlay': 'skipped' },
      })
    }

    const { w, h, font } = SIZES[format] ?? SIZES['9:16']
    const atTop = position !== 'bottom'

    // Long headlines need to step down a size or they run to four lines and
    // swallow the composition.
    const fontSize = headline.length > 42 ? Math.round(font * 0.78)
                   : headline.length > 28 ? Math.round(font * 0.88)
                   : font

    const fontData = await getPromptBold()

    const textLayer = new ImageResponse(
      (
        <div
          style={{
            width: w,
            height: h,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: atTop ? 'flex-start' : 'flex-end',
            // Scrim behind the text only, fading to nothing — keeps the
            // photograph readable while guaranteeing contrast for the words.
            backgroundImage: atTop
              ? `linear-gradient(180deg, rgba(2,64,46,0.82) 0%, rgba(2,64,46,0.55) 45%, rgba(2,64,46,0) 72%)`
              : `linear-gradient(0deg, rgba(2,64,46,0.86) 0%, rgba(2,64,46,0.55) 45%, rgba(2,64,46,0) 75%)`,
            padding: Math.round(w * 0.085),
          }}
        >
          <div
            style={{
              display: 'flex',
              width: Math.round(w * 0.18),
              height: 8,
              backgroundColor: BRAND_GOLD,
              marginBottom: Math.round(fontSize * 0.45),
            }}
          />
          <div
            style={{
              display: 'flex',
              fontFamily: 'Prompt',
              fontSize,
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.28,
              letterSpacing: -0.5,
              textShadow: '0 2px 14px rgba(0,0,0,0.35)',
              maxWidth: '92%',
            }}
          >
            {headline}
          </div>
        </div>
      ),
      {
        width: w,
        height: h,
        fonts: [{ name: 'Prompt', data: fontData, weight: 700, style: 'normal' }],
      },
    )

    const layerPng = Buffer.from(await textLayer.arrayBuffer())

    const out = await sharp(src)
      .resize(w, h, { fit: 'cover', position: 'centre' })
      .composite([{ input: layerPng, top: 0, left: 0 }])
      .png({ quality: 92 })
      .toBuffer()

    return new NextResponse(new Uint8Array(out), {
      headers: { 'Content-Type': 'image/png', 'X-Overlay': 'applied' },
    })
  } catch (err) {
    console.error('overlay error:', err)
    const msg = err instanceof Error ? err.message : 'Overlay failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
