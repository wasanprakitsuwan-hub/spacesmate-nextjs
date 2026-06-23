import Link from 'next/link'

export default function ManagementCTA() {
  return (
    <section className="py-14 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-3xl px-10 md:px-12 py-12 md:py-14 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative"
          style={{ background: 'radial-gradient(120% 160% at 85% 10%, #055c43, #02402e 60%)' }}
        >
          {/* Decorative amber circle */}
          <div
            className="absolute pointer-events-none"
            style={{
              bottom: '-90px',
              left: '-40px',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(217,127,17,0.16), transparent 70%)',
            }}
          />

          {/* Text */}
          <div className="relative flex-1 max-w-xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3 leading-snug tracking-tight">
              ให้ SpacesMate ดูแลทรัพย์สินของคุณ
            </h2>
            <p className="text-white/78 text-sm md:text-base leading-relaxed font-light">
              ปล่อยเช่า-ขายให้เราดูแลตั้งแต่หาผู้เช่า ทำสัญญา ถึงเก็บค่าเช่า
              — กรอกข้อมูลสั้นๆ แล้วทีมงานติดต่อกลับ
            </p>
          </div>

          {/* CTA */}
          <div className="relative flex-shrink-0">
            <Link
              href="/contact"
              className="inline-block text-white font-semibold text-sm md:text-base px-7 py-3.5 transition-all whitespace-nowrap hover:brightness-110"
              style={{
                background: '#d97f11',
                borderRadius: '24px',
                boxShadow: '0 8px 22px -6px rgba(217,127,17,0.6)',
              }}
            >
              ให้เราติดต่อกลับ →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
