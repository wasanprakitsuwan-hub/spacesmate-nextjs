import Link from 'next/link'
import type { Metadata } from 'next'
import { blogPosts, formatThaiDate } from '@/lib/blog-data'

export const metadata: Metadata = {
  title: 'บทความ | SpacesMate',
  description: 'เคล็ดลับ คู่มือ และข้อมูลตลาดเช่า-ขายอสังหาริมทรัพย์ในกรุงเทพฯ',
}

const CATEGORIES = [
  { label: 'ทั้งหมด', slug: '' },
  { label: 'Real Estate', slug: 'real-estate' },
  { label: 'Legal & Tax', slug: 'legal-tax' },
  { label: 'Real Estate Marketing', slug: 'real-estate-marketing' },
]

export default function BlogPage() {
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

        {/* Category tabs (static — no client-side filter needed for 9 posts) */}
        <div className="flex gap-2 flex-wrap mb-10">
          {CATEGORIES.map((cat, i) => (
            <span
              key={cat.slug}
              className={`px-4 py-2 rounded-full text-sm font-medium cursor-default select-none ${
                i === 0
                  ? 'bg-spacemate-brandDark text-white'
                  : 'bg-spacemate-bgLight text-gray-500 hover:bg-spacemate-brandDark/8 hover:text-spacemate-brandDark'
              }`}
            >
              {cat.label}
            </span>
          ))}
        </div>

        {/* Featured post — first/newest */}
        {(() => {
          const featured = blogPosts[0]
          return (
            <Link
              href={`/blog/${featured.slug}`}
              className="group flex flex-col md:flex-row gap-0 rounded-2xl border border-spacemate-borderLight overflow-hidden hover:shadow-premium hover:-translate-y-0.5 transition-all duration-200 mb-8"
            >
              <div className="md:w-1/2 h-56 md:h-auto overflow-hidden bg-spacemate-bgLight flex-shrink-0">
                <img
                  src={featured.image}
                  alt={featured.imageAlt}
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
                <p className="text-gray-400 text-sm leading-relaxed mb-5 line-clamp-3">{featured.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{formatThaiDate(featured.date)}</span>
                  <span className="text-spacemate-brandTeal text-sm font-semibold">อ่านต่อ →</span>
                </div>
              </div>
            </Link>
          )
        })()}

        {/* Grid — remaining 8 posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {blogPosts.slice(1).map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl border border-spacemate-borderLight overflow-hidden hover:shadow-premium hover:-translate-y-1 transition-all duration-200"
            >
              <div className="h-48 overflow-hidden bg-spacemate-bgLight">
                <img
                  src={post.image}
                  alt={post.imageAlt}
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
                <p className="text-gray-400 text-xs leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{formatThaiDate(post.date)}</span>
                  <span className="text-spacemate-brandTeal text-xs font-medium">อ่านต่อ →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state — future posts */}
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
