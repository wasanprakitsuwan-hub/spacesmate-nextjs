import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase'
import type { Metadata } from 'next'

interface Props { params: { slug: string } }

const GRADS: Record<string, string> = {
  apartment: 'linear-gradient(135deg,#02402e,#036b56)',
  condo:     'linear-gradient(135deg,#03533c,#048c73)',
  house:     'linear-gradient(135deg,#036b56,#06a487)',
  coworking: 'linear-gradient(135deg,#1e3a5f,#2d6a9f)',
  office:    'linear-gradient(135deg,#4a1d1d,#8b3a3a)',
  default:   'linear-gradient(135deg,#02402e,#048c73)',
}
const TYPE_LABELS: Record<string, string> = {
  apartment:'อพาร์ทเม้นท์', condo:'คอนโด', house:'บ้าน', coworking:'โคเวิร์กกิ้ง', office:'ออฟฟิศ',
}

async function getProp(slug: string) {
  try {
    const sb = createServerClient()
    const { data } = await sb.from('properties')
      .select('*').or(`id.eq.${slug},slug.eq.${slug}`).eq('listing_status','active').single()
    return data
  } catch { return null }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProp(params.slug)
  if (!p) return { title: 'ไม่พบประกาศ' }
  return {
    title: p.title,
    description: p.description?.slice(0, 155) || 'รายละเอียดที่พัก SpacesMate',
  }
}

