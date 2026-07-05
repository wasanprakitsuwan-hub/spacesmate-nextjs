const WHY_BLOCKS = [
  { icon: 'update',              title: 'ข้อมูลแม่นยำเสมอ',    desc: 'ทุกประกาศต่ออายุสูงสุด 12 เดือน เจ้าของต้องอัปเดตเพื่อต่ออายุ ข้อมูลจึงใหม่กว่าเว็บอื่น' },
  { icon: 'sell',                title: 'ลงประกาศง่าย ราคาเริ่มต้น ฿299', desc: 'เผยแพร่ทันทีหลังชำระ ไม่ต้องรอทีมงาน รองรับทุกประเภทอสังหาริมทรัพย์' },
  { icon: 'category',            title: 'ครอบคลุมทุกประเภท',   desc: 'คอนโด อพาร์ทเม้นท์ บ้าน ออฟฟิศ และตึกแถว — มากกว่าเว็บทั่วไป' },
  { icon: 'dashboard_customize', title: 'จัดการง่าย',           desc: 'แดชบอร์ดเดียวจบ แก้ไขประกาศ ดูยอดเข้าชม และผู้สนใจได้ทันที' },
]

export default function WhySpacesMate() {
  return (
    <section style={{ background: 'linear-gradient(180deg,#eef5f1,#f4f9f6)', borderTop: '1px solid #e3ede8', borderBottom: '1px solid #e3ede8', padding: '60px 24px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, margin: '0 0 8px', textAlign: 'center', letterSpacing: '-0.4px', color: '#02402e' }}>ทำไมต้อง SpacesMate</h2>
        <p style={{ color: '#64748b', fontSize: 15, margin: '0 0 40px', textAlign: 'center', fontWeight: 300 }}>แพลตฟอร์มที่ออกแบบมาเพื่อความเป็นธรรมและความโปร่งใส</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }} className="sm-cats">
          {WHY_BLOCKS.map(w => (
            <div key={w.title} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: '30px 26px' }}>
              <span style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(140deg,#06a487,#02402e)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 9px 18px -8px rgba(2,64,46,0.5)', flexShrink: 0 }}>
                <span className="msym" style={{ fontSize: 26, color: '#fff' }}>{w.icon}</span>
              </span>
              <h3 style={{ fontSize: 17.5, fontWeight: 600, margin: '0 0 8px', color: '#231f20' }}>{w.title}</h3>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, margin: 0, fontWeight: 300 }}>{w.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
