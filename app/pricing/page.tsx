import type { Metadata } from 'next'
import { FaqLd } from '@/components/seo/JsonLd'
import BuySlotsCta from '@/components/pricing/BuySlotsCta'
import TrackOnMount from '@/components/TrackOnMount'

export const metadata: Metadata = {
  title: 'ราคาและแพ็กเกจ | SpacesMate',
  description: 'ลงประกาศเช่าอสังหาริมทรัพย์ เริ่มต้น ฿299/สล็อต/เดือน — 1 สล็อต = ประกาศออนไลน์ 1 รายการ ซื้อหลายสล็อตพร้อมกันได้ ยกเลิกได้ทุกเมื่อ ไม่มีค่าคอมมิชชัน',
  openGraph: {
    title: 'ราคาลงประกาศ | SpacesMate — เริ่มต้น ฿299/เดือน',
    description: 'เลือก Basic, Standard หรือ Premium — 1 สล็อต = ประกาศออนไลน์ 1 รายการ เผยแพร่ทันที ไม่มีค่าคอมมิชชันซ่อน',
    type: 'website',
    url: 'https://spacesmate.com/pricing',
  },
  alternates: { canonical: 'https://spacesmate.com/pricing' },
}

const PLANS = [
  {
    name: 'Basic',
    price: '299',
    period: '/สล็อต/เดือน',
    description: 'เริ่มต้นด้วย 1 สล็อต — เผยแพร่ประกาศได้ 1 รายการ',
    highlight: false,
    badge: null as string | null,
    savings: null as string | null,
    maxImages: '20 รูป',
    allowVideo: false,
    features: [
      '1 สล็อต = ประกาศออนไลน์ 1 รายการ',
      'รูปภาพสูงสุด 20 รูป',
      'แสดงผล 30 วัน',
      'สลับประกาศในสล็อตได้ตลอดอายุ',
      'ยกเลิกได้ทุกเมื่อ — ใช้ได้จนครบรอบ',
    ],
    cta: 'ซื้อสล็อต ฿299',
    ctaHref: '/submit/new?package=basic',
  },
  {
    name: 'Standard',
    price: '699',
    period: '/สล็อต/3 เดือน',
    description: 'ลงประกาศต่อเนื่อง 3 เดือน ซื้อหลายสล็อตพร้อมกันได้',
    highlight: false,
    badge: 'ยอดนิยม' as string | null,
    savings: '22%' as string | null,
    maxImages: '20 รูป',
    allowVideo: false,
    features: [
      '1 สล็อต = ประกาศออนไลน์ 1 รายการ',
      'รูปภาพสูงสุด 20 รูป',
      'แสดงผล 90 วัน',
      'สลับประกาศในสล็อตได้ตลอดอายุ',
      'ยกเลิกได้ทุกเมื่อ — ใช้ได้จนครบรอบ',
    ],
    cta: 'ซื้อสล็อต ฿699',
    ctaHref: '/submit/new?package=standard',
  },
  {
    name: 'Premium',
    price: '2,499',
    period: '/สล็อต/12 เดือน',
    description: 'ประกาศตลอดทั้งปี ต่อสล็อต — คุ้มที่สุดสำหรับเจ้าของหลายห้อง',
    highlight: true,
    badge: 'คุ้มที่สุด' as string | null,
    savings: '30%' as string | null,
    maxImages: '20 รูป',
    allowVideo: false,
    features: [
      '1 สล็อต = ประกาศออนไลน์ 1 รายการ',
      'รูปภาพสูงสุด 20 รูป',
      'แสดงผล 365 วัน',
      'สลับประกาศในสล็อตได้ตลอดอายุ',
      'ยกเลิกได้ทุกเมื่อ — ใช้ได้จนครบรอบ',
    ],
    cta: 'ซื้อสล็อต ฿2,499',
    ctaHref: '/submit/new?package=premium',
  },
]

