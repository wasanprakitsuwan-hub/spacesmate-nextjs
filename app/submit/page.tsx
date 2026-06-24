import Link from 'next/link'

// ─── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  { num: '8,400+', label: 'ผู้เช่าในระบบ' },
  { num: '฿0', label: 'ค่าใช้จ่ายเริ่มต้น' },
  { num: '<24 ชม.', label: 'เผยแพร่ประกาศ' },
]

const WHY_CARDS = [
  {
    icon: '🌐',
    title: 'ฐานผู้เช่า 8,400+ คน',
    desc: 'ประกาศของคุณเข้าถึงผู้เช่าที่กำลังมองหาที่พักในกรุงเทพฯ ทันที ไม่ต้องรอ ไม่ต้องโฆษณาเพิ่ม',
  },
  {
    icon: '⚡',
    title: 'ลงประกาศได้ใน 3 ขั้นตอน',
    desc: 'กรอกข้อมูล เพิ่มรูปภาพ เผยแพร่ — ใช้เวลาแค่ 5 นาที พร้อมทีมงานช่วย verify ภายใน 24 ชั่วโมง',
  },
  {
    icon: '📊',
    title: 'Dashboard ติดตามผลได้เลย',
    desc: 'ดูสถิติการเข้าชม จำนวน leads และประสิทธิภาพประกาศของคุณแบบ real-time ตลอด 24/7',
  },
  {
    icon: '🔒',
    title: 'ปลอดภัย ไม่มีค่าคอมมิชชั่น',
    desc: 'SpacesMate ไม่คิดค่านายหน้า ราคาแบบ subscription ตายตัว โปร่งใส ไม่มีค่าใช้จ่ายซ่อนเร้น',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'สมัครสมาชิก',
    desc: 'สมัครฟรีด้วยอีเมลในไม่กี่วินาที ไม่ต้องใช้บัตรเครดิต รับสิทธิ์ทดลองใช้ฟรี 30 วันทันที',
    icon: '👤',
  },
  {
    num: '02',
    title: 'เลือกแพ็กเกจ',
    desc: 'เลือกแผนที่ตรงกับจำนวนยูนิตของคุณ ตั้งแต่ ฿299/เดือน เพิ่มลดได้ตลอดเวลา',
    icon: '📦',
  },
  {
    num: '03',
    title: 'ลงประกาศและเผยแพร่',
    desc: 'กรอกข้อมูลทรัพย์สิน อัปโหลดรูป ทีมงานตรวจสอบและเผยแพร่ภายใน 24 ชั่วโมง',
    icon: '🚀',
  },
]

