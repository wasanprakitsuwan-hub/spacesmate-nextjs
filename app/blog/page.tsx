import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'บทความ | SpacesMate',
  description: 'เคล็ดลับ คู่มือ และข้อมูลตลาดเช่า-ขายอสังหาริมทรัพย์ในกรุงเทพฯ',
}

const BLOG_POSTS = [
  {
    slug: 'top-5-dusit-apartments',
    title: 'รวม 5 ที่พักย่านดุสิต สำหรับคนชอบความเรียบง่าย เดินทางสะดวก (อัปเดต 2026)',
    excerpt: 'ย่านดุสิตเงียบสงบ เดินทางสะดวก และมีที่พักคุณภาพในราคาที่คุ้มค่ากว่าโซนใจกลางเมืองมาก รวม 5 อพาร์ทเม้นท์ที่น่าสนใจที่สุดในย่านนี้',
    date: '6 พ.ค. 2026',
    readTime: '5 นาที',
    category: 'ที่พักแนะนำ',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
  },
  {
    slug: 'property-rental-strategy-2026',
    title: 'ปรับกลยุทธ์ อสังหาปล่อยเช่า 2026: เมื่อการเช่ากลายเป็นไลฟ์สไตล์หลัก',
    excerpt: 'พฤติกรรมผู้เช่าเปลี่ยนไปมากในช่วง 3 ปีที่ผ่านมา เจ้าของที่พักที่ยังใช้กลยุทธ์เดิมๆ กำลังสูญเสียรายได้ไปเงียบๆ',
    date: '28 เม.ย. 2026',
    readTime: '6 นาที',
    category: 'เจ้าของที่พัก',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  },
  {
    slug: '5-condo-owner-problems',
    title: '5 ปัญหาปล่อยเช่าคอนโด ที่เจ้าของมักเจอ พร้อมวิธีรับมือที่ได้ผลจริง',
    excerpt: 'จากประสบการณ์บริหารคอนโดในกรุงเทพฯ พบปัญหาซ้ำๆ ที่เจ้าของหลายคนต้องเจอ และวิธีแก้ที่ได้ผลจริง',
    date: '22 เม.ย. 2026',
    readTime: '5 นาที',
    category: 'เจ้าของที่พัก',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
  },
  {
    slug: 'bts-condo-guide-2026',
    title: 'คอนโดติด BTS ย่านไหนน่าลงทุนที่สุดในปี 2026',
    excerpt: 'วิเคราะห์ทำเลตามแนว BTS ทั้ง 9 สถานีที่มีดีมานด์ผู้เช่าสูงสุด พร้อมอัตราผลตอบแทนเฉลี่ยของแต่ละโซน',
    date: '15 เม.ย. 2026',
    readTime: '7 นาที',
    category: 'วิเคราะห์ตลาด',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
  },
  {
    slug: 'how-to-price-rental',
    title: 'ตั้งราคาเช่าอย่างไรให้ถูกต้อง ไม่แพงเกินจนไม่มีคนเช่า ไม่ถูกเกินจนขาดทุน',
    excerpt: 'สูตรคิดราคาค่าเช่าที่เจ้าของมืออาชีพใช้ พร้อมตัวแปรที่ต้องพิจารณาและวิธีเช็คราคาตลาดจริงๆ',
    date: '8 เม.ย. 2026',
    readTime: '5 นาที',
    category: 'เจ้าของที่พัก',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
  },
  {
    slug: 'expat-rental-bangkok-guide',
    title: 'คู่มือเช่าที่พักในกรุงเทพฯ สำหรับชาวต่างชาติ — รู้ก่อนเซ็นสัญญา',
    excerpt: 'ทุกอย่างที่ expat ต้องรู้ก่อนเช่าที่พักในกรุงเทพฯ ตั้งแต่เอกสารที่ต้องใช้ จนถึงสิทธิ์ที่พึงมีในฐานะผู้เช่า',
    date: '1 เม.ย. 2026',
    readTime: '8 นาที',
    category: 'ผู้เช่า',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
  },
]

const CATEGORIES = ['ทั้งหมด', 'เจ้าของที่พัก', 'ผู้เช่า', 'ที่พักแนะนำ', 'วิเคราะห์ตลาด']

export default function BlogPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* Hero */}
      <div className="bg-spacemate-brandDark py-14 md:py-18">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">บทความ SpacesMate</h1>
          <p className="text-white/70 text-base font-light">เคล็ดลับ คู่มือ และข้อมูลตลาดเช่า-ขายอสังหาฯ</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-10">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                i === 0
                  ? 'bg-spacemate-brandDark text-white'
                  : 'bg-spacemate-bgLight text-gray-600 hover:bg-spacemate-brandDark/10 hover:text-spacemate-brandDark'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl border border-spacemate-borderLight overflow-hidden hover:shadow-premium hover:-translate-y-1 transition-all duration-200"
            >
              <div className="h-48 overflow-hidden bg-spacemate-bgLight">
                <img
                  src={post.image}
                  alt={post.title}
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
                  <span className="text-xs text-gray-400">{post.date} · {post.readTime}</span>
                  <span className="text-spacemate-brandTeal text-xs font-medium">อ่านต่อ →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
