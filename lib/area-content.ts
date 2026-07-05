/**
 * Area SEO Content — renter-focused, bilingual (TH / EN)
 * Keywords: เช่า / rent / rental — no sales language
 */

export interface AreaContent {
  headline_th: string
  headline_en: string
  body_th: string[]       // 2–3 paragraphs
  body_en: string[]
  highlights_th: string[]
  highlights_en: string[]
  price_from_th: string   // e.g. "ราคาเช่าเริ่มต้น ฿12,000/เดือน"
  price_from_en: string   // e.g. "Rentals from ฿12,000/month"
  faq_th: { q: string; a: string }[]
  faq_en: { q: string; a: string }[]
}

export const AREA_CONTENT: Record<string, AreaContent> = {

  /* ───────────────────────────────────────────────
     1. BTS Asok — Condo
  ─────────────────────────────────────────────── */
  'condo-rent-bts-asok': {
    headline_th: 'เช่าคอนโดใกล้ BTS อโศก — ทำเลธุรกิจกลางกรุง',
    headline_en: 'Rent a Condo near BTS Asok — Bangkok\'s Business Hub',
    body_th: [
      'อโศกเป็นหนึ่งในทำเลเช่าคอนโดที่ร้อนแรงที่สุดในกรุงเทพฯ เพราะตั้งอยู่จุดตัดระหว่าง BTS สุขุมวิทและ MRT สุขุมวิท ทำให้เดินทางครอบคลุมทุกเส้นทางในเมืองโดยไม่ต้องพึ่งรถยนต์ ผู้เช่าส่วนใหญ่เป็นมืออาชีพและชาวต่างชาติที่ทำงานในเขตธุรกิจสุขุมวิทและอโศก',
      'ย่านนี้ล้อมรอบด้วยออฟฟิศระดับ Grade A, Terminal 21, ร้านอาหาร และสิ่งอำนวยความสะดวกครบครัน คอนโดให้เช่าในย่านอโศกส่วนใหญ่มีสิ่งอำนวยความสะดวกพร้อม เช่น ฟิตเนส สระว่ายน้ำ และระบบรักษาความปลอดภัย 24 ชั่วโมง เหมาะสำหรับผู้ที่ต้องการความสะดวกและ lifestyle ระดับพรีเมียม',
      'SpacesMate คัดสรรคอนโดเช่าในย่านอโศกที่ผ่านการตรวจสอบแล้ว ทั้งสตูดิโอ 1 ห้องนอน และ 2 ห้องนอน ในราคาที่โปร่งใส ไม่มีค่าใช้จ่ายแอบแฝง',
    ],
    body_en: [
      'BTS Asok is Bangkok\'s most connected rental location — sitting at the interchange between the BTS Sukhumvit Line and MRT Sukhumvit. For working professionals and expats, this means every corner of the city is minutes away without needing a car.',
      'The neighbourhood is dense with Grade A offices, Terminal 21 shopping mall, international restaurants, and 24/7 conveniences. Condos for rent in Asok typically offer full facilities — gym, pool, keycard access, and professional management. It\'s the go-to area for corporate housing and relocation packages.',
      'SpacesMate lists verified condos for rent near BTS Asok — studios, 1-bedroom and 2-bedroom units — with transparent pricing and no hidden fees.',
    ],
    highlights_th: [
      'จุดตัด BTS × MRT ใจกลางสุขุมวิท',
      'Terminal 21 และห้างสรรพสินค้าชั้นนำในระยะเดิน',
      'เหมาะสำหรับมืออาชีพ ผู้บริหาร และชาวต่างชาติ',
      'คอนโดพร้อมสิ่งอำนวยความสะดวกครบครัน',
      'ใกล้ออฟฟิศ Grade A และ co-working spaces',
    ],
    highlights_en: [
      'BTS × MRT interchange — unbeatable connectivity',
      'Terminal 21 and major malls within walking distance',
      'Popular with expats and corporate tenants',
      'Full-facility condos with gym, pool & 24/7 security',
      'Grade A offices and co-working spaces nearby',
    ],
    price_from_th: 'ราคาเช่าเริ่มต้น ฿15,000/เดือน',
    price_from_en: 'Rentals from ฿15,000/month',
    faq_th: [
      { q: 'คอนโดเช่าในย่านอโศกราคาเท่าไหร่?', a: 'สตูดิโอเริ่มต้นประมาณ ฿15,000–25,000/เดือน ห้อง 1 ห้องนอนประมาณ ฿25,000–45,000/เดือน ขึ้นอยู่กับอาคารและชั้น' },
      { q: 'อโศกมีคอนโดเช่าแบบไหนบ้าง?', a: 'ส่วนใหญ่เป็นคอนโดไฮไรส์ มีทั้งสตูดิโอ 1 ห้องนอน และ 2 ห้องนอน หลายแห่งมีเฟอร์นิเจอร์ครบและพร้อมเข้าอยู่ทันที' },
    ],
    faq_en: [
      { q: 'How much does it cost to rent a condo near BTS Asok?', a: 'Studios start around ฿15,000–25,000/month. 1-bedroom units range from ฿25,000–45,000/month depending on the building and floor.' },
      { q: 'Are furnished condos available for rent in Asok?', a: 'Yes — most condos listed near Asok are fully furnished and move-in ready, making them ideal for corporate relocations and short-stay rentals.' },
    ],
  },

  /* ───────────────────────────────────────────────
     2. Sukhumvit — Apartment
  ─────────────────────────────────────────────── */
  'apartment-rent-sukhumvit': {
    headline_th: 'เช่าอพาร์ทเม้นท์สุขุมวิท — ศูนย์กลางชีวิตชาวเมือง',
    headline_en: 'Rent an Apartment on Sukhumvit — Bangkok\'s Most Liveable Corridor',
    body_th: [
      'ถนนสุขุมวิททอดยาวตลอดแนว BTS สายสุขุมวิท ครอบคลุมซอยตั้งแต่สุขุมวิท 1 จนถึงปลายสาย เป็นทำเลเช่าอพาร์ทเม้นท์ที่ใหญ่ที่สุดและหลากหลายที่สุดในกรุงเทพฯ มีให้เลือกตั้งแต่ห้องสตูดิโอราคาประหยัดไปจนถึงอพาร์ทเม้นท์ระดับเซอร์วิสรูม',
      'อพาร์ทเม้นท์เช่าในย่านสุขุมวิทเหมาะกับทุกกลุ่ม ไม่ว่าจะเป็นนักศึกษา มืออาชีพ ครอบครัวชาวต่างชาติ หรือนักเดินทางระยะยาว แต่ละซอยมีบรรยากาศและราคาที่แตกต่างกัน ช่วงซอย 1–20 ใกล้ย่านธุรกิจ ส่วนซอย 50 ขึ้นไปให้ความรู้สึกเงียบสงบมากกว่า',
      'SpacesMate รวบรวมอพาร์ทเม้นท์เช่าตลอดแนวสุขุมวิท พร้อมข้อมูลครบถ้วน ทั้งราคา สิ่งอำนวยความสะดวก และระยะห่างจากสถานี BTS เปรียบเทียบง่าย หาที่พักได้เร็ว',
    ],
    body_en: [
      'Sukhumvit Road runs the full length of Bangkok\'s BTS Sukhumvit Line — from the city centre all the way east. It\'s the largest and most diverse rental corridor in Bangkok, with apartments ranging from budget studios to serviced suites.',
      'Different sois (side streets) suit different lifestyles: Soi 1–20 is close to the CBD and packed with offices and expat communities; Soi 50 and beyond is quieter and family-friendly. No matter your budget or lifestyle, there\'s an apartment for rent on Sukhumvit that fits.',
      'SpacesMate aggregates verified apartment listings along the full Sukhumvit corridor — with pricing, facilities, and BTS distance all in one place.',
    ],
    highlights_th: [
      'ทำเลเช่าที่หลากหลายที่สุดในกรุงเทพฯ',
      'ครอบคลุมทุกช่วงราคา ตั้งแต่งบประหยัดถึงระดับพรีเมียม',
      'เดินทางง่ายด้วย BTS ตลอดเส้น',
      'ใกล้โรงเรียนนานาชาติ โรงพยาบาล และห้างฯ',
      'เหมาะทั้งชาวไทยและชาวต่างชาติ',
    ],
    highlights_en: [
      'Bangkok\'s most diverse rental corridor',
      'Every budget tier from ฿8,000 to ฿80,000+/month',
      'BTS access along the entire length',
      'International schools, hospitals and malls nearby',
      'Popular with expat families and long-stay renters',
    ],
    price_from_th: 'ราคาเช่าเริ่มต้น ฿8,000/เดือน',
    price_from_en: 'Rentals from ฿8,000/month',
    faq_th: [
      { q: 'อพาร์ทเม้นท์เช่าย่านสุขุมวิทราคาเท่าไหร่?', a: 'ราคาแตกต่างกันมากตามซอยและขนาดห้อง ตั้งแต่฿8,000/เดือนสำหรับสตูดิโอใกล้ปลายสาย ไปจนถึง฿50,000+/เดือนสำหรับอพาร์ทเม้นท์ขนาดใหญ่ใจกลางสุขุมวิท' },
      { q: 'ซอยไหนบนสุขุมวิทเหมาะสำหรับครอบครัว?', a: 'ซอย 31, 49 และ 55 (ทองหล่อ) เป็นที่นิยมสำหรับครอบครัวชาวต่างชาติ เพราะใกล้โรงเรียนนานาชาติและมีบรรยากาศเงียบสงบ' },
    ],
    faq_en: [
      { q: 'What\'s the rent range for apartments on Sukhumvit?', a: 'Prices vary widely — studios near the outer sois start around ฿8,000/month, while larger apartments in central Sukhumvit (Soi 1–20) can reach ฿50,000+/month.' },
      { q: 'Which Sukhumvit soi is best for families?', a: 'Soi 31, 49, and 55 (Thonglor) are popular with expat families due to nearby international schools and quieter residential streets.' },
    ],
  },

  /* ───────────────────────────────────────────────
     3. BTS Ekkamai — Condo
  ─────────────────────────────────────────────── */
  'condo-rent-bts-ekkamai': {
    headline_th: 'เช่าคอนโดใกล้ BTS เอกมัย — ย่านคนรุ่นใหม่สไตล์โมเดิร์น',
    headline_en: 'Rent a Condo near BTS Ekkamai — Bangkok\'s Trendy Urban Village',
    body_th: [
      'เอกมัยกลายเป็นหนึ่งในย่านที่ทันสมัยและมีชีวิตชีวาที่สุดในกรุงเทพฯ เต็มไปด้วยร้านกาแฟ ร้านอาหาร บาร์ที่มีเอกลักษณ์ และไนท์มาร์เก็ต ทำให้เช่าคอนโดในย่านนี้ได้รับความนิยมจากกลุ่มคนทำงาน คนรุ่นใหม่ และชาวต่างชาติที่ต้องการ lifestyle',
      'BTS เอกมัยเชื่อมต่อกับ BTS พระโขนงและทองหล่อ ทำให้เดินทางไปทำงานในย่านสุขุมวิทและอโศกได้อย่างรวดเร็ว คอนโดเช่าในย่านเอกมัยมีราคาที่คุ้มค่ากว่าทองหล่อและพร้อมพงษ์ แต่ได้บรรยากาศและการเข้าถึงสิ่งอำนวยความสะดวกที่ไม่ต่างกัน',
      'SpacesMate มีรายการคอนโดเช่าย่านเอกมัยให้เลือกหลากหลาย พร้อมรูปจริงและข้อมูลครบถ้วน ไม่ต้องผ่านนายหน้า',
    ],
    body_en: [
      'Ekkamai has transformed into one of Bangkok\'s most desirable rental neighbourhoods — home to independent cafés, rooftop bars, night markets, and a creative community. It attracts young professionals, digital nomads, and expats looking for a neighbourhood with personality.',
      'The BTS Ekkamai station links directly to Thonglor and On Nut, making the commute to Sukhumvit offices fast and stress-free. Rental prices are noticeably lower than Thonglor just one stop away, making Ekkamai one of Bangkok\'s best-value condo rental locations.',
      'SpacesMate lists verified condos for rent near BTS Ekkamai with real photos, actual pricing, and no agent middlemen.',
    ],
    highlights_th: [
      'ย่านไลฟ์สไตล์ยอดนิยมของคนรุ่นใหม่',
      'ราคาคุ้มค่ากว่าทองหล่อและพร้อมพงษ์',
      'BTS เชื่อมต่อตรงทองหล่อ อโศก และสยาม',
      'ร้านกาแฟ ร้านอาหาร และบาร์ระดับคุณภาพ',
      'บรรยากาศ urban village ใจกลางเมือง',
    ],
    highlights_en: [
      'Bangkok\'s hottest lifestyle neighbourhood',
      'Better value than Thonglor — same vibe, lower rent',
      'Direct BTS to Thonglor, Asok & Siam',
      'Boutique cafés, restaurants, and nightlife',
      'Urban village feel with strong expat community',
    ],
    price_from_th: 'ราคาเช่าเริ่มต้น ฿12,000/เดือน',
    price_from_en: 'Rentals from ฿12,000/month',
    faq_th: [
      { q: 'คอนโดเช่าเอกมัยราคาเท่าไหร่เมื่อเทียบกับทองหล่อ?', a: 'โดยทั่วไปราคาต่ำกว่าทองหล่อ 20–30% สตูดิโอในเอกมัยเริ่มต้นที่฿12,000–18,000/เดือน เทียบกับ฿18,000+/เดือนในทองหล่อ' },
      { q: 'เอกมัยเหมาะสำหรับใคร?', a: 'เหมาะมากสำหรับคนทำงานรุ่นใหม่ ฟรีแลนซ์ และชาวต่างชาติที่ต้องการย่านที่มีชีวิตชีวาและเดินทางสะดวก' },
    ],
    faq_en: [
      { q: 'How do Ekkamai rental prices compare to Thonglor?', a: 'Generally 20–30% lower. Studios in Ekkamai start at ฿12,000–18,000/month vs ฿18,000+ in Thonglor — while enjoying the same BTS access.' },
      { q: 'Is Ekkamai good for digital nomads and remote workers?', a: 'Absolutely — the area has dozens of co-working friendly cafés, fast internet infrastructure, and a strong expat/creative community.' },
    ],
  },

  /* ───────────────────────────────────────────────
     4. Lat Phrao — House
  ─────────────────────────────────────────────── */
  'house-rent-lat-phrao': {
    headline_th: 'เช่าบ้านย่านลาดพร้าว — พื้นที่กว้าง สงบ ใกล้เมือง',
    headline_en: 'Rent a House in Lat Phrao — Space, Calm & City Access',
    body_th: [
      'ลาดพร้าวเป็นทำเลเช่าบ้านยอดนิยมของครอบครัวชาวไทยและชาวต่างชาติที่ต้องการพื้นที่กว้างขวางในราคาที่สมเหตุสมผล ต่างจากย่านสุขุมวิทที่แน่นและมีเสียงดัง บ้านเช่าในลาดพร้าวให้ทั้งสวน ที่จอดรถ และความเป็นส่วนตัวที่หาไม่ได้ในคอนโดใจกลางเมือง',
      'ระบบขนส่งในย่านนี้พัฒนาขึ้นอย่างมากด้วย MRT สายสีเหลืองและรถไฟฟ้าสายสีน้ำเงิน ทำให้เดินทางเข้ากรุงเทพฯ ชั้นในได้สะดวกยิ่งขึ้น บริเวณใกล้เคียงมีห้างสรรพสินค้าขนาดใหญ่อย่าง Central Ladprao และ Union Mall รวมถึงโรงเรียนและโรงพยาบาลชั้นนำ',
      'SpacesMate รวบรวมบ้านเช่าในย่านลาดพร้าวตั้งแต่ทาวน์เฮ้าส์ บ้านเดี่ยว ไปจนถึงบ้านในหมู่บ้านจัดสรร พร้อมข้อมูลครบถ้วนและราคาที่โปร่งใส',
    ],
    body_en: [
      'Lat Phrao is Bangkok\'s premier house rental district for families — offering space, greenery, and private gardens at a fraction of the cost of equivalent space downtown. For families relocating to Bangkok or upgrading from a condo, Lat Phrao delivers genuine residential comfort.',
      'Transport links have improved significantly with the MRT Yellow Line expansion and existing Blue Line coverage, making commutes to central Bangkok far easier. Central Ladprao mall, Union Mall, top-tier international schools, and major hospitals are all within close reach.',
      'SpacesMate lists houses for rent in Lat Phrao — townhouses, detached homes, and gated community villas — with verified details and transparent pricing.',
    ],
    highlights_th: [
      'พื้นที่กว้าง มีสวน และที่จอดรถ',
      'ราคาคุ้มค่ากว่าบ้านเช่าในเขตใจกลางเมือง',
      'ใกล้ MRT และรถไฟฟ้าสายใหม่',
      'Central Ladprao และห้างฯ ครบครัน',
      'เหมาะสำหรับครอบครัวและผู้ที่ต้องการความสงบ',
    ],
    highlights_en: [
      'Spacious houses with gardens and parking',
      'Far better value per sq.m. than inner-city rentals',
      'MRT Blue & Yellow Line access',
      'Central Ladprao, Union Mall and top schools nearby',
      'Ideal for families and long-term renters',
    ],
    price_from_th: 'ราคาเช่าเริ่มต้น ฿15,000/เดือน',
    price_from_en: 'Rentals from ฿15,000/month',
    faq_th: [
      { q: 'บ้านเช่าย่านลาดพร้าวมีขนาดและราคาเท่าไหร่?', a: 'ทาวน์เฮ้าส์เริ่มต้น฿15,000–25,000/เดือน บ้านเดี่ยว 3 ห้องนอนประมาณ฿30,000–60,000/เดือน ขึ้นอยู่กับสภาพบ้านและทำเลย่อย' },
      { q: 'ลาดพร้าวใช้เวลาเดินทางเข้าเมืองนานแค่ไหน?', a: 'ขึ้นอยู่กับจุดหมาย ถ้าใช้ MRT ไปสยามหรืออโศกใช้เวลาประมาณ 20–35 นาที หากขับรถในชั่วโมงเร่งด่วนควรคิดเผื่อเวลาเพิ่ม' },
    ],
    faq_en: [
      { q: 'What are house rental prices in Lat Phrao?', a: 'Townhouses start from ฿15,000–25,000/month. A 3-bedroom detached house typically runs ฿30,000–60,000/month depending on condition and specific location.' },
      { q: 'How long does it take to commute from Lat Phrao to central Bangkok?', a: 'By MRT to Siam or Asok takes roughly 20–35 minutes. By car during peak hours, add extra time — but reverse commuting (outbound in morning, inbound in evening) is much smoother.' },
    ],
  },

  /* ───────────────────────────────────────────────
     5. BTS Thonglor — Condo
  ─────────────────────────────────────────────── */
  'condo-rent-bts-thonglor': {
    headline_th: 'เช่าคอนโดใกล้ BTS ทองหล่อ — ย่านหรูหรา ไลฟ์สไตล์พรีเมียม',
    headline_en: 'Rent a Condo near BTS Thonglor — Bangkok\'s Premium Lifestyle District',
    body_th: [
      'ทองหล่อเป็นย่านที่มีชื่อเสียงระดับนานาชาติในฐานะย่าน lifestyle พรีเมียมของกรุงเทพฯ ด้วยร้านอาหารระดับ fine dining, แกลเลอรี่ศิลปะ, ฟิตเนสระดับโลก และไนท์สปอตชั้นนำ ทำให้คอนโดให้เช่าในทองหล่อดึงดูดผู้บริหารระดับสูง ชาวต่างชาติ และคนที่ต้องการชีวิตระดับพรีเมียม',
      'BTS ทองหล่อเชื่อมต่อสุขุมวิทสายหลักและสามารถเดินทางถึงอโศก สยาม และสีลมได้ภายใน 15–25 นาที คอนโดเช่าในทองหล่อส่วนใหญ่เป็นไฮไรส์คุณภาพสูง มีวิวเมือง สระว่ายน้ำ สกาย ลอบบี้ และระบบรักษาความปลอดภัยระดับโรงแรม',
      'SpacesMate คัดสรรคอนโดเช่าระดับพรีเมียมในทองหล่อ ตั้งแต่ห้อง 1 ห้องนอนไปจนถึง penthouse สำหรับผู้ที่ต้องการมาตรฐานสูงสุด',
    ],
    body_en: [
      'Thonglor is Bangkok\'s internationally recognised premium lifestyle district — home to Michelin-starred dining, world-class wellness studios, boutique galleries, and some of the city\'s best bars. It attracts senior executives, expat professionals, and long-stay corporate tenants who demand the best.',
      'BTS Thonglor sits one stop from Ekkamai and connects to Asok, Siam and Silom within 15–25 minutes. Condos for rent in Thonglor are mostly high-specification highrises with sky pools, concierge service, and hotel-grade security.',
      'SpacesMate lists verified premium condos for rent in Thonglor — 1-bedroom to penthouse — with full facilities and honest pricing.',
    ],
    highlights_th: [
      'ย่านพรีเมียมระดับโลกของกรุงเทพฯ',
      'คอนโดไฮไรส์ระดับสูง วิวเมืองและสกายพูล',
      'Fine dining ระดับ Michelin และไนท์สปอตชั้นนำ',
      'ชุมชนชาวต่างชาติขนาดใหญ่',
      'เหมาะสำหรับ corporate housing ระดับบริหาร',
    ],
    highlights_en: [
      'Bangkok\'s most prestigious rental address',
      'High-spec highrise condos with city views & sky pools',
      'Michelin-level dining and top-tier nightlife',
      'Large established expat community',
      'Ideal for executive corporate housing',
    ],
    price_from_th: 'ราคาเช่าเริ่มต้น ฿25,000/เดือน',
    price_from_en: 'Rentals from ฿25,000/month',
    faq_th: [
      { q: 'คอนโดเช่าทองหล่อราคาเท่าไหร่?', a: 'ห้อง 1 ห้องนอนเริ่มต้นประมาณ฿25,000–45,000/เดือน ห้อง 2 ห้องนอนประมาณ฿50,000–90,000/เดือน ระดับ penthouse อาจสูงถึง฿150,000+/เดือน' },
      { q: 'ทองหล่อมีบริการคอนโดเช่าแบบระยะสั้นหรือไม่?', a: 'มีบ้างสำหรับ serviced apartment และ fully-managed units แต่ส่วนใหญ่เป็นสัญญาเช่าขั้นต่ำ 6–12 เดือน' },
    ],
    faq_en: [
      { q: 'How much does it cost to rent a condo in Thonglor?', a: '1-bedroom units start at ฿25,000–45,000/month. 2-bedroom units range from ฿50,000–90,000/month. Penthouses can reach ฿150,000+/month.' },
      { q: 'Are short-term condo rentals available in Thonglor?', a: 'Some serviced and managed units offer flexible terms, but the majority require a minimum 6–12 month lease. SpacesMate can filter by lease length.' },
    ],
  },

  /* ───────────────────────────────────────────────
     6. Silom — Office
  ─────────────────────────────────────────────── */
  'office-rent-silom': {
    headline_th: 'เช่าออฟฟิศย่านสีลม — ศูนย์กลางธุรกิจกรุงเทพฯ',
    headline_en: 'Rent an Office in Silom — Bangkok\'s Financial District',
    body_th: [
      'สีลมเป็นย่านธุรกิจการเงินที่เก่าแก่และทรงพลังที่สุดในกรุงเทพฯ เป็นที่ตั้งของธนาคาร บริษัทกฎหมาย บริษัทที่ปรึกษาข้ามชาติ และสำนักงานใหญ่ระดับโลกมากมาย การเช่าออฟฟิศในสีลมเหมาะสำหรับธุรกิจที่ต้องการที่อยู่ที่น่าเชื่อถือและเข้าถึงลูกค้าระดับองค์กร',
      'ย่านสีลมมีการเชื่อมต่อขนส่งสาธารณะที่ดีเยี่ยม ทั้ง BTS ศาลาแดงและ MRT สีลม ทำให้เดินทางได้ทั้งจากฝั่งสุขุมวิทและสาทร ออฟฟิศให้เช่าในย่านนี้มีหลายรูปแบบ ตั้งแต่ Grade A อาคารสูง ไปจนถึงออฟฟิศขนาดเล็กสำหรับธุรกิจ SME',
      'SpacesMate รวบรวมพื้นที่ออฟฟิศให้เช่าในย่านสีลม พร้อมข้อมูลขนาดพื้นที่ ราคาต่อตารางเมตร และสิ่งอำนวยความสะดวก',
    ],
    body_en: [
      'Silom is Bangkok\'s original financial district — home to the Stock Exchange of Thailand, major international banks, law firms, and the Thai headquarters of global multinationals. Renting office space in Silom signals credibility and puts your business in the heart of Bangkok\'s corporate ecosystem.',
      'The area is served by both BTS Sala Daeng and MRT Silom, giving staff excellent transit options from every direction. Office space for rent in Silom ranges from full-floor Grade A buildings to smaller serviced office suites suited to growing SMEs.',
      'SpacesMate lists office space for rent in Silom with clear floor area, pricing per sqm, and facility details — no opaque agent fees.',
    ],
    highlights_th: [
      'ย่านการเงินหลักของกรุงเทพฯ',
      'BTS ศาลาแดง + MRT สีลม',
      'ที่อยู่ที่น่าเชื่อถือระดับนานาชาติ',
      'ใกล้ธนาคาร สำนักงานกฎหมาย และหน่วยงานรัฐ',
      'มีออฟฟิศหลายขนาด จาก SME ถึง Enterprise',
    ],
    highlights_en: [
      'Bangkok\'s premier financial and legal district',
      'Dual transit: BTS Sala Daeng + MRT Silom',
      'Prestigious business address for any industry',
      'Banks, law firms, and government agencies nearby',
      'Office spaces from SME suites to full-floor Grade A',
    ],
    price_from_th: 'ราคาเช่าเริ่มต้น ฿350/ตร.ม./เดือน',
    price_from_en: 'Rentals from ฿350/sqm/month',
    faq_th: [
      { q: 'ออฟฟิศเช่าสีลมราคาต่อตารางเมตรเท่าไหร่?', a: 'อาคาร Grade A อยู่ที่ประมาณ฿800–1,200/ตร.ม./เดือน อาคาร Grade B อยู่ที่฿400–700/ตร.ม./เดือน Serviced office เริ่มต้นที่฿5,000–15,000/โต๊ะ/เดือน' },
      { q: 'มีออฟฟิศให้เช่าขนาดเล็กในสีลมหรือไม่?', a: 'มี — มีทั้ง serviced offices และ co-working space ที่รองรับตั้งแต่ 1–10 คน โดยไม่ต้องเช่าพื้นที่ทั้งชั้น' },
    ],
    faq_en: [
      { q: 'What is the office rental price per sqm in Silom?', a: 'Grade A buildings run ฿800–1,200/sqm/month. Grade B averages ฿400–700/sqm/month. Serviced desks start from ฿5,000–15,000/desk/month.' },
      { q: 'Are small office suites available for rent in Silom?', a: 'Yes — multiple serviced office providers and co-working operators in Silom cater to teams of 1–10 without requiring a full-floor commitment.' },
    ],
  },

  /* ───────────────────────────────────────────────
     7. BTS On Nut — Condo
  ─────────────────────────────────────────────── */
  'condo-rent-bts-on-nut': {
    headline_th: 'เช่าคอนโดใกล้ BTS อ่อนนุช — ใจกลางสุขุมวิทตะวันออก',
    headline_en: 'Rent a Condo near BTS On Nut — East Sukhumvit\'s Best Value',
    body_th: [
      'อ่อนนุชเป็นทำเลเช่าคอนโดที่คุ้มค่าที่สุดในย่านสุขุมวิทตอนกลาง-ตะวันออก สถานี BTS อ่อนนุชให้การเดินทางโดยตรงถึงอโศก สยาม และมโชกมัน 30 นาทีเท่านั้น ในขณะที่ราคาเช่าต่ำกว่าสถานีใกล้เคียงอย่างพระโขนงและทองหล่ออย่างเห็นได้ชัด',
      'ย่านอ่อนนุชมีทั้ง Tesco Lotus ขนาดใหญ่ ตลาดอ่อนนุช และร้านอาหารไทยหลากหลาย ทำให้ค่าครองชีพโดยรวมประหยัดกว่าย่านอื่นบนเส้นสุขุมวิท ชาวต่างชาติที่ทำงานในย่านกลางเมืองแต่ต้องการประหยัดค่าเช่านิยมเลือกอ่อนนุชเป็นที่พัก',
      'SpacesMate มีคอนโดเช่าย่านอ่อนนุชหลากหลายตัวเลือก ตั้งแต่ห้องสตูดิโอราคาประหยัดไปจนถึงคอนโดพรีเมียมใกล้สถานี',
    ],
    body_en: [
      'On Nut offers the best value per baht of any BTS station along the central Sukhumvit corridor. A direct BTS ride puts you at Asok in under 20 minutes and Siam in 25, while rental prices run 30–40% lower than Thonglor or Ekkamai.',
      'The neighbourhood is practical and lived-in — a large Tesco Lotus, the On Nut fresh market, and a wide selection of local Thai restaurants keep living costs low. It\'s a favourite among budget-conscious expats working in the CBD who want a BTS-connected home without the premium price tag.',
      'SpacesMate lists condos for rent near BTS On Nut — from studio apartments to larger 2-bedroom units — at the best verified prices.',
    ],
    highlights_th: [
      'ทำเลเช่าที่คุ้มค่าที่สุดบนสายสุขุมวิท',
      'BTS ตรงถึงอโศกใน 20 นาที',
      'ราคาเช่าต่ำกว่าทองหล่อและเอกมัย 30–40%',
      'ค่าครองชีพต่ำ ตลาดสด ห้างฯ ครบ',
      'เหมาะสำหรับมืออาชีพงบประหยัด',
    ],
    highlights_en: [
      'Best value BTS-connected rental on Sukhumvit',
      'Direct BTS to Asok in 20 mins, Siam in 25',
      'Rental prices 30–40% lower than Thonglor',
      'Low cost of living — local markets and Tesco nearby',
      'Perfect for budget-conscious expat professionals',
    ],
    price_from_th: 'ราคาเช่าเริ่มต้น ฿8,000/เดือน',
    price_from_en: 'Rentals from ฿8,000/month',
    faq_th: [
      { q: 'คอนโดเช่าอ่อนนุชราคาเท่าไหร่?', a: 'สตูดิโอเริ่มต้น฿8,000–13,000/เดือน ห้อง 1 ห้องนอนประมาณ฿13,000–22,000/เดือน ถือว่าคุ้มค่ามากเมื่อเทียบกับการเดินทาง' },
      { q: 'อ่อนนุชปลอดภัยและน่าอยู่สำหรับชาวต่างชาติหรือไม่?', a: 'ใช่ — ย่านอ่อนนุชมีชุมชนชาวต่างชาติขนาดใหญ่ มีร้านอาหารนานาชาติ และมีความปลอดภัยสูง เป็นทำเลที่ได้รับความนิยมมากขึ้นต่อเนื่อง' },
    ],
    faq_en: [
      { q: 'What are condo rental prices near BTS On Nut?', a: 'Studios start at ฿8,000–13,000/month. 1-bedroom units run ฿13,000–22,000/month — excellent value for BTS-connected living.' },
      { q: 'Is On Nut a good area for expats?', a: 'Yes — it has a sizeable expat community, international restaurants, and a safe residential environment. It\'s steadily growing in popularity as Sukhumvit prices push renters eastward.' },
    ],
  },

  /* ───────────────────────────────────────────────
     8. Ratchada — Apartment
  ─────────────────────────────────────────────── */
  'apartment-rent-ratchada': {
    headline_th: 'เช่าอพาร์ทเม้นท์ย่านรัชดา — ทำเลกลางเมืองราคาคุ้มค่า',
    headline_en: 'Rent an Apartment in Ratchada — Central Bangkok Without the Premium',
    body_th: [
      'รัชดาภิเษกเป็นหนึ่งในทำเลเช่าอพาร์ทเม้นท์ที่คุ้มค่าที่สุดในกรุงเทพฯ ชั้นใน ตั้งอยู่บนแนว MRT สายสีน้ำเงิน ผู้เช่าสามารถเดินทางถึงสีลม อโศก และสยามได้ภายใน 20–30 นาที โดยไม่ต้องจ่ายค่าเช่าแพงเท่าย่านสุขุมวิท',
      'ย่านรัชดามีสิ่งอำนวยความสะดวกครบครัน ทั้ง Central พระราม 9, Fortune Town, Esplanade, ร้านอาหาร และตลาดกลางคืน Train Night Market Ratchada ทำให้ชีวิตในย่านนี้มีความบันเทิงและสะดวกสบาย อพาร์ทเม้นท์เช่าในรัชดาหลายแห่งมีสิ่งอำนวยความสะดวกพร้อม ทั้งสระว่ายน้ำ ฟิตเนส และที่จอดรถ',
      'SpacesMate คัดสรรอพาร์ทเม้นท์เช่าย่านรัชดาจากหลากหลายอาคาร ในทุกช่วงราคา พร้อมรูปจริงและรายละเอียดครบถ้วน',
    ],
    body_en: [
      'Ratchada is central Bangkok\'s most accessible rental district for those who work in the CBD but want to avoid Sukhumvit price premiums. The MRT Blue Line runs through the heart of the area, connecting to Silom, Asok, and Siam in under 30 minutes.',
      'The neighbourhood punches well above its price point for lifestyle — Central Rama 9, Fortune Town IT plaza, the Esplanade cinema complex, and the famous Train Night Market Ratchada are all within easy reach. Many apartment buildings in Ratchada offer full facilities at significantly lower rents than equivalent Sukhumvit properties.',
      'SpacesMate lists apartments for rent across the Ratchada corridor — with photos, floor plans, and verified pricing.',
    ],
    highlights_th: [
      'MRT Blue Line ใจกลางรัชดา',
      'ราคาเช่าต่ำกว่าสุขุมวิท 30–40%',
      'Central พระราม 9 และ Train Night Market',
      'สิ่งอำนวยความสะดวกครบครัน',
      'เหมาะทั้งคนไทยและชาวต่างชาติ',
    ],
    highlights_en: [
      'MRT Blue Line through central Ratchada',
      'Rents 30–40% lower than equivalent Sukhumvit units',
      'Central Rama 9 and Train Night Market nearby',
      'Full facilities — pool, gym, parking',
      'Popular with Thai professionals and expat newcomers',
    ],
    price_from_th: 'ราคาเช่าเริ่มต้น ฿7,000/เดือน',
    price_from_en: 'Rentals from ฿7,000/month',
    faq_th: [
      { q: 'อพาร์ทเม้นท์เช่ารัชดาราคาเท่าไหร่?', a: 'สตูดิโอเริ่มต้น฿7,000–12,000/เดือน ห้อง 1 ห้องนอนประมาณ฿12,000–20,000/เดือน ได้พื้นที่และสิ่งอำนวยความสะดวกที่ดีกว่าในราคาเท่ากับสุขุมวิท' },
      { q: 'รัชดาเดินทางไปสีลมและอโศกนานแค่ไหน?', a: 'ใช้ MRT ไปสีลมประมาณ 20 นาที ไปอโศกประมาณ 15 นาที สะดวกมากสำหรับคนทำงานในย่านธุรกิจ' },
    ],
    faq_en: [
      { q: 'What do apartments rent for in Ratchada?', a: 'Studios start from ฿7,000–12,000/month. 1-bedroom units average ฿12,000–20,000/month — with more space and facilities than equivalent Sukhumvit prices would get you.' },
      { q: 'How far is Ratchada from Silom and Asok by MRT?', a: 'Silom is about 20 minutes by MRT; Asok is around 15 minutes. It\'s an efficient commute for CBD office workers.' },
    ],
  },

  /* ───────────────────────────────────────────────
     9. Rama 9 — House
  ─────────────────────────────────────────────── */
  'house-rent-rama-9': {
    headline_th: 'เช่าบ้านย่านพระราม 9 — ทำเลธุรกิจใหม่ใจกลางเมือง',
    headline_en: 'Rent a House near Rama 9 — Bangkok\'s New CBD Rising Fast',
    body_th: [
      'พระราม 9 กำลังพัฒนาอย่างรวดเร็วในฐานะศูนย์กลางธุรกิจใหม่ของกรุงเทพฯ เต็มไปด้วยอาคารสำนักงาน Grade A ที่เพิ่งสร้างใหม่ ห้างสรรพสินค้า Central พระราม 9 และโครงการมิกซ์ยูสขนาดใหญ่ บ้านเช่าในย่านนี้เหมาะสำหรับผู้บริหารที่ทำงานในย่านพระราม 9 และรัชดา',
      'ที่อยู่อาศัยรอบย่านพระราม 9 มีทั้งบ้านเดี่ยว ทาวน์เฮ้าส์ และคอนโด ในราคาที่ยังสมเหตุสมผลเมื่อเทียบกับศักยภาพของย่าน MRT พระราม 9 เชื่อมต่อโดยตรงไปยังสีลม อโศก และอสมหานครได้อย่างสะดวก',
      'SpacesMate มีบ้านเช่าในย่านพระราม 9 ทั้งทาวน์เฮ้าส์และบ้านเดี่ยว พร้อมข้อมูลละเอียดและราคาโปร่งใส',
    ],
    body_en: [
      'Rama 9 is Bangkok\'s fastest-growing new business district — anchored by Central Rama 9, G Tower, and a pipeline of new Grade A office buildings. Families and executives working in the Rama 9–Ratchada corridor increasingly prefer renting houses here over the higher-priced Sukhumvit alternatives.',
      'The surrounding residential streets offer standalone houses and townhouses at competitive rents, while MRT Rama 9 delivers direct access to Silom and the eastern Sukhumvit line. The area\'s rapid development means today\'s renters are getting into a neighbourhood before it peaks.',
      'SpacesMate lists houses for rent near Rama 9 — townhouses, detached homes, and garden villas — with verified details.',
    ],
    highlights_th: [
      'ศูนย์กลางธุรกิจใหม่ที่กำลังพัฒนาเร็วที่สุด',
      'MRT พระราม 9 เชื่อมต่อสีลมและรัชดา',
      'Central พระราม 9 และ G Tower ใกล้มือ',
      'บ้านเช่าราคาคุ้มค่าก่อนย่านจะพัฒนาเต็มที่',
      'เหมาะสำหรับผู้บริหารและครอบครัว',
    ],
    highlights_en: [
      'Bangkok\'s fastest-developing new CBD',
      'MRT Rama 9 to Silom direct',
      'Central Rama 9 mall and Grade A offices',
      'Good value before the area fully matures',
      'Popular with executives and expat families',
    ],
    price_from_th: 'ราคาเช่าเริ่มต้น ฿18,000/เดือน',
    price_from_en: 'Rentals from ฿18,000/month',
    faq_th: [
      { q: 'บ้านเช่าย่านพระราม 9 ราคาเท่าไหร่?', a: 'ทาวน์เฮ้าส์เริ่มต้น฿18,000–28,000/เดือน บ้านเดี่ยวขนาด 3 ห้องนอนประมาณ฿35,000–65,000/เดือน' },
      { q: 'พระราม 9 เหมาะสำหรับครอบครัวชาวต่างชาติหรือไม่?', a: 'ใช่ — มีโรงเรียนนานาชาติหลายแห่งในบริเวณใกล้เคียง รวมถึงสิ่งอำนวยความสะดวกครบครัน และการเดินทางสะดวก' },
    ],
    faq_en: [
      { q: 'What are house rental prices near Rama 9?', a: 'Townhouses start from ฿18,000–28,000/month. A 3-bedroom detached house typically costs ฿35,000–65,000/month.' },
      { q: 'Is Rama 9 suitable for expat families?', a: 'Yes — several international schools are nearby, and the area\'s rapid development means improving amenities. MRT access keeps the commute manageable.' },
    ],
  },

  /* ───────────────────────────────────────────────
     10. MRT Lat Phrao — Condo
  ─────────────────────────────────────────────── */
  'condo-rent-mrt-lat-phrao': {
    headline_th: 'เช่าคอนโดใกล้ MRT ลาดพร้าว — ราคาดี เดินทางง่าย',
    headline_en: 'Rent a Condo near MRT Lat Phrao — Affordable, Well-Connected',
    body_th: [
      'MRT ลาดพร้าวเป็นหนึ่งในสถานีที่เข้าถึงได้มากที่สุดสำหรับคนที่ต้องการเช่าคอนโดในกรุงเทพฯ ตอนเหนือ ราคาเช่าถูกกว่าย่านสุขุมวิทอย่างชัดเจน แต่ MRT เชื่อมต่อได้ตรงไปยังสีลม บางซื่อ และจุดเปลี่ยนสำคัญอื่นๆ ในเมือง',
      'ย่านลาดพร้าวรอบสถานี MRT มีคอนโดใหม่เพิ่มขึ้นอย่างต่อเนื่อง เนื่องจากนักพัฒนาตอบรับความต้องการที่สูงในย่านนี้ สิ่งอำนวยความสะดวกใกล้สถานีมีทั้งร้านอาหาร ห้างสรรพสินค้า และตลาดสด ทำให้ชีวิตประจำวันสะดวกสบาย',
      'SpacesMate รวบรวมคอนโดเช่าใกล้ MRT ลาดพร้าว พร้อมรายละเอียดระยะห่างจากสถานีและสิ่งอำนวยความสะดวก',
    ],
    body_en: [
      'MRT Lat Phrao offers some of the best-value condo rentals in Bangkok\'s northern residential belt. Rents are noticeably lower than comparable Sukhumvit properties, while the MRT delivers a direct, air-conditioned commute to Silom, Bang Sue Grand Station interchange, and beyond.',
      'The station area has seen strong condo development over recent years as renters migrate north in search of value. Nearby amenities include the major Central Ladprao mall, fresh markets, and a dense restaurant scene — everything you need within 10–15 minutes of your door.',
      'SpacesMate lists condos for rent near MRT Lat Phrao with station distance details and full facility specs.',
    ],
    highlights_th: [
      'คอนโดเช่าราคาดีใกล้ MRT',
      'เชื่อมต่อตรงสีลมและบางซื่อ',
      'Central Ladprao ในระยะเดิน',
      'โครงการใหม่หลายแห่งในย่าน',
      'เหมาะสำหรับมืออาชีพและครอบครัวเล็ก',
    ],
    highlights_en: [
      'Excellent value MRT-connected condos',
      'Direct line to Silom and Bang Sue interchange',
      'Central Ladprao mall walkable from station',
      'New condo developments across the area',
      'Great for young professionals and small families',
    ],
    price_from_th: 'ราคาเช่าเริ่มต้น ฿9,000/เดือน',
    price_from_en: 'Rentals from ฿9,000/month',
    faq_th: [
      { q: 'คอนโดเช่าใกล้ MRT ลาดพร้าวราคาเท่าไหร่?', a: 'สตูดิโอเริ่มต้น฿9,000–14,000/เดือน ห้อง 1 ห้องนอนประมาณ฿14,000–22,000/เดือน ถือว่าคุ้มค่ามากสำหรับผู้ที่ใช้ MRT เดินทาง' },
      { q: 'MRT ลาดพร้าวไปสีลมใช้เวลานานแค่ไหน?', a: 'ประมาณ 25–35 นาที ขึ้นอยู่กับจุดเปลี่ยนขบวน สะดวกและตรงเวลา' },
    ],
    faq_en: [
      { q: 'What are condo rental prices near MRT Lat Phrao?', a: 'Studios start at ฿9,000–14,000/month. 1-bedroom units average ฿14,000–22,000/month — strong value for MRT-connected living.' },
      { q: 'How long does MRT Lat Phrao to Silom take?', a: 'Approximately 25–35 minutes depending on the transfer, reliable and air-conditioned throughout.' },
    ],
  },

  /* ───────────────────────────────────────────────
     11. Co-Working Sukhumvit
  ─────────────────────────────────────────────── */
  'coworking-rent-sukhumvit': {
    headline_th: 'เช่าพื้นที่ทำงาน Co-Working ย่านสุขุมวิท — ยืดหยุ่น ใจกลางเมือง',
    headline_en: 'Rent Co-Working Space on Sukhumvit — Flexible Workspaces in Bangkok\'s Heart',
    body_th: [
      'ย่านสุขุมวิทมีพื้นที่ Co-Working Space ให้เช่าหนาแน่นที่สุดในกรุงเทพฯ ตั้งแต่ Hotdesk ราคาประหยัดไปจนถึงออฟฟิศส่วนตัวที่เหมาะสำหรับทีม เนื่องจากสุขุมวิทเป็นย่านที่มีชุมชนฟรีแลนซ์ นักธุรกิจ และ remote worker ขนาดใหญ่ที่สุดในไทย',
      'Co-Working spaces ในสุขุมวิทส่วนใหญ่ตั้งอยู่ใกล้สถานี BTS มีอินเทอร์เน็ตความเร็วสูง ห้องประชุม และสภาพแวดล้อมที่เอื้อต่อการทำงาน หลายแห่งมีแพ็คเกจ Day Pass, Monthly Plan และ Team Room ให้เลือกตามความต้องการ',
      'SpacesMate รวบรวมพื้นที่ Co-Working Space ให้เช่าตลอดแนวสุขุมวิท พร้อมราคา ขนาด และสิ่งอำนวยความสะดวก เปรียบเทียบได้ในที่เดียว',
    ],
    body_en: [
      'Sukhumvit is Bangkok\'s co-working capital — the highest concentration of flexible workspaces along any corridor in the city. From hot desks at a few hundred baht per day to private team offices on monthly plans, there\'s a workspace for every need and budget.',
      'Most co-working spaces on Sukhumvit are BTS-adjacent, air-conditioned, with high-speed fibre internet, meeting rooms, and communities of freelancers, startups, and remote workers from around the world. Flexibility is the key draw — no long-term leases, no setup costs.',
      'SpacesMate lists co-working spaces for rent across the Sukhumvit corridor — with pricing, amenities, and BTS distance all compared in one place.',
    ],
    highlights_th: [
      'ย่านที่มี Co-Working หนาแน่นที่สุดในกรุงเทพฯ',
      'แพ็คเกจยืดหยุ่น Day Pass ถึง Monthly Plan',
      'ทุกแห่งใกล้ BTS อินเทอร์เน็ตเร็ว',
      'เหมาะสำหรับฟรีแลนซ์ startup และ remote team',
      'ชุมชน remote worker นานาชาติขนาดใหญ่',
    ],
    highlights_en: [
      'Bangkok\'s densest co-working corridor',
      'Day pass to monthly plans — fully flexible',
      'BTS-adjacent with high-speed fibre',
      'Ideal for freelancers, startups, and remote teams',
      'Large international remote worker community',
    ],
    price_from_th: 'ราคาเช่าเริ่มต้น ฿200/วัน หรือ ฿3,500/เดือน',
    price_from_en: 'From ฿200/day or ฿3,500/month',
    faq_th: [
      { q: 'Co-Working space บนสุขุมวิทราคาเท่าไหร่?', a: 'Day pass เริ่มต้น฿200–400/วัน Monthly hot desk ประมาณ฿3,500–7,000/เดือน ออฟฟิศส่วนตัวสำหรับทีมเริ่มต้น฿15,000/เดือนขึ้นไป' },
      { q: 'มี Co-Working ที่เปิด 24 ชั่วโมงบนสุขุมวิทหรือไม่?', a: 'บางแห่งมี โดยเฉพาะ Co-Working ที่เน้นบริการ remote worker ระดับพรีเมียม แนะนำให้เช็คข้อมูลแต่ละแห่งก่อนตัดสินใจ' },
    ],
    faq_en: [
      { q: 'How much does co-working space cost on Sukhumvit?', a: 'Day passes from ฿200–400. Monthly hot desk plans average ฿3,500–7,000/month. Dedicated team offices start from ฿15,000/month.' },
      { q: 'Are there 24-hour co-working spaces on Sukhumvit?', a: 'Some premium locations offer 24/7 access — typically on higher-tier membership plans. SpacesMate listings include opening hours so you can filter accordingly.' },
    ],
  },

  /* ───────────────────────────────────────────────
     12. BTS Saphan Kwai — Condo
  ─────────────────────────────────────────────── */
  'condo-rent-bts-saphan-kwai': {
    headline_th: 'เช่าคอนโดใกล้ BTS สะพานควาย — ทำเลเชียร์ลีดิ้งของกรุงเทพฝั่งเหนือ',
    headline_en: 'Rent a Condo near BTS Saphan Kwai — North Bangkok\'s Underrated Gem',
    body_th: [
      'สะพานควายเป็นทำเลเช่าคอนโดที่ยังไม่เป็นที่รู้จักกว้างขวางนัก แต่นำเสนอคุณค่าที่ยอดเยี่ยม เชื่อมต่อโดยตรงผ่าน BTS สายสีลมไปยังสยาม สีลม และจตุจักร คอนโดเช่าในย่านนี้ยังมีราคาที่จับต้องได้ ในขณะที่การเดินทางสะดวกเทียบเท่ากับสถานีแพงกว่า',
      'ย่านรอบสะพานควายมีตลาดสด ร้านอาหารไทยหลากหลาย และห้างสรรพสินค้า Big C เส้นทาง BTS ยังเชื่อมต่อตรงไปยังโมเชกมัน จตุจักร และมโชกมัน ทำให้เป็นทางเลือกที่ดีสำหรับผู้ที่ต้องการพักใกล้สวนสาธารณะจตุจักรและตลาดวีคเอนด์',
      'SpacesMate มีรายการคอนโดเช่าย่านสะพานควายให้เลือกหลากหลาย เหมาะสำหรับผู้เช่าที่ต้องการ BTS ราคาคุ้มค่า',
    ],
    body_en: [
      'Saphan Kwai is one of Bangkok\'s best-kept secrets for condo rentals — well-connected by the BTS Silom Line to Siam, Silom, and Chatuchak, yet priced far below the equivalent southern stations. It\'s a quiet, residential area that\'s genuinely undervalued.',
      'The neighbourhood revolves around a lively local market, excellent Thai street food, and easy access to Chatuchak Park and the Weekend Market. The BTS also connects north to Mor Chit (the bus and BTS/MRT interchange), making cross-city travel simple.',
      'SpacesMate lists verified condos for rent near BTS Saphan Kwai for renters seeking BTS access at honest prices.',
    ],
    highlights_th: [
      'ทำเลคุณค่าสูงบนสาย BTS สีลม',
      'ราคาถูกกว่าสถานีใกล้เคียงในเส้นเดียวกัน',
      'ใกล้สวนสาธารณะจตุจักรและตลาด weekend',
      'อาหารไทยท้องถิ่นและตลาดสดครบครัน',
      'เหมาะสำหรับผู้เช่าที่งบประหยัดและต้องการ BTS',
    ],
    highlights_en: [
      'Underrated but highly connected BTS Silom Line location',
      'Significantly cheaper than equivalent southern stations',
      'Chatuchak Park and Weekend Market nearby',
      'Great local food and fresh market scene',
      'Perfect for value-seeking BTS commuters',
    ],
    price_from_th: 'ราคาเช่าเริ่มต้น ฿8,500/เดือน',
    price_from_en: 'Rentals from ฿8,500/month',
    faq_th: [
      { q: 'คอนโดเช่าสะพานควายราคาเท่าไหร่?', a: 'สตูดิโอเริ่มต้น฿8,500–13,000/เดือน ห้อง 1 ห้องนอนประมาณ฿13,000–20,000/เดือน ราคาดีมากสำหรับสถานี BTS' },
      { q: 'สะพานควายไปสยามใช้เวลานานแค่ไหน?', a: 'ประมาณ 15–20 นาทีด้วย BTS สายสีลม ไม่ต้องเปลี่ยนสาย' },
    ],
    faq_en: [
      { q: 'What are condo rents near BTS Saphan Kwai?', a: 'Studios start around ฿8,500–13,000/month. 1-bedroom units average ฿13,000–20,000/month — great value for a BTS-connected location.' },
      { q: 'How far is Saphan Kwai from Siam by BTS?', a: 'Around 15–20 minutes on the BTS Silom Line, no transfers required.' },
    ],
  },

  /* ───────────────────────────────────────────────
     13. BTS Ari — Condo
  ─────────────────────────────────────────────── */
  'condo-rent-bts-ari': {
    headline_th: 'เช่าคอนโดใกล้ BTS อารีย์ — ย่านชิลล์สไตล์มีเสน่ห์',
    headline_en: 'Rent a Condo near BTS Ari — Bangkok\'s Most Charming Neighbourhood',
    body_th: [
      'อารีย์เป็นย่านที่มีเสน่ห์เฉพาะตัวและกำลังเป็นที่นิยมสูงสุดในหมู่ผู้เช่าคอนโดรุ่นใหม่ในกรุงเทพฯ เต็มไปด้วยร้านกาแฟ ร้านอาหารคุณภาพ โบสถ์เก่า สวนสาธารณะ และบรรยากาศย่านที่อยู่อาศัยที่เงียบสงบแต่มีชีวิตชีวา ต่างจากย่านเชิงพาณิชย์อย่างสุขุมวิทอย่างสิ้นเชิง',
      'BTS อารีย์อยู่บนสายสุขุมวิท เชื่อมต่อตรงไปยังสยาม อโศก และหมอชิต ทำให้เป็นสถานีที่สะดวกมากสำหรับคนทำงานทั้งในย่านธุรกิจและจตุจักร คอนโดเช่าในอารีย์มีราคาพอเหมาะพอควร ขณะที่คุณภาพชีวิตและบรรยากาศย่านสูงกว่าหลายทำเลในเส้นเดียวกัน',
      'SpacesMate รวบรวมคอนโดเช่าใกล้ BTS อารีย์จากหลายอาคาร พร้อมรูปจริงและราคาโปร่งใส',
    ],
    body_en: [
      'Ari is Bangkok\'s most-loved neighbourhood for a reason — it manages to be calm, charming, and community-driven while remaining highly connected. Independent cafés, heritage churches, neighbourhood parks, and a laid-back residential atmosphere make it the antithesis of Sukhumvit\'s commercial intensity.',
      'BTS Ari is on the Sukhumvit Line, with direct access to Siam, Asok, and Mo Chit — a rare trifecta for a neighbourhood that genuinely feels like a village. Rents are moderate by Bangkok BTS standards, and the quality of life is exceptional.',
      'SpacesMate lists condos for rent near BTS Ari — from studio flats to spacious 2-bedroom apartments — with honest, verified pricing.',
    ],
    highlights_th: [
      'ย่านที่มีบรรยากาศดีที่สุดในกรุงเทพฯ',
      'BTS สายสุขุมวิท ตรงถึงสยาม อโศก และหมอชิต',
      'ร้านกาแฟ ร้านอาหาร และสวนสาธารณะในย่าน',
      'บรรยากาศเงียบสงบแต่เดินทางสะดวก',
      'ชุมชนคนรุ่นใหม่และชาวต่างชาติ',
    ],
    highlights_en: [
      'Bangkok\'s most charming and liveable neighbourhood',
      'BTS to Siam, Asok & Mo Chit direct',
      'Independent cafés, restaurants, and local parks',
      'Quiet residential feel with great connectivity',
      'Strong expat and creative community',
    ],
    price_from_th: 'ราคาเช่าเริ่มต้น ฿11,000/เดือน',
    price_from_en: 'Rentals from ฿11,000/month',
    faq_th: [
      { q: 'คอนโดเช่าอารีย์ราคาเท่าไหร่?', a: 'สตูดิโอเริ่มต้น฿11,000–16,000/เดือน ห้อง 1 ห้องนอนประมาณ฿18,000–28,000/เดือน คุ้มค่ามากสำหรับบรรยากาศย่านที่ได้รับ' },
      { q: 'อารีย์เหมาะสำหรับใครบ้าง?', a: 'เหมาะสำหรับคนทำงานรุ่นใหม่ ฟรีแลนซ์ ครีเอทีฟ และชาวต่างชาติที่ต้องการย่านที่มีชีวิตชีวาแต่ไม่อึดอัดและไม่ดังเกินไป' },
    ],
    faq_en: [
      { q: 'What do condos rent for near BTS Ari?', a: 'Studios start at ฿11,000–16,000/month. 1-bedroom units average ฿18,000–28,000/month — fair pricing for the exceptional neighbourhood quality.' },
      { q: 'Who is Ari best suited for as a rental area?', a: 'Young professionals, freelancers, creatives, and expats who want a neighbourhood with soul — not just transit. It\'s calm, but never boring.' },
    ],
  },

  /* ───────────────────────────────────────────────
     14. Bang Na — Apartment
  ─────────────────────────────────────────────── */
  'apartment-rent-bang-na': {
    headline_th: 'เช่าอพาร์ทเม้นท์ย่านบางนา — ทำเลกว้าง ราคาเข้าถึงได้',
    headline_en: 'Rent an Apartment in Bang Na — Spacious Living at Accessible Prices',
    body_th: [
      'บางนาเป็นทำเลเช่าที่กำลังเติบโตทางฝั่งตะวันออกของกรุงเทพฯ ด้วยพื้นที่กว้างขวาง ราคาเช่าที่จับต้องได้ และการเดินทางที่สะดวกผ่าน BTS สายสีเขียว ย่านนี้เหมาะสำหรับครอบครัวและผู้เช่าที่ต้องการพื้นที่กว้างในราคาที่สมเหตุสมผล',
      'บริเวณบางนามีห้างสรรพสินค้า BITEC Bangkok International Trade and Exhibition Center, Mega Bangna, CentralPlaza บางนา และโรงเรียนนานาชาติหลายแห่ง ทำให้เป็นทำเลยอดนิยมสำหรับครอบครัวชาวต่างชาติที่ทำงานในย่านอุตสาหกรรมและธุรกิจตะวันออก',
      'SpacesMate รวบรวมอพาร์ทเม้นท์เช่าย่านบางนา ตั้งแต่ห้องสตูดิโอไปจนถึงห้อง 3 ห้องนอน ในราคาที่โปร่งใส',
    ],
    body_en: [
      'Bang Na is Bangkok\'s eastern residential growth corridor — wide roads, open spaces, and apartment rentals at prices that can\'t be matched in central Bangkok. The BTS Green Line extension has transformed connectivity, making the commute to Asok or Siam far more manageable than it once was.',
      'Major anchors in the area include BITEC (Bangkok\'s largest convention centre), Mega Bangna and CentralPlaza Bang Na shopping malls, and a cluster of international schools. This makes Bang Na a natural landing point for expat families connected to the Suvarnabhumi corridor and eastern industrial zones.',
      'SpacesMate lists apartments for rent in Bang Na — from studios to 3-bedroom family units — with clear pricing and verified details.',
    ],
    highlights_th: [
      'อพาร์ทเม้นท์กว้างขวางในราคาที่เข้าถึงได้',
      'BTS สายสีเขียวเชื่อมต่อใจกลางเมือง',
      'Mega Bangna และ CentralPlaza ใกล้มือ',
      'BITEC และโรงเรียนนานาชาติหลายแห่ง',
      'เหมาะสำหรับครอบครัวและผู้ที่ต้องการพื้นที่กว้าง',
    ],
    highlights_en: [
      'Spacious apartments at city-edge prices',
      'BTS Green Line to central Bangkok',
      'Mega Bangna and CentralPlaza nearby',
      'BITEC and international schools in the area',
      'Popular with expat families and eastern corridor workers',
    ],
    price_from_th: 'ราคาเช่าเริ่มต้น ฿6,500/เดือน',
    price_from_en: 'Rentals from ฿6,500/month',
    faq_th: [
      { q: 'อพาร์ทเม้นท์เช่าบางนาราคาเท่าไหร่?', a: 'สตูดิโอเริ่มต้น฿6,500–10,000/เดือน ห้อง 1 ห้องนอนประมาณ฿10,000–16,000/เดือน ห้อง 2–3 ห้องนอนประมาณ฿18,000–30,000/เดือน' },
      { q: 'บางนาเดินทางเข้าเมืองนานแค่ไหน?', a: 'ด้วย BTS จาก BTS บางนาถึงอโศกประมาณ 25–35 นาที รถเข้าเมืองในชั่วโมงเร่งด่วนใช้เวลานานกว่านั้น' },
    ],
    faq_en: [
      { q: 'What are apartment rental prices in Bang Na?', a: 'Studios start at ฿6,500–10,000/month. 1-bedroom units average ฿10,000–16,000/month. 2–3 bedroom family apartments run ฿18,000–30,000/month.' },
      { q: 'How long is the commute from Bang Na to central Bangkok?', a: 'BTS from Bang Na to Asok takes around 25–35 minutes. Driving in peak hours takes longer — but the reverse commute (outbound in morning) is much smoother.' },
    ],
  },

  /* ───────────────────────────────────────────────
     15. MRT Phahon Yothin — Condo
  ─────────────────────────────────────────────── */
  'condo-rent-mrt-phahon-yothin': {
    headline_th: 'เช่าคอนโดใกล้ MRT พหลโยธิน — จุดตัดขนส่งกรุงเทพฝั่งเหนือ',
    headline_en: 'Rent a Condo near MRT Phahon Yothin — North Bangkok\'s Transit Hub',
    body_th: [
      'ย่าน MRT พหลโยธินเป็นหนึ่งในจุดเชื่อมต่อขนส่งที่ดีที่สุดในกรุงเทพฯ ตอนเหนือ ใกล้กับ BTS หมอชิตและอนุสาวรีย์ชัยสมรภูมิ ทำให้การเดินทางทั้งขึ้นและลงเหนือมีความสะดวกสบายอย่างมาก คอนโดเช่าในย่านนี้ยังมีราคาที่คุ้มค่าเทียบกับการเชื่อมต่อที่ได้รับ',
      'บริเวณใกล้เคียงมีตลาดจตุจักร (JJ Market) ตลาดนัดสวนจตุจักร และห้างสรรพสินค้า Union Mall และ Central Ladprao อยู่ในระยะสั้น ย่านนี้มีชุมชนทั้งชาวไทยและชาวต่างชาติที่มีความหนาแน่น ทำให้การใช้ชีวิตในชีวิตประจำวันสะดวกสบาย',
      'SpacesMate รวบรวมคอนโดเช่าใกล้ MRT พหลโยธิน พร้อมข้อมูลครบถ้วนและราคาโปร่งใส',
    ],
    body_en: [
      'MRT Phahon Yothin sits at the heart of North Bangkok\'s transit web — close to the BTS Mo Chit interchange, Victory Monument, and the expressway north. The result is exceptional connectivity in every direction at rental prices that remain genuinely affordable.',
      'Chatuchak Weekend Market (the world\'s largest outdoor market), Union Mall, and the Central Ladprao shopping complex are all nearby. The area has a lively mix of Thai residents and a growing expat presence — with excellent street food, fresh markets, and local amenities.',
      'SpacesMate lists condos for rent near MRT Phahon Yothin — verified listings with full specs and transparent pricing.',
    ],
    highlights_th: [
      'จุดตัดขนส่งมวลชนสำคัญของกรุงเทพฯ เหนือ',
      'ใกล้ BTS หมอชิตและอนุสาวรีย์ชัย',
      'ตลาดจตุจักรและ Union Mall ใกล้มือ',
      'ราคาเช่าคุ้มค่าสำหรับการเชื่อมต่อที่ได้',
      'ชุมชนหนาแน่นทั้งไทยและต่างชาติ',
    ],
    highlights_en: [
      'North Bangkok\'s best transit hub',
      'Near BTS Mo Chit & Victory Monument interchange',
      'Chatuchak Market and Union Mall nearby',
      'Affordable rents for the connectivity on offer',
      'Dense residential community, Thai and expat',
    ],
    price_from_th: 'ราคาเช่าเริ่มต้น ฿9,500/เดือน',
    price_from_en: 'Rentals from ฿9,500/month',
    faq_th: [
      { q: 'คอนโดเช่าใกล้ MRT พหลโยธินราคาเท่าไหร่?', a: 'สตูดิโอเริ่มต้น฿9,500–14,000/เดือน ห้อง 1 ห้องนอนประมาณ฿14,000–22,000/เดือน ถือว่าคุ้มค่าสำหรับจุดเชื่อมต่อที่ยอดเยี่ยม' },
      { q: 'MRT พหลโยธินไปสีลมใช้เวลานานแค่ไหน?', a: 'ประมาณ 30–40 นาทีด้วย MRT สายสีน้ำเงิน ไม่ต้องเปลี่ยนสาย' },
    ],
    faq_en: [
      { q: 'What are condo rents near MRT Phahon Yothin?', a: 'Studios start at ฿9,500–14,000/month. 1-bedroom units average ฿14,000–22,000/month — solid value for a highly connected north Bangkok location.' },
      { q: 'How long does MRT Phahon Yothin to Silom take?', a: 'About 30–40 minutes on the MRT Blue Line, no transfers needed.' },
    ],
  },

  /* ───────────────────────────────────────────────
     16. Sathorn — Office
  ─────────────────────────────────────────────── */
  'office-rent-sathorn': {
    headline_th: 'เช่าออฟฟิศย่านสาทร — ทำเลธุรกิจระดับสากลของกรุงเทพฯ',
    headline_en: 'Rent an Office in Sathorn — Bangkok\'s International Business District',
    body_th: [
      'สาทรเป็นย่านที่ตั้งของสำนักงานบริษัทข้ามชาติ สถานทูต และสำนักงานใหญ่ระดับโลกจำนวนมาก ออฟฟิศเช่าในสาทรนำเสนอที่อยู่ระดับสากลที่สร้างความน่าเชื่อถือให้แก่ธุรกิจทันทีที่สมัครใช้งาน โดยเฉพาะสำหรับบริษัทที่ต้องการทำงานกับพันธมิตรต่างประเทศ',
      'ย่านสาทรเชื่อมต่อด้วย BTS สุรศักดิ์และ MRT ลุมพินี ทำให้เดินทางได้ทั้งสายสุขุมวิทและสายสีลม ออฟฟิศให้เช่าในสาทรมีตั้งแต่อาคารสำนักงาน Grade A พร้อมวิวแม่น้ำเจ้าพระยา ไปจนถึง serviced office ขนาดเล็กที่เหมาะสำหรับบริษัท SME และ startup ที่ต้องการที่อยู่ระดับสากล',
      'SpacesMate รวบรวมพื้นที่ออฟฟิศให้เช่าในสาทร พร้อมข้อมูลขนาดพื้นที่ ราคาต่อตารางเมตร และสิ่งอำนวยความสะดวก',
    ],
    body_en: [
      'Sathorn is Bangkok\'s international business district — home to embassies, multinational headquarters, and the Thai offices of major global firms. Renting office space in Sathorn delivers an address that signals credibility to international partners and clients from day one.',
      'The area is served by BTS Surasak (Silom Line) and MRT Lumphini, with fast connections to both Sukhumvit and Silom. Office space for rent in Sathorn spans full-floor Grade A towers (some with Chao Phraya River views) down to compact serviced office suites suited to growing SMEs seeking a premium Bangkok address.',
      'SpacesMate lists office space for rent in Sathorn with full area specs, pricing per sqm, and amenity details.',
    ],
    highlights_th: [
      'ย่านธุรกิจระดับสากลและสถานทูต',
      'BTS สุรศักดิ์ + MRT ลุมพินี',
      'ออฟฟิศ Grade A วิวแม่น้ำเจ้าพระยา',
      'เหมาะสำหรับบริษัทที่ต้องการที่อยู่ระดับโลก',
      'มีทั้ง serviced office และพื้นที่ขนาดใหญ่',
    ],
    highlights_en: [
      'Bangkok\'s international business & embassy district',
      'BTS Surasak + MRT Lumphini connectivity',
      'Grade A offices with Chao Phraya river views',
      'Prestigious address for multinational presence',
      'Serviced suites to full-floor options available',
    ],
    price_from_th: 'ราคาเช่าเริ่มต้น ฿400/ตร.ม./เดือน',
    price_from_en: 'Rentals from ฿400/sqm/month',
    faq_th: [
      { q: 'ออฟฟิศเช่าสาทรราคาต่อตารางเมตรเท่าไหร่?', a: 'อาคาร Grade A อยู่ที่ประมาณ฿900–1,400/ตร.ม./เดือน Grade B อยู่ที่฿450–750/ตร.ม./เดือน Serviced desk เริ่มต้น฿6,000–15,000/โต๊ะ/เดือน' },
      { q: 'สาทรมีออฟฟิศสำหรับบริษัทขนาดเล็กหรือไม่?', a: 'มี — มี serviced office ที่เหมาะสำหรับทีม 1–20 คนหลายแห่ง โดยไม่จำเป็นต้องเช่าพื้นที่ทั้งชั้น ราคาเริ่มต้นที่จับต้องได้' },
    ],
    faq_en: [
      { q: 'What are office rental rates per sqm in Sathorn?', a: 'Grade A buildings run ฿900–1,400/sqm/month. Grade B averages ฿450–750/sqm/month. Serviced desks start from ฿6,000–15,000/desk/month.' },
      { q: 'Are small office suites available in Sathorn?', a: 'Yes — several serviced office operators in Sathorn cater to teams of 1–20 at accessible monthly rates, without requiring full-floor commitments.' },
    ],
  },

}