const PACKAGES = [
  {
    name: 'Starter',
    nameTH: 'สตาร์ทเตอร์',
    price: '299',
    unit: 'ต่อเดือน',
    badge: null,
    listings: '1 ประกาศ',
    features: ['ลงประกาศได้ 1 ห้อง/ยูนิต','รูปภาพสูงสุด 10 รูป','แสดงในผลการค้นหา','Dashboard พื้นฐาน'],
    cta: 'เริ่มใช้งาน',
    highlight: false,
    color: '#048c73',
  },
  {
    name: 'Standard',
    nameTH: 'สแตนดาร์ด',
    price: '699',
    unit: 'ต่อเดือน',
    badge: null,
    listings: '3 ประกาศ',
    features: ['ลงประกาศได้ 3 ห้อง/ยูนิต','รูปภาพสูงสุด 20 รูปต่อยูนิต','แสดงในผลการค้นหา','Dashboard พื้นฐาน','รองรับประกาศรายวัน+รายเดือน'],
    cta: 'เริ่มใช้งาน',
    highlight: false,
    color: '#048c73',
  },
  {
    name: 'Professional',
    nameTH: 'โปรเฟสชันนัล',
    price: '1,599',
    unit: 'ต่อเดือน',
    badge: 'แนะนำ',
    listings: '10 ประกาศ',
    features: ['ลงประกาศได้ 10 ห้อง/ยูนิต','รูปภาพไม่จำกัด','Featured listing (ติดดาว)','Analytics report รายเดือน','Priority support','ประกาศรายวัน+รายเดือน'],
    cta: 'เริ่มใช้งาน',
    highlight: true,
    color: '#02402e',
  },
  {
    name: 'Enterprise',
    nameTH: 'เอนเตอร์ไพรส์',
    price: '2,999',
    unit: 'ต่อเดือน',
    badge: null,
    listings: 'ไม่จำกัด',
    features: ['ลงประกาศไม่จำกัด','รูปภาพไม่จำกัด','Featured listing ทุกยูนิต','Analytics + export CSV','Dedicated account manager','API access (coming soon)'],
    cta: 'ติดต่อเรา',
    highlight: false,
    color: '#231f20',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function SubmitLandingPage() {
  return (
    <div style={{ fontFamily: 'inherit', color: '#231f20' }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(160deg, #011f17 0%, #02402e 55%, #025e43 100%)', padding: '72px 24px 80px', position: 'relative', overflow: 'hidden' }}>

        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'rgba(4,140,115,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(217,127,17,0.08)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Tag */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(4,140,115,0.22)', border: '1px solid rgba(4,140,115,0.35)', borderRadius: 20, padding: '6px 14px', marginBottom: 22 }}>
            <span style={{ fontSize: 13, color: '#5dd9be', fontWeight: 600 }}>🏠 สำหรับเจ้าของทรัพย์สิน</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(30px,5vw,52px)', fontWeight: 700, color: '#fff', margin: '0 0 10px', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
            ลงประกาศปล่อยเช่า
          </h1>
          <h1 style={{ fontSize: 'clamp(30px,5vw,52px)', fontWeight: 700, margin: '0 0 22px', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#d97f11' }}>ฟรี</span>
            <span style={{ color: '#fff' }}> ไม่มีค่าใช้จ่าย</span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.72)', fontWeight: 300, margin: '0 0 40px', lineHeight: 1.65, maxWidth: 580 }}>
            เข้าถึงผู้เช่าคุณภาพกว่า 8,400 คนในกรุงเทพฯ ลงประกาศได้ใน 5 นาที ไม่ต้องใช้บัตรเครดิต ทดลองใช้ฟรี 30 วัน
          </p>

          {/* Stats box */}
          <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 18, overflow: 'hidden', marginBottom: 36, maxWidth: 520, backdropFilter: 'blur(8px)' }}
            className="sm-stats">
            {STATS.map((s, i) => (
              <div key={i} style={{ flex: 1, padding: '20px 24px', borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none', textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>{s.num}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 400 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 13, flexWrap: 'wrap' }}>
            <Link href="/submit/new"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#d97f11', color: '#fff', fontWeight: 700, fontSize: 15.5, borderRadius: 28, padding: '15px 32px', textDecoration: 'none', boxShadow: '0 8px 24px -6px rgba(217,127,17,0.5)', transition: 'all .2s' }}>
              เริ่มลงประกาศฟรี
              <span style={{ fontSize: 18 }}>→</span>
            </Link>
            <a href="#pricing"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: 15.5, borderRadius: 28, padding: '15px 28px', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.25)', transition: 'all .2s' }}>
              ดูราคาแพ็กเกจ
            </a>
          </div>

          {/* Trust line */}
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '22px 0 0', fontWeight: 300 }}>
            ✓ ไม่ต้องใช้บัตรเครดิต &nbsp;·&nbsp; ✓ ยกเลิกได้ทุกเมื่อ &nbsp;·&nbsp; ✓ เผยแพร่ภายใน 24 ชั่วโมง
          </p>
        </div>
      </section>

      {/* ── WHY SPACEMATE ────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#048c73', letterSpacing: '1.2px', textTransform: 'uppercase' }}>ทำไมต้อง SpacesMate</span>
            <h2 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 600, margin: '10px 0 0', color: '#02402e', letterSpacing: '-0.3px' }}>
              แพลตฟอร์มที่ออกแบบมาเพื่อเจ้าของทรัพย์สิน
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 22 }} className="sm-why-grid">
            {WHY_CARDS.map((c, i) => (
              <div key={i} style={{ background: '#f7f9f8', border: '1px solid #eef0ef', borderRadius: 20, padding: '28px 22px', transition: 'all .25s' }} className="sm-why-card">
                <div style={{ fontSize: 36, marginBottom: 14 }}>{c.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 10px', color: '#02402e', lineHeight: 1.3 }}>{c.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.65, fontWeight: 300 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3-STEP PROCESS ───────────────────────────────────────────────── */}
      <section style={{ background: '#f7f9f8', padding: '64px 24px', borderTop: '1px solid #eef0ef', borderBottom: '1px solid #eef0ef' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#048c73', letterSpacing: '1.2px', textTransform: 'uppercase' }}>วิธีการใช้งาน</span>
            <h2 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 600, margin: '10px 0 0', color: '#02402e', letterSpacing: '-0.3px' }}>
              เริ่มต้นใน 3 ขั้นตอน
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, position: 'relative' }} className="sm-steps-grid">

            {/* Connector line (desktop only) */}
            <div className="sm-connector" style={{ position: 'absolute', top: 44, left: '18%', right: '18%', height: 2, background: 'linear-gradient(90deg, #048c73, #d97f11)', borderRadius: 2, zIndex: 0 }} />

            {STEPS.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                {/* Number bubble */}
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: i === 2 ? '#d97f11' : '#02402e', color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: `0 10px 28px -8px ${i === 2 ? 'rgba(217,127,17,0.45)' : 'rgba(2,64,46,0.35)'}` }}>
                  {s.num}
                </div>
                <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: '24px 20px', boxShadow: '0 6px 20px -10px rgba(2,64,46,0.09)' }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 10px', color: '#02402e' }}>{s.title}</h3>
                  <p style={{ fontSize: 13.5, color: '#64748b', margin: 0, lineHeight: 1.65, fontWeight: 300 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link href="/submit/new"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 15, borderRadius: 28, padding: '14px 32px', textDecoration: 'none', boxShadow: '0 8px 24px -8px rgba(2,64,46,0.35)' }}>
              เริ่มลงประกาศฟรีเลย →
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ background: '#fff', padding: '72px 24px 80px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#048c73', letterSpacing: '1.2px', textTransform: 'uppercase' }}>ราคาและแพ็กเกจ</span>
            <h2 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 600, margin: '10px 0 10px', color: '#02402e', letterSpacing: '-0.3px' }}>
              เลือกแผนที่เหมาะกับคุณ
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', margin: 0, fontWeight: 300 }}>ทดลองใช้ฟรี 30 วัน · ยกเลิกได้ทุกเมื่อ · ไม่มีค่าคอมมิชชั่น</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }} className="sm-pricing-grid">
            {PACKAGES.map((pkg, i) => (
              <div key={i} className="sm-pkg-card"
                style={{
                  border: pkg.highlight ? `2px solid #d97f11` : '1px solid #eef0ef',
                  borderRadius: 22,
                  padding: '30px 24px 28px',
                  background: pkg.highlight ? 'linear-gradient(160deg,#011f17,#02402e)' : '#fff',
                  position: 'relative',
                  boxShadow: pkg.highlight ? '0 20px 50px -12px rgba(2,64,46,0.3)' : '0 4px 16px -8px rgba(2,64,46,0.08)',
                  transition: 'all .25s',
                  display: 'flex',
                  flexDirection: 'column',
                }}>

                {/* Recommended badge */}
                {pkg.badge && (
                  <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: '#d97f11', color: '#fff', fontSize: 11.5, fontWeight: 700, padding: '5px 16px', borderRadius: 20, whiteSpace: 'nowrap', boxShadow: '0 4px 12px -4px rgba(217,127,17,0.5)' }}>
                    ⭐ {pkg.badge}
                  </div>
                )}

                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: pkg.highlight ? 'rgba(255,255,255,0.5)' : '#94a3b8', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{pkg.name}</p>
                  <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px', color: pkg.highlight ? '#fff' : '#02402e' }}>{pkg.nameTH}</h3>

                  {/* Price */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: 13, color: pkg.highlight ? 'rgba(255,255,255,0.6)' : '#94a3b8', fontWeight: 400 }}>฿</span>
                      <span style={{ fontSize: 34, fontWeight: 700, color: pkg.highlight ? '#fff' : '#231f20', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{pkg.price}</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: pkg.highlight ? 'rgba(255,255,255,0.45)' : '#94a3b8', margin: '4px 0 0', fontWeight: 300 }}>{pkg.unit}</p>
                  </div>

                  {/* Listings pill */}
                  <div style={{ display: 'inline-block', background: pkg.highlight ? 'rgba(255,255,255,0.12)' : '#eaf6f1', border: `1px solid ${pkg.highlight ? 'rgba(255,255,255,0.15)' : '#c3e8de'}`, borderRadius: 8, padding: '5px 12px', fontSize: 12.5, fontWeight: 600, color: pkg.highlight ? '#7ef5d8' : '#048c73', marginBottom: 22 }}>
                    {pkg.listings}
                  </div>

                  {/* Feature list */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {pkg.features.map((f, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13.5, color: pkg.highlight ? 'rgba(255,255,255,0.8)' : '#475569', lineHeight: 1.45, fontWeight: 300 }}>
                        <span style={{ flexShrink: 0, color: pkg.highlight ? '#5dd9be' : '#048c73', fontSize: 15, marginTop: 1 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div style={{ marginTop: 'auto' }}>
                  <Link href={pkg.name === 'Enterprise' ? 'https://line.me/R/ti/p/@spacesmate' : '/submit/new'}
                    style={{
                      display: 'block', textAlign: 'center', fontWeight: 700, fontSize: 14.5, borderRadius: 24, padding: '13px 0', textDecoration: 'none', transition: 'all .2s',
                      background: pkg.highlight ? '#d97f11' : '#eaf6f1',
                      color: pkg.highlight ? '#fff' : '#02402e',
                      border: pkg.highlight ? 'none' : '1px solid #c3e8de',
                      boxShadow: pkg.highlight ? '0 6px 20px -6px rgba(217,127,17,0.5)' : 'none',
                    }}>
                    {pkg.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Footnote */}
          <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', marginTop: 28, fontWeight: 300 }}>
            ราคาทั้งหมดยังไม่รวม VAT 7% · สามารถเปลี่ยนแพ็กเกจได้ตลอดเวลา
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg,#02402e 0%,#048c73 100%)', padding: '72px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 700, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.4px', lineHeight: 1.2 }}>
            พร้อมปล่อยเช่าแล้วหรือยัง?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.72)', margin: '0 0 36px', fontWeight: 300, lineHeight: 1.65 }}>
            เข้าร่วมกับเจ้าของทรัพย์สินกว่า 500 รายที่ใช้ SpacesMate ปล่อยเช่าได้เร็วขึ้น
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/submit/new"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#d97f11', color: '#fff', fontWeight: 700, fontSize: 16, borderRadius: 30, padding: '16px 36px', textDecoration: 'none', boxShadow: '0 10px 30px -8px rgba(217,127,17,0.55)', transition: 'all .2s' }}>
              เริ่มลงประกาศฟรี →
            </Link>
            <a href="https://line.me/R/ti/p/@spacesmate" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 600, fontSize: 15.5, borderRadius: 30, padding: '16px 28px', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.25)', transition: 'all .2s' }}>
              💬 ติดต่อผ่าน LINE@
            </a>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '22px 0 0', fontWeight: 300 }}>
            ✓ ฟรี 30 วันแรก &nbsp;·&nbsp; ✓ ไม่ต้องใช้บัตรเครดิต &nbsp;·&nbsp; ✓ ยกเลิกได้ทุกเมื่อ
          </p>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .sm-why-grid { grid-template-columns: repeat(2,1fr) !important; }
          .sm-pricing-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 680px) {
          .sm-why-grid { grid-template-columns: 1fr !important; }
          .sm-steps-grid { grid-template-columns: 1fr !important; }
          .sm-pricing-grid { grid-template-columns: 1fr !important; }
          .sm-connector { display: none !important; }
          .sm-stats { flex-direction: column !important; }
        }
        .sm-why-card:hover {
          background: #eaf6f1 !important;
          border-color: #c3e8de !important;
          transform: translateY(-4px);
          box-shadow: 0 12px 30px -10px rgba(2,64,46,0.15);
        }
        .sm-pkg-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 48px -12px rgba(2,64,46,0.18) !important;
        }
      `}</style>
    </div>
  )
}
