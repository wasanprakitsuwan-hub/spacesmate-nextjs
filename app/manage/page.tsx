'use client'

import { useState } from 'react'

const WHY = [
  { icon: 'person_search', title: 'หาผู้เช่าคุณภาพ', desc: 'คัดกรองผู้เช่าโดยทีมงานผู้เชี่ยวชาญ ลดความเสี่ยงปัญหาระยะยาว' },
  { icon: 'gavel', title: 'ทำสัญญามาตรฐาน', desc: 'สัญญาเช่าครบถ้วนตามกฎหมาย คุ้มครองทั้งเจ้าของและผู้เช่า' },
  { icon: 'payments', title: 'เก็บค่าเช่าแทนคุณ', desc: 'ติดตามและเก็บค่าเช่าตรงเวลา พร้อมรายงานรายได้รายเดือน' },
  { icon: 'construction', title: 'ดูแลซ่อมบำรุง', desc: 'จัดการซ่อมบำรุงทันที ประสานช่างที่เชื่อถือได้ในราคายุติธรรม' },
]

const INCLUDED = [
  { icon: 'campaign', title: 'การตลาดและโฆษณา', desc: 'ลงประกาศบนทุกช่องทาง พร้อมถ่ายรูปมืออาชีพ' },
  { icon: 'verified_user', title: 'คัดกรองผู้เช่า', desc: 'ตรวจสอบประวัติและความน่าเชื่อถือของผู้เช่า' },
  { icon: 'description', title: 'จัดทำสัญญา', desc: 'ร่างและลงนามสัญญาเช่าตามมาตรฐาน' },
  { icon: 'receipt_long', title: 'เก็บค่าเช่า', desc: 'ติดตามและรวบรวมค่าเช่าพร้อมออกใบเสร็จ' },
  { icon: 'handyman', title: 'ซ่อมบำรุง', desc: 'ประสานช่างและจัดการซ่อมแซมทุกชนิด' },
  { icon: 'analytics', title: 'รายงานรายเดือน', desc: 'สรุปรายรับ-รายจ่าย และสถานะทรัพย์สิน' },
]

const STEPS = [
  { num: '1', title: 'กรอกข้อมูลทรัพย์สิน', desc: 'แจ้งประเภท ขนาด และทำเลของทรัพย์สินผ่านฟอร์มนี้' },
  { num: '2', title: 'ทีมงานโทรกลับ', desc: 'ผู้เชี่ยวชาญของเราจะติดต่อเพื่อสอบถามรายละเอียดเพิ่มเติม' },
  { num: '3', title: 'นัดดูทรัพย์สิน', desc: 'ทีมงานลงพื้นที่ประเมินและถ่ายรูปทรัพย์สินของคุณ' },
  { num: '4', title: 'เริ่มให้บริการ', desc: 'เซ็นสัญญาบริหาร และเราเริ่มหาผู้เช่าทันที' },
  { num: '5', title: 'รอรับรายได้', desc: 'คุณรับรายงานรายเดือน เราดูแลทุกอย่างแทน' },
]

const CHANNELS = ['โทรศัพท์', 'LINE', 'อีเมล']

const fieldStyle = {
  width: '100%', border: '1px solid #eef0ef', borderRadius: 12,
  padding: '12px 14px', fontSize: 15, outline: 'none', fontFamily: 'inherit', background: '#fff',
}
const labelStyle = { fontSize: 13, fontWeight: 600, color: '#475569', display: 'block' as const, marginBottom: 6 }

