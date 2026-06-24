import Link from 'next/link'

const BLOG_POSTS = [
  {
    slug: 'top-5-dusit-apartments',
    title: 'รวม 5 ที่พักย่านดุสิต สำหรับคนชอบความเรียบง่าย เดินทางสะดวก (อัปเดต 2026)',
    date: '6 พ.ค. 2026', read: '5 นาที',
    category: 'อสังหาฯ',
    icon: 'location_city',
    bgStyle: 'linear-gradient(135deg,#02402e,#048c73)',
    photo: 'https://spacesmate.com/wp-content/uploads/2026/05/Blog-website-584x438.webp',
  },
  {
    slug: 'property-rental-strategy-2026',
    title: 'ปรับกลยุทธ์ อสังหาปล่อยเช่า 2026: เมื่อการเช่ากลายเป็นไลฟ์สไตล์หลัก',
    date: '28 เม.ย. 2026', read: '6 นาที',
    category: 'เจ้าของที่พัก',
    icon: 'home_work',
    bgStyle: 'linear-gradient(135deg,#1a4a5a,#2d7d9a)',
    photo: '',
  },
  {
    slug: '5-condo-owner-problems',
    title: '5 ปัญหาปล่อยเช่าคอนโด ที่เจ้าของมักเจอ พร้อมวิธีรับมือที่ได้ผลจริง',
    date: '22 เม.ย. 2026', read: '5 นาที',
    category: 'เจ้าของที่พัก',
    icon: 'apartment',
    bgStyle: 'linear-gradient(135deg,#3d2c6e,#6b4fa0)',
    photo: '',
  },
]

export default function BlogSection() {
  return (
    <section style={{ maxWidth: 1240, margin: '0 auto', padding: '8px 24px 56px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 600, margin: '0 0 6px', letterSpacing: '-0.4px', color: '#02402e' }}>บทความล่าสุด</h2>
          <p style={{ color: '#64748b', fontSize: 15, margin: 0, fontWeight: 300 }}>เคล็ดลับ คู่มือ และข้อมูลตลาดเช่า-ขายอสังหาฯ</p>
        </div>
        <Link href="/blog" style={{ color: '#048c73', fontWeight: 600, fontSize: 14.5, cursor: 'pointer', textDecoration: 'none' }}>ดูบทความทั้งหมด →</Link>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }} className="sm-grid3">
        {BLOG_POSTS.map(b => (
          <Link
            key={b.slug}
            href={`/blog/${b.slug}`}
            className="sm-blog-card"
            style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', transition: 'all .25s', boxShadow: '0 6px 20px -10px rgba(2,64,46,0.10)', display: 'block', textDecoration: 'none' }}
          >
            {/* Image area */}
            <div style={{ height: 170, background: b.bgStyle, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: 14 }}>
              <span style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.92)', color: '#02402e', fontSize: 11.5, fontWeight: 600, padding: '5px 12px', borderRadius: 20 }}>{b.category}</span>
              <span className="msym" style={{ fontSize: 38, color: 'rgba(255,255,255,0.35)' }}>{b.icon}</span>
            </div>
            {/* Content */}
            <div style={{ padding: 18 }}>
              <h3 style={{ fontSize: 16.5, fontWeight: 600, margin: '0 0 12px', lineHeight: 1.4, color: '#231f20' }}>{b.title}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 11.5, color: '#94a3b8' }}>{b.date} · {b.read}</span>
                <span style={{ color: '#048c73', fontSize: 13, fontWeight: 600 }}>อ่านต่อ →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .sm-blog-card:hover {
          box-shadow: 0 16px 34px -12px rgba(2,64,46,0.18) !important;
          transform: translateY(-4px) !important;
        }
        @media (max-width: 900px) {
          .sm-grid3 { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 600px) {
          .sm-grid3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
