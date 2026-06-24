import Image from 'next/image'
import { getWPPosts, getPostImage, getPostCategory, getPostTitle, formatThaiDate } from '@/lib/wordpress'

// Gradient fallbacks per post position
const FALLBACK_GRADS = [
  'linear-gradient(135deg,#02402e,#048c73)',
  'linear-gradient(135deg,#1a4a5a,#2d7d9a)',
  'linear-gradient(135deg,#3d2c6e,#6b4fa0)',
]

export default async function BlogSection() {
  const posts = await getWPPosts(3)

  return (
    <section style={{ maxWidth: 1240, margin: '0 auto', padding: '8px 24px 56px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 600, margin: '0 0 6px', letterSpacing: '-0.4px', color: '#02402e' }}>บทความล่าสุด</h2>
          <p style={{ color: '#64748b', fontSize: 15, margin: 0, fontWeight: 300 }}>เคล็ดลับ คู่มือ และข้อมูลตลาดเช่า-ขายอสังหาฯ</p>
        </div>
        <a href="https://spacesmate.com/blog/" target="_blank" rel="noopener noreferrer" style={{ color: '#048c73', fontWeight: 600, fontSize: 14.5, textDecoration: 'none' }}>ดูบทความทั้งหมด →</a>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }} className="sm-grid3">
        {posts.map((b, i) => {
          const img      = getPostImage(b)
          const title    = getPostTitle(b)
          const category = getPostCategory(b)
          const date     = formatThaiDate(b.date)
          const grad     = FALLBACK_GRADS[i % FALLBACK_GRADS.length]

          return (
            <a
              key={b.id}
              href={b.link}
              target="_blank"
              rel="noopener noreferrer"
              className="sm-blog-card"
              style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', transition: 'all .25s', boxShadow: '0 6px 20px -10px rgba(2,64,46,0.10)', display: 'block', textDecoration: 'none' }}
            >
              {/* Image area */}
              <div style={{ height: 170, background: grad, position: 'relative', overflow: 'hidden' }}>
                {img ? (
                  <Image
                    src={img}
                    alt={title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="msym" style={{ fontSize: 38, color: 'rgba(255,255,255,0.35)' }}>article</span>
                  </div>
                )}
                <span style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.92)', color: '#02402e', fontSize: 11.5, fontWeight: 600, padding: '5px 12px', borderRadius: 20, zIndex: 1 }}>{category}</span>
              </div>

              {/* Content */}
              <div style={{ padding: 18 }}>
                <h3 style={{ fontSize: 16.5, fontWeight: 600, margin: '0 0 12px', lineHeight: 1.4, color: '#231f20', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{title}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mono" style={{ fontSize: 11.5, color: '#94a3b8' }}>{date}</span>
                  <span style={{ color: '#048c73', fontSize: 13, fontWeight: 600 }}>อ่านต่อ →</span>
                </div>
              </div>
            </a>
          )
        })}
      </div>

      <style>{`
        .sm-blog-card:hover { box-shadow: 0 16px 34px -12px rgba(2,64,46,0.18) !important; transform: translateY(-4px) !important; }
        @media (max-width: 900px) { .sm-grid3 { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 600px) { .sm-grid3 { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
