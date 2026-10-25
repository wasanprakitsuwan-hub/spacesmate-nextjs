import type { Metadata } from 'next'
import { withPageSeo } from '@/lib/page-seo'
import { hreflang } from '@/lib/hreflang'

/**
 * The root layout sets `template: '%s | SpacesMate'`, so the title here must not
 * repeat the suffix — it was rendering "รับบริหารทรัพย์สิน | SpacesMate | SpacesMate".
 */
const baseMetadata: Metadata = {
  title: 'รับบริหารทรัพย์สิน',
  description:
    'ให้ SpacesMate บริหารอพาร์ทเม้นท์และคอนโดของคุณครบวงจร — หาผู้เช่า เก็บค่าเช่า ซ่อมบำรุง รายงานผลรายเดือน ค่าบริการแบบ Performance-Based ไม่มีค่าใช้จ่ายล่วงหน้า',
  keywords: [
    'รับบริหารอพาร์ทเม้นท์', 'รับบริหารคอนโด', 'บริหารทรัพย์สิน กรุงเทพ',
    'property management Bangkok', 'SpacesMate บริหาร',
  ],
  openGraph: {
    title: 'รับบริหารทรัพย์สิน | SpacesMate',
    description: 'ให้ SpacesMate บริหารอพาร์ทเม้นท์และคอนโดของคุณ — Performance-Based ไม่มีค่าใช้จ่ายล่วงหน้า',
    type: 'website',
    url: 'https://spacesmate.com/manage',
    locale: 'th_TH',
  },
  alternates: hreflang('/manage', 'th'),
}

export default function ManageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

/** Title, description and indexing from /dashboard/pages override the defaults above. */
export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo('/manage', 'th', baseMetadata)
}
