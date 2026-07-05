-- SpacesMate — Property Name Registry Seed
-- Bangkok & Outer Bangkok Condominiums
-- ─────────────────────────────────────────────
-- HOW TO RUN:
-- 1. Go to Supabase → SQL Editor → New query
-- 2. Paste this entire file → Run
-- Safe to re-run anytime (ON CONFLICT DO NOTHING)
-- ─────────────────────────────────────────────

-- Step 1: Add unique constraint (run once; safe if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'property_names_name_th_unique'
  ) THEN
    ALTER TABLE property_names
      ADD CONSTRAINT property_names_name_th_unique UNIQUE (name_th);
  END IF;
END $$;

-- Step 2: Bulk insert
INSERT INTO property_names (name_th, name_en) VALUES

-- ══════════════════════════════════════════════
-- SUKHUMVIT — BTS นานา / อโศก / เพลินจิต
-- ══════════════════════════════════════════════
('แอชตัน อโศก', 'Ashton Asoke'),
('เดอะ เอสเซ่ อโศก', 'The ESSE Asoke'),
('เซเลส อโศก', 'Celes Asoke'),
('ไอดีโอ โมบิ อโศก', 'Ideo Mobi Asoke'),
('เดอะ แอดเดรส อโศก', 'The Address Asoke'),
('แอสไพร์ อโศก-รัชดา', 'Aspire Asoke-Ratchada'),
('ไรธึม อโศก', 'Rhythm Asoke'),
('ไรธึม อโศก 2', 'Rhythm Asoke 2'),
('โนเบิล เรมิกซ์', 'Noble Remix'),
('ลุมพินี สวีท สุขุมวิท 41', 'Lumpini Suite Sukhumvit 41'),
('บ้านสิริ สุขุมวิท 10', 'Baan Siri Sukhumvit 10'),

-- ══════════════════════════════════════════════
-- SUKHUMVIT — BTS พร้อมพงษ์ / ทองหล่อ
-- ══════════════════════════════════════════════
('ดิ เอสเทล พร้อมพงษ์', 'The Estelle Phrom Phong'),
('ปาร์ค 24', 'Park 24'),
('เดอะ ดิโพลแมต 39', 'The Diplomat 39'),
('ลาวีค สุขุมวิท 57', 'Laviq Sukhumvit 57'),
('ควอทโทร บาย สานสิริ', 'Quattro by Sansiri'),
('ไฮด์ เฮอริเทจ ทองหล่อ', 'Hyde Heritage Thonglor'),
('บีตนิค สุขุมวิท 32', 'Beatniq Sukhumvit 32'),
('ทากา เฮ้าส์', 'Taka Haus'),
('เดอะ ริเซิร์ฟ ทองหล่อ', 'The Reserve Thonglor'),
('โนเบิล บี19', 'Noble BE19'),
('มัลแบร์รี่ โกรฟ สุขุมวิท', 'Mulberry Grove Sukhumvit'),

-- ══════════════════════════════════════════════
-- SUKHUMVIT — BTS เอกมัย / พระโขนง
-- ══════════════════════════════════════════════
('เมโทร ลักซ์ พระราม 4', 'Metro Luxe Rama 4'),
('เดอะ ไลน์ สุขุมวิท 71', 'The Line Sukhumvit 71'),
('ไรธึม สุขุมวิท 36-38', 'Rhythm Sukhumvit 36-38'),
('ไลฟ์ สุขุมวิท 48', 'Life Sukhumvit 48'),
('แอสไพร์ สุขุมวิท 47', 'Aspire Sukhumvit 47'),
('ไอดีโอ สุขุมวิท 62', 'Ideo Sukhumvit 62'),
('วายน์ บาย สานสิริ', 'WYNE by Sansiri'),
('เดอะ ลิงค์ สุขุมวิท 50', 'The Link Sukhumvit 50'),

