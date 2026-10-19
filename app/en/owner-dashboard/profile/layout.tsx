import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your details',
  robots: { index: false, follow: false },
}

export default function EnProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
