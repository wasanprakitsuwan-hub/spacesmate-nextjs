'use client'

import { useState } from 'react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const WHY = [
  {
    icon: 'schedule',
    title: 'ประหยัดเวลา',
    desc: 'ไม่ต้องรับสายผู้เช่า นัดห้อง หรือตามเก็บค่าเช่าเอง',
  },
  {
    icon: 'verified_user',
    title: 'ผู้เช่าคุณภาพ',
    desc: 'เราคัดกรองและตรวจสอบประวัติผู้เช่าก่อนทุกครั้ง',
  },
  {
    icon: 'savings',
    title: 'รายได้สม่ำเสมอ',
    desc: 'โอนค่าเช่าตรงเวลา พร้อมรายงานผลทุกเดือน',
  },
  {
    icon: 'handyman',
    title: 'ดูแลครบวงจร',
    desc: 'ประสานงานซ่อมบำรุงและดูแลทรัพย์สินตลอดสัญญา',
  },
]

const SERVICES = [
  { icon: 'campaign',     title: 'การตลาด & ลงประกาศ', desc: 'ถ่ายภาพ เขียนประกาศ และโปรโมทบนทุกช่องทาง' },
  { icon: 'fact_check',   title: 'คัดกรองผู้เช่า',      desc: 'ตรวจสอบประวัติและความสามารถในการชำระ' },
  { icon: 'description',  title: 'จัดทำสัญญา',          desc: 'ทำสัญญาเช่าที่รัดกุมและถูกต้องตามกฎหมาย' },
  { icon: 'payments',     title: 'เก็บค่าเช่า',         desc: 'เรียกเก็บและโอนเข้าบัญชีคุณตรงเวลาทุกเดือน' },
  { icon: 'construction', title: 'ซ่อมบำรุง',           desc: 'ประสานงานช่างและดูแลทรัพย์สินตลอดสัญญา' },
  { icon: 'bar_chart',    title: 'รายงานผล',            desc: 'สรุปรายได้และสถานะทรัพย์สินให้ทุกเดือน' },
]

