import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import sharp from 'sharp'

const IMAGE_BUCKET  = 'property-images'
const IMG_MAX_WIDTH  = 1920
const IMG_MAX_HEIGHT = 1280
const IMG_QUALITY    = 82
const THUMB_WIDTH    = 480
const THUMB_QUALITY  = 72

const PACKAGE_LIMITS: Record<string, number> = {
  basic: 10, standard: 10, premium: 10,
}

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
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Server config error' }, { status: 500 })
  }

  try {
    const data        = await req.formData()
    const file        = data.get('file') as File | null
    const packageId   = (data.get('packageId') as string) || 'basic'
    const currentCount = parseInt((data.get('currentCount') as string) || '0', 10)

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // ── Enforce per-package image limit ──────────────────────────────────────
    const limit = PACKAGE_LIMITS[packageId] ?? 5
    if (currentCount >= limit) {
      return NextResponse.json(
        { error: `แพ็กเกจ ${packageId} อัปโหลดรูปได้สูงสุด ${limit} รูป`, limit, current: currentCount },
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
