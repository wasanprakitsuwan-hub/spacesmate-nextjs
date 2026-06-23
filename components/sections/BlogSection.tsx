import Link from 'next/link'

const BLOG_POSTS = [
  {
    slug: 'top-5-dusit-apartments',
    title: 'รวม 5 ที่พักย่านดุสิต สำหรับคนชอบความเรียบง่าย เดินทางสะดวก (อัปเดต 2026)',
    date: '6 พ.ค. 2026',
    readTime: '5 นาที',
    category: 'ที่พักแนะนำ',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
  },
  {
    slug: 'property-rental-strategy-2026',
    title: 'ปรับกลยุทธ์ อสังหาปล่อยเช่า 2026: เมื่อการเช่ากลายเป็นไลฟ์สไตล์หลัก',
    date: '28 เม.ย. 2026',
    readTime: '6 นาที',
    category: 'เจ้าของที่พัก',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  },
  {
    slug: '5-condo-owner-problems',
    title: '5 ปัญหาปล่อยเช่าคอนโด ที่เจ้าของมักเจอ พร้อมวิธีรับมือที่ได้ผลจริง',
    date: '22 เม.ย. 2026',
    readTime: '5 นาที',
    category: 'เจ้าของที่พัก',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
  },
]

export default function BlogSection() {
  return (
    <section className="py-14 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-7 flex-wrap gap-3">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-spacemate-brandDark mb-1.5 tracking-tight">บทความล่าสุด</h2>
            <p className="text-gray-500 text-sm font-light">เคล็ดลับ คู่มือ และข้อมูลตลาดเช่า-ขายอสังหาฯ</p>
          </div>
          <Link href="/blog" className="text-spacemate-brandTeal text-sm font-semibold hover:underline hidden sm:block">
            ดูบทความทั้งหมด →
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl border border-spacemate-borderLight overflow-hidden hover:shadow-premium hover:-translate-y-1 transition-all duration-200"
            >
              {/* Image */}
              <div className="h-44 overflow-hidden bg-spacemate-bgLight">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-5">
                <span className="inline-block text-xs font-semibold text-spacemate-brandTeal bg-spacemate-bgLight px-2.5 py-1 rounded-full mb-3">
                  {post.category}
                </span>
                <h3 className="font-semibold text-spacemate-textCharcoal text-sm leading-snug mb-4 group-hover:text-spacemate-brandDark transition-colors line-clamp-3">
                  {post.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{post.date} · {post.readTime}</span>
                  <span className="text-spacemate-brandTeal text-xs font-medium">อ่านต่อ →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
