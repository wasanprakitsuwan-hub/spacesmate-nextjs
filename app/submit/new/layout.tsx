import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'สร้างประกาศใหม่ | SpacesMate',
  description: 'กรอกข้อมูลและอัปโหลดรูปภาพเพื่อสร้างประกาศเช่า — ชำระผ่าน Stripe ประกาศขึ้นเว็บทันที',
  robots: { index: false, follow: false },
}

export default function SubmitNewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
