'use client'

import { useState } from 'react'

const WHY = [
  { icon: 'schedule',      title: 'ประหยัดเวลา',      desc: 'ไม่ต้องรับสายผู้เช่า นัดห้อง หรือตามเก็บค่าเช่าเอง' },
  { icon: 'verified_user', title: 'ผู้เช่าคุณภาพ',    desc: 'เราคัดกรองและตรวจสอบประวัติผู้เช่าก่อนทุกครั้ง' },
  { icon: 'savings',       title: 'รายได้สม่ำเสมอ',   desc: 'โอนค่าเช่าตรงเวลา พร้อมรายงานผลทุกเดือน' },
  { icon: 'handyman',      title: 'ดูแลครบวงจร',      desc: 'ประสานงานซ่อมบำรุงและดูแลทรัพย์สินตลอดสัญญา' },
]

const INCLUDED = [
  { icon: 'campaign',      title: 'การตลาด & ลงประกาศ', desc: 'ถ่ายภาพ เขียนประกาศ และโปรโมทบนทุกช่องทาง' },
  { icon: 'fact_check',    title: 'คัดกรองผู้เช่า',      desc: 'ตรวจสอบประวัติและความสามารถในการชำระ' },
  { icon: 'description',   title: 'จัดทำสัญญา',          desc: 'ทำสัญญาเช่าที่รัดกุมและถูกต้องตามกฎหมาย' },
  { icon: 'receipt_long',  title: 'เก็บค่าเช่า',         desc: 'เรียกเก็บและโอนเข้าบัญชีคุณตรงเวลาทุกเดือน' },
  { icon: 'build',         title: 'ซ่อมบำรุง',           desc: 'ประสานงานช่างและดูแลทรัพย์สินตลอดสัญญา' },
  { icon: 'bar_chart',     title: 'รายงานผล',            desc: 'สรุปรายได้และสถานะทรัพย์สินให้ทุกเดือน' },
]

const STEPS = [
  { num: '1', title: 'กรอกฟอร์ม',              desc: 'บอกประเภทและรายละเอียดทรัพย์สินของคุณ ใช้เวลาไม่ถึง 2 นาที' },
  { num: '2', title: 'ทีมงานติดต่อกลับ',       desc: 'เจ้าหน้าที่โทรกลับภายใน 24 ชม. เพื่อสอบถามรายละเอียด' },
  { num: '3', title: 'ตรวจสอบ & ประเมินทรัพย์', desc: 'เราเข้าดูทรัพย์สิน ตรวจสอบเอกสาร และประเมินค่าเช่าที่เหมาะสม' },
  { num: '4', title: 'เซ็นสัญญาบริหาร',        desc: 'ตกลงเงื่อนไขที่โปร่งใส แล้วเราเริ่มหาผู้เช่าและคัดกรองให้' },
  { num: '5', title: 'รับรายได้สบายใจ',        desc: 'เราดูแลเก็บค่าเช่า ซ่อมบำรุง และรายงานผลให้คุณทุกเดือน' },
]

const CHANNELS = [
  { key: 'โทร',  icon: 'call',      label: 'โทร' },
  { key: 'LINE', icon: 'chat',      label: 'LINE' },
  { key: 'อีเมล', icon: 'mail',    label: 'อีเมล' },
]

const fieldStyle = {
  width: '100%', border: '1px solid #e2e8e6', borderRadius: 10,
  padding: '12px 14px', fontSize: 15, outline: 'none', fontFamily: 'inherit',
  background: '#fff', color: '#231f20', boxSizing: 'border-box' as const,
}
const labelStyle = { fontSize: 13.5, fontWeight: 500, color: '#374151', display: 'block' as const, marginBottom: 6 }

