const features = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'ข้อมูลจริง อัปเดตใหม่',
    description: 'ทุกประกาศต้ออายุสูงสุด 12 เดือน เจ้าของต้องอัปเดตเพื่อต่ออายุ ข้อมูลจริงใหม่กว่าเว็บอื่น',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'ทดลองฟรี 30 วัน',
    description: 'ทดลองใช้ฟรี 30 วันสำหรับประกาศแรก ไม่ต้องใช้บัตรเครดิต ไม่มีเงื่อนไขซ่อน',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: 'ครบทุกประเภท',
    description: 'คอนโด อพาร์ทเม้นท์ บ้าน ออฟฟิศ และโคเวิร์กกิ้ง — มากกว่าเว็บทั่วไป ในที่เดียว',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    title: 'แดชบอร์ดเดียวจบ',
    description: 'แก้ไขประกาศ ดูยอดเข้าชม และเห็นผู้สนใจได้ทันที ง่าย ไม่ยุ่งยาก',
  },
]

export default function WhySpacesMate() {
  return (
    <section
      className="py-16"
      style={{
        background: 'linear-gradient(180deg, #eef5f1, #f4f9f6)',
        borderTop: '1px solid #e3ede8',
        borderBottom: '1px solid #e3ede8',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-spacemate-brandDark mb-2 tracking-tight">ทำไมต้อง SpacesMate</h2>
          <p className="text-gray-500 text-sm font-light">แพลตฟอร์มที่ออกแบบมาเพื่อความเป็นธรรมและความโปร่งใส</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.title} className="bg-white p-7 rounded-[18px] border border-[#eef0ef]">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white mb-4"
                style={{
                  background: 'linear-gradient(140deg, #06a487, #02402e)',
                  boxShadow: '0 9px 18px -8px rgba(2,64,46,0.5)',
                }}
              >
                {f.icon}
              </div>
              <h3 className="font-semibold text-spacemate-textCharcoal text-base mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-light">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
