import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'รับบริหารทรัพย์สิน | SpacesMate',
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
  },
  alternates: { canonical: 'https://spacesmate.com/manage' },
}

export default function ManageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
