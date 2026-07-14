import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ลงประกาศเช่า | SpacesMate',
  description:
    'ลงประกาศเช่าอพาร์ทเม้นท์ คอนโด บ้าน ออฟฟิศ หรือโคเวิร์กกิ้งสเปซ เริ่มต้นเพียง ฿299/เดือน เผยแพร่ทันทีหลังชำระ เข้าถึงผู้เช่าที่กำลังมองหาจริงๆ',
  keywords: ['ลงประกาศเช่า', 'ลงประกาศคอนโด', 'ลงประกาศห้องพัก', 'property listing Thailand'],
  openGraph: {
    title: 'ลงประกาศเช่ากับ SpacesMate — เริ่มต้น ฿299/เดือน',
    description: 'เข้าถึงผู้เช่าที่กำลังมองหาจริงๆ ระบบสุ่มแสดงผลเท่าเทียม ไม่ต้องจ่ายเพื่อขึ้นหน้าแรก',
    type: 'website',
    url: 'https://spacesmate.com/submit',
  },
  alternates: { canonical: 'https://spacesmate.com/submit' },
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { num: '50+',      label: 'ย่านทั่วกรุงเทพ' },
  { num: '฿299',     label: 'ราคาเริ่มต้น/ประกาศ/เดือน' },
  { num: '< 24 ชม.', label: 'เผยแพร่ประกาศทันทีหลังชำระ' },
]

const WHY = [
  { icon: 'person_search',   title: 'ผู้เช่าที่กำลังมองหาจริงๆ', desc: 'เข้าถึงคนที่เสิร์ชหาห้องเช่าออนไลน์โดยตรง ไม่ต้องรอลุ้นจากป้ายไวนิลหรือปากต่อปาก' },
  { icon: 'verified',        title: 'ประกาศถูกต้อง ข้อมูลแม่นยำ', desc: 'ระบบตรวจสอบให้ประกาศอัปเดตอยู่เสมอ ผู้เช่าเห็นข้อมูลจริง ลดการติดต่อที่เสียเวลา' },
  { icon: 'payments',        title: 'เริ่มต้นเพียง ฿299/เดือน',  desc: 'แพ็กเกจรายเดือนถึงรายปี คุ้มค่ากว่าค่าคอมมิชชันแบบเดิมหลายเท่า' },
  { icon: 'shuffle',         title: 'ไม่ต้องจ่ายเพื่อขึ้นหน้าแรก', desc: 'ระบบสุ่มแสดงผลเท่าเทียมทุกประกาศ ทุกเจ้าของมีสิทธิ์เท่ากัน ไม่มีใครได้เปรียบ' },
]

const STEPS = [
  { num: '1', title: 'เลือกแพ็กเกจ',            desc: 'เลือก Basic ฿299 · Standard ฿699 · Premium ฿2,499 ที่เหมาะกับทรัพย์สินของคุณ' },
  { num: '2', title: 'กรอกข้อมูลและอัปโหลดรูป', desc: 'ชื่อ ประเภท ราคา ที่อยู่ สิ่งอำนวยความสะดวก และรูปภาพ — ทำทีเดียวจบ' },
  { num: '3', title: 'ชำระและเผยแพร่ทันที',      desc: 'ชำระผ่าน Stripe ปลอดภัย 100% — ประกาศขึ้นเว็บทันทีที่ชำระสำเร็จ' },
]

