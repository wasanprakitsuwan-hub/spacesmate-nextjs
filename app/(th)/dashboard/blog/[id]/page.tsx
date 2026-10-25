'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageHead, Notice, Loading } from '@/components/admin/ui'
import { type BlogPost, BlogEditor, getToken, calcSeoScore } from '@/components/admin/blog-editor'

const EMPTY: BlogPost = {
  id: 'NEW', title: '', slug: '', category: 'คู่มือผู้เช่า',
  status: 'draft', seoScore: 0, views: 0, language: 'th',
  date: new Date().toISOString().slice(0, 10), author: 'SpacesMate',
  content: '', thumbnail: '', thumbnailAlt: '', metaTitle: '', metaDesc: '', keyword: '',
}

// /dashboard/blog/new creates a post; /dashboard/blog/<id> edits one.
export default function BlogEditPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const isNew = id === 'new'
  const [post, setPost]       = useState<BlogPost | null>(isNew ? EMPTY : null)
  const [loading, setLoading] = useState(!isNew)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (isNew) return
    // The list endpoint returns full posts; there is no single-post GET.
    getToken()
      .then(token => fetch('/api/dashboard/blog', { headers: { Authorization: `Bearer ${token}` } }))
      .then(r => r.json())
      .then(d => {
        const found = (d.posts ?? []).find((p: BlogPost) => p.id === id)
        if (found) setPost({ ...found, seoScore: calcSeoScore(found) })
        else setError('ไม่พบบทความนี้')
      })
      .catch(() => setError('โหลดบทความไม่สำเร็จ'))
      .finally(() => setLoading(false))
  }, [id, isNew])

  async function handleSave(updated: BlogPost) {
    const token = await getToken()
    const creating = updated.id === 'NEW'
    const r = await fetch(creating ? '/api/dashboard/blog' : `/api/dashboard/blog/${updated.id}`, {
      method: creating ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updated),
    })
    const d = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error((d as { error?: string }).error ?? 'บันทึกไม่สำเร็จ')
    if (creating && (d as { post?: BlogPost }).post?.id) router.replace(`/dashboard/blog/${(d as { post: BlogPost }).post.id}`)
  }

  async function handleDelete() {
    if (!post || !confirm(`ลบบทความ "${post.title}"?\nการลบไม่สามารถยกเลิกได้`)) return
    const token = await getToken()
    await fetch(`/api/dashboard/blog/${post.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    router.push('/dashboard/blog')
  }

  const back = { href: '/dashboard/blog', label: 'บทความทั้งหมด' }
  return (
    <div>
      <PageHead back={back} title={isNew ? 'เพิ่มบทความใหม่' : 'แก้ไขบทความ'} />
      {loading ? <Loading /> : error || !post ? <Notice tone="err">{error || 'ไม่พบบทความนี้'}</Notice> : (
        <BlogEditor post={post} onSave={handleSave} onDelete={isNew ? undefined : handleDelete} />
      )}
    </div>
  )
}