const FAQS = [
  {
    q: 'สล็อตคืออะไร? ต่างจากประกาศอย่างไร?',
    a: 'ประกาศคือข้อมูลห้องที่คุณกรอกไว้ — เก็บอยู่ในบัญชีของคุณตลอด ไม่มีวันหาย ส่วนสล็อตคือสิทธิ์ในการนำประกาศขึ้นแสดงบนเว็บไซต์ 1 รายการ ตามระยะเวลาที่ซื้อ พูดง่าย ๆ คือ 1 สล็อต = ประกาศออนไลน์ 1 รายการ',
  },
  {
    q: 'ต้องเลือกประกาศตอนซื้อไหม?',
    a: 'ไม่ต้อง ซื้อสล็อตได้เลยโดยยังไม่ต้องมีประกาศ แล้วค่อยเลือกทีหลังในแดชบอร์ดว่าจะเผยแพร่ประกาศไหน หรือจะกรอกประกาศเก็บเป็นฉบับร่างไว้ก่อนแล้วค่อยซื้อสล็อตก็ได้เช่นกัน',
  },
  {
    q: 'มีหลายห้อง ต้องซื้อทีละครั้งไหม?',
    a: 'ไม่ต้อง เลือกจำนวนสล็อตที่ต้องการในหน้าชำระเงินได้เลย เช่น อพาร์ตเมนต์ 8 ห้อง ซื้อ 8 สล็อตในครั้งเดียว จ่ายรอบเดียว จัดการรวมกันในแดชบอร์ด',
  },
  {
    q: 'ห้องปล่อยเช่าได้แล้ว ทำอย่างไรกับสล็อต?',
    a: 'นำประกาศลงจากแดชบอร์ด สล็อตจะว่างทันทีพร้อมจำนวนวันที่เหลือ แล้วนำประกาศห้องอื่นขึ้นแทนได้เลย ไม่เสียวันที่ชำระไปแล้ว',
  },
  {
    q: 'สล็อตหมดอายุแล้วประกาศหายไหม?',
    a: 'ไม่หาย ประกาศยังอยู่ครบทุกรายละเอียด รูปภาพ และราคาในแดชบอร์ดของคุณ เพียงแต่ไม่แสดงบนเว็บไซต์ เมื่อซื้อสล็อตใหม่ กดเผยแพร่ได้ทันที ไม่ต้องกรอกใหม่',
  },
  {
    q: 'ยกเลิกได้ไหม?',
    a: 'ยกเลิกได้ทุกเมื่อจากแดชบอร์ด ไม่มีสัญญาผูกมัด เมื่อยกเลิกแล้วสล็อตยังใช้งานได้จนครบรอบที่ชำระเงินไว้ และจะไม่มีการเรียกเก็บเงินรอบถัดไป',
  },
  {
    q: 'ชำระเงินอย่างไร?',
    a: 'ชำระผ่าน Stripe รองรับบัตรเครดิตและเดบิตทุกธนาคาร สล็อตจะเข้าบัญชีทันทีอัตโนมัติหลังชำระสำเร็จ ไม่ต้องรอทีมงานตรวจสอบ',
  },
  {
    q: 'SpacesMate ต่างจากเว็บประกาศอสังหาทั่วไปอย่างไร?',
    a: 'SpacesMate ใช้ระบบ Fair Rotation — ประกาศจะหมุนขึ้นหน้าแรกแบบสุ่มโดยอัตโนมัติ ไม่มีระบบจ่ายเงินเพื่อขึ้นอันดับ ทุกประกาศมีโอกาสเท่าเทียมกัน',
  },
]


