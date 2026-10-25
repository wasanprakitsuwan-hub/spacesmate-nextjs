/**
 * Area write-ups for the /rent pages: "why people rent here" points and a
 * couple of paragraphs about the place, in Thai and English.
 *
 * Where a page's text comes from, first match wins:
 *   1. its own override in seo_pages (highlights_*, body_*), edited from
 *      /dashboard/rent-pages
 *   2. the hand-written guide of the /area page it replaced (FOLDED_AREAS),
 *      for those 16 type pages
 *   3. PLACE_CONTENT below, on the place's all-types page only. Type pages
 *      of the same place don't repeat it: six pages with one paragraph is
 *      duplicate content.
 *
 * PLACE_CONTENT was drafted on 25 Oct 2026 for the 21 universities and 60
 * central stations. Facts are kept to what holds still: lines, what is nearby
 * (from lib/stations and lib/landmarks), and who tends to rent there. No
 * prices; those come live from listings in the FAQ.
 *
 * Pure: no React, no Supabase, so the dashboard can show the defaults.
 */
import { AREA_CONTENT } from '@/lib/area-content'
import { FOLDED_AREAS, type Locale, type RentType } from '@/lib/rent-slugs'

export type PlaceContent = {
  highlights: Record<Locale, string[]>
  body: Record<Locale, string[]>
}

export type RentContent = PlaceContent & { faq: Record<Locale, { q: string; a: string }[]> }

export function splitLines(s: string | null | undefined): string[] {
  return (s ?? '').split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
}

export function splitParagraphs(s: string | null | undefined): string[] {
  return (s ?? '').split(/\n\s*\n/).map(p => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean)
}

/** The old /area slug a page took over, if any. */
export function foldedSlugFor(placeKey: string, type: RentType | null): string | null {
  const hit = Object.entries(FOLDED_AREAS).find(([, f]) => f.place === placeKey && f.type === type)
  return hit ? hit[0] : null
}

/** Text a page shows when it has no override of its own. */
export function defaultRentContent(placeKey: string, type: RentType | null): RentContent | null {
  const folded = foldedSlugFor(placeKey, type)
  const a = folded ? AREA_CONTENT[folded] : undefined
  if (a) {
    return {
      highlights: { th: a.highlights_th, en: a.highlights_en },
      body: { th: a.body_th, en: a.body_en },
      faq: { th: a.faq_th, en: a.faq_en },
    }
  }
  const p = type === null ? PLACE_CONTENT[placeKey] : undefined
  return p ? { ...p, faq: { th: [], en: [] } } : null
}

