/**
 * Bangkok landmarks people search rentals around — universities, malls,
 * hospitals, airports and parks — with coordinates.
 *
 * Coordinates and Thai names come from each place's English Wikipedia article
 * (fetched 24 Oct 2026). Places whose article gave no coordinates were left
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
  { id: 'iconsiam', th: 'ไอคอนสยาม', en: 'ICONSIAM', kind: 'mall', lat: 13.72669444, lng: 100.5105 },
  { id: 'seacon-square', th: 'ซีคอนสแควร์ ศรีนครินทร์', en: 'Seacon Square Srinakarin', kind: 'mall', lat: 13.69416667, lng: 100.64805556, aliases: ['ซีคอน', 'seacon'] },
  { id: 'seacon-bangkae', th: 'ซีคอนบางแค', en: 'Seacon Bangkae', kind: 'mall', lat: 13.7127, lng: 100.4352 },
  { id: 'fashion-island', th: 'แฟชั่นไอส์แลนด์', en: 'Fashion Island', kind: 'mall', lat: 13.8258, lng: 100.6791 },
  { id: 'future-park-rangsit', th: 'ฟิวเจอร์พาร์ค รังสิต', en: 'Future Park Rangsit', kind: 'mall', lat: 13.98944444, lng: 100.61805556, aliases: ['ฟิวเจอร์พาร์ค', 'future park'] },
  { id: 'asiatique', th: 'เอเชียทีค เดอะ ริเวอร์ฟรอนท์', en: 'Asiatique The Riverfront', kind: 'mall', lat: 13.706, lng: 100.5047, aliases: ['เอเชียทีค'] },
  { id: 'chatuchak-market', th: 'ตลาดนัดจตุจักร', en: 'Chatuchak Weekend Market', kind: 'mall', lat: 13.80083333, lng: 100.55138889, aliases: ['สวนจตุจักร', 'jj market'] },

  // Hospitals
  { id: 'bumrungrad', th: 'โรงพยาบาลบำรุงราษฎร์', en: 'Bumrungrad International Hospital', kind: 'hospital', lat: 13.7463, lng: 100.5526, aliases: ['บำรุงราษฎร์', 'รพ.บำรุงราษฎร์', 'bumrungrad'] },
  { id: 'bangkok-hospital', th: 'โรงพยาบาลกรุงเทพ', en: 'Bangkok Hospital', kind: 'hospital', lat: 13.745, lng: 100.585, aliases: ['รพ.กรุงเทพ', 'bangkok hospital'] },
  { id: 'chula-hospital', th: 'โรงพยาบาลจุฬาลงกรณ์', en: 'King Chulalongkorn Memorial Hospital', kind: 'hospital', lat: 13.73138889, lng: 100.53555556, aliases: ['รพ.จุฬา', 'chula hospital'] },
  { id: 'siriraj', th: 'โรงพยาบาลศิริราช', en: 'Siriraj Hospital', kind: 'hospital', lat: 13.757925, lng: 100.485849, aliases: ['ศิริราช', 'รพ.ศิริราช'] },
  { id: 'ramathibodi', th: 'โรงพยาบาลรามาธิบดี', en: 'Ramathibodi Hospital', kind: 'hospital', lat: 13.76666667, lng: 100.52666667, aliases: ['รามาธิบดี', 'รพ.รามา'] },

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
