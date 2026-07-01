import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AREA_KEYWORDS } from '@/lib/constants'
import { properties } from '@/lib/property-data'

interface Props { params: { slug: string } }

// Map area slug → property matching terms
const AREA_MATCH: Record<string, { type: string; terms: string[] }> = {
  'condo-rent-bts-asok':            { type: 'Condo',      terms: ['asok','อโศก','sukhumvit 21','สุขุมวิท 21'] },
  'apartment-rent-sukhumvit':       { type: 'Apartment',  terms: ['sukhumvit','สุขุมวิท'] },
  'condo-rent-bts-ekkamai':         { type: 'Condo',      terms: ['ekkamai','เอกมัย'] },
  'house-rent-lat-phrao':           { type: 'Apartment',  terms: ['lat phrao','ลาดพร้าว'] },
  'condo-rent-bts-thonglor':        { type: 'Condo',      terms: ['thonglor','ทองหล่อ','thong lor'] },
  'office-rent-silom':              { type: 'Office',     terms: ['silom','สีลม'] },
  'condo-rent-bts-on-nut':          { type: 'Condo',      terms: ['on nut','อ่อนนุช','on-nut'] },
  'apartment-rent-ratchada':        { type: 'Apartment',  terms: ['ratchada','รัชดา','ratchadaphisek'] },
  'house-rent-rama-9':              { type: 'Apartment',  terms: ['rama 9','พระราม 9','rama9'] },
  'condo-rent-mrt-lat-phrao':       { type: 'Condo',      terms: ['lat phrao','ลาดพร้าว'] },
  'coworking-rent-sukhumvit':       { type: 'Co-Working', terms: ['sukhumvit','สุขุมวิท'] },
  'condo-rent-bts-saphan-kwai':     { type: 'Condo',      terms: ['saphan kwai','สะพานควาย'] },
  'condo-rent-bts-ari':             { type: 'Condo',      terms: ['ari','อารีย์','aree'] },
  'apartment-rent-bang-na':         { type: 'Apartment',  terms: ['bang na','บางนา','bangna'] },
  'condo-rent-mrt-phahon-yothin':   { type: 'Condo',      terms: ['phahon','พหลโยธิน','phahonyothin'] },
  'office-rent-sathorn':            { type: 'Office',     terms: ['sathorn','สาทร'] },
}

export async function generateStaticParams() {
  return AREA_KEYWORDS.map(a => ({ slug: a.slug }))
}
export const dynamicParams = true

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const area = AREA_KEYWORDS.find(a => a.slug === params.slug)
  if (!area) return { title: 'ไม่พบหน้า | SpacesMate' }
  return {
    title: `${area.label_en} | SpacesMate`,
    description: `${area.label_th} ในกรุงเทพมหานคร — ดูรายการที่พักและราคาที่ SpacesMate`,
    openGraph: { title: `${area.label_en} | SpacesMate`, type: 'website' },
  }
}

const TYPE_LABELS: Record<string, string> = {
  Apartment: 'อพาร์ทเม้นท์', Condo: 'คอนโดมิเนียม', Office: 'ออฟฟิศ', 'Co-Working': 'โคเวิร์กกิ้ง',
}
const GRADS: Record<string, string> = {
  Apartment: 'linear-gradient(135deg,#02402e,#036b56)',
  Condo:     'linear-gradient(135deg,#036b56,#048c73)',
  Office:    'linear-gradient(135deg,#4a1d1d,#8b3a3a)',
  'Co-Working': 'linear-gradient(135deg,#02402e,#048c73)',
  default:   'linear-gradient(135deg,#02402e,#048c73)',
}

