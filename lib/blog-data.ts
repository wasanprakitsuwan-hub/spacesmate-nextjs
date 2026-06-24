// ─── SpacesMate Blog — Static Post Data ───────────────────────────────────────
// Migrated from WordPress (spacesmate.com) — all 9 posts
// Images: hosted on WP CDN. Download to /public/blog/ before closing WP.
// Content: fetched from WP REST API at build time via generateStaticParams.

export interface BlogPost {
  id: number          // WP post ID — used to fetch full content at build time
  slug: string        // URL-friendly English slug for Next.js routing
  title: string
  excerpt: string
  date: string        // ISO date string
  category: string
  categorySlug: string
  image: string       // WP CDN image URL (migrate to /public/blog/ before closing WP)
  imageAlt: string
}

export const WP_BASE = 'https://spacesmate.com/wp-json/wp/v2'

export const blogPosts: BlogPost[] = [
  {
    id: 19865,
    slug: 'thi-pak-yan-dusit',
    title: 'รวม 5 ที่พักย่านดุสิต สำหรับคนชอบความเรียบง่าย เดินทางสะดวก (อัปเดต 2026)',
    excerpt: 'เขตดุสิตเป็นย่านที่มีเสน่ห์ของวันวาน ห้องพักส่วนใหญ่จึงมักจะเป็นสไตล์ดั้งเดิมที่ให้ความรู้สึกเหมือนอยู่บ้านจริงๆ ใครที่กำลังมองหาที่พักย่านดุสิตเพื่อมาทำธุระหรือมาเที่ยว และอยากได้ฟีลที่พักแบบเข้าถึงง่าย ไม่เกร็ง นี่คือ 5 พิกัดที่แนะนำ',
    date: '2026-05-06T15:33:42',
    category: 'Real Estate',
    categorySlug: 'real-estate',
    image: '/blog/thi-pak-yan-dusit.jpg',
    imageAlt: 'ที่พักย่านดุสิต กรุงเทพ สำหรับผู้เช่าที่ชอบความเรียบง่ายและเดินทางสะดวก',
  },
  {
    id: 19855,
    slug: 'asangha-ploy-chao-2026',
    title: 'ปรับกลยุทธ์ อสังหาปล่อยเช่า 2026: เมื่อการเช่ากลายเป็นไลฟ์สไตล์หลัก',
    excerpt: 'อสังหาปล่อยเช่า 2026 นี้ ตลาดอสังหาริมทรัพย์ไทยเข้าสู่ยุคที่การเช่ากลายเป็นไลฟ์สไตล์หลักของคนรุ่นใหม่ เจ้าของทรัพย์ที่ยังใช้วิธีเดิมๆ อาจเสียโอกาสรายได้มหาศาล',
    date: '2026-04-28T11:36:05',
    category: 'Real Estate',
    categorySlug: 'real-estate',
    image: '/blog/asangha-ploy-chao-2026.jpg',
    imageAlt: 'เจ้าของอสังหาฯ วางกลยุทธ์ปล่อยเช่า 2026 รับมือตลาดเช่ากรุงเทพที่เปลี่ยนแปลง',
  },
  {
    id: 19847,
    slug: 'panha-ploy-chao-condo',
    title: '5 ปัญหาปล่อยเช่าคอนโด ที่เจ้าของมักเจอ พร้อมวิธีรับมือที่ได้ผลจริง',
    excerpt: 'ปัญหาปล่อยเช่าคอนโดมีมากกว่าที่คิด ตั้งแต่ผู้เช่าค้างค่าเช่า ทรัพย์สินเสียหาย ไปจนถึงการสื่อสารที่ยากลำบาก บทความนี้รวบรวม 5 ปัญหาที่เจ้าของคอนโดมักเจอ พร้อมวิธีรับมือที่ได้ผลจริง',
    date: '2026-04-22T11:55:51',
    category: 'Real Estate',
    categorySlug: 'real-estate',
    image: '/blog/panha-ploy-chao-condo.jpg',
    imageAlt: 'เจ้าของคอนโดกรุงเทพปรึกษาปัญหาผู้เช่าและการบริหารอสังหาริมทรัพย์',
  },
  {
    id: 19633,
    slug: 'vithi-lueak-phu-chao',
    title: '5 วิธีเลือกผู้เช่า ที่เจ้าของห้องต้องรู้ก่อนเซ็นสัญญาเช่า',
    excerpt: 'การปล่อยเช่าอสังหาฯ อาจดูเหมือนเรื่องง่าย แค่ลงประกาศแล้วรอคนมาจอง แต่ในความเป็นจริง การเลือกผู้เช่าที่ดีคือหัวใจสำคัญที่จะกำหนดว่าคุณจะมีรายได้ที่มั่นคงหรือปัญหาที่ไม่รู้จบ',
    date: '2026-04-21T13:22:50',
    category: 'Real Estate',
    categorySlug: 'real-estate',
    image: '/blog/vithi-lueak-phu-chao.jpg',
    imageAlt: 'วิธีเลือกผู้เช่าที่ดี สำหรับเจ้าของคอนโดและอพาร์ทเมนท์ในกรุงเทพ',
  },
  {
    id: 19628,
    slug: 'update-kotmai-asangha-2026',
    title: 'อัปเดต กฎหมายอสังหาฯ ปี 2026: 3 เรื่องใหญ่ที่คนปล่อยเช่าต้องรู้ ถ้าไม่อยากเสียสิทธิ!',
    excerpt: 'ก้าวเข้าสู่ปี 2026 อย่างเต็มตัว ตลาดอสังหาริมทรัพย์ไทยไม่ได้สู้กันแค่ที่ตัวทรัพย์สินอีกต่อไป แต่ยังรวมถึงความเข้าใจเรื่องกฎหมายที่เปลี่ยนแปลงไปด้วย บทความนี้สรุป 3 เรื่องสำคัญที่คนปล่อยเช่าต้องรู้',
    date: '2026-04-01T10:02:44',
    category: 'Legal & Tax',
    categorySlug: 'legal-tax',
    image: '/blog/update-kotmai-asangha-2026.jpg',
    imageAlt: 'กฎหมายอสังหาริมทรัพย์ไทย 2026 ที่เจ้าของทรัพย์ต้องรู้',
  },
  {
    id: 19520,
    slug: 'ploy-chao-asangha-5-things',
    title: '5 สิ่งที่ต้องเช็ค! ก่อนตัดสินใจปล่อยเช่าอสังหาฯ เพื่อลดปัญหาในระยะยาว',
    excerpt: 'ในตลาดที่มีตัวเลือกมากมาย การจะปล่อยเช่าอสังหาฯ ให้ประสบความสำเร็จไม่ใช่แค่เรื่องของราคาหรือทำเล แต่ยังต้องเตรียมพร้อมในหลายด้านก่อนเปิดรับผู้เช่า',
    date: '2026-03-17T16:45:53',
    category: 'Real Estate',
    categorySlug: 'real-estate',
    image: '/blog/ploy-chao-asangha-5-things.jpg',
    imageAlt: '5 สิ่งที่เจ้าของอสังหาฯ ต้องเช็คก่อนปล่อยเช่า',
  },
  {
    id: 19486,
    slug: 'long-prakat-asangha',
    title: 'ลงประกาศอสังหาฯ ที่ไหนดี? Facebook vs เว็บเฉพาะทาง | SpacesMate',
    excerpt: 'สำหรับเจ้าของมือใหม่ที่กำลังมองหาวิธีลงประกาศอสังหาฯ ให้ได้ผล บทความนี้เปรียบเทียบ Facebook กับเว็บไซต์เฉพาะทางอย่าง SpacesMate ว่าช่องทางไหนเหมาะกับทรัพย์สินประเภทใด',
    date: '2026-03-17T14:37:45',
    category: 'Real Estate Marketing',
    categorySlug: 'real-estate-marketing',
    image: '/blog/long-prakat-asangha.jpg',
    imageAlt: 'เปรียบเทียบช่องทางลงประกาศอสังหาฯ Facebook vs เว็บเฉพาะทาง',
  },
  {
    id: 19385,
    slug: 'ha-hong-pak-spacesmate',
    title: 'หาห้องพักหรือที่ทำงาน เลือกสเปซที่ใช้กับ SpacesMate',
    excerpt: 'นิยามของการใช้ชีวิตในเมืองวันนี้เปลี่ยนไปอย่างสิ้นเชิง ทั้งการทำงาน การพักอาศัย และการเลือกสเปซที่เหมาะกับไลฟ์สไตล์ SpacesMate ช่วยให้คุณค้นหาพื้นที่ที่ใช่ได้ง่ายขึ้น',
    date: '2026-03-10T17:08:58',
    category: 'Real Estate',
    categorySlug: 'real-estate',
    image: '/blog/ha-hong-pak-spacesmate.jpg',
    imageAlt: 'หาห้องพักหรือที่ทำงานในกรุงเทพกับ SpacesMate',
  },
  {
    id: 19331,
    slug: 'jadkan-asangha-spacesmate',
    title: 'พลิกโฉมเปลี่ยนระบบจัดการอสังหาริมทรัพย์ ให้เป็นเรื่องง่ายและมีประสิทธิภาพกับ SpacesMate',
    excerpt: 'หากคุณกำลังมองหาวิธีจัดการอสังหาริมทรัพย์ที่ช่วยให้คุณทำงานง่ายขึ้น ในยุคที่คอนโดมิเนียมผุดขึ้นเป็นดอกเห็ด การปล่อยเช่าในปัจจุบันไม่ใช่เรื่องง่ายแค่ติดป้ายหน้าบ้านแล้วรอรับเงินอีกต่อไป',
    date: '2026-03-10T15:10:40',
    category: 'Real Estate',
    categorySlug: 'real-estate',
    image: '/blog/jadkan-asangha-spacesmate.jpg',
    imageAlt: 'จัดการอสังหาริมทรัพย์ให้ง่ายและมีประสิทธิภาพกับ SpacesMate',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatThaiDate(iso: string): string {
  const d = new Date(iso)
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug)
}

// Fetch full HTML content from WP REST API at build time
export async function fetchPostContent(wpId: number): Promise<string> {
  try {
    const res = await fetch(`${WP_BASE}/posts/${wpId}?_fields=content`, {
      next: { revalidate: false }, // cache forever — WP site closing soon
    })
    if (!res.ok) return '<p>เนื้อหาไม่พร้อมใช้งานในขณะนี้</p>'
    const data = await res.json()
    return data.content?.rendered ?? '<p>ไม่พบเนื้อหา</p>'
  } catch {
    return '<p>ไม่สามารถโหลดเนื้อหาได้ กรุณาลองใหม่อีกครั้ง</p>'
  }
}
