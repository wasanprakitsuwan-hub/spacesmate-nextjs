import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FloatingChat from '@/components/ui/FloatingChat'

export const metadata: Metadata = {
  title: {
    default: 'SpacesMate — ค้นหาที่พักในกรุงเทพ อพาร์ทเม้นท์ คอนโด บ้านเช่า',
    template: '%s | SpacesMate',
  },
  description: 'SpacesMate — แพลตฟอร์มค้นหาที่พักในกรุงเทพ อพาร์ทเม้นท์ คอนโด บ้านเช่า โคเวิร์กกิ้งสเปซ และออฟฟิศ ประกาศที่ผ่านการยืนยัน ไม่มีค่าใช้จ่ายซ่อน',
  keywords: ['เช่าคอนโด', 'เช่าอพาร์ทเม้นท์', 'บ้านเช่า', 'Bangkok rental', 'SpacesMate', 'ที่พักกรุงเทพ'],
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: 'https://spacesmate.com',
    siteName: 'SpacesMate',
    images: [{ url: 'https://spacesmate.com/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="bg-spacemate-bgLight text-spacemate-textCharcoal font-sans antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <FloatingChat />
      </body>
    </html>
  )
}