export default function AreaPage({ params }: Props) {
  const area = AREA_KEYWORDS.find(a => a.slug === params.slug)
  if (!area) notFound()

  const match = AREA_MATCH[params.slug]
  const areaProps = match
    ? properties.filter(p => {
        if (p.propertyType !== match.type) return false
        const h = [p.neighborhood, p.address].join(' ').toLowerCase()
        return match.terms.some(t => h.includes(t.toLowerCase()))
      })
    : []

  // Related areas (same property type)
  const related = AREA_KEYWORDS
    .filter(a => a.slug !== params.slug && a.property_type === area.property_type)
    .slice(0, 4)

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#02402e,#048c73)', padding: '52px 24px 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>หน้าแรก</Link>
            <span>/</span>
            <Link href="/search" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>ค้นหาที่พัก</Link>
            <span>/</span>
            <span style={{ color: '#fff' }}>{area.label_th}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 700, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.3px' }}>
            {area.label_th}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, margin: '0 0 24px', fontWeight: 300 }}>
            {area.label_en} — กรุงเทพมหานคร ประเทศไทย
          </p>
          <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 13, fontWeight: 500, padding: '7px 16px', borderRadius: 20, backdropFilter: 'blur(6px)' }}>
            {areaProps.length > 0 ? `${areaProps.length} ประกาศ` : 'ทำเลยอดนิยม'}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 72px' }}>

        {/* Listings */}
        {areaProps.length > 0 ? (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#02402e', margin: '0 0 24px' }}>
              ประกาศในทำเล{area.label_th}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 48 }} className="sm-area-grid">
              {areaProps.map(p => {
                const grad = GRADS[p.propertyType] || GRADS.default
                return (
                  <Link key={p.slug} href={`/property/${p.slug}`}
                    style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', display: 'block', textDecoration: 'none', transition: 'all .25s', boxShadow: '0 6px 20px -10px rgba(2,64,46,0.10)' }}
                    className="sm-area-card">
                    <div style={{ height: 160, background: grad, position: 'relative', overflow: 'hidden' }}>
                      {p.image && <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' }} className="sm-area-img" />}
                      <span style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 11, color: 'rgba(255,255,255,0.9)', background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(4px)', padding: '3px 9px', borderRadius: 6 }}>
                        {TYPE_LABELS[p.propertyType] || p.propertyType}
                      </span>
                    </div>
                    <div style={{ padding: '14px 16px' }}>
                      <p style={{ color: '#048c73', fontSize: 12, margin: '0 0 4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}><span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>location_on</span>{p.neighborhood}</p>
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#231f20', margin: '0 0 8px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 15.5, fontWeight: 700, color: '#d97f11' }}>{p.priceDisplay}</span>
                        <span style={{ color: '#048c73', fontSize: 12, fontWeight: 600 }}>ดูรายละเอียด →</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        ) : (
          <div style={{ padding: '56px 24px', textAlign: 'center', background: '#f7f9f8', borderRadius: 20, marginBottom: 48 }}>
            <p style={{ margin: '0 0 12px' }}><span className="msym" style={{ fontSize: 32, color: '#94a3b8', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>search</span></p>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 8px' }}>ยังไม่มีประกาศในทำเลนี้</h2>
            <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px', fontWeight: 300 }}>
              ทำเล{area.label_th}กำลังเพิ่มจำนวนประกาศ ลองค้นหาทำเลใกล้เคียง
            </p>
            <Link href="/search" style={{ background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 14, padding: '12px 28px', borderRadius: 24, textDecoration: 'none', display: 'inline-block' }}>
              ดูประกาศทั้งหมด
            </Link>
          </div>
        )}

        {/* Area info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, marginBottom: 48 }} className="sm-area-layout">
          <div style={{ background: '#f7f9f8', borderRadius: 20, padding: '28px 28px' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 14px' }}>
              ทำไมถึงนิยมเช่าในย่าน{area.label_th.replace('เช่า','').replace('คอนโด','').replace('อพาร์ทเม้นท์','').replace('บ้าน','').replace('ออฟฟิศ','').replace('โคเวิร์กกิ้ง','').trim()}?
            </h2>
            <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.8, margin: '0 0 16px', fontWeight: 300 }}>
              ทำเลนี้เป็นหนึ่งในทำเลที่มีความต้องการสูงในกรุงเทพมหานคร
              {area.station && ` สถานี ${area.station} เชื่อมต่อระบบขนส่งสาธารณะอย่างสะดวก`}
              {area.district && ` ย่าน${area.district} มีสิ่งอำนวยความสะดวกครบครัน ทั้งห้างสรรพสินค้า ร้านอาหาร และสถานที่ทำงาน`}
            </p>
            <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.8, margin: 0, fontWeight: 300 }}>
              SpacesMate คัดสรรประกาศที่ผ่านการตรวจสอบแล้วสำหรับทำเลนี้
              เพื่อให้คุณพบที่พักที่ตรงความต้องการได้อย่างรวดเร็ว
            </p>
          </div>
          <div style={{ background: '#02402e', borderRadius: 20, padding: '28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>มีทรัพย์สินในย่านนี้?</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6, fontWeight: 300 }}>
              ลงประกาศหรือฝากบริหารกับ SpacesMate เข้าถึงผู้เช่าหลายพันคน
            </p>
            <Link href="/submit" style={{ background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 13.5, padding: '12px 0', borderRadius: 22, textAlign: 'center', textDecoration: 'none', display: 'block' }}>
              ลงประกาศ ฿299
            </Link>
            <Link href="/manage" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, fontSize: 13, padding: '10px 0', borderRadius: 22, textAlign: 'center', textDecoration: 'none', display: 'block', border: '1px solid rgba(255,255,255,0.25)' }}>
              ฝากบริหาร A–Z
            </Link>
          </div>
        </div>

        {/* Related areas */}
        {related.length > 0 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 16px' }}>ทำเลใกล้เคียงที่น่าสนใจ</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }} className="sm-related4">
              {related.map(r => (
                <Link key={r.slug} href={`/area/${r.slug}`}
                  style={{ padding: '14px 16px', background: '#f7f9f8', border: '1px solid #eef0ef', borderRadius: 14, textDecoration: 'none', display: 'block', transition: 'all .2s' }}
                  className="sm-area-related">
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: '#02402e', margin: '0 0 4px' }}>{r.label_th}</p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{r.label_en}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .sm-area-grid { }
        @media (max-width: 900px) {
          .sm-area-grid { grid-template-columns: repeat(2,1fr) !important; }
          .sm-area-layout { grid-template-columns: 1fr !important; }
          .sm-related4 { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 600px) {
          .sm-area-grid { grid-template-columns: 1fr !important; }
          .sm-related4 { grid-template-columns: 1fr !important; }
        }
        .sm-area-card:hover { box-shadow: 0 16px 34px -12px rgba(2,64,46,0.18) !important; transform: translateY(-4px) !important; }
        .sm-area-card:hover .sm-area-img { transform: scale(1.06) !important; }
        .sm-area-related:hover { border-color: #048c73 !important; background: #eaf6f1 !important; }
      `}</style>
    </div>
  )
}
