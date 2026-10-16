import type { Metadata } from 'next'

/**
 * The root layout sets `template: '%s | SpacesMate'`, so a title here must not
 * repeat the suffix — doing so rendered "สร้างประกาศใหม่ | SpacesMate | SpacesMate".
 *
 * The description used to say the listing was paid for through Stripe and went
 * live immediately. That stopped being true on 3 Sep 2026, when this page was
 * changed to save a draft and charge nothing; the slot is bought afterwards.
 */
export const metadata: Metadata = {
  title: 'สร้างประกาศใหม่',
  description: 'กรอกข้อมูลและอัปโหลดรูปภาพเพื่อบันทึกประกาศเป็นฉบับร่าง — ยังไม่มีการเรียกเก็บเงิน เผยแพร่เมื่อมีสล็อตว่าง',
  robots: { index: false, follow: false },
}

export default function SubmitNewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