const STEPS = [
  { n: '1', title: 'กรอกฟอร์ม',               desc: 'บอกประเภทและรายละเอียดทรัพย์สินของคุณ ใช้เวลาไม่ถึง 2 นาที' },
  { n: '2', title: 'ทีมงานติดต่อกลับ',        desc: 'เจ้าหน้าที่โทรกลับภายใน 24 ชม. เพื่อสอบถามรายละเอียด' },
  { n: '3', title: 'ตรวจสอบ & ประเมินทรัพย์', desc: 'เราเข้าดูทรัพย์สิน ตรวจสอบเอกสาร และประเมินค่าเช่าที่เหมาะสม' },
  { n: '4', title: 'เซ็นสัญญาบริหาร',         desc: 'ตกลงเงื่อนไขที่โปร่งใส แล้วเราเริ่มหาผู้เช่าและคัดกรองให้' },
  { n: '5', title: 'รับรายได้สบายใจ',         desc: 'เราดูแลเก็บค่าเช่า ซ่อมบำรุง และรายงานผลให้คุณทุกเดือน' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ManagePage() {
  const [sent, setSent] = useState(false)
  const [channel, setChannel] = useState<'โทร' | 'LINE' | 'อีเมล'>('โทร')

  return (
    <div>

      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#02402e', padding: '52px 24px 56px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', maxWidth: 640 } as React.CSSProperties}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#d97f11', margin: '0 0 14px' }}>
            บริการรับฝากบริหาร
          </p>
          <h1 style={{ fontSize: 'clamp(28px,3.8vw,42px)', fontWeight: 700, color: '#fff', margin: '0 0 14px', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
            ให้ SpacesMate ดูแล<br />ทรัพย์สินของคุณแบบครบวงจร
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.78)', fontWeight: 300, lineHeight: 1.65, margin: 0 }}>
            หาผู้เช่า · คัดกรอง · ทำสัญญา · เก็บค่าเช่า · ดูแลซ่อมบำรุง — ทั้งเรื่องยุ่งยากไว้กับเรา
          </p>
        </div>
      </section>

      {/* ── 2. WHY ───────────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(20px,2.8vw,28px)', fontWeight: 700, color: '#1a1a1a', textAlign: 'center', margin: '0 0 8px' }}>
            ทำไมต้องใช้บริการรับฝากบริหาร
          </h2>
          <p style={{ fontSize: 15, color: '#6b7280', textAlign: 'center', fontWeight: 300, margin: '0 0 40px' }}>
            ปล่อยให้มืออาชีพดูแล คุณแค่รอรับรายได้
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }} className="sm-why4">
            {WHY.map(w => (
              <div key={w.icon} style={{ border: '1px solid #e8edeb', borderRadius: 16, padding: '26px 20px', background: '#fff' }}>
                {/* teal solid circle icon */}
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#048c73', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <span className="msym" style={{ fontSize: 26, color: '#fff', lineHeight: 1 }}>{w.icon}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px' }}>{w.title}</h3>
                <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.6, margin: 0, fontWeight: 300 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. SERVICES ──────────────────────────────────────────────────── */}
      <section style={{ background: '#f5f8f6', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(20px,2.8vw,28px)', fontWeight: 700, color: '#1a1a1a', textAlign: 'center', margin: '0 0 8px' }}>
            บริการของเราครอบคลุม
          </h2>
          <p style={{ fontSize: 15, color: '#6b7280', textAlign: 'center', fontWeight: 300, margin: '0 0 40px' }}>
            ตั้งแต่หาผู้เช่าจนถึงดูแลตลอดสัญญา — เราจัดการให้ครบ
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="sm-svc3">
            {SERVICES.map(s => (
              <div key={s.icon} style={{ background: '#fff', border: '1px solid #e8edeb', borderRadius: 14, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                {/* teal light-bg rounded square */}
                <div style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 10, background: '#e6f4ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="msym" style={{ fontSize: 22, color: '#048c73', lineHeight: 1 }}>{s.icon}</span>
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>{s.title}</p>
                  <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.55, margin: 0, fontWeight: 300 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. STEPS + FORM ──────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '60px 24px 72px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 52, alignItems: 'start' }} className="sm-2col">

          {/* LEFT — Steps */}
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: '0 0 28px' }}>ขั้นตอนง่ายๆ</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {STEPS.map(s => (
                <div key={s.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {/* dark green rounded-square number */}
                  <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 10, background: '#048c73', color: '#fff', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {s.n}
                  </div>
                  <div style={{ paddingTop: 7 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>{s.title}</p>
                    <p style={{ fontSize: 14, color: '#6b7280', fontWeight: 300, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* speech-bubble note */}
            <div style={{ marginTop: 30, background: '#f5f8f6', border: '1px solid #e8edeb', borderRadius: 14, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>💬</span>
              <p style={{ fontSize: 13.5, color: '#6b7280', margin: 0, fontWeight: 300, lineHeight: 1.65 }}>
                สนใจจากเพจหรือโซเชียลของเรา? กรอกฟอร์มนี้ได้เลย — ทีมงานจะโทรกลับเพื่อสอบถามรายละเอียดเพิ่มเติม
              </p>
            </div>
          </div>

          {/* RIGHT — Lead form */}
          <div style={{ background: '#fff', border: '1px solid #e8edeb', borderRadius: 20, padding: '28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
            {!sent ? (
              <>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>ให้เราติดต่อกลับ</h3>
                <p style={{ fontSize: 14, color: '#6b7280', fontWeight: 300, margin: '0 0 22px', lineHeight: 1.55 }}>
                  กรอกข้อมูลสั้นๆ ทีมงานติดต่อกลับภายใน 24 ชม.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                  {/* Name */}
                  <div>
                    <label style={{ fontSize: 13.5, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>ชื่อ-นามสกุล</label>
                    <input placeholder="ชื่อของคุณ"
                      style={{ width: '100%', border: '1px solid #dde3e0', borderRadius: 10, padding: '11px 14px', fontSize: 15, outline: 'none', fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box' as const }}
                      onFocus={e => { e.target.style.borderColor = '#048c73'; e.target.style.boxShadow = '0 0 0 3px rgba(4,140,115,0.1)' }}
                      onBlur={e => { e.target.style.borderColor = '#dde3e0'; e.target.style.boxShadow = 'none' }} />
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={{ fontSize: 13.5, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>เบอร์โทรศัพท์</label>
                    <input placeholder="08X-XXX-XXXX"
                      style={{ width: '100%', border: '1px solid #dde3e0', borderRadius: 10, padding: '11px 14px', fontSize: 15, outline: 'none', fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box' as const }}
                      onFocus={e => { e.target.style.borderColor = '#048c73'; e.target.style.boxShadow = '0 0 0 3px rgba(4,140,115,0.1)' }}
                      onBlur={e => { e.target.style.borderColor = '#dde3e0'; e.target.style.boxShadow = 'none' }} />
                  </div>

                  {/* Type + Location */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 13.5, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>ประเภททรัพย์สิน</label>
                      <select style={{ width: '100%', border: '1px solid #dde3e0', borderRadius: 10, padding: '11px 12px', fontSize: 15, outline: 'none', fontFamily: 'inherit', background: '#fff', cursor: 'pointer', boxSizing: 'border-box' as const }}
                        onFocus={e => { e.target.style.borderColor = '#048c73' }}
                        onBlur={e => { e.target.style.borderColor = '#dde3e0' }}>
                        {['คอนโด', 'อพาร์ทเม้นท์', 'บ้าน', 'ออฟฟิศ'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 13.5, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>ทำเล</label>
                      <input placeholder="เช่น สุขุมวิท"
                        style={{ width: '100%', border: '1px solid #dde3e0', borderRadius: 10, padding: '11px 14px', fontSize: 15, outline: 'none', fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box' as const }}
                        onFocus={e => { e.target.style.borderColor = '#048c73'; e.target.style.boxShadow = '0 0 0 3px rgba(4,140,115,0.1)' }}
                        onBlur={e => { e.target.style.borderColor = '#dde3e0'; e.target.style.boxShadow = 'none' }} />
                    </div>
                  </div>

                  {/* Channel */}
                  <div>
                    <label style={{ fontSize: 13.5, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 8 }}>ช่องทางติดต่อที่สะดวก</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {(['โทร', 'LINE', 'อีเมล'] as const).map((ch) => {
                        const icons: Record<string, string> = { โทร: '📞', LINE: '💬', อีเมล: '✉️' }
                        const active = channel === ch
                        return (
                          <button key={ch} onClick={() => setChannel(ch)}
                            style={{ flex: 1, padding: '10px 6px', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all .15s', border: `1.5px solid ${active ? '#02402e' : '#dde3e0'}`, background: active ? '#02402e' : '#fff', color: active ? '#fff' : '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                            <span style={{ fontSize: 15 }}>{icons[ch]}</span> {ch}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button onClick={() => setSent(true)}
                  style={{ width: '100%', marginTop: 20, background: '#d97f11', color: '#fff', fontWeight: 700, fontSize: 15.5, border: 'none', borderRadius: 28, padding: '14px 0', cursor: 'pointer' }}>
                  ส่งข้อมูล — ให้เราติดต่อกลับ
                </button>
                <p style={{ textAlign: 'center', fontSize: 12.5, color: '#9ca3af', margin: '10px 0 0', fontWeight: 300 }}>
                  ข้อมูลของคุณจะถูกเก็บเป็นความลับ
                </p>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e6f4ee', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <span className="msym" style={{ fontSize: 32, color: '#048c73' }}>check_circle</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#02402e', margin: '0 0 10px' }}>ได้รับข้อมูลแล้ว!</h3>
                <p style={{ fontSize: 14.5, color: '#6b7280', margin: '0 0 22px', fontWeight: 300, lineHeight: 1.65 }}>
                  ทีมงาน SpacesMate จะโทรกลับ<br /><strong style={{ color: '#02402e' }}>ภายใน 24 ชั่วโมง</strong>
                </p>
                <button onClick={() => setSent(false)}
                  style={{ background: '#fff', color: '#374151', fontWeight: 600, fontSize: 14, border: '1px solid #dde3e0', borderRadius: 24, padding: '11px 24px', cursor: 'pointer' }}>
                  ส่งข้อมูลอีกรายการ
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 960px) {
          .sm-why4  { grid-template-columns: repeat(2,1fr) !important; }
          .sm-svc3  { grid-template-columns: repeat(2,1fr) !important; }
          .sm-2col  { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 580px) {
          .sm-why4  { grid-template-columns: 1fr !important; }
          .sm-svc3  { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
