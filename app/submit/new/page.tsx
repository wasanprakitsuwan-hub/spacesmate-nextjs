'use client'

import { useState } from 'react'
import Link from 'next/link'

const STEPS = [
  { num: 1, label: 'ข้อมูลทรัพย์สิน' },
  { num: 2, label: 'ที่ตั้ง' },
  { num: 3, label: 'รูปภาพ' },
]

const TYPES = ['คอนโดมิเนียม','อพาร์ทเม้นท์','บ้าน','ออฟฟิศ','โคเวิร์กกิ้ง','ตึกแถว']
const AMENITIES_LIST = ['Wi-Fi','แอร์','ที่จอดรถ','เฟอร์นิเจอร์ครบ','ซักรีด','รักษาความปลอดภัย','สระว่ายน้ำ','ฟิตเนส']

const fieldStyle = {
  width:'100%', border:'1px solid #eef0ef', borderRadius:12, padding:'12px 14px',
  fontSize:15, outline:'none', fontFamily:'inherit', background:'#fff', color:'#231f20',
}
const labelStyle = { fontSize:13, fontWeight:600, color:'#475569', display:'block' as const, marginBottom:6 }

export default function SubmitNewPage() {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [rentType, setRentType] = useState<'month'|'day'>('month')
  const [amenities, setAmenities] = useState<string[]>([])

  function toggleAm(a: string) {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(140deg,#06a487,#02402e)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <span className="msym" style={{ fontSize: 38, color: '#fff' }}>check_circle</span>
          </div>
          <h2 style={{ fontSize: 23, fontWeight: 600, color: '#02402e', margin: '0 0 10px' }}>ประกาศของคุณถูกส่งแล้ว!</h2>
          <p style={{ color: '#64748b', fontSize: 14.5, fontWeight: 300, lineHeight: 1.65, margin: '0 0 26px' }}>
            ทีมงาน SpacesMate จะตรวจสอบและเผยแพร่ประกาศของคุณภายใน 24 ชั่วโมง<br />คุณจะได้รับแพ็กเกจทดลองใช้ฟรี 30 วัน
          </p>
          <Link href="/" style={{ background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 15, borderRadius: 24, padding: '13px 28px', textDecoration: 'none', display: 'inline-block' }}>กลับหน้าแรก</Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Step header */}
      <div style={{ background: '#f7f9f8', borderBottom: '1px solid #eef0ef', padding: '28px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {STEPS.map((s, i) => {
              const done = i < step
              const active = i === step
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
                    <span style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14, background: done ? '#048c73' : active ? '#d97f11' : '#e2e8e6', color: done || active ? '#fff' : '#94a3b8', transition: 'all .3s' }}>
                      {done ? <span className="msym" style={{ fontSize: 18 }}>check</span> : s.num}
                    </span>
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: active ? '#02402e' : done ? '#048c73' : '#94a3b8', whiteSpace: 'nowrap' }}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: done ? '#048c73' : '#e2e8e6', margin: '0 12px', transition: 'all .3s' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '34px 24px 64px' }}>
        <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 20, padding: 32, boxShadow: '0 6px 20px -12px rgba(2,64,46,0.08)' }}>

          {/* Step 0: Property Info */}
          {step === 0 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 22px', color: '#02402e' }}>ข้อมูลทรัพย์สิน</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>ชื่อประกาศ</label>
                  <input style={fieldStyle} placeholder="เช่น คอนโด เมโทร ลักซ์ พระราม 4 ห้องสตูดิโอ"
                    onFocus={e => { (e.target as HTMLElement).style.borderColor = '#048c73'; (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(4,140,115,0.12)' }}
                    onBlur={e => { (e.target as HTMLElement).style.borderColor = '#eef0ef'; (e.target as HTMLElement).style.boxShadow = 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="sm-form2">
                  <div>
                    <label style={labelStyle}>ประเภท</label>
                    <select style={{ ...fieldStyle, cursor: 'pointer' }}>
                      {TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>การปล่อยเช่า</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {(['month', 'day'] as const).map(rt => (
                        <button key={rt} onClick={() => setRentType(rt)}
                          style={{ flex: 1, padding: '12px 0', borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all .2s', border: `1.5px solid ${rentType === rt ? '#048c73' : '#eef0ef'}`, background: rentType === rt ? '#eaf6f1' : '#fff', color: rentType === rt ? '#02402e' : '#475569' }}>
                          {rt === 'month' ? 'รายเดือน' : 'รายวัน'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>ราคาเช่า (บาท/{rentType === 'month' ? 'เดือน' : 'วัน'})</label>
                  <input type="number" style={fieldStyle} placeholder={rentType === 'month' ? 'เช่น 15000' : 'เช่น 900'}
                    onFocus={e => { (e.target as HTMLElement).style.borderColor = '#048c73'; (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(4,140,115,0.12)' }}
                    onBlur={e => { (e.target as HTMLElement).style.borderColor = '#eef0ef'; (e.target as HTMLElement).style.boxShadow = 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }} className="sm-form4">
                  {[
                    { label: 'ขนาด ตร.ม.', ph: '28' },
                    { label: 'ห้องนอน', ph: '1' },
                    { label: 'ห้องน้ำ', ph: '1' },
                    { label: 'ชั้น', ph: '7' },
                  ].map(f => (
                    <div key={f.label}>
                      <label style={labelStyle}>{f.label}</label>
                      <input type="number" placeholder={f.ph} style={fieldStyle}
                        onFocus={e => { (e.target as HTMLElement).style.borderColor = '#048c73'; (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(4,140,115,0.12)' }}
                        onBlur={e => { (e.target as HTMLElement).style.borderColor = '#eef0ef'; (e.target as HTMLElement).style.boxShadow = 'none' }} />
                    </div>
                  ))}
                </div>
                <div>
                  <label style={labelStyle}>รายละเอียด</label>
                  <textarea rows={4} placeholder="อธิบายจุดเด่นของทรัพย์สิน..." style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.6 }}
                    onFocus={e => { (e.target as HTMLElement).style.borderColor = '#048c73'; (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(4,140,115,0.12)' }}
                    onBlur={e => { (e.target as HTMLElement).style.borderColor = '#eef0ef'; (e.target as HTMLElement).style.boxShadow = 'none' }} />
                </div>
                <div>
                  <label style={{ ...labelStyle, marginBottom: 12 }}>สิ่งอำนวยความสะดวก</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                    {AMENITIES_LIST.map(a => {
                      const on = amenities.includes(a)
                      return (
                        <button key={a} onClick={() => toggleAm(a)}
                          style={{ padding: '8px 15px', borderRadius: 20, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', transition: 'all .2s', border: `1px solid ${on ? '#048c73' : '#eef0ef'}`, background: on ? '#eaf6f1' : '#fff', color: on ? '#02402e' : '#475569' }}>
                          {a}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Location */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 22px', color: '#02402e' }}>ที่ตั้ง</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>ที่อยู่</label>
                  <input style={fieldStyle} placeholder="บ้านเลขที่ / อาคาร / ถนน"
                    onFocus={e => { (e.target as HTMLElement).style.borderColor = '#048c73'; (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(4,140,115,0.12)' }}
                    onBlur={e => { (e.target as HTMLElement).style.borderColor = '#eef0ef'; (e.target as HTMLElement).style.boxShadow = 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }} className="sm-form2">
                  <div>
                    <label style={labelStyle}>จังหวัด</label>
                    <select style={{ ...fieldStyle, cursor: 'pointer' }}>
                      {['กรุงเทพมหานคร','นนทบุรี','สมุทรปราการ','ปทุมธานี','เชียงใหม่','ภูเก็ต'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>เขต / อำเภอ</label>
                    <select style={{ ...fieldStyle, cursor: 'pointer' }}>
                      {['คลองเตย','วัฒนา','ห้วยขวาง','สาทร','บางรัก','ดินแดง','ลาดพร้าว'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>แขวง / ตำบล</label>
                    <select style={{ ...fieldStyle, cursor: 'pointer' }}>
                      {['คลองเตย','พระโขนง','คลองตัน','ช่องนนทรี','สีลม'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>รหัสไปรษณีย์</label>
                    <input placeholder="10110" style={fieldStyle} maxLength={5}
                      onFocus={e => { (e.target as HTMLElement).style.borderColor = '#048c73'; (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(4,140,115,0.12)' }}
                      onBlur={e => { (e.target as HTMLElement).style.borderColor = '#eef0ef'; (e.target as HTMLElement).style.boxShadow = 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>ตำแหน่งบนแผนที่</label>
                  <div style={{ height: 200, border: '2px dashed #048c73', borderRadius: 14, background: 'repeating-linear-gradient(45deg,#ecf5f2,#ecf5f2 12px,#e2f0eb 12px,#e2f0eb 24px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                    <span className="msym" style={{ fontSize: 38, color: '#048c73', opacity: .6 }}>pin_drop</span>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#048c73', margin: 0 }}>ปักหมุดตำแหน่งที่พัก</p>
                    <p style={{ fontSize: 12.5, color: '#94a3b8', margin: 0 }}>แผนที่จะเชื่อมต่อในเวอร์ชันถัดไป</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Photos */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 22px', color: '#02402e' }}>รูปภาพ</h2>
              <div style={{ border: '2px dashed #048c73', borderRadius: 16, padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: '#f7f9f8', marginBottom: 20 }}
                onClick={() => document.getElementById('img-input')?.click()}>
                <span className="msym" style={{ fontSize: 44, color: '#048c73', opacity: .5 }}>photo_library</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#02402e', margin: '12px 0 6px' }}>ลากรูปภาพมาวางที่นี่</p>
                <p style={{ fontSize: 13.5, color: '#94a3b8', margin: 0 }}>หรือคลิกเพื่อเลือกไฟล์ · JPG, PNG · สูงสุด 10 รูป</p>
                <input id="img-input" type="file" multiple accept="image/*" style={{ display: 'none' }} />
              </div>
              <div style={{ background: 'linear-gradient(135deg,#fef9f0,#fef3e2)', border: '1px solid rgba(217,127,17,0.2)', borderRadius: 16, padding: '20px 22px', textAlign: 'center' }}>
                <p style={{ color: '#d97f11', fontWeight: 600, fontSize: 15, margin: '0 0 4px' }}>🎉 ฟรี 30 วันแรก</p>
                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>ไม่ต้องใช้บัตรเครดิต · ยกเลิกได้ทุกเมื่อ</p>
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 26, justifyContent: step > 0 ? 'space-between' : 'flex-end' }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                style={{ background: 'transparent', color: '#02402e', fontWeight: 600, fontSize: 14.5, border: '1.5px solid #02402e', borderRadius: 24, padding: '12px 26px', cursor: 'pointer', transition: 'all .2s' }}>
                ← ย้อนกลับ
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)}
                style={{ background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 24, padding: '13px 30px', cursor: 'pointer', transition: 'all .2s' }}>
                ถัดไป →
              </button>
            ) : (
              <button onClick={() => setSubmitted(true)}
                style={{ background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 24, padding: '13px 30px', cursor: 'pointer', transition: 'all .2s' }}>
                <span className="msym" style={{ fontSize: 18, marginRight: 6, verticalAlign: 'middle' }}>publish</span>
                เผยแพร่ประกาศ
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .sm-form2 { grid-template-columns: 1fr !important; }
          .sm-form4 { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}
