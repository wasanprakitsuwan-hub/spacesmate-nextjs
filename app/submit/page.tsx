import Link from 'next/link'

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { num: '8,400+',   label: 'ผู้เช่าที่ยืนยันตัวตนแล้ว' },
  { num: '0 บาท',   label: 'ค่าลงประกาศเริ่มต้น' },
  { num: '< 24 ชม.', label: 'ตรวจสอบและเผยแพร่ประกาศ' },
]

const WHY = [
  { icon: 'groups',          title: 'เข้าถึงผู้เช่าจริง',   desc: 'ประกาศของคุณแสดงต่อผู้เช่าที่ผ่านการยืนยันหลายพันคน' },
  { icon: 'manage_accounts', title: 'ผู้เช่าที่ยืนยันแล้ว', desc: 'ลดความเสี่ยงด้วยระบบยืนยันตัวตน ผู้เช่าก่อนติดต่อ' },
  { icon: 'paid',            title: 'เริ่มต้นฟรี',          desc: 'ลงประกาศแรกได้ฟรี ไม่ต้องใช้บัตรเครดิต' },
  { icon: 'grid_view',       title: 'จัดการง่าย',           desc: 'ดูยอดเข้าชมและผู้สนใจได้จากแดชบอร์ดเดียว' },
]

const STEPS = [
  { num: '1', title: 'สมัครสมาชิก',         desc: 'สร้างบัญชีผู้ลงประกาศฟรีในไม่กี่นาที' },
  { num: '2', title: 'เลือกแพ็กเกจ',        desc: 'เริ่มฟรี หรืออัปเกรดเพื่อฟีเจอร์เพิ่มเติม' },
  { num: '3', title: 'ลงประกาศและเผยแพร่',  desc: 'กรอกข้อมูล อัปโหลดรูป แล้วเผยแพร่ได้ทันที' },
]

