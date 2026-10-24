'use client'

import { usePathname } from 'next/navigation'
import { thPath } from '@/lib/routes-i18n'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FloatingChat from '@/components/ui/FloatingChat'
import TermsGate from '@/components/auth/TermsGate'
import { useLocale } from '@/lib/use-locale'

// Routes that have their own dedicated layouts — suppress the public Navbar/Footer/FloatingChat
const DASHBOARD_ROUTES = ['/dashboard', '/owner-dashboard', '/login', '/reset-password']

export default function ConditionalSiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''
  const locale = useLocale()
  /**
   * Match on the Thai path, so /en/owner-dashboard is suppressed exactly like
   * /owner-dashboard. Before this, the list held no /en entries, so the English
   * dashboard rendered the public Navbar and Footer ON TOP of the owner portal
   * bar — two headers — while the Thai one correctly showed only the portal.
   *
   * The giveaway was a language toggle appearing on the English dashboard and
   * not the Thai one: that toggle belongs to the public navbar that should not
   * have been there at all. The portal has its own now, in DashboardChrome.
   */
  const base = thPath(pathname)
  const isDashboard = DASHBOARD_ROUTES.some(r => base === r || base.startsWith(r + '/'))
  // Not on the pages where people are signing in or resetting a password.
  const gate = base === '/login' || base === '/reset-password' ? null : <TermsGate locale={locale} />

  if (isDashboard) {
    // Dashboard pages have their own header/layout — render children only
    return <>{children}{gate}</>
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <FloatingChat />
      {gate}
    </>
  )
}
