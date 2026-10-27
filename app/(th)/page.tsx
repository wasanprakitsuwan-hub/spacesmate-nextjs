// build: 2026-06-24
//
// Cached for 60 seconds, then rebuilt in the background (ISR).
//
// Until 25 Oct 2026 this page was rebuilt for every visitor: createServerClient
// passes cache:'no-store' to every Supabase request, which opted the route out
// of prerendering, so each visit waited on a fresh render and every query
// before the first byte. That wait was the blank gap on load.
//
// force-static lets this page be prerendered despite those no-store queries
// (fetchCache = 'force-cache' does not: Next 14 still bails out on a no-store
// fetch during static generation). The queries still run fresh, once per
// rebuild rather than once per visitor. Nothing here reads cookies or headers,
// so forcing them empty changes nothing. Fair Rotation no longer depends on
// per-request rendering; it runs in the browser now (see
// components/sections/FeaturedGrid). A new or expired listing shows up here
// within a minute.
export const revalidate = 60
export const dynamic = 'force-static'

import type { Metadata } from 'next'
import { Suspense } from 'react'
import SectionPlaceholder from '@/components/sections/SectionPlaceholder'
import { withPageSeo } from '@/lib/page-seo'
import HeroSection from '@/components/sections/HeroSection'

const baseMetadata: Metadata = {
  title: 'SpacesMate — ห้องเช่า คอนโด อพาร์ทเม้นท์ ในกรุงเทพ',
  description:
    'ค้นหาห้องเช่า คอนโด อพาร์ทเม้นท์ บ้านเช่า โคเวิร์กกิ้ง และออฟฟิศในกรุงเทพ ประกาศที่ยืนยันแล้ว ติดต่อเจ้าของโดยตรง ลงประกาศเริ่มต้นเพียง ฿299/เดือน',
  keywords: [
    'ห้องเช่า กรุงเทพ', 'คอนโดให้เช่า', 'อพาร์ทเม้นท์ให้เช่า', 'บ้านเช่ากรุงเทพ',
    'Bangkok apartment rent', 'condo for rent Bangkok', 'SpacesMate', 'ที่พักกรุงเทพ',
  ],
  openGraph: {
    title: 'SpacesMate — ห้องเช่า คอนโด อพาร์ทเม้นท์ ในกรุงเทพ',
    description: 'ค้นหาห้องเช่า คอนโด อพาร์ทเม้นท์ บ้านเช่า และออฟฟิศในกรุงเทพ — ประกาศที่ยืนยันแล้ว ติดต่อเจ้าของโดยตรง',
    type: 'website',
    url: 'https://spacesmate.com',
    images: [{ url: 'https://spacesmate.com/og-image.jpg', width: 1200, height: 630, alt: 'SpacesMate — ห้องเช่าในกรุงเทพ' }],
  },
  alternates: hreflang('/', 'th'),
}


import FeaturedListings from '@/components/sections/FeaturedListings'
import OwnerPitch from '@/components/sections/OwnerPitch'
import ManagementCTA from '@/components/sections/ManagementCTA'
import BlogSection from '@/components/sections/BlogSection'
import AreaLinks from '@/components/sections/AreaLinks'
import UniversityLinks from '@/components/sections/UniversityLinks'
import { hreflang } from '@/lib/hreflang'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<SectionPlaceholder />}><FeaturedListings /></Suspense>
      <OwnerPitch />
      <ManagementCTA />
      <Suspense fallback={<SectionPlaceholder />}><BlogSection /></Suspense>
      <AreaLinks />
      <Suspense fallback={<SectionPlaceholder />}><UniversityLinks /></Suspense>
    </>
  )
}

/** Title, description and indexing from /dashboard/pages override the defaults above. */
export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo('/', 'th', baseMetadata)
}