const PACKAGES = [
  {
    period: '1 เดือน',
    price: '299',
    sub: 'ต่อเดือน',
    badge: null,
    highlight: false,
    features: [
      'ลงประกาศได้ 5 รายการ',
      'รูปได้ 10 รูป/ประกาศ',
      'แสดงผล 1 เดือน',
      'สถิติการเข้าชม',
    ],
  },
  {
    period: '3 เดือน',
    price: '699',
    sub: 'เฉลี่ย 233 บาท/เดือน',
    badge: null,
    highlight: false,
    features: [
      'ลงประกาศได้ 10 รายการ',
      'รูปได้ 15 รูป/ประกาศ',
      'แสดงผล 3 เดือน',
      'สถิติการเข้าชม',
    ],
  },
  {
    period: '6 เดือน',
    price: '1,599',
    sub: 'เฉลี่ย 267 บาท/เดือน',
    badge: 'แนะนำ',
    highlight: true,
    features: [
      'ลงประกาศได้ 20 รายการ',
      'รูปได้ 20 รูป/ประกาศ',
      'ติดป้าย "แนะนำ"',
      'แสดงผล 6 เดือน',
    ],
  },
  {
    period: '12 เดือน',
    price: '2,999',
    sub: 'เฉลี่ย 250 บาท/เดือน · คุ้มสุด',
    badge: null,
    highlight: false,
    features: [
      'ลงประกาศไม่จำกัด',
      'รูปได้ 30 รูป/ประกาศ',
      'แสดงบนสุดของผลค้นหา',
      'ผู้ช่วยส่วนตัว',
    ],
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubmitPage() {
  return (
    <div style={{ fontFamily: 'inherit', color: '#231f20' }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ background: '#02402e', padding: '56px 24px 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, alignItems: 'center' }} className="sm-hero-grid">

          {/* Left — Text */}
          <div>
            <p style={{ fontSize: 13.5, color: '#d97f11', fontWeight: 600, margin: '0 0 14px' }}>
              สำหรับเจ้าของทรัพย์สิน
            </p>
            <h1 style={{ margin: '0 0 6px', lineHeight: 1.15, letterSpacing: '-0.4px' }}>
              <span style={{ fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 700, color: '#fff', display: 'block' }}>
                ลงประกาศปล่อยเช่า
              </span>
              <span style={{ fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 700, color: '#d97f11', display: 'block' }}>
                ฟรี ไม่มีค่าใช้จ่าย
              </span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15.5, fontWeight: 300, lineHeight: 1.7, margin: '20px 0 32px', maxWidth: 480 }}>
              ปล่อยเช่าทรัพย์สินของคุณให้เข้าถึงผู้เช่าที่ผ่านการยืนยันหลายพันคน สร้างประกาศเองง่ายๆ ใน 3 ขั้นตอน เริ่มฟรี 30 วันแรก
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/submit/new"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 15.5, borderRadius: 28, padding: '14px 28px', textDecoration: 'none' }}>
                เริ่มลงประกาศฟรี →
              </Link>
              <Link href="/manage"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: '#fff', fontWeight: 600, fontSize: 15.5, borderRadius: 28, padding: '14px 24px', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.5)' }}>
                อยากให้เราดูแลให้
              </Link>
            </div>
          </div>

          {/* Right — Stats box */}
          <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '28px 30px', backdropFilter: 'blur(8px)' }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: i > 0 ? '20px 0 0' : '0 0 20px', borderBottom: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none', marginBottom: i < STATS.length - 1 ? 20 : 0 }}>
                <span style={{ fontSize: 'clamp(24px,3vw,32px)', fontWeight: 700, color: '#d97f11', minWidth: 100, lineHeight: 1.1 }}>{s.num}</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 300, lineHeight: 1.45 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY SECTION ──────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 600, margin: '0 0 8px', textAlign: 'center', color: '#111827' }}>
            ลงประกาศกับ SpacesMate ดียังไง
          </h2>
          <p style={{ color: '#6b7280', fontSize: 15, margin: '0 0 40px', textAlign: 'center', fontWeight: 300 }}>
            แพลตฟอร์มที่ช่วยให้คุณปล่อยเช่าได้เร็วและปลอดภัย
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }} className="sm-why4">
            {WHY.map(w => (
              <div key={w.icon} style={{ background: '#fff', border: '1px solid #e5eae8', borderRadius: 16, padding: '28px 22px' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#048c73', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <span className="msym" style={{ fontSize: 26, color: '#fff' }}>{w.icon}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px', color: '#111827' }}>{w.title}</h3>
                <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, margin: 0, fontWeight: 300 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 STEPS ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '16px 24px 64px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 600, margin: '0 0 36px', textAlign: 'center', color: '#111827' }}>
            ลงประกาศง่ายๆ 3 ขั้นตอน
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }} className="sm-steps3">
            {STEPS.map(s => (
              <div key={s.num} style={{ background: '#fff', border: '1px solid #e5eae8', borderRadius: 18, padding: '36px 28px', textAlign: 'center' }}>
                {/* Teal circle number */}
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#048c73', color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  {s.num}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 10px', color: '#111827' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', margin: 0, fontWeight: 300, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#e8f4ef', padding: '64px 24px 72px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 600, margin: '0 0 8px', textAlign: 'center', color: '#111827' }}>
            แพ็กเกจราคา
          </h2>
          <p style={{ color: '#6b7280', fontSize: 15, margin: '0 0 16px', textAlign: 'center', fontWeight: 300 }}>
            ทดลองใช้ฟรี 30 วันสำหรับประกาศแรก — ไม่ต้องใช้บัตรเครดิต
          </p>
          {/* Green promo note */}
          <p style={{ textAlign: 'center', fontSize: 14, color: '#02402e', fontWeight: 500, margin: '0 0 36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ color: '#d97f11' }}>✅</span>
            แพ็กเกจสูงสุด 12 เดือน เพื่อให้ประกาศได้รับการอัปเดตเสมอ — ข้อมูลแม่นกว่าเว็บอื่น
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }} className="sm-pkg4">
            {PACKAGES.map((pkg) => (
              <div key={pkg.period} style={{ position: 'relative', background: '#fff', border: `2px solid ${pkg.highlight ? '#d97f11' : '#e5eae8'}`, borderRadius: 18, padding: '28px 22px', display: 'flex', flexDirection: 'column' }}>

                {/* แนะนำ badge */}
                {pkg.badge && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#d97f11', color: '#fff', fontSize: 12.5, fontWeight: 700, padding: '5px 18px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                    {pkg.badge}
                  </div>
                )}

                {/* Period */}
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 10px', color: '#374151' }}>{pkg.period}</h3>

                {/* Price */}
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 38, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{pkg.price}</span>
                  <span style={{ fontSize: 16, fontWeight: 500, color: '#111827', marginLeft: 4 }}>บาท</span>
                </div>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 22px', fontWeight: 300 }}>{pkg.sub}</p>

                {/* Features */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {pkg.features.map((f, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: '#374151', lineHeight: 1.45, fontWeight: 300 }}>
                      <span style={{ color: '#048c73', fontWeight: 600, flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href="/submit/new"
                  style={{
                    display: 'block', textAlign: 'center', fontWeight: 600, fontSize: 15,
                    borderRadius: 28, padding: '13px 0', textDecoration: 'none', transition: 'all .2s',
                    background: pkg.highlight ? '#d97f11' : '#fff',
                    color: pkg.highlight ? '#fff' : '#374151',
                    border: `1.5px solid ${pkg.highlight ? '#d97f11' : '#d1d5db'}`,
                  }}>
                  เลือกแพ็กเกจนี้
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '48px 24px 72px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(135deg,#02402e 0%,#036b56 100%)', borderRadius: 24, padding: '56px 24px', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 700, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.3px' }}>
              พร้อมปล่อยเช่าแล้วหรือยัง?
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', margin: '0 0 32px', fontWeight: 300 }}>
              เริ่มลงประกาศแรกของคุณวันนี้ ฟรี 30 วัน
            </p>
            <Link href="/submit/new"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 16, borderRadius: 30, padding: '15px 36px', textDecoration: 'none' }}>
              เริ่มลงประกาศฟรี →
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 960px) {
          .sm-hero-grid { grid-template-columns: 1fr !important; }
          .sm-why4 { grid-template-columns: repeat(2,1fr) !important; }
          .sm-pkg4 { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 600px) {
          .sm-hero-grid { gap: 32px !important; }
          .sm-why4 { grid-template-columns: 1fr !important; }
          .sm-steps3 { grid-template-columns: 1fr !important; }
          .sm-pkg4 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
