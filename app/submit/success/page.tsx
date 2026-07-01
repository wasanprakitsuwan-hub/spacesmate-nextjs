import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ชำระเงินสำเร็จ | SpacesMate',
}

export default function SubmitSuccessPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', maxWidth: 520, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(2,64,46,0.08)' }}>

        {/* Icon */}
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <span className="msym" style={{ fontSize: 36, color: '#16a34a', fontVariationSettings: "'FILL' 1, 'wght' 400" }}>check_circle</span>
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#02402e', margin: '0 0 12px' }}>
          ชำระเงินสำเร็จ!
        </h1>
        <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, margin: '0 0 32px' }}>
          ประกาศของคุณได้รับการเผยแพร่แล้ว<br />
          ผู้เช่าจะเห็นประกาศของคุณบน SpacesMate ทันที
        </p>

        {/* What's next */}
        <div style={{ background: '#f8fafc', borderRadius: 16, padding: '20px 24px', marginBottom: 32, textAlign: 'left' }}>
          <p style={{ fontSize: 12.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 14px' }}>
            ขั้นตอนถัดไป
          </p>
          {[
            { icon: 'search', text: 'ประกาศปรากฏบน /search แล้ว' },
            { icon: 'email', text: 'ระบบส่งอีเมลยืนยันให้คุณแล้ว' },
            { icon: 'manage_accounts', text: 'จัดการประกาศได้ใน Owner Dashboard' },
            { icon: 'autorenew', text: 'ต่ออายุอัตโนมัติเมื่อครบรอบ' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < 3 ? 12 : 0 }}>
              <span className="msym" style={{ fontSize: 18, color: '#048c73' }}>{item.icon}</span>
              <span style={{ fontSize: 13.5, color: '#475569' }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
          <Link
            href="/owner-dashboard"
            style={{ display: 'block', background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 14.5, borderRadius: 12, padding: '13px 24px', textDecoration: 'none' }}
          >
            ไปที่ Owner Dashboard
          </Link>
          <Link
            href="/search"
            style={{ display: 'block', background: '#f0f9f5', color: '#02402e', fontWeight: 600, fontSize: 14.5, borderRadius: 12, padding: '13px 24px', textDecoration: 'none' }}
          >
            ดูประกาศของฉันบนเว็บ
          </Link>
        </div>

        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 24 }}>
          มีคำถาม? ติดต่อ{' '}
          <a href="mailto:hello@spacesmate.com" style={{ color: '#048c73', textDecoration: 'none' }}>hello@spacesmate.com</a>
        </p>
      </div>
    </div>
  )
}