export default function ManagePage() {
  const [sent, setSent] = useState(false)
  const [channel, setChannel] = useState('โทรศัพท์')

  function focus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    (e.target as HTMLElement).style.borderColor = '#048c73'
    ;(e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(4,140,115,0.12)'
  }
  function blur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    (e.target as HTMLElement).style.borderColor = '#eef0ef'
    ;(e.target as HTMLElement).style.boxShadow = 'none'
  }

  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'radial-gradient(120% 150% at 80% 0%,#055c43,#02402e 60%)', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ maxWidth: 600 }}>
            <span style={{ display: 'inline-block', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: '#d97f11', fontWeight: 600, marginBottom: 14 }}>บริการรับฝากบริหาร</span>
            <h1 style={{ color: '#fff', fontSize: 34, fontWeight: 600, margin: '0 0 14px', lineHeight: 1.2, letterSpacing: '-0.5px' }}>ให้ SpacesMate ดูแล<br />ทรัพย์สินของคุณแบบครบวงจร</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 300, lineHeight: 1.6, margin: 0 }}>หาผู้เช่า · คัดกรอง · ทำสัญญา · เก็บค่าเช่า · ดูแลซ่อมบำรุง — ทิ้งเรื่องยุ่งยากไว้กับเรา</p>
          </div>
        </div>
      </div>

      {/* Why */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '44px 24px 8px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 8px', textAlign: 'center', color: '#02402e', letterSpacing: '-0.4px' }}>ทำไมต้องใช้บริการรับฝากบริหาร</h2>
        <p style={{ color: '#64748b', fontSize: 15, margin: '0 0 32px', textAlign: 'center', fontWeight: 300 }}>ปล่อยให้มืออาชีพดูแล คุณแค่รอรับรายได้</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }} className="sm-cats">
          {WHY.map(w => (
            <div key={w.icon} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: '26px 22px' }}>
              <span style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(140deg,#06a487,#02402e)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 15, boxShadow: '0 9px 18px -8px rgba(2,64,46,0.5)' }}>
                <span className="msym" style={{ fontSize: 25, color: '#fff' }}>{w.icon}</span>
              </span>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 7px' }}>{w.title}</h3>
              <p style={{ color: '#64748b', fontSize: 13.5, lineHeight: 1.55, margin: 0, fontWeight: 300 }}>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Included services */}
      <section style={{ background: '#f7f9f8', borderTop: '1px solid #eef0ef', borderBottom: '1px solid #eef0ef', padding: '44px 24px', marginTop: 8 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 8px', textAlign: 'center', color: '#02402e', letterSpacing: '-0.4px' }}>บริการของเราครอบคลุม</h2>
          <p style={{ color: '#64748b', fontSize: 15, margin: '0 0 32px', textAlign: 'center', fontWeight: 300 }}>ตั้งแต่หาผู้เช่าจนถึงดูแลตลอดสัญญา — เราจัดการให้ครบ</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="sm-grid3">
            {INCLUDED.map(mi => (
              <div key={mi.icon} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 14, padding: '18px 20px', display: 'flex', gap: 13, alignItems: 'flex-start' }}>
                <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 11, background: '#eaf6f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="msym" style={{ fontSize: 21, color: '#048c73' }}>{mi.icon}</span>
                </span>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: '#02402e', marginBottom: 3 }}>{mi.title}</div>
                  <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, fontWeight: 300 }}>{mi.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps + Lead form */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 60px', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 36, alignItems: 'start' }} className="sm-detaillayout">

        {/* Steps */}
        <div>
          <h2 style={{ fontSize: 21, fontWeight: 600, margin: '0 0 22px', color: '#02402e' }}>ขั้นตอนง่ายๆ</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {STEPS.map(ms => (
              <div key={ms.num} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span className="mono" style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 12, background: 'linear-gradient(140deg,#06a487,#02402e)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 15, boxShadow: '0 8px 16px -7px rgba(2,64,46,0.5)' }}>{ms.num}</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{ms.title}</div>
                  <div style={{ fontSize: 14, color: '#64748b', fontWeight: 300, lineHeight: 1.55 }}>{ms.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28, background: '#f7f9f8', border: '1px solid #eef0ef', borderRadius: 16, padding: 20, display: 'flex', gap: 14, alignItems: 'center' }}>
            <span style={{ fontSize: 26 }}>💬</span>
            <p style={{ fontSize: 13.5, color: '#475569', margin: 0, fontWeight: 300, lineHeight: 1.55 }}>สนใจจากเพจหรือโซเชียลของเรา? กรอกฟอร์มนี้ได้เลย — ทีมงานจะโทรกลับเพื่อสอบถามรายละเอียดเพิ่มเติม</p>
          </div>
        </div>

        {/* Lead form */}
        <aside style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 20, padding: 30, boxShadow: '0 14px 34px -16px rgba(2,64,46,0.16)' }}>
          {!sent ? (
            <div>
              <h3 style={{ fontSize: 19, fontWeight: 600, margin: '0 0 4px', color: '#02402e' }}>ให้เราติดต่อกลับ</h3>
              <p style={{ fontSize: 13.5, color: '#64748b', margin: '0 0 22px', fontWeight: 300 }}>กรอกข้อมูลสั้นๆ ทีมงานติดต่อกลับภายใน 24 ชม.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
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
                <div>
                  <label style={labelStyle}>ช่องทางติดต่อที่สะดวก</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {CHANNELS.map(cc => (
                      <button key={cc} onClick={() => setChannel(cc)}
                        style={{ flex: 1, padding: '10px 0', borderRadius: 11, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', transition: 'all .2s', border: `1.5px solid ${channel === cc ? '#048c73' : '#eef0ef'}`, background: channel === cc ? '#eaf6f1' : '#fff', color: channel === cc ? '#02402e' : '#475569' }}>
                        {cc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => setSent(true)}
                style={{ width: '100%', marginTop: 22, background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 24, padding: '14px 0', cursor: 'pointer', transition: 'all .2s', boxShadow: '0 8px 20px -6px rgba(217,127,17,0.5)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1.08)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = ''}>
                ส่งข้อมูล — ให้เราติดต่อกลับ
              </button>
              <p style={{ textAlign: 'center', fontSize: 11.5, color: '#94a3b8', margin: '13px 0 0' }}>ข้อมูลของคุณจะถูกเก็บเป็นความลับ</p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#eaf6f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 33, margin: '0 auto 18px' }}>✓</div>
              <h3 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 10px', color: '#02402e' }}>ได้รับข้อมูลแล้ว!</h3>
              <p style={{ fontSize: 14.5, color: '#64748b', margin: '0 0 24px', fontWeight: 300, lineHeight: 1.6 }}>ทีมงาน SpacesMate จะโทรกลับเพื่อสอบถามรายละเอียดทรัพย์สินของคุณ<br /><strong style={{ color: '#02402e' }}>ภายใน 24 ชั่วโมง</strong></p>
              <button onClick={() => setSent(false)}
                style={{ background: '#fff', color: '#02402e', fontWeight: 600, fontSize: 14, border: '1px solid #d5ddd9', borderRadius: 24, padding: '11px 24px', cursor: 'pointer' }}>
                ส่งข้อมูลอีกรายการ
              </button>
            </div>
          )}
        </aside>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .sm-detaillayout { grid-template-columns: 1fr !important; }
          .sm-cats { grid-template-columns: repeat(2,1fr) !important; }
          .sm-grid3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