-- ══════════════════════════════════════════════
-- SUKHUMVIT — BTS อ่อนนุช / อุดมสุข / แบริ่ง
-- ══════════════════════════════════════════════
('ไนท์บริดจ์ ไพรม์ อ่อนนุช', 'Knightsbridge Prime Onnut'),
('ไอดีโอ สุขุมวิท 93', 'Ideo Sukhumvit 93'),
('เดอะ คิธ สุขุมวิท 113', 'The Kith Sukhumvit 113'),
('ลุมพินี วิลล์ สุขุมวิท 76-แบริ่ง', 'Lumpini Ville Sukhumvit 76-Bearing'),
('แอสไพร์ สุขุมวิท 87', 'Aspire Sukhumvit 87'),
('เดอะ เบส เพชรบุรี-ทองหล่อ', 'The Base Petchaburi-Thonglor'),
('ไลฟ์ อโศก-พระราม 9', 'Life Asoke-Rama 9'),

-- ══════════════════════════════════════════════
-- สีลม / สาทร
-- ══════════════════════════════════════════════
('เดอะ ดิโพลแมต สาทร', 'The Diplomat Sathorn'),
('ศุภาลัย เอลิท สาทร', 'Supalai Elite Sathorn'),
('เดอะ อินฟินิตี้ สาทร', 'The Infinity Sathorn'),
('เดอะ เครส สาทร 10', 'The Crest Sathorn 10'),
('สีลม สวีท', 'Silom Suite'),
('สาละแดง เรสซิเดนเซส', 'Saladaeng Residences'),
('เดอะ ริเซิร์ฟ สาทร', 'The Reserve Sathorn'),
('บ้านสิริ สาทร', 'Baan Siri Sathorn'),
('ลุมพินี พาร์ค สาทร', 'Lumpini Park Sathorn'),
('ไอดีโอ สาทร-วงเวียนใหญ่', 'Ideo Sathorn-Wongwian Yai'),
('ไนท์บริดจ์ สาทร', 'Knightsbridge Sathorn'),
('เดอะ พาร์คแลนด์ สาทร', 'The Parkland Sathorn'),

-- ══════════════════════════════════════════════
-- พระราม 9 / มักกะสัน
-- ══════════════════════════════════════════════
('ลุมพินี พาร์ค พระราม 9', 'Lumpini Park Rama 9'),
('เดอะ ทรี รัชดาภิเษก-อินเตอร์เชนจ์', 'The Tree Ratchadapisek-Interchange'),
('แชปเตอร์ วัน อีโค เรสท์ พระราม 9', 'Chapter One Eco Rest Rama 9'),
('ไอดีโอ พระราม 9-อโศก', 'Ideo Rama 9-Asoke'),
('แอสไพร์ พระราม 9', 'Aspire Rama 9'),
('แชปเตอร์ วัน ฟลาว พระราม 9', 'Chapter One Flow Rama 9'),
('เดอะ เบส พระราม 9-รามคำแหง', 'The Base Rama 9-Ramkhamhaeng'),
('พลัม คอนโด พระราม 9 ด่วน 1', 'Plum Condo Rama 9 Expressway 1'),
('โกรฟ พระราม 9', 'Grove Rama 9'),

-- ══════════════════════════════════════════════
-- รัชดาภิเษก / ห้วยขวาง
-- ══════════════════════════════════════════════
('ศุภาลัย เวลลิงตัน', 'Supalai Wellington'),
('เดอะ พราอิเวซี่ รัชดา-ลาดพร้าว', 'The Privacy Ratchada-Ladprao'),
('แอสไพร์ รัชดา', 'Aspire Ratchada'),
('ไอดีโอ รัชดา-ห้วยขวาง', 'Ideo Ratchada-Huay Kwang'),
('เดอะ ทรี ห้วยขวาง', 'The Tree Huay Kwang'),
('ลุมพินี วิลล์ รัชดา-ลาดพร้าว', 'Lumpini Ville Ratchada-Ladprao'),
('แชปเตอร์ วัน ห้วยขวาง', 'Chapter One Huay Kwang'),
('เดอะ ลิงค์ รัชดา 21', 'The Link Ratchada 21'),
('ไรธึม รัชดา 44', 'Rhythm Ratchada 44'),

