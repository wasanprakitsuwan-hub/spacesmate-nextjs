import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'บริการของเรา | SpacesMate',
  description: 'บริการบริหารจัดการอสังหาริมทรัพย์ครบวงจร ทั้งอพาร์ทเม้นท์และคอนโด พร้อมแพลตฟอร์มลงประกาศเช่า-ขาย',
}

const SERVICES = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: 'บริหารจัดการอพาร์ทเม้นท์',
    fee: 'Profit Sharing',
    description: 'ดูแลอพาร์ทเม้นท์ที่มีศักยภาพสูงของคุณครบวงจร ตั้งแต่หาผู้เช่า ทำสัญญา เก็บค่าเช่า จัดการซ่อมแซม และออกรายงานรายเดือนให้เจ้าของ SpacesMate ได้รับส่วนแบ่งจากรายได้จริงเท่านั้น',
    features: ['หาผู้เช่าและคัดกรอง', 'จัดทำและบริหารสัญญา', 'เก็บค่าเช่ารายเดือน', 'จัดการซ่อมแซมฉุกเฉิน', 'รายงาน P&L รายเดือน', 'บริหารพนักงานประจำอาคาร'],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    title: 'บริหารจัดการคอนโด',
    fee: 'Profit Sharing',
    description: 'บริหารจัดการคอนโดยูนิตที่มีศักยภาพด้านการลงทุนครบวงจร รวมการตลาดหาผู้เช่าและดูแลตลอดสัญญา SpacesMate อยู่กับคุณทุกขั้นตอน ต่างจากเอเจนต์ที่จบงานหลังหาผู้เช่าได้',
    features: ['การตลาดเพื่อหาผู้เช่า (เทียบเท่า 1 เดือน commision)', 'บริหารสัญญาเช่า', 'เก็บค่าเช่าและค่าสาธารณูปโภค', 'ประสานงานซ่อมแซม', 'รายงานทางการเงินรายเดือน', 'ระบบ EasyRenz สำหรับความโปร่งใส'],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: 'แพลตฟอร์มลงประกาศ',
    fee: 'เริ่มต้น ฿299/เดือน',
    description: 'ลงประกาศเช่า-ขายอสังหาริมทรัพย์บน SpacesMate ด้วยระบบ Fair Rotation ที่ทำให้ทุกประกาศมีโอกาสเท่าเทียมกันในการแสดงผล',
    features: ['ทดลองฟรี 30 วัน', 'รูปภาพและวิดีโอคุณภาพสูง', 'ระบบ Fair Rotation', 'แดชบอร์ดสถิติการเข้าชม', 'รองรับทุกประเภทอสังหา', 'ค้นหาได้ทั้งภาษาไทยและอังกฤษ'],
  },
]

export default function ServicesPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* Header */}
      <div className="bg-spacemate-brandDark py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">บริการของเรา</h1>
          <p className="text-white/70 text-base font-light">SpacesMate ดูแลทรัพย์สินของคุณตั้งแต่ต้นจนจบ — Performance-aligned ทุกบาทที่คุณได้ เราได้ด้วย</p>
        </div>
      </div>

      {/* Services */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 mb-16">
          {SERVICES.map((service) => (
            <div key={service.title} className="rounded-2xl border border-spacemate-borderLight p-7 flex flex-col">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-5"
                style={{ background: 'linear-gradient(140deg, #06a487, #02402e)', boxShadow: '0 9px 18px -8px rgba(2,64,46,0.4)' }}
              >
                {service.icon}
              </div>
              <h3 className="font-bold text-spacemate-brandDark text-lg mb-1">{service.title}</h3>
              <p className="text-spacemate-brandGold text-sm font-semibold mb-3">{service.fee}</p>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{service.description}</p>
              <ul className="space-y-2 flex-1 mb-6">
                {service.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-spacemate-brandTeal flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/manage"
                className="block text-center py-3 rounded-xl border border-spacemate-brandDark text-spacemate-brandDark text-sm font-semibold hover:bg-spacemate-brandDark hover:text-white transition-all"
              >
                สอบถามบริการนี้ →
              </Link>
            </div>
          ))}
        </div>

        {/* Why asset-light */}
        <div
          className="rounded-3xl px-10 md:px-14 py-12 text-center relative overflow-hidden"
          style={{ background: 'radial-gradient(120% 160% at 85% 10%, #055c43, #02402e 60%)' }}
        >
          <div className="absolute pointer-events-none" style={{ bottom: '-80px', right: '-40px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,127,17,0.2), transparent 70%)' }} />
          <div className="relative max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">Asset-Light. Performance-Aligned.</h2>
            <p className="text-white/70 text-sm md:text-base leading-relaxed mb-7">
              SpacesMate ไม่ได้เป็นเจ้าของทรัพย์สินใด ๆ เราบริหารแทนเจ้าของและได้รับค่าตอบแทนตามผลงานจริง — ยิ่งคุณได้มาก เราได้มากด้วย
            </p>
            <Link
              href="/manage"
              className="inline-block text-white font-semibold px-8 py-3.5 rounded-full transition-all hover:brightness-110"
              style={{ background: '#d97f11', boxShadow: '0 8px 22px -6px rgba(217,127,17,0.6)' }}
            >
              ฝากบริหารทรัพย์สิน →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
