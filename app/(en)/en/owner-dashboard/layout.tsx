import type { Metadata } from 'next'
import DashboardChrome from '@/components/dashboard/DashboardChrome'

/**
 * Behind auth and noindex, but the title still matters: it is what the browser
 * tab, a bookmark and a pasted link all show. Without it this fell through to
 * the root layout's Thai default.
 */
export const metadata: Metadata = {
  title: 'My listings',
  description: 'Manage your SpacesMate listings, slots and packages.',
  robots: { index: false, follow: false },
}

export default function EnOwnerDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardChrome>{children}</DashboardChrome>
}
