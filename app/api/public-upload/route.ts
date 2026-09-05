import { NextRequest, NextResponse } from 'next/server'
import { checkRate, isSameOrigin, ALLOWED_HOSTS } from '@/lib/rate-limit'
import { MAX_IMAGES_ANY_PACKAGE } from '@/lib/packages'
import { createServerClient } from '@/lib/supabase'
import sharp from 'sharp'

const IMAGE_BUCKET  = 'property-images'
const IMG_MAX_WIDTH  = 1920
const IMG_MAX_HEIGHT = 1280
const IMG_QUALITY    = 82
const THUMB_WIDTH    = 480
const THUMB_QUALITY  = 72

// A sixth private copy of the image limits lived here — 20/20/20 with a
// fallback of 5, which no package has ever had. Removed on 3 Sep 2026 in
// favour of the single ceiling in lib/packages.
//
// One cap for everyone: the package governs how many images are publicly
// shown, not how many may be uploaded.

async function ensureBucket(supabase: ReturnType<typeof createServerClient>) {
  await supabase.storage
    .createBucket(IMAGE_BUCKET, {
      public: true,
      fileSizeLimit: 10_485_760,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    })
    .catch(() => {}) // silently ignore "already exists"
}

// ── POST /api/public-upload ────────────────────────────────────────────────────
// Public endpoint — no auth required. Used by the public listing submit wizard.
// Server uses service role key, so anon users can't write directly to Storage.
export async function POST(req: NextRequest) {
  // Public by necessity — used by the submit form before an account exists.
  // currentCount arrives from the client, so the per-package limit below is
  // advisory only; this is the actual brake on storage abuse.
  if (!isSameOrigin(req, ALLOWED_HOSTS)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const rl = checkRate(req, 'public-upload', 40, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'อัปโหลดบ่อยเกินไป กรุณาลองใหม่ในภายหลัง' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    )
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Server config error' }, { status: 500 })
  }

  try {
    const data        = await req.formData()
    const file        = data.get('file') as File | null
    const currentCount = parseInt((data.get('currentCount') as string) || '0', 10)

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // ── Enforce the single per-listing ceiling ───────────────────────────────
    const limit = MAX_IMAGES_ANY_PACKAGE
    if (currentCount >= limit) {
      return NextResponse.json(
        { error: `อัปโหลดรูปได้สูงสุด ${limit} รูปต่อประกาศ`, limit, current: currentCount },
        { status: 400 },
      )
    }

    if (file.size > 30_000_000) {
      return NextResponse.json({ error: 'รูปภาพใหญ่เกิน 30 MB' }, { status: 400 })
    }

    const supabase  = createServerClient()
    await ensureBucket(supabase)

    const rawBuffer = Buffer.from(await file.arrayBuffer())
    const baseName  = `submissions/${Date.now()}-${rand()}`

    // ── Resize + convert to WebP ─────────────────────────────────────────────
    const mainBuffer = await sharp(rawBuffer)
      .rotate()
      .resize(IMG_MAX_WIDTH, IMG_MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: IMG_QUALITY, effort: 4 })
      .toBuffer()

    const thumbBuffer = await sharp(rawBuffer)
      .rotate()
      .resize(THUMB_WIDTH, undefined, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY, effort: 4 })
      .toBuffer()

    const mainFilename  = `${baseName}.webp`
    const thumbFilename = `${baseName}_thumb.webp`

    const [mainUp, thumbUp] = await Promise.all([
      supabase.storage.from(IMAGE_BUCKET).upload(mainFilename,  mainBuffer,  { contentType: 'image/webp', upsert: false }),
      supabase.storage.from(IMAGE_BUCKET).upload(thumbFilename, thumbBuffer, { contentType: 'image/webp', upsert: false }),
    ])

    if (mainUp.error) {
      return NextResponse.json({ error: mainUp.error.message }, { status: 500 })
    }

    const { data: { publicUrl } }         = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(mainFilename)
    const { data: { publicUrl: thumbUrl } } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(thumbFilename)

    return NextResponse.json({ url: publicUrl, thumb_url: thumbUrl })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('public-upload error:', msg)
    return NextResponse.json({ error: msg || 'Upload failed' }, { status: 500 })
  }
}

function rand() {
  return Math.random().toString(36).slice(2, 8)
}
