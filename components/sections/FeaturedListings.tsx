import Link from 'next/link'
import Image from 'next/image'
import { getWPProperties, getPropMeta, getPropImage, getPropTitle } from '@/lib/wordpress'

export default async function FeaturedListings() {
  const properties = await getWPProperties(6)

  // Fair Rotation — shuffle on every server render
  const shuffled = [...properties].sort(() => Math.random() - 0.5)

  return (
    <section style={{ maxWidth: 1240, margin: '0 auto', padding: '8px 24px 56px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 600, margin: '0 0 6px', letterSpacing: '-0.4px', color: '#02402e' }}>ที่พักแนะนำ</h2>
          <p style={{ color: '#64748b', fontSize: 15, margin: 0, fontWeight: 300 }}>คัดเลือกจากประกาศที่ผ่านการยืนยันล่าสุด · อัปเดตทุก Refresh</p>
        </div>
        <a href="https://spacesmate.com/property/" style={{ color: '#048c73', fontWeight: 600, fontSize: 14.5, textDecoration: 'none' }}>ดูทั้งหมด →</a>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }} className="sm-grid3">
        {shuffled.length > 0 ? shuffled.map(p => {
          const meta = getPropMeta(p)
          const img  = getPropImage(p)
          const title = getPropTitle(p)
          const price = meta.price ? `฿${parseInt(meta.price).toLocaleString()}/เดือน` : 'TBD'

          return (
            <a
              key={p.id}
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="sm-prop-card"
              style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', transition: 'all .25s', boxShadow: '0 6px 20px -10px rgba(2,64,46,0.10)', display: 'block', textDecoration: 'none' }}
            >
              {/* Image */}
              <div style={{ height: 195, position: 'relative', background: 'linear-gradient(135deg,#02402e,#048c73)', overflow: 'hidden' }}>
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
                    <span className="msym" style={{ fontSize: 42, color: 'rgba(255,255,255,0.3)' }}>apartment</span>
                  </div>
                )}
                <span style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.92)', color: '#02402e', fontSize: 11, fontWeight: 700, padding: '5px 11px', borderRadius: 20 }}>ยืนยันแล้ว ✓</span>
              </div>

              {/* Content */}
              <div style={{ padding: '16px 18px 18px' }}>
                <h3 style={{ fontSize: 15.5, fontWeight: 600, margin: '0 0 7px', lineHeight: 1.4, color: '#231f20', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{title}</h3>
                {meta.address && (
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 10px', fontWeight: 300, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>📍 {meta.address}</p>
                )}

                {/* Stats row */}
                {(meta.bedrooms || meta.bathrooms || meta.size) && (
                  <div style={{ display: 'flex', gap: 12, margin: '0 0 12px', flexWrap: 'wrap' }}>
                    {meta.bedrooms  && <span style={{ fontSize: 12.5, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}><span className="msym" style={{ fontSize: 15, color: '#048c73' }}>bed</span>{meta.bedrooms} นอน</span>}
                    {meta.bathrooms && <span style={{ fontSize: 12.5, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}><span className="msym" style={{ fontSize: 15, color: '#048c73' }}>bathtub</span>{meta.bathrooms} น้ำ</span>}
                    {meta.size      && <span style={{ fontSize: 12.5, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}><span className="msym" style={{ fontSize: 15, color: '#048c73' }}>square_foot</span>{meta.size} ตร.ม.</span>}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: '#d97f11' }}>{price}</span>
                  <span style={{ color: '#048c73', fontSize: 13, fontWeight: 600 }}>ดูรายละเอียด →</span>
                </div>
              </div>
            </a>
          )
        }) : (
          /* Skeleton when WP is unreachable */
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden' }}>
              <div style={{ height: 195, background: 'linear-gradient(135deg,rgba(2,64,46,0.10),rgba(4,140,115,0.10))' }} />
              <div style={{ padding: 18 }}>
                <div style={{ height: 16, background: '#f0f0f0', borderRadius: 8, marginBottom: 8, width: '80%' }} />
                <div style={{ height: 13, background: '#f0f0f0', borderRadius: 8, width: '55%' }} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fair Rotation note */}
      <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
        🔄 ระบบ Fair Rotation — ที่พักแนะนำจะเปลี่ยนทุกครั้งที่โหลดหน้า เพื่อให้ทุกประกาศได้รับโอกาสเท่าเทียมกัน
      </p>

      <style>{`
        .sm-prop-card:hover { box-shadow: 0 16px 34px -12px rgba(2,64,46,0.18) !important; transform: translateY(-4px) !important; }
        @media (max-width: 900px) { .sm-grid3 { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 600px) { .sm-grid3 { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
