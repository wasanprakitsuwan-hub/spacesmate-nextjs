import DashboardChrome from '@/components/dashboard/DashboardChrome'

/**
 * The English dashboard shares every component with the Thai one; the locale
 * comes from the URL. See components/dashboard/DashboardChrome.
 */
export default function EnOwnerDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardChrome>{children}</DashboardChrome>
}
