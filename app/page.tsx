// build: 2026-06-24
export const revalidate = 60

import type { Metadata } from 'next'
import HeroSection from '@/components/sections/HeroSection'

export const metadata: Metadata = {
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
    </>
  )
}
