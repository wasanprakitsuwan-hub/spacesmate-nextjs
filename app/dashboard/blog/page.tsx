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
  content?: string
  metaTitle?: string
  metaDesc?: string
}

const CATEGORIES = ['คู่มือผู้เช่า', 'ความรู้การลงทุน', 'เกี่ยวกับเรา', 'PropTech', 'ทำเลน่าอยู่', 'เจ้าของทรัพย์']

const MOCK_POSTS: BlogPost[] = [
  { id: '1', title: 'วิธีหาอพาร์ทเม้นท์ในกรุงเทพฯ สำหรับชาวต่างชาติ', slug: 'find-apartment-bangkok-expats', category: 'คู่มือผู้เช่า', status: 'published', seoScore: 87, views: 1240, date: '2026-06-10', author: 'SpacesMate', content: '', metaTitle: 'วิธีหาอพาร์ทเม้นท์กรุงเทพ สำหรับชาวต่างชาติ | SpacesMate', metaDesc: 'คู่มือครบถ้วนสำหรับชาวต่างชาติที่ต้องการหาอพาร์ทเม้นท์ในกรุงเทพฯ ทำเล ราคา และขั้นตอนเช่า' },
  { id: '2', title: '5 ทำเลทองสำหรับลงทุนอสังหาริมทรัพย์กรุงเทพฯ 2026', slug: 'bangkok-investment-locations-2026', category: 'ความรู้การลงทุน', status: 'published', seoScore: 92, views: 3410, date: '2026-05-28', author: 'SpacesMate', content: '', metaTitle: '5 ทำเลลงทุนอสังหาฯ กรุงเทพ 2026 | SpacesMate', metaDesc: 'วิเคราะห์ 5 ทำเลทองในกรุงเทพที่น่าลงทุนปี 2026 พร้อมข้อมูลราคาเช่าและ Yield' },
  { id: '3', title: 'SpacesMate คืออะไร? แพลตฟอร์มบริหารทรัพย์สินแบบ Asset-Light', slug: 'what-is-spacesmate', category: 'เกี่ยวกับเรา', status: 'published', seoScore: 78, views: 890, date: '2026-05-15', author: 'SpacesMate', content: '' },
  { id: '4', title: 'PropTech Trends ที่น่าจับตาในไทย 2026', slug: 'proptech-trends-thailand-2026', category: 'PropTech', status: 'draft', seoScore: 45, views: 0, date: '2026-06-20', author: 'SpacesMate', content: '' },
  { id: '5', title: 'ข้อดีของการเช่าคอนโดแทนการซื้อในกรุงเทพฯ', slug: 'rent-vs-buy-condo-bangkok', category: 'คู่มือผู้เช่า', status: 'review', seoScore: 65, views: 0, date: '2026-06-18', author: 'SpacesMate', content: '' },
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

// ── Edit Drawer ───────────────────────────────────────────────────────────────
function EditDrawer({ post, onClose, onSave }: {
  post: BlogPost
  onClose: () => void
  onSave: (updated: BlogPost) => void
}) {
  const [form, setForm] = useState<BlogPost>({ ...post })
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content')

  function set(k: keyof BlogPost, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function handleSave() {
    onSave(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 11,
    border: '1px solid #e2e8f0', fontSize: 14, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit', color: '#02402e',
  }
  const labelStyle: React.CSSProperties = { fontSize: 12.5, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(2,64,46,0.18)', zIndex: 100, backdropFilter: 'blur(2px)' }} />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 580,
        background: '#fff', zIndex: 101, display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(2,64,46,0.12)',
      }}>

        {/* Header */}
        <div style={{ padding: '20px 26px', borderBottom: '1px solid #eef0ef', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#02402e' }}>แก้ไขบทความ</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>/{form.slug}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select
              value={form.status}
              onChange={e => set('status', e.target.value)}
              style={{ padding: '7px 12px', borderRadius: 9, border: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit', color: '#02402e', background: '#fff', cursor: 'pointer' }}
            >
              <option value="draft">แบบร่าง</option>
              <option value="review">รอตรวจสอบ</option>
              <option value="published">เผยแพร่</option>
            </select>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
              <span className="msym" style={{ fontSize: 22, color: '#94a3b8', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>close</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #eef0ef', padding: '0 26px', flexShrink: 0 }}>
          {([['content','เนื้อหา'],['seo','SEO']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setActiveTab(k)} style={{
              padding: '11px 18px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit',
              color: activeTab === k ? '#02402e' : '#94a3b8',
              borderBottom: activeTab === k ? '2px solid #02402e' : '2px solid transparent',
              marginBottom: -1,
            }}>{l}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {activeTab === 'content' && (
            <>
              <div>
                <label style={labelStyle}>หัวข้อบทความ (TH)</label>
                <input value={form.title} onChange={e => set('title', e.target.value)} style={inputStyle} placeholder="ชื่อบทความภาษาไทย" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Slug (URL)</label>
                  <input value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} style={inputStyle} placeholder="my-article-slug" />
                </div>
                <div>
                  <label style={labelStyle}>หมวดหมู่</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)}
                    style={{ ...inputStyle, appearance: 'none', backgroundImage: 'none', cursor: 'pointer' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>เนื้อหาบทความ (HTML หรือ Markdown)</label>
                <textarea
                  value={form.content ?? ''}
                  onChange={e => set('content', e.target.value)}
                  rows={16}
                  placeholder="วางเนื้อหาบทความที่นี่... รองรับ HTML และ Markdown&#10;&#10;เช่น:&#10;## หัวข้อ&#10;เนื้อหาย่อหน้าแรก..."
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7, fontSize: 13.5 }}
                />
              </div>

              <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 11, fontSize: 12.5, color: '#64748b', lineHeight: 1.6 }}>
                <span className="msym" style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 6, color: '#048c73', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>info</span>
                บทความจะเผยแพร่บน spacesmate.com/blog/{form.slug} — เชื่อมต่อ WordPress API เพื่อ sync อัตโนมัติ
              </div>
            </>
          )}

          {activeTab === 'seo' && (
            <>
              <div>
                <label style={labelStyle}>Meta Title (สำหรับ Google)</label>
                <input value={form.metaTitle ?? ''} onChange={e => set('metaTitle', e.target.value)} style={inputStyle} placeholder="ชื่อหน้าใน Search Engine | SpacesMate" />
                <div style={{ fontSize: 11.5, color: form.metaTitle && form.metaTitle.length > 60 ? '#ef4444' : '#94a3b8', marginTop: 4 }}>
                  {(form.metaTitle ?? '').length}/60 ตัวอักษร {form.metaTitle && form.metaTitle.length > 60 ? '— ยาวเกินไป' : ''}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Meta Description</label>
                <textarea
                  value={form.metaDesc ?? ''}
                  onChange={e => set('metaDesc', e.target.value)}
                  rows={3}
                  placeholder="คำอธิบายบทความที่แสดงใน Google Search (แนะนำ 120–160 ตัวอักษร)"
                  style={{ ...inputStyle, resize: 'none' }}
                />
                <div style={{ fontSize: 11.5, color: form.metaDesc && form.metaDesc.length > 160 ? '#ef4444' : '#94a3b8', marginTop: 4 }}>
                  {(form.metaDesc ?? '').length}/160 ตัวอักษร
                </div>
              </div>

              <div>
                <label style={labelStyle}>SEO Score ปัจจุบัน</label>
                <div style={{ padding: '16px 18px', background: '#f8fafc', borderRadius: 12 }}>
                  <SeoBar score={form.seoScore} />
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 10, lineHeight: 1.6 }}>
                    {form.seoScore < 60 && '⚠ Score ต่ำ — ควรเพิ่ม keyword density, alt text ของรูป, และ internal links'}
                    {form.seoScore >= 60 && form.seoScore < 80 && '↑ ดีขึ้นได้ — เพิ่ม meta description, headings H2/H3, และ length ของบทความ'}
                    {form.seoScore >= 80 && '✓ SEO Score ดี — ยังคงอัปเดตเนื้อหาทุก 6 เดือน'}
                  </div>
                </div>
              </div>

              <div>
                <label style={labelStyle}>URL (Canonical)</label>
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 11, fontSize: 13, color: '#64748b', wordBreak: 'break-all' }}>
                  https://spacesmate.com/blog/{form.slug}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 26px', borderTop: '1px solid #eef0ef', display: 'flex', gap: 10, justifyContent: 'flex-end', flexShrink: 0 }}>
          <button onClick={onClose} style={{
            padding: '10px 22px', borderRadius: 11, border: '1px solid #e2e8f0',
            background: '#fff', color: '#64748b', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit',
          }}>ยกเลิก</button>
          <button onClick={handleSave} style={{
            padding: '10px 26px', borderRadius: 11, border: 'none',
            background: saved ? '#22c55e' : '#02402e', color: '#fff', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 8, transition: 'background .25s',
          }}>
            <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 400, 'FILL' 0" }}>{saved ? 'check' : 'save'}</span>
            {saved ? 'บันทึกแล้ว' : 'บันทึก'}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(MOCK_POSTS)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const displayed = posts.filter(p => {
    if (filter && p.status !== filter) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function handleSave(updated: BlogPost) {
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))
    // TODO: POST to WordPress API / Supabase when ready
  }

  const published  = posts.filter(p => p.status === 'published').length
  const totalViews = posts.reduce((s, p) => s + p.views, 0)
  const avgSeo     = Math.round(posts.reduce((s, p) => s + p.seoScore, 0) / posts.length)

  const KPI = [
    { label: 'เผยแพร่แล้ว',    value: published,                icon: 'check_circle', bg: '#dcfce7', color: '#15803d' },
    { label: 'ยอดวิวทั้งหมด',  value: totalViews.toLocaleString(), icon: 'visibility', bg: '#e0f2f9', color: '#0284c7' },
    { label: 'SEO Score เฉลี่ย', value: `${avgSeo}/100`,         icon: 'search',       bg: '#e8f5f0', color: '#048c73' },
    { label: 'บทความทั้งหมด',  value: posts.length,              icon: 'description',  bg: '#fff6e9', color: '#d97f11' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 3px', color: '#02402e' }}>บทความ</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>จัดการบล็อกและ SEO ของ spacesmate.com</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{
          padding: '10px 20px', borderRadius: 12, border: 'none',
          background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
        }}>
          <span className="msym" style={{ fontSize: 19, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>add</span>
          เพิ่มบทความใหม่
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 22 }}>
        {KPI.map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="msym" style={{ fontSize: 21, color: k.color, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{k.icon}</span>
            </span>
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
              padding: '7px 15px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, fontFamily: 'inherit',
              background: filter === o.v ? '#02402e' : '#f4f6f5', color: filter === o.v ? '#fff' : '#334155',
            }}>{o.l}</button>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <span className="msym" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 17, color: '#94a3b8', fontVariationSettings: "'wght' 300, 'FILL' 0", pointerEvents: 'none' }}>search</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาบทความ..."
            style={{ width: '100%', padding: '8px 14px 8px 38px', borderRadius: 10, border: '1px solid #eef0ef', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
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
                      <button
                        onClick={() => setEditing(post)}
                        style={{ padding: '7px 14px', borderRadius: 9, border: '1px solid #e2e8f0', background: '#fff', color: '#02402e', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
                        <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>edit</span>
                        แก้ไข
                      </button>
                      {post.status === 'draft' && (
                        <button
                          onClick={() => setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'published' } : p))}
                          style={{ padding: '7px 14px', borderRadius: 9, border: 'none', background: '#02402e', color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                          เผยแพร่
                        </button>
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

      {/* Edit Drawer */}
      {(editing || showCreate) && (
        <EditDrawer
          post={editing ?? {
            id: String(Date.now()), title: '', slug: '', category: 'คู่มือผู้เช่า',
            status: 'draft', seoScore: 0, views: 0,
            date: new Date().toISOString().slice(0, 10), author: 'SpacesMate',
            content: '', metaTitle: '', metaDesc: '',
          }}
          onClose={() => { setEditing(null); setShowCreate(false) }}
          onSave={(updated) => {
            if (showCreate) {
              setPosts(prev => [updated, ...prev])
              setShowCreate(false)
            } else {
              handleSave(updated)
              setEditing(null)
            }
          }}
        />
      )}
    </div>
  )
}
