import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ค้นหาที่พัก | SpacesMate',
  description:
    'ค้นหาห้องเช่า คอนโด อพาร์ทเม้นท์ บ้านเช่า โคเวิร์กกิ้งสเปซ และออฟฟิศในกรุงเทพและทั่วไทย กรองตามราคา ทำเล BTS/MRT ประเภทที่พัก และสิ่งอำนวยความสะดวก',
  keywords: [
    'ค้นหาห้องเช่า', 'หาคอนโดเช่า', 'apartment search Bangkok', 'condo rent Bangkok',
    'ห้องพักกรุงเทพ', 'บ้านเช่ากรุงเทพ',
  ],
  openGraph: {
    title: 'ค้นหาที่พักให้เช่า | SpacesMate',
    description: 'ค้นหาห้องเช่า คอนโด อพาร์ทเม้นท์ ในกรุงเทพและทั่วไทย กรองตามราคาและทำเล',
    type: 'website',
    url: 'https://spacesmate.com/search',
  },
  alternates: { canonical: 'https://spacesmate.com/search' },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
