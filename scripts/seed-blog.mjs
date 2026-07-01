// Run: node scripts/seed-blog.mjs
// Thumbnails: Unsplash free photos — no domain restriction, no auth required
const URL = 'https://jrykbzdzcplhrhauvlvk.supabase.co/rest/v1/blog_posts'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyeWtiemR6Y3BsaHJoYXV2bHZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIyNDYxNCwiZXhwIjoyMDk3ODAwNjE0fQ.2-jiD60YvmeXU_8oQxgZTuEa_3H0_Rw7uIqV7uI2HBU'
const UNSPLASH = 'https://images.unsplash.com'
const P = '?w=1200&h=630&fit=crop&auto=format&q=80'

const posts = [
  { title: 'รวม 5 ที่พักย่านดุสิต สำหรับคนชอบความเรียบง่าย เดินทางสะดวก (อัปเดต 2026)', slug: 'thi-pak-yan-dusit', category: 'ทำเลน่าอยู่', status: 'published', thumbnail: `${UNSPLASH}/photo-1508009603885-50cf7c579365${P}`, thumbnail_alt: 'ที่พักย่านดุสิต กรุงเทพ', meta_desc: 'เขตดุสิตเป็นย่านที่มีเสน่ห์ของวันวาน', seo_score: 55, views: 0, author: 'SpacesMate', published_at: '2026-05-06T15:33:42Z', created_at: '2026-05-06T15:33:42Z', updated_at: '2026-05-06T15:33:42Z' },
  { title: 'ปรับกลยุทธ์ อสังหาปล่อยเช่า 2026: เมื่อการเช่ากลายเป็นไลฟ์สไตล์หลัก', slug: 'asangha-ploy-chao-2026', category: 'เจ้าของทรัพย์', status: 'published', thumbnail: `${UNSPLASH}/photo-1545324418-cc1a3fa10c00${P}`, thumbnail_alt: 'เจ้าของอสังหาฯ วางกลยุทธ์ปล่อยเช่า 2026', meta_desc: 'ตลาดอสังหาริมทรัพย์ไทยเข้าสู่ยุคที่การเช่ากลายเป็นไลฟ์สไตล์หลัก', seo_score: 55, views: 0, author: 'SpacesMate', published_at: '2026-04-28T11:36:05Z', created_at: '2026-04-28T11:36:05Z', updated_at: '2026-04-28T11:36:05Z' },
  { title: '5 ปัญหาปล่อยเช่าคอนโด ที่เจ้าของมักเจอ พร้อมวิธีรับมือที่ได้ผลจริง', slug: 'panha-ploy-chao-condo', category: 'เจ้าของทรัพย์', status: 'published', thumbnail: `${UNSPLASH}/photo-1522708323590-d24dbb6b0267${P}`, thumbnail_alt: 'เจ้าของคอนโดกรุงเทพปรึกษาปัญหาผู้เช่า', meta_desc: 'ปัญหาปล่อยเช่าคอนโดมีมากกว่าที่คิด', seo_score: 55, views: 0, author: 'SpacesMate', published_at: '2026-04-22T11:55:51Z', created_at: '2026-04-22T11:55:51Z', updated_at: '2026-04-22T11:55:51Z' },
  { title: '5 วิธีเลือกผู้เช่า ที่เจ้าของห้องต้องรู้ก่อนเซ็นสัญญาเช่า', slug: 'vithi-lueak-phu-chao', category: 'เจ้าของทรัพย์', status: 'published', thumbnail: `${UNSPLASH}/photo-1516156008625-3a9d6067fab5${P}`, thumbnail_alt: 'วิธีเลือกผู้เช่าที่ดี', meta_desc: 'การเลือกผู้เช่าที่ดีคือหัวใจสำคัญที่กำหนดรายได้ที่มั่นคง', seo_score: 55, views: 0, author: 'SpacesMate', published_at: '2026-04-21T13:22:50Z', created_at: '2026-04-21T13:22:50Z', updated_at: '2026-04-21T13:22:50Z' },
  { title: 'อัปเดต กฎหมายอสังหาฯ ปี 2026: 3 เรื่องใหญ่ที่คนปล่อยเช่าต้องรู้', slug: 'update-kotmai-asangha-2026', category: 'เจ้าของทรัพย์', status: 'published', thumbnail: `${UNSPLASH}/photo-1589829545856-d10d557cf95f${P}`, thumbnail_alt: 'กฎหมายอสังหาริมทรัพย์ไทย 2026', meta_desc: 'ตลาดอสังหาริมทรัพย์ไทยไม่ได้สู้กันแค่ที่ตัวทรัพย์สิน', seo_score: 55, views: 0, author: 'SpacesMate', published_at: '2026-04-01T10:02:44Z', created_at: '2026-04-01T10:02:44Z', updated_at: '2026-04-01T10:02:44Z' },
  { title: '5 สิ่งที่ต้องเช็ค! ก่อนตัดสินใจปล่อยเช่าอสังหาฯ เพื่อลดปัญหาในระยะยาว', slug: 'ploy-chao-asangha-5-things', category: 'เจ้าของทรัพย์', status: 'published', thumbnail: `${UNSPLASH}/photo-1484154218962-a197022b5858${P}`, thumbnail_alt: '5 สิ่งที่เจ้าของอสังหาฯ ต้องเช็ค', meta_desc: 'การปล่อยเช่าอสังหาฯ ให้ประสบความสำเร็จไม่ใช่แค่เรื่องราคา', seo_score: 55, views: 0, author: 'SpacesMate', published_at: '2026-03-17T16:45:53Z', created_at: '2026-03-17T16:45:53Z', updated_at: '2026-03-17T16:45:53Z' },
  { title: 'ลงประกาศอสังหาฯ ที่ไหนดี? Facebook vs เว็บเฉพาะทาง | SpacesMate', slug: 'long-prakat-asangha', category: 'เจ้าของทรัพย์', status: 'published', thumbnail: `${UNSPLASH}/photo-1460925895917-afdab827c52f${P}`, thumbnail_alt: 'เปรียบเทียบช่องทางลงประกาศอสังหาฯ', meta_desc: 'เปรียบเทียบ Facebook กับ SpacesMate', seo_score: 55, views: 0, author: 'SpacesMate', published_at: '2026-03-17T14:37:45Z', created_at: '2026-03-17T14:37:45Z', updated_at: '2026-03-17T14:37:45Z' },
  { title: 'หาห้องพักหรือที่ทำงาน เลือกสเปซที่ใช้กับ SpacesMate', slug: 'ha-hong-pak-spacesmate', category: 'คู่มือผู้เช่า', status: 'published', thumbnail: `${UNSPLASH}/photo-1502672260266-1c1ef2d93688${P}`, thumbnail_alt: 'หาห้องพักหรือที่ทำงานในกรุงเทพ', meta_desc: 'SpacesMate ช่วยให้คุณค้นหาพื้นที่ที่ใช่ได้ง่ายขึ้น', seo_score: 55, views: 0, author: 'SpacesMate', published_at: '2026-03-10T17:08:58Z', created_at: '2026-03-10T17:08:58Z', updated_at: '2026-03-10T17:08:58Z' },
  { title: 'พลิกโฉมเปลี่ยนระบบจัดการอสังหาริมทรัพย์ ให้เป็นเรื่องง่ายและมีประสิทธิภาพกับ SpacesMate', slug: 'jadkan-asangha-spacesmate', category: 'เจ้าของทรัพย์', status: 'published', thumbnail: `${UNSPLASH}/photo-1560520653-9e0e4c89eb11${P}`, thumbnail_alt: 'จัดการอสังหาริมทรัพย์ให้ง่าย', meta_desc: 'หากคุณกำลังมองหาวิธีจัดการอสังหาริมทรัพย์ที่ช่วยให้คุณทำงานง่ายขึ้น', seo_score: 55, views: 0, author: 'SpacesMate', published_at: '2026-03-10T15:10:40Z', created_at: '2026-03-10T15:10:40Z', updated_at: '2026-03-10T15:10:40Z' },
]

const res = await fetch(URL + '?on_conflict=slug', {
  method: 'POST',
  headers: {
    'apikey': KEY,
    'Authorization': `Bearer ${KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=ignore-duplicates,return=minimal',
  },
  body: JSON.stringify(posts),
})

if (res.ok) {
  console.log('Done — 9 posts inserted successfully')
} else {
  const text = await res.text()
  console.error('Error:', res.status, text)
}
