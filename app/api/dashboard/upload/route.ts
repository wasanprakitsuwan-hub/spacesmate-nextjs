import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const IMAGE_BUCKET = 'property-images'
const VIDEO_BUCKET = 'property-videos'

async function ensureBucket(
  supabase: ReturnType<typeof createServerClient>,
  bucket: string,
  isPublic: boolean,
  fileSizeLimit: number,
) {
  // Try to create — ignores error if already exists
  await supabase.storage.createBucket(bucket, {
    public: isPublic,
    fileSizeLimit,
    allowedMimeTypes: isPublic && bucket === IMAGE_BUCKET
      ? ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      : ['video/mp4', 'video/quicktime', 'video/webm'],
  }).catch(() => {})
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server config error: SUPABASE_SERVICE_ROLE_KEY not set. Add it in Vercel → Settings → Environment Variables.' },
        { status: 500 }
      )
    }

    const supabase = createServerClient()
    const formData = await req.formData()
    const file    = formData.get('file') as File | null
    const type    = (formData.get('type') as string) || 'image'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const isVideo = type === 'video'
    const bucket  = isVideo ? VIDEO_BUCKET : IMAGE_BUCKET

    // Size limits: 50 MB video / 10 MB image
    const maxBytes = isVideo ? 52_428_800 : 10_485_760
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `ไฟล์ใหญ่เกินกำหนด (สูงสุด ${isVideo ? '50' : '10'} MB)` },
        { status: 400 }
      )
    }

    // Ensure bucket exists
    await ensureBucket(supabase, bucket, true, maxBytes)

    // Build a unique filename
    const ext = file.name.split('.').pop()?.toLowerCase() || (isVideo ? 'mp4' : 'jpg')
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    // Convert to Buffer for Supabase SDK
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename)

    return NextResponse.json({ url: publicUrl, filename })

  } catch (err: any) {
    console.error('Upload route error:', err)
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}
