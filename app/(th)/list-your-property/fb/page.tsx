import type { Metadata } from 'next'
import FbLandingBody, { type SampleCard } from '@/components/marketing/FbLandingBody'
import { getCheckoutPromo } from '@/lib/promo-server'
import { createServerClient } from '@/lib/supabase'
import { PROPERTY_TYPE_LABELS } from '@/lib/constants'

/**
 * Facebook / Instagram ad landing page for owners (Founder, 27 Nov 2026).
 *
 * Thai only, single purpose, not indexed: it duplicates /list-your-property for
 * search and exists only for paid traffic. Cached for five minutes, so it costs
 * two small database reads per five minutes however much traffic the ads send
 * (the site is on Vercel Hobby with server CPU near its limit).
 */
export const revalidate = 300
// The Supabase server client fetches with no-store, which would otherwise make
// this page render on every ad click. Force the page static and its two reads
// cached, refreshed every 5 minutes.
export const dynamic = 'force-static'
export const fetchCache = 'force-cache'

export const metadata: Metadata = {
  title: 'ลงประกาศให้เช่า เดือนแรกฟรี',
  description: 'เจ้าของห้องเช่า คอนโด อพาร์ทเมนท์ ลงประกาศบน SpacesMate กรอกข้อมูลได้เลย ใช้โค้ดตอนชำระ ประกาศขึ้นเว็บทันที ไม่มีค่าคอมมิชชัน',
  robots: { index: false, follow: false },
  alternates: { canonical: '/list-your-property' },
}

async function getSamples(): Promise<SampleCard[]> {
  try {
    const { data } = await createServerClient()
      .from('properties')
      .select('title_th, property_type, district, price_from, images')
      .eq('listing_status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .gt('price_from', 0)
      .order('created_at', { ascending: false })
      .limit(12)
    return (data ?? [])
      .filter(r => Array.isArray(r.images) && typeof r.images[0] === 'string')
      .slice(0, 2)
      .map(r => ({
        title: String(r.title_th ?? ''),
        meta: [PROPERTY_TYPE_LABELS[r.property_type as keyof typeof PROPERTY_TYPE_LABELS]?.th ?? '', r.district ?? ''].filter(Boolean).join(' · '),
        price: Number(r.price_from) || 0,
        image: r.images[0] as string,
      }))
  } catch {
    return []
  }
}

export default async function Page() {
  const [promo, samples] = await Promise.all([getCheckoutPromo(), getSamples()])
  return <FbLandingBody promoCode={promo.enabled ? promo.code : null} samples={samples} />
}
