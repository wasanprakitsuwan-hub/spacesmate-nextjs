import Link from 'next/link'

export default function ManagementCTA() {
  return (
    <section style={{ padding: '56px 24px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', background: 'radial-gradient(120% 160% at 85% 10%,#055c43,#02402e 60%)', borderRadius: 24, padding: '52px 46px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap', overflow: 'hidden', position: 'relative' }}>
        {/* Amber glow */}
        <div style={{ position: 'absolute', bottom: -90, left: -40, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(217,127,17,0.16),transparent 70%)', pointerEvents: 'none' }} />
        {/* Text */}
        <div style={{ position: 'relative', maxWidth: 580 }}>
          <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 600, margin: '0 0 12px', lineHeight: 1.25, letterSpacing: '-0.4px' }}>ให้ SpacesMate ดูแลทรัพย์สินของคุณ</h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 15.5, fontWeight: 300, margin: 0, lineHeight: 1.6 }}>ปล่อยเช่า-ขายให้เราดูแลตั้งแต่หาผู้เช่า ทำสัญญา ถึงเก็บค่าเช่า — กรอกข้อมูลสั้นๆ แล้วทีมงานติดต่อกลับ</p>
        </div>
        {/* CTA */}
        <div style={{ position: 'relative', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Link href="/contact" style={{ background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 15, padding: '13px 28px', borderRadius: 24, cursor: 'pointer', transition: 'all .2s', boxShadow: '0 8px 22px -6px rgba(217,127,17,0.6)', textDecoration: 'none' }}>
            ให้เราติดต่อกลับ →
          </Link>
        </div>
      </div>
    </section>
  )
}
