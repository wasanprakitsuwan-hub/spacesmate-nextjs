import type { Metadata } from 'next'
import DashboardChrome from '@/components/dashboard/DashboardChrome'

/**
 * The Thai dashboard had no metadata either — it inherited the site-wide
 * "find a place in Bangkok" title, which is a search page, not a dashboard.
 * Noticed while giving the English one a title.
 */
export const metadata: Metadata = {
  title: 'ประกาศของฉัน',
  description: 'จัดการประกาศ สล็อต และแพ็กเกจของคุณบน SpacesMate',
  robots: { index: false, follow: false },
}

export default function OwnerDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardChrome>{children}</DashboardChrome>
}
