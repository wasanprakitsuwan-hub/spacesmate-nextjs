import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ราคาและแพ็กเกจ | SpacesMate',
  description: 'แพ็กเกจลงประกาศเช่า-ขายอสังหาริมทรัพย์ เริ่มต้น ฿299/เดือน ทดลองฟรี 30 วัน',
}

const PLANS = [
  {
    name: 'Starter',
    price: '299',
    period: '/เดือน',
    description: 'สำหรับเจ้าของที่ต้องการเริ่มต้นได้เลย',
    highlight: false,
    features: [
      '1 ประกาศ',
      'รูปภาพสูงสุด 10 ภาพ',
      'แสดงผลในการค้นหา',
      'สถิติการเข้าชม',
      'รองรับการแสดงบนมือถือ',
    ],
    cta: 'เริ่มต้นฟรี 30 วัน',
    ctaHref: '/submit',
  },
  {
    name: 'Pro',
    price: '799',
    period: '/เดือน',
    description: 'สำหรับเจ้าของที่ต้องการโดดเด่น',
    highlight: true,
    badge: 'แนะนำ',
    features: [
      'สูงสุด 5 ประกาศ',
      'รูปภาพไม่จำกัด',
      'แสดงผลในการค้นหาแบบ Featured',
      'สถิติการเข้าชมแบบละเอียด',
      'แบดจ์ "Verified" บนประกาศ',
      'ส่ง LINE แจ้งเตือนผู้สนใจ',
    ],
    cta: 'เริ่มต้นฟรี 30 วัน',
    ctaHref: '/submit',
  },
  {
    name: 'Business',
    price: '1,990',
    period: '/เดือน',
    description: 'สำหรับนิติบุคคลและเอเจนซี',
    highlight: false,
    features: [
      'ประกาศไม่จำกัด',
      'รูปภาพและวิดีโอไม่จำกัด',
      'แสดงผล Priority ในทุกหน้า',
      'แดชบอร์ดรายงานผลรายเดือน',
      'ทีม Account Manager ส่วนตัว',
      'รองรับหลาย user login',
      'API สำหรับ sync ข้อมูล',
    ],
    cta: 'ติดต่อทีมงาน',
    ctaHref: '/contact',
  },
]

const FAQS = [
  {
    q: 'ทดลองฟรี 30 วัน ต้องใช้บัตรเครดิตไหม?',
    a: 'ไม่ต้อง สมัครได้เลยโดยไม่ต้องกรอกข้อมูลบัตรเครดิต หลังจาก 30 วันค่อยเลือกแพ็กเกจที่เหมาะกับคุณ',
  },
  {
    q: 'ยกเลิกได้ตลอดเวลาไหม?',
    a: 'ได้เลย ไม่มีสัญญาผูกมัด ยกเลิกได้ทุกเมื่อโดยไม่มีค่าปรับ',
  },
  {
    q: 'ถ้าต้องการลงประกาศมากกว่า 1 รายการในแพ็กเกจ Starter ทำอย่างไร?',
    a: 'สามารถอัปเกรดเป็น Pro ได้ตลอดเวลา หรือซื้อประกาศเพิ่มแบบรายชิ้นได้ในแดชบอร์ด',
  },
  {
    q: 'SpacesMate ต่างจากเว็บประกาศอสังหาทั่วไปอย่างไร?',
    a: 'SpacesMate ใช้ระบบ Fair Rotation — ประกาศที่อัปเดตล่าสุดจะหมุนขึ้นหน้าแรกแบบสุ่ม ไม่ใช่ระบบจ่ายเงินเพื่อขึ้นอันดับ ทุกประกาศมีโอกาสเท่าเทียมกัน',
  },
]

export default function PricingPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* Header */}
      <div className="bg-spacemate-brandDark py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">ราคาและแพ็กเกจ</h1>
          <p className="text-white/70 text-base font-light">เริ่มต้นได้ฟรี 30 วัน ไม่ต้องใช้บัตรเครดิต</p>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
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
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-spacemate-brandDark">฿{plan.price}</span>
                  <span className="text-gray-400 text-sm mb-1">{plan.period}</span>
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