// Must mirror the FAQ rendered below. Schema that doesn't match visible content
// is a guidelines violation, not a shortcut.
const PRICING_FAQ = [
  {
    q: 'สล็อตคืออะไร? ต่างจากประกาศอย่างไร?',
    a: 'ประกาศคือข้อมูลห้องที่คุณกรอกไว้ — เก็บอยู่ในบัญชีของคุณตลอด ไม่มีวันหาย ส่วนสล็อตคือสิทธิ์ในการนำประกาศขึ้นแสดงบนเว็บไซต์ 1 รายการ ตามระยะเวลาที่ซื้อ พูดง่าย ๆ คือ 1 สล็อต = ประกาศออนไลน์ 1 รายการ',
  },
  {
    q: 'ต้องเลือกประกาศตอนซื้อไหม?',
    a: 'ไม่ต้อง ซื้อสล็อตได้เลยโดยยังไม่ต้องมีประกาศ แล้วค่อยเลือกทีหลังในแดชบอร์ดว่าจะเผยแพร่ประกาศไหน หรือจะกรอกประกาศเก็บเป็นฉบับร่างไว้ก่อนแล้วค่อยซื้อสล็อตก็ได้เช่นกัน',
  },
  {
    q: 'มีหลายห้อง ต้องซื้อทีละครั้งไหม?',
    a: 'ไม่ต้อง เลือกจำนวนสล็อตที่ต้องการในหน้าชำระเงินได้เลย เช่น อพาร์ตเมนต์ 8 ห้อง ซื้อ 8 สล็อตในครั้งเดียว จ่ายรอบเดียว จัดการรวมกันในแดชบอร์ด',
  },
  {
    q: 'ห้องปล่อยเช่าได้แล้ว ทำอย่างไรกับสล็อต?',
    a: 'นำประกาศลงจากแดชบอร์ด สล็อตจะว่างทันทีพร้อมจำนวนวันที่เหลือ แล้วนำประกาศห้องอื่นขึ้นแทนได้เลย ไม่เสียวันที่ชำระไปแล้ว',
  },
  {
    q: 'สล็อตหมดอายุแล้วประกาศหายไหม?',
    a: 'ไม่หาย ประกาศยังอยู่ครบทุกรายละเอียด รูปภาพ และราคาในแดชบอร์ดของคุณ เพียงแต่ไม่แสดงบนเว็บไซต์ เมื่อซื้อสล็อตใหม่ กดเผยแพร่ได้ทันที ไม่ต้องกรอกใหม่',
  },
  {
    q: 'ยกเลิกได้ไหม?',
    a: 'ยกเลิกได้ทุกเมื่อจากแดชบอร์ด ไม่มีสัญญาผูกมัด เมื่อยกเลิกแล้วสล็อตยังใช้งานได้จนครบรอบที่ชำระเงินไว้ และจะไม่มีการเรียกเก็บเงินรอบถัดไป',
  },
  {
    q: 'ชำระเงินอย่างไร?',
    a: 'ชำระผ่าน Stripe รองรับบัตรเครดิตและเดบิตทุกธนาคาร สล็อตจะเข้าบัญชีทันทีอัตโนมัติหลังชำระสำเร็จ ไม่ต้องรอทีมงานตรวจสอบ',
  },
  {
    q: 'SpacesMate ต่างจากเว็บประกาศอสังหาทั่วไปอย่างไร?',
    a: 'SpacesMate ใช้ระบบ Fair Rotation — ประกาศจะหมุนขึ้นหน้าแรกแบบสุ่มโดยอัตโนมัติ ไม่มีระบบจ่ายเงินเพื่อขึ้นอันดับ ทุกประกาศมีโอกาสเท่าเทียมกัน',
  },
]

export default function PricingPage() {
  return (
    <>
      {/* Denominator for the funnel: how many reach pricing at all. */}
      <TrackOnMount eventName="pricing_view" />
      <FaqLd qa={PRICING_FAQ} />
    <div className="bg-white min-h-screen">

      {/* Header */}
      <div className="bg-spacemate-brandDark py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">ราคาและแพ็กเกจ</h1>
          <p className="text-white/70 text-base font-light">1 สล็อต = ประกาศออนไลน์ 1 รายการ · สลับประกาศได้ตลอดอายุ · ยกเลิกได้ทุกเมื่อ</p>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        {/* Promo banner — the code here must match a live Stripe promotion code.
            The original SM299 was deleted on 28 Jul 2026: it was ฿299 off
            FOREVER rather than once, so a Basic subscriber would have been free
            permanently. Recreated the same day as ฿299 off ONCE, restricted to
            first-time orders.
            A fixed amount, not a percentage, deliberately: 100%-off would give
            away a whole year on Premium and every slot in a multi-slot purchase.
            This caps the give-away at ฿299 per customer regardless of package
            or quantity. */}
        <div style={{ maxWidth: 860, margin: '0 auto 32px', padding: '14px 22px', background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: '1.5px solid #fde68a', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="msym" style={{ fontSize: 26, color: '#d97f11', fontVariationSettings: "'wght' 400, 'FILL' 1", flexShrink: 0 }}>sell</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#92400e' }}>ลงประกาศฟรีเดือนแรก!</p>
            <p style={{ margin: '3px 0 0', fontSize: 13.5, color: '#78350f' }}>
              ใช้โค้ด{' '}
              <strong style={{ letterSpacing: 2, color: '#02402e', background: '#fff', padding: '2px 10px', borderRadius: 7, fontSize: 14, border: '1px solid #d97f11', fontFamily: 'monospace' }}>SM299</strong>
              {' '}ขั้นตอนสุดท้าย — ลด ฿299 สำหรับการซื้อครั้งแรก (สล็อตแรกฟรีสำหรับ Basic)
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

              {/* Sells slots, not listings — see components/pricing/BuySlotsCta */}
              <BuySlotsCta
                pkg={plan.ctaHref.split('package=')[1] ?? 'basic'}
                label={plan.cta}
                className={`w-full block text-center py-3 px-6 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 ${
                  plan.highlight
                    ? 'bg-spacemate-brandDark text-white hover:bg-spacemate-brandTeal'
                    : 'border border-spacemate-brandDark text-spacemate-brandDark hover:bg-spacemate-brandDark hover:text-white'
                }`}
              />
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
    </>
  )
}
