import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ติดต่อเรา | SpacesMate',
  description:
    'ติดต่อ SpacesMate — สำหรับนักลงทุน พันธมิตรธุรกิจ หรือสอบถามการบริหารทรัพย์สิน ทีมงานตอบกลับภายใน 24 ชั่วโมง',
  openGraph: {
    title: 'ติดต่อ SpacesMate',
    description: 'สอบถามบริการบริหารทรัพย์สิน ร่วมลงทุน หรือเป็นพันธมิตรธุรกิจกับ SpacesMate',
    type: 'website',
    url: 'https://spacesmate.com/contact',
  },
  alternates: { canonical: 'https://spacesmate.com/contact' },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
