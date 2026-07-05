import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'เกี่ยวกับเรา | SpacesMate',
  description: 'SpacesMate (Space Works Co., Ltd.) — แพลตฟอร์มบริหารจัดการอสังหาริมทรัพย์ Asset-Light ในกรุงเทพฯ ดูแลแบบ Performance-Based ยิ่งเจ้าของได้มาก SpacesMate ได้มากด้วย',
  openGraph: {
    title: 'เกี่ยวกับ SpacesMate',
    description: 'แพลตฟอร์มบริหารจัดการอสังหาริมทรัพย์ Asset-Light ในกรุงเทพฯ — Performance-Based, AI-Powered',
    type: 'website',
    url: 'https://spacesmate.com/about',
  },
  alternates: { canonical: 'https://spacesmate.com/about' },
}

const TEAM = [
  { icon: 'construction', title: 'Asset-Light',        desc: 'เราไม่ได้เป็นเจ้าของทรัพย์สิน เราบริหารแทนเจ้าของและแบ่งรายได้ตามผลจริง' },
  { icon: 'bar_chart',    title: 'Performance-Aligned', desc: 'ยิ่งเจ้าของทรัพย์ได้มาก SpacesMate ได้มากด้วย ทุกบาทที่เราได้มาจากผลงานจริง' },
  { icon: 'smart_toy',   title: 'AI-Powered Ops',      desc: 'ใช้ AI ยกระดับทุกขั้นตอน ตั้งแต่การตลาด สัญญา ไปจนถึงรายงานการเงิน เพื่อให้บริการที่รวดเร็วและแม่นยำยิ่งขึ้น' },
  { icon: 'language',    title: 'Bangkok-Local',        desc: 'รู้จักตลาดกรุงเทพฯ ดี ทั้งโซน BTS/MRT และกลุ่มผู้เช่าทั้ง B2C และ B2B' },
]


