import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ยกเลิกการชำระเงิน | SpacesMate',
  description: 'ยกเลิกการชำระเงิน — คุณสามารถกลับไปเลือกแพ็กเกจและลองอีกครั้งได้ทุกเมื่อ',
  robots: { index: false, follow: false },
}

export default function SubmitCancelPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(2,64,46,0.08)' }}>

        {/* Icon */}
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fef9e8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <span className="msym" style={{ fontSize: 36, color: '#d97f11', fontVariationSettings: "'FILL' 1, 'wght' 400" }}>info</span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#231f20', margin: '0 0 12px' }}>
          ยังไม่ได้ชำระเงิน
        </h1>
        <p style={{ fontSize: 14.5, color: '#64748b', lineHeight: 1.7, margin: '0 0 32px' }}>
          ข้อมูลประกาศของคุณถูกบันทึกไว้แล้ว<br />
          กลับไปเลือกแพ็กเกจและชำระเงินเพื่อเผยแพร่
        </p>

        <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
          <Link
            href="/submit/new"
            style={{ display: 'block', background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 14.5, borderRadius: 12, padding: '13px 24px', textDecoration: 'none' }}
          >
            กลับไปลงประกาศ
          </Link>
          <Link
            href="/"
            style={{ display: 'block', background: '#f0f9f5', color: '#02402e', fontWeight: 600, fontSize: 14.5, borderRadius: 12, padding: '13px 24px', textDecoration: 'none' }}
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  )
}
