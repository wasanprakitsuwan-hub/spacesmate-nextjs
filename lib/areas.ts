import { slugify } from '@/lib/slug'

/**
 * District slug helpers for the /area pages.
 *
 * The pages themselves are built by lib/district-pages on the shared rent-page
 * engine. This file keeps the slug shape, which is live in Google and must not
 * change:
 *     /area/เช่าคอนโด-บางนา
 *     /area/เช่าอพาร์ทเม้นท์-วัฒนา
 */

export const TYPE_TH: Record<string, string> = {
  condo:     'คอนโด',
  apartment: 'อพาร์ทเม้นท์',
  house:     'บ้าน',
  office:    'ออฟฟิศ',
  coworking: 'โคเวิร์กกิ้งสเปซ',
}

export const TYPE_EN: Record<string, string> = {
  condo:     'Condo',
  apartment: 'Apartment',
  house:     'House',
  office:    'Office',
  coworking: 'Co-working Space',
}

/** 'เขตบางนา' → 'บางนา'. The เขต prefix is official but nobody searches with it. */
export function stripDistrictPrefix(d: string): string {
  return String(d || '').replace(/^เขต\s*/, '').trim()
}

export function areaSlug(district: string, propertyType: string): string {
  const t = TYPE_TH[propertyType] ?? propertyType
  return slugify(`เช่า${t}-${stripDistrictPrefix(district)}`, 80)
}