export default async function PropertyDetailPage({ params }: Props) {
  const p = await getProp(params.slug)
  if (!p) notFound()

  const grad = GRADS[p.property_type] || GRADS.default
  const typeLabel = TYPE_LABELS[p.property_type] || p.property_type
  const priceRange = p.price_min && p.price_max
    ? `฿${p.price_min.toLocaleString()}–${p.price_max.toLocaleString()}/เดือน`
    : p.price_min ? `฿${p.price_min.toLocaleString()}+/เดือน` : 'TBD'

  const stats = [
    p.bedrooms != null  && { icon: 'bed',          value: `${p.bedrooms} ห้องนอน` },
    p.bathrooms != null && { icon: 'bathtub',       value: `${p.bathrooms} ห้องน้ำ` },
    p.size_sqm != null  && { icon: 'square_foot',   value: `${p.size_sqm} ตร.ม.` },
    p.floor != null     && { icon: 'stairs',         value: `ชั้น ${p.floor}` },
  ].filter(Boolean) as { icon: string; value: string }[]

  const amenities = (p.amenities || []).map((a: string) => {
    const icons: Record<string,string> = { wifi:'wifi', parking:'local_parking', air:'ac_unit', furnished:'chair', laundry:'local_laundry_service', security:'security', pool:'pool', gym:'fitness_center' }
    return { icon: icons[a] || 'check_circle', label: a }
  })

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 24px 60px' }}>
      {/* Breadcrumb */}
      <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 16px', cursor: 'pointer' }}>
        <Link href="/search" style={{ color: '#94a3b8' }}>ค้นหา</Link> › {typeLabel} › {p.district || p.area || ''}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 356px', gap: 30 }} className="sm-detaillayout">

        {/* Left col */}
        <div>
          {/* Hero image */}
          <div style={{ height: 410, borderRadius: 20, background: grad, position: 'relative', overflow: 'hidden' }}>
            <span style={{ position: 'absolute', top: 16, left: 16, background: '#048c73', color: '#fff', fontSize: 12.5, fontWeight: 600, padding: '7px 14px', borderRadius: 10 }}>ยืนยันแล้ว ✓</span>
            <span style={{ position: 'absolute', top: 16, right: 16, fontSize: 12, fontWeight: 500, color: '#fff', background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: 9 }}>{typeLabel}</span>
            <span className="mono" style={{ position: 'absolute', bottom: 16, right: 16, fontSize: 11, color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.3)', padding: '6px 11px', borderRadius: 8 }}>1 / 5</span>
          </div>

          {/* Thumbnails */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 11, marginTop: 11 }}>
            {[
              'linear-gradient(135deg,#03533c,#048c73)',
              'linear-gradient(135deg,#02402e,#036b56)',
              'linear-gradient(135deg,#036b56,#04a385)',
              'linear-gradient(135deg,#02402e,#048c73)',
            ].map((g, i) => (
              <div key={i} style={{ height: 80, borderRadius: 12, background: g, cursor: 'pointer', border: i === 0 ? '2px solid #d97f11' : 'none', opacity: i === 0 ? 1 : 0.85 }} />
            ))}
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 27, fontWeight: 600, margin: '26px 0 6px', letterSpacing: '-0.4px', color: '#02402e' }}>{p.title}</h1>
          <p style={{ color: '#64748b', fontSize: 14.5, margin: '0 0 4px' }}>📍 {p.district}{p.area ? `, ${p.area}` : ''}</p>
          {p.address && <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 22px', fontWeight: 300 }}>{p.address}</p>}

          {/* Stats */}
          {stats.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length},1fr)`, gap: 13, marginBottom: 28 }}>
              {stats.map(st => (
                <div key={st.icon} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 14, padding: 17, textAlign: 'center' }}>
                  <div style={{ marginBottom: 9 }}>
                    <span style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(140deg,#eaf6f1,#dcefe8)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="msym" style={{ fontSize: 23, color: '#048c73' }}>{st.icon}</span>
                    </span>
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 600 }}>{st.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <h2 style={{ fontSize: 19, fontWeight: 600, margin: '0 0 12px' }}>รายละเอียด</h2>
          <p style={{ color: '#475569', fontSize: 15, lineHeight: 1.75, margin: '0 0 28px', fontWeight: 300 }}>{p.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>

          {/* Amenities */}
          {amenities.length > 0 && (
            <>
              <h2 style={{ fontSize: 19, fontWeight: 600, margin: '0 0 13px' }}>สิ่งอำนวยความสะดวก</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
                {amenities.map(a => (
                  <span key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #eef0ef', borderRadius: 12, padding: '10px 15px', fontSize: 13.5, color: '#334155', fontWeight: 500 }}>
                    <span className="msym" style={{ fontSize: 19, color: '#048c73' }}>{a.icon}</span> {a.label}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Map */}
          <h2 style={{ fontSize: 19, fontWeight: 600, margin: '0 0 13px' }}>ทำเลที่ตั้ง</h2>
          <div style={{ height: 230, borderRadius: 16, border: '2px solid #048c73', background: 'repeating-linear-gradient(45deg,#ecf5f2,#ecf5f2 14px,#e2f0eb 14px,#e2f0eb 28px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <a
              href={p.lat && p.lng ? `https://maps.google.com/?q=${p.lat},${p.lng}` : 'https://maps.google.com'}
              target="_blank" rel="noopener noreferrer"
              style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 600, color: '#048c73', boxShadow: '0 4px 14px -4px rgba(2,64,46,0.15)', textDecoration: 'none' }}
            >
              📍 ดูบนแผนที่ Google Maps
            </a>
          </div>
        </div>

        {/* Right sidebar */}
        <aside style={{ alignSelf: 'start', position: 'sticky', top: 86 }}>
          <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 20, padding: 24, boxShadow: '0 14px 34px -14px rgba(2,64,46,0.14)' }}>
            <div style={{ fontSize: 12.5, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>ราคาเช่าต่อเดือน</div>
            <div className="mono" style={{ fontSize: 30, fontWeight: 600, color: '#d97f11', marginBottom: 22, lineHeight: 1.1 }}>{priceRange}</div>

            {/* Agent */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '15px 0', borderTop: '1px solid #f3f5f4', borderBottom: '1px solid #f3f5f4', marginBottom: 18 }}>
              <span style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#02402e,#048c73)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 17 }}>S</span>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>SpacesMate Agent</div>
                <div style={{ fontSize: 12, color: '#048c73', fontWeight: 500 }}>ยืนยันตัวตนแล้ว ✓</div>
              </div>
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <a href="tel:0823535558"
                style={{ background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 14.5, padding: '13px 0', borderRadius: 24, textAlign: 'center', cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}
                onMouseEnter={undefined}>
                <span className="msym" style={{ fontSize: 19 }}>call</span>โทรเลย
              </a>
              <a href="https://line.me/R/ti/p/@spacesmate" target="_blank" rel="noopener noreferrer"
                style={{ background: '#048c73', color: '#fff', fontWeight: 600, fontSize: 14.5, padding: '13px 0', borderRadius: 24, textAlign: 'center', cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
                <span className="msym" style={{ fontSize: 19 }}>chat</span>แชทผ่าน LINE
              </a>
            </div>
          </div>
          <p className="mono" style={{ textAlign: 'center', fontSize: 11.5, color: '#94a3b8', margin: '13px 0 0' }}>
            {p.id?.slice(0,8).toUpperCase()} · อัปเดตล่าสุด
          </p>
        </aside>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .sm-detaillayout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
