import Link from 'next/link'

const BLOG_POSTS: Record<string, {
  title: string
  date: string
  readTime: string
  category: string
  image: string
  content: string
}> = {
  'top-5-dusit-apartments': {
    title: 'รวม 5 ที่พักย่านดุสิต สำหรับคนชอบความเรียบง่าย เดินทางสะดวก (อัปเดต 2026)',
    date: '6 พ.ค. 2026',
    readTime: '5 นาที',
    category: 'ที่พักแนะนำ',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
    content: `ย่านดุสิตเป็นหนึ่งในทำเลที่น่าอยู่ที่สุดในกรุงเทพฯ สำหรับคนที่ไม่ต้องการความวุ่นวายของใจกลางเมือง แต่ยังต้องการความสะดวกในการเดินทาง บทความนี้รวบรวม 5 อพาร์ทเม้นท์ที่คัดสรรมาเพื่อคุณโดยเฉพาะ`,
  },
  'property-rental-strategy-2026': {
    title: 'ปรับกลยุทธ์ อสังหาปล่อยเช่า 2026: เมื่อการเช่ากลายเป็นไลฟ์สไตล์หลัก',
    date: '28 เม.ย. 2026',
    readTime: '6 นาที',
    category: 'เจ้าของที่พัก',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
    content: `ตลาดเช่าที่อยู่อาศัยในกรุงเทพฯ เปลี่ยนแปลงไปอย่างมากในช่วง 3 ปีที่ผ่านมา ผู้เช่าในปัจจุบันมีความต้องการที่หลากหลายและพร้อมจ่ายมากขึ้นสำหรับสิ่งที่ตรงความต้องการจริงๆ`,
  },
  '5-condo-owner-problems': {
    title: '5 ปัญหาปล่อยเช่าคอนโด ที่เจ้าของมักเจอ พร้อมวิธีรับมือที่ได้ผลจริง',
    date: '22 เม.ย. 2026',
    readTime: '5 นาที',
    category: 'เจ้าของที่พัก',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
    content: `จากประสบการณ์บริหารคอนโดในกรุงเทพฯ พบปัญหาซ้ำๆ ที่เจ้าของหลายคนต้องเจอ และวิธีแก้ที่ได้ผลจริง ไม่ว่าจะเป็นปัญหาผู้เช่าไม่จ่ายค่าเช่า ห้องว่างนาน หรือค่าซ่อมแซมที่ไม่คาดฝัน`,
  },
}

export async function generateStaticParams() {
  return Object.keys(BLOG_POSTS).map((slug) => ({ slug }))
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS[params.slug]

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-spacemate-brandDark mb-3">ไม่พบบทความ</h1>
          <Link href="/blog" className="text-spacemate-brandTeal hover:underline text-sm">← กลับไปที่บทความทั้งหมด</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero image */}
      <div className="w-full h-72 md:h-96 overflow-hidden bg-spacemate-bgLight">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/blog" className="text-spacemate-brandTeal text-sm hover:underline mb-6 inline-block">← บทความทั้งหมด</Link>

        <span className="inline-block text-xs font-semibold text-spacemate-brandTeal bg-spacemate-bgLight px-2.5 py-1 rounded-full mb-4">
          {post.category}
        </span>

        <h1 className="text-2xl md:text-3xl font-bold text-spacemate-brandDark mb-4 leading-snug tracking-tight">
          {post.title}
        </h1>

        <div className="flex items-center gap-3 text-gray-400 text-sm mb-8 pb-8 border-b border-spacemate-borderLight">
          <span>{post.date}</span>
          <span>·</span>
          <span>อ่าน {post.readTime}</span>
        </div>

        <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
          <p>{post.content}</p>
          <p className="mt-4">เนื้อหาบทความฉบับเต็มจะพร้อมเร็วๆ นี้ ติดตามได้ทาง Facebook และ Instagram ของ SpacesMate</p>
        </div>

        {/* CTA */}
        <div className="mt-12 p-6 rounded-2xl"
          style={{ background: 'radial-gradient(120% 160% at 85% 10%, #055c43, #02402e 60%)' }}>
          <h3 className="text-white font-semibold text-lg mb-2">มีอสังหาริมทรัพย์อยากปล่อยเช่า?</h3>
          <p className="text-white/70 text-sm mb-4">ให้ SpacesMate ดูแลตั้งแต่หาผู้เช่า ทำสัญญา จนถึงเก็บค่าเช่า</p>
          <Link
            href="/contact"
            className="inline-block text-white font-semibold text-sm px-6 py-3 rounded-full transition-all hover:brightness-110"
            style={{ background: '#d97f11' }}
          >
            ให้เราติดต่อกลับ →
          </Link>
        </div>
      </div>
    </div>
  )
}
