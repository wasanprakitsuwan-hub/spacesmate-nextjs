import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ราคาและแพ็กเกจ | SpacesMate',
  description: 'ลงประกาศเช่าอสังหาริมทรัพย์ เริ่มต้น ฿299/เดือน — 1 ประกาศต่อแพ็กเกจ เผยแพร่ทันทีหลังชำระ มีแพ็กเกจอาคารสำหรับผู้ที่มีหลายห้อง',
}

const PLANS = [
  {
    name: 'Basic',
    price: '299',
    period: '/เดือน',
    description: 'สำหรับเจ้าของที่ต้องการเริ่มต้น ทดลองใช้งานก่อนได้',
    highlight: false,
    badge: null as string | null,
    savings: null as string | null,
    maxImages: '5 รูป',
    allowVideo: false,
    features: [
      '1 ประกาศ',
      'รูปภาพสูงสุด 5 รูป',
      'แสดงผล 1 เดือน',
      'เผยแพร่ทันทีหลังชำระ',
      'ต่ออายุได้ทุกเดือน',
    ],
    cta: 'ลงประกาศ ฿299',
    ctaHref: '/submit/new?package=basic',
  },
  {
    name: 'Standard',
    price: '699',
    period: '/3 เดือน',
    description: 'เหมาะสำหรับเจ้าของที่ต้องการลงประกาศต่อเนื่อง 3 เดือน',
    highlight: false,
    badge: 'ยอดนิยม' as string | null,
    savings: '22%' as string | null,
    maxImages: '10 รูป',
    allowVideo: false,
    features: [
      '1 ประกาศ',
      'รูปภาพสูงสุด 10 รูป',
      'แสดงผล 3 เดือน',
      'เผยแพร่ทันทีหลังชำระ',
    ],
    cta: 'ลงประกาศ ฿699',
    ctaHref: '/submit/new?package=standard',
  },
  {
    name: 'Premium',
    price: '2,499',
    period: '/12 เดือน',
    description: 'สำหรับเจ้าของที่ต้องการประกาศตลอดทั้งปี พร้อมอัปโหลดวิดีโอ',
    highlight: true,
    badge: 'คุ้มที่สุด' as string | null,
    savings: '30%' as string | null,
    maxImages: '20 รูป + วิดีโอ',
    allowVideo: true,
    features: [
      '1 ประกาศ',
      'รูปภาพสูงสุด 20 รูป',
      'อัปโหลดวิดีโอได้',
      'แสดงผล 12 เดือน',
      'เผยแพร่ทันทีหลังชำระ',
    ],
    cta: 'ลงประกาศ ฿2,499',
    ctaHref: '/submit/new?package=premium',
  },
]

const FAQS = [
  {
    q: '1 แพ็กเกจ = 1 ประกาศ หมายความว่าอย่างไร?',
    a: 'แต่ละแพ็กเกจรองรับ 1 ประกาศ ถ้าต้องการลงหลายห้องหรือหลายทรัพย์ สามารถซื้อหลายแพ็กเกจแยกกันได้ไม่จำกัดจำนวน แต่ละประกาศนับและจัดการแยกกันในแดชบอร์ด',
  },
  {
    q: 'ชำระเงินอย่างไร?',
    a: 'ชำระผ่าน Stripe — รองรับบัตรเครดิต/เดบิตทุกธนาคาร ปลอดภัย 100% ประกาศจะเผยแพร่ทันทีอัตโนมัติหลังชำระสำเร็จ ไม่ต้องรอทีมงาน',
  },
  {
    q: 'แพ็กเกจหมดอายุแล้ว ต่ออายุหรืออัปเกรดได้ไหม?',
    a: 'ได้เลย สามารถซื้อแพ็กเกจใหม่ได้ตลอดเวลา หรืออัปเกรดจาก Basic → Standard → Premium เพื่อระยะเวลาและรูปภาพที่มากขึ้น',
  },
  {
    q: 'SpacesMate ต่างจากเว็บประกาศอสังหาทั่วไปอย่างไร?',
    a: 'SpacesMate ใช้ระบบ Fair Rotation — ประกาศจะหมุนขึ้นหน้าแรกแบบสุ่มโดยอัตโนมัติ ไม่มีระบบจ่ายเงินเพื่อขึ้นอันดับ ทุกประกาศมีโอกาสเท่าเทียมกัน',
  },
]

export default function PricingPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* Header */}
      <div className="bg-spacemate-brandDark py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">ราคาและแพ็กเกจ</h1>
          <p className="text-white/70 text-base font-light">1 แพ็กเกจ = 1 ประกาศ · เผยแพร่ทันทีหลังชำระ · ไม่มีค่าใช้จ่ายซ่อนเร้น</p>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        {/* SM299 Promo banner */}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-7 flex flex-col relative ${
                plan.highlight
                  ? 'border-spacemate-brandTeal shadow-premium-hover'
                  : 'border-spacemate-borderLight'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-spacemate-brandTeal text-white text-xs font-bold px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}
              <div className="mb-5">
                <h3 className="font-bold text-spacemate-brandDark text-lg mb-1">{plan.name}</h3>
                <p className="text-gray-400 text-xs mb-4">{plan.description}</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                    <span className="text-3xl font-bold text-spacemate-brandDark">฿{plan.price}</span>
                    <span className="text-gray-400 text-sm mb-1">{plan.period}</span>
                  </div>
                  {plan.savings && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: '#048c73', borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap', marginBottom: 2 }}>
                      ประหยัด {plan.savings}
                    </span>
                  )}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f7f9f8', borderRadius: 8, padding: '5px 10px', fontSize: 12.5, color: '#048c73', fontWeight: 600 }}>
                  <span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 300, 'FILL' 0", marginRight: 4 }}>photo_camera</span>{plan.maxImages}{plan.allowVideo && <><span style={{ margin: '0 4px' }}>·</span><span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 300, 'FILL' 0", marginRight: 2 }}>videocam</span>วิดีโอ</>}
                </div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-spacemate-brandTeal flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`block text-center py-3 px-6 rounded-xl text-sm font-semibold transition-all ${
                  plan.highlight
                    ? 'bg-spacemate-brandDark text-white hover:bg-spacemate-brandTeal'
                    : 'border border-spacemate-brandDark text-spacemate-brandDark hover:bg-spacemate-brandDark hover:text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-spacemate-brandDark text-center mb-8 tracking-tight">คำถามที่พบบ่อย</h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="border border-spacemate-borderLight rounded-xl p-5">
                <h3 className="font-semibold text-spacemate-textCharcoal text-sm mb-2">{faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
