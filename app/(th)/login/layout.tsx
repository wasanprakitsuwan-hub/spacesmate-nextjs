import type { Metadata } from 'next'
import { hreflang } from '@/lib/hreflang'

/**
 * The root layout's template already appends "| SpacesMate", so repeating it
 * here rendered "เข้าสู่ระบบ | SpacesMate | SpacesMate".
 */
export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ',
  description: 'เข้าสู่ระบบหรือสร้างบัญชี SpacesMate เพื่อจัดการประกาศและดูรายงานทรัพย์สิน',
  robots: { index: false, follow: false },
  alternates: hreflang('/login', 'th'),
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
