import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isErr } from '@/lib/auth-guard'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  try {
    const { title, content, keyword, language = 'th' } = await req.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
    }

    // Strip HTML from content and cap at 2000 chars to keep prompt small
    const plainContent = stripHtml(content ?? '').slice(0, 2000)

    const isEn = language === 'en'
    const prompt = isEn
      ? `You are an SEO expert. Given the blog post below, generate:
1. A meta title (50–60 characters, include the main keyword naturally, end with "| SpacesMate")
2. A meta description (120–155 characters, compelling, include the main keyword, clear benefit)

Main keyword: ${keyword || title}
Post title: ${title}
Post excerpt: ${plainContent.slice(0, 500)}

Respond with ONLY valid JSON in this exact format (no markdown, no explanation):
{"metaTitle":"...","metaDesc":"..."}`
      : `คุณเป็นผู้เชี่ยวชาญด้าน SEO ภาษาไทย จากบทความด้านล่าง ให้สร้าง:
1. Meta Title (50–60 ตัวอักษร ใส่ keyword หลักอย่างเป็นธรรมชาติ ลงท้ายด้วย "| SpacesMate")
2. Meta Description (120–155 ตัวอักษร น่าคลิก ใส่ keyword หลัก บอกประโยชน์ที่ได้รับ)

Keyword หลัก: ${keyword || title}
ชื่อบทความ: ${title}
เนื้อหาบทความ (ตัวอย่าง): ${plainContent.slice(0, 500)}

ตอบด้วย JSON เท่านั้น ไม่ต้องอธิบายเพิ่ม (ไม่ใส่ markdown):
{"metaTitle":"...","metaDesc":"..."}`

    const response = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', err)
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>
    }

    const raw = data.content?.[0]?.text?.trim() ?? ''
    // Parse JSON from AI response — strip any accidental markdown fences
    const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(jsonStr) as { metaTitle: string; metaDesc: string }

    return NextResponse.json({ metaTitle: parsed.metaTitle, metaDesc: parsed.metaDesc })
  } catch (err) {
    console.error('generate-meta error:', err)
    return NextResponse.json({ error: 'Failed to generate meta' }, { status: 500 })
  }
}