export default function ManagePage() {
  const [sent, setSent] = useState(false)
  const [channel, setChannel] = useState('โทร')

  function focus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.target.style.borderColor = '#048c73'
    e.target.style.boxShadow = '0 0 0 3px rgba(4,140,115,0.12)'
  }
  function blur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.target.style.borderColor = '#e2e8e6'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div style={{ fontFamily: 'inherit' }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ background: '#02402e', padding: '52px 24px 56px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ maxWidth: 640 }}>
            <span style={{ display: 'inline-block', fontSize: 13, color: '#d97f11', fontWeight: 600, marginBottom: 16 }}>
              บริการรับฝากบริหาร
            </span>
            <h1 style={{ color: '#fff', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 700, margin: '0 0 16px', lineHeight: 1.2, letterSpacing: '-0.4px' }}>
              ให้ SpacesMate ดูแล<br />ทรัพย์สินของคุณแบบครบวงจร
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 16, fontWeight: 300, lineHeight: 1.65, margin: 0 }}>
              หาผู้เช่า · คัดกรอง · ทำสัญญา · เก็บค่าเช่า · ดูแลซ่อมบำรุง — ทั้งเรื่องยุ่งยากไว้กับเรา
            </p>
          </div>
        </div>
      </section>

      {/* ── WHY ──────────────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px,3vw,28px)', fontWeight: 600, margin: '0 0 8px', textAlign: 'center', color: '#231f20' }}>
            ทำไมต้องใช้บริการรับฝากบริหาร
          </h2>
          <p style={{ color: '#6b7280', fontSize: 15, margin: '0 0 36px', textAlign: 'center', fontWeight: 300 }}>
            ปล่อยให้มืออาชีพดูแล คุณแค่รอรับรายได้
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }} className="sm-why4">
            {WHY.map(w => (
              <div key={w.icon} style={{ background: '#fff', border: '1px solid #e5eae8', borderRadius: 16, padding: '28px 22px' }}>
                {/* Teal circle icon */}
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#048c73', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <span className="msym" style={{ fontSize: 26, color: '#fff' }}>{w.icon}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px', color: '#111827' }}>{w.title}</h3>
                <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, margin: 0, fontWeight: 300 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INCLUDED SERVICES ────────────────────────────────────────────── */}
      <section style={{ background: '#f8faf9', borderTop: '1px solid #e5eae8', borderBottom: '1px solid #e5eae8', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px,3vw,28px)', fontWeight: 600, margin: '0 0 8px', textAlign: 'center', color: '#111827' }}>
            บริการของเราครอบคลุม
          </h2>
          <p style={{ color: '#6b7280', fontSize: 15, margin: '0 0 36px', textAlign: 'center', fontWeight: 300 }}>
            ตั้งแต่หาผู้เช่าจนถึงดูแลตลอดสัญญา — เราจัดการให้ครบ
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }} className="sm-grid3">
            {INCLUDED.map(s => (
              <div key={s.icon} style={{ background: '#fff', border: '1px solid #e5eae8', borderRadius: 14, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                {/* Teal rounded square icon */}
                <div style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 11, background: '#eaf6f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="msym" style={{ fontSize: 22, color: '#048c73' }}>{s.icon}</span>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.55, fontWeight: 300 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STEPS + LEAD FORM ────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '56px 24px 72px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 48, alignItems: 'start' }} className="sm-2col">

          {/* Steps */}
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 28px', color: '#111827' }}>ขั้นตอนง่ายๆ</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {STEPS.map(s => (
                <div key={s.num} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {/* Dark green square number */}
                  <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 10, background: '#02402e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
                    {s.num}
                  </div>
                  <div style={{ paddingTop: 6 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: '#111827' }}>{s.title}</div>
                    <div style={{ fontSize: 14, color: '#6b7280', fontWeight: 300, lineHeight: 1.6 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Speech bubble note */}
            <div style={{ marginTop: 32, background: '#f8faf9', border: '1px solid #e5eae8', borderRadius: 14, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span className="msym" style={{ fontSize: 26, color: '#9ca3af', flexShrink: 0, marginTop: 2 }}>chat_bubble_outline</span>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0, fontWeight: 300, lineHeight: 1.65 }}>
                สนใจจากเพจหรือโซเชียลของเรา? กรอกฟอร์มนี้ได้เลย — ทีมงานจะโทรกลับเพื่อสอบถามรายละเอียดเพิ่มเติม
              </p>
            </div>
          </div>

          {/* Lead form */}
          <aside style={{ background: '#fff', border: '1px solid #e5eae8', borderRadius: 20, padding: '28px 26px', boxShadow: '0 8px 30px -12px rgba(0,0,0,0.1)' }}>
            {!sent ? (
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 4px', color: '#111827' }}>ให้เราติดต่อกลับ</h3>
                <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px', fontWeight: 300, lineHeight: 1.55 }}>
                  กรอกข้อมูลสั้นๆ ทีมงานติดต่อกลับภายใน 24 ชม.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>ชื่อ-นามสกุล</label>
                    <input style={fieldStyle} placeholder="ชื่อของคุณ" onFocus={focus} onBlur={blur} />
                  </div>
                  <div>
                    <label style={labelStyle}>เบอร์โทรศัพท์</label>
                    <input style={fieldStyle} placeholder="08X-XXX-XXXX" onFocus={focus} onBlur={blur} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>ประเภททรัพย์สิน</label>
                      <select style={{ ...fieldStyle, cursor: 'pointer' }} onFocus={focus} onBlur={blur}>
                        {['คอนโด','อพาร์ทเม้นท์','บ้าน','ออฟฟิศ'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>ทำเล</label>
                      <input style={fieldStyle} placeholder="เช่น สุขุมวิท" onFocus={focus} onBlur={blur} />
                    </div>
                  </div>

                  {/* Channel buttons */}
                  <div>
                    <label style={labelStyle}>ช่องทางติดต่อที่สะดวก</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {CHANNELS.map(ch => {
                        const active = channel === ch.key
                        return (
                          <button key={ch.key} onClick={() => setChannel(ch.key)}
                            style={{
                              flex: 1, padding: '10px 0', borderRadius: 10,
                              fontSize: 14, fontWeight: 500, cursor: 'pointer',
                              transition: 'all .2s',
                              border: `1.5px solid ${active ? '#02402e' : '#e2e8e6'}`,
                              background: active ? '#02402e' : '#fff',
                              color: active ? '#fff' : '#374151',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                            }}>
                            <span className="msym" style={{ fontSize: 16 }}>{ch.icon}</span>
                            {ch.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <button onClick={() => setSent(true)}
                  style={{ width: '100%', marginTop: 22, background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 15.5, border: 'none', borderRadius: 28, padding: '15px 0', cursor: 'pointer', transition: 'all .2s', letterSpacing: '0.1px' }}>
                  ส่งข้อมูล — ให้เราติดต่อกลับ
                </button>
                <p style={{ textAlign: 'center', fontSize: 12.5, color: '#9ca3af', margin: '12px 0 0' }}>
                  ข้อมูลของคุณจะถูกเก็บเป็นความลับ
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '28px 0' }}>
                <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#eaf6f1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                  <span className="msym" style={{ fontSize: 34, color: '#048c73' }}>check_circle</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 10px', color: '#02402e' }}>ได้รับข้อมูลแล้ว!</h3>
                <p style={{ fontSize: 14.5, color: '#6b7280', margin: '0 0 24px', fontWeight: 300, lineHeight: 1.65 }}>
                  ทีมงาน SpacesMate จะโทรกลับเพื่อสอบถามรายละเอียด<br />
                  <strong style={{ color: '#02402e' }}>ภายใน 24 ชั่วโมง</strong>
                </p>
                <button onClick={() => setSent(false)}
                  style={{ background: '#fff', color: '#374151', fontWeight: 600, fontSize: 14, border: '1px solid #e2e8e6', borderRadius: 24, padding: '11px 24px', cursor: 'pointer' }}>
                  ส่งข้อมูลอีกรายการ
                </button>
              </div>
            )}
          </aside>
        </div>
      </section>

      <style>{`
        @media (max-width: 960px) {
          .sm-why4 { grid-template-columns: repeat(2,1fr) !important; }
          .sm-grid3 { grid-template-columns: repeat(2,1fr) !important; }
          .sm-2col { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 580px) {
          .sm-why4 { grid-template-columns: 1fr !important; }
          .sm-grid3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
