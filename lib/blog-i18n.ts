/**
 * Blog index and article copy, both locales.
 *
 * WHAT IS NOT TRANSLATED
 *   CATEGORY_VALUES — the `slug` of each category chip IS the value stored in
 *   blog_posts.category. It stays Thai in both locales; only the label follows
 *   the reader. Translating the value would split the category column across
 *   two languages, which is the mistake this codebase has now made five times
 *   (district names, amenity spellings, room types, the manage form's
 *   type/channel, the wizard's room types). Store the stable value, translate
 *   at display.
 *
 *   An article's own `category`, rendered on each card, is the stored Thai
 *   string — so a Thai category name appears on an English card. That is
 *   correct until a post carries an English category, and there are no English
 *   posts yet. When there are, map it through CATEGORY_LABEL below.
 */
import type { Locale } from '@/lib/routes-i18n'

export const CATEGORY_VALUES = [
  '',
  'เจ้าของทรัพย์',
  'คู่มือผู้เช่า',
  'ทำเลน่าอยู่',
] as const

const CATEGORY_LABEL: Record<string, { th: string; en: string }> = {
  '':              { th: 'ทั้งหมด',       en: 'All' },
  'เจ้าของทรัพย์': { th: 'เจ้าของทรัพย์', en: 'For owners' },
  'คู่มือผู้เช่า':  { th: 'คู่มือผู้เช่า',  en: 'Tenant guides' },
  'ทำเลน่าอยู่':   { th: 'ทำเลน่าอยู่',   en: 'Neighbourhoods' },
}

/** The label for a stored category value, falling back to the value itself. */
export function categoryLabel(value: string, locale: Locale): string {
  return CATEGORY_LABEL[value]?.[locale] ?? value
}

export const BLOG_T = {
  th: {
    metaTitle: 'บทความ',
    metaDesc: 'เคล็ดลับ คู่มือ และข้อมูลตลาดเช่า-ขายอสังหาริมทรัพย์ในกรุงเทพฯ',
    ogTitle: 'บทความ SpacesMate | SpacesMate',
    heroEyebrow: 'บทความ',
    heroTitle: 'บทความ SpacesMate',
    heroSub: 'เคล็ดลับ คู่มือ และข้อมูลตลาดอสังหาริมทรัพย์สำหรับเจ้าของและผู้เช่าในกรุงเทพฯ',
    readMore: 'อ่านต่อ →',
    empty: 'ยังไม่มีบทความที่เผยแพร่',
    followPrompt: 'ติดตามบทความใหม่ได้ที่',
    backToBlog: '← กลับไปหน้าบทความ',
  },
  en: {
    metaTitle: 'Blog',
    metaDesc: 'Tips, guides, and Bangkok property market insights for owners and tenants.',
    ogTitle: 'SpacesMate Blog | SpacesMate',
    heroEyebrow: 'BLOG',
    heroTitle: 'SpacesMate Blog',
    heroSub: 'Tips, guides, and Bangkok property market insights for owners and tenants.',
    readMore: 'Read more →',
    empty: 'No English articles yet — our Thai blog is live, and English articles are on the way.',
    followPrompt: 'Follow us for new articles',
    backToBlog: '← Back to the blog',
  },
} as const

const TH_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']

/**
 * Thai dates carry the Buddhist year, English dates the Gregorian one.
 * Printing 2569 to an English reader reads as a typo, not as a calendar.
 */
export function formatBlogDate(iso: string, locale: Locale): string {
  const d = new Date(iso)
  return locale === 'en'
    ? d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : `${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`
}
