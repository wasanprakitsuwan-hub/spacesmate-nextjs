/**
 * FAQ page chrome, per locale. The questions and answers live in lib/faq-data.
 */
export type Locale = 'th' | 'en'

export const FAQ_T = {
  th: {
    metaTitle: 'คำถามที่พบบ่อย (FAQ)',
    metaDesc:
      'คำถามที่พบบ่อยเกี่ยวกับ SpacesMate — แพลตฟอร์มลงประกาศเช่าทั่วไทย ฿299/เดือน รองรับคอนโด อพาร์ทเม้นท์ บ้าน ออฟฟิศ โคเวิร์กกิ้ง บริการบริหารทรัพย์สินรูปแบบ Profit Sharing',
    ogTitle: 'คำถามที่พบบ่อย | SpacesMate',
    ogDesc: 'ทุกคำตอบเกี่ยวกับแพลตฟอร์มลงประกาศและบริการบริหารทรัพย์สินของ SpacesMate',

    breadcrumbHome: 'หน้าแรก',
    breadcrumbHere: 'คำถามที่พบบ่อย',
    heading: 'คำถามที่พบบ่อย (FAQ)',
    subA: 'ทุกคำตอบที่คุณต้องการเกี่ยวกับ SpacesMate — แพลตฟอร์มลงประกาศ',
    subB: 'และบริการบริหารทรัพย์สินครบวงจรทั่วประเทศไทย',

    moreHeading: 'ยังมีคำถามเพิ่มเติม?',
    moreBody: 'ติดต่อทีมงาน SpacesMate โดยตรง — เราพร้อมตอบทุกคำถาม',
    moreCta1: 'ติดต่อเรา',
    moreCta2: 'ฝากบริหารทรัพย์สิน',
  },
  en: {
    metaTitle: 'Frequently asked questions',
    metaDesc:
      'Common questions about SpacesMate — a rental listing platform covering all of Thailand from ฿299/month, for condos, apartments, houses, offices and co-working, plus profit-sharing property management.',
    ogTitle: 'Frequently asked questions | SpacesMate',
    ogDesc: 'Answers about the SpacesMate listing platform and its property management service.',

    breadcrumbHome: 'Home',
    breadcrumbHere: 'FAQ',
    heading: 'Frequently asked questions',
    subA: 'Everything you need to know about SpacesMate — the listing platform',
    subB: 'and full property management, across Thailand',

    moreHeading: 'Still have a question?',
    moreBody: 'Contact the SpacesMate team directly — we are happy to answer anything.',
    moreCta1: 'Contact us',
    moreCta2: 'Hand us your property',
  },
} as const