-- ══════════════════════════════════════════════
-- ลาดพร้าว / บางกะปิ / รามคำแหง
-- ══════════════════════════════════════════════
('แชปเตอร์ วัน มิดทาวน์ ลาดพร้าว 24', 'Chapter One Midtown Ladprao 24'),
('เซนทริค รัชยศ', 'Centric Ratchayothin'),
('ไนท์บริดจ์ คอลเลจ รามคำแหง', 'Knightsbridge Collage Ramkhamhaeng'),
('เดอะ พราอิเวซี่ ลาดพร้าว 71', 'The Privacy Ladprao 71'),
('ไลฟ์ ลาดพร้าว วัลเลย์', 'Life Ladprao Valley'),
('ลุมพินี วิลล์ ลาดพร้าว 71', 'Lumpini Ville Ladprao 71'),
('พลัม คอนโด ลาดพร้าว ชัยพฤกษ์', 'Plum Condo Ladprao Chaiyaphruek'),
('เดอะ เบส ลาดพร้าว', 'The Base Ladprao'),
('ศุภาลัย แกรนด์ รามคำแหง', 'Supalai Grand Ramkhamhaeng'),
('แอสไพร์ รามคำแหง 26', 'Aspire Ramkhamhaeng 26'),
('ไอดีโอ ลาดพร้าว 5', 'Ideo Ladprao 5'),
('โนเบิล รี:ลาดพร้าว', 'Noble Re: Ladprao'),

-- ══════════════════════════════════════════════
-- พหลโยธิน / อารีย์ / สะพานควาย
-- ══════════════════════════════════════════════
('เดอะ เครส โมชิต', 'The Crest Mo Chit'),
('โนเบิล แอมบิอันส์ พหลโยธิน', 'Noble Ambiance Phaholyothin'),
('ไอดีโอ พหลโยธิน-จตุจักร', 'Ideo Phahon-Chatuchak'),
('ลุมพินี สวีท ดินแดง-รัชดา', 'Lumpini Suite Dindeang-Ratchada'),
('เซนทริค อารี-สะพานควาย', 'Centric Ari-Saphan Kwai'),
('แชปเตอร์ วัน ชายน์ พหลโยธิน', 'Chapter One Shine Phahon'),
('ไนท์บริดจ์ สเปซ พหลโยธิน', 'Knightsbridge Space Phahon'),
('เดอะ พราอิเวซี่ พหลโยธิน 69', 'The Privacy Phahon 69'),
('ไลฟ์ สิงห์คอมเพล็กซ์-ลาดพร้าว 18', 'Life Singha Complex-Ladprao 18'),

-- ══════════════════════════════════════════════
-- บางซื่อ / เตาปูน / ประชาชื่น
-- ══════════════════════════════════════════════
('เดอะ พาร์คแลนด์ งามวงศ์วาน-เมืองทองธานี', 'The Parkland Ngamwongwan-Muangthong'),
('ลุมพินี วิลล์ ประชาชื่น-พงษ์เพชร', 'Lumpini Ville Prachanukun-Phongphet'),
('ไอดีโอ โมบิ บางซื่อ', 'Ideo Mobi Bangsue'),

-- ══════════════════════════════════════════════
-- ฝั่งธนบุรี / ตลาดพลู / วุฒากาศ
-- ══════════════════════════════════════════════
('เดอะ ทรี ริโอ วงเวียนใหญ่', 'The Tree Rio Wongwian Yai'),
('แอสไพร์ สาทร-ราษฎร์บูรณะ', 'Aspire Sathorn-Ratchaburi'),
('ไนท์บริดจ์ กาญจนาภิเษก', 'Knightsbridge Kanchanaphisek'),
('ลุมพินี วิลล์ รัตนาธิเบศร์-งามวงศ์วาน', 'Lumpini Ville Rattanathibet-Ngamwongwan'),
('ไลฟ์ บางนา-แบริ่ง', 'Life Bangna-Bearing'),

-- ══════════════════════════════════════════════
-- ปิ่นเกล้า / บรมราชชนนี
-- ══════════════════════════════════════════════
('เดอะ เซนส์ ปิ่นเกล้า', 'The Sense Pinklao'),
('ไลฟ์ ปิ่นเกล้า', 'Life Pinklao'),
('ไอดีโอ ปิ่นเกล้า', 'Ideo Pinklao'),
('ศุภาลัย ปาร์ค ปิ่นเกล้า', 'Supalai Park Pinklao'),
('ลุมพินี วิลล์ ปิ่นเกล้า', 'Lumpini Ville Pinklao'),