export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#02402e 0%,#036b56 100%)', padding: '64px 24px 72px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#d97f11', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>เกี่ยวกับเรา</p>
          <h1 style={{ fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 700, color: '#fff', margin: '0 0 20px', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
            Smarter Spaces.<br />Better Returns.
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', fontWeight: 300, lineHeight: 1.75, maxWidth: 560, margin: '0 auto 36px' }}>
            SpacesMate คือแพลตฟอร์ม PropTech Asset-Light ที่ช่วยเจ้าของทรัพย์สินในกรุงเทพฯ
            ให้ได้ผลตอบแทนสูงขึ้น โดยไม่ต้องเหนื่อยบริหารเอง
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/manage" style={{ background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 15, padding: '13px 28px', borderRadius: 28, textDecoration: 'none' }}>
              ให้เราดูแลทรัพย์สินของคุณ
            </Link>
            <Link href="/search" style={{ color: '#fff', fontWeight: 500, fontSize: 15, padding: '13px 24px', borderRadius: 28, textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.4)' }}>
              ค้นหาที่พัก
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px' }}>

        {/* Mission */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center', marginBottom: 72 }} className="sm-2col">
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#d97f11', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 }}>พันธกิจของเรา</p>
            <h2 style={{ fontSize: 30, fontWeight: 700, color: '#02402e', margin: '0 0 16px', lineHeight: 1.25 }}>
              ทำให้อสังหาฯ ที่ไม่ได้ใช้งาน<br />กลายเป็นรายได้ที่แน่นอน
            </h2>
            <p style={{ color: '#475569', fontSize: 15.5, lineHeight: 1.8, margin: '0 0 16px', fontWeight: 300 }}>
              ทรัพย์สินหลายแห่งในกรุงเทพฯ ถูกปล่อยทิ้งว่างหรือได้ผลตอบแทนต่ำกว่าที่ควรจะเป็น
              เพราะเจ้าของไม่มีเวลาหรือไม่รู้วิธีบริหาร SpacesMate เข้ามาเติมเต็มช่องว่างนี้
            </p>
            <p style={{ color: '#475569', fontSize: 15.5, lineHeight: 1.8, margin: 0, fontWeight: 300 }}>
              เราใช้ระบบ SOP มาตรฐาน ติดตาม P&L รายอาคาร และ AI
              เพื่อให้การบริหารทรัพย์สินเป็นแบบ lean และ scalable — บริการที่ดีกว่า โดยไม่ซับซ้อน
            </p>
          </div>
          <div style={{ background: 'radial-gradient(120% 140% at 80% 10%,#055c43,#02402e 60%)', borderRadius: 24, padding: '40px 36px', color: '#fff' }}>
            <p style={{ fontSize: 13, color: '#d97f11', fontWeight: 600, margin: '0 0 20px' }}>บริษัทของเรา</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['ชื่อบริษัท (ไทย)',  'บริษัท เสปซเวิร์คส จำกัด'],
                ['ชื่อบริษัท (อังกฤษ)', 'Space Works Co., Ltd.'],
                ['เลขทะเบียน',        '0105569001611'],
                ['ก่อตั้ง',          '6 มกราคม 2568'],
                ['ที่ตั้งสำนักงาน',   'Summer Hill (unit 3026), สุขุมวิท คลองเตย กรุงเทพฯ'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', flexShrink: 0 }}>{k}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 500, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Why SpacesMate */}
        <div style={{ marginBottom: 72 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#d97f11', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, textAlign: 'center' }}>DNA ของเรา</p>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#02402e', margin: '0 0 36px', textAlign: 'center' }}>ทำไมถึงเป็น SpacesMate</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }} className="sm-2col">
            {TEAM.map(t => (
              <div key={t.title} style={{ padding: '28px 26px', background: '#fff', border: '1px solid #eef0ef', borderRadius: 20, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <span className="msym" style={{ fontSize: 36, flexShrink: 0, color: '#02402e', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{t.icon}</span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#02402e', margin: '0 0 8px' }}>{t.title}</h3>
                  <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.65, fontWeight: 300 }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two revenue streams */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 72 }} className="sm-2col">
          <div style={{ padding: '32px 28px', background: '#f7f9f8', border: '1px solid #eef0ef', borderRadius: 20 }}>
            <p style={{ margin: '0 0 14px' }}><span className="msym" style={{ fontSize: 26, color: '#02402e', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>apartment</span></p>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#02402e', margin: '0 0 10px' }}>Stream 1 — แพลตฟอร์มลงประกาศ</h3>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: '0 0 14px', fontWeight: 300 }}>
              เจ้าของทรัพย์สินลงประกาศเช่าบน spacesmate.com SpacesMate เก็บค่าสมัครสมาชิกรายเดือน
              เริ่มต้น ฿299/เดือน/ประกาศ
            </p>
            <Link href="/pricing" style={{ color: '#048c73', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>ดูแพ็กเกจ →</Link>
          </div>
          <div style={{ padding: '32px 28px', background: '#02402e', borderRadius: 20 }}>
            <p style={{ margin: '0 0 14px' }}><span className="msym" style={{ fontSize: 26, color: '#fff', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>build</span></p>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>Stream 2 — บริหารจัดการทรัพย์สิน</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: '0 0 14px', fontWeight: 300 }}>
              SpacesMate บริหารทรัพย์สินที่มีศักยภาพสูงแทนเจ้าของ ตั้งแต่หาผู้เช่า เก็บค่าเช่า จนถึงออกรายงาน
              รูปแบบ Profit Sharing — SpacesMate ได้รับส่วนแบ่งจากรายได้จริงเท่านั้น
            </p>
            <Link href="/manage" style={{ color: '#d97f11', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>ฝากบริหารทรัพย์สิน →</Link>
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'radial-gradient(120% 160% at 85% 10%,#055c43,#02402e 60%)', borderRadius: 24, padding: '52px 32px', textAlign: 'center', color: '#fff' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px' }}>พร้อมเติบโตไปด้วยกัน?</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, margin: '0 0 28px', fontWeight: 300 }}>ไม่ว่าจะเป็นเจ้าของทรัพย์สินหรือผู้เช่า SpacesMate ดูแลคุณทุกขั้นตอน</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/manage" style={{ background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 15, padding: '13px 28px', borderRadius: 28, textDecoration: 'none' }}>
              ฝากบริหารทรัพย์สิน
            </Link>
            <Link href="/contact" style={{ color: '#fff', fontWeight: 500, fontSize: 15, padding: '13px 24px', borderRadius: 28, textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.35)' }}>
              ติดต่อเรา
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sm-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