const PACKAGES = [
  {
    id: 'basic',
    period: 'Basic',
    price: '299',
    sub: '1 ประกาศ · แสดงผล 1 เดือน',
    badge: null as string | null,
    savings: null as string | null,
    highlight: false,
    features: [
      '1 ประกาศ',
      'รูปภาพสูงสุด 10 รูป',
      'แสดงผล 30 วัน',
      'เผยแพร่ทันทีหลังชำระ',
    ],
  },
  {
    id: 'standard',
    period: 'Standard',
    price: '699',
    sub: '1 ประกาศ · แสดงผล 3 เดือน',
    badge: 'ยอดนิยม' as string | null,
    savings: '22%' as string | null,
    highlight: true,
    features: [
      '1 ประกาศ',
      'รูปภาพสูงสุด 10 รูป',
      'แสดงผล 90 วัน',
      'เผยแพร่ทันทีหลังชำระ',
    ],
  },
  {
    id: 'premium',
    period: 'Premium',
    price: '2,499',
    sub: '1 ประกาศ · แสดงผล 12 เดือน',
    badge: null as string | null,
    savings: '30%' as string | null,
    highlight: false,
    features: [
      '1 ประกาศ',
      'รูปภาพสูงสุด 10 รูป',
      'แสดงผล 365 วัน',
      'เผยแพร่ทันทีหลังชำระ',
    ],
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubmitPage() {
  return (
    <div style={{ fontFamily: 'inherit', color: '#231f20' }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ background: '#02402e', padding: '56px 24px 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, alignItems: 'center' }} className="sm-hero-grid">

          {/* Left — Text */}
          <div>
            <p style={{ fontSize: 13.5, color: '#d97f11', fontWeight: 600, margin: '0 0 14px' }}>
              สำหรับเจ้าของทรัพย์สิน
            </p>
            <h1 style={{ margin: '0 0 6px', lineHeight: 1.15, letterSpacing: '-0.4px' }}>
              <span style={{ fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 700, color: '#fff', display: 'block' }}>
                ลงประกาศปล่อยเช่า
              </span>
              <span style={{ fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 700, color: '#d97f11', display: 'block' }}>
                เริ่มต้น ฿299/เดือน
              </span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15.5, fontWeight: 300, lineHeight: 1.7, margin: '20px 0 32px', maxWidth: 480 }}>
              ปล่อยเช่าทรัพย์สินของคุณให้เข้าถึงผู้เช่าที่ผ่านการยืนยันหลายพันคน สร้างประกาศเองง่ายๆ ใน 3 ขั้นตอน — เผยแพร่ทันทีหลังชำระ
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/submit/new"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 15.5, borderRadius: 28, padding: '14px 28px', textDecoration: 'none' }}>
                เริ่มลงประกาศเลย<span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 300, 'FILL' 0", marginLeft: 5 }}>arrow_forward</span>
              </Link>
              <Link href="/manage"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: '#fff', fontWeight: 600, fontSize: 15.5, borderRadius: 28, padding: '14px 24px', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.5)' }}>
                อยากให้เราดูแลให้
              </Link>
            </div>
          </div>

          {/* Right — Stats box */}
          <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '28px 30px', backdropFilter: 'blur(8px)' }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: i > 0 ? '20px 0 0' : '0 0 20px', borderBottom: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none', marginBottom: i < STATS.length - 1 ? 20 : 0 }}>
                <span style={{ fontSize: 'clamp(24px,3vw,32px)', fontWeight: 700, color: '#d97f11', minWidth: 100, lineHeight: 1.1 }}>{s.num}</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 300, lineHeight: 1.45 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY SECTION ──────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 600, margin: '0 0 8px', textAlign: 'center', color: '#111827' }}>
            ลงประกาศกับ SpacesMate ดียังไง
          </h2>
          <p style={{ color: '#6b7280', fontSize: 15, margin: '0 0 40px', textAlign: 'center', fontWeight: 300 }}>
            แพลตฟอร์มที่ช่วยให้คุณปล่อยเช่าได้เร็วและปลอดภัย
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }} className="sm-why4">
            {WHY.map(w => (
              <div key={w.icon} style={{ background: '#fff', border: '1px solid #e5eae8', borderRadius: 16, padding: '28px 22px' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#048c73', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <span className="msym" style={{ fontSize: 26, color: '#fff' }}>{w.icon}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px', color: '#111827' }}>{w.title}</h3>
                <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, margin: 0, fontWeight: 300 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 STEPS ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '16px 24px 64px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 600, margin: '0 0 36px', textAlign: 'center', color: '#111827' }}>
            ลงประกาศง่ายๆ 3 ขั้นตอน
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }} className="sm-steps3">
            {STEPS.map(s => (
              <div key={s.num} style={{ background: '#fff', border: '1px solid #e5eae8', borderRadius: 18, padding: '36px 28px', textAlign: 'center' }}>
                {/* Teal circle number */}
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#048c73', color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  {s.num}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 10px', color: '#111827' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', margin: 0, fontWeight: 300, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#e8f4ef', padding: '64px 24px 72px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 600, margin: '0 0 8px', textAlign: 'center', color: '#111827' }}>
            แพ็กเกจราคา
          </h2>
          <p style={{ color: '#6b7280', fontSize: 15, margin: '0 0 16px', textAlign: 'center', fontWeight: 300 }}>
            1 ประกาศ/แพ็กเกจ — เผยแพร่ทันทีหลังชำระ ไม่ต้องรอ
          </p>
          {/* Green promo note */}
          <p style={{ textAlign: 'center', fontSize: 14, color: '#02402e', fontWeight: 500, margin: '0 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span className="msym" style={{ fontSize: 16, color: '#d97f11', fontVariationSettings: "'wght' 400, 'FILL' 1" }}>check_circle</span>
            แพ็กเกจสูงสุด 12 เดือน เพื่อให้ประกาศได้รับการอัปเดตเสมอ — ข้อมูลแม่นกว่าเว็บอื่น
          </p>

          {/* ── SM299 Promo banner ──────────────────────────────────────────── */}
          <div style={{ maxWidth: 860, margin: '0 auto 32px', padding: '14px 22px', background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: '1.5px solid #fde68a', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="msym" style={{ fontSize: 26, color: '#d97f11', fontVariationSettings: "'wght' 400, 'FILL' 1", flexShrink: 0 }}>sell</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#92400e' }}>ลงประกาศฟรีเดือนแรก!</p>
              <p style={{ margin: '3px 0 0', fontSize: 13.5, color: '#78350f' }}>
                ใช้โค้ด{' '}
                <strong style={{ letterSpacing: 2, color: '#02402e', background: '#fff', padding: '2px 10px', borderRadius: 7, fontSize: 14, border: '1px solid #d97f11', fontFamily: 'monospace' }}>SM299</strong>
                {' '}ขั้นตอนสุดท้าย — ลดทันที ฿299 สำหรับแพ็กเกจแรก
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, maxWidth: 860, margin: '0 auto' }} className="sm-pkg3">
            {PACKAGES.map((pkg) => (
              <div key={pkg.period} style={{ position: 'relative', background: '#fff', border: `2px solid ${pkg.highlight ? '#d97f11' : '#e5eae8'}`, borderRadius: 18, padding: '28px 22px', display: 'flex', flexDirection: 'column' }}>

                {/* แนะนำ badge */}
                {pkg.badge && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#d97f11', color: '#fff', fontSize: 12.5, fontWeight: 700, padding: '5px 18px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                    {pkg.badge}
                  </div>
                )}

                {/* Period */}
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 10px', color: '#374151' }}>{pkg.period}</h3>

                {/* Price */}
                <div style={{ marginBottom: 6, display: 'flex', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: 38, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{pkg.price}</span>
                    <span style={{ fontSize: 16, fontWeight: 500, color: '#111827', marginLeft: 4 }}>บาท</span>
                  </div>
                  {pkg.savings && (
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', background: '#048c73', borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap', marginBottom: 4 }}>
                      ประหยัด {pkg.savings}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 22px', fontWeight: 300 }}>{pkg.sub}</p>

                {/* Features */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {pkg.features.map((f, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: '#374151', lineHeight: 1.45, fontWeight: 300 }}>
                      <span className="msym" style={{ fontSize: 14, color: '#048c73', fontVariationSettings: "'wght' 400, 'FILL' 1", flexShrink: 0 }}>check</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={`/submit/new?package=${pkg.id}`}
                  style={{
                    display: 'block', textAlign: 'center', fontWeight: 600, fontSize: 15,
                    borderRadius: 28, padding: '13px 0', textDecoration: 'none', transition: 'all .2s',
                    background: pkg.highlight ? '#d97f11' : '#fff',
                    color: pkg.highlight ? '#fff' : '#374151',
                    border: `1.5px solid ${pkg.highlight ? '#d97f11' : '#d1d5db'}`,
                  }}>
                  เลือกแพ็กเกจนี้
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '48px 24px 72px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(135deg,#02402e 0%,#036b56 100%)', borderRadius: 24, padding: '56px 24px', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 700, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.3px' }}>
              พร้อมปล่อยเช่าแล้วหรือยัง?
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', margin: '0 0 32px', fontWeight: 300 }}>
              เผยแพร่ประกาศของคุณต่อผู้เช่าหลายพันคน เริ่มต้นเพียง ฿299
            </p>
            <Link href="/submit/new"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 16, borderRadius: 30, padding: '15px 36px', textDecoration: 'none' }}>
              เริ่มลงประกาศเลย →
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 960px) {
          .sm-hero-grid { grid-template-columns: 1fr !important; }
          .sm-why4 { grid-template-columns: repeat(2,1fr) !important; }
          .sm-pkg3 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .sm-hero-grid { gap: 32px !important; }
          .sm-why4 { grid-template-columns: 1fr !important; }
          .sm-steps3 { grid-template-columns: 1fr !important; }
          .sm-pkg3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
