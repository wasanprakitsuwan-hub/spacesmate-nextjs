import type { Metadata } from 'next'
import FAQAccordion from '@/components/faq/FAQAccordion'

// ─── AEO / SEO metadata ───────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'คำถามที่พบบ่อย (FAQ) | SpacesMate',
  description:
    'คำถามที่พบบ่อยเกี่ยวกับ SpacesMate — แพลตฟอร์มลงประกาศเช่า ฿299/เดือน และบริการบริหารทรัพย์สินครบวงจรในกรุงเทพ รูปแบบ Profit Sharing ได้รับส่วนแบ่งจากรายได้จริงเท่านั้น',
  keywords: [
    'FAQ SpacesMate', 'คำถามที่พบบ่อย', 'ลงประกาศเช่า', 'ค่าบริการบริหารทรัพย์สิน',
    'บริหารอพาร์ทเม้นท์', 'บริหารคอนโด', 'Fair Rotation', 'ประกาศอสังหาริมทรัพย์กรุงเทพ',
  ],
  openGraph: {
    title: 'คำถามที่พบบ่อย | SpacesMate',
    description: 'ทุกคำตอบเกี่ยวกับแพลตฟอร์มลงประกาศและบริการบริหารทรัพย์สินของ SpacesMate',
    type: 'website',
    url: 'https://spacesmate.com/faq',
  },
  alternates: { canonical: 'https://spacesmate.com/faq' },
}

export default function FAQPage() {
  return (
    <div className="bg-white min-h-screen">
      <FAQAccordion />
    </div>
  )
}
