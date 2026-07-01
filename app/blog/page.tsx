import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'บทความ | SpacesMate',
  description: 'เคล็ดลับ คู่มือ และข้อมูลตลาดเช่า-ขายอสังหาริมทรัพย์ในกรุงเทพฯ',
}

const CATEGORIES = [
  { label: 'ทั้งหมด', slug: '' },
  { label: 'เจ้าของทรัพย์', slug: 'เจ้าของทรัพย์' },
  { label: 'คู่มือผู้เช่า', slug: 'คู่มือผู้เช่า' },
  { label: 'ทำเลน่าอยู่', slug: 'ทำเลน่าอยู่' },
]

function formatThaiDate(iso: string): string {
  const d = new Date(iso)
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`
}

export default async function BlogPage() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('slug, title, category, thumbnail, thumbnail_alt, meta_desc, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const posts = data ?? []
  const featured = posts[0]
  const rest = posts.slice(1)

  return (
    <div className="bg-white min-h-screen">

      {/* Hero */}
      <div className="bg-spacemate-brandDark py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-spacemate-brandTeal text-sm font-semibold tracking-widest uppercase mb-3">BLOG</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">บทความ SpacesMate</h1>
          <p className="text-white/60 text-base font-light max-w-xl mx-auto">
            เคล็ดลับ คู่มือ และข้อมูลตลาดอสังหาริมทรัพย์สำหรับเจ้าของและผู้เช่าในกรุงเทพฯ
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-10">
          {CATEGORIES.map((cat, i) => (
            <span
              key={cat.slug}
              className={`px-4 py-2 rounded-full text-sm font-medium cursor-default select-none ${
                i === 0
                  ? 'bg-spacemate-brandDark text-white'
                  : 'bg-spacemate-bgLight text-gray-500 hover:text-spacemate-brandDark'
              }`}
            >
              {cat.label}
            </span>
          ))}
        </div>

        {/* Featured post — newest */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group flex flex-col md:flex-row gap-0 rounded-2xl border border-spacemate-borderLight overflow-hidden hover:shadow-premium hover:-translate-y-0.5 transition-all duration-200 mb-8"
          >
            <div className="md:w-1/2 h-56 md:h-auto overflow-hidden bg-spacemate-bgLight flex-shrink-0">
              <img
                src={featured.thumbnail ?? '/blog/placeholder.jpg'}
                alt={featured.thumbnail_alt ?? featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex-1 p-7 flex flex-col justify-center">
              <span className="inline-block text-xs font-semibold text-spacemate-brandTeal bg-spacemate-bgLight px-2.5 py-1 rounded-full mb-3 w-fit">
                {featured.category}
              </span>
              <h2 className="font-bold text-spacemate-textCharcoal text-xl leading-snug mb-3 group-hover:text-spacemate-brandDark transition-colors">
                {featured.title}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-5 line-clamp-3">{featured.meta_desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {featured.published_at ? formatThaiDate(featured.published_at) : ''}
                </span>
                <span className="text-spacemate-brandTeal text-sm font-semibold">อ่านต่อ →</span>
              </div>
            </div>
          </Link>
        )}

        {/* Grid — remaining posts */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl border border-spacemate-borderLight overflow-hidden hover:shadow-premium hover:-translate-y-1 transition-all duration-200"
              >
                <div className="h-48 overflow-hidden bg-spacemate-bgLight">
                  <img
                    src={post.thumbnail ?? '/blog/placeholder.jpg'}
                    alt={post.thumbnail_alt ?? post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <span className="inline-block text-xs font-semibold text-spacemate-brandTeal bg-spacemate-bgLight px-2.5 py-1 rounded-full mb-3">
                    {post.category}
                  </span>
                  <h2 className="font-semibold text-spacemate-textCharcoal text-sm leading-snug mb-3 group-hover:text-spacemate-brandDark transition-colors line-clamp-3">
                    {post.title}
                  </h2>
                  <p className="text-gray-400 text-xs leading-relaxed mb-4 line-clamp-2">{post.meta_desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {post.published_at ? formatThaiDate(post.published_at) : ''}
                    </span>
                    <span className="text-spacemate-brandTeal text-xs font-medium">อ่านต่อ →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">ยังไม่มีบทความที่เผยแพร่</p>
          </div>
        )}

        {/* Follow CTA */}
        <div className="mt-14 text-center py-10 rounded-2xl border border-dashed border-spacemate-borderLight">
          <p className="text-gray-400 text-sm">ติดตามบทความใหม่ได้ที่</p>
          <div className="flex justify-center gap-4 mt-3">
            <a href="https://www.facebook.com/spacesmateTH" target="_blank" rel="noopener noreferrer"
               className="text-spacemate-brandTeal text-sm font-medium hover:underline">Facebook</a>
            <a href="https://www.instagram.com/spacesmate/" target="_blank" rel="noopener noreferrer"
               className="text-spacemate-brandTeal text-sm font-medium hover:underline">Instagram</a>
          </div>
        </div>

      </div>
    </div>
  )
}
