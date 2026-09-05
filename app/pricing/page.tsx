import type { Metadata } from 'next'
import { FaqLd } from '@/components/seo/JsonLd'
import BuySlotsCta from '@/components/pricing/BuySlotsCta'
import TrackOnMount from '@/components/TrackOnMount'
import { PACKAGE_IMAGE_LIMITS, PACKAGE_ALLOWS_VIDEO, pricePerMonth, savingsVsBasic } from '@/lib/packages'

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
    id: 'basic',
    name: 'Basic',
    price: '299',
    period: '/สล็อต/เดือน',
    description: 'สำหรับห้องที่ปล่อยเช่าง่าย หรือทดลองใช้งานก่อน',
    durationLabel: 'แสดงผล 1 เดือน',
    durationSub: '30 วันนับจากวันที่เผยแพร่',
    highlight: false,
    badge: null as string | null,
    maxImages: `${PACKAGE_IMAGE_LIMITS.basic} รูป`,
    allowVideo: PACKAGE_ALLOWS_VIDEO.basic,
    features: [
      '1 สล็อต = ประกาศออนไลน์ 1 รายการ',
      `รูปภาพสูงสุด ${PACKAGE_IMAGE_LIMITS.basic} รูป`,
      'แสดงผล 30 วัน',
      'สลับประกาศในสล็อตได้ตลอดอายุ',
      'ยกเลิกได้ทุกเมื่อ — ใช้ได้จนครบรอบ',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '699',
    period: '/สล็อต/3 เดือน',
    description: 'ระยะเวลาที่ห้องเช่าในกรุงเทพฯ ส่วนใหญ่หาผู้เช่าได้',
    durationLabel: 'แสดงผล 3 เดือน',
    durationSub: '90 วันนับจากวันที่เผยแพร่',
    highlight: false,
    badge: 'ยอดนิยม' as string | null,
    maxImages: `${PACKAGE_IMAGE_LIMITS.standard} รูป`,
    allowVideo: PACKAGE_ALLOWS_VIDEO.standard,
    features: [
      '1 สล็อต = ประกาศออนไลน์ 1 รายการ',
      `รูปภาพสูงสุด ${PACKAGE_IMAGE_LIMITS.standard} รูป`,
      'แสดงผล 90 วัน',
      'สลับประกาศในสล็อตได้ตลอดอายุ',
      'ยกเลิกได้ทุกเมื่อ — ใช้ได้จนครบรอบ',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '2,499',
    period: '/สล็อต/12 เดือน',
    description: 'สำหรับเจ้าของที่ปล่อยเช่าต่อเนื่อง หรือห้องราคาสูง',
    durationLabel: 'แสดงผล 12 เดือน',
    durationSub: '365 วันนับจากวันที่เผยแพร่',
    highlight: true,
    badge: 'คุ้มที่สุดต่อเดือน' as string | null,
    maxImages: `${PACKAGE_IMAGE_LIMITS.premium} รูป`,
    // Premium-only, and genuinely enforced — VideoUploadZone gates on
    // packageType === 'premium'. This flag read false until 3 Sep 2026, which
    // hid the only feature difference between Premium and the cheaper tiers.
    allowVideo: PACKAGE_ALLOWS_VIDEO.premium,
    features: [
      '1 สล็อต = ประกาศออนไลน์ 1 รายการ',
      `รูปภาพสูงสุด ${PACKAGE_IMAGE_LIMITS.premium} รูป`,
      'เพิ่มวิดีโอได้ — อัปโหลด หรือลิงก์ YouTube/Vimeo',
      'แสดงผล 365 วัน',
      'สลับประกาศในสล็อตได้ตลอดอายุ',
      'ยกเลิกได้ทุกเมื่อ — ใช้ได้จนครบรอบ',
    ],
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
    a: 'ชำระผ่าน Stripe ได้ 2 แบบ — บัตรเครดิต/เดบิตทุกธนาคาร หรือพร้อมเพย์ (สแกน QR) · บัตร: ต่ออายุอัตโนมัติทุกรอบจนกว่าจะยกเลิก ประกาศไม่หลุดกลางคัน · พร้อมเพย์: จ่ายครั้งเดียว ไม่ต่ออัตโนมัติ เมื่อครบกำหนดประกาศจะหยุดแสดงจนกว่าจะซื้อสล็อตใหม่ · สล็อตเข้าบัญชีอัตโนมัติหลังชำระสำเร็จ กรณีพร้อมเพย์ระบบจะรอธนาคารยืนยันก่อนจึงเพิ่มสล็อตให้ ปกติไม่กี่วินาที',
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
    a: 'ชำระผ่าน Stripe ได้ 2 แบบ — บัตรเครดิต/เดบิตทุกธนาคาร หรือพร้อมเพย์ (สแกน QR) · บัตร: ต่ออายุอัตโนมัติทุกรอบจนกว่าจะยกเลิก ประกาศไม่หลุดกลางคัน · พร้อมเพย์: จ่ายครั้งเดียว ไม่ต่ออัตโนมัติ เมื่อครบกำหนดประกาศจะหยุดแสดงจนกว่าจะซื้อสล็อตใหม่ · สล็อตเข้าบัญชีอัตโนมัติหลังชำระสำเร็จ กรณีพร้อมเพย์ระบบจะรอธนาคารยืนยันก่อนจึงเพิ่มสล็อตให้ ปกติไม่กี่วินาที',
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

        {/* What every package includes.
            Deliberately above the cards, not inside them: all three are true of
            every tier, so repeating them per-card would burn nine identical
            rows and bury the argument.

            These are the three places SpacesMate beats the incumbents, and each
            is checkable:
              · Contacts — RentHub shows one phone number on its free tier and
                withholds LINE/WhatsApp until ฿1,200/yr.
              · Views — RentHub caps free AND ฿1,200/yr listings at 500 views a
                month; unlimited is its ฿4,800/yr tier.
              · Position — RentHub sells Top Ads and nine paid homepage
                Highlight slots. Ours is a genuine shuffle: see
                app/api/search/route.ts.
            Do not soften these into vague benefit copy — the specificity is
            what makes them persuasive to an owner who has used those sites. */}
        <div className="max-w-4xl mx-auto mb-12 rounded-2xl border border-spacemate-borderLight bg-white p-6 shadow-premium">
          <p className="text-center text-sm font-semibold text-spacemate-brandDark mb-5">
            ทุกแพ็กเกจได้ครบเท่ากัน — ไม่มีการกั๊กฟีเจอร์
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: 'call',
                title: 'แสดงช่องทางติดต่อครบทุกช่อง',
                body: 'เบอร์โทร LINE WhatsApp อีเมล — ไม่จำกัดจำนวน ผู้เช่าติดต่อคุณได้โดยตรง',
              },
              {
                icon: 'visibility',
                title: 'ไม่จำกัดจำนวนผู้เข้าชม',
                body: 'ไม่มีเพดานรายเดือน ประกาศไม่ถูกปิดกลางคันเพราะมีคนสนใจมากเกินไป',
              },
              {
                icon: 'shuffle',
                title: 'Fair Rotation — ไม่มีการซื้อลำดับ',
                body: 'ทุกประกาศสุ่มขึ้นหน้าแรกเท่าเทียมกัน จ่ายเพิ่มก็ซื้อตำแหน่งไม่ได้',
              },
            ].map((a) => (
              <div key={a.title} className="flex gap-3 items-start">
                <span
                  className="msym flex-shrink-0 flex items-center justify-center rounded-lg"
                  style={{ width: 34, height: 34, background: '#e8f5f1', color: '#048c73', fontSize: 18, fontVariationSettings: "'wght' 400, 'FILL' 0" }}
                >
                  {a.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-spacemate-textCharcoal mb-0.5">{a.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed font-light">{a.body}</p>
                </div>
              </div>
            ))}
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
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 6 }}>
                  <span className="text-3xl font-bold text-spacemate-brandDark">฿{plan.price}</span>
                  <span className="text-gray-400 text-sm mb-1">{plan.period}</span>
                </div>

                {/* The per-month rate, derived from price ÷ term.
                    ฿2,499 next to ฿299 reads as expensive; ฿208/เดือน next to
                    ฿299/เดือน reads as the better deal, which is what it is.
                    Computed rather than written down so it cannot drift from
                    the price above it. */}
                <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: '#048c73' }}>
                  เฉลี่ย {pricePerMonth(plan.id).toLocaleString()} บาท/เดือน
                </p>

                {savingsVsBasic(plan.id) > 0 && (
                  <span style={{ display: 'inline-block', marginTop: 9, fontSize: 12, fontWeight: 700, color: '#048c73', background: '#e8f5f1', borderRadius: 20, padding: '3px 11px', whiteSpace: 'nowrap' }}>
                    ประหยัด {savingsVsBasic(plan.id)}% เทียบกับ Basic
                  </span>
                )}

                {/* Duration is the hero. It is the main thing that differs
                    between the tiers, so it gets its own block rather than
                    being the third bullet in a list. */}
                <div style={{ marginTop: 18, background: '#f7faf9', border: '1px solid #e7eceb', borderRadius: 12, padding: '13px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#02402e', lineHeight: 1.2 }}>{plan.durationLabel}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 300, marginTop: 2 }}>{plan.durationSub}</div>
                </div>

                <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f7f9f8', borderRadius: 8, padding: '5px 10px', fontSize: 12.5, color: '#048c73', fontWeight: 600 }}>
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
                pkg={plan.id}
                className={`w-full block text-center py-3 px-6 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 ${
                  plan.highlight
                    ? 'bg-spacemate-brandDark text-white hover:bg-spacemate-brandTeal'
                    : 'border border-spacemate-brandDark text-spacemate-brandDark hover:bg-spacemate-brandDark hover:text-white'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Concierge route. Not every owner will finish a listing form —
            especially the older landlords who own the older buildings, which
            are exactly the ones missing from the site. This gives them a way
            in that does not require them to do the data entry. */}
        <div
          className="max-w-4xl mx-auto mb-16 rounded-2xl p-7 flex items-center gap-6 flex-wrap"
          style={{ background: 'linear-gradient(100deg,#02402e,#048c73)' }}
        >
          <div style={{ flex: 1, minWidth: 260 }}>
            <p className="text-white font-semibold text-base mb-1">
              ไม่สะดวกกรอกเอง? ให้ทีมงานช่วยลงประกาศให้
            </p>
            <p className="text-white/85 text-sm font-light leading-relaxed m-0">
              ส่งรายละเอียดห้องและรูปภาพมาที่หน้าติดต่อ ทีมงาน SpacesMate จะจัดทำประกาศให้เรียบร้อย พร้อมเผยแพร่
            </p>
          </div>
          <a
            href="/contact"
            className="bg-white text-spacemate-brandDark font-semibold text-sm px-6 py-3 rounded-full whitespace-nowrap hover:opacity-90 transition-opacity"
          >
            ให้ทีมงานช่วยลงประกาศ →
          </a>
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
