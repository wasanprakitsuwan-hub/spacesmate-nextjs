/**
 * Bangkok landmarks people search rentals around — universities, malls,
 * hospitals, airports and parks — with coordinates. Wikipedia text is CC BY-SA.
 *
 * Coordinates and Thai names come from each place's English Wikipedia article
 * (fetched 24 Oct 2026); Gateway Ekkamai from OpenStreetMap (way 176298722). Places whose article gave no coordinates were left
 * out rather than estimated. Anything not listed here can still be found:
 * /search falls back to a map lookup (/api/geocode) for what people type.
 *
 * `aliases` are the short names people actually type (จุฬา, ม.เกษตร, T21).
 */

export type LandmarkKind = 'university' | 'mall' | 'hospital' | 'transport' | 'place'

export type Landmark = {
  /** Stable — used in URLs (?landmark=chula). */
  id: string
  th: string
  en: string
  kind: LandmarkKind
  lat: number
  lng: number
  aliases?: string[]
}

export const LANDMARKS: Landmark[] = [
  // Universities
  { id: 'chula', th: 'จุฬาลงกรณ์มหาวิทยาลัย', en: 'Chulalongkorn University', kind: 'university', lat: 13.738359, lng: 100.532097, aliases: ['จุฬา', 'จุฬาฯ', 'chula', 'cu'] },
  { id: 'kasetsart', th: 'มหาวิทยาลัยเกษตรศาสตร์ บางเขน', en: 'Kasetsart University (Bang Khen)', kind: 'university', lat: 13.84859722, lng: 100.56805, aliases: ['ม.เกษตร', 'เกษตร', 'ku'] },
  { id: 'thammasat-tha-phra-chan', th: 'มหาวิทยาลัยธรรมศาสตร์ ท่าพระจันทร์', en: 'Thammasat University (Tha Phra Chan)', kind: 'university', lat: 13.7575, lng: 100.49, aliases: ['ธรรมศาสตร์', 'มธ', 'ท่าพระจันทร์', 'tu'] },
  { id: 'kmitl', th: 'สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง', en: "King Mongkut's Institute of Technology Ladkrabang", kind: 'university', lat: 13.726725, lng: 100.780125, aliases: ['สจล', 'พระจอมเกล้าลาดกระบัง', 'kmitl'] },
  { id: 'kmutt', th: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี', en: "King Mongkut's University of Technology Thonburi", kind: 'university', lat: 13.65166667, lng: 100.49555556, aliases: ['มจธ', 'บางมด', 'kmutt'] },
  { id: 'ramkhamhaeng', th: 'มหาวิทยาลัยรามคำแหง', en: 'Ramkhamhaeng University', kind: 'university', lat: 13.755236, lng: 100.620142, aliases: ['ม.ราม', 'รามคำแหง'] },
  { id: 'silpakorn-wang-tha-phra', th: 'มหาวิทยาลัยศิลปากร วังท่าพระ', en: 'Silpakorn University (Wang Tha Phra)', kind: 'university', lat: 13.75303611, lng: 100.49110556, aliases: ['ศิลปากร', 'มศก', 'silpakorn'] },
  { id: 'mahidol-salaya', th: 'มหาวิทยาลัยมหิดล ศาลายา', en: 'Mahidol University (Salaya)', kind: 'university', lat: 13.793406, lng: 100.322514, aliases: ['มหิดล', 'ศาลายา', 'mahidol'] },
  { id: 'nida', th: 'สถาบันบัณฑิตพัฒนบริหารศาสตร์', en: 'National Institute of Development Administration (NIDA)', kind: 'university', lat: 13.769621, lng: 100.652622, aliases: ['นิด้า', 'nida'] },
  { id: 'kmutnb', th: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ', en: "King Mongkut's University of Technology North Bangkok", kind: 'university', lat: 13.818811, lng: 100.514206, aliases: ['มจพ', 'พระจอมเกล้าพระนครเหนือ', 'kmutnb'] },
  { id: 'utcc', th: 'มหาวิทยาลัยหอการค้าไทย', en: 'University of the Thai Chamber of Commerce', kind: 'university', lat: 13.778638, lng: 100.56008, aliases: ['ม.หอการค้า', 'หอการค้า', 'utcc'] },
  { id: 'chandrakasem', th: 'มหาวิทยาลัยราชภัฏจันทรเกษม', en: 'Chandrakasem Rajabhat University', kind: 'university', lat: 13.82031, lng: 100.5752, aliases: ['จันทรเกษม', 'ราชภัฏจันทรเกษม'] },
  { id: 'sripatum', th: 'มหาวิทยาลัยศรีปทุม', en: 'Sripatum University', kind: 'university', lat: 13.85527778, lng: 100.58527778, aliases: ['ศรีปทุม', 'spu'] },
  { id: 'dpu', th: 'มหาวิทยาลัยธุรกิจบัณฑิตย์', en: 'Dhurakij Pundit University', kind: 'university', lat: 13.8711, lng: 100.55, aliases: ['ธุรกิจบัณฑิตย์', 'dpu'] },
  { id: 'krirk', th: 'มหาวิทยาลัยเกริก', en: 'Krirk University', kind: 'university', lat: 13.8734, lng: 100.6, aliases: ['เกริก'] },
  { id: 'bangkok-university-rangsit', th: 'มหาวิทยาลัยกรุงเทพ รังสิต', en: 'Bangkok University (Rangsit)', kind: 'university', lat: 14.03951111, lng: 100.61536389, aliases: ['ม.กรุงเทพ', 'bu'] },
  { id: 'kasem-bundit', th: 'มหาวิทยาลัยเกษมบัณฑิต', en: 'Kasem Bundit University', kind: 'university', lat: 13.73805556, lng: 100.62694444, aliases: ['เกษมบัณฑิต'] },
  { id: 'tni', th: 'สถาบันเทคโนโลยีไทย-ญี่ปุ่น', en: 'Thai-Nichi Institute of Technology', kind: 'university', lat: 13.73818, lng: 100.62822, aliases: ['ไทย-ญี่ปุ่น', 'tni'] },
  { id: 'stamford', th: 'มหาวิทยาลัยนานาชาติแสตมฟอร์ด', en: 'Stamford International University', kind: 'university', lat: 13.73471, lng: 100.662186, aliases: ['แสตมฟอร์ด', 'stamford'] },
  { id: 'mahanakorn', th: 'มหาวิทยาลัยเทคโนโลยีมหานคร', en: 'Mahanakorn University of Technology', kind: 'university', lat: 13.8441, lng: 100.8563, aliases: ['มหานคร'] },
  { id: 'pathumwan-institute', th: 'สถาบันเทคโนโลยีปทุมวัน', en: 'Pathumwan Institute of Technology', kind: 'university', lat: 13.7472, lng: 100.5254, aliases: ['ปทุมวัน'] },

  // Malls and markets
  { id: 'centralworld', th: 'เซ็นทรัลเวิลด์', en: 'CentralWorld', kind: 'mall', lat: 13.74694444, lng: 100.53972222, aliases: ['central world', 'เซ็นทรัล เวิลด์'] },
  { id: 'siam-paragon', th: 'สยามพารากอน', en: 'Siam Paragon', kind: 'mall', lat: 13.74638889, lng: 100.535, aliases: ['พารากอน', 'paragon'] },
  { id: 'mbk', th: 'เอ็มบีเคเซ็นเตอร์', en: 'MBK Center', kind: 'mall', lat: 13.74555556, lng: 100.53, aliases: ['มาบุญครอง', 'mbk'] },
  { id: 'gaysorn', th: 'เกษรวิลเลจ', en: 'Gaysorn Village', kind: 'mall', lat: 13.745887, lng: 100.540729, aliases: ['เกษร', 'gaysorn'] },
  { id: 'central-embassy', th: 'เซ็นทรัล เอ็มบาสซี', en: 'Central Embassy', kind: 'mall', lat: 13.74382222, lng: 100.54641389 },
  { id: 'terminal21', th: 'เทอร์มินอล 21 อโศก', en: 'Terminal 21 Asok', kind: 'mall', lat: 13.7375, lng: 100.56055556, aliases: ['เทอร์มินอล21', 't21', 'terminal21'] },
  { id: 'emquartier', th: 'เอ็มควอเทียร์', en: 'EmQuartier', kind: 'mall', lat: 13.7315, lng: 100.5692, aliases: ['emquartier', 'em district', 'เอ็มดิสทริค'] },
  { id: 'central-gr9', th: 'เซ็นทรัล พระราม 9', en: 'Central Rama 9', kind: 'mall', lat: 13.758357, lng: 100.566093, aliases: ['เซ็นทรัลพระราม9', 'central rama 9', 'central gr9'] },
  { id: 'central-ladprao', th: 'เซ็นทรัล ลาดพร้าว', en: 'Central Ladprao', kind: 'mall', lat: 13.816944, lng: 100.56, aliases: ['เซ็นทรัลลาดพร้าว', 'central lardprao'] },
  { id: 'central-bangna', th: 'เซ็นทรัล บางนา', en: 'Central Bangna', kind: 'mall', lat: 13.6684, lng: 100.6344, aliases: ['เซ็นทรัลบางนา'] },
  { id: 'central-rama3', th: 'เซ็นทรัล พระราม 3', en: 'Central Rama 3', kind: 'mall', lat: 13.6976, lng: 100.5378, aliases: ['เซ็นทรัลพระราม3'] },
  { id: 'central-rama2', th: 'เซ็นทรัล พระราม 2', en: 'Central Rama 2', kind: 'mall', lat: 13.663395, lng: 100.438031, aliases: ['เซ็นทรัลพระราม2'] },
  { id: 'central-pinklao', th: 'เซ็นทรัล ปิ่นเกล้า', en: 'Central Pinklao', kind: 'mall', lat: 13.7785, lng: 100.4766, aliases: ['เซ็นทรัลปิ่นเกล้า'] },
  { id: 'gateway-ekkamai', th: 'เกทเวย์ เอกมัย', en: 'Gateway Ekkamai', kind: 'mall', lat: 13.7184098, lng: 100.585363, aliases: ['เกตเวย์เอกมัย', 'gateway ekamai'] },
  { id: 'iconsiam', th: 'ไอคอนสยาม', en: 'ICONSIAM', kind: 'mall', lat: 13.72669444, lng: 100.5105 },
  { id: 'seacon-square', th: 'ซีคอนสแควร์ ศรีนครินทร์', en: 'Seacon Square Srinakarin', kind: 'mall', lat: 13.69416667, lng: 100.64805556, aliases: ['ซีคอน', 'seacon'] },
  { id: 'seacon-bangkae', th: 'ซีคอนบางแค', en: 'Seacon Bangkae', kind: 'mall', lat: 13.7127, lng: 100.4352 },
  { id: 'fashion-island', th: 'แฟชั่นไอส์แลนด์', en: 'Fashion Island', kind: 'mall', lat: 13.8258, lng: 100.6791 },
  { id: 'future-park-rangsit', th: 'ฟิวเจอร์พาร์ค รังสิต', en: 'Future Park Rangsit', kind: 'mall', lat: 13.98944444, lng: 100.61805556, aliases: ['ฟิวเจอร์พาร์ค', 'future park'] },
  { id: 'asiatique', th: 'เอเชียทีค เดอะ ริเวอร์ฟรอนท์', en: 'Asiatique The Riverfront', kind: 'mall', lat: 13.706, lng: 100.5047, aliases: ['เอเชียทีค'] },
  { id: 'chatuchak-market', th: 'ตลาดนัดจตุจักร', en: 'Chatuchak Weekend Market', kind: 'mall', lat: 13.80083333, lng: 100.55138889, aliases: ['สวนจตุจักร', 'jj market'] },
  { id: 'siam-center', th: 'สยามเซ็นเตอร์', en: 'Siam Center', kind: 'mall', lat: 13.74638889, lng: 100.5325 },
  { id: 'samyan-mitrtown', th: 'สามย่านมิตรทาวน์', en: 'Samyan Mitrtown', kind: 'mall', lat: 13.73416667, lng: 100.52833333, aliases: ['สามย่าน'] },
  { id: 'emporium', th: 'ดิ เอ็มโพเรียม', en: 'Emporium', kind: 'mall', lat: 13.7307, lng: 100.5689, aliases: ['เอ็มโพเรียม'] },
  { id: 'emsphere', th: 'เอ็มสเฟียร์', en: 'EmSphere', kind: 'mall', lat: 13.73188, lng: 100.56609 },
  { id: 'pantip-plaza', th: 'พันธุ์ทิพย์พลาซ่า', en: 'Pantip Plaza', kind: 'mall', lat: 13.75, lng: 100.5375, aliases: ['พันธุ์ทิพย์', 'pantip'] },
  { id: 'platinum', th: 'เดอะ แพลทินัม แฟชั่นมอลล์', en: 'The Platinum Fashion Mall', kind: 'mall', lat: 13.75, lng: 100.53944444, aliases: ['แพลทินัม', 'platinum'] },
  { id: 'river-city', th: 'ริเวอร์ซิตี้ แบงค็อก', en: 'River City Bangkok', kind: 'mall', lat: 13.7304, lng: 100.5133, aliases: ['ริเวอร์ซิตี้'] },
  { id: 'esplanade', th: 'เอสพลานาด รัชดาภิเษก', en: 'Esplanade Ratchada', kind: 'mall', lat: 13.76666667, lng: 100.56972222, aliases: ['เอสพลานาด', 'esplanade'] },
  { id: 'union-mall', th: 'ยูเนี่ยน มอลล์', en: 'Union Mall', kind: 'mall', lat: 13.813587, lng: 100.561841, aliases: ['ยูเนี่ยนมอลล์'] },
  { id: 'jj-mall', th: 'เจเจ มอลล์', en: 'JJ Mall', kind: 'mall', lat: 13.8023, lng: 100.5486 },
  { id: 'central-chaengwattana', th: 'เซ็นทรัล แจ้งวัฒนะ', en: 'Central Chaengwattana', kind: 'mall', lat: 13.90361111, lng: 100.52805556, aliases: ['เซ็นทรัลแจ้งวัฒนะ'] },
  { id: 'paradise-park', th: 'พาราไดซ์ พาร์ค', en: 'Paradise Park', kind: 'mall', lat: 13.6877, lng: 100.6472, aliases: ['พาราไดซ์'] },

  // Hospitals
  { id: 'bumrungrad', th: 'โรงพยาบาลบำรุงราษฎร์', en: 'Bumrungrad International Hospital', kind: 'hospital', lat: 13.7463, lng: 100.5526, aliases: ['บำรุงราษฎร์', 'รพ.บำรุงราษฎร์', 'bumrungrad'] },
  { id: 'bangkok-hospital', th: 'โรงพยาบาลกรุงเทพ', en: 'Bangkok Hospital', kind: 'hospital', lat: 13.745, lng: 100.585, aliases: ['รพ.กรุงเทพ', 'bangkok hospital'] },
  { id: 'chula-hospital', th: 'โรงพยาบาลจุฬาลงกรณ์', en: 'King Chulalongkorn Memorial Hospital', kind: 'hospital', lat: 13.73138889, lng: 100.53555556, aliases: ['รพ.จุฬา', 'chula hospital'] },
  { id: 'siriraj', th: 'โรงพยาบาลศิริราช', en: 'Siriraj Hospital', kind: 'hospital', lat: 13.757925, lng: 100.485849, aliases: ['ศิริราช', 'รพ.ศิริราช'] },
  { id: 'ramathibodi', th: 'โรงพยาบาลรามาธิบดี', en: 'Ramathibodi Hospital', kind: 'hospital', lat: 13.76666667, lng: 100.52666667, aliases: ['รามาธิบดี', 'รพ.รามา'] },
  { id: 'rajavithi', th: 'โรงพยาบาลราชวิถี', en: 'Rajavithi Hospital', kind: 'hospital', lat: 13.76388889, lng: 100.53611111, aliases: ['ราชวิถี', 'รพ.ราชวิถี'] },
  { id: 'phramongkutklao', th: 'โรงพยาบาลพระมงกุฎเกล้า', en: 'Phramongkutklao Hospital', kind: 'hospital', lat: 13.767407, lng: 100.534178, aliases: ['พระมงกุฎ', 'รพ.พระมงกุฎ'] },
  { id: 'qsnich', th: 'สถาบันสุขภาพเด็กแห่งชาติมหาราชินี', en: 'Queen Sirikit National Institute of Child Health', kind: 'hospital', lat: 13.766079, lng: 100.535214, aliases: ['รพ.เด็ก', 'โรงพยาบาลเด็ก'] },
  { id: 'police-general-hospital', th: 'โรงพยาบาลตำรวจ', en: 'Police General Hospital', kind: 'hospital', lat: 13.7425, lng: 100.53861111, aliases: ['รพ.ตำรวจ'] },
  { id: 'vajira', th: 'วชิรพยาบาล', en: 'Vajira Hospital', kind: 'hospital', lat: 13.78055556, lng: 100.50916667, aliases: ['วชิระ', 'รพ.วชิระ'] },
  { id: 'lerdsin', th: 'โรงพยาบาลเลิดสิน', en: 'Lerdsin Hospital', kind: 'hospital', lat: 13.722176, lng: 100.517401, aliases: ['เลิดสิน'] },
  { id: 'taksin-hospital', th: 'โรงพยาบาลตากสิน', en: 'Taksin Hospital', kind: 'hospital', lat: 13.730455, lng: 100.508644, aliases: ['รพ.ตากสิน'] },
  { id: 'charoenkrung-pracharak', th: 'โรงพยาบาลเจริญกรุงประชารักษ์', en: 'Charoenkrung Pracharak Hospital', kind: 'hospital', lat: 13.694388, lng: 100.494648, aliases: ['เจริญกรุงประชารักษ์'] },
  { id: 'somdech-pinklao', th: 'โรงพยาบาลสมเด็จพระปิ่นเกล้า', en: 'Somdech Phra Pinklao Hospital', kind: 'hospital', lat: 13.710108, lng: 100.486837, aliases: ['รพ.ปิ่นเกล้า'] },
  { id: 'bhumibol-hospital', th: 'โรงพยาบาลภูมิพลอดุลยเดช', en: 'Bhumibol Adulyadej Hospital', kind: 'hospital', lat: 13.909114, lng: 100.617736, aliases: ['รพ.ภูมิพล', 'ภูมิพล'] },
  { id: 'nopparat-rajathanee', th: 'โรงพยาบาลนพรัตนราชธานี', en: 'Nopparat Rajathanee Hospital', kind: 'hospital', lat: 13.817454, lng: 100.688026, aliases: ['นพรัตน์'] },
  { id: 'siriraj-piyamaharajkarun', th: 'โรงพยาบาลศิริราช ปิยมหาราชการุณย์', en: 'Siriraj Piyamaharajkarun Hospital', kind: 'hospital', lat: 13.759621, lng: 100.485931, aliases: ['ศิริราชปิยมหาราชการุณย์', 'siph'] },
  { id: 'bnh', th: 'โรงพยาบาลบีเอ็นเอช', en: 'BNH Hospital', kind: 'hospital', lat: 13.7247, lng: 100.5342, aliases: ['บีเอ็นเอช', 'bnh'] },
  { id: 'bangkok-christian', th: 'โรงพยาบาลกรุงเทพคริสเตียน', en: 'Bangkok Christian Hospital', kind: 'hospital', lat: 13.72833333, lng: 100.53111111, aliases: ['กรุงเทพคริสเตียน'] },
  { id: 'saint-louis', th: 'โรงพยาบาลเซนต์หลุยส์', en: 'Saint Louis Hospital', kind: 'hospital', lat: 13.719387, lng: 100.525207, aliases: ['เซนต์หลุยส์'] },
  { id: 'bangkok-adventist', th: 'โรงพยาบาลมิชชั่น', en: 'Bangkok Adventist (Mission) Hospital', kind: 'hospital', lat: 13.75777778, lng: 100.51916667, aliases: ['มิชชั่น', 'mission hospital'] },
  { id: 'camillian', th: 'โรงพยาบาลคามิลเลียน', en: 'Camillian Hospital', kind: 'hospital', lat: 13.739338, lng: 100.583755, aliases: ['คามิลเลียน'] },
  { id: 'phyathai-1', th: 'โรงพยาบาลพญาไท 1', en: 'Phyathai 1 Hospital', kind: 'hospital', lat: 13.75694444, lng: 100.53638889, aliases: ['พญาไท 1'] },
  { id: 'phyathai-2', th: 'โรงพยาบาลพญาไท 2', en: 'Phyathai 2 Hospital', kind: 'hospital', lat: 13.77027778, lng: 100.54055556, aliases: ['พญาไท 2'] },
  { id: 'phyathai-3', th: 'โรงพยาบาลพญาไท 3', en: 'Phyathai 3 Hospital', kind: 'hospital', lat: 13.72326389, lng: 100.46359722, aliases: ['พญาไท 3'] },
  { id: 'thonburi-hospital', th: 'โรงพยาบาลธนบุรี', en: 'Thonburi Hospital', kind: 'hospital', lat: 13.75330556, lng: 100.47980556, aliases: ['รพ.ธนบุรี'] },
  { id: 'vibhavadi-hospital', th: 'โรงพยาบาลวิภาวดี', en: 'Vibhavadi Hospital', kind: 'hospital', lat: 13.84611111, lng: 100.56222222, aliases: ['รพ.วิภาวดี'] },
  { id: 'paolo-kaset', th: 'โรงพยาบาลเปาโล เกษตร', en: 'Paolo Hospital Kaset', kind: 'hospital', lat: 13.83533, lng: 100.574007, aliases: ['เปาโล เกษตร'] },
  { id: 'yanhee', th: 'โรงพยาบาลยันฮี', en: 'Yanhee Hospital', kind: 'hospital', lat: 13.799616, lng: 100.511254, aliases: ['ยันฮี'] },
  { id: 'manarom', th: 'โรงพยาบาลมนารมย์', en: 'Manarom Hospital', kind: 'hospital', lat: 13.746325, lng: 100.552635, aliases: ['มนารมย์'] },

  // Airports
  { id: 'suvarnabhumi-airport', th: 'ท่าอากาศยานสุวรรณภูมิ', en: 'Suvarnabhumi Airport', kind: 'transport', lat: 13.6925, lng: 100.75, aliases: ['สนามบินสุวรรณภูมิ', 'bkk airport'] },
  { id: 'don-mueang-airport', th: 'ท่าอากาศยานดอนเมือง', en: 'Don Mueang Airport', kind: 'transport', lat: 13.9125, lng: 100.60666667, aliases: ['สนามบินดอนเมือง', 'dmk airport'] },

  // Parks, venues and well-known streets
  { id: 'lumphini-park', th: 'สวนลุมพินี', en: 'Lumphini Park', kind: 'place', lat: 13.73055556, lng: 100.54166667, aliases: ['สวนลุม', 'lumpini park'] },
  { id: 'benjakitti-park', th: 'สวนเบญจกิติ', en: 'Benjakitti Park', kind: 'place', lat: 13.7294, lng: 100.5586, aliases: ['เบญจกิติ', 'benchakitti'] },
  { id: 'qsncc', th: 'ศูนย์การประชุมแห่งชาติสิริกิติ์', en: 'Queen Sirikit National Convention Center', kind: 'place', lat: 13.723992, lng: 100.559222, aliases: ['ศูนย์สิริกิติ์', 'qsncc'] },
  { id: 'one-bangkok', th: 'วัน แบงค็อก', en: 'One Bangkok', kind: 'place', lat: 13.7272, lng: 100.5473, aliases: ['วันแบงค็อก'] },
  { id: 'yaowarat', th: 'เยาวราช', en: 'Yaowarat (Chinatown)', kind: 'place', lat: 13.741136, lng: 100.508305, aliases: ['ถนนเยาวราช', 'chinatown', 'ไชน่าทาวน์'] },
  { id: 'khaosan', th: 'ถนนข้าวสาร', en: 'Khaosan Road', kind: 'place', lat: 13.75888889, lng: 100.49722222, aliases: ['ข้าวสาร', 'khao san'] },
]

export const LANDMARK_BY_ID: Record<string, Landmark> =
  Object.fromEntries(LANDMARKS.map(l => [l.id, l]))

/** Material Symbols icon for each kind. */
export const LANDMARK_ICON: Record<LandmarkKind, string> = {
  university: 'school',
  mall: 'local_mall',
  hospital: 'local_hospital',
  transport: 'flight',
  place: 'place',
}