-- ══════════════════════════════════════════════
-- บางนา / สุวรรณภูมิ
-- ══════════════════════════════════════════════
('ศุภาลัย พรีมา ริวา', 'Supalai Prima Riva'),
('ไนท์บริดจ์ บางนา', 'Knightsbridge Bang Na'),
('เดอะ พาร์คแลนด์ บางนา กม.6', 'The Parkland Bang Na KM.6'),
('ดีคอนโด บลิสส์ บางนา', 'D Condo Bliss Bang Na'),
('ไอดีโอ โอ2 บางนา', 'Ideo O2 Bangna'),
('แชปเตอร์ วัน บางนา', 'Chapter One Bang Na'),
('เอ้าริจิน สมาร์ท ซิตี้', 'Origin Smart City'),
('ฮิลด์ บางนา', 'Hylde Bangna'),

-- ══════════════════════════════════════════════
-- ลาดกระบัง / มีนบุรี
-- ══════════════════════════════════════════════
('พลัม คอนโด ใกล้สนามบิน', 'Plum Condo Near Airport'),
('ลุมพินี วิลล์ ลาดกระบัง-สุวรรณภูมิ', 'Lumpini Ville Ladkrabang-Suvarnabhumi'),
('ไนท์บริดจ์ ลาดกระบัง', 'Knightsbridge Ladkrabang'),
('แอสไพร์ มีนบุรี', 'Aspire Minburi'),

-- ══════════════════════════════════════════════
-- นนทบุรี — รัตนาธิเบศร์ / แจ้งวัฒนะ / งามวงศ์วาน
-- ══════════════════════════════════════════════
('เดอะ พาร์คแลนด์ งามวงศ์วาน', 'The Parkland Ngamwongwan'),
('ลุมพินี คอนโดทาวน์ รัตนาธิเบศร์', 'Lumpini Condotown Rattanathibet'),
('ศุภาลัย ไลท์ รัชยศ-พหลโยธิน 34', 'Supalai Lite Ratchayothin-Phahol 34'),
('พลัม คอนโด เซ็นทรัล สเตชั่น รัตนาธิเบศร์', 'Plum Condo Central Station Rattanathibet'),
('ไนท์บริดจ์ แจ้งวัฒนะ', 'Knightsbridge Chaengwattana'),
('แชปเตอร์ วัน ชายน์ รัตนาธิเบศร์', 'Chapter One Shine Rattanathibet'),
('ไลฟ์ รัตนาธิเบศร์ เอ็มอาร์ที', 'Life Rattanathibet MRT'),
('เดอะ บลิสส์ รัตนาธิเบศร์', 'The Bliss Rattanathibet'),

-- ══════════════════════════════════════════════
-- ปทุมธานี — รังสิต / ลำลูกกา / ธัญบุรี
-- ══════════════════════════════════════════════
('ดีคอนโด รังสิต-ลำลูกกา', 'D Condo Rangsit-Lamlukka'),
('พลัม คอนโด รังสิต สเตชั่น', 'Plum Condo Rangsit Station'),
('ลุมพินี คอนโดทาวน์ รังสิต-คลอง 1', 'Lumpini Condotown Rangsit-Klong 1'),
('ไนท์บริดจ์ สเปซ รังสิต', 'Knightsbridge Space Rangsit'),
('ไอดีโอ รังสิต', 'Ideo Rangsit'),
('แอสไพร์ รังสิต', 'Aspire Rangsit'),
('เดอะ เออร์บาน รังสิต', 'The Urban Rangsit'),
('พลัม คอนโด ลำลูกกา คลอง 3', 'Plum Condo Lamlukka Klong 3'),

-- ══════════════════════════════════════════════
-- สมุทรปราการ — บางพลี / เทพารักษ์ / แบริ่ง
-- ══════════════════════════════════════════════
('พลัม คอนโด เทพารักษ์', 'Plum Condo Thepharak'),
('ไนท์บริดจ์ เทพารักษ์', 'Knightsbridge Thepharak'),
('ดีคอนโด แคมปัส บางนา', 'D Condo Campus Bang Na'),
('เดอะ พาร์คแลนด์ บางพลี', 'The Parkland Bang Phli'),
('ไอดีโอ โมบิ เทพารักษ์', 'Ideo Mobi Thepharak'),
('แอสไพร์ เอราวัณ ไพรม์', 'Aspire Erawan Prime')

ON CONFLICT (name_th) DO NOTHING;
