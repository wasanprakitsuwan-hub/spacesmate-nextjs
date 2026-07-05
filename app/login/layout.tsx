import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ | SpacesMate',
  description: 'เข้าสู่ระบบหรือสร้างบัญชี SpacesMate เพื่อจัดการประกาศและดูรายงานทรัพย์สิน',
  robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
