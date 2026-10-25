'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { C, RADIUS, btnStyle } from '@/lib/ui'
import { PageHead, Stat, Pill, card, input, th, td, Loading } from '@/components/admin/ui'
import { type BlogPost, getToken, calcSeoScore, SeoBar } from '@/components/admin/blog-editor'

const STATUS_TONE = { published: 'green', draft: 'neutral', review: 'amber' } as const
const STATUS_LABEL = { published: 'เผยแพร่แล้ว', draft: 'แบบร่าง', review: 'รอตรวจสอบ' }

// Full-width list; each article opens in its own editor page.
export default function BlogPage() {
  const [posts, setPosts]     = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('')
  const [search, setSearch]   = useState('')

  useEffect(() => {
    getToken()
      .then(token => fetch('/api/dashboard/blog', { headers: { Authorization: `Bearer ${token}` } }))
      .then(r => r.json())
      .then(d => {
        // Recalculate SEO scores live from actual post data — DB values are stale
        if (Array.isArray(d.posts)) setPosts(d.posts.map((p: BlogPost) => ({ ...p, seoScore: calcSeoScore(p) })))
      })
      .catch(err => console.error('Failed to load blog posts:', err))
      .finally(() => setLoading(false))
  }, [])

  const displayed = posts.filter(p => {
    if (filter && p.status !== filter) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  async function quickPublish(post: BlogPost) {
    const token = await getToken()
    await fetch(`/api/dashboard/blog/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'published' }),
    })
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'published' } : p))
  }

  const published  = posts.filter(p => p.status === 'published').length
  const totalViews = posts.reduce((s, p) => s + p.views, 0)
  const avgSeo     = posts.length > 0 ? Math.round(posts.reduce((s, p) => s + p.seoScore, 0) / posts.length) : 0

  const chip = (on: boolean) => ({
    padding: '8px 12px', borderRadius: RADIUS, border: `1px solid ${on ? C.green : C.border}`,
    background: on ? C.green : C.white, color: on ? C.white : C.ink, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
  })

  return (
    <div>
      <PageHead
        title="บทความ"
        sub="กดแก้ไขเพื่อเปิดหน้าเขียนบทความ คำแนะนำ SEO อยู่ด้านขวาของหน้านั้น"
        actions={<Link href="/dashboard/blog/new" className="sm-btn-primary" style={btnStyle('primary')}>เพิ่มบทความใหม่</Link>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 20 }}>
        <Stat value={posts.length} label="บทความทั้งหมด" />
        <Stat value={published} label="เผยแพร่แล้ว" />
        <Stat value={totalViews.toLocaleString()} label="ยอดวิวทั้งหมด" />
        <Stat value={`${avgSeo}/100`} label="SEO เฉลี่ย" />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาบทความ" style={{ ...input, flex: 1, minWidth: 220, width: 'auto' }} />
        {[{ v: '', l: 'ทั้งหมด' }, { v: 'published', l: 'เผยแพร่' }, { v: 'draft', l: 'แบบร่าง' }, { v: 'review', l: 'รอตรวจ' }].map(o => (
          <button key={o.v} onClick={() => setFilter(o.v)} style={chip(filter === o.v)}>{o.l}</button>
        ))}
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        {loading ? <Loading /> : displayed.length === 0 ? (
          <p style={{ padding: '48px 24px', textAlign: 'center', color: C.muted, fontSize: 14, margin: 0 }}>ไม่พบบทความ</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['บทความ', 'ภาษา', 'หมวดหมู่', 'สถานะ', 'SEO', 'ยอดวิว', 'วันที่', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {displayed.map(post => (
                  <tr key={post.id}>
                    <td style={{ ...td, minWidth: 280 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {post.thumbnail
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={post.thumbnail} alt={post.thumbnailAlt} style={{ width: 56, height: 38, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                          : <div style={{ width: 56, height: 38, borderRadius: 4, background: C.paper, border: `1px solid ${C.line}`, flexShrink: 0 }} />}
                        <div style={{ minWidth: 0 }}>
                          <Link href={`/dashboard/blog/${post.id}`} style={{ fontWeight: 500, color: C.green, textDecoration: 'none', lineHeight: 1.4 }}>{post.title || 'ไม่มีชื่อ'}</Link>
                          <div style={{ fontSize: 12, color: C.faint }}>/{post.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...td, color: C.muted }}>{(post.language ?? 'th').toUpperCase()}</td>
                    <td style={{ ...td, color: C.muted, whiteSpace: 'nowrap' }}>{post.category}</td>
                    <td style={td}><Pill tone={STATUS_TONE[post.status]}>{STATUS_LABEL[post.status]}</Pill></td>
                    <td style={{ ...td, minWidth: 120 }}><SeoBar score={post.seoScore} /></td>
                    <td style={{ ...td, color: C.muted }}>{post.views > 0 ? post.views.toLocaleString() : '—'}</td>
                    <td style={{ ...td, color: C.muted, fontSize: 12.5, whiteSpace: 'nowrap' }}>
                      {new Date(post.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {post.status === 'draft' && (
                        <button onClick={() => quickPublish(post)} style={{ background: 'none', border: 'none', color: C.teal, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginRight: 12 }}>เผยแพร่</button>
                      )}
                      <Link href={`/dashboard/blog/${post.id}`} className="sm-btn-ghost" style={{ ...btnStyle('ghost'), padding: '6px 12px', fontSize: 13 }}>แก้ไข</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
