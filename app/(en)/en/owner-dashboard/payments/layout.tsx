import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Payment history',
  robots: { index: false, follow: false },
}

export default function EnPaymentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
