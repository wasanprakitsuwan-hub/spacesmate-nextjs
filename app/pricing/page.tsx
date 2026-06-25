import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ราคาและแพ็กเกจ | SpacesMate',
  description: 'ลงประกาศเช่าอสังหาริมทรัพย์ เริ่มต้น ฿299/เดือน หรือ ฿2,499/ปี — 1 ประกาศต่อแพ็กเกจ เผยแพร่ทันทีหลังชำระ',
}

const PLANS = [
  {
    name: 'Basic',
    price: '299',
    period: '/เดือน',
    description: 'สำหรับเจ้าของที่ต้องการเริ่มต้น ลองก่อนได้เลย',
    highlight: false,
    badge: null as string | null,
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
    ctaHref: '/submit/new',
  },
  {
    name: 'Premium',
    price: '2,499',
    period: '/12 เดือน',
    description: 'สำหรับเจ้าของที่ต้องการประกาศตลอดทั้งปี',
    highlight: true,
    badge: 'คุ้มที่สุด' as string | null,
    maxImages: '20 รูป + วิดีโอ',
    allowVideo: true,
    features: [
      '1 ประกาศ',
      'รูปภาพสูงสุด 20 รูป',
      'อัปโหลดวิดีโอได้',
      'แสดงผล 12 เดือน',
      'เผยแพร่ทันทีหลังชำระ',
      'ประหยัดกว่า Basic 30%',
    ],
    cta: 'ลงประกาศ ฿2,499',
    ctaHref: '/submit/new',
  },
]

const FAQS = [
  {
    q: '1 แพ็กเกจ = 1 ประกาศ หมายความว่าอย่างไร?',
    a: 'แต่ละแพ็กเกจรองรับ 1 ประกาศ ถ้าต้องการลงหลายห้องหรือหลายทรัพย์ สามารถซื้อหลายแพ็กเกจแยกกันได้ ไม่จำกัดจำนวน',
  },
  {
    q: 'ชำระเงินอย่างไร?',
    a: 'หลังกดลงประกาศ ทีมงาน SpacesMate จะติดต่อผ่าน LINE เพื่อยืนยันและแจ้งช่องทางชำระ (โอนบัญชี / PromptPay) ประกาศจะเผยแพร่ทันทีหลังยืนยันการชำระ',
  },
  {
    q: 'แพ็กเกจ Basic หมดอายุแล้ว ต่ออายุได้ไหม?',
    a: 'ได้เลย ซื้อแพ็กเกจ Basic ใหม่ได้ตลอดเวลา หรืออัปเกรดเป็น Premium เพื่อแสดงผลต่อเนื่อง 12 เดือน',
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 max-w-3xl mx-auto">
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
                <div className="flex items-end gap-1 mb-3">
                  <span className="text-3xl font-bold text-spacemate-brandDark">฿{plan.price}</span>
                  <span className="text-gray-400 text-sm mb-1">{plan.period}</span>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f7f9f8', borderRadius: 8, padding: '5px 10px', fontSize: 12.5, color: '#048c73', fontWeight: 600 }}>
                  📷 {plan.maxImages}{plan.allowVideo && ' · 🎬 วิดีโอ'}
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
