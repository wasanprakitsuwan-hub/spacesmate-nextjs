'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FloatingChat from '@/components/ui/FloatingChat'

// Routes that have their own dedicated layouts — suppress the public Navbar/Footer/FloatingChat
const DASHBOARD_ROUTES = ['/dashboard', '/owner-dashboard', '/login']

export default function ConditionalSiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''
  const isDashboard = DASHBOARD_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))

  if (isDashboard) {
    // Dashboard pages have their own header/layout — render children only
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <FloatingChat />
    </>
  )
}
