// build: 2026-06-24
//
// This revalidate has no effect today and must not be relied on. Several
// sections here query through createServerClient, which passes cache:'no-store'
// to every request and so opts the whole route out of prerendering — production
// returns x-vercel-cache: MISS and renders fresh on every hit.
//
// That is load-bearing, not incidental: Fair Rotation reshuffles the featured
// listings per request. If the no-store queries ever go away, this line would
// quietly start caching the page for 60s and the rotation would freeze. Delete
// it then, or make the shuffle explicit.
export const revalidate = 60

import type { Metadata } from 'next'
import { withPageSeo } from '@/lib/page-seo'
import HeroSection from '@/components/sections/HeroSection'

const baseMetadata: Metadata = {
  title: 'SpacesMate — ห้องเช่า คอนโด อพาร์ทเม้นท์ ในกรุงเทพ',
  description:
    'ค้นหาห้องเช่า คอนโด อพาร์ทเม้นท์ บ้านเช่า โคเวิร์กกิ้ง และออฟฟิศในกรุงเทพ ประกาศที่ยืนยันแล้ว ไม่มีค่านายหน้า ลงประกาศเริ่มต้นเพียง ฿299/เดือน',
  keywords: [
    'ห้องเช่า กรุงเทพ', 'คอนโดให้เช่า', 'อพาร์ทเม้นท์ให้เช่า', 'บ้านเช่ากรุงเทพ',
    'Bangkok apartment rent', 'condo for rent Bangkok', 'SpacesMate', 'ที่พักกรุงเทพ',
  ],
  openGraph: {
    title: 'SpacesMate — ห้องเช่า คอนโด อพาร์ทเม้นท์ ในกรุงเทพ',
    description: 'ค้นหาห้องเช่า คอนโด อพาร์ทเม้นท์ บ้านเช่า และออฟฟิศในกรุงเทพ — ประกาศที่ยืนยันแล้ว ไม่มีค่านายหน้า',
    type: 'website',
    url: 'https://spacesmate.com',
    images: [{ url: 'https://spacesmate.com/og-image.jpg', width: 1200, height: 630, alt: 'SpacesMate — ห้องเช่าในกรุงเทพ' }],
  },
  alternates: { canonical: 'https://spacesmate.com' },
}


import CategorySection from '@/components/sections/CategorySection'
import FeaturedListings from '@/components/sections/FeaturedListings'
import WhySpacesMate from '@/components/sections/WhySpacesMate'
import ManagementCTA from '@/components/sections/ManagementCTA'
import BlogSection from '@/components/sections/BlogSection'
import AreaLinks from '@/components/sections/AreaLinks'
import UniversityLinks from '@/components/sections/UniversityLinks'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <FeaturedListings />
      <WhySpacesMate />
      <ManagementCTA />
      <BlogSection />
      <AreaLinks />
      <UniversityLinks />
    </>
  )
}

/** Title, description and indexing from /dashboard/pages override the defaults above. */
export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo('/', 'th', baseMetadata)
}
