'use client'

import { useState } from 'react'

interface BlogPost {
  id: string
  title: string
  slug: string
  category: string
  status: 'published' | 'draft' | 'review'
  seoScore: number
  views: number
  date: string
  author: string
}

const MOCK_POSTS: BlogPost[] = [
  { id: '1', title: 'วิธีหาอพาร์ทเม้นท์ในกรุงเทพฯ สำหรับชาวต่างชาติ', slug: 'find-apartment-bangkok-expats', category: 'คู่มือผู้เช่า', status: 'published', seoScore: 87, views: 1240, date: '2026-06-10', author: 'SpacesMate' },
  { id: '2', title: '5 ทำเลทองสำหรับลงทุนอสังหาริมทรัพย์กรุงเทพฯ 2026', slug: 'bangkok-investment-locations-2026', category: 'ความรู้การลงทุน', status: 'published', seoScore: 92, views: 3410, date: '2026-05-28', author: 'SpacesMate' },
  { id: '3', title: 'SpacesMate คืออะไร? แพลตฟอร์มบริหารทรัพย์สินแบบ Asset-Light', slug: 'what-is-spacesmate', category: 'เกี่ยวกับเรา', status: 'published', seoScore: 78, views: 890, date: '2026-05-15', author: 'SpacesMate' },
  { id: '4', title: 'PropTech Trends ที่น่าจับตาในไทย 2026', slug: 'proptech-trends-thailand-2026', category: 'PropTech', status: 'draft', seoScore: 45, views: 0, date: '2026-06-20', author: 'SpacesMate' },
  { id: '5', title: 'ข้อดีของการเช่าคอนโดแทนการซื้อในกรุงเทพฯ', slug: 'rent-vs-buy-condo-bangkok', category: 'คู่มือผู้เช่า', status: 'review', seoScore: 65, views: 0, date: '2026-06-18', author: 'SpacesMate' },
]

const STATUS_MAP = {
  published: { bg: '#dcfce7', color: '#15803d', label: 'เผยแพร่แล้ว' },
  draft:     { bg: '#f1f5f9', color: '#64748b', label: 'แบบร่าง' },
  review:    { bg: '#fef9c3', color: '#a16207', label: 'รอตรวจสอบ' },
}

function SeoBar({ score }: { score: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#d97f11' : '#ef4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: '#f0f2f1', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 4 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 28 }}>{score}</span>
    </div>
  )
}

export default function BlogPage() {
  const [posts] = useState<BlogPost[]>(MOCK_POSTS)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')

  const displayed = posts.filter(p => {
    if (filter && p.status !== filter) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const published = posts.filter(p => p.status === 'published').length
  const totalViews = posts.reduce((s, p) => s + p.views, 0)
  const avgSeo = Math.round(posts.reduce((s, p) => s + p.seoScore, 0) / posts.length)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 3px', color: '#02402e' }}>บทความ</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>จัดการบล็อกและ SEO ของ spacesmate.com</p>
        </div>
        <button style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}>
          + เพิ่มบทความใหม่
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 22 }}>
        {[
          { label: 'เผยแพร่แล้ว', value: published, icon: '📄', bg: '#dcfce7', color: '#15803d' },
          { label: 'ยอดวิวทั้งหมด', value: totalViews.toLocaleString(), icon: '👁', bg: '#e0f2f9', color: '#0284c7' },
          { label: 'SEO Score เฉลี่ย', value: `${avgSeo}/100`, icon: '🔍', bg: '#e8f5f0', color: '#048c73' },
          { label: 'บทความทั้งหมด', value: posts.length, icon: '📝', bg: '#fff6e9', color: '#d97f11' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 38, height: 38, borderRadius: 10, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19 }}>{k.icon}</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#02402e', lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 3 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[{ v: '', l: 'ทั้งหมด' }, { v: 'published', l: 'เผยแพร่' }, { v: 'draft', l: 'แบบร่าง' }, { v: 'review', l: 'รอตรวจ' }].map(o => (
            <button key={o.v} onClick={() => setFilter(o.v)} style={{
              padding: '7px 15px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 500,
              background: filter === o.v ? '#02402e' : '#f4f6f5', color: filter === o.v ? '#fff' : '#334155',
            }}>{o.l}</button>
          ))}
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 ค้นหาบทความ"
          style={{ flex: 1, minWidth: 200, padding: '8px 14px', borderRadius: 10, border: '1px solid #eef0ef', fontSize: 13, outline: 'none' }}
        />
      </div>

      {/* Post list */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 20px -12px rgba(2,64,46,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eef0ef' }}>
              {['บทความ', 'หมวดหมู่', 'สถานะ', 'SEO Score', 'ยอดวิว', 'วันที่', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((post, i) => {
              const s = STATUS_MAP[post.status]
              return (
                <tr key={post.id} style={{ borderBottom: i < displayed.length - 1 ? '1px solid #f1f5f4' : 'none' }}>
                  <td style={{ padding: '14px 16px', maxWidth: 300 }}>
                    <div style={{ fontWeight: 600, color: '#02402e', lineHeight: 1.35, marginBottom: 3 }}>{post.title}</div>
                    <div style={{ fontSize: 11.5, color: '#94a3b8' }}>/{post.slug}</div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b', fontSize: 13 }}>{post.category}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>
                  </td>
                  <td style={{ padding: '14px 16px', minWidth: 120 }}><SeoBar score={post.seoScore} /></td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#02402e' }}>{post.views > 0 ? post.views.toLocaleString() : '—'}</td>
                  <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: 12.5, whiteSpace: 'nowrap' }}>
                    {new Date(post.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #eef0ef', background: '#fff', color: '#02402e', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>แก้ไข</button>
                      {post.status === 'draft' && (
                        <button style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#02402e', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>เผยแพร่</button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {displayed.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>ไม่พบบทความ</div>
        )}
      </div>

      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 14, textAlign: 'center' }}>
        * ข้อมูลบทความจาก mock data — เชื่อมต่อ WordPress API เพื่อดึงข้อมูลจริง
      </p>
    </div>
  )
}
