import { unstable_cache } from 'next/cache'
import { createServerClient } from '@/lib/supabase'
import { type Guide, type GuideLocale, DEFAULT_GUIDE, LISTING_GUIDE_KEY, GUIDE_TAG, normaliseGuide } from '@/lib/guide-data'

// Server side of the listing guide. Text, types and defaults live in guide-data.
export * from '@/lib/guide-data'

const loadStored = unstable_cache(
  async (): Promise<unknown> => {
    const { data, error } = await createServerClient()
      .from('site_settings').select('value').eq('key', LISTING_GUIDE_KEY).maybeSingle()
    if (error) throw error
    return data?.value ?? null
  },
  ['listing-guide'],
  { revalidate: 300, tags: [GUIDE_TAG] },
)

/** The guide for a locale: the dashboard's saved version, or the default. Server only. */
export async function loadGuide(locale: GuideLocale): Promise<Guide> {
  try {
    const stored = (await loadStored()) as Record<string, unknown> | null
    return stored?.[locale] ? normaliseGuide(stored[locale], locale) : DEFAULT_GUIDE[locale]
  } catch (err) {
    console.error('[guide]', err instanceof Error ? err.message : String(err))
    return DEFAULT_GUIDE[locale]
  }
}

/** The page around the guide text: fixed strings, not edited from the dashboard. */
export const GUIDE_UI = {
  th: {
    metaTitle: 'คู่มือการลงประกาศ',
    metaDesc: 'วิธีลงประกาศให้เช่ากับ SpacesMate ทีละขั้นตอน ตั้งแต่สมัครบัญชี กรอกข้อมูล ปักหมุด ใส่รูป จนชำระเงินและจัดการประกาศ',
    home: 'หน้าแรก',
    crumb: 'คู่มือการลงประกาศ',
    toc: 'ในคู่มือนี้',
    step: (n: number) => `ขั้นที่ ${n}`,
    faqTitle: 'คำถามเกี่ยวกับการลงประกาศ',
    faqLink: 'คำถามที่พบบ่อย',
    allFaq: 'ดูคำถามทั้งหมด →',
    ctaTitle: 'พร้อมลงประกาศแล้ว?',
    ctaBody: 'แพ็กเกจเริ่มต้น ฿299 ต่อ 30 วัน ประกาศขึ้นทันทีที่ชำระเงิน',
    cta: 'เริ่มลงประกาศ',
  },
  en: {
    metaTitle: 'Listing guide',
    metaDesc: 'How to list a rental on SpacesMate step by step: account, details, map pin, photos, payment and managing your listing.',
    home: 'Home',
    crumb: 'Listing guide',
    toc: 'In this guide',
    step: (n: number) => `Step ${n}`,
    faqTitle: 'Questions about listing',
    faqLink: 'FAQ',
    allFaq: 'See all questions →',
    ctaTitle: 'Ready to list?',
    ctaBody: 'Packages start at ฿299 for 30 days, and your listing goes live as soon as you pay',
    cta: 'Start listing',
  },
} as const
