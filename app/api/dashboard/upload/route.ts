import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth, isErr } from '@/lib/auth-guard'
import sharp from 'sharp'

// ── Bucket names ──────────────────────────────────────────────────────────────
const IMAGE_BUCKET = 'property-images'
const VIDEO_BUCKET = 'property-videos'

// ── Image optimisation settings ───────────────────────────────────────────────
const IMG_MAX_WIDTH  = 1920   // px — hero / full view
const IMG_MAX_HEIGHT = 1280   // px — portrait photos
const IMG_QUALITY    = 82     // WebP quality 0–100
const THUMB_WIDTH    = 480    // px — listing card thumbnail
const THUMB_QUALITY  = 72     // WebP quality for thumbnails

// ── Ensure Supabase Storage bucket exists ─────────────────────────────────────
async function ensureBucket(
  supabase: ReturnType<typeof createServerClient>,
  bucket: string,
  mimeTypes: string[],
  sizeLimit: number,
) {
  await supabase.storage
    .createBucket(bucket, { public: true, fileSizeLimit: sizeLimit, allowedMimeTypes: mimeTypes })
    .catch(() => {}) // silently ignore "already exists"
}

// ── POST /api/dashboard/upload ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const authCheck = await requireAuth(req)
  if (isErr(authCheck)) return authCheck

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY not set in environment variables.' },
      { status: 500 }
    )
  }

  try {
    const supabase  = createServerClient()
    const formData  = await req.formData()
    const file      = formData.get('file') as File | null
    const mediaType = (formData.get('type') as string) || 'image'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // ── VIDEO: pass through unchanged ────────────────────────────────────────
    if (mediaType === 'video') {
      const maxBytes = 52_428_800 // 50 MB
      if (file.size > maxBytes) {
        return NextResponse.json({ error: 'วิดีโอใหญ่เกิน 50 MB' }, { status: 400 })
      }

      await ensureBucket(supabase, VIDEO_BUCKET, ['video/mp4', 'video/quicktime', 'video/webm'], maxBytes)

      const ext      = file.name.split('.').pop()?.toLowerCase() || 'mp4'
      const filename = `${Date.now()}-${rand()}.${ext}`
      const buffer   = Buffer.from(await file.arrayBuffer())

      const { error } = await supabase.storage
        .from(VIDEO_BUCKET)
        .upload(filename, buffer, { contentType: file.type, upsert: false })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      const { data: { publicUrl } } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(filename)
      return NextResponse.json({ url: publicUrl })
    }

    // ── IMAGE: optimise with Sharp before upload ──────────────────────────────
    const maxInputBytes = 30_000_000 // 30 MB raw input limit
    if (file.size > maxInputBytes) {
      return NextResponse.json({ error: 'รูปภาพใหญ่เกิน 30 MB' }, { status: 400 })
    }

    await ensureBucket(
      supabase, IMAGE_BUCKET,
      ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      10_485_760,
    )

    const rawBuffer = Buffer.from(await file.arrayBuffer())
    const baseName  = `${Date.now()}-${rand()}`

    // ── Main image: resize + convert to WebP ─────────────────────────────────
    const mainBuffer = await sharp(rawBuffer)
      .rotate()                                   // auto-rotate from EXIF
      .resize(IMG_MAX_WIDTH, IMG_MAX_HEIGHT, {
        fit:           'inside',                  // never upscale
        withoutEnlargement: true,
      })
      .webp({ quality: IMG_QUALITY, effort: 4 }) // effort 4 = balanced speed/size
      .toBuffer()

    // ── Thumbnail: 480px wide for listing cards ───────────────────────────────
    const thumbBuffer = await sharp(rawBuffer)
      .rotate()
      .resize(THUMB_WIDTH, undefined, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY, effort: 4 })
      .toBuffer()

    // ── Upload both ───────────────────────────────────────────────────────────
    const mainFilename  = `${baseName}.webp`
    const thumbFilename = `thumbs/${baseName}_thumb.webp`

    const [mainUpload, thumbUpload] = await Promise.all([
      supabase.storage.from(IMAGE_BUCKET).upload(mainFilename,  mainBuffer,  { contentType: 'image/webp', upsert: false }),
      supabase.storage.from(IMAGE_BUCKET).upload(thumbFilename, thumbBuffer, { contentType: 'image/webp', upsert: false }),
    ])

    if (mainUpload.error) {
      return NextResponse.json({ error: mainUpload.error.message }, { status: 500 })
    }

    const { data: { publicUrl } }      = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(mainFilename)
    const { data: { publicUrl: thumb } } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(thumbFilename)

    // Stats for logging
    const origKB  = Math.round(file.size / 1024)
    const mainKB  = Math.round(mainBuffer.byteLength / 1024)
    const thumbKB = Math.round(thumbBuffer.byteLength / 1024)
    const saving  = Math.round((1 - mainKB / origKB) * 100)

    console.log(`📸 Image optimised: ${origKB}KB → ${mainKB}KB (${saving}% saved) | thumb: ${thumbKB}KB`)

    return NextResponse.json({
      url:        publicUrl,   // full-size WebP — store this in properties.images[]
      thumb_url:  thumb,       // thumbnail WebP — for listing cards
      stats: { orig_kb: origKB, main_kb: mainKB, thumb_kb: thumbKB, saving_pct: saving },
    })

  } catch (err: any) {
    console.error('Upload route error:', err)
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}

// ── Tiny random suffix helper ─────────────────────────────────────────────────
function rand() {
  return Math.random().toString(36).slice(2, 8)
}