export const PLACE_CONTENT: Record<string, PlaceContent> = {
  // ── Universities ───────────────────────────────────────────────────────────
  'landmark:chula': {
    highlights: {
      th: ['ใจกลางเมือง ติดสยาม สามย่าน และบรรทัดทอง', 'MRT สามย่าน และ BTS สยาม / สนามกีฬาแห่งชาติ เดินถึงหรือนั่งต่อสั้นๆ', 'ใกล้สามย่านมิตรทาวน์ MBK และโรงพยาบาลจุฬาลงกรณ์', 'มีทั้งหอพัก อพาร์ทเม้นท์ และคอนโดใกล้มหาวิทยาลัย'],
      en: ['Central Bangkok, next to Siam, Sam Yan and Banthat Thong', 'MRT Sam Yan and BTS Siam / National Stadium within walking or a short ride', 'Close to Samyan Mitrtown, MBK and King Chulalongkorn Memorial Hospital', 'Dorms, apartments and condos all within reach of campus'],
    },
    body: {
      th: [
        'จุฬาลงกรณ์มหาวิทยาลัยตั้งอยู่ในเขตปทุมวัน ล้อมรอบด้วยสยาม สามย่าน และถนนบรรทัดทอง นิสิต อาจารย์ และบุคลากรโรงพยาบาลจุฬาฯ จำนวนมากจึงเลือกเช่าที่พักในรัศมีที่เดินหรือนั่งรถสั้นๆ ถึงได้ ทั้งหอพักในซอยจุฬาฯ อพาร์ทเม้นท์ย่านสามย่าน และคอนโดตามแนวพระราม 4 และบรรทัดทอง',
        'การเดินทางสะดวกทั้ง MRT สามย่าน และ BTS สยามกับสนามกีฬาแห่งชาติ ร้านอาหารและร้านค้าตลอดบรรทัดทองเปิดถึงดึก ห้องใกล้มหาวิทยาลัยมีคนถามหาตลอดปี โดยเฉพาะช่วงก่อนเปิดภาคเรียน ควรเริ่มหาล่วงหน้า',
      ],
      en: [
        'Chulalongkorn University sits in Pathum Wan, surrounded by Siam, Sam Yan and Banthat Thong Road. Students, staff and the team at King Chulalongkorn Memorial Hospital tend to rent within walking distance or a short ride: dorms in the Chula sois, apartments around Sam Yan, and condos along Rama 4 and Banthat Thong.',
        'MRT Sam Yan and BTS Siam and National Stadium are all close, and Banthat Thong\'s restaurants stay open late. Rooms near campus are in demand all year, most of all just before term starts, so it pays to look early.',
      ],
    },
  },
  'landmark:kasetsart': {
    highlights: {
      th: ['BTS มหาวิทยาลัยเกษตรศาสตร์ และรถไฟฟ้าสายสีแดง สถานีบางเขน', 'หอพักและอพาร์ทเม้นท์จำนวนมากตามถนนงามวงศ์วาน พหลโยธิน และเสนานิคม', 'ใกล้โรงพยาบาลวิภาวดี', 'นั่ง BTS ไม่กี่สถานีถึงห้าแยกลาดพร้าวและหมอชิต'],
      en: ['BTS Kasetsart University and the SRT Red Line at Bang Khen', 'Plenty of dorms and apartments along Ngamwongwan, Phahonyothin and Sena Nikhom', 'Near Vibhavadi Hospital', 'A few BTS stops to Ha Yaek Lat Phrao and Mo Chit'],
    },
    body: {
      th: [
        'มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตบางเขน เป็นหนึ่งในวิทยาเขตที่ใหญ่ที่สุดในกรุงเทพฯ รอบมหาวิทยาลัยจึงมีหอพักและอพาร์ทเม้นท์ให้เลือกมาก โดยเฉพาะตามถนนงามวงศ์วาน ถนนพหลโยธิน และซอยเสนานิคม ราคามักเป็นมิตรกับนิสิตมากกว่าย่านใจกลางเมือง',
        'BTS สายสุขุมวิทส่วนต่อขยายมีสถานีมหาวิทยาลัยเกษตรศาสตร์ และรถไฟฟ้าสายสีแดงจอดที่สถานีบางเขน เดินทางเข้าเมืองหรือไปดอนเมืองได้ง่าย ผู้เช่ากลุ่มคนทำงานย่านพหลโยธินและวิภาวดีก็นิยมทำเลนี้เช่นกัน',
      ],
      en: [
        'Kasetsart\'s Bang Khen campus is one of the largest in Bangkok, so the streets around it are full of dorms and apartments, especially along Ngamwongwan Road, Phahonyothin Road and the Sena Nikhom sois. Rents are generally kinder to students than in the city centre.',
        'The BTS Sukhumvit Line extension stops at Kasetsart University, and the SRT Red Line stops at Bang Khen, so the city and Don Mueang are both easy to reach. People working along Phahonyothin and Vibhavadi rent here too.',
      ],
    },
  },
  'landmark:thammasat-tha-phra-chan': {
    highlights: {
      th: ['ริมแม่น้ำเจ้าพระยา ย่านเกาะรัตนโกสินทร์ ติดสนามหลวง', 'เรือด่วนเจ้าพระยาและเรือข้ามฟากที่ท่าพระจันทร์', 'MRT สนามไชย และสามยอด ในระยะไม่ถึง 2 กม.', 'ข้ามฝั่งไปโรงพยาบาลศิริราชได้ด้วยเรือข้ามฟาก'],
      en: ['On the Chao Phraya in Rattanakosin, next to Sanam Luang', 'Chao Phraya Express and cross-river ferries at Tha Phra Chan pier', 'MRT Sanam Chai and Sam Yot within 2 km', 'A short ferry across to Siriraj Hospital'],
    },
    body: {
      th: [
        'มหาวิทยาลัยธรรมศาสตร์ ท่าพระจันทร์ อยู่ในเขตเมืองเก่าริมแม่น้ำเจ้าพระยา ซึ่งมีข้อจำกัดเรื่องความสูงอาคาร ที่พักในย่านจึงเป็นอพาร์ทเม้นท์และห้องเช่าขนาดเล็กเป็นหลัก หลายคนเลือกเช่าย่านบางลำพู ถนนข้าวสาร หรือข้ามฝั่งไปบางกอกน้อย อรุณอมรินทร์ และปิ่นเกล้า ที่มีคอนโดมากกว่า',
        'การเดินทางใช้ได้ทั้งเรือด่วนเจ้าพระยา เรือข้ามฟาก และ MRT สายสีน้ำเงินที่สถานีสนามไชยและสามยอด เหมาะกับนักศึกษาและบุคลากรที่ต้องการอยู่ใกล้ท่าพระจันทร์ รวมถึงผู้ที่ทำงานโรงพยาบาลศิริราชฝั่งตรงข้าม',
      ],
      en: [
        'Thammasat\'s Tha Phra Chan campus is in the old town on the Chao Phraya, where building heights are restricted, so rentals nearby are mostly apartments and small rooms. Many people rent in Banglamphu or around Khaosan Road, or cross the river to Bangkok Noi, Arun Amarin and Pinklao, where there are more condos.',
        'You can get around by Chao Phraya Express boat, the cross-river ferry, or the MRT Blue Line at Sanam Chai and Sam Yot. It suits students and staff who want to be close to Tha Phra Chan, and people working at Siriraj Hospital across the river.',
      ],
    },
  },
  'landmark:silpakorn-wang-tha-phra': {
    highlights: {
      th: ['ใจกลางเกาะรัตนโกสินทร์ ใกล้พระบรมมหาราชวัง', 'ติดกับธรรมศาสตร์ ท่าพระจันทร์ และท่าเรือท่าช้าง / ท่าพระจันทร์', 'MRT สนามไชย ประมาณ 1 กม.', 'ข้ามฝั่งไปศิริราชและปิ่นเกล้าได้สะดวก'],
      en: ['In the heart of Rattanakosin, near the Grand Palace', 'Next to Thammasat Tha Phra Chan and the Tha Chang / Tha Phra Chan piers', 'About 1 km to MRT Sanam Chai', 'Easy to cross to Siriraj and Pinklao'],
    },
    body: {
      th: [
        'มหาวิทยาลัยศิลปากร วังท่าพระ อยู่ในย่านเมืองเก่าที่เต็มไปด้วยวัด พิพิธภัณฑ์ และร้านอาหารดั้งเดิม ที่พักใกล้มหาวิทยาลัยมีจำกัดเพราะเป็นเขตอนุรักษ์ ส่วนใหญ่เป็นห้องเช่าและอพาร์ทเม้นท์ขนาดเล็กในย่านบางลำพู ท่าเตียน และฝั่งธนบุรี',
        'นักศึกษาหลายคนเลือกเช่าคอนโดฝั่งปิ่นเกล้าและบางกอกน้อย แล้วนั่งเรือข้ามฟากหรือรถเมล์มาเรียน หรือเช่าใกล้ MRT สนามไชยและสามยอดที่ต่อเข้าเมืองได้ง่าย',
      ],
      en: [
        'Silpakorn\'s Wang Tha Phra campus is in the old town, among temples, museums and long-standing restaurants. Housing right by campus is limited because the area is protected, so most rentals are rooms and small apartments in Banglamphu, Tha Tien and across the river in Thonburi.',
        'Many students rent condos in Pinklao or Bangkok Noi and come over by ferry or bus, or rent near MRT Sanam Chai and Sam Yot for an easy ride into the city.',
      ],
    },
  },
  'landmark:kmitl': {
    highlights: {
      th: ['หอพักและอพาร์ทเม้นท์หนาแน่นรอบสถาบัน โดยเฉพาะย่านเกกีงามและถนนฉลองกรุง', 'Airport Rail Link สถานีลาดกระบัง', 'ใกล้สนามบินสุวรรณภูมิ', 'ราคาเช่าต่ำกว่าย่านใจกลางเมืองมาก'],
      en: ['A dense cluster of dorms and apartments around campus, especially the Keki Ngam sois and Chalong Krung Road', 'Airport Rail Link at Lat Krabang', 'Close to Suvarnabhumi Airport', 'Rents well below the city centre'],
    },
    body: {
      th: [
        'สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง มีนักศึกษาจำนวนมาก ย่านรอบสถาบันจึงกลายเป็นชุมชนหอพักขนาดใหญ่ ทั้งในซอยเกกีงามและตามถนนฉลองกรุง มีร้านอาหาร ร้านสะดวกซื้อ และบริการซักรีดรองรับครบ',
        'Airport Rail Link สถานีลาดกระบังพาเข้าเมืองถึงพญาไทได้โดยตรง และอยู่ใกล้สนามบินสุวรรณภูมิ ทำเลนี้จึงเหมาะกับทั้งนักศึกษาและคนที่ทำงานในสนามบินหรือนิคมอุตสาหกรรมลาดกระบัง',
      ],
      en: [
        'KMITL has a large student body, and the streets around campus have grown into a big dorm community, in the Keki Ngam sois and along Chalong Krung Road, with restaurants, convenience stores and laundries to match.',
        'The Airport Rail Link at Lat Krabang runs straight into the city at Phaya Thai, and Suvarnabhumi is close by. The area suits students as well as people working at the airport or the Lat Krabang industrial estate.',
      ],
    },
  },
  'landmark:kmutt': {
    highlights: {
      th: ['หอพักและอพาร์ทเม้นท์ตามถนนประชาอุทิศและซอยรอบมหาวิทยาลัย', 'ใกล้เซ็นทรัล พระราม 2', 'ย่านที่อยู่อาศัย เงียบ ราคาเช่าย่อมเยา', 'เข้าเมืองผ่านถนนพระราม 2 และสุขสวัสดิ์'],
      en: ['Dorms and apartments along Pracha Uthit Road and the sois around campus', 'Near Central Rama 2', 'Quiet residential area with modest rents', 'Into the city via Rama 2 and Suk Sawat roads'],
    },
    body: {
      th: [
        'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี (บางมด) อยู่ในเขตทุ่งครุ ฝั่งธนบุรี รอบมหาวิทยาลัยมีหอพักและอพาร์ทเม้นท์มากมายตามถนนประชาอุทิศ นักศึกษาส่วนใหญ่เช่าห้องที่เดินหรือนั่งมอเตอร์ไซค์รับจ้างถึงมหาวิทยาลัยได้',
        'ย่านนี้ยังไม่มีรถไฟฟ้าผ่าน การเดินทางเข้าเมืองใช้ถนนพระราม 2 และสุขสวัสดิ์ ข้อดีคือค่าเช่าต่ำกว่าฝั่งพระนครมาก และมีห้างอย่างเซ็นทรัล พระราม 2 ไม่ไกล',
      ],
      en: [
        'KMUTT (Bang Mod) is in Thung Khru on the Thonburi side. Pracha Uthit Road and the sois around campus are lined with dorms and apartments, and most students rent somewhere they can walk or take a motorbike taxi to class.',
        'There is no rail line here yet, so trips into the city go via Rama 2 and Suk Sawat roads. In return, rents are far lower than on the Phra Nakhon side, and Central Rama 2 is not far.',
      ],
    },
  },
  'landmark:ramkhamhaeng': {
    highlights: {
      th: ['ชุมชนหอพักขนาดใหญ่ตามถนนรามคำแหงและซอยแยก', 'Airport Rail Link สถานีรามคำแหง และ MRT สายสีเหลือง', 'ใกล้เดอะมอลล์บางกะปิ', 'ค่าเช่าหลากหลาย ตั้งแต่ห้องพัดลมถึงคอนโด'],
      en: ['A huge dorm community along Ramkhamhaeng Road and its sois', 'Airport Rail Link at Ramkhamhaeng and the MRT Yellow Line', 'Near The Mall Bangkapi', 'Everything from fan rooms to condos'],
    },
    body: {
      th: [
        'มหาวิทยาลัยรามคำแหงเป็นมหาวิทยาลัยเปิดที่มีนักศึกษาจำนวนมาก ถนนรามคำแหงและซอยแยกจึงเต็มไปด้วยหอพัก อพาร์ทเม้นท์ ร้านถ่ายเอกสาร และร้านอาหารราคาประหยัด เป็นหนึ่งในย่านห้องเช่าที่ใหญ่ที่สุดของกรุงเทพฯ',
        'การเดินทางใช้ได้ทั้ง Airport Rail Link สถานีรามคำแหง MRT สายสีเหลืองที่วิ่งตามถนนลาดพร้าวและศรีนครินทร์ และรถเมล์หลายสาย ใกล้เดอะมอลล์บางกะปิ เหมาะทั้งนักศึกษาและคนทำงานที่ต้องการค่าเช่าไม่สูง',
      ],
      en: [
        'Ramkhamhaeng is an open university with a very large student body, so Ramkhamhaeng Road and its sois are packed with dorms, apartments, print shops and cheap restaurants. It is one of the biggest rental areas in Bangkok.',
        'You can travel by Airport Rail Link at Ramkhamhaeng, the MRT Yellow Line along Lat Phrao and Srinagarindra, or many bus routes. The Mall Bangkapi is nearby. It suits students and workers looking for a lower rent.',
      ],
    },
  },
  'landmark:mahidol-salaya': {
    highlights: {
      th: ['วิทยาเขตขนาดใหญ่ในอำเภอพุทธมณฑล จังหวัดนครปฐม', 'หอพักและอพาร์ทเม้นท์จำนวนมากรอบศาลายา', 'บรรยากาศเงียบ พื้นที่สีเขียวเยอะ', 'เข้ากรุงเทพฯ ผ่านถนนบรมราชชนนีและพุทธมณฑลสาย 4'],
      en: ['A large campus in Phutthamonthon, Nakhon Pathom', 'Many dorms and apartments around Salaya', 'Quiet, green surroundings', 'Into Bangkok via Borommaratchachonnani and Phutthamonthon Sai 4 roads'],
    },
    body: {
      th: [
        'มหาวิทยาลัยมหิดล ศาลายา เป็นวิทยาเขตหลักที่อยู่นอกตัวเมืองกรุงเทพฯ ย่านศาลายาจึงเติบโตเป็นชุมชนหอพักและอพาร์ทเม้นท์สำหรับนักศึกษาและบุคลากร มีตลาด ร้านอาหาร และร้านค้าครบในระยะใกล้',
        'ผู้เช่าส่วนใหญ่เลือกอยู่ใกล้มหาวิทยาลัยเพราะการเดินทางเข้าเมืองใช้เวลา ทำเลนี้ให้ห้องที่กว้างขึ้นในราคาที่ต่ำกว่ากรุงเทพฯ ชั้นใน และบรรยากาศเงียบสงบเหมาะกับการเรียน',
      ],
      en: [
        'Mahidol\'s Salaya campus is its main campus, outside central Bangkok, and Salaya has grown into a community of dorms and apartments for students and staff, with markets, restaurants and shops close by.',
        'Most renters stay near campus because the trip into the city takes time. In exchange you get more space for less rent than inner Bangkok, and a quiet setting that suits studying.',
      ],
    },
  },
  'landmark:nida': {
    highlights: {
      th: ['MRT สายสีเหลือง สถานีแยกลำสาลีและบางกะปิ', 'ใกล้เดอะมอลล์บางกะปิและแฮปปี้แลนด์', 'ผู้เช่าส่วนใหญ่เป็นนักศึกษาปริญญาโท-เอกและคนทำงาน', 'คอนโดและอพาร์ทเม้นท์ตามถนนเสรีไทยและนวมินทร์'],
      en: ['MRT Yellow Line at Yaek Lam Sali and Bang Kapi', 'Near The Mall Bangkapi and Happyland', 'Mostly postgraduate students and working professionals', 'Condos and apartments along Seri Thai and Nawamin roads'],
    },
    body: {
      th: [
        'สถาบันบัณฑิตพัฒนบริหารศาสตร์ (นิด้า) อยู่ถนนเสรีไทย เขตบางกะปิ เป็นสถาบันระดับบัณฑิตศึกษา ผู้เช่าในย่านนี้จึงมักเป็นนักศึกษาที่ทำงานไปด้วย ต้องการห้องที่เงียบและเดินทางไปที่ทำงานได้สะดวก',
        'MRT สายสีเหลืองสถานีแยกลำสาลีและบางกะปิทำให้ต่อไปลาดพร้าวและศรีนครินทร์ได้ง่าย รอบๆ มีทั้งคอนโดใหม่ อพาร์ทเม้นท์ และห้างอย่างเดอะมอลล์บางกะปิ',
      ],
      en: [
        'NIDA is on Seri Thai Road in Bang Kapi and teaches at graduate level, so renters here are often students who also work, looking for a quiet room with an easy commute.',
        'The MRT Yellow Line at Yaek Lam Sali and Bang Kapi links to Lat Phrao and Srinagarindra. Around it are new condos, apartments and malls such as The Mall Bangkapi.',
      ],
    },
  },
  'landmark:kmutnb': {
    highlights: {
      th: ['MRT สายสีม่วง สถานีบางโพ และวงศ์สว่าง', 'ใกล้สถานีกลางกรุงเทพอภิวัฒน์ (บางซื่อ)', 'หอพักและอพาร์ทเม้นท์ตามถนนประชาราษฎร์สาย 1 และพิบูลสงคราม', 'ใกล้โรงพยาบาลยันฮี'],
      en: ['MRT Purple Line at Bang Pho and Wong Sawang', 'Near Krung Thep Aphiwat Central Terminal (Bang Sue)', 'Dorms and apartments along Pracharat Sai 1 and Phibun Songkhram roads', 'Near Yanhee Hospital'],
    },
    body: {
      th: [
        'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ อยู่ย่านบางซื่อ ใกล้แม่น้ำเจ้าพระยา รอบมหาวิทยาลัยมีหอพักและอพาร์ทเม้นท์สำหรับนักศึกษาจำนวนมาก โดยเฉพาะตามถนนประชาราษฎร์สาย 1',
        'MRT สายสีม่วงที่บางโพและวงศ์สว่าง และสถานีกลางกรุงเทพอภิวัฒน์ที่อยู่ไม่ไกล ทำให้ทำเลนี้เดินทางได้หลายทาง ทั้งเข้าเมืองและไปนนทบุรี คนทำงานย่านบางซื่อก็นิยมเช่าที่นี่',
      ],
      en: [
        'KMUTNB is in Bang Sue, near the Chao Phraya. There are many student dorms and apartments around campus, especially along Pracharat Sai 1 Road.',
        'The MRT Purple Line at Bang Pho and Wong Sawang, and Krung Thep Aphiwat Central Terminal nearby, give plenty of ways to get around, into the city or out to Nonthaburi. People working in Bang Sue rent here too.',
      ],
    },
  },
  'landmark:utcc': {
    highlights: {
      th: ['ถนนวิภาวดีรังสิต เขตดินแดง', 'MRT ห้วยขวางและสุทธิสาร, BTS อารีย์ ในระยะประมาณ 2 กม.', 'หอพักและอพาร์ทเม้นท์ย่านดินแดง ประชาสงเคราะห์ และสุทธิสาร', 'ใกล้เอสพลานาด รัชดาฯ'],
      en: ['On Vibhavadi Rangsit Road in Din Daeng', 'MRT Huai Khwang and Sutthisan, BTS Ari, all around 2 km', 'Dorms and apartments in Din Daeng, Pracha Songkhro and Sutthisan', 'Near Esplanade Ratchada'],
    },
    body: {
      th: [
        'มหาวิทยาลัยหอการค้าไทยอยู่ริมถนนวิภาวดีรังสิต ย่านดินแดง นักศึกษานิยมเช่าหอพักและอพาร์ทเม้นท์ในซอยประชาสงเคราะห์ ดินแดง และสุทธิสาร ที่มีร้านอาหารและร้านค้าครบ',
        'ทำเลนี้อยู่ระหว่าง MRT สายสีน้ำเงิน (ห้วยขวาง สุทธิสาร) และ BTS อารีย์ จึงเดินทางไปรัชดาฯ พหลโยธิน และใจกลางเมืองได้สะดวก เหมาะทั้งนักศึกษาและคนทำงานย่านวิภาวดี',
      ],
      en: [
        'UTCC is on Vibhavadi Rangsit Road in Din Daeng. Students tend to rent dorms and apartments in the Pracha Songkhro, Din Daeng and Sutthisan sois, which have plenty of food and shops.',
        'The area sits between the MRT Blue Line (Huai Khwang, Sutthisan) and BTS Ari, so Ratchada, Phahonyothin and the city centre are all easy to reach. It suits students and people working along Vibhavadi.',
      ],
    },
  },
  'landmark:chandrakasem': {
    highlights: {
      th: ['ถนนรัชดาภิเษก ช่วงลาดพร้าว เขตจตุจักร', 'BTS พหลโยธิน 24 และรัชโยธิน, MRT ลาดพร้าว', 'ใกล้เซ็นทรัลลาดพร้าวและยูเนี่ยนมอลล์', 'อพาร์ทเม้นท์และคอนโดหลายระดับราคา'],
      en: ['On Ratchadaphisek Road near Lat Phrao, Chatuchak', 'BTS Phahon Yothin 24 and Ratchayothin, MRT Lat Phrao', 'Near Central Ladprao and Union Mall', 'Apartments and condos across price ranges'],
    },
    body: {
      th: [
        'มหาวิทยาลัยราชภัฏจันทรเกษมอยู่ถนนรัชดาภิเษก ระหว่างแยกรัชโยธินและแยกลาดพร้าว ย่านนี้มีทั้งหอพักนักศึกษา อพาร์ทเม้นท์ และคอนโดใหม่ตามแนวรถไฟฟ้า',
        'เดินทางได้ทั้ง BTS สายสุขุมวิท (พหลโยธิน 24 รัชโยธิน) และ MRT สายสีน้ำเงิน (ลาดพร้าว) ใกล้แหล่งช้อปปิ้งอย่างเซ็นทรัลลาดพร้าวและยูเนี่ยนมอลล์ เหมาะกับนักศึกษาและคนทำงานย่านรัชโยธิน',
      ],
      en: [
        'Chandrakasem Rajabhat University is on Ratchadaphisek Road between the Ratchayothin and Lat Phrao junctions. The area has student dorms, apartments and new condos along the rail lines.',
        'Both the BTS Sukhumvit Line (Phahon Yothin 24, Ratchayothin) and the MRT Blue Line (Lat Phrao) are close, as are Central Ladprao and Union Mall. It suits students and people working around Ratchayothin.',
      ],
    },
  },
  'landmark:sripatum': {
    highlights: {
      th: ['BTS บางบัว อยู่หน้ามหาวิทยาลัย', 'หอพักและอพาร์ทเม้นท์ตามถนนพหลโยธินและซอยบางบัว', 'ใกล้มหาวิทยาลัยเกษตรศาสตร์', 'นั่ง BTS ตรงเข้าหมอชิตและสยาม'],
      en: ['BTS Bang Bua right outside campus', 'Dorms and apartments along Phahonyothin and the Bang Bua sois', 'Near Kasetsart University', 'Direct BTS to Mo Chit and Siam'],
    },
    body: {
      th: [
        'มหาวิทยาลัยศรีปทุมอยู่ริมถนนพหลโยธิน เขตบางเขน มี BTS บางบัวอยู่หน้ามหาวิทยาลัย ห้องเช่าในรัศมีเดินถึงสถานีจึงเป็นที่ต้องการทั้งจากนักศึกษาและคนทำงาน',
        'ย่านนี้มีหอพักและอพาร์ทเม้นท์ราคาเป็นมิตร ใกล้มหาวิทยาลัยเกษตรศาสตร์และกรมป่าไม้ นั่ง BTS สายสุขุมวิทเข้าหมอชิต อารีย์ และสยามได้โดยไม่ต้องเปลี่ยนสาย',
      ],
      en: [
        'Sripatum University is on Phahonyothin Road in Bang Khen, with BTS Bang Bua right outside. Rooms within walking distance of the station are wanted by students and workers alike.',
        'The area has reasonably priced dorms and apartments, close to Kasetsart University and the Royal Forest Department. The BTS Sukhumvit Line runs straight to Mo Chit, Ari and Siam with no change.',
      ],
    },
  },
  'landmark:dpu': {
    highlights: {
      th: ['ถนนประชาชื่น เขตหลักสี่', 'รถไฟฟ้าสายสีแดง สถานีทุ่งสองห้อง', 'ใกล้ศูนย์ราชการแจ้งวัฒนะ และ MRT สายสีชมพู', 'หอพักและอพาร์ทเม้นท์ราคาประหยัดตามประชาชื่นและงามวงศ์วาน'],
      en: ['On Prachachuen Road in Lak Si', 'SRT Red Line at Thung Song Hong', 'Near the Chaeng Watthana Government Complex and the MRT Pink Line', 'Budget dorms and apartments along Prachachuen and Ngamwongwan'],
    },
    body: {
      th: [
        'มหาวิทยาลัยธุรกิจบัณฑิตย์อยู่ถนนประชาชื่น เขตหลักสี่ รอบมหาวิทยาลัยมีหอพักและอพาร์ทเม้นท์สำหรับนักศึกษาจำนวนมาก ราคาส่วนใหญ่ย่อมเยากว่าย่านใจกลางเมือง',
        'รถไฟฟ้าสายสีแดงสถานีทุ่งสองห้อง และ MRT สายสีชมพูตามถนนแจ้งวัฒนะ ช่วยให้เดินทางไปบางซื่อ ดอนเมือง และศูนย์ราชการได้สะดวก ข้าราชการและคนทำงานย่านแจ้งวัฒนะก็เช่าในย่านนี้',
      ],
      en: [
        'Dhurakij Pundit University is on Prachachuen Road in Lak Si. There are many student dorms and apartments around campus, mostly cheaper than in the city centre.',
        'The SRT Red Line at Thung Song Hong and the MRT Pink Line along Chaeng Watthana make Bang Sue, Don Mueang and the Government Complex easy to reach. Civil servants and others working on Chaeng Watthana rent here too.',
      ],
    },
  },
  'landmark:krirk': {
    highlights: {
      th: ['ถนนรามอินทรา ใกล้วงเวียนบางเขน', 'MRT รามอินทรา 3 และสถานีร่วม BTS/MRT วัดพระศรีมหาธาตุ', 'ต่อ BTS สายสุขุมวิทและ MRT สายสีชมพูได้ที่สถานีเดียว', 'อพาร์ทเม้นท์และคอนโดราคาเป็นมิตร'],
      en: ['On Ram Inthra Road near the Bang Khen roundabout', 'MRT Ram Inthra 3 and the BTS/MRT Wat Phra Sri Mahathat interchange', 'BTS Sukhumvit Line and MRT Pink Line from one station', 'Reasonably priced apartments and condos'],
    },
    body: {
      th: [
        'มหาวิทยาลัยเกริกอยู่ต้นถนนรามอินทรา ใกล้วงเวียนบางเขนและอนุสาวรีย์หลักสี่ ย่านนี้มีอพาร์ทเม้นท์และคอนโดใหม่เพิ่มขึ้นมากตามแนวรถไฟฟ้า',
        'สถานีวัดพระศรีมหาธาตุเป็นจุดเปลี่ยนระหว่าง BTS สายสุขุมวิทและ MRT สายสีชมพู ส่วน MRT รามอินทรา 3 อยู่ใกล้มหาวิทยาลัย เดินทางเข้าเมืองหรือไปแจ้งวัฒนะและมีนบุรีได้สะดวก',
      ],
      en: [
        'Krirk University is at the start of Ram Inthra Road, near the Bang Khen roundabout and the Lak Si monument. New apartments and condos have been going up along the rail lines here.',
        'Wat Phra Sri Mahathat is the interchange between the BTS Sukhumvit Line and the MRT Pink Line, and MRT Ram Inthra 3 is right by campus, so the city, Chaeng Watthana and Min Buri are all easy to reach.',
      ],
    },
  },
  'landmark:bangkok-university-rangsit': {
    highlights: {
      th: ['ถนนพหลโยธิน อำเภอคลองหลวง จังหวัดปทุมธานี', 'หอพักและอพาร์ทเม้นท์หนาแน่นรอบมหาวิทยาลัย', 'ใกล้ฟิวเจอร์พาร์ค รังสิต', 'รถไฟฟ้าสายสีแดง สถานีรังสิต'],
      en: ['On Phahonyothin Road in Khlong Luang, Pathum Thani', 'A dense cluster of dorms and apartments around campus', 'Near Future Park Rangsit', 'SRT Red Line at Rangsit'],
    },
    body: {
      th: [
        'มหาวิทยาลัยกรุงเทพ วิทยาเขตรังสิต อยู่ริมถนนพหลโยธินในจังหวัดปทุมธานี นักศึกษาส่วนใหญ่เช่าหอพักและอพาร์ทเม้นท์ที่อยู่รอบมหาวิทยาลัย ซึ่งมีให้เลือกมากและราคาเป็นมิตร',
        'ย่านรังสิตมีห้างใหญ่อย่างฟิวเจอร์พาร์ค และรถไฟฟ้าสายสีแดงสถานีรังสิตที่ต่อเข้าบางซื่อได้ เหมาะกับผู้ที่ต้องการห้องกว้างในราคาต่ำกว่ากรุงเทพฯ',
      ],
      en: [
        'Bangkok University\'s Rangsit campus is on Phahonyothin Road in Pathum Thani. Most students rent the dorms and apartments around campus, of which there are plenty at friendly prices.',
        'Rangsit has big malls such as Future Park, and the SRT Red Line at Rangsit runs into Bang Sue. It suits people who want more space for less than Bangkok rents.',
      ],
    },
  },
  'landmark:kasem-bundit': {
    highlights: {
      th: ['ถนนพัฒนาการ เขตสวนหลวง ติดสถาบันไทย-ญี่ปุ่น', 'Airport Rail Link และ MRT สายสีเหลือง สถานีหัวหมาก', 'อพาร์ทเม้นท์และคอนโดตามแนวพัฒนาการ', 'ใกล้มหาวิทยาลัยรามคำแหง'],
      en: ['On Phatthanakan Road in Suan Luang, next to Thai-Nichi Institute', 'Airport Rail Link and MRT Yellow Line at Hua Mak', 'Apartments and condos along Phatthanakan', 'Near Ramkhamhaeng University'],
    },
    body: {
      th: [
        'มหาวิทยาลัยเกษมบัณฑิต วิทยาเขตพัฒนาการ อยู่ติดกับสถาบันเทคโนโลยีไทย-ญี่ปุ่น ทำให้ย่านนี้มีนักศึกษาสองสถาบันมาเช่าที่พักรวมกัน มีทั้งหอพักในซอยและคอนโดตามถนนพัฒนาการ',
        'สถานีหัวหมากเป็นจุดเปลี่ยนระหว่าง Airport Rail Link และ MRT สายสีเหลือง เดินทางเข้าเมือง ไปสุวรรณภูมิ หรือไปลาดพร้าวและศรีนครินทร์ได้ง่าย',
      ],
      en: [
        'Kasem Bundit\'s Phatthanakan campus is next door to Thai-Nichi Institute of Technology, so students from both rent in the area, from dorms in the sois to condos along Phatthanakan Road.',
        'Hua Mak is the interchange between the Airport Rail Link and the MRT Yellow Line, so the city, Suvarnabhumi, Lat Phrao and Srinagarindra are all easy to reach.',
      ],
    },
  },
  'landmark:tni': {
    highlights: {
      th: ['ถนนพัฒนาการ เขตสวนหลวง ติดมหาวิทยาลัยเกษมบัณฑิต', 'Airport Rail Link และ MRT สายสีเหลือง สถานีหัวหมาก', 'หลักสูตรเชื่อมกับอุตสาหกรรมญี่ปุ่น', 'หอพักและคอนโดตามแนวพัฒนาการ'],
      en: ['On Phatthanakan Road in Suan Luang, next to Kasem Bundit University', 'Airport Rail Link and MRT Yellow Line at Hua Mak', 'Programmes linked to Japanese industry', 'Dorms and condos along Phatthanakan'],
    },
    body: {
      th: [
        'สถาบันเทคโนโลยีไทย-ญี่ปุ่นอยู่ถนนพัฒนาการ ติดกับมหาวิทยาลัยเกษมบัณฑิต นักศึกษานิยมเช่าหอพักในซอยพัฒนาการและคอนโดใกล้สถานีหัวหมาก',
        'Airport Rail Link และ MRT สายสีเหลืองที่หัวหมากพาไปได้ทั้งใจกลางเมือง สุวรรณภูมิ และศรีนครินทร์ ทำเลนี้ค่าเช่าต่ำกว่าย่านพระราม 9 ที่อยู่ไม่ไกล',
      ],
      en: [
        'Thai-Nichi Institute of Technology is on Phatthanakan Road, next to Kasem Bundit University. Students tend to rent dorms in the Phatthanakan sois or condos near Hua Mak station.',
        'The Airport Rail Link and MRT Yellow Line at Hua Mak reach the city centre, Suvarnabhumi and Srinagarindra. Rents are lower than in nearby Rama 9.',
      ],
    },
  },
  'landmark:stamford': {
    highlights: {
      th: ['ย่านหัวหมาก ใกล้ Airport Rail Link และ MRT สายสีเหลือง', 'นักศึกษานานาชาติจำนวนมาก', 'คอนโดและอพาร์ทเม้นท์พร้อมเฟอร์นิเจอร์', 'ไม่ไกลจากย่านพระราม 9'],
      en: ['Hua Mak, near the Airport Rail Link and MRT Yellow Line', 'A large international student body', 'Furnished condos and apartments', 'Not far from Rama 9'],
    },
    body: {
      th: [
        'มหาวิทยาลัยนานาชาติแสตมฟอร์ด วิทยาเขตกรุงเทพฯ มีนักศึกษาต่างชาติจำนวนมาก ผู้เช่าในย่านนี้จึงมักมองหาคอนโดหรืออพาร์ทเม้นท์พร้อมเฟอร์นิเจอร์ สัญญายืดหยุ่น และอยู่ใกล้สถานีรถไฟฟ้า',
        'สถานีหัวหมาก (Airport Rail Link และ MRT สายสีเหลือง) และกาลันตันอยู่ในระยะไม่ถึง 3 กม. เดินทางไปสุวรรณภูมิและใจกลางเมืองได้สะดวก',
      ],
      en: [
        'Stamford International University\'s Bangkok campus has many international students, so renters here usually want furnished condos or apartments, flexible contracts and a station nearby.',
        'Hua Mak (Airport Rail Link and MRT Yellow Line) and Kalantan stations are under 3 km away, for easy trips to Suvarnabhumi and the city centre.',
      ],
    },
  },
  'landmark:mahanakorn': {
    highlights: {
      th: ['ถนนเชื่อมสัมพันธ์ เขตหนองจอก', 'หอพักและอพาร์ทเม้นท์รอบมหาวิทยาลัย', 'ย่านที่อยู่อาศัยชานเมือง เงียบ ค่าเช่าต่ำ', 'เข้าเมืองผ่านมีนบุรีและ MRT สายสีชมพู'],
      en: ['On Chueam Samphan Road in Nong Chok', 'Dorms and apartments around campus', 'Quiet suburban area with low rents', 'Into the city via Min Buri and the MRT Pink Line'],
    },
    body: {
      th: [
        'มหาวิทยาลัยเทคโนโลยีมหานครอยู่เขตหนองจอก ชานเมืองฝั่งตะวันออกของกรุงเทพฯ นักศึกษาส่วนใหญ่เช่าหอพักและอพาร์ทเม้นท์ที่อยู่รอบมหาวิทยาลัย เพราะการเดินทางจากในเมืองใช้เวลานาน',
        'ข้อดีของทำเลนี้คือค่าเช่าต่ำและบรรยากาศเงียบ เมื่อต้องเข้าเมืองสามารถไปต่อรถไฟฟ้า MRT สายสีชมพูที่มีนบุรี',
      ],
      en: [
        'Mahanakorn University of Technology is in Nong Chok on Bangkok\'s eastern edge. Most students rent the dorms and apartments around campus, since getting there from the city takes a while.',
        'Rents are low and the area is quiet. For trips into town, the MRT Pink Line starts at Min Buri.',
      ],
    },
  },
  'landmark:pathumwan-institute': {
    highlights: {
      th: ['ถนนพระราม 1 ติด BTS สนามกีฬาแห่งชาติ', 'ใกล้ MBK สยามเซ็นเตอร์ และสยามพารากอน', 'ใกล้จุฬาลงกรณ์มหาวิทยาลัย', 'ห้องเช่าและอพาร์ทเม้นท์ย่านบรรทัดทองและราชเทวี'],
      en: ['On Rama 1 Road by BTS National Stadium', 'Near MBK, Siam Center and Siam Paragon', 'Close to Chulalongkorn University', 'Rooms and apartments around Banthat Thong and Ratchathewi'],
    },
    body: {
      th: [
        'สถาบันเทคโนโลยีปทุมวันอยู่ใจกลางเมือง ติด BTS สนามกีฬาแห่งชาติและห้าง MBK ที่พักใกล้สถาบันส่วนใหญ่เป็นห้องเช่าและอพาร์ทเม้นท์ย่านบรรทัดทอง ราชเทวี และเพชรบุรี',
        'ทำเลนี้เดินทางสะดวกมาก นั่ง BTS ไปสยามได้ในสถานีเดียว และอยู่ใกล้จุฬาลงกรณ์มหาวิทยาลัย ค่าเช่าสูงกว่าชานเมืองแต่ประหยัดเวลาเดินทาง',
      ],
      en: [
        'Pathumwan Institute of Technology is right in the centre, by BTS National Stadium and MBK. Rentals nearby are mostly rooms and apartments around Banthat Thong, Ratchathewi and Phetchaburi.',
        'It is very well connected: one BTS stop to Siam, and close to Chulalongkorn University. Rents are higher than in the suburbs, but the commute is short.',
      ],
    },
  },

  // ── Stations ───────────────────────────────────────────────────────────────
  'station:E5': {
    highlights: {
      th: ['ติดเอ็มโพเรียม เอ็มควอเทียร์ และเอ็มสเฟียร์', 'ใกล้สวนเบญจกิติ', 'ชุมชนชาวญี่ปุ่นและชาวต่างชาติขนาดใหญ่', 'คอนโดระดับกลางถึงพรีเมียมตามซอยสุขุมวิท 24, 26, 33 และ 39'],
      en: ['Next to Emporium, EmQuartier and EmSphere', 'Near Benjakitti Park', 'A large Japanese and expat community', 'Mid-range to premium condos along Sukhumvit 24, 26, 33 and 39'],
    },
    body: {
      th: [
        'พร้อมพงษ์เป็นหนึ่งในทำเลเช่าคอนโดที่ได้รับความนิยมที่สุดบนถนนสุขุมวิท มีห้างเอ็มโพเรียม เอ็มควอเทียร์ และเอ็มสเฟียร์อยู่ติดสถานี และมีชุมชนชาวญี่ปุ่นขนาดใหญ่ ทำให้มีซูเปอร์มาร์เก็ต ร้านอาหาร และคลินิกที่รองรับชาวต่างชาติครบ',
        'คอนโดในซอยสุขุมวิท 24, 26, 33 และ 39 มีตั้งแต่ห้องสตูดิโอไปจนถึงห้องครอบครัวขนาดใหญ่ ใกล้สวนเบญจกิติ และนั่ง BTS ไปอโศกเพื่อต่อ MRT ได้ในสถานีเดียว',
      ],
      en: [
        'Phrom Phong is one of the most sought-after condo areas on Sukhumvit. Emporium, EmQuartier and EmSphere sit by the station, and the large Japanese community means supermarkets, restaurants and clinics that cater to foreign residents.',
        'Condos on Sukhumvit 24, 26, 33 and 39 run from studios to large family units. Benjakitti Park is close, and Asok, for the MRT, is one BTS stop away.',
      ],
    },
  },
  'station:E3': {
    highlights: {
      th: ['สุขุมวิทซอย 3–15 ใจกลางย่านธุรกิจ', 'ใกล้โรงพยาบาลบำรุงราษฎร์', 'เดินถึงอโศก เทอร์มินอล 21 และ MRT สุขุมวิท', 'เซอร์วิสอพาร์ทเม้นท์และคอนโดพร้อมอยู่จำนวนมาก'],
      en: ['Sukhumvit Sois 3–15, in the heart of the business district', 'Near Bumrungrad International Hospital', 'Walk to Asok, Terminal 21 and MRT Sukhumvit', 'Plenty of serviced apartments and ready-to-move-in condos'],
    },
    body: {
      th: [
        'นานาอยู่ระหว่างเพลินจิตและอโศก ครอบคลุมสุขุมวิทซอย 3 ถึง 15 เป็นย่านที่มีเซอร์วิสอพาร์ทเม้นท์ โรงแรม และคอนโดพร้อมอยู่จำนวนมาก ผู้เช่ามีทั้งคนทำงานต่างชาติ ผู้ที่มารักษาตัวที่โรงพยาบาลบำรุงราษฎร์ และคนที่ต้องการสัญญาระยะสั้น',
        'จากสถานีเดินถึงอโศก เทอร์มินอล 21 และ MRT สุขุมวิทได้ในไม่กี่นาที ร้านอาหารนานาชาติเปิดถึงดึก ห้องในซอยลึกจะเงียบกว่าห้องติดถนนใหญ่',
      ],
      en: [
        'Nana sits between Phloen Chit and Asok, covering Sukhumvit Sois 3 to 15. It is full of serviced apartments, hotels and ready-to-move-in condos, rented by foreign professionals, patients at Bumrungrad, and anyone after a shorter contract.',
        'Asok, Terminal 21 and MRT Sukhumvit are a few minutes\' walk from the station. International restaurants stay open late; rooms deeper in the sois are quieter than those on the main road.',
      ],
    },
  },
  'station:E8': {
    highlights: {
      th: ['สุขุมวิท 71–77 ระหว่างเอกมัยและอ่อนนุช', 'ค่าเช่าต่ำกว่าเอกมัยและทองหล่อ', 'ใกล้เกตเวย์ เอกมัย', 'คอนโดใหม่จำนวนมากตามแนว BTS'],
      en: ['Sukhumvit 71–77, between Ekkamai and On Nut', 'Lower rents than Ekkamai and Thong Lo', 'Near Gateway Ekkamai', 'Many newer condos along the BTS'],
    },
    body: {
      th: [
        'พระโขนงเป็นทางเลือกยอดนิยมของคนที่อยากอยู่สุขุมวิทแต่ไม่อยากจ่ายค่าเช่าระดับทองหล่อ ห่างจากเอกมัยเพียงสถานีเดียว มีคอนโดใหม่ขึ้นตามแนว BTS หลายโครงการ',
        'ย่านนี้มีทั้งตลาดท้องถิ่น ร้านอาหาร และคาเฟ่ ปรีดีพนมยงค์ (สุขุมวิท 71) เชื่อมไปเพชรบุรีตัดใหม่และพระราม 9 ได้ เหมาะกับคนทำงานในเมืองที่ต้องการความคุ้มค่า',
      ],
      en: [
        'Phra Khanong is a popular pick for people who want Sukhumvit without Thong Lo rents. It is one stop from Ekkamai, and several newer condos have gone up along the BTS.',
        'There are local markets, restaurants and cafés, and Pridi Banomyong (Sukhumvit 71) connects north to New Phetchaburi and Rama 9. It suits city workers looking for value.',
      ],
    },
  },
  'station:E10': {
    highlights: {
      th: ['สุขุมวิท 93–99 ระหว่างอ่อนนุชและปุณณวิถี', 'ใกล้ True Digital Park ที่ปุณณวิถี', 'คอนโดราคาเข้าถึงได้ตามแนว BTS', 'ย่านที่อยู่อาศัย มีตลาดและร้านอาหารท้องถิ่น'],
      en: ['Sukhumvit 93–99, between On Nut and Punnawithi', 'Near True Digital Park at Punnawithi', 'Affordable condos along the BTS', 'Residential, with local markets and food'],
    },
    body: {
      th: [
        'บางจากเป็นทำเลคอนโดราคาเข้าถึงได้บนสุขุมวิทตอนปลาย อยู่ระหว่างอ่อนนุชและปุณณวิถี เหมาะกับคนทำงานที่ต้องการห้องใกล้ BTS ในงบที่จำกัด',
        'สถานีถัดไปคือปุณณวิถี ที่ตั้งของ True Digital Park ซึ่งมีบริษัทเทคโนโลยีและสตาร์ทอัพจำนวนมาก นั่ง BTS ไปอโศกได้ในประมาณ 20 นาที',
      ],
      en: [
        'Bang Chak is an affordable condo area on outer Sukhumvit, between On Nut and Punnawithi. It suits workers who want a room near the BTS on a tighter budget.',
        'The next stop, Punnawithi, is home to True Digital Park and its many tech companies and start-ups. Asok is roughly 20 minutes away by BTS.',
      ],
    },
  },
  'station:E12': {
    highlights: {
      th: ['ปากซอยสุขุมวิท 103 (อุดมสุข) เชื่อมไปศรีนครินทร์', 'คอนโดราคาเข้าถึงได้จำนวนมาก', 'ใกล้ปุณณวิถีและบางนา', 'เซ็นทรัล บางนา ประมาณ 3 กม.'],
      en: ['At Sukhumvit 103 (Udom Suk), linking to Srinagarindra', 'Lots of affordable condos', 'Near Punnawithi and Bang Na', 'About 3 km to Central Bangna'],
    },
    body: {
      th: [
        'อุดมสุขอยู่ปากซอยสุขุมวิท 103 ซึ่งเป็นถนนเชื่อมไปศรีนครินทร์ ย่านนี้มีคอนโดหลายโครงการในราคาที่เข้าถึงได้ เป็นที่นิยมของคนทำงานฝั่งบางนา สุขุมวิทตอนปลาย และศรีนครินทร์',
        'นั่ง BTS เข้าเมืองได้โดยตรง และอยู่ไม่ไกลจากเซ็นทรัล บางนา และ True Digital Park ที่ปุณณวิถี',
      ],
      en: [
        'Udom Suk is at the mouth of Sukhumvit 103, the road through to Srinagarindra. Many affordable condos have been built here, popular with people working in Bang Na, outer Sukhumvit and Srinagarindra.',
        'The BTS runs straight into the city, and Central Bangna and True Digital Park at Punnawithi are close.',
      ],
    },
  },
  'station:N3': {
    highlights: {
      th: ['จุดเชื่อมรถเมล์และรถตู้ที่ใหญ่ที่สุดแห่งหนึ่งของกรุงเทพฯ', 'ใกล้โรงพยาบาลราชวิถี พระมงกุฎเกล้า และรามาธิบดี', 'ถนนรางน้ำ ร้านอาหารและคาเฟ่เยอะ', 'สถานีเดียวถึงพญาไทเพื่อต่อ Airport Rail Link'],
      en: ['One of Bangkok\'s biggest bus and van hubs', 'Near Rajavithi, Phramongkutklao and Ramathibodi hospitals', 'Rang Nam Road, full of restaurants and cafés', 'One stop to Phaya Thai for the Airport Rail Link'],
    },
    body: {
      th: [
        'อนุสาวรีย์ชัยสมรภูมิเป็นศูนย์กลางการเดินทางของกรุงเทพฯ มีรถเมล์และรถตู้หลายสาย และอยู่ใกล้โรงพยาบาลใหญ่หลายแห่ง ทั้งราชวิถี พระมงกุฎเกล้า และรามาธิบดี บุคลากรทางการแพทย์และนักศึกษาจึงเช่าในย่านนี้มาก',
        'ที่พักมีทั้งอพาร์ทเม้นท์ในซอยและคอนโดย่านรางน้ำ ราชวิถี และพหลโยธิน นั่ง BTS สถานีเดียวถึงพญาไทเพื่อต่อ Airport Rail Link ไปสุวรรณภูมิ',
      ],
      en: [
        'Victory Monument is a transport hub, with many bus and van routes, and it is close to several big hospitals: Rajavithi, Phramongkutklao and Ramathibodi. Medical staff and students rent here in large numbers.',
        'There are apartments in the sois and condos around Rang Nam, Ratchawithi and Phahonyothin. Phaya Thai, for the Airport Rail Link to Suvarnabhumi, is one BTS stop away.',
      ],
    },
  },
  'station:N1': {
    highlights: {
      th: ['สถานีเดียวถึงสยาม', 'ใกล้พันธุ์ทิพย์ประตูน้ำ และถนนเพชรบุรี', 'อพาร์ทเม้นท์และคอนโดในซอยเพชรบุรีและราชเทวี', 'ใกล้โรงพยาบาลพญาไท 1'],
      en: ['One stop to Siam', 'Near Pantip Plaza and Phetchaburi Road', 'Apartments and condos in the Phetchaburi and Ratchathewi sois', 'Near Phyathai 1 Hospital'],
    },
    body: {
      th: [
        'ราชเทวีอยู่ห่างสยามเพียงสถานีเดียว จึงเป็นทำเลที่คนทำงานย่านสยามและนักศึกษาจุฬาฯ หรือสถาบันใกล้เคียงนิยมเช่า ค่าเช่าโดยรวมต่ำกว่าห้องติดสยามโดยตรง',
        'ในซอยเพชรบุรีและราชเทวีมีอพาร์ทเม้นท์และคอนโดหลายระดับราคา ใกล้พันธุ์ทิพย์ ประตูน้ำ และโรงพยาบาลพญาไท 1 เดินทางต่อไปพญาไทเพื่อขึ้น Airport Rail Link ได้ง่าย',
      ],
      en: [
        'Ratchathewi is one stop from Siam, which makes it popular with people working around Siam and with students at Chula and nearby institutes. Rents are generally lower than right next to Siam.',
        'The Phetchaburi and Ratchathewi sois have apartments and condos at a range of prices, near Pantip, Pratunam and Phyathai 1 Hospital. Phaya Thai, for the Airport Rail Link, is close.',
      ],
    },
  },
  'station:A8': {
    highlights: {
      th: ['สถานีร่วม BTS และ Airport Rail Link ไปสุวรรณภูมิ', 'ใกล้โรงพยาบาลพญาไท 1 และ 2', 'ใกล้อนุสาวรีย์ชัยฯ และถนนรางน้ำ', 'คอนโดและอพาร์ทเม้นท์ตามถนนพญาไทและศรีอยุธยา'],
      en: ['BTS and Airport Rail Link interchange, direct to Suvarnabhumi', 'Near Phyathai 1 and 2 hospitals', 'Near Victory Monument and Rang Nam Road', 'Condos and apartments along Phaya Thai and Si Ayutthaya roads'],
    },
    body: {
      th: [
        'พญาไทเป็นสถานีเปลี่ยนระหว่าง BTS สายสุขุมวิทและ Airport Rail Link ผู้ที่เดินทางไปสนามบินสุวรรณภูมิบ่อยหรือทำงานทั้งในเมืองและฝั่งตะวันออกจึงนิยมเช่าทำเลนี้',
        'รอบสถานีมีคอนโดและอพาร์ทเม้นท์ตามถนนพญาไท ศรีอยุธยา และรางน้ำ ใกล้โรงพยาบาลหลายแห่งและอนุสาวรีย์ชัยสมรภูมิ นั่ง BTS สองสถานีถึงสยาม',
      ],
      en: [
        'Phaya Thai is the interchange between the BTS Sukhumvit Line and the Airport Rail Link, so it suits frequent flyers and anyone working both in town and out east.',
        'Around the station are condos and apartments along Phaya Thai, Si Ayutthaya and Rang Nam roads, near several hospitals and Victory Monument. Siam is two BTS stops away.',
      ],
    },
  },
  'station:N8': {
    highlights: {
      th: ['สถานีร่วม BTS หมอชิต และ MRT สวนจตุจักร', 'ติดตลาดนัดจตุจักรและสวนจตุจักร', 'ใกล้ JJ Mall และยูเนี่ยนมอลล์', 'ใกล้สถานีกลางกรุงเทพอภิวัฒน์ (บางซื่อ)'],
      en: ['BTS Mo Chit and MRT Chatuchak Park interchange', 'Next to Chatuchak Weekend Market and Chatuchak Park', 'Near JJ Mall and Union Mall', 'Close to Krung Thep Aphiwat Central Terminal (Bang Sue)'],
    },
    body: {
      th: [
        'หมอชิตเป็นจุดเปลี่ยนระหว่าง BTS สายสุขุมวิทและ MRT สายสีน้ำเงิน อยู่ติดสวนจตุจักรและตลาดนัดจตุจักร ทำเลนี้จึงเดินทางสะดวกไปเกือบทุกทิศของกรุงเทพฯ',
        'ที่พักมีทั้งคอนโดตามถนนพหลโยธินและกำแพงเพชร และอพาร์ทเม้นท์ในซอยย่านสะพานควาย คนทำงานย่านพหลโยธิน วิภาวดี และบางซื่อนิยมเช่าที่นี่',
      ],
      en: [
        'Mo Chit is the interchange between the BTS Sukhumvit Line and the MRT Blue Line, right by Chatuchak Park and the weekend market, so most of Bangkok is easy to reach.',
        'There are condos along Phahonyothin and Kamphaeng Phet roads and apartments in the sois towards Saphan Khwai. People working on Phahonyothin, Vibhavadi and in Bang Sue rent here.',
      ],
    },
  },
  'station:N9': {
    highlights: {
      th: ['ติดเซ็นทรัลลาดพร้าวและยูเนี่ยนมอลล์', 'เดินถึง MRT พหลโยธิน', 'แยกใหญ่ที่พหลโยธิน ลาดพร้าว และวิภาวดีมาบรรจบ', 'คอนโดหลายโครงการรอบห้าแยก'],
      en: ['Next to Central Ladprao and Union Mall', 'Walk to MRT Phahon Yothin', 'Where Phahonyothin, Lat Phrao and Vibhavadi meet', 'Plenty of condos around the junction'],
    },
    body: {
      th: [
        'ห้าแยกลาดพร้าวเป็นจุดที่ถนนพหลโยธิน ลาดพร้าว และวิภาวดีรังสิตมาบรรจบ มีเซ็นทรัลลาดพร้าวและยูเนี่ยนมอลล์อยู่ติดสถานี และเดินถึง MRT พหลโยธินได้',
        'รอบห้าแยกมีคอนโดหลายโครงการทั้งเก่าและใหม่ เหมาะกับคนทำงานย่านพหลโยธิน รัชโยธิน และวิภาวดี ที่ต้องการทั้ง BTS และ MRT ใกล้บ้าน',
      ],
      en: [
        'Ha Yaek Lat Phrao is where Phahonyothin, Lat Phrao and Vibhavadi Rangsit roads meet. Central Ladprao and Union Mall are by the station, and MRT Phahon Yothin is a short walk.',
        'There are many condos around the junction, old and new. It suits people working around Phahonyothin, Ratchayothin and Vibhavadi who want both the BTS and MRT close by.',
      ],
    },
  },
  'station:E1': {
    highlights: {
      th: ['ใจกลางย่านช้อปปิ้งราชประสงค์', 'เดินถึงเซ็นทรัลเวิลด์ เกษรวิลเลจ และเซ็นทรัลเอ็มบาสซี', 'ใกล้ถนนหลังสวนและสวนลุมพินี', 'คอนโดและเซอร์วิสอพาร์ทเม้นท์ระดับพรีเมียม'],
      en: ['In the heart of the Ratchaprasong shopping district', 'Walk to CentralWorld, Gaysorn Village and Central Embassy', 'Near Lang Suan Road and Lumphini Park', 'Premium condos and serviced apartments'],
    },
    body: {
      th: [
        'ชิดลมอยู่ใจกลางย่านราชประสงค์ ล้อมรอบด้วยเซ็นทรัลเวิลด์ เกษรวิลเลจ และเซ็นทรัลเอ็มบาสซี ที่พักในย่านนี้ส่วนใหญ่เป็นคอนโดและเซอร์วิสอพาร์ทเม้นท์ระดับพรีเมียมในซอยหลังสวนและต้นสุขุมวิท',
        'ผู้เช่ามักเป็นผู้บริหารและคนทำงานต่างชาติที่ต้องการอยู่ใกล้ที่ทำงานในย่านเพลินจิตและสีลม เดินไปสวนลุมพินีได้ และนั่ง BTS สถานีเดียวถึงสยาม',
      ],
      en: [
        'Chit Lom is in the middle of Ratchaprasong, surrounded by CentralWorld, Gaysorn Village and Central Embassy. Housing here is mostly premium condos and serviced apartments around Lang Suan and lower Sukhumvit.',
        'Renters are often executives and foreign professionals working around Phloen Chit and Silom. Lumphini Park is walkable, and Siam is one BTS stop away.',
      ],
    },
  },
  'station:E2': {
    highlights: {
      th: ['ถนนวิทยุ ย่านสถานทูตและอาคารสำนักงาน', 'ติดเซ็นทรัลเอ็มบาสซี', 'ใกล้โรงพยาบาลบำรุงราษฎร์', 'คอนโดหรูและเซอร์วิสอพาร์ทเม้นท์'],
      en: ['Wireless Road, among embassies and office towers', 'Next to Central Embassy', 'Near Bumrungrad International Hospital', 'Luxury condos and serviced apartments'],
    },
    body: {
      th: [
        'เพลินจิตอยู่ระหว่างชิดลมและนานา ใกล้ถนนวิทยุที่มีสถานทูตหลายแห่งและอาคารสำนักงานเกรด A ผู้เช่าส่วนใหญ่เป็นคนทำงานต่างชาติ นักการทูต และผู้บริหาร',
        'คอนโดในย่านนี้มีตั้งแต่ห้องหรูติดสถานีไปจนถึงเซอร์วิสอพาร์ทเม้นท์ในซอยสุขุมวิท 1 และ 2 ใกล้เซ็นทรัลเอ็มบาสซีและโรงพยาบาลบำรุงราษฎร์',
      ],
      en: [
        'Phloen Chit sits between Chit Lom and Nana, near Wireless Road with its embassies and Grade A offices. Most renters are foreign professionals, diplomats and executives.',
        'Condos range from luxury units by the station to serviced apartments on Sukhumvit Sois 1 and 2, close to Central Embassy and Bumrungrad.',
      ],
    },
  },
  'station:CEN': {
    highlights: {
      th: ['สถานีเปลี่ยนสาย BTS สุขุมวิทและสีลม', 'ติดสยามพารากอน สยามเซ็นเตอร์ และใกล้ MBK', 'ใกล้จุฬาลงกรณ์มหาวิทยาลัย', 'คอนโดย่านบรรทัดทอง ราชเทวี และพระราม 1'],
      en: ['Interchange of the BTS Sukhumvit and Silom lines', 'Next to Siam Paragon, Siam Center and near MBK', 'Close to Chulalongkorn University', 'Condos around Banthat Thong, Ratchathewi and Rama 1'],
    },
    body: {
      th: [
        'สยามเป็นสถานีเปลี่ยนสายหลักของ BTS ทั้งสายสุขุมวิทและสายสีลม และเป็นย่านช้อปปิ้งที่คึกคักที่สุดของกรุงเทพฯ ที่พักติดสถานีมีจำกัด ส่วนใหญ่เป็นคอนโดในย่านบรรทัดทอง ราชเทวี และพระราม 1',
        'ผู้เช่าเป็นทั้งนักศึกษาจุฬาฯ คนทำงานย่านสยามและราชประสงค์ และคนที่ต้องการเดินทางได้ทุกทิศด้วย BTS ค่าเช่าสูงแต่ประหยัดเวลาเดินทาง',
      ],
      en: [
        'Siam is the main BTS interchange, where the Sukhumvit and Silom lines cross, and Bangkok\'s busiest shopping district. Housing right at the station is limited; most of it is condos around Banthat Thong, Ratchathewi and Rama 1.',
        'Renters include Chula students, people working around Siam and Ratchaprasong, and anyone who wants the whole BTS network on their doorstep. Rents are high, but the commute is short.',
      ],
    },
  },
  'station:S5': {
    highlights: {
      th: ['ถนนสาทร ใกล้ย่านสำนักงาน', 'ใกล้โรงพยาบาลเซนต์หลุยส์และเลิดสิน', 'ระหว่างช่องนนทรีและสะพานตากสิน', 'คอนโดตามสาทรใต้และเจริญราษฎร์'],
      en: ['On Sathorn, close to the office district', 'Near Saint Louis and Lerdsin hospitals', 'Between Chong Nonsi and Saphan Taksin', 'Condos along South Sathorn and Charoen Rat'],
    },
    body: {
      th: [
        'สุรศักดิ์อยู่บนถนนสาทร ระหว่างช่องนนทรีและสะพานตากสิน ใกล้อาคารสำนักงานย่านสาทรและสีลม ทำเลนี้มีคอนโดหลายระดับราคาและค่าเช่ามักต่ำกว่าช่วงสาทร-ช่องนนทรี',
        'ใกล้โรงพยาบาลเซนต์หลุยส์และเลิดสิน นั่ง BTS สถานีเดียวถึงสะพานตากสินเพื่อต่อเรือด่วนเจ้าพระยา และไปไอคอนสยามได้ไม่ไกล',
      ],
      en: [
        'Surasak is on Sathorn between Chong Nonsi and Saphan Taksin, close to the Sathorn and Silom offices. Condos here span many price points, and rents are usually lower than around Chong Nonsi.',
        'Saint Louis and Lerdsin hospitals are nearby. Saphan Taksin, for the Chao Phraya Express boat, is one BTS stop, and ICONSIAM is not far.',
      ],
    },
  },
  'station:S6': {
    highlights: {
      th: ['ริมแม่น้ำเจ้าพระยา ท่าเรือสาทร', 'ต่อเรือด่วนเจ้าพระยาและเรือไปไอคอนสยาม', 'ย่านเจริญกรุงที่มีร้านอาหารและแกลเลอรีเยอะ', 'คอนโดวิวแม่น้ำ'],
      en: ['On the Chao Phraya at Sathorn Pier', 'Chao Phraya Express boats and the shuttle to ICONSIAM', 'Charoen Krung, full of restaurants and galleries', 'River-view condos'],
    },
    body: {
      th: [
        'สะพานตากสินเป็นสถานี BTS ที่ติดแม่น้ำเจ้าพระยา ต่อเรือด่วนเจ้าพระยาที่ท่าสาทรได้ทันที และนั่งเรือข้ามไปไอคอนสยามได้ง่าย ทำเลนี้มีคอนโดวิวแม่น้ำหลายโครงการ',
        'ย่านเจริญกรุงรอบสถานีมีร้านอาหาร คาเฟ่ และแกลเลอรีมากมาย เหมาะกับคนที่ทำงานย่านสาทรและสีลมและต้องการบรรยากาศริมน้ำ',
      ],
      en: [
        'Saphan Taksin is the BTS station on the Chao Phraya, with Chao Phraya Express boats at Sathorn Pier and an easy crossing to ICONSIAM. Several condos here have river views.',
        'Charoen Krung around the station is full of restaurants, cafés and galleries. It suits people working in Sathorn and Silom who want to live by the river.',
      ],
    },
  },
  'station:BL17': {
    highlights: {
      th: ['แยกรัชดาฯ-สุทธิสาร', 'อพาร์ทเม้นท์และคอนโดราคาเข้าถึงได้', 'ใกล้มหาวิทยาลัยหอการค้าไทย', 'MRT สายสีน้ำเงินตรงไปพระราม 9 และสีลม'],
      en: ['At the Ratchada–Sutthisan junction', 'Affordable apartments and condos', 'Near the University of the Thai Chamber of Commerce', 'MRT Blue Line direct to Rama 9 and Silom'],
    },
    body: {
      th: [
        'สุทธิสารอยู่บนถนนรัชดาภิเษก ตัดกับถนนสุทธิสารวินิจฉัย ย่านนี้มีอพาร์ทเม้นท์และคอนโดราคาเข้าถึงได้จำนวนมาก นิยมทั้งในกลุ่มนักศึกษาและคนทำงาน',
        'นั่ง MRT สายสีน้ำเงินไปพระราม 9 สุขุมวิท และสีลมได้โดยตรง ใกล้มหาวิทยาลัยหอการค้าไทย และอยู่ไม่ไกลจากห้วยขวางและลาดพร้าว',
      ],
      en: [
        'Sutthisan is on Ratchadaphisek where it crosses Sutthisan Winitchai Road. The area has lots of affordable apartments and condos, popular with students and workers alike.',
        'The MRT Blue Line runs direct to Rama 9, Sukhumvit and Silom. UTCC is close, as are Huai Khwang and Lat Phrao.',
      ],
    },
  },
  'station:BL18': {
    highlights: {
      th: ['ย่านชุมชนจีนและร้านอาหารจีนจำนวนมาก', 'ตลาดห้วยขวางและร้านอาหารเปิดถึงดึก', 'อพาร์ทเม้นท์และคอนโดราคาเข้าถึงได้', 'ใกล้เอสพลานาด รัชดาฯ'],
      en: ['A Chinese community with many Chinese restaurants', 'Huai Khwang market and late-night food', 'Affordable apartments and condos', 'Near Esplanade Ratchada'],
    },
    body: {
      th: [
        'ห้วยขวางเป็นย่านที่มีชุมชนชาวจีนขนาดใหญ่ ร้านอาหารจีนและร้านค้าเปิดถึงดึก บนถนนประชาราษฎร์บำเพ็ญและรอบตลาดห้วยขวาง ที่พักส่วนใหญ่เป็นอพาร์ทเม้นท์และคอนโดราคาไม่สูง',
        'MRT สายสีน้ำเงินพาไปพระราม 9 สุขุมวิท และสีลมได้โดยตรง เหมาะกับคนทำงานย่านรัชดาฯ และพระราม 9 ที่ต้องการค่าเช่าคุ้มค่า',
      ],
      en: [
        'Huai Khwang has a large Chinese community, with Chinese restaurants and shops open late along Pracha Rat Bamphen Road and around Huai Khwang market. Housing is mostly modestly priced apartments and condos.',
        'The MRT Blue Line runs direct to Rama 9, Sukhumvit and Silom. It suits people working in Ratchada and Rama 9 who want good value.',
      ],
    },
  },
  'station:BL19': {
    highlights: {
      th: ['ติดเอสพลานาด รัชดาฯ', 'ใกล้เซ็นทรัล พระราม 9 และย่านธุรกิจพระราม 9', 'ใกล้สถานทูตจีน ถนนรัชดาภิเษก', 'คอนโดหลายโครงการตามแนวรัชดาฯ'],
      en: ['Next to Esplanade Ratchada', 'Near Central Rama 9 and the Rama 9 business district', 'Near the Chinese Embassy on Ratchadaphisek', 'Many condos along Ratchada'],
    },
    body: {
      th: [
        'ศูนย์วัฒนธรรมแห่งประเทศไทยอยู่บนถนนรัชดาภิเษก ติดห้างเอสพลานาด ย่านนี้มีคอนโดหลายโครงการ และอยู่ใกล้ย่านธุรกิจพระราม 9 ที่มีอาคารสำนักงานใหม่จำนวนมาก',
        'ผู้เช่ามีทั้งคนทำงานย่านพระราม 9 และรัชดาฯ และผู้เช่าชาวจีนที่ต้องการอยู่ใกล้สถานทูตจีนและห้วยขวาง นั่ง MRT สถานีเดียวถึงพระราม 9',
      ],
      en: [
        'Thailand Cultural Centre station is on Ratchadaphisek next to Esplanade. There are many condos here, and the Rama 9 business district with its new office towers is close.',
        'Renters include people working in Rama 9 and Ratchada, and Chinese residents who want to be near the Chinese Embassy and Huai Khwang. Phra Ram 9 is one MRT stop away.',
      ],
    },
  },
  'station:BL24': {
    highlights: {
      th: ['ใกล้ศูนย์การประชุมแห่งชาติสิริกิติ์', 'ใกล้สวนเบญจกิติและวัน แบงค็อก', 'ถนนพระราม 4 ระหว่างสุขุมวิทและสีลม', 'คอนโดและอพาร์ทเม้นท์ราคาหลากหลาย'],
      en: ['Near Queen Sirikit National Convention Center', 'Near Benjakitti Park and One Bangkok', 'On Rama 4 between Sukhumvit and Silom', 'Condos and apartments at a range of prices'],
    },
    body: {
      th: [
        'สถานีคลองเตยอยู่บนถนนพระราม 4 ระหว่างย่านสุขุมวิทและสีลม ใกล้ศูนย์การประชุมแห่งชาติสิริกิติ์ สวนเบญจกิติ และโครงการวัน แบงค็อก',
        'ที่พักมีทั้งคอนโดและอพาร์ทเม้นท์ ค่าเช่ามักต่ำกว่าย่านอโศกและลุมพินีที่อยู่ใกล้กัน นั่ง MRT ไปสุขุมวิทหรือสีลมได้ในไม่กี่สถานี',
      ],
      en: [
        'Khlong Toei station is on Rama 4 between Sukhumvit and Silom, near Queen Sirikit National Convention Center, Benjakitti Park and One Bangkok.',
        'There are condos and apartments, usually cheaper than nearby Asok and Lumphini. Sukhumvit and Silom are a few MRT stops away.',
      ],
    },
  },
  'station:BL25': {
    highlights: {
      th: ['ติดวัน แบงค็อก', 'เดินถึงสวนลุมพินี', 'ระหว่างสาทร ถนนวิทยุ และสีลม', 'คอนโดหรูและเซอร์วิสอพาร์ทเม้นท์'],
      en: ['Next to One Bangkok', 'Walk to Lumphini Park', 'Between Sathorn, Wireless Road and Silom', 'Luxury condos and serviced apartments'],
    },
    body: {
      th: [
        'ลุมพินีอยู่หัวมุมถนนพระราม 4 และถนนวิทยุ ติดโครงการวัน แบงค็อก และเดินถึงสวนลุมพินีได้ ย่านนี้เป็นทำเลคอนโดหรูที่อยู่ใกล้ทั้งสาทร สีลม และเพลินจิต',
        'ผู้เช่าส่วนใหญ่เป็นผู้บริหารและคนทำงานต่างชาติ นั่ง MRT สถานีเดียวถึงสีลมเพื่อต่อ BTS ศาลาแดง',
      ],
      en: [
        'Lumphini is at the corner of Rama 4 and Wireless Road, next to One Bangkok and a short walk from Lumphini Park. It is a luxury condo area close to Sathorn, Silom and Phloen Chit.',
        'Most renters are executives and foreign professionals. Si Lom, for BTS Sala Daeng, is one MRT stop away.',
      ],
    },
  },
  // ── Stations, second batch (Founder chose 25 Oct 2026). For the 14 stations
  // whose old /area guide sits on one type page, this is the all-types page text. ──
  'station:E4': {
    highlights: { th: ["สถานีร่วม BTS อโศก และ MRT สุขุมวิท", "ติดเทอร์มินอล 21 อโศก", "ย่านสำนักงานถนนอโศกมนตรีและสุขุมวิท 21", "คอนโด อพาร์ทเม้นท์ และออฟฟิศให้เช่าครบทุกแบบ"], en: ["BTS Asok and MRT Sukhumvit interchange", "Next to Terminal 21 Asok", "Office district along Asok Montri (Sukhumvit 21)", "Condos, apartments and offices of every kind"] },
    body: { th: ["อโศกเป็นจุดตัดของ BTS สายสุขุมวิทและ MRT สายสีน้ำเงิน มีห้างเทอร์มินอล 21 อยู่ติดสถานี และอาคารสำนักงานเรียงรายตามถนนอโศกมนตรี ทำให้เป็นหนึ่งในทำเลเช่าที่คึกคักที่สุดของกรุงเทพฯ ทั้งที่พักและออฟฟิศ", "ในซอยสุขุมวิทรอบๆ มีตั้งแต่อพาร์ทเม้นท์ขนาดเล็กไปจนถึงคอนโดหรู ใกล้มหาวิทยาลัยศรีนครินทรวิโรฒ ประสานมิตร และสวนเบญจกิติ ผู้เช่ามีทั้งคนทำงานไทยและต่างชาติที่ต้องการเดินทางได้ทั้ง BTS และ MRT"], en: ["Asok is where the BTS Sukhumvit Line meets the MRT Blue Line, with Terminal 21 at the station and office towers along Asok Montri Road. It is one of the busiest rental areas in Bangkok, for homes and offices alike.", "The surrounding Sukhumvit sois have everything from small apartments to luxury condos, close to Srinakharinwirot University (Prasarnmit) and Benjakitti Park. Renters are Thai and foreign professionals who want both the BTS and MRT on hand."] },
  },
  'station:BL22': {
    highlights: { th: ["สถานีร่วม MRT สุขุมวิท และ BTS อโศก", "แยกอโศก-เพชรบุรี-พระราม 4 เชื่อมทุกทิศ", "ใกล้เทอร์มินอล 21 และสวนเบญจกิติ", "MRT ตรงไปพระราม 9 สีลม และหัวลำโพง"], en: ["MRT Sukhumvit and BTS Asok interchange", "At the Asok junction, linking north to Phetchaburi and south to Rama 4", "Near Terminal 21 and Benjakitti Park", "MRT direct to Rama 9, Silom and Hua Lamphong"] },
    body: { th: ["MRT สุขุมวิทอยู่ใต้แยกอโศก เชื่อมกับ BTS อโศกโดยตรง จากที่นี่นั่ง MRT ขึ้นเหนือไปพระราม 9 และรัชดาฯ หรือลงใต้ไปสีลมและหัวลำโพงได้โดยไม่ต้องเปลี่ยนสาย", "ที่พักรอบสถานีมีทั้งคอนโดในซอยสุขุมวิท 16 ถึง 23 และอพาร์ทเม้นท์ตามถนนอโศกมนตรี เหมาะกับคนที่ทำงานคนละฝั่งเมืองกับคู่ หรือเดินทางไปหลายย่านในหนึ่งวัน"], en: ["MRT Sukhumvit sits under the Asok junction and connects directly to BTS Asok. From here the MRT runs north to Rama 9 and Ratchada, or south to Silom and Hua Lamphong, with no change.", "Housing around the station includes condos on Sukhumvit 16 to 23 and apartments along Asok Montri. It suits couples who work on opposite sides of the city, or anyone who moves between several districts in a day."] },
  },
  'station:E7': {
    highlights: { th: ["ติดเกตเวย์ เอกมัย และสถานีขนส่งเอกมัย (สายตะวันออก)", "ถนนเอกมัย (สุขุมวิท 63) ร้านอาหารและคาเฟ่เยอะ", "ระหว่างทองหล่อและพระโขนง", "คอนโด อพาร์ทเม้นท์ และบ้านเช่าในซอยลึก"], en: ["Next to Gateway Ekkamai and the Eastern Bus Terminal", "Ekkamai Road (Sukhumvit 63), full of restaurants and cafés", "Between Thong Lo and Phra Khanong", "Condos, apartments and houses deeper in the sois"] },
    body: { th: ["เอกมัยมีห้างเกตเวย์ เอกมัย และสถานีขนส่งสายตะวันออกอยู่ติดสถานี ถนนเอกมัยเต็มไปด้วยร้านอาหาร คาเฟ่ และบาร์ บรรยากาศใกล้เคียงทองหล่อแต่ค่าเช่าโดยรวมต่ำกว่า", "ที่พักมีให้เลือกทุกประเภท ตั้งแต่คอนโดติดสถานี อพาร์ทเม้นท์ในซอย ไปจนถึงบ้านเช่าในซอยเอกมัยตอนใน เหมาะทั้งคนทำงาน ครอบครัว และชาวต่างชาติ"], en: ["Ekkamai has Gateway Ekkamai and the Eastern Bus Terminal by the station. Ekkamai Road is packed with restaurants, cafés and bars, with a feel close to Thong Lo at generally lower rents.", "There is every type of home here, from condos by the station and apartments in the sois to houses further up Ekkamai. It suits professionals, families and expats."] },
  },
  'station:BL15': {
    highlights: { th: ["แยกลาดพร้าว-รัชดาฯ", "สถานีต้นทางของ MRT สายสีเหลือง", "ใกล้ยูเนี่ยนมอลล์และมหาวิทยาลัยราชภัฏจันทรเกษม", "อพาร์ทเม้นท์ คอนโด และบ้านเช่าตามแนวลาดพร้าว"], en: ["At the Lat Phrao–Ratchada junction", "Start of the MRT Yellow Line", "Near Union Mall and Chandrakasem Rajabhat University", "Apartments, condos and houses along Lat Phrao"] },
    body: { th: ["MRT ลาดพร้าวอยู่ที่แยกถนนลาดพร้าวตัดรัชดาภิเษก และเป็นจุดเปลี่ยนไป MRT สายสีเหลืองที่วิ่งตามถนนลาดพร้าวไปถึงศรีนครินทร์ ทำเลนี้จึงเชื่อมทั้งใจกลางเมืองและฝั่งตะวันออก", "ย่านลาดพร้าวมีที่พักหลากหลาย ทั้งอพาร์ทเม้นท์ คอนโด และบ้านเช่าในซอย ค่าเช่าโดยรวมต่ำกว่าสุขุมวิท เป็นที่นิยมของคนทำงานและครอบครัว"], en: ["MRT Lat Phrao is at the Lat Phrao–Ratchadaphisek junction and is the interchange for the MRT Yellow Line, which runs along Lat Phrao to Srinagarindra. The area links both the city centre and the east.", "Lat Phrao offers every kind of home, from apartments and condos to houses in the sois, generally cheaper than Sukhumvit. It is popular with workers and families."] },
  },
  'station:E6': {
    highlights: { th: ["สุขุมวิท 55 ถนนทองหล่อ", "ร้านอาหาร คาเฟ่ และไนท์ไลฟ์ระดับพรีเมียม", "ชุมชนชาวญี่ปุ่นและชาวต่างชาติ", "คอนโดหรูและเซอร์วิสอพาร์ทเม้นท์"], en: ["Sukhumvit 55, Thong Lo Road", "Premium restaurants, cafés and nightlife", "A Japanese and expat community", "Luxury condos and serviced apartments"] },
    body: { th: ["ทองหล่อเป็นหนึ่งในย่านอยู่อาศัยระดับพรีเมียมของกรุงเทพฯ ถนนทองหล่อมีร้านอาหาร คาเฟ่ และบาร์ชั้นนำเรียงราย และมีชุมชนชาวญี่ปุ่นและชาวต่างชาติจำนวนมาก", "ที่พักส่วนใหญ่เป็นคอนโดหรูและเซอร์วิสอพาร์ทเม้นท์ทั้งริมถนนทองหล่อและในซอยแยก ใกล้ห้างเอ็มโพเรียมที่พร้อมพงษ์ และเดินทางเข้าอโศกด้วย BTS ได้ไม่กี่สถานี"], en: ["Thong Lo is one of Bangkok's premium residential areas. Thong Lo Road is lined with leading restaurants, cafés and bars, and the area has a large Japanese and expat community.", "Most housing is luxury condos and serviced apartments, on Thong Lo Road and in its side sois, close to Emporium at Phrom Phong and a few BTS stops from Asok."] },
  },
  'station:S2': {
    highlights: { th: ["สถานีร่วม BTS ศาลาแดง และ MRT สีลม", "ใกล้สวนลุมพินี", "ใกล้โรงพยาบาลจุฬาลงกรณ์ บีเอ็นเอช และกรุงเทพคริสเตียน", "ย่านสีลม คอนแวนต์ และสาทร"], en: ["BTS Sala Daeng and MRT Si Lom interchange", "Near Lumphini Park", "Near King Chulalongkorn Memorial, BNH and Bangkok Christian hospitals", "Silom, Convent Road and Sathorn"] },
    body: { th: ["ศาลาแดงอยู่หัวถนนสีลม เชื่อมกับ MRT สีลมโดยตรง ล้อมรอบด้วยอาคารสำนักงาน โรงพยาบาลชั้นนำ และสวนลุมพินี เป็นทำเลที่ผู้เช่าทำงานในย่านธุรกิจสีลม-สาทรนิยมมาก", "ที่พักมีทั้งคอนโดหรูริมถนนพระราม 4 และสีลม และอพาร์ทเม้นท์ในซอยคอนแวนต์และศาลาแดง ร้านอาหารและตลาดกลางคืนเปิดถึงดึก"], en: ["Sala Daeng is at the top of Silom Road, linked directly to MRT Si Lom, and surrounded by offices, leading hospitals and Lumphini Park. It is a favourite with people working in the Silom–Sathorn business district.", "Housing ranges from luxury condos on Rama 4 and Silom to apartments in the Convent and Sala Daeng sois. Restaurants and night markets stay open late."] },
  },
  'station:E9': {
    highlights: { th: ["สุขุมวิท 77 ทำเลคุ้มค่าบนสายสุขุมวิท", "ใกล้โลตัส อ่อนนุช และตลาดท้องถิ่น", "ถนนอ่อนนุชเชื่อมไปสวนหลวงและพัฒนาการ", "คอนโดใหม่และอพาร์ทเม้นท์จำนวนมาก"], en: ["Sukhumvit 77, the value pick on the Sukhumvit Line", "Near Lotus's On Nut and local markets", "On Nut Road leads to Suan Luang and Phatthanakan", "Lots of newer condos and apartments"] },
    body: { th: ["อ่อนนุชเป็นทำเลที่คนทำงานในเมืองเลือกเมื่อต้องการอยู่ติด BTS ในค่าเช่าที่ต่ำกว่าสุขุมวิทตอนใน นั่งรถไฟฟ้าไปอโศกได้ในเวลาไม่นาน มีห้าง ตลาด และร้านอาหารรองรับครบ", "รอบสถานีมีคอนโดใหม่หลายโครงการและอพาร์ทเม้นท์ในซอยสุขุมวิท 77 และถนนอ่อนนุช มีชุมชนชาวต่างชาติไม่น้อย และได้รับความนิยมต่อเนื่อง"], en: ["On Nut is where city workers go to live by the BTS at lower rents than inner Sukhumvit. Asok is a short ride away, and malls, markets and restaurants are all close.", "Around the station are many newer condos and apartments along Sukhumvit 77 and On Nut Road. There is a sizeable expat community, and demand stays steady."] },
  },
  'station:BL16': {
    highlights: { th: ["ถนนรัชดาภิเษก ช่วงลาดพร้าว-สุทธิสาร", "คอนโดจำนวนมากตามแนว MRT", "ร้านอาหารและแหล่งกินในซอยรัชดาฯ", "ค่าเช่าเข้าถึงได้"], en: ["On Ratchadaphisek between Lat Phrao and Sutthisan", "Many condos along the MRT", "Plenty of food in the Ratchada sois", "Affordable rents"] },
    body: { th: ["สถานีรัชดาภิเษกอยู่บนถนนรัชดาฯ ระหว่างลาดพร้าวและสุทธิสาร เป็นย่านที่มีคอนโดขึ้นตามแนว MRT หลายโครงการ ค่าเช่าเข้าถึงได้และเดินทางเข้าเมืองสะดวก", "ซอยรัชดาฯ มีร้านอาหาร ร้านสะดวกซื้อ และตลาดครบ ผู้เช่าเป็นทั้งคนทำงานย่านรัชดาฯ-พระราม 9 และคนที่ต้องการเดินทางด้วย MRT ไปสุขุมวิทและสีลม"], en: ["Ratchadaphisek station is on Ratchada Road between Lat Phrao and Sutthisan. Many condos have gone up along the MRT here, with affordable rents and an easy ride into town.", "The Ratchada sois have restaurants, convenience stores and markets. Renters include people working in Ratchada and Rama 9, and commuters heading to Sukhumvit and Silom by MRT."] },
  },
  'station:BL20': {
    highlights: { th: ["ติดเซ็นทรัล พระราม 9", "ศูนย์กลางย่านธุรกิจใหม่พระราม 9", "ใกล้ Airport Rail Link มักกะสัน", "คอนโดและออฟฟิศให้เช่าจำนวนมาก"], en: ["Next to Central Rama 9", "The heart of the new Rama 9 business district", "Near Airport Rail Link Makkasan", "Many condos and offices for rent"] },
    body: { th: ["พระราม 9 เป็นย่านธุรกิจใหม่ที่เติบโตเร็ว มีเซ็นทรัล พระราม 9 อยู่ติดสถานี และอาคารสำนักงานเกรด A เกิดขึ้นต่อเนื่อง ทั้งที่พักและออฟฟิศให้เช่าจึงเป็นที่ต้องการ", "คอนโดในย่านนี้มีหลายระดับราคา ใกล้ Airport Rail Link มักกะสันสำหรับเดินทางไปสุวรรณภูมิ และนั่ง MRT ไปสุขุมวิทและรัชดาฯ ได้ในไม่กี่สถานี"], en: ["Rama 9 is a fast-growing new business district, with Central Rama 9 by the station and a steady stream of new Grade A offices. Homes and offices here are both in demand.", "Condos span many price points. Airport Rail Link Makkasan is close for Suvarnabhumi, and Sukhumvit and Ratchada are a few MRT stops away."] },
  },
  'station:N7': {
    highlights: { th: ["ถนนพหลโยธินตัดประดิพัทธ์", "ใกล้ตลาดนัดจตุจักรและ JJ Mall", "MRT กำแพงเพชร ประมาณ 500 เมตร", "อพาร์ทเม้นท์และคอนโดราคาเข้าถึงได้"], en: ["At Phahonyothin and Pradiphat roads", "Near Chatuchak Weekend Market and JJ Mall", "About 500 m to MRT Kamphaeng Phet", "Affordable apartments and condos"] },
    body: { th: ["สะพานควายอยู่ระหว่างอารีย์และหมอชิต มีถนนประดิพัทธ์ที่เต็มไปด้วยร้านอาหารและคาเฟ่ ใกล้ตลาดนัดจตุจักรและ MRT กำแพงเพชร", "ที่พักส่วนใหญ่เป็นอพาร์ทเม้นท์และคอนโดราคาเข้าถึงได้ เหมาะกับคนทำงานย่านพหลโยธินและบางซื่อ ที่ต้องการทำเลใกล้ BTS โดยไม่ต้องจ่ายค่าเช่าระดับอารีย์"], en: ["Saphan Khwai sits between Ari and Mo Chit, with Pradiphat Road full of restaurants and cafés, close to Chatuchak Weekend Market and MRT Kamphaeng Phet.", "Housing is mostly affordable apartments and condos. It suits people working on Phahonyothin and in Bang Sue who want the BTS without Ari rents."] },
  },
  'station:N5': {
    highlights: { th: ["ซอยอารีย์ (พหลโยธิน 7) คาเฟ่และร้านอาหารเยอะ", "ใกล้หน่วยงานราชการหลายแห่ง", "ใกล้โรงพยาบาลพญาไท 2", "คอนโด อพาร์ทเม้นท์ และบ้านเช่าในซอย"], en: ["Soi Ari (Phahonyothin 7), full of cafés and restaurants", "Near many government offices", "Near Phyathai 2 Hospital", "Condos, apartments and houses in the sois"] },
    body: { th: ["อารีย์เป็นย่านอยู่อาศัยที่มีเสน่ห์ ซอยอารีย์และซอยแยกเต็มไปด้วยคาเฟ่ ร้านอาหาร และบ้านเก่า ใกล้หน่วยงานราชการหลายแห่งบนถนนพหลโยธิน ทำให้มีผู้เช่าทั้งข้าราชการ คนทำงานสร้างสรรค์ และชาวต่างชาติ", "ที่พักมีทั้งคอนโดติด BTS อพาร์ทเม้นท์ และบ้านเช่าในซอยลึก นั่ง BTS ไปสยามได้ในไม่กี่สถานี และใกล้โรงพยาบาลพญาไท 2"], en: ["Ari is a characterful residential area. Soi Ari and its side streets are full of cafés, restaurants and older houses, and many government offices sit along Phahonyothin, so renters include civil servants, creatives and expats.", "There are condos by the BTS, apartments, and houses deeper in the sois. Siam is a few BTS stops away, and Phyathai 2 Hospital is close."] },
  },
  'station:E13': {
    highlights: { th: ["ติดไบเทค บางนา", "แยกบางนา ต้นถนนบางนา-ตราด", "ใกล้แบริ่งและอุดมสุข", "คอนโดและอพาร์ทเม้นท์ราคาเข้าถึงได้"], en: ["Next to BITEC Bangna", "At the Bang Na junction, start of the Bang Na–Trat road", "Near Bearing and Udom Suk", "Affordable condos and apartments"] },
    body: { th: ["บางนาอยู่ติดศูนย์ประชุมและแสดงสินค้าไบเทค และอยู่ที่แยกบางนาซึ่งเป็นต้นถนนบางนา-ตราด ทำเลนี้จึงเหมาะกับคนทำงานย่านบางนา ศรีนครินทร์ และนิคมอุตสาหกรรมฝั่งตะวันออก", "มีคอนโดหลายโครงการรอบสถานีในราคาที่เข้าถึงได้ นั่ง BTS เข้าเมืองได้โดยตรง และขับรถไปสนามบินสุวรรณภูมิได้ไม่ไกล"], en: ["Bang Na station is next to BITEC and at the Bang Na junction, where the Bang Na–Trat road begins. It suits people working in Bang Na, Srinagarindra and the eastern industrial estates.", "There are many affordable condos around the station. The BTS runs straight into the city, and Suvarnabhumi is a short drive."] },
  },
  'station:BL14': {
    highlights: { th: ["ติดเซ็นทรัลลาดพร้าวและยูเนี่ยนมอลล์", "เดินถึง BTS ห้าแยกลาดพร้าว", "ถนนพหลโยธินตัดลาดพร้าว", "คอนโดและอพาร์ทเม้นท์หลายระดับราคา"], en: ["Next to Central Ladprao and Union Mall", "Walk to BTS Ha Yaek Lat Phrao", "Where Phahonyothin meets Lat Phrao", "Condos and apartments at many prices"] },
    body: { th: ["MRT พหลโยธินอยู่ใต้แยกพหลโยธิน-ลาดพร้าว ใกล้เซ็นทรัลลาดพร้าวและยูเนี่ยนมอลล์ และเดินถึง BTS ห้าแยกลาดพร้าวได้ จึงเป็นทำเลที่ใช้ได้ทั้ง BTS และ MRT", "รอบสถานีมีคอนโดและอพาร์ทเม้นท์หลายระดับราคา ผู้เช่าเป็นคนทำงานย่านพหลโยธิน วิภาวดี และรัชดาฯ ที่ต้องการแหล่งช้อปปิ้งใกล้บ้าน"], en: ["MRT Phahon Yothin is under the Phahonyothin–Lat Phrao junction, close to Central Ladprao and Union Mall and a short walk from BTS Ha Yaek Lat Phrao, so both lines are on hand.", "Around the station are condos and apartments at many prices. Renters are people working on Phahonyothin, Vibhavadi and Ratchada who like having shopping close to home."] },
  },
  'station:S3': {
    highlights: { th: ["ถนนสาทรตัดนราธิวาสราชนครินทร์", "ติดคิง เพาเวอร์ มหานคร", "ย่านสำนักงานสาทร-สีลม", "คอนโดหรูตามนราธิวาสฯ"], en: ["Where Sathorn meets Narathiwat Ratchanakharin", "Next to King Power Mahanakhon", "The Sathorn–Silom office district", "Luxury condos along Narathiwat"] },
    body: { th: ["ช่องนนทรีอยู่ที่แยกสาทร-นราธิวาสราชนครินทร์ ติดอาคารคิง เพาเวอร์ มหานคร และล้อมรอบด้วยอาคารสำนักงานใหญ่ ผู้เช่าจำนวนมากเลือกทำเลนี้เพื่อเดินไปทำงานได้", "ถนนนราธิวาสราชนครินทร์มีคอนโดหรูหลายโครงการ ส่วนในซอยมีอพาร์ทเม้นท์ราคาย่อมเยากว่า นั่ง BTS สถานีเดียวถึงศาลาแดงเพื่อต่อ MRT"], en: ["Chong Nonsi is at the Sathorn–Narathiwat junction, next to King Power Mahanakhon and surrounded by headquarters buildings. Many renters choose it to walk to work.", "Narathiwat Ratchanakharin Road has many luxury condos, while the sois have cheaper apartments. Sala Daeng, for the MRT, is one BTS stop away."] },
  },
  'station:N4': {
    highlights: { th: ["ใกล้โรงพยาบาลพญาไท 2 และพระมงกุฎเกล้า", "ระหว่างอนุสาวรีย์ชัยฯ และอารีย์", "อพาร์ทเม้นท์และคอนโดราคาเข้าถึงได้", "ถนนพหลโยธินเข้าเมืองสะดวก"], en: ["Near Phyathai 2 and Phramongkutklao hospitals", "Between Victory Monument and Ari", "Affordable apartments and condos", "Easy into town along Phahonyothin"] },
    body: { th: ["สนามเป้าอยู่ระหว่างอนุสาวรีย์ชัยสมรภูมิและอารีย์ ใกล้โรงพยาบาลพญาไท 2 และโรงพยาบาลพระมงกุฎเกล้า บุคลากรทางการแพทย์และคนทำงานย่านพหลโยธินจึงเช่าในย่านนี้มาก", "ค่าเช่าโดยรวมต่ำกว่าอารีย์ แต่ยังเดินถึงร้านอาหารย่านอารีย์ได้ นั่ง BTS ไปสยามได้ในไม่กี่สถานี"], en: ["Sanam Pao is between Victory Monument and Ari, near Phyathai 2 and Phramongkutklao hospitals, so medical staff and people working on Phahonyothin rent here in numbers.", "Rents are generally below Ari, while Ari's restaurants are still within reach. Siam is a few BTS stops away."] },
  },
  'station:N10': {
    highlights: { th: ["ใกล้เซ็นทรัลลาดพร้าวและยูเนี่ยนมอลล์", "ใกล้มหาวิทยาลัยราชภัฏจันทรเกษม", "ระหว่างห้าแยกลาดพร้าวและรัชโยธิน", "คอนโดใหม่ตามแนว BTS"], en: ["Near Central Ladprao and Union Mall", "Near Chandrakasem Rajabhat University", "Between Ha Yaek Lat Phrao and Ratchayothin", "Newer condos along the BTS"] },
    body: { th: ["พหลโยธิน 24 อยู่ระหว่างห้าแยกลาดพร้าวและรัชโยธิน ใกล้เซ็นทรัลลาดพร้าวและมหาวิทยาลัยราชภัฏจันทรเกษม มีคอนโดใหม่ขึ้นตามแนว BTS หลายโครงการ", "ทำเลนี้เหมาะกับคนทำงานย่านพหลโยธินและนักศึกษาที่ต้องการอยู่ใกล้ห้างและรถไฟฟ้า ค่าเช่าต่ำกว่าห้องติดห้าแยกลาดพร้าวเล็กน้อย"], en: ["Phahon Yothin 24 sits between Ha Yaek Lat Phrao and Ratchayothin, near Central Ladprao and Chandrakasem Rajabhat University, with several newer condos along the BTS.", "It suits people working on Phahonyothin and students who want shops and the BTS close by, at slightly lower rents than right at Ha Yaek Lat Phrao."] },
  },
  'station:N11': {
    highlights: { th: ["แยกรัชโยธิน ถนนพหลโยธินตัดรัชดาภิเษก", "ใกล้สำนักงานใหญ่ธนาคารไทยพาณิชย์", "ใกล้โรงพยาบาลเปาโล เกษตร", "คอนโดและอพาร์ทเม้นท์หลายระดับราคา"], en: ["At the Ratchayothin junction (Phahonyothin and Ratchadaphisek)", "Near the Siam Commercial Bank head office", "Near Paolo Hospital Kaset", "Condos and apartments at many prices"] },
    body: { th: ["รัชโยธินอยู่ที่แยกพหลโยธินตัดรัชดาภิเษก ใกล้สำนักงานใหญ่ธนาคารไทยพาณิชย์และอาคารสำนักงานหลายแห่ง ทำให้มีผู้เช่าเป็นคนทำงานในย่านนี้จำนวนมาก", "ที่พักมีทั้งคอนโดติด BTS และอพาร์ทเม้นท์ในซอยพหลโยธิน ใกล้โรงพยาบาลเปาโล เกษตร และมหาวิทยาลัยราชภัฏจันทรเกษม"], en: ["Ratchayothin is at the Phahonyothin–Ratchadaphisek junction, near the Siam Commercial Bank head office and other office buildings, so many renters work right here.", "There are condos by the BTS and apartments in the Phahonyothin sois, near Paolo Hospital Kaset and Chandrakasem Rajabhat University."] },
  },
  'station:N12': {
    highlights: { th: ["ติดโรงพยาบาลเปาโล เกษตร", "ใกล้มหาวิทยาลัยเกษตรศาสตร์", "ซอยเสนานิคมมีอพาร์ทเม้นท์และบ้านเช่าเยอะ", "ค่าเช่าเป็นมิตร"], en: ["Next to Paolo Hospital Kaset", "Near Kasetsart University", "The Sena Nikhom sois have many apartments and houses", "Friendly rents"] },
    body: { th: ["เสนานิคมอยู่ระหว่างรัชโยธินและมหาวิทยาลัยเกษตรศาสตร์ ติดโรงพยาบาลเปาโล เกษตร ซอยเสนานิคมเป็นย่านที่อยู่อาศัยที่มีทั้งอพาร์ทเม้นท์ หอพัก และบ้านเช่า", "ผู้เช่ามีทั้งนิสิตเกษตรฯ บุคลากรทางการแพทย์ และคนทำงานย่านพหลโยธิน ค่าเช่าเป็นมิตร และนั่ง BTS เข้าเมืองได้โดยตรง"], en: ["Sena Nikhom sits between Ratchayothin and Kasetsart University, next to Paolo Hospital Kaset. The Sena Nikhom sois are residential, with apartments, dorms and houses.", "Renters include Kasetsart students, medical staff and people working on Phahonyothin. Rents are friendly, and the BTS runs straight into town."] },
  },
  'station:E11': {
    highlights: { th: ["ติด True Digital Park", "สุขุมวิท 101", "ระหว่างบางจากและอุดมสุข", "คอนโดราคาเข้าถึงได้"], en: ["Next to True Digital Park", "Sukhumvit 101", "Between Bang Chak and Udom Suk", "Affordable condos"] },
    body: { th: ["ปุณณวิถีเป็นที่ตั้งของ True Digital Park ศูนย์รวมบริษัทเทคโนโลยีและสตาร์ทอัพ ทำเลนี้จึงมีผู้เช่าเป็นคนทำงานสายเทคโนโลยีจำนวนมากที่ต้องการเดินไปทำงานได้", "รอบสถานีมีคอนโดหลายโครงการในราคาที่เข้าถึงได้ และซอยสุขุมวิท 101 ที่เชื่อมไปถนนปุณณวิถีและวชิรธรรมสาธิต นั่ง BTS เข้าเมืองได้โดยตรง"], en: ["Punnawithi is home to True Digital Park, a hub for tech companies and start-ups, so many renters here are tech workers who want to walk to the office.", "There are several affordable condos around the station, and Sukhumvit 101 links through to Punnawithi and Wachiratham Sathit roads. The BTS runs straight into town."] },
  },
  'station:E14': {
    highlights: { th: ["สุขุมวิท 107 สถานีสุดท้ายในเขตกรุงเทพฯ", "ใกล้บางนาและถนนลาซาล", "คอนโดและอพาร์ทเม้นท์ราคาประหยัด", "ต่อไปสมุทรปราการได้ด้วย BTS"], en: ["Sukhumvit 107, the last station inside Bangkok", "Near Bang Na and Lasalle Road", "Budget condos and apartments", "BTS on into Samut Prakan"] },
    body: { th: ["แบริ่งอยู่ปากซอยสุขุมวิท 107 เป็นสถานีสุดท้ายก่อนเข้าเขตสมุทรปราการ ย่านนี้มีคอนโดและอพาร์ทเม้นท์ราคาประหยัดจำนวนมาก เป็นที่นิยมของคนทำงานฝั่งบางนาและสมุทรปราการ", "ใกล้ถนนลาซาลที่เชื่อมไปศรีนครินทร์ และนั่ง BTS เข้าเมืองได้โดยตรง เหมาะกับคนที่ต้องการค่าเช่าต่ำแต่ยังอยู่ติดรถไฟฟ้า"], en: ["Bearing is at the mouth of Sukhumvit 107, the last station before Samut Prakan. There are many budget condos and apartments, popular with people working in Bang Na and Samut Prakan.", "Lasalle Road links through to Srinagarindra, and the BTS runs straight into town. It suits anyone after a low rent who still wants to be on the line."] },
  },
  'station:E15': {
    highlights: { th: ["สถานีร่วม BTS และ MRT สายสีเหลือง", "จังหวัดสมุทรปราการ ใกล้นิคมอุตสาหกรรม", "ใกล้อิมพีเรียลเวิลด์ สำโรง", "ค่าเช่าต่ำกว่าฝั่งกรุงเทพฯ"], en: ["BTS and MRT Yellow Line interchange", "In Samut Prakan, near industrial estates", "Near Imperial World Samrong", "Rents below the Bangkok side"] },
    body: { th: ["สำโรงเป็นจุดเปลี่ยนระหว่าง BTS สายสุขุมวิทและ MRT สายสีเหลืองที่วิ่งไปศรีนครินทร์และลาดพร้าว อยู่ในจังหวัดสมุทรปราการ ใกล้โรงงานและนิคมอุตสาหกรรมหลายแห่ง", "ที่พักส่วนใหญ่เป็นอพาร์ทเม้นท์และคอนโดราคาต่ำกว่าฝั่งกรุงเทพฯ ผู้เช่าเป็นคนทำงานในสมุทรปราการและผู้ที่เดินทางเข้าเมืองด้วยรถไฟฟ้า"], en: ["Samrong is the interchange between the BTS Sukhumvit Line and the MRT Yellow Line to Srinagarindra and Lat Phrao. It is in Samut Prakan, near many factories and industrial estates.", "Housing is mostly apartments and condos, cheaper than on the Bangkok side. Renters work in Samut Prakan or commute into the city by rail."] },
  },
  'station:W1': {
    highlights: { th: ["ติด MBK และหอศิลปวัฒนธรรมแห่งกรุงเทพมหานคร", "สถานีเดียวถึงสยาม", "ใกล้จุฬาฯ และสถาบันเทคโนโลยีปทุมวัน", "ห้องเช่าย่านบรรทัดทองและพระราม 1"], en: ["Next to MBK and the Bangkok Art and Culture Centre", "One stop to Siam", "Near Chula and Pathumwan Institute of Technology", "Rooms around Banthat Thong and Rama 1"] },
    body: { th: ["สนามกีฬาแห่งชาติเป็นสถานีปลายสายสีลม ติด MBK และหอศิลปวัฒนธรรมแห่งกรุงเทพมหานคร ใกล้จุฬาลงกรณ์มหาวิทยาลัยและสถาบันเทคโนโลยีปทุมวัน", "ที่พักส่วนใหญ่เป็นห้องเช่า อพาร์ทเม้นท์ และคอนโดย่านบรรทัดทองและพระราม 1 ถนนบรรทัดทองมีร้านอาหารเปิดถึงดึก เหมาะกับนักศึกษาและคนทำงานย่านสยาม"], en: ["National Stadium is the end of the Silom Line, next to MBK and the Bangkok Art and Culture Centre, and close to Chulalongkorn University and Pathumwan Institute of Technology.", "Housing is mostly rooms, apartments and condos around Banthat Thong and Rama 1, where restaurants stay open late. It suits students and people working around Siam."] },
  },
  'station:S1': {
    highlights: { th: ["ถนนราชดำริ ใจกลางเมือง", "ใกล้ราชประสงค์และสวนลุมพินี", "ใกล้โรงพยาบาลตำรวจ", "คอนโดหรูและเซอร์วิสอพาร์ทเม้นท์"], en: ["Ratchadamri Road, in the centre", "Near Ratchaprasong and Lumphini Park", "Near the Police General Hospital", "Luxury condos and serviced apartments"] },
    body: { th: ["ราชดำริอยู่ระหว่างราชประสงค์และสวนลุมพินี เป็นถนนที่มีคอนโดหรูและเซอร์วิสอพาร์ทเม้นท์ระดับบนหลายโครงการ ใกล้ห้างย่านราชประสงค์ และนั่ง BTS สถานีเดียวถึงสยาม", "ผู้เช่าส่วนใหญ่เป็นผู้บริหารและชาวต่างชาติที่ต้องการอยู่ใจกลางเมือง ใกล้ทั้งย่านช้อปปิ้งและย่านธุรกิจสีลม"], en: ["Ratchadamri sits between Ratchaprasong and Lumphini Park. The road has several upscale condos and serviced apartments, close to the Ratchaprasong malls and one BTS stop from Siam.", "Most renters are executives and expats who want the very centre, near both the shopping district and the Silom business district."] },
  },
  'station:S4': {
    highlights: { th: ["ติดโรงพยาบาลเซนต์หลุยส์", "ถนนสาทรใต้ ย่านสำนักงาน", "ระหว่างช่องนนทรีและสุรศักดิ์", "คอนโดและอพาร์ทเม้นท์ในซอยสาทร"], en: ["Next to Saint Louis Hospital", "South Sathorn, among the offices", "Between Chong Nonsi and Surasak", "Condos and apartments in the Sathorn sois"] },
    body: { th: ["เซนต์หลุยส์เป็นสถานี BTS ที่อยู่หน้าโรงพยาบาลเซนต์หลุยส์ บนถนนสาทรใต้ ระหว่างช่องนนทรีและสุรศักดิ์ ใกล้อาคารสำนักงานในย่านสาทร", "ในซอยเซนต์หลุยส์และซอยสาทรมีคอนโดและอพาร์ทเม้นท์หลายระดับราคา เหมาะกับคนทำงานย่านสาทร-สีลมและบุคลากรทางการแพทย์"], en: ["Saint Louis is the BTS station in front of Saint Louis Hospital on South Sathorn, between Chong Nonsi and Surasak, close to the Sathorn offices.", "The Saint Louis and Sathorn sois have condos and apartments at a range of prices. It suits people working in Sathorn and Silom, and medical staff."] },
  },
  'station:S7': {
    highlights: { th: ["สถานีร่วม BTS สายสีลม และสายสีทอง", "ใกล้ไอคอนสยาม", "ถนนกรุงธนบุรี ฝั่งธนฯ", "คอนโดค่าเช่าต่ำกว่าฝั่งสาทร"], en: ["BTS Silom Line and Gold Line interchange", "Near ICONSIAM", "Krung Thon Buri Road, Thonburi side", "Condos at lower rents than Sathorn"] },
    body: { th: ["กรุงธนบุรีเป็นจุดเปลี่ยนไป BTS สายสีทองที่วิ่งไปไอคอนสยาม อยู่ฝั่งธนบุรีถัดจากสะพานตากสิน ถนนกรุงธนบุรีมีคอนโดหลายโครงการ", "ค่าเช่าโดยรวมต่ำกว่าฝั่งสาทร แต่ข้ามแม่น้ำไปทำงานย่านสาทรและสีลมได้ในไม่กี่สถานี เหมาะกับคนทำงานในเมืองที่ต้องการความคุ้มค่า"], en: ["Krung Thon Buri is the interchange for the BTS Gold Line to ICONSIAM, on the Thonburi side just past Saphan Taksin. Krung Thon Buri Road has many condos.", "Rents are generally lower than in Sathorn, yet Sathorn and Silom are a few stops across the river. It suits city workers looking for value."] },
  },
  'station:S8': {
    highlights: { th: ["วงเวียนใหญ่ ศูนย์กลางฝั่งธนบุรี", "ใกล้สถานีรถไฟวงเวียนใหญ่ (สายแม่กลอง)", "ตลาดและร้านอาหารท้องถิ่นเยอะ", "อพาร์ทเม้นท์และคอนโดราคาเข้าถึงได้"], en: ["Wongwian Yai, the hub of Thonburi", "Near Wongwian Yai railway station (Maeklong Line)", "Plenty of markets and local food", "Affordable apartments and condos"] },
    body: { th: ["วงเวียนใหญ่เป็นศูนย์กลางการค้าและการเดินทางของฝั่งธนบุรี มีตลาด ร้านค้า และร้านอาหารท้องถิ่นจำนวนมาก ใกล้สถานีรถไฟวงเวียนใหญ่ของทางรถไฟสายแม่กลอง", "ที่พักส่วนใหญ่เป็นอพาร์ทเม้นท์และคอนโดราคาเข้าถึงได้ นั่ง BTS ข้ามแม่น้ำไปสาทรและสีลมได้ไม่กี่สถานี"], en: ["Wongwian Yai is the commercial and transport hub of Thonburi, with markets, shops and local restaurants, near Wongwian Yai railway station on the Maeklong Line.", "Housing is mostly affordable apartments and condos, and Sathorn and Silom are a few BTS stops across the river."] },
  },
  'station:S10': {
    highlights: { th: ["ตลาดพลู ย่านของกินเก่าแก่ของฝั่งธนฯ", "ถนนรัชดาภิเษก-ท่าพระ", "ใกล้โรงพยาบาลสมเด็จพระปิ่นเกล้า", "คอนโดใหม่และอพาร์ทเม้นท์ราคาเข้าถึงได้"], en: ["Talat Phlu, a long-standing Thonburi food district", "On the Ratchadaphisek–Tha Phra road", "Near Somdech Phra Pinklao Hospital", "Newer condos and affordable apartments"] },
    body: { th: ["ตลาดพลูเป็นย่านเก่าแก่ของฝั่งธนบุรีที่ขึ้นชื่อเรื่องของกิน มีตลาดและร้านอาหารดั้งเดิมจำนวนมาก ปัจจุบันมีคอนโดใหม่ขึ้นตามแนว BTS หลายโครงการ", "ค่าเช่าเข้าถึงได้ ใกล้โรงพยาบาลสมเด็จพระปิ่นเกล้า และ MRT ท่าพระ นั่ง BTS ไปสาทรและสีลมได้โดยตรง"], en: ["Talat Phlu is an old Thonburi neighbourhood known for its food, with many markets and long-running restaurants. Several newer condos have gone up along the BTS.", "Rents are affordable, with Somdech Phra Pinklao Hospital and MRT Tha Phra close by, and the BTS runs direct to Sathorn and Silom."] },
  },
  'station:S12': {
    highlights: { th: ["สถานีร่วม BTS บางหว้า และ MRT ท่าเรือบางหว้า", "ถนนเพชรเกษมและราชพฤกษ์", "ใกล้โรงพยาบาลพญาไท 3", "คอนโดและอพาร์ทเม้นท์ราคาเข้าถึงได้"], en: ["BTS Bang Wa and MRT Bang Wa Pier interchange", "On Phetkasem and Ratchaphruek roads", "Near Phyathai 3 Hospital", "Affordable condos and apartments"] },
    body: { th: ["บางหว้าเป็นสถานีปลายสายสีลมและเชื่อมกับ MRT สายสีน้ำเงินที่สถานีท่าเรือบางหว้า อยู่บนถนนเพชรเกษม ใกล้โรงพยาบาลพญาไท 3", "ผู้เช่าได้ทั้ง BTS เข้าสาทร-สีลม และ MRT ไปท่าพระ บางแค และหัวลำโพง ค่าเช่าโดยรวมต่ำกว่าฝั่งพระนคร"], en: ["Bang Wa is the end of the Silom Line and connects to the MRT Blue Line at Bang Wa Pier. It is on Phetkasem Road, near Phyathai 3 Hospital.", "Renters get the BTS into Sathorn and Silom, and the MRT to Tha Phra, Bang Khae and Hua Lamphong. Rents are generally lower than on the Phra Nakhon side."] },
  },
  'station:G2': {
    highlights: { th: ["เชื่อมไอคอนสยามโดยตรง", "BTS สายสีทอง ต่อสายสีลมที่กรุงธนบุรี", "ริมแม่น้ำเจ้าพระยา ถนนเจริญนคร", "คอนโดวิวแม่น้ำ"], en: ["Connects directly to ICONSIAM", "BTS Gold Line, linking to the Silom Line at Krung Thon Buri", "On the Chao Phraya along Charoen Nakhon Road", "River-view condos"] },
    body: { th: ["เจริญนครเป็นสถานี BTS สายสีทองที่เชื่อมกับไอคอนสยามโดยตรง อยู่บนถนนเจริญนครริมแม่น้ำเจ้าพระยา ใกล้โรงพยาบาลตากสิน", "ถนนเจริญนครมีคอนโดวิวแม่น้ำหลายโครงการ ผู้เช่านิยมทั้งคนทำงานย่านสาทรและผู้ที่ชอบบรรยากาศริมน้ำ ต่อ BTS สายสีลมได้ที่สถานีกรุงธนบุรี"], en: ["Charoen Nakhon is the BTS Gold Line station linked directly to ICONSIAM, on Charoen Nakhon Road by the Chao Phraya, near Taksin Hospital.", "Charoen Nakhon Road has several river-view condos, popular with people working in Sathorn and anyone who wants to live by the river. Change to the Silom Line at Krung Thon Buri."] },
  },
  'station:BL21': {
    highlights: { th: ["สถานีร่วม MRT เพชรบุรี และ Airport Rail Link มักกะสัน", "ถนนอโศก-ดินแดง ตัดเพชรบุรีตัดใหม่", "ใกล้โรงพยาบาลบำรุงราษฎร์", "คอนโดและออฟฟิศให้เช่า"], en: ["MRT Phetchaburi and Airport Rail Link Makkasan interchange", "Where Asok–Din Daeng meets New Phetchaburi", "Near Bumrungrad International Hospital", "Condos and offices for rent"] },
    body: { th: ["MRT เพชรบุรีเชื่อมกับ Airport Rail Link สถานีมักกะสัน ทำให้เดินทางไปสนามบินสุวรรณภูมิได้ง่าย อยู่ที่แยกถนนอโศก-ดินแดงตัดเพชรบุรีตัดใหม่ ซึ่งมีอาคารสำนักงานจำนวนมาก", "ที่พักมีทั้งคอนโดตามถนนเพชรบุรีตัดใหม่และอพาร์ทเม้นท์ในซอย ใกล้โรงพยาบาลบำรุงราษฎร์ และนั่ง MRT สถานีเดียวถึงสุขุมวิท"], en: ["MRT Phetchaburi connects to Airport Rail Link Makkasan for an easy trip to Suvarnabhumi. It is at the junction of Asok–Din Daeng and New Phetchaburi roads, which is full of offices.", "Housing includes condos along New Phetchaburi and apartments in the sois, near Bumrungrad. Sukhumvit is one MRT stop away."] },
  },
  'station:BL23': {
    highlights: { th: ["ติดศูนย์การประชุมแห่งชาติสิริกิติ์", "ใกล้สวนเบญจกิติ", "ถนนรัชดาภิเษก ระหว่างอโศกและพระราม 4", "ใกล้เอ็มสเฟียร์และพร้อมพงษ์"], en: ["Next to Queen Sirikit National Convention Center", "Near Benjakitti Park", "On Ratchadaphisek between Asok and Rama 4", "Near EmSphere and Phrom Phong"] },
    body: { th: ["สถานีศูนย์การประชุมแห่งชาติสิริกิติ์อยู่ติดศูนย์ประชุมและสวนเบญจกิติ ระหว่างแยกอโศกและพระราม 4 เป็นทำเลที่มีพื้นที่สีเขียวมากที่สุดแห่งหนึ่งใจกลางเมือง", "ที่พักมีทั้งคอนโดในซอยสุขุมวิท 10 ถึง 16 และอพาร์ทเม้นท์ย่านคลองเตย ใกล้เอ็มสเฟียร์และพร้อมพงษ์ นั่ง MRT สถานีเดียวถึงสุขุมวิท"], en: ["Queen Sirikit National Convention Center station is next to the convention centre and Benjakitti Park, between Asok and Rama 4, one of the greenest spots in central Bangkok.", "Housing includes condos on Sukhumvit 10 to 16 and apartments around Khlong Toei, near EmSphere and Phrom Phong. Sukhumvit is one MRT stop away."] },
  },
  'station:BL26': {
    highlights: { th: ["สถานีร่วม MRT สีลม และ BTS ศาลาแดง", "ติดโรงพยาบาลจุฬาลงกรณ์", "เดินถึงสวนลุมพินี", "ถนนพระราม 4 ตัดสีลม"], en: ["MRT Si Lom and BTS Sala Daeng interchange", "Next to King Chulalongkorn Memorial Hospital", "Walk to Lumphini Park", "Where Rama 4 meets Silom"] },
    body: { th: ["MRT สีลมอยู่ที่แยกพระราม 4 ตัดสีลม เชื่อมกับ BTS ศาลาแดง ติดโรงพยาบาลจุฬาลงกรณ์และเดินถึงสวนลุมพินีได้ ย่านนี้มีทั้งสำนักงาน โรงพยาบาล และที่พักระดับพรีเมียม", "คอนโดริมถนนพระราม 4 และสีลมเป็นที่นิยมของผู้บริหารและบุคลากรทางการแพทย์ นั่ง MRT ไปสุขุมวิทหรือหัวลำโพงได้โดยตรง"], en: ["MRT Si Lom is at the Rama 4–Silom junction, linked to BTS Sala Daeng, next to King Chulalongkorn Memorial Hospital and a walk from Lumphini Park. The area mixes offices, hospitals and premium homes.", "Condos along Rama 4 and Silom are popular with executives and medical staff, and the MRT runs direct to Sukhumvit and Hua Lamphong."] },
  },
  'station:BL27': {
    highlights: { th: ["ติดสามย่านมิตรทาวน์", "ใกล้จุฬาลงกรณ์มหาวิทยาลัย", "ใกล้โรงพยาบาลจุฬาลงกรณ์และกรุงเทพคริสเตียน", "ห้องเช่าและคอนโดย่านพระราม 4"], en: ["Next to Samyan Mitrtown", "Close to Chulalongkorn University", "Near King Chulalongkorn Memorial and Bangkok Christian hospitals", "Rooms and condos around Rama 4"] },
    body: { th: ["สามย่านอยู่ที่แยกพระราม 4 ตัดพญาไท ติดสามย่านมิตรทาวน์ และใกล้จุฬาลงกรณ์มหาวิทยาลัย นิสิต บุคลากร และคนทำงานย่านสีลมจึงนิยมเช่าทำเลนี้", "ที่พักมีทั้งห้องเช่าและอพาร์ทเม้นท์ในซอยจุฬาฯ และคอนโดริมถนนพระราม 4 นั่ง MRT สถานีเดียวถึงสีลมเพื่อต่อ BTS"], en: ["Sam Yan is at the Rama 4–Phaya Thai junction, next to Samyan Mitrtown and close to Chulalongkorn University, so students, staff and Silom workers rent here.", "Housing ranges from rooms and apartments in the Chula sois to condos on Rama 4. Si Lom, for the BTS, is one MRT stop away."] },
  },
  'station:BL28': {
    highlights: { th: ["ใกล้เยาวราชและย่านตลาดน้อย", "สถานีรถไฟหัวลำโพงเดิม", "ใกล้ริเวอร์ซิตี้และถนนเจริญกรุง", "อพาร์ทเม้นท์และคอนโดในย่านเมืองเก่า"], en: ["Near Yaowarat (Chinatown) and Talat Noi", "By the historic Hua Lamphong railway station", "Near River City and Charoen Krung Road", "Apartments and condos in the old city"] },
    body: { th: ["หัวลำโพงอยู่หน้าสถานีรถไฟหัวลำโพงเดิม ใกล้เยาวราช ตลาดน้อย และถนนเจริญกรุง ย่านนี้มีร้านอาหาร คาเฟ่ และแกลเลอรีในอาคารเก่าจำนวนมาก", "ที่พักส่วนใหญ่เป็นอพาร์ทเม้นท์และคอนโดจำนวนไม่มาก เหมาะกับคนที่ชอบบรรยากาศเมืองเก่าและต้องการ MRT ไปสีลมและสุขุมวิทได้โดยตรง"], en: ["Hua Lamphong is in front of the historic Hua Lamphong railway station, near Yaowarat, Talat Noi and Charoen Krung Road, with many restaurants, cafés and galleries in old buildings.", "Housing is mostly apartments and a limited number of condos. It suits people who love the old city and want the MRT straight to Silom and Sukhumvit."] },
  },
  'station:BL11': {
    highlights: { th: ["ใกล้สถานีกลางกรุงเทพอภิวัฒน์", "ใกล้ JJ Mall และตลาดนัดจตุจักร", "ย่านบางซื่อที่กำลังพัฒนา", "คอนโดและอพาร์ทเม้นท์ราคาเข้าถึงได้"], en: ["Near Krung Thep Aphiwat Central Terminal", "Near JJ Mall and Chatuchak Weekend Market", "Bang Sue, an area on the rise", "Affordable condos and apartments"] },
    body: { th: ["MRT บางซื่ออยู่ใกล้สถานีกลางกรุงเทพอภิวัฒน์ ศูนย์กลางรถไฟทางไกลและรถไฟฟ้าสายสีแดง ย่านบางซื่อจึงกำลังพัฒนาและมีคอนโดใหม่เพิ่มขึ้น", "ค่าเช่าโดยรวมยังเข้าถึงได้ ใกล้ JJ Mall และตลาดนัดจตุจักร เหมาะกับคนทำงานย่านบางซื่อ พหลโยธิน และผู้ที่ต้องเดินทางต่างจังหวัดบ่อย"], en: ["MRT Bang Sue is near Krung Thep Aphiwat Central Terminal, the hub for long-distance trains and the SRT Red Line, so Bang Sue is developing and new condos keep appearing.", "Rents are still affordable, with JJ Mall and Chatuchak market nearby. It suits people working in Bang Sue and on Phahonyothin, and anyone who travels upcountry often."] },
  },
  'station:BL10': {
    highlights: { th: ["สถานีร่วม MRT สายสีน้ำเงินและสายสีม่วง", "ถนนประชาราษฎร์สาย 2 และกรุงเทพ-นนทบุรี", "ใกล้บางโพและบางซื่อ", "คอนโดและอพาร์ทเม้นท์ราคาประหยัด"], en: ["MRT Blue and Purple Line interchange", "On Pracharat Sai 2 and Krungthep–Nonthaburi roads", "Near Bang Pho and Bang Sue", "Budget condos and apartments"] },
    body: { th: ["เตาปูนเป็นจุดเปลี่ยนระหว่าง MRT สายสีน้ำเงินและสายสีม่วงที่วิ่งไปนนทบุรี ทำเลนี้จึงเชื่อมทั้งใจกลางเมืองและฝั่งนนทบุรี", "ที่พักส่วนใหญ่เป็นคอนโดและอพาร์ทเม้นท์ราคาประหยัด ใกล้มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือและย่านบางโพ"], en: ["Tao Poon is the interchange between the MRT Blue Line and the Purple Line to Nonthaburi, linking the city centre with the Nonthaburi side.", "Housing is mostly budget condos and apartments, near KMUTNB and Bang Pho."] },
  },
  'station:A6': {
    highlights: { th: ["Airport Rail Link มักกะสัน ต่อ MRT เพชรบุรี", "ใกล้ย่านธุรกิจพระราม 9", "ใกล้โรงพยาบาลบำรุงราษฎร์", "คอนโดตามเพชรบุรีตัดใหม่และอโศก-ดินแดง"], en: ["Airport Rail Link Makkasan, linked to MRT Phetchaburi", "Near the Rama 9 business district", "Near Bumrungrad International Hospital", "Condos along New Phetchaburi and Asok–Din Daeng"] },
    body: { th: ["มักกะสันเป็นสถานี Airport Rail Link ที่เชื่อมกับ MRT เพชรบุรี ไปสนามบินสุวรรณภูมิได้โดยตรงและต่อ MRT ไปสุขุมวิทหรือพระราม 9 ได้ทันที", "ที่พักรอบสถานีมีทั้งคอนโดตามเพชรบุรีตัดใหม่และถนนอโศก-ดินแดง ใกล้ย่านธุรกิจพระราม 9 และโรงพยาบาลบำรุงราษฎร์ เหมาะกับคนที่เดินทางไปสนามบินบ่อย"], en: ["Makkasan is the Airport Rail Link station linked to MRT Phetchaburi, with direct trains to Suvarnabhumi and an immediate MRT connection to Sukhumvit or Rama 9.", "Around the station are condos along New Phetchaburi and Asok–Din Daeng, near the Rama 9 business district and Bumrungrad. It suits frequent flyers."] },
  },
  'station:A7': {
    highlights: { th: ["ใกล้ประตูน้ำ แพลทินัม และใบหยก", "Airport Rail Link ไปสุวรรณภูมิ", "ใกล้โรงพยาบาลพญาไท 1", "อพาร์ทเม้นท์และคอนโดใจกลางเมือง"], en: ["Near Pratunam, Platinum and Baiyoke", "Airport Rail Link to Suvarnabhumi", "Near Phyathai 1 Hospital", "Central apartments and condos"] },
    body: { th: ["ราชปรารภอยู่ใกล้ย่านประตูน้ำ ห้างแพลทินัม และตึกใบหยก ย่านค้าส่งเสื้อผ้าที่คึกคักที่สุดของกรุงเทพฯ ขึ้น Airport Rail Link ไปสุวรรณภูมิได้โดยตรง", "ที่พักมีทั้งอพาร์ทเม้นท์และคอนโดในซอยราชปรารภและเพชรบุรี เดินไปราชประสงค์ได้ เหมาะกับคนทำงานย่านประตูน้ำ ราชประสงค์ และผู้ที่เดินทางบ่อย"], en: ["Ratchaprarop is near Pratunam, Platinum Fashion Mall and Baiyoke Tower, Bangkok's busiest wholesale clothing district, with the Airport Rail Link straight to Suvarnabhumi.", "Housing includes apartments and condos in the Ratchaprarop and Phetchaburi sois, within walking distance of Ratchaprasong. It suits people working around Pratunam and Ratchaprasong, and frequent travellers."] },
  },
  'station:A4': {
    highlights: { th: ["สถานีร่วม Airport Rail Link และ MRT สายสีเหลือง", "ใกล้สถาบันไทย-ญี่ปุ่น เกษมบัณฑิต และแสตมฟอร์ด", "ถนนรามคำแหงและพัฒนาการ", "คอนโดและอพาร์ทเม้นท์ราคาเข้าถึงได้"], en: ["Airport Rail Link and MRT Yellow Line interchange", "Near Thai-Nichi, Kasem Bundit and Stamford", "Between Ramkhamhaeng and Phatthanakan roads", "Affordable condos and apartments"] },
    body: { th: ["หัวหมากเป็นจุดเปลี่ยนระหว่าง Airport Rail Link และ MRT สายสีเหลือง ไปได้ทั้งใจกลางเมือง สุวรรณภูมิ ลาดพร้าว และศรีนครินทร์ อยู่ใกล้หลายมหาวิทยาลัย", "ที่พักส่วนใหญ่เป็นคอนโดและอพาร์ทเม้นท์ราคาเข้าถึงได้ ผู้เช่าเป็นนักศึกษาและคนทำงานที่ต้องการทำเลเชื่อมต่อหลายสายในค่าเช่าที่ไม่สูง"], en: ["Hua Mak is the interchange between the Airport Rail Link and the MRT Yellow Line, reaching the city centre, Suvarnabhumi, Lat Phrao and Srinagarindra. Several universities are nearby.", "Housing is mostly affordable condos and apartments, rented by students and workers who want several lines at a modest rent."] },
  },
  'station:BL01': {
    highlights: { th: ["แยกท่าพระ จุดเชื่อม MRT สายสีน้ำเงิน", "ใกล้เดอะมอลล์ ท่าพระ", "ถนนจรัญสนิทวงศ์ตัดเพชรเกษม", "คอนโดและอพาร์ทเม้นท์ฝั่งธนฯ"], en: ["Tha Phra junction on the MRT Blue Line", "Near The Mall Tha Phra", "Where Charan Sanitwong meets Phetkasem", "Condos and apartments on the Thonburi side"] },
    body: { th: ["ท่าพระอยู่ที่แยกถนนจรัญสนิทวงศ์ตัดเพชรเกษม เป็นจุดที่ MRT สายสีน้ำเงินแยกไปทางบางแคและบางซื่อ ใกล้เดอะมอลล์ ท่าพระ", "ที่พักมีทั้งคอนโดใหม่และอพาร์ทเม้นท์ ค่าเช่าโดยรวมต่ำกว่าฝั่งพระนคร นั่ง MRT ข้ามแม่น้ำไปสนามไชยและหัวลำโพงได้โดยตรง"], en: ["Tha Phra is at the junction of Charan Sanitwong and Phetkasem roads, where the MRT Blue Line branches towards Bang Khae and Bang Sue, near The Mall Tha Phra.", "Housing includes newer condos and apartments, generally cheaper than the Phra Nakhon side, with the MRT straight across the river to Sanam Chai and Hua Lamphong."] },
  },
}
